/**
 * Hybrid retrieval combining dense and sparse search.
 */

import type { RetrievalResult } from "../types.js";

/**
 * Hybrid retrieval: combine dense and sparse results.
 */
export async function hybridRetrieve(
  query: string,
  queryEmbedding: number[],
  topK: number,
  alpha?: number
): Promise<RetrievalResult[]> {
  const effectiveAlpha = alpha ?? parseFloat(process.env.HYBRID_ALPHA || "0.7");
  const candidatesK = topK * 3;

  // Dense retrieval
  const denseResults = await denseRetrieve(queryEmbedding, candidatesK);

  // Sparse retrieval
  const sparseResults = await sparseRetrieve(query, candidatesK);

  // Combine with RRF
  if (sparseResults.length > 0) {
    return reciprocalRankFusion(
      [denseResults, sparseResults],
      [effectiveAlpha, 1 - effectiveAlpha]
    ).slice(0, topK);
  }

  return denseResults.slice(0, topK);
}

/**
 * Dense vector retrieval.
 * Implement based on your vector store.
 */
async function denseRetrieve(
  queryEmbedding: number[],
  topK: number
): Promise<RetrievalResult[]> {
  // Implement based on your vector DB:
  //
  // Chroma:
  // const results = await collection.query({
  //   queryEmbeddings: [queryEmbedding],
  //   nResults: topK,
  // });
  //
  // Pinecone:
  // const results = await index.query({
  //   vector: queryEmbedding,
  //   topK,
  //   includeMetadata: true,
  // });

  console.warn("denseRetrieve not implemented - returning empty results");
  return [];
}

/**
 * Sparse retrieval using BM25.
 * Implement based on your setup.
 */
async function sparseRetrieve(
  query: string,
  topK: number
): Promise<RetrievalResult[]> {
  // Options:
  // 1. In-memory BM25 (for small corpora)
  // 2. Elasticsearch/OpenSearch
  // 3. Vector DB with sparse support

  console.warn("sparseRetrieve not implemented - returning empty results");
  return [];
}

/**
 * Reciprocal Rank Fusion to combine multiple ranked lists.
 */
export function reciprocalRankFusion(
  resultLists: RetrievalResult[][],
  weights?: number[],
  k = 60
): RetrievalResult[] {
  const effectiveWeights = weights || resultLists.map(() => 1);
  const totalWeight = effectiveWeights.reduce((a, b) => a + b, 0);
  const normalizedWeights = effectiveWeights.map((w) => w / totalWeight);

  const scores: Map<string, number> = new Map();
  const docs: Map<string, RetrievalResult> = new Map();

  for (let i = 0; i < resultLists.length; i++) {
    const weight = normalizedWeights[i];

    for (let rank = 0; rank < resultLists[i].length; rank++) {
      const doc = resultLists[i][rank];
      const docId = doc.id;
      const rrfScore = weight / (k + rank + 1);

      scores.set(docId, (scores.get(docId) || 0) + rrfScore);

      if (!docs.has(docId)) {
        docs.set(docId, doc);
      }
    }
  }

  // Sort by combined score
  const sortedIds = Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);

  return sortedIds.map((id) => ({
    ...docs.get(id)!,
    score: scores.get(id)!,
  }));
}

/**
 * Apply metadata filters to candidates.
 */
export function applyMetadataFilters(
  candidates: RetrievalResult[],
  filters: Record<string, unknown>
): RetrievalResult[] {
  if (!filters || Object.keys(filters).length === 0) {
    return candidates;
  }

  return candidates.filter((candidate) => {
    const metadata = candidate.metadata;

    for (const [key, value] of Object.entries(filters)) {
      if (!(key in metadata)) {
        return false;
      }

      const metaValue = metadata[key];

      if (Array.isArray(value)) {
        if (!value.includes(metaValue)) {
          return false;
        }
      } else if (typeof value === "object" && value !== null) {
        // Handle operators
        const ops = value as Record<string, unknown>;
        if ("$gte" in ops && (metaValue as number) < (ops.$gte as number)) {
          return false;
        }
        if ("$lte" in ops && (metaValue as number) > (ops.$lte as number)) {
          return false;
        }
        if ("$in" in ops && !(ops.$in as unknown[]).includes(metaValue)) {
          return false;
        }
      } else {
        if (metaValue !== value) {
          return false;
        }
      }
    }

    return true;
  });
}
