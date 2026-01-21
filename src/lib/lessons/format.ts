const PHASE_TITLES: Record<string, string> = {
  "phase-0": "Phase 0 — Foundations",
  "phase-1": "Phase 1 — Core RAG Pipeline",
  "phase-2": "Phase 2 — Retrieval Optimization",
  "phase-3": "Phase 3 — Modular RAG Patterns",
  "phase-4": "Phase 4 — Graph & Multimodal",
  "phase-5": "Phase 5 — Agentic RAG",
  "phase-6": "Phase 6 — Production & Scale",
  "phase-7": "Phase 7 — Frontier RAG (2025+)",
};

export function formatPhaseLabel(phase: string) {
  return PHASE_TITLES[phase] ?? phase;
}


