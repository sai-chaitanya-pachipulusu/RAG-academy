import type { CurriculumStage } from "@/lib/curriculum/stages";

export type ChallengeDifficulty = "easy" | "medium" | "hard";

import type { Dataset } from "./datasets/types";

export type Challenge = {
  slug: string;
  title: string;
  description: string;
  stage: CurriculumStage;
  group: string;
  difficulty: ChallengeDifficulty;
  xpReward: number;
  starterCode: string;
  testCode: string;
  hints: string[];
  benchmark?: boolean;
  dataset?: Dataset;
  solution?: string;
  
  // LeetCode-beating features
  complexity?: {
    time: string;      // e.g., "O(n log n)"
    space: string;     // e.g., "O(n)"
    latency?: string;  // e.g., "~10ms per 1000 docs"
  };
  realWorld?: {
    description: string;  // "This is how Pinecone indexes vectors"
    companies: string[];  // ["OpenAI", "Anthropic", "Google"]
    useCases: string[];   // ["Semantic search", "Recommendation systems"]
  };
  prerequisites?: string[];     // ["dot-product", "cosine-similarity"]
  relatedChallenges?: string[]; // ["ivf-flat-index", "hnsw-index"]
  relatedPlaybooks?: string[];  // ["chunking-strategies", "rag-troubleshooting-guide"]
  
  // Time estimate for completion
  timeEstimate?: {
    minutes: number;      // Estimated minutes to complete
    label: string;        // e.g., "15-20 min", "30-45 min", "1-2 hours"
  };
};

export type RawChallenge = Omit<Challenge, "stage">;


