/**
 * RAG Academy — TypeScript Types
 */

export interface Chunk {
  id: string;
  text: string;
  source: string;
  index: number;
  metadata: Record<string, unknown>;
  embedding?: number[];
}

export interface RetrievalResult extends Chunk {
  score: number;
  rerankScore?: number;
}

export interface QueryRequest {
  query: string;
  topK?: number;
  rerank?: boolean;
  rerankTopN?: number;
  filters?: Record<string, unknown>;
}

export interface QueryResponse {
  answer: string;
  sources: Array<{
    index: number;
    source: string;
    textPreview: string;
  }>;
  retrievalScores: number[];
  latencyMs: number;
}

export interface IngestRequest {
  content: string;
  source: string;
  metadata?: Record<string, unknown>;
}

export interface IngestResponse {
  status: "success" | "error";
  chunksCreated: number;
  source: string;
}

export interface EvalResult {
  recallAtK: Record<string, number>;
  mrr: number;
  ndcg: number;
}

export interface GoldenSetItem {
  query: string;
  expectedSources: string[];
  expectedAnswerContains?: string[];
}

export interface PipelineConfig {
  chunkSize: number;
  chunkOverlap: number;
  topK: number;
  rerankEnabled: boolean;
  rerankTopN: number;
  embeddingModel: string;
  generationModel: string;
}
