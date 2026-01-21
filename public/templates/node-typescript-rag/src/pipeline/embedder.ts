/**
 * Embedding generation with batching.
 */

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function getEmbeddingModel(): string {
  return process.env.EMBEDDING_MODEL || "text-embedding-3-small";
}

/**
 * Embed a single query.
 */
export async function embedQuery(query: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: getEmbeddingModel(),
    input: query,
  });

  return response.data[0].embedding;
}

/**
 * Embed multiple texts with batching.
 */
export async function embedChunks(
  texts: string[],
  batchSize = 100
): Promise<number[][]> {
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);

    const response = await openai.embeddings.create({
      model: getEmbeddingModel(),
      input: batch,
    });

    const batchEmbeddings = response.data.map((d) => d.embedding);
    allEmbeddings.push(...batchEmbeddings);
  }

  return allEmbeddings;
}

/**
 * Compute cosine similarity between two vectors.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Normalize an embedding vector (L2 normalization).
 */
export function normalizeEmbedding(embedding: number[]): number[] {
  let norm = 0;
  for (const val of embedding) {
    norm += val * val;
  }
  norm = Math.sqrt(norm);

  if (norm === 0) return embedding;
  return embedding.map((v) => v / norm);
}
