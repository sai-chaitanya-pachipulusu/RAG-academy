import { searchContent } from "@/lib/search/search";
import type { SearchResult } from "@/lib/search/types";

/**
 * Multi-query expansion + Reciprocal Rank Fusion over the keyword index —
 * the same RRF technique the curriculum teaches (see /challenges/rrf-fusion).
 * Deterministic, no embeddings, no API calls.
 */

const RRF_K = 60;
const MAX_SUB_QUERIES = 4;

/** Domain synonym map for RAG engineering vocabulary (keys are lowercase tokens). */
const RAG_SYNONYMS: Record<string, string[]> = {
  chunking: ["splitting", "chunk size"],
  chunk: ["chunking"],
  embedding: ["embeddings", "vectors", "dense"],
  embeddings: ["embedding", "vectors"],
  rerank: ["reranking", "cross encoder"],
  reranking: ["rerank", "cross encoder"],
  reranker: ["reranking", "cross encoder"],
  hybrid: ["bm25 dense fusion", "keyword semantic"],
  bm25: ["keyword search", "lexical"],
  rrf: ["reciprocal rank fusion"],
  fusion: ["rrf", "reciprocal rank"],
  hyde: ["hypothetical document embeddings"],
  eval: ["evaluation", "metrics"],
  evals: ["evaluation", "metrics"],
  evaluation: ["metrics", "faithfulness"],
  hallucination: ["grounding", "faithfulness", "citations"],
  hallucinations: ["grounding", "faithfulness"],
  grounding: ["citations", "faithfulness"],
  agent: ["agentic"],
  agents: ["agentic"],
  agentic: ["agent", "tool use"],
  graphrag: ["graph rag", "knowledge graph"],
  multimodal: ["images", "vision"],
  latency: ["performance", "production"],
  cost: ["tokens", "optimization"],
  security: ["prompt injection", "safety"],
  injection: ["prompt injection", "security"],
  quantization: ["compression", "binary"],
  semantic: ["embedding", "dense"],
  lexical: ["keyword", "bm25"],
  finetuning: ["fine tuning", "adaptation"],
};

const COMPARISON_PATTERNS: RegExp[] = [
  /^(?:what(?:'s| is| are)\s+the\s+)?differences?\s+between\s+(.+?)\s+and\s+(.+?)\??$/i,
  /^(.+?)\s+(?:vs\.?|versus)\s+(.+?)\??$/i,
  /^compare\s+(.+?)\s+(?:and|with|to)\s+(.+?)\??$/i,
];

/**
 * Expand a query into sub-queries: the original, both sides of a comparison
 * ("X vs Y", "difference between X and Y"), and a synonym-augmented variant.
 * Returns [original] when nothing expands.
 */
export function expandQuery(query: string): string[] {
  const q = query.trim();
  if (!q) return [];

  const out: string[] = [q];

  for (const pattern of COMPARISON_PATTERNS) {
    const m = q.match(pattern);
    if (m) {
      out.push(m[1].trim(), m[2].trim());
      break;
    }
  }

  const tokens = q.toLowerCase().split(/[^a-z0-9]+/g).filter(Boolean);
  const synonyms = new Set<string>();
  for (const token of tokens) {
    for (const syn of RAG_SYNONYMS[token] ?? []) synonyms.add(syn);
  }
  if (synonyms.size > 0) {
    out.push(`${q} ${[...synonyms].join(" ")}`);
  }

  return [...new Set(out.map((s) => s.trim()).filter(Boolean))].slice(0, MAX_SUB_QUERIES);
}

export type FusedSearchOutput = {
  results: SearchResult[];
  queriesUsed: string[];
  fusion: "rrf" | "single";
};

/**
 * Run each expanded sub-query through keyword search and fuse rankings with
 * RRF: score(doc) = Σ over lists of 1 / (k + rank). Deduped by contentId/url.
 */
export async function searchContentFused(
  q: string,
  { limit = 8, perQueryLimit }: { limit?: number; perQueryLimit?: number } = {}
): Promise<FusedSearchOutput> {
  const queries = expandQuery(q);
  if (queries.length === 0) return { results: [], queriesUsed: [], fusion: "single" };
  if (queries.length === 1) {
    return { results: await searchContent(queries[0], { limit }), queriesUsed: queries, fusion: "single" };
  }

  const per = perQueryLimit ?? Math.max(limit * 2, 12);
  const lists = await Promise.all(queries.map((sub) => searchContent(sub, { limit: per })));

  const fused = new Map<string, { result: SearchResult; score: number; bestRank: number }>();
  for (const list of lists) {
    list.forEach((result, rank) => {
      const key = result.contentId ?? result.url;
      const contribution = 1 / (RRF_K + rank + 1);
      const entry = fused.get(key);
      if (entry) {
        entry.score += contribution;
        entry.bestRank = Math.min(entry.bestRank, rank);
      } else {
        fused.set(key, { result, score: contribution, bestRank: rank });
      }
    });
  }

  const results = [...fused.values()]
    .sort((a, b) => b.score - a.score || a.bestRank - b.bestRank)
    .slice(0, limit)
    .map(({ result, score }) => ({ ...result, score: Number(score.toFixed(6)) }));

  return { results, queriesUsed: queries, fusion: "rrf" };
}
