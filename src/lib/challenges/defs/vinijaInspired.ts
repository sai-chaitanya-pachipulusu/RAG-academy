import type { RawChallenge } from "@/lib/challenges/types";

// Import the new challenges
import { lateChunkingImplementationChallenge } from "./chunking/late-chunking-implementation";
import { cragPipelineChallenge } from "./advanced-rag/crag-pipeline";
import { faithfulnessCalculatorChallenge } from "./evaluation/faithfulness-calculator";
import { bleuRougeScoresChallenge } from "./evaluation/bleu-rouge-scores";
import { multimodalEmbeddingFusionChallenge } from "./multimodal/multimodal-embedding-fusion";

/**
 * Challenges inspired by vinija.ai/nlp/RAG/ research compilation
 * Includes: Late Chunking, CRAG, RAFT, RichRAG, Evaluation Metrics
 */
export const VINIJA_INSPIRED_CHALLENGES: RawChallenge[] = [
  // Chunking
  lateChunkingImplementationChallenge,
  
  // Advanced RAG architectures
  cragPipelineChallenge,
  
  // Evaluation metrics
  faithfulnessCalculatorChallenge,
  bleuRougeScoresChallenge,
  
  // Multimodal
  multimodalEmbeddingFusionChallenge,
];
