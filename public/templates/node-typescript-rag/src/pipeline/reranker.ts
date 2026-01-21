/**
 * Reranking to boost precision after retrieval.
 */

import OpenAI from "openai";
import type { RetrievalResult } from "../types.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Rerank candidates to improve precision.
 */
export async function rerank(
  query: string,
  candidates: RetrievalResult[],
  topN = 5,
  method: "llm" | "cohere" = "llm"
): Promise<RetrievalResult[]> {
  if (candidates.length === 0) {
    return [];
  }

  if (method === "cohere" && process.env.COHERE_API_KEY) {
    return rerankCohere(query, candidates, topN);
  }

  return rerankLlm(query, candidates, topN);
}

/**
 * Rerank using LLM listwise reranking.
 */
async function rerankLlm(
  query: string,
  candidates: RetrievalResult[],
  topN: number
): Promise<RetrievalResult[]> {
  // Limit candidates to prevent token overflow
  const limitedCandidates = candidates.slice(0, 20);

  const docsText = limitedCandidates
    .map((c, i) => `[${i + 1}] ${c.text.slice(0, 500)}`)
    .join("\n\n");

  const prompt = `Given the query and documents below, rank the documents by relevance.
Return ONLY a comma-separated list of document numbers, most relevant first.

Query: ${query}

Documents:
${docsText}

Ranking (comma-separated numbers, most relevant first):`;

  try {
    const response = await openai.chat.completions.create({
      model: process.env.GENERATION_MODEL || "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      max_tokens: 100,
    });

    const rankingText = response.choices[0].message.content?.trim() || "";

    // Parse ranking
    const ranking = rankingText
      .split(",")
      .map((x) => parseInt(x.trim()) - 1)
      .filter((r) => r >= 0 && r < limitedCandidates.length);

    return ranking.slice(0, topN).map((idx, i) => ({
      ...limitedCandidates[idx],
      rerankScore: ranking.length - i,
    }));
  } catch (error) {
    console.error("LLM reranking failed, returning original order:", error);
    return candidates.slice(0, topN);
  }
}

/**
 * Rerank using Cohere Rerank API.
 */
async function rerankCohere(
  query: string,
  candidates: RetrievalResult[],
  topN: number
): Promise<RetrievalResult[]> {
  // Note: You'll need to install the cohere-ai package
  // import Cohere from 'cohere-ai';

  console.warn("Cohere reranking not implemented - falling back to LLM");
  return rerankLlm(query, candidates, topN);

  // Implementation would look like:
  // const cohere = new Cohere.Client({ token: process.env.COHERE_API_KEY });
  // const response = await cohere.rerank({
  //   model: "rerank-english-v3.0",
  //   query,
  //   documents: candidates.map(c => c.text),
  //   topN,
  // });
  // return response.results.map(r => ({
  //   ...candidates[r.index],
  //   rerankScore: r.relevanceScore,
  // }));
}

/**
 * Cascade reranking: cheap model first, expensive model on top results.
 */
export async function rerankCascade(
  query: string,
  candidates: RetrievalResult[],
  finalTopN = 5
): Promise<RetrievalResult[]> {
  // Stage 1: Quick LLM rerank on all candidates
  const stage1Results = await rerankLlm(query, candidates, 20);

  // Stage 2: More expensive rerank (if available)
  if (process.env.COHERE_API_KEY) {
    return rerankCohere(query, stage1Results, finalTopN);
  }

  return stage1Results.slice(0, finalTopN);
}
