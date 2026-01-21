export const CURRICULUM_STAGE_IDS = [
  "foundations",
  "pre-retrieval",
  "retrieval",
  "query-transforms",
  "advanced-retrieval",
  "post-retrieval",
  "grounding-safety",
  "agentic-rag",
  "graph-rag",
  "multimodal",
  "fine-tuning",
  "production-ops",
  "evaluation-ops",
  "frontier",
  "capstone-projects",
  "arena",
] as const;

export type CurriculumStage = (typeof CURRICULUM_STAGE_IDS)[number];

export const CURRICULUM_STAGE_LABELS: Record<CurriculumStage, string> = {
  foundations: "Foundations",
  "pre-retrieval": "Pre‑retrieval (indexing)",
  retrieval: "Retrieval",
  "query-transforms": "Query transforms",
  "advanced-retrieval": "Advanced Retrieval",
  "post-retrieval": "Post‑retrieval (context shaping)",
  "grounding-safety": "Grounding & safety",
  "agentic-rag": "Agentic RAG",
  "graph-rag": "Graph & Knowledge",
  multimodal: "Multimodal RAG",
  "fine-tuning": "Fine-tuning & Adaptation",
  "production-ops": "Production Ops & Scale",
  "evaluation-ops": "Evaluation & ops",
  frontier: "Frontier RAG (2025+)",
  "capstone-projects": "Capstone: Live Projects",
  arena: "The Arena",
};
