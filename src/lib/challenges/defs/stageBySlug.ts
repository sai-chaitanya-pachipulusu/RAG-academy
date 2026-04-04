import type { CurriculumStage } from "@/lib/curriculum/stages";

export const CHALLENGE_STAGE_BY_SLUG: Record<string, CurriculumStage> = {
  // Foundations
  "dot-product": "foundations",
  "cosine-similarity": "foundations",
  "euclidean-distance": "foundations",
  "tokenizer-basics": "foundations",

  // Pre-retrieval (indexing)
  "simple-chunking": "pre-retrieval",
  "overlap-chunking": "pre-retrieval",
  "metadata-tagging": "pre-retrieval",
  "stable-chunk-ids": "pre-retrieval",
  "markdown-header-chunking": "pre-retrieval",
  "simhash-near-dedup": "pre-retrieval",
  "proposition-chunking": "pre-retrieval",
  "contextual-chunk-headers": "pre-retrieval",
  "late-chunking": "pre-retrieval",
  "rag-pipeline-chunker": "pre-retrieval",
  "rag-pipeline-embedder": "pre-retrieval",
  "rag-pipeline-retriever": "pre-retrieval",
  "rag-pipeline-generator": "pre-retrieval",

  // Retrieval
  "basic-retrieval": "retrieval",
  "embed-and-search": "retrieval",
  "bm25-from-scratch": "retrieval",
  "bm25-field-boosting": "retrieval",
  "rrf-fusion": "retrieval",
  "weighted-rrf-fusion": "retrieval",

  // Query transforms
  "query-normalization": "query-transforms",
  "self-query-filters": "query-transforms",
  "hyde-search": "query-transforms",
  "multi-query-fusion": "query-transforms",
  "step-back-prompting": "query-transforms",

  // Advanced Retrieval
  "parent-document-tokenizer": "advanced-retrieval",
  "recursive-retrieval": "advanced-retrieval",
  "dense-vector-class": "advanced-retrieval",
  "naive-flat-index": "advanced-retrieval",
  "ivf-flat-index": "advanced-retrieval",
  "hnsw-index": "advanced-retrieval",

  // Post-retrieval (context shaping)
  "rerank-cascade": "post-retrieval",
  "mmr-diversity": "post-retrieval",
  "lost-in-the-middle-ordering": "post-retrieval",
  "token-budget-packing": "post-retrieval",
  "extractive-compression": "post-retrieval",
  "exact-dedup": "post-retrieval",
  "autocut-threshold": "post-retrieval",
  "reranker-score-function": "post-retrieval",
  "reranker-cascade": "post-retrieval",

  // Grounding & safety
  "prompt-template": "grounding-safety",
  "metadata-filtering": "grounding-safety",
  "acl-filter-enforcement": "grounding-safety",
  "citation-range-validator": "grounding-safety",
  "refusal-policy": "grounding-safety",
  "prompt-injection-sanitizer": "grounding-safety",
  "pii-redaction": "grounding-safety",
  
  // New Missing Challenges mapping
  "multi-tenant-rag": "production-ops",
  "semantic-cache-advanced": "production-ops",
  "query-router": "agentic-rag",

  // Agentic RAG
  "tool-use-basics": "agentic-rag",
  "react-implementation": "agentic-rag",
  "self-correction-loop": "agentic-rag",

  // Evaluation & ops
  "retrieval-metrics": "evaluation-ops",
  "train-only-retrieval-guard": "evaluation-ops",
  "embedding-cache": "evaluation-ops",
  "retrieval-cache-key": "evaluation-ops",
  "route-by-difficulty": "evaluation-ops",
  "evaluator-recall-at-k": "evaluation-ops",
  "evaluator-mrr": "evaluation-ops",
  "evaluator-ndcg": "evaluation-ops",
  "news-search-tool": "capstone-projects",
  "customer-support-bot": "capstone-projects",
  "enterprise-support-router": "capstone-projects",
  "financial-analyst-agent": "capstone-projects",
  "end-to-end-rag-pipeline": "capstone-projects",
  "arena-tfidf-log-search": "arena",

  // New Advanced Stages
  "table-parsing": "multimodal",
  "entity-extraction": "graph-rag",
  "colbert-maxsim": "advanced-retrieval",
  "speculative-rag": "agentic-rag",
  "product-quantization": "production-ops",
  "faithfulness-judge": "evaluation-ops",
  "multimodal-retrieval": "multimodal",
  "cost-aware-router": "production-ops",
  "agent-long-term-memory": "agentic-rag",
  "bitmap-indexing": "production-ops",
  "partitioned-storage": "production-ops",
  "relevance-judge": "evaluation-ops",
  "synthetic-data-gen": "fine-tuning",
  "dataset-tokenization": "fine-tuning",
  "ranker-distillation": "fine-tuning",

  // Enhanced Challenges (10x Improvements)
  "vector-normalization": "foundations",
  "sparse-vector-bow": "foundations",
  "batch-dot-product": "foundations",
  "sentence-chunking": "pre-retrieval",
  "recursive-splitter": "pre-retrieval",
  "similarity-threshold": "retrieval",
  "recency-boost": "retrieval",
  "llm-reranker": "post-retrieval",
  "contextual-compression-llm": "post-retrieval",
  "rate-limiter": "production-ops",
  "audit-logger": "production-ops",
  "source-fingerprint": "production-ops",

  // Enhanced Advanced Challenges (Phases 6-10)
  "json-schema-parser": "multimodal",
  "pdf-layout-detector": "multimodal",
  "audio-transcript-chunking": "multimodal",
  "raptor-tree": "advanced-retrieval",
  "self-rag-grader": "agentic-rag",
  "corrective-rag": "agentic-rag",
  "index-sharding": "production-ops",
  "async-batch-processor": "production-ops",
  "index-warmup": "production-ops",
  "context-recall-judge": "evaluation-ops",
  "toxicity-guard": "grounding-safety",
  "multi-judge-consensus": "evaluation-ops",
  "embedding-finetuning": "fine-tuning",
  "lora-adapter": "fine-tuning",
  "eval-dataset-curation": "fine-tuning",

  // New Evaluation Challenges
  "evaluator-precision-at-k": "evaluation-ops",
  "evaluator-map": "evaluation-ops",

  // New Infrastructure Challenges
  "ivf-pq-index": "advanced-retrieval",
  "embedding-model-selection": "foundations",
  "rag-cost-calculator": "production-ops",

  // Latest 2024/2025 Techniques
  "contextual-retrieval": "pre-retrieval",
  "splade-learned-sparse": "retrieval",
  "evaluator-f1-score": "evaluation-ops",
  "reranker-selection": "post-retrieval",
  "chunking-strategies": "pre-retrieval",

  // Long-term roadmap challenges
  "graphrag-knowledge-graph": "graph-rag",
  "self-rag": "agentic-rag",
  "multimodal-rag-guide": "multimodal",
  "quantization-deep-dive": "production-ops",
  "colbert-late-interaction": "retrieval",
  "raptor-tree-retrieval": "advanced-retrieval",
  "semantic-caching": "production-ops",
  "query-routing": "agentic-rag",
  "fine-tuning-embeddings-guide": "fine-tuning",
  "rag-observability": "evaluation-ops",
  "hallucination-detection": "grounding-safety",
  "context-window-optimization": "post-retrieval",
  "rag-ab-testing": "evaluation-ops",
  "rag-for-code": "production-ops",
  "multi-tenancy-rag": "production-ops",
  "streaming-rag": "production-ops",
  "rag-evaluation-suite": "evaluation-ops",
  "document-parsing-guide": "pre-retrieval",
  "conversational-rag": "agentic-rag",
  "agentic-rag-workflows": "agentic-rag",
  
  // Security challenges
  "prompt-injection-defense": "grounding-safety",
  "pii-filtering": "grounding-safety",
  "document-access-control": "production-ops",
  "rag-audit-logging": "evaluation-ops",
  "output-safety-filter": "grounding-safety",
  
  // Benchmarking challenges
  "beir-evaluation-setup": "evaluation-ops",
  "mteb-evaluation": "evaluation-ops",
  "custom-eval-dataset": "evaluation-ops",
  "retrieval-benchmarking-pipeline": "evaluation-ops",
  
  // Tier 3: Real-time RAG
  "websocket-streaming-rag": "production-ops",
  "live-index-updates": "production-ops",
  
  // Tier 3: RAG Analytics
  "rag-usage-dashboard": "evaluation-ops",
  "rag-cost-tracker": "production-ops",
  
  // Tier 3: Agentic Workflows
  "multi-step-reasoning": "agentic-rag",
  "tool-orchestration": "agentic-rag",
  
  // Tier 3B: Graph RAG & Specialized
  "graph-traversal-rag": "graph-rag",
  "hybrid-search-tuning": "retrieval",
  
  // Tier 3C: Document Parsing
  "pdf-table-extraction": "pre-retrieval",
  "document-hierarchy-parser": "pre-retrieval",
  
  // Tier 3C: Conversation Memory
  "conversation-buffer-memory": "agentic-rag",
  "entity-memory": "agentic-rag",
  "summary-memory": "agentic-rag",
  
  // Tier 3D: Multimodal RAG
  "image-embedding-rag": "multimodal",
  "ocr-rag-pipeline": "multimodal",
  
  // Tier 3D: RAG Testing
  "rag-unit-tests": "evaluation-ops",
  "retrieval-regression-tests": "evaluation-ops",
  
  // Chunking Masterclass
  "fixed-size-chunking-fundamentals": "pre-retrieval",
  "overlapping-chunking-explained": "pre-retrieval",
  "sentence-based-chunking": "pre-retrieval",
  "paragraph-based-chunking": "pre-retrieval",
  "sliding-window-chunking": "pre-retrieval",
  "recursive-chunking": "pre-retrieval",
  "section-based-chunking": "pre-retrieval",
  "semantic-chunking": "pre-retrieval",
  "hierarchical-chunking": "pre-retrieval",
  "metadata-aware-chunking": "pre-retrieval",
  
  // Advanced Chunking
  "agentic-chunking": "pre-retrieval",
  "code-aware-chunking": "pre-retrieval",
  "table-aware-chunking": "pre-retrieval",
  "parent-document-chunking": "pre-retrieval",
  "chunking-router": "pre-retrieval",
  
  // Query Understanding
  "intent-classification": "query-transforms",
  "query-entity-extraction": "query-transforms",
  "query-expansion": "query-transforms",
  "hyde-implementation": "query-transforms",
  "query-decomposition": "query-transforms",
  "conversational-query-rewrite": "query-transforms",
  
  // Advanced RAG Techniques (2025 Research)
  // Phase 9: Advanced Architectures
  "mia-rag-mindscape": "graph-rag",
  "quco-rag-uncertainty": "evaluation-ops",
  "hypergraph-memory-rag": "graph-rag",
  "hifi-rag-filtering": "post-retrieval",
  "bidirectional-rag": "production-ops",
  "ragpart-ragmask-defense": "grounding-safety",
  
  // Phase 10: Multimodal & Domain RAG
  "tv-rag-video": "multimodal",
  "mega-rag-biomedical": "graph-rag",
  "affordance-rag-robotics": "multimodal",
  "graph-o1-reasoning": "graph-rag",
  "hybrid-rag-multilingual": "retrieval",
  
  // TypeScript Challenges
  "ts-dot-product": "foundations",
  "ts-cosine-similarity": "foundations",
  "ts-fixed-size-chunker": "pre-retrieval",
  "ts-sentence-chunker": "pre-retrieval",
  "ts-top-k-search": "retrieval",
  "ts-bm25-score": "retrieval",
  "ts-rrf-fusion": "retrieval",
  "ts-cascade-reranker": "post-retrieval",
  "ts-recall-at-k": "evaluation-ops",
  "ts-mrr": "evaluation-ops",
  "ts-ndcg": "evaluation-ops",
  "ts-hyde-query": "query-transforms",
  "ts-semantic-cache": "production-ops",
  "ts-context-builder": "post-retrieval",
  "ts-tool-router": "agentic-rag",
  "ts-react-loop": "agentic-rag",
  "ts-metadata-filter": "retrieval",
  "ts-prompt-builder": "grounding-safety",
  "ts-citation-extractor": "grounding-safety",
  "ts-inverted-index": "retrieval",
  "ts-lru-cache": "production-ops",
  "ts-groundedness-check": "evaluation-ops",
  "ts-pii-detector": "grounding-safety",
  "ts-injection-detector": "grounding-safety",
  "ts-async-batcher": "production-ops",
  "ts-token-counter": "foundations",
  "ts-sliding-window": "retrieval",
  "ts-query-decomposition": "query-transforms",
  "ts-mmr-diversity": "post-retrieval",
  "ts-sparse-embedding": "retrieval",
  "ts-query-router": "agentic-rag",
  "ts-embedding-cache-key": "production-ops",
  "ts-chunk-deduplicator": "post-retrieval",
  "ts-answer-confidence": "evaluation-ops",
  "ts-rate-limiter": "production-ops",

  // Vinija-inspired challenges
  "late-chunking-implementation": "pre-retrieval",
  "crag-pipeline": "agentic-rag",
  "faithfulness-calculator": "evaluation-ops",
  "bleu-rouge-scores": "evaluation-ops",
  "multimodal-embedding-fusion": "multimodal",

  // NEW: Advanced Chunking Techniques (Granularity & Domain-Specific)
  "page-level-chunking": "pre-retrieval",
  "document-level-chunking": "pre-retrieval",
  "layout-aware-chunking": "pre-retrieval",
  "maxmin-semantic-chunking": "pre-retrieval",
  "statistical-break-detection": "pre-retrieval",
  "semantic-guided-recursive-chunking": "pre-retrieval",
  "topic-based-chunking": "pre-retrieval",
  "variable-overlap-chunking": "pre-retrieval",
  "legal-clause-chunking": "pre-retrieval",
  "financial-statement-chunking": "pre-retrieval",
  // Phase 3 — Query Transforms
  "hyde-retrieval": "query-transforms",
  "query-complexity-classifier": "query-transforms",
  // Phase 5 — Post-retrieval
  "sentence-window-retrieval": "post-retrieval",
  "sentence-window-retriever": "post-retrieval",
  // Phase 6 — Grounding & Safety
  "claude-native-citations": "grounding-safety",
  "gemini-grounding": "grounding-safety",
  // Phase 7 — Agentic RAG
  "adaptive-rag-router": "agentic-rag",
  "multi-hop-qa": "agentic-rag",
  "reasoning-rag-implementation": "agentic-rag",
  "user-profile-rag": "agentic-rag",
  // Phase 8 — Graph & Knowledge
  "knowledge-graph-extraction": "graph-rag",
  // Phase 11 — Production Ops
  "kv-cache-optimization": "production-ops",
  "realtime-document-sync": "production-ops",
  // Phase 12 — Evaluation Ops
  "answer-relevancy-score": "evaluation-ops",
  "context-recall-calculator": "evaluation-ops",
  "llm-as-judge": "evaluation-ops",
  "rag-failure-diagnosis": "evaluation-ops",
  // Phase 0 — Foundations
  "bert-vs-sentence-transformers": "foundations",
};
