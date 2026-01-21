export type PlanLink = { label: string; href: string };

export type PlanWeek = {
  week: string;
  title: string;
  outcome: string;
  learn: PlanLink[];
  labs: PlanLink[];
  challenges: PlanLink[];
  ship: string;
};

export const FAST_TRACK: PlanWeek[] = [
  {
    week: "Week 1",
    title: "RAG foundations",
    outcome: "You can explain RAG, implement the core primitives, and reason about grounding.",
    learn: [
      { label: "Welcome to RAG Academy", href: "/learn/phase-0/welcome-to-rag-academy" },
      { label: "Why RAG Exists", href: "/learn/phase-0/why-rag-exists" },
      { label: "Embedding Fundamentals", href: "/learn/phase-0/embedding-fundamentals" },
    ],
    labs: [
      { label: "Scrollytelling: the pipeline", href: "/" },
      { label: "Blueprint (reference)", href: "/playbooks/production-rag-blueprint" },
    ],
    challenges: [
      { label: "Dot Product", href: "/challenges/dot-product" },
      { label: "Cosine Similarity", href: "/challenges/cosine-similarity" },
      { label: "Euclidean Distance", href: "/challenges/euclidean-distance" },
      { label: "Tokenizer Basics", href: "/challenges/tokenizer-basics" },
    ],
    ship: "A tiny retrieval primitive library + a grounded prompt template mindset.",
  },
  {
    week: "Week 2",
    title: "Indexing + retrieval (production defaults)",
    outcome: "You can explain chunk IDs, token budgets, metadata filters, and safe indexing defaults.",
    learn: [
      { label: "Tokenizers & context windows", href: "/learn/phase-0/tokenizers-and-context" },
      { label: "Chunking 101", href: "/learn/phase-0/chunking-101" },
    ],
    labs: [
      { label: "Vector DB Lab (decision tree)", href: "/compare/vector-dbs" },
      { label: "Compare: Retrieval", href: "/compare/retrieval" },
    ],
    challenges: [
      { label: "Simple Chunking", href: "/challenges/simple-chunking" },
      { label: "Overlap Chunking", href: "/challenges/overlap-chunking" },
      { label: "Metadata Tagging", href: "/challenges/metadata-tagging" },
      { label: "Stable Chunk IDs", href: "/challenges/stable-chunk-ids" },
      { label: "Metadata Filtering", href: "/challenges/metadata-filtering" },
    ],
    ship: "A reproducible ingestion run (stable ids, traceability) + baseline retrieval you can debug.",
  },
  {
    week: "Week 3",
    title: "Hybrid retrieval + query transforms",
    outcome: "You can maximize recall (hybrid + fusion) and handle vague queries.",
    learn: [{ label: "Your first RAG", href: "/learn/phase-0/your-first-rag" }],
    labs: [
      { label: "Compare: Embeddings", href: "/compare/embeddings" },
      { label: "Compare: Retrieval", href: "/compare/retrieval" },
    ],
    challenges: [
      { label: "BM25 from Scratch", href: "/challenges/bm25-from-scratch" },
      { label: "BM25 Field Boosting", href: "/challenges/bm25-field-boosting" },
      { label: "RRF Fusion", href: "/challenges/rrf-fusion" },
      { label: "Weighted RRF Fusion", href: "/challenges/weighted-rrf-fusion" },
      { label: "HyDE Search", href: "/challenges/hyde-search" },
      { label: "Multi‑Query Fusion", href: "/challenges/multi-query-fusion" },
      { label: "Self‑Query Filters", href: "/challenges/self-query-filters" },
    ],
    ship: "A retrieval pipeline that hits high Recall@k on a small golden set (and you can debug failures).",
  },
  {
    week: "Week 4",
    title: "The Production Loop (Precision & Safety)",
    outcome: "You can maximize precision (rerank), avoid context rot, and enforce grounding safely.",
    learn: [{ label: "RAG Techniques Encyclopedia", href: "/playbooks/rag-techniques-encyclopedia" }],
    labs: [
      { label: "Compare: Reranking", href: "/compare/reranking" },
      { label: "Compare: Security", href: "/compare/security" },
      { label: "Compare: Evaluation", href: "/compare/evaluation" },
    ],
    challenges: [
      { label: "Rerank Cascade", href: "/challenges/rerank-cascade" },
      { label: "MMR Diversity", href: "/challenges/mmr-diversity" },
      { label: "Lost‑in‑the‑Middle Ordering", href: "/challenges/lost-in-the-middle-ordering" },
      { label: "Citation Range Validator", href: "/challenges/citation-range-validator" },
      { label: "Prompt Injection Sanitizer", href: "/challenges/prompt-injection-sanitizer" },
      { label: "Retrieval Metrics", href: "/challenges/retrieval-metrics" },
    ],
    ship: "A production-ready baseline: hybrid → rerank → shaped context → citations → eval + safety.",
  },
];

export const DEEP_TRACK: PlanWeek[] = [
  ...FAST_TRACK,
  {
    week: "Week 5",
    title: "Advanced Evaluation & Observability",
    outcome: "You can measure quality regressions, debug complex failures, and implement online eval.",
    learn: [
      { label: "Blueprint: evaluation section", href: "/playbooks/production-rag-blueprint" },
      { label: "Papers: evaluation + RAG", href: "/research/papers" },
    ],
    labs: [
      { label: "Compare: Evaluation Frameworks", href: "/compare/evaluation" },
    ],
    challenges: [
      { label: "Route by Difficulty", href: "/challenges/route-by-difficulty" },
      { label: "Train‑Only Retrieval Guard", href: "/challenges/train-only-retrieval-guard" },
      { label: "Synthetic Data Generation", href: "/challenges/synthetic-data-generation" },
      { label: "RAGAS Deep Dive", href: "/challenges/ragas-deep-dive" },
    ],
    ship: "A comprehensive eval harness with synthetic test sets and continuous monitoring checks.",
  },
  {
    week: "Week 6",
    title: "Advanced Retrieval Patterns",
    outcome: "You can implement sophisticated patterns like Recursive Retrieval, Parent Document, and Contextual Compression.",
    learn: [{ label: "Advanced Retrieval Patterns", href: "/learn/advanced-retrieval/patterns" }],
    labs: [
      { label: "Pattern: Parent Document", href: "/patterns/parent-document" },
      { label: "Pattern: Recursive Retrieval", href: "/patterns/recursive" },
    ],
    challenges: [
      { label: "Recursive Retrieval", href: "/challenges/recursive-retrieval" },
      { label: "Parent Document Tokenizer", href: "/challenges/parent-document-tokenizer" },
      { label: "Router Chain", href: "/challenges/router-chain" },
    ],
    ship: "A highly context-aware retrieval system that preserves document structure and context.",
  },
  {
    week: "Week 7",
    title: "Agentic RAG",
    outcome: "You can build systems that plan, use tools, and self-correct (Self-RAG, CRAG).",
    learn: [{ label: "The Shift to Agentic RAG", href: "/learn/agentic/intro" }],
    labs: [
      { label: "Pattern: Self-RAG", href: "/patterns/self-rag" },
      { label: "Pattern: Corrective RAG", href: "/patterns/crag" },
    ],
    challenges: [
      { label: "Tool Use Basics", href: "/challenges/tool-use-basics" },
      { label: "ReAct Implementation", href: "/challenges/react-implementation" },
      { label: "Self-Correction Loop", href: "/challenges/self-correction-loop" },
    ],
    ship: "An agentic RAG system that can browse, verify its own answers, and retry upon failure.",
  },
  {
    week: "Week 8",
    title: "GraphRAG & Knowledge Graphs",
    outcome: "You can extract entities, build a knowledge graph, and perform graph traversal for multi-hop reasoning.",
    learn: [{ label: "GraphRAG Explained", href: "/learn/graph-rag/explained" }],
    labs: [
      { label: "Neo4j vs NetworkX", href: "/compare/graph-dbs" },
    ],
    challenges: [
      { label: "Triplet Extraction", href: "/challenges/triplet-extraction" },
      { label: "Graph Traversal", href: "/challenges/graph-traversal" },
      { label: "Community Detection", href: "/challenges/community-detection" },
    ],
    ship: "A GraphRAG pipeline that answers 'global' questions across your entire document corpus.",
  },
  {
    week: "Week 9",
    title: "Fine-tuning & Adaptation",
    outcome: "You can squeeze maximum performance by fine-tuning embeddings, rerankers, and generator models (RAFT).",
    learn: [{ label: "When to Fine-tune", href: "/learn/fine-tuning/when-to-finetune" }],
    labs: [
      { label: "Lab: Fine-tuning Embeddings", href: "/labs/finetune-embeddings" },
    ],
    challenges: [
      { label: "Contrastive Loss", href: "/challenges/contrastive-loss" },
      { label: "Hard Negative Mining", href: "/challenges/hard-negative-mining" },
      { label: "RAFT Dataset Prep", href: "/challenges/raft-dataset-prep" },
    ],
    ship: "A fine-tuned adapter that outperforms state-of-the-art base models on your specific domain.",
  },
  {
    week: "Week 10",
    title: "Multimodal RAG",
    outcome: "You can ingest, index, and retrieve across modalities (Images, Tables, Audio).",
    learn: [{ label: "Multimodal Embeddings", href: "/learn/multimodal/embeddings" }],
    labs: [
      { label: "Model: ColPali", href: "/models/colpali" },
      { label: "Model: CLIP", href: "/models/clip" },
    ],
    challenges: [
      { label: "CLIP Embeddings", href: "/challenges/clip-embeddings" },
      { label: "Image Captioning", href: "/challenges/image-captioning" },
      { label: "Table Extraction", href: "/challenges/table-extraction" },
    ],
    ship: "A multimodal search engine where text queries retrieve relevant images and charts.",
  },
  {
    week: "Week 11",
    title: "Production Scale & Ops",
    outcome: "You can optimize for latency, handle millions of vectors, and manage cost at scale.",
    learn: [{ label: "Production Checklist", href: "/playbooks/production-checklist" }],
    labs: [
      { label: "Compare: Caching Strategies", href: "/compare/caching" },
      { label: "Scaling Vector DBs", href: "/labs/scaling" },
    ],
    challenges: [
      { label: "Embedding Cache", href: "/challenges/embedding-cache" },
      { label: "Retrieval Cache Key", href: "/challenges/retrieval-cache-key" },
      { label: "Quantization Effects", href: "/challenges/quantization-effects" },
    ],
    ship: "A high-performance pipeline with semantic caching, fallbacks, and P99 monitoring.",
  },
  {
    week: "Week 12",
    title: "Capstone: Live Data & Agentic Logic",
    outcome: "You build fully functional, complex agents that reason over live data streams.",
    learn: [{ label: "Building Agents with Tools", href: "/learn/phase-4/agents-with-tools" }],
    labs: [
      { label: "Project: The News Agent", href: "/challenges/news-search-tool" },
      { label: "Project: Dynamic Support Bot", href: "/challenges/customer-support-bot" },
      { label: "Project: Crypto Analyst", href: "/challenges/financial-analyst-agent" },
    ],
    challenges: [
      { label: "News Search Tool", href: "/challenges/news-search-tool" },
      { label: "Dynamic Support Bot", href: "/challenges/customer-support-bot" },
      { label: "Crypto Analyst Agent", href: "/challenges/financial-analyst-agent" },
    ],
    ship: "A portfolio-ready AI agent that solves real-world problems using live data + RAG.",
  },
];
