import type { RawChallenge } from "@/lib/challenges/types";

import { FOUNDATIONS_CHALLENGES } from "./foundations";
import { PRE_RETRIEVAL_CHALLENGES } from "./preRetrieval";
import { RETRIEVAL_CHALLENGES } from "./retrieval";
import { QUERY_TRANSFORMS_CHALLENGES } from "./queryTransforms";
import { POST_RETRIEVAL_CHALLENGES } from "./postRetrieval";
import { GROUNDING_SAFETY_CHALLENGES } from "./groundingSafety";
import { EVALUATION_OPS_CHALLENGES } from "./evaluationOps";

import { AGENTIC_CHALLENGES } from "./agentic";
import { ADVANCED_RETRIEVAL_CHALLENGES } from "./advancedRetrieval";

import { LIVE_DATA_CHALLENGES } from "./liveProjects";
import { ARENA_CHALLENGES } from "./arena";
import { VECTOR_DB_SAGA_CHALLENGES } from "./vectorDbSaga";
import { RAG_PIPELINE_SAGA_CHALLENGES } from "./ragPipelineSaga";
import { RERANKER_SAGA_CHALLENGES } from "./rerankerSaga";
import { EVALUATOR_SAGA_CHALLENGES } from "./evaluatorSaga";
import { ADVANCED_ARCHITECTURES_CHALLENGES } from "./advancedArchitectures";
import { FINE_TUNING_CHALLENGES } from "./fineTuning";
import { ENHANCED_CHALLENGES } from "./enhancedChallenges";
import { ENHANCED_ADVANCED_CHALLENGES } from "./enhancedAdvanced";
import { LONG_TERM_ROADMAP_CHALLENGES } from "./longTermRoadmap";
import { SECURITY_CHALLENGES } from "./security";
import { BENCHMARKING_CHALLENGES } from "./benchmarking";
import { TIER3_ADVANCED_CHALLENGES } from "./tier3Advanced";
import { TIER3B_SPECIALIZED_CHALLENGES } from "./tier3bSpecialized";
import { TIER3C_SPECIALIZED_CHALLENGES } from "./tier3cSpecialized";
import { TIER3D_MULTIMODAL_TESTING_CHALLENGES } from "./tier3dMultimodalTesting";
import { CHUNKING_MASTERCLASS_CHALLENGES } from "./chunkingMasterclass";
import { ADVANCED_CHUNKING_CHALLENGES } from "./advancedChunking";
import { QUERY_UNDERSTANDING_CHALLENGES } from "./queryUnderstanding";
import { ADVANCED_RAG_TECHNIQUES } from "./advancedRagTechniques";
import { TYPESCRIPT_CHALLENGES } from "./typescript";

export const RAW_CHALLENGES: RawChallenge[] = [
  ...FOUNDATIONS_CHALLENGES,
  ...PRE_RETRIEVAL_CHALLENGES,
  ...RETRIEVAL_CHALLENGES,
  ...QUERY_TRANSFORMS_CHALLENGES,
  ...ADVANCED_RETRIEVAL_CHALLENGES,
  ...POST_RETRIEVAL_CHALLENGES,
  ...GROUNDING_SAFETY_CHALLENGES,
  ...AGENTIC_CHALLENGES,
  ...EVALUATION_OPS_CHALLENGES,
  ...LIVE_DATA_CHALLENGES,
  ...ARENA_CHALLENGES,
  ...VECTOR_DB_SAGA_CHALLENGES,
  ...RAG_PIPELINE_SAGA_CHALLENGES,
  ...RERANKER_SAGA_CHALLENGES,
  ...EVALUATOR_SAGA_CHALLENGES,
  ...ADVANCED_ARCHITECTURES_CHALLENGES,
  ...FINE_TUNING_CHALLENGES,
  ...ENHANCED_CHALLENGES,
  ...ENHANCED_ADVANCED_CHALLENGES,
  ...LONG_TERM_ROADMAP_CHALLENGES,
  ...SECURITY_CHALLENGES,
  ...BENCHMARKING_CHALLENGES,
  ...TIER3_ADVANCED_CHALLENGES,
  ...TIER3B_SPECIALIZED_CHALLENGES,
  ...TIER3C_SPECIALIZED_CHALLENGES,
  ...TIER3D_MULTIMODAL_TESTING_CHALLENGES,
  ...CHUNKING_MASTERCLASS_CHALLENGES,
  ...ADVANCED_CHUNKING_CHALLENGES,
  ...QUERY_UNDERSTANDING_CHALLENGES,
  ...ADVANCED_RAG_TECHNIQUES,
  ...TYPESCRIPT_CHALLENGES,
];


