/**
 * Answer generation with citations and grounding.
 */

import OpenAI from "openai";
import type { RetrievalResult } from "../types.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GenerationResult {
  answer: string;
  sources: Array<{
    index: number;
    source: string;
    textPreview: string;
  }>;
}

/**
 * Generate an answer grounded in the retrieved context.
 */
export async function generateAnswer(
  query: string,
  context: RetrievalResult[],
  systemPrompt?: string
): Promise<GenerationResult> {
  if (context.length === 0) {
    return {
      answer: "I couldn't find relevant information to answer your question.",
      sources: [],
    };
  }

  // Build context string with citations
  const contextStr = context
    .map((chunk, i) => `[${i + 1}] Source: ${chunk.source}\n${chunk.text}`)
    .join("\n\n---\n\n");

  // Default system prompt
  const effectiveSystemPrompt =
    systemPrompt ||
    `You are a helpful assistant that answers questions based on provided context.

RULES:
1. Only use information from the provided context
2. If the context doesn't contain the answer, say "I don't have enough information to answer that"
3. Cite your sources using [1], [2], etc.
4. Be concise and direct
5. If you're uncertain, express that uncertainty`;

  const userMessage = `Context:
${contextStr}

Question: ${query}

Provide a clear, cited answer based on the context above.`;

  const response = await openai.chat.completions.create({
    model: process.env.GENERATION_MODEL || "gpt-4o-mini",
    messages: [
      { role: "system", content: effectiveSystemPrompt },
      { role: "user", content: userMessage },
    ],
    temperature: 0.3,
    max_tokens: 1024,
  });

  const answer = response.choices[0].message.content || "";

  // Extract cited sources
  const citedIndices = new Set(
    Array.from(answer.matchAll(/\[(\d+)\]/g)).map((m) => parseInt(m[1]))
  );

  const sources = context
    .map((chunk, i) => ({
      index: i + 1,
      source: chunk.source,
      textPreview: chunk.text.slice(0, 200),
    }))
    .filter((s) => citedIndices.has(s.index));

  return { answer, sources };
}

/**
 * Generate with Chain-of-Thought reasoning.
 */
export async function generateWithCoT(
  query: string,
  context: RetrievalResult[]
): Promise<{
  answer: string;
  sources: Array<{ index: number; source: string }>;
  reasoning: string;
}> {
  const contextStr = context
    .map((c, i) => `[${i + 1}] ${c.text}`)
    .join("\n\n");

  const prompt = `Context:
${contextStr}

Question: ${query}

Think step by step:
1. What information in the context is relevant?
2. How do the pieces fit together?
3. What is the answer based on this evidence?

After your reasoning, provide your final answer starting with "ANSWER:"`;

  const response = await openai.chat.completions.create({
    model: process.env.GENERATION_MODEL || "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 1500,
  });

  const fullResponse = response.choices[0].message.content || "";

  // Split reasoning and answer
  let reasoning = "";
  let answer = fullResponse;

  if (fullResponse.includes("ANSWER:")) {
    const parts = fullResponse.split("ANSWER:");
    reasoning = parts[0].trim();
    answer = parts[1].trim();
  }

  // Extract sources
  const citedIndices = new Set(
    Array.from(answer.matchAll(/\[(\d+)\]/g)).map((m) => parseInt(m[1]))
  );

  const sources = context
    .map((c, i) => ({ index: i + 1, source: c.source }))
    .filter((s) => citedIndices.has(s.index));

  return { answer, sources, reasoning };
}

/**
 * Streaming answer generation.
 */
export async function* generateStreaming(
  query: string,
  context: RetrievalResult[]
): AsyncGenerator<string> {
  const contextStr = context
    .map((c, i) => `[${i + 1}] Source: ${c.source}\n${c.text}`)
    .join("\n\n");

  const stream = await openai.chat.completions.create({
    model: process.env.GENERATION_MODEL || "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "Answer based on the provided context. Cite sources using [1], [2], etc.",
      },
      {
        role: "user",
        content: `Context:\n${contextStr}\n\nQuestion: ${query}`,
      },
    ],
    temperature: 0.3,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}
