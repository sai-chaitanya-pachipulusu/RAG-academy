/**
 * Retrieval and generation evaluation metrics.
 */

import { readFile } from "fs/promises";
import type { EvalResult, GoldenSetItem, RetrievalResult } from "../types.js";

/**
 * Evaluate retrieval quality on a golden set.
 */
export async function evaluateRetrieval(
  goldenSetPath: string,
  retriever: (query: string) => Promise<RetrievalResult[]>,
  kValues = [1, 3, 5, 10]
): Promise<EvalResult> {
  const goldenSetJson = await readFile(goldenSetPath, "utf-8");
  const goldenSet: GoldenSetItem[] = JSON.parse(goldenSetJson);

  const allRecalls: Record<number, number[]> = {};
  for (const k of kValues) {
    allRecalls[k] = [];
  }
  const allRR: number[] = [];
  const allNdcg: number[] = [];

  for (const item of goldenSet) {
    const results = await retriever(item.query);
    const retrievedSources = results.map((r) => r.source);
    const expected = new Set(item.expectedSources);

    // Recall@k
    for (const k of kValues) {
      const topKSources = new Set(retrievedSources.slice(0, k));
      const hits = Array.from(topKSources).filter((s) => expected.has(s)).length;
      const recall = expected.size > 0 ? hits / expected.size : 0;
      allRecalls[k].push(recall);
    }

    // Reciprocal Rank
    let rr = 0;
    for (let i = 0; i < retrievedSources.length; i++) {
      if (expected.has(retrievedSources[i])) {
        rr = 1 / (i + 1);
        break;
      }
    }
    allRR.push(rr);

    // nDCG
    const relevance = retrievedSources
      .slice(0, 10)
      .map((s) => (expected.has(s) ? 1 : 0));
    allNdcg.push(computeNdcg(relevance, expected.size));
  }

  return {
    recallAtK: Object.fromEntries(
      kValues.map((k) => [`recall@${k}`, mean(allRecalls[k])])
    ),
    mrr: mean(allRR),
    ndcg: mean(allNdcg),
  };
}

/**
 * Compute Normalized Discounted Cumulative Gain.
 */
function computeNdcg(relevance: number[], numRelevant: number): number {
  if (relevance.length === 0 || numRelevant === 0) {
    return 0;
  }

  // DCG
  let dcg = 0;
  for (let i = 0; i < relevance.length; i++) {
    dcg += relevance[i] / Math.log2(i + 2);
  }

  // Ideal DCG
  let idcg = 0;
  const idealLength = Math.min(numRelevant, relevance.length);
  for (let i = 0; i < idealLength; i++) {
    idcg += 1 / Math.log2(i + 2);
  }

  return idcg > 0 ? dcg / idcg : 0;
}

/**
 * Calculate mean of an array.
 */
function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/**
 * Precision@k: fraction of top-k that are relevant.
 */
export function precisionAtK(
  retrieved: string[],
  relevant: Set<string>,
  k: number
): number {
  const topK = new Set(retrieved.slice(0, k));
  const hits = Array.from(topK).filter((s) => relevant.has(s)).length;
  return k > 0 ? hits / k : 0;
}

/**
 * Recall@k: fraction of relevant in top-k.
 */
export function recallAtK(
  retrieved: string[],
  relevant: Set<string>,
  k: number
): number {
  const topK = new Set(retrieved.slice(0, k));
  const hits = Array.from(topK).filter((s) => relevant.has(s)).length;
  return relevant.size > 0 ? hits / relevant.size : 0;
}

/**
 * F1@k: harmonic mean of precision and recall.
 */
export function f1AtK(
  retrieved: string[],
  relevant: Set<string>,
  k: number
): number {
  const p = precisionAtK(retrieved, relevant, k);
  const r = recallAtK(retrieved, relevant, k);
  return p + r > 0 ? (2 * p * r) / (p + r) : 0;
}
