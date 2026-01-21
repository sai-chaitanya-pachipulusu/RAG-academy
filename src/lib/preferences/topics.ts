export const TOPICS = [
  "foundations",
  "rag",
  "papers",
  "community",
  "vector-db",
  "tooling",
  "chunking",
  "retrieval",
  "reranking",
  "evaluation",
  "security",
  "caching",
  "agentic",
  "graph-rag",
  "multimodal",
  "production",
] as const;

export type Topic = (typeof TOPICS)[number];


