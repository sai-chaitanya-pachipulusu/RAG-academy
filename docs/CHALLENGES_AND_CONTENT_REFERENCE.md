# RAG Academy: Complete Challenge & Content Documentation

> **Purpose**: This document provides a comprehensive overview of all challenges, theory, and projects in the RAG Academy platform. It serves as a dense reference guide to understand what content exists in each phase and section without needing to dive into the code.

---

## Table of Contents
1. [Phase Overview](#phase-overview)
2. [Phase 0: Foundations](#phase-0-foundations-vector-math)
3. [Phase 1: Data Layer](#phase-1-the-data-layer-ingestion--indexing)
4. [Phase 2: Retrieval](#phase-2-retrieval--query-engineering)
5. [Phase 3: Reranking](#phase-3-reranking--context-optimization)
6. [Phase 4: Advanced Systems](#phase-4-advanced-systems--agents)
7. [Phase 5: Production](#phase-5-production-engineering--security)
8. [Phase 6: Grounding & Safety](#phase-6-grounding--safety)
9. [Phase 7: Agentic RAG](#phase-7-agentic-rag)
10. [Phase 8: Graph & Knowledge](#phase-8-graph--knowledge)
11. [Phase 9: Multimodal](#phase-9-multimodal--domain-rag)
12. [Phase 10: Fine-tuning](#phase-10-fine-tuning--adaptation)
13. [Phase 11: Production Ops](#phase-11-production-ops)
14. [Phase 12: Evaluation Ops](#phase-12-evaluation-ops)
15. [Sagas](#sagas-core-learning-paths)
16. [Arena Challenges](#arena-challenges)
17. [Live Projects](#live-projects)
18. [Datasets](#datasets-available)
19. [Lessons](#lessons-theory-content)
20. [Playbooks](#playbooks-quick-reference)

---

## Phase Overview

> **Note**: The curriculum uses "Curriculum Stages" internally (foundations, pre-retrieval, etc.). 
> Phases 0-12 are a user-facing organization mapping to curriculum stages.

| Phase | Curriculum Stage | Focus Area | # Challenges |
|-------|-----------------|------------|--------------|
| Phase 0 | Foundations | Vector math, tokenization | 11 |
| Phase 1 | Pre-retrieval | Chunking, indexing, deduplication | 48 |
| Phase 2 | Retrieval | Basic retrieval, BM25, hybrid | 13 |
| Phase 3 | Query Transforms | Query expansion, rewriting | 13 |
| Phase 4 | Advanced Retrieval | Parent doc, recursive retrieval | 10 |
| Phase 5 | Post-retrieval | Reranking, context optimization | 18 |
| Phase 6 | Grounding & Safety | PII, ACL, prompt injection | 17 |
| Phase 7 | Agentic RAG | Tool use, ReAct, self-correction | 20 |
| Phase 8 | Graph & Knowledge | Knowledge graphs, multi-hop | 7 |
| Phase 9 | Multimodal | Tables, images, video, audio | 11 |
| Phase 10 | Fine-tuning | Domain adaptation, embedding tuning | 7 |
| Phase 11 | Production Ops | Scaling, caching, rate limiting | 27 |
| Phase 12 | Evaluation Ops | Metrics, observability, benchmarks | 34 |

> **Capstone Projects**: 3 (news-search-tool, customer-support-bot, financial-analyst-agent)  
> **Arena**: 1 (arena-tfidf-log-search)

---

## Phase 0: Foundations (Vector Math)

**Purpose**: Build mathematical intuition for high-dimensional vector spaces before implementing RAG systems.

| Challenge | Slug | Difficulty | Description |
|-----------|------|------------|-------------|
| Dot Product | `dot-product` | Easy | Implement dot product - the primitive behind cosine similarity and vector search |
| Cosine Similarity | `cosine-similarity` | Easy | Implement cosine similarity - the industry-standard metric for comparing embeddings |
| Euclidean Distance | `euclidean-distance` | Easy | Implement L2 distance - measuring absolute spatial distance between concepts |
| Tokenizer Basics | `tokenizer-basics` | Easy | Build a basic word tokenizer to understand how LLMs process text |
| Vector Normalization | `vector-normalization` | Easy | Normalize vectors to unit length (L2 norm) for consistent similarity |
| Sparse Vectors (BoW) | `sparse-vector-bow` | Easy | Create Bag-of-Words representations for hybrid search |
| Batched Dot Product | `batch-dot-product` | Easy | Compute similarity scores for multiple documents efficiently |

**Key Concepts**: Vector operations, similarity metrics, tokenization, normalization

---

## Phase 1: The Data Layer (Ingestion & Indexing)

**Purpose**: Learn to parse, chunk, and index data efficiently - the foundation of "garbage in, garbage out".

### 1.1 Chunking Strategies

| Challenge | Slug | Difficulty | Description |
|-----------|------|------------|-------------|
| Simple Chunking | `simple-chunking` | Easy | Split text into fixed-size chunks by characters |
| Overlap Chunking | `overlap-chunking` | Easy | Chunk with overlap to reduce boundary loss |
| Markdown Header Chunking | `markdown-header-chunking` | Medium | Chunk Markdown by section headers with hierarchical metadata |
| Proposition Chunking | `proposition-chunking` | Hard | Break text into atomic, self-contained factual propositions |
| Contextual Chunk Headers | `contextual-chunk-headers` | Medium | Prepend global document context to every chunk |
| Late Chunking | `late-chunking` | Hard | Embed whole docs before splitting - preserve long-range semantic dependencies |
| Sentence-based Chunking | `sentence-chunking` | Medium | Chunk text by sentences instead of characters |
| Recursive Character Splitter | `recursive-splitter` | Medium | Implement LangChain's default recursive splitting strategy |

### 1.2 Data Hygiene & Deduplication

| Challenge | Slug | Difficulty | Description |
|-----------|------|------------|-------------|
| Metadata Tagging | `metadata-tagging` | Medium | Attach structured metadata to chunks (source, page, timestamp) |
| Stable Chunk IDs | `stable-chunk-ids` | Medium | Create deterministic chunk IDs + hashes for citations and re-indexing |
| Near Deduplication (SimHash) | `simhash-near-dedup` | Medium | Detect near-duplicate chunks using SimHash algorithm |

### 1.3 Vector Indexing Algorithms

| Challenge | Slug | Difficulty | Description |
|-----------|------|------------|-------------|
| Naive Flat Index | `naive-flat-index` | Medium | Implement brute-force search O(N) - baseline performance |
| IVF (Inverted File) Index | `ivf-flat-index` | Hard | Implement K-Means clustering to partition vector space |
| HNSW Index | `hnsw-index` | Hard | Build multi-layer graph for logarithmic search time |

**Key Concepts**: Text splitting, semantic boundaries, deduplication, vector indices

---

## Phase 2: Retrieval & Query Engineering

**Purpose**: Learn to interpret user intent and find the right data.

### 2.1 Basic Retrieval

| Challenge | Slug | Difficulty | Description |
|-----------|------|------------|-------------|
| Basic Retrieval (Top-K) | `basic-retrieval` | Medium | Retrieve top-k most similar items using cosine similarity |
| Embed & Search | `embed-and-search` | Medium | Create simple embeddings and search without external APIs |

### 2.2 Sparse Retrieval (BM25)

| Challenge | Slug | Difficulty | Description |
|-----------|------|------------|-------------|
| BM25 From Scratch | `bm25-from-scratch` | Hard | Implement TF-IDF and BM25 scoring formula |
| BM25 Field Boosting | `bm25-field-boosting` | Medium | Weigh matches in "Title" higher than "Body" |
| RRF Fusion | `rrf-fusion` | Medium | Combine BM25 + dense rankings using Reciprocal Rank Fusion |
| Weighted RRF Fusion | `weighted-rrf-fusion` | Medium | Implement weighted RRF to bias fusion toward one retriever |

### 2.3 Query Transformation

| Challenge | Slug | Difficulty | Description |
|-----------|------|------------|-------------|
| Query Normalization | `query-normalization` | Easy | Normalize queries (tokenize, stopwords, dedupe) |
| Self-Query Filters | `self-query-filters` | Medium | Extract structured filters from natural language queries |
| HyDE Search | `hyde-search` | Medium | Generate hypothetical answer, embed it, then retrieve |
| Multi-Query Fusion | `multi-query-fusion` | Hard | Generate query variants, retrieve per-variant, fuse rankings |
| Step-Back Prompting | `step-back-prompting` | Medium | Generate broader, abstract version of query |

### 2.4 Quality Control

| Challenge | Slug | Difficulty | Description |
|-----------|------|------------|-------------|
| Similarity Score Threshold | `similarity-threshold` | Medium | Filter results by absolute similarity, not just top-K |
| Recency Boosting | `recency-boost` | Medium | Boost retrieval scores based on document freshness |

**Key Concepts**: Dense vs sparse retrieval, hybrid search, query expansion, rerouting

---

## Phase 3: Reranking & Context Optimization

**Purpose**: You retrieved 50 documents. Now pick the best 5 for the LLM.

### 3.1 Fusion & Reranking

| Challenge | Slug | Difficulty | Description |
|-----------|------|------------|-------------|
| Reranking Cascade | `rerank-cascade` | Medium | Implement cheap shortlist → expensive cross-encoder cascade |
| MMR Diversity | `mmr-diversity` | Hard | Select diverse context using Maximal Marginal Relevance |
| Exact De-duplication | `exact-dedup` | Medium | Remove duplicate chunks using content hashes |
| Autocut Threshold | `autocut-threshold` | Medium | Detect significant similarity drops to cut off results |

### 3.2 Context Construction

| Challenge | Slug | Difficulty | Description |
|-----------|------|------------|-------------|
| Token Budget Packing | `token-budget-packing` | Hard | Select chunks that fit exactly into token budget (Knapsack) |
| Lost-in-Middle Ordering | `lost-in-the-middle-ordering` | Medium | Reorder chunks so most relevant are at start and end |
| Extractive Compression | `extractive-compression` | Medium | Keep only sentences relevant to the query |

### 3.3 LLM-Powered Reranking

| Challenge | Slug | Difficulty | Description |
|-----------|------|------------|-------------|
| LLM-as-a-Reranker | `llm-reranker` | Hard | Use LLM to rerank results for complex reasoning queries |
| LLM Context Compression | `contextual-compression-llm` | Hard | Summarize retrieved chunks before passing to generator |

**Key Concepts**: Cascade retrieval, diversity, context window management, attention optimization

---

## Phase 4: Advanced Systems & Agents

**Purpose**: Move from static chains to dynamic cognitive architectures.

| Challenge | Slug | Difficulty | Description |
|-----------|------|------------|-------------|
| Tool Use Basics | `tool-use-basics` | Medium | Build router that decides between search, calculator, or direct answer |
| ReAct Implementation | `react-implementation` | Hard | Implement Thought → Action → Observation loop |
| Self-Correction Loop | `self-correction-loop` | Hard | Check if generated answer is supported by retrieved context |
| Parent Document Retrieval | `parent-document-tokenizer` | Medium | Retrieve small chunks but feed parent window to LLM |
| Recursive Retrieval | `recursive-retrieval` | Hard | Embed summaries for high-level search, then map to granular chunks |

**Key Concepts**: Agentic reasoning, tool use, self-reflection, hierarchical retrieval

---

## Phase 5: Production Engineering & Security

**Purpose**: Making RAG safe, fast, and measurable.

### 5.1 Security & Safety

| Challenge | Slug | Difficulty | Description |
|-----------|------|------------|-------------|
| Prompt Template | `prompt-template` | Medium | Build grounded RAG prompt with citation rules |
| Metadata Filtering | `metadata-filtering` | Medium | Enforce tenant/document filters before scoring |
| ACL Filter Enforcement | `acl-filter-enforcement` | Easy | Enforce role-based access control at retrieval time |
| Prompt Injection Sanitizer | `prompt-injection-sanitizer` | Hard | Detect and strip prompt injection instructions |
| PII Redaction | `pii-redaction` | Medium | Redact emails, phones, SSN before LLM processing |
| Citation Range Validator | `citation-range-validator` | Easy | Validate that citations refer to provided sources only |
| Refusal Policy | `refusal-policy` | Medium | Decide when to answer vs refuse based on evidence strength |

### 5.2 Evaluation

| Challenge | Slug | Difficulty | Description |
|-----------|------|------------|-------------|
| Retrieval Metrics | `retrieval-metrics` | Medium | Implement Recall@K, MRR, nDCG |
| Train-Only Retrieval Guard | `train-only-retrieval-guard` | Medium | Build train-only index and enforce guards |

### 5.3 Caching & Performance

| Challenge | Slug | Difficulty | Description |
|-----------|------|------------|-------------|
| Embedding Cache | `embedding-cache` | Medium | Cache embeddings keyed by model + text hash |
| Retrieval Cache Key | `retrieval-cache-key` | Medium | Design deterministic cache key for retrieval results |
| Query Routing | `route-by-difficulty` | Medium | Route queries to fast/standard/slow paths |

### 5.4 Production Operations

| Challenge | Slug | Difficulty | Description |
|-----------|------|------------|-------------|
| Rate Limiter (Token Bucket) | `rate-limiter` | Medium | Protect RAG endpoint from abuse |
| Audit Logger | `audit-logger` | Medium | Log every query and response for compliance |
| Source Fingerprinting (GDPR) | `source-fingerprint` | Medium | Track chunk sources for targeted deletion |

**Key Concepts**: Security, observability, compliance, cost optimization

---

## Phase 9: Frontier & Advanced Architectures (2025)

**Purpose**: Master cutting-edge research techniques from latest papers.

| Challenge | Slug | Difficulty | Description |
|-----------|------|------------|-------------|
| MiA-RAG (Mindscape-Aware) | `mia-rag-mindscape` | Hard | Build global semantic representation before retrieval |
| QuCo-RAG (Uncertainty) | `quco-rag-uncertainty` | Hard | Corpus statistics-based retrieval triggering |
| HGMEM (Hypergraph Memory) | `hypergraph-memory-rag` | Hard | Hypergraph memory for multi-step reasoning |
| HiFi-RAG (Filtering) | `hifi-rag-filtering` | Hard | Hierarchical content filtering for precision |
| Bidirectional RAG | `bidirectional-rag` | Hard | Self-improving RAG with validation and writeback |
| RAGPart & RAGMask | `ragpart-ragmask-defense` | Hard | Defense against corpus poisoning attacks |

**Key Concepts**: 2025 SOTA techniques, long-context understanding, self-improving systems

---

## Phase 10: Multimodal & Domain RAG

**Purpose**: Handle tables, images, video, and specialized domains.

| Challenge | Slug | Difficulty | Description |
|-----------|------|------------|-------------|
| TV-RAG (Video) | `tv-rag-video` | Hard | Temporal-aware RAG for video content |
| MEGA-RAG (Biomedical) | `mega-rag-biomedical` | Hard | Multi-source evidence retrieval for medical domains |
| AffordanceRAG (Robotics) | `affordance-rag-robotics` | Hard | Affordance-aware retrieval for manipulation |
| Graph-O1 (Agentic) | `graph-o1-reasoning` | Hard | MCTS for graph-based reasoning |
| Hybrid RAG (Multilingual) | `hybrid-rag-multilingual` | Hard | Multilingual and noisy document QA |
| Table-to-Markdown Parser | `table-parsing` | Medium | Convert tables to Markdown for indexing |
| Multi-Modal Retrieval (CLIP) | `multimodal-retrieval` | Hard | Find relevant images for text query |
| JSON/API Response Parser | `json-schema-parser` | Medium | Flatten nested JSON for search |
| PDF Layout Detection | `pdf-layout-detector` | Medium | Classify text blocks by formatting |
| Audio Transcript Chunking | `audio-transcript-chunking` | Medium | Chunk by speaker turns/timestamps |

---

## Phase 11: Fine-Tuning & Adaptation

| Challenge | Slug | Difficulty | Description |
|-----------|------|------------|-------------|
| Synthetic Data Generation | `synthetic-data-gen` | Hard | Generate (Q, A, C) triplets from raw text |
| RLHF/SFT Dataset Formatting | `dataset-tokenization` | Medium | Format data into ChatML/Alpaca templates |
| Ranker Distillation | `ranker-distillation` | Hard | Train Student to match Teacher rankings |
| Embedding Model Fine-Tuning | `embedding-finetuning` | Hard | Implement contrastive loss for domain embeddings |
| LoRA Adapter Architecture | `lora-adapter` | Hard | Implement LoRA computation for efficient tuning |
| Evaluation Dataset Curator | `eval-dataset-curator` | Medium | Design diverse evaluation sets |

**Key Concepts**: Multimodal embeddings, domain-specific RAG, fine-tuning

---

## Sagas (Core Learning Paths)

Sagas are high-continuity paths where you implement a single system across multiple challenges.

### Vector DB Saga (`vectorDbSaga.ts`)

**Goal**: Build a high-performance vector database from scratch

**Path**:
1. DenseVector → FlatIndex → IVF (Clustering) → HNSW (Graphs)

**Outcome**: Understand how Pinecone, Milvus, Weaviate work under the hood

### RAG Pipeline Saga (`ragPipelineSaga.ts`)

**Goal**: Construct an end-to-end RAG architecture

**Path**: Chunker → Embedder → Retriever → Generator

**Outcome**: Working "Toy" RAG system simulating full query lifecycle

### Reranker Saga (`rerankerSaga.ts`)

**Goal**: Implement production-grade reranking cascade

**Path**: MockCrossEncoder → CascadeReranker

**Outcome**: Learn precision vs latency trade-offs

### Evaluator Saga (`evaluatorSaga.ts`)

**Goal**: Build quantitative evaluation suite

**Path**: Recall@K → MRR → nDCG

**Outcome**: Master metrics that separate toy apps from production systems

---

## Arena Challenges

**Purpose**: Benchmark your implementations against real-world datasets

| Challenge | Slug | Description |
|-----------|------|-------------|
| Tech Support Arena | `arena-tech-support` | Benchmark retrieval on tech support dataset |
| Arena Evaluation | `arena-evaluation` | Full arena evaluation with leaderboards |

**Key Feature**: Select challenges have `benchmark: true` flag - measure latency and recall on `TECH_SUPPORT_DATASET`

---

## Live Projects

**Purpose**: Real-world end-to-end RAG implementations

| Project | Slug | Description |
|---------|------|-------------|
| Live Project 1 | `live-project-1` | Full RAG pipeline implementation |
| Live Project 2 | `live-project-2` | Advanced RAG with multiple techniques |

---

## Additional Challenge Collections

### Chunking Masterclass (`chunkingMasterclass.ts`)
Advanced chunking strategies including Late Chunking implementation

### Advanced Chunking (`advancedChunking.ts`)
Specialized chunking techniques for various document types

### Query Understanding (`queryUnderstanding.ts`)
Deep dive into query parsing and intent classification

### Enhanced Challenges (`enhancedChallenges.ts`)
Enhanced versions of core challenges with additional complexity
- Vector Normalization (L2 Norm)
- Sparse Vector (Bag of Words)
- Batched Dot Product
- Semantic Routing
- And more...

### Enhanced Advanced (`enhancedAdvanced.ts`)
Advanced enhancements for experienced learners

### Enhanced Advanced (Specialized) (`enhancedAdvanced.ts`)
More advanced specialized challenges

### Long Term Roadmap (`longTermRoadmap.ts`)
Future-facing challenges and techniques

### Security (`security.ts`)
Dedicated security-focused challenges
- PII Redaction
- Prompt Injection Sanitizer
- ACL Filter Enforcement

### Benchmarking (`benchmarking.ts`)
Performance benchmarking challenges

### Tier 3 Advanced (`tier3Advanced.ts`)
Advanced tier challenges

### Tier 3B Specialized (`tier3bSpecialized.ts`)
Specialized domain challenges

### Tier 3C Specialized (`tier3cSpecialized.ts`)
More specialized domain challenges

### Tier 3D Multimodal (`tier3dMultimodalTesting.ts`)
Multimodal testing challenges

### TypeScript Challenges (`typescript.ts`)
TypeScript implementation challenges

### Vinija Inspired (`vinijaInspired.ts`)
Challenges inspired by Vinija's teaching style

### Advanced Retrieval (`advancedRetrieval.ts`)
- Parent Document Retrieval
- Recursive Retrieval (Summary → Chunk)

---

## Tier 3 & Specialized Challenges

### Tier 3 Advanced (`tier3Advanced.ts`)

| Challenge | Slug | Difficulty | Description |
|-----------|------|------------|-------------|
| WebSocket Streaming RAG | `websocket-streaming-rag` | Hard | Real-time streaming responses |
| Server-Sent Events RAG | `sse-streaming-rag` | Hard | SSE-based streaming |
| Pagination RAG | `paginated-retrieval` | Hard | Handle large result sets |
| Cursor-based Pagination | `cursor-pagination` | Hard | Efficient pagination |
| Time-Weighted Retrieval | `time-weighted-retrieval` | Medium | Recency boosting |
| Learning to Rank | `learning-to-rank` | Hard | ML-based ranking |

### Tier 3B Specialized (`tier3bSpecialized.ts`)

| Challenge | Slug | Difficulty | Description |
|-----------|------|------------|-------------|
| Code Search RAG | `code-search-rag` | Hard | Semantic code search |
| Math-aware Retrieval | `math-retrieval` | Hard | Formula-aware search |
| Chemical RAG | `chemical-rag` | Hard | Chemistry domain retrieval |

### Tier 3C Specialized (`tier3cSpecialized.ts`)

| Challenge | Slug | Difficulty | Description |
|-----------|------|------------|-------------|
| Healthcare RAG | `healthcare-rag` | Hard | Medical domain RAG |
| Legal RAG | `legal-rag` | Hard | Legal document RAG |
| Financial RAG | `financial-rag` | Hard | Financial data RAG |

### Tier 3D Multimodal Testing (`tier3dMultimodalTesting.ts`)

| Challenge | Slug | Difficulty | Description |
|-----------|------|------------|-------------|
| Image Alt Text RAG | `image-alt-text-rag` | Hard | Image description retrieval |
| PDF Table RAG | `pdf-table-rag` | Hard | Table extraction + search |
| Video Timestamp RAG | `video-timestamp-rag` | Hard | Video segment retrieval |

### Benchmarking (`benchmarking.ts`)

| Challenge | Slug | Difficulty | Description |
|-----------|------|------------|-------------|
| BEIR Evaluation Setup | `beir-evaluation-setup` | Medium | Standard IR benchmarking |
| Recall@K Measurement | `recall-at-k` | Medium | Recall metric |
| Precision@K Measurement | `precision-at-k` | Medium | Precision metric |
| MRR Measurement | `mrr-measurement` | Medium | Mean reciprocal rank |
| nDCG Measurement | `ndcg-measurement` | Medium | Normalized DCG |
| Latency Benchmarking | `latency-benchmark` | Medium | Performance measurement |
| Throughput Benchmarking | `throughput-benchmark` | Medium | Query throughput |

### Security (`security.ts`)

| Challenge | Slug | Difficulty | Description |
|-----------|------|------------|-------------|
| PII Detection | `pii-detection` | Medium | Detect personal info |
| Prompt Injection Detection | `injection-detection` | Hard | Find injection attempts |
| Output Filtering | `output-filtering` | Medium | Filter sensitive outputs |
| Rate Limiting | `rate-limiting` | Medium | Prevent abuse |

### Long Term Roadmap (`longTermRoadmap.ts`)

| Challenge | Slug | Difficulty | Description |
|-----------|------|------------|-------------|
| Federated RAG | `federated-rag` | Hard | Cross-org retrieval |
| On-device RAG | `ondevice-rag` | Hard | Mobile/edge RAG |
| Privacy-preserving RAG | `privacy-rag` | Hard | Secure retrieval |

### Enhanced Advanced (`enhancedAdvanced.ts`)

| Challenge | Slug | Difficulty | Description |
|-----------|------|------------|-------------|
| Hybrid Search Advanced | `hybrid-search-advanced` | Hard | Advanced hybrid patterns |
| Query Expansion Advanced | `query-expansion-advanced` | Hard | ML-based expansion |
| Reranking Advanced | `reranking-advanced` | Hard | Cross-encoder tuning |

### Live Projects (`liveProjects.ts`)

| Project | Slug | Description |
|---------|------|-------------|
| End-to-End RAG | `live-project-1` | Full production RAG pipeline |
| Agentic RAG | `live-project-2` | RAG with agents |

### Arena Challenges (`arena.ts`)

| Challenge | Slug | Description |
|-----------|------|-------------|
| Tech Support Arena | `arena-tech-support` | Benchmark on tech support |
| Leaderboard | `arena-leaderboard` | Rankings and scores |

---

## Datasets Available

| Dataset | Variable | Description |
|---------|----------|-------------|
| Tech Support | `TECH_SUPPORT_DATASET` | Technical support documents and queries for benchmarking |
| Financial | `FINANCIAL_DATASET` | Financial documents for domain-specific testing |
| Ecommerce | `ECOMMERCE_DATASET` | E-commerce product data |
| Research | `RESEARCH_DATASET` | Research paper abstracts |
| Medical | `MEDICAL_DATASET` | Medical literature |
| Legal | `LEGAL_DATASET` | Legal documents |
| Codebase | `CODEBASE_DATASET` | Source code for code search |

---

## Learning Paths & Recommendations

### 🚀 Fast Track (2 weeks)
Phases 0, 1, 2, 3, 5 → Core RAG competency

### 📚 Complete Mastery (8 weeks)
All Phases → Senior AI Engineer level

### 🎯 Interview Prep (1 week)
Phase 5 (Evaluation) + Playbook → PM/AI Engineer interviews

---

## Key Metrics & Rewards

| Metric | Description |
|--------|-------------|
| XP Reward | Points earned for completing challenges |
| Difficulty | Easy (25-50 XP), Medium (50-100 XP), Hard (125-225 XP) |
| Time Estimate | Typical completion time per challenge |

---

## Related Documentation

- `RAG_MASTERY_ROADMAP.md` - Complete roadmap with 242+ challenges
- `src/lib/challenges/LEARNING_STRUCTURE.md` - Pedagogy and saga descriptions
- `src/lib/curriculum/stages.ts` - Stage definitions and labels
- `src/lib/challenges/types.ts` - Challenge type definitions
- `src/lib/challenges/catalog.ts` - Challenge catalog access
- `docs/CONTENT_GAPS_2025.md` - Content gaps and planned improvements

---

## Content Gaps & Future Improvements

See `docs/CONTENT_GAPS_2025.md` for detailed analysis of:

### Priority Additions

| Priority | Area | Description |
|----------|------|-------------|
| P0 | Missing 2024-2025 Papers | REPLUG, Gemini patterns, GRIT, Instructor embeddings |
| P1 | Production Patterns | Query routing, advanced semantic caching, guardrails |
| P2 | Enterprise | Multi-tenancy, RBAC, compliance, cost allocation |
| P3 | Emerging | Video RAG, Audio RAG, Real-time RAG, Federated RAG |

### Planned Challenges

- `query-router` - Route queries to appropriate RAG pipeline
- `semantic-cache-advanced` - Build cache with similarity threshold
- `guardrails-input/output` - Validate and filter RAG inputs/outputs
- `rag-regression-test` - Build retrieval regression suite
- `cost-aware-routing` - Route based on query complexity
- `streaming-citations` - Stream answers with inline citations
- `multi-tenant-rag` - Implement tenant isolation

### Planned Lessons

- `agentic-rag-patterns.mdx` - When to add agents to RAG
- `mcp-integration-guide.mdx` - Model Context Protocol for RAG
- `voice-rag-overview.mdx` - Audio/voice RAG systems
- `rag-vs-long-context.mdx` - When to skip RAG

---

## Dataset Reference

### Challenge Datasets

| Dataset Name | Source File | Purpose |
|--------------|-------------|---------|
| TECH_SUPPORT_DATASET | `src/lib/challenges/datasets/techSupport.ts` | Primary benchmarking dataset |
| FINANCIAL_DATASET | `src/lib/challenges/datasets/financial.ts` | Financial domain testing |
| ECOMMERCE_DATASET | `src/lib/challenges/datasets/ecommerce.ts` | E-commerce testing |
| RESEARCH_DATASET | `src/lib/challenges/datasets/research.ts` | Academic paper retrieval |
| MEDICAL_DATASET | `src/lib/challenges/datasets/medical.ts` | Medical literature |
| LEGAL_DATASET | `src/lib/challenges/datasets/legal.ts` | Legal document retrieval |
| CODEBASE_DATASET | `src/lib/challenges/datasets/codebase.ts` | Code search retrieval |

---

## Lessons (Theory Content)

Lessons are MDX files located in `content/lessons/<phase>/<slug>.mdx`

### Phase 0: Foundations

| Lesson | File | Description |
|--------|------|-------------|
| Welcome to RAG Academy | `phase-0/welcome-to-rag-academy.mdx` | Introduction to the platform |
| Why RAG Exists | `phase-0/why-rag-exists.mdx` | Motivation for RAG |
| Embedding Fundamentals | `phase-0/embedding-fundamentals.mdx` | How embeddings work |
| Tokenizers and Context | `phase-0/tokenizers-and-context.mdx` | Understanding tokenization |
| RAG vs Fine-tuning | `phase-0/rag-vs-finetuning.mdx` | When to use each approach |
| Chunking 101 | `phase-0/chunking-101.mdx` | Basic chunking strategies |
| Your First RAG | `phase-0/your-first-rag.mdx` | Hands-on introduction |

### Phase 1: Data Layer

| Lesson | File | Description |
|--------|------|-------------|
| Query Transforms | `phase-1/query-transforms.mdx` | Query modification techniques |
| Context Shaping | `phase-1/context-shaping.mdx` | Optimizing context for LLM |
| Grounding & Safety | `phase-1/grounding-safety.mdx` | Ensuring factual accuracy |
| Evaluation Basics | `phase-1/evaluation-basics.mdx` | Measuring RAG performance |
| RAG Data Sizing | `phase-1/rag-data-sizing.mdx` | How much data is needed |
| RAG vs Long Context | `phase-1/rag-vs-long-context.mdx` | Comparing approaches |

### Phase 2: Retrieval

| Lesson | File | Description |
|--------|------|-------------|
| Hybrid Retrieval | `phase-2/hybrid-retrieval.mdx` | Combining sparse and dense |
| Metadata Filtering | `phase-2/metadata-filtering.mdx` | Filtering by metadata |
| Query Transform Patterns | `phase-2/query-transform-patterns.mdx` | Advanced query transforms |
| Caching Strategies | `phase-2/caching-strategies.mdx` | Performance optimization |
| Context Window Optimization | `phase-2/context-window-optimization.mdx` | Maximizing context usage |
| Cost Optimization | `phase-2/cost-optimization.mdx` | Reducing RAG costs |
| Native RAG APIs | `phase-2/native-rag-apis.mdx` | Platform-specific RAG |
| Sentence Window Retrieval | `phase-2/sentence-window-retrieval.mdx` | Sentence-level retrieval |
| Auto-Merging Retrieval | `phase-2/auto-merging-retrieval.mdx` | Dynamic chunk merging |
| Semantic Chunking | `phase-2/semantic-chunking.mdx` | AI-driven chunking |
| Late Chunking | `phase-2/late-chunking.mdx` | Context-preserving chunking |
| Reranking Strategies | `phase-2/reranking-strategies.mdx` | Improving retrieval quality |
| Chunking Mastery | `phase-2/chunking-mastery.mdx` | Comprehensive chunking guide |

### Phase 3: Reranking & Context

| Lesson | File | Description |
|--------|------|-------------|
| HyDE | `phase-3/hyde.mdx` | Hypothetical document embeddings |
| Self-RAG | `phase-3/self-rag.mdx` | Self-reflective RAG |
| Adaptive RAG | `phase-3/adaptive-rag.mdx` | Dynamic retrieval strategies |
| RAG Fusion | `phase-3/rag-fusion-advanced.mdx` | Advanced fusion techniques |
| FLARE | `phase-3/flare.mdx` | Active retrieval |
| Speculative RAG | `phase-3/speculative-rag.mdx` | Draft and verify |
| RAPTOR Retrieval | `phase-3/raptor-retrieval.mdx` | Tree-based retrieval |
| Graph RAG | `phase-3/graph-rag.mdx` | Knowledge graph integration |
| Multi-turn RAG | `phase-3/multi-turn-rag.mdx` | Conversational RAG |
| Personalized RAG | `phase-3/personalized-rag.mdx` | User-specific retrieval |
| Reasoning RAG | `phase-3/reasoning-rag.mdx` | Chain-of-thought in RAG |
| RichRAG | `phase-3/richrag-multi-faceted.mdx` | Multi-faceted retrieval |
| RAFT | `phase-3/raft-domain-adaptation.mdx` | Domain-specific RAG |
| Corrective RAG | `phase-3/corrective-rag.mdx` | Self-correcting RAG |
| Modular RAG | `phase-3/modular-rag-architecture.mdx` | Composable architecture |

### Phase 4: Knowledge Graphs

| Lesson | File | Description |
|--------|------|-------------|
| Knowledge Graphs Intro | `phase-4/knowledge-graphs-intro.mdx` | Graph fundamentals |
| GraphRAG Implementation | `phase-4/graphrag-implementation.mdx` | Building Graph RAG |
| Graph Queries | `phase-4/graph-queries.mdx` | Querying knowledge graphs |
| Multimodal RAG | `phase-4/multimodal-rag.mdx` | Beyond text |

### Phase 5: Agents

| Lesson | File | Description |
|--------|------|-------------|
| Agentic RAG Intro | `phase-5/agentic-rag-intro.mdx` | Agents + RAG |
| ReAct Agents | `phase-5/react-agents.mdx` | Reasoning + Acting |
| Plan and Execute | `phase-5/plan-and-execute.mdx` | Two-stage agents |
| Agent Memory | `phase-5/agent-memory.mdx` | Memory in agents |
| Multi-Agent Systems | `phase-5/multi-agent-systems.mdx` | Agent collaboration |
| MCP Integration | `phase-5/mcp-integration.mdx` | Model Context Protocol |

### Phase 6: Production

| Lesson | File | Description |
|--------|------|-------------|
| Scaling RAG | `phase-6/scaling-rag.mdx` | Horizontal scaling |
| Evaluation in Production | `phase-6/evaluation-in-production.mdx` | Production metrics |
| Observability | `phase-6/observability.mdx` | Monitoring RAG |
| Debugging RAG Systems | `phase-6/debugging-rag-systems.mdx` | Troubleshooting |
| Security Hardening | `phase-6/security-hardening.mdx` | Protecting RAG |
| Deployment Checklist | `phase-6/deployment-checklist.mdx` | Go-live checklist |
| Measuring RAG Success | `phase-6/measuring-rag-success.mdx` | Business metrics |
| Power of Noise | `phase-6/power-of-noise.mdx` | Handling noisy data |
| Seven Failure Points | `phase-6/seven-failure-points.mdx` | Common RAG failures |

### Phase 7: Advanced Topics

| Lesson | File | Description |
|--------|------|-------------|
| Long Context vs RAG | `phase-7/long-context-vs-rag.mdx` | Choosing the right approach |
| RAG Evaluation Frontier | `phase-7/rag-evaluation-frontier.mdx` | Cutting-edge evaluation |
| Late 2025 Techniques | `phase-7/late-2025-techniques.mdx` | Emerging techniques |
| Compound AI Systems | `phase-7/compound-ai-systems.mdx` | Multi-component systems |
| External Project Gallery | `phase-7/external-project-gallery.mdx` | Real-world examples |
| Realtime RAG | `phase-7/realtime-rag.mdx` | Streaming and real-time |
| Power of Noise | `phase-7/power-of-noise.mdx` | Noisy data handling |

---

## Playbooks (Quick Reference)

Playbooks are reference guides located in `content/playbooks/<name>.mdx`

| Playbook | Description |
|----------|-------------|
| `rag-techniques-encyclopedia.mdx` | Comprehensive RAG techniques |
| `rag-formulas-cheatsheet.mdx` | Key formulas and calculations |
| `quick-reference-cards.mdx` | Quick reference cards |
| `tool-comparison-matrix.mdx` | Comparing RAG tools |
| `rag-troubleshooting-guide.mdx` | Common issues and fixes |
| `production-deployment-checklist.mdx` | Deployment checklist |
| `rag-evaluation-suite.mdx` | Evaluation frameworks |
| `prompt-templates.mdx` | Production prompt templates |
| `chunking-strategies.mdx` | Chunking reference |
| `document-parsing-guide.mdx` | Document processing |
| `embedding-model-selection.mdx` | Choosing embeddings |
| `learning-paths.mdx` | Learning recommendations |
| `multi-tenant-architecture.mdx` | Multi-tenant RAG |
| `production-rag-blueprint.mdx` | Architecture blueprint |
| `rag-performance-benchmarks.mdx` | Performance benchmarks |
| `rag-observability-guide.mdx` | Monitoring guide |
| `rag-cost-calculator.mdx` | Cost estimation |
| `rag-interview-playbook.mdx` | Interview prep |
| `rag-interview-questions.mdx` | Common questions |
| `interview-prep-questions.mdx` | More interview questions |
| `capstone-projects.mdx` | Final projects |
| `knowledge-checks.mdx` | Self-assessment |
| `dynamic-data-sources.mdx` | Dynamic data handling |
| `rag-cheat-sheet.mdx` | Quick cheat sheet |

---

## Phase Reference by Curriculum Stage

| Curriculum Stage ID | Phase(s) | Focus |
|---------------------|----------|-------|
| `foundations` | Phase 0 | Vector math, tokenization |
| `pre-retrieval` | Phase 1 | Chunking, indexing, deduplication |
| `retrieval` | Phase 2 | Basic retrieval, BM25, hybrid |
| `query-transforms` | Phase 2 | Query expansion, rewriting |
| `advanced-retrieval` | Phase 2-3 | Parent doc, recursive retrieval |
| `post-retrieval` | Phase 3 | Reranking, context optimization |
| `grounding-safety` | Phase 4-5 | Prompt templates, PII, ACL |
| `agentic-rag` | Phase 4 | Tool use, ReAct, self-correction |
| `graph-rag` | Phase 11 | Knowledge graphs, multi-hop |
| `multimodal` | Phase 6, 10 | Tables, images, video |
| `fine-tuning` | Phase 10 | Embedding fine-tuning, LoRA |
| `production-ops` | Phase 5 | Caching, rate limiting, audit |
| `evaluation-ops` | Phase 5, 12 | Metrics, LLM-as-judge |
| `frontier` | Phase 9 | 2025 SOTA techniques |
| `capstone-projects` | - | Live projects |
| `arena` | - | Benchmark challenges |

---

## Challenge Types Reference

| Type | Description | File Location |
|------|-------------|---------------|
| RawChallenge | Core challenge definition | `src/lib/challenges/types.ts` |
| Challenge Catalog | All challenges aggregation | `src/lib/challenges/defs/all.ts` |
| Benchmark Challenge | Performance testing | `benchmark: true` flag |
| Saga Challenge | Multi-part learning path | Saga-specific files |

---

## Technical Architecture

### Frontend Stack
- **Framework**: Next.js 14+ (App Router)
- **UI Components**: React + TypeScript
- **Editor**: Monaco Editor (code editor)
- **Execution**: Pyodide (WebAssembly Python)
- **Styling**: Tailwind CSS

### Key Files
| File | Purpose |
|------|---------|
| `src/lib/challenges/catalog.ts` | Challenge catalog access |
| `src/lib/challenges/defs/all.ts` | All challenge definitions |
| `src/lib/challenges/types.ts` | Type definitions |
| `src/components/challenge/ChallengeIDE.tsx` | Challenge UI |
| `src/components/challenge/CodeEditor.tsx` | Monaco wrapper |
| `public/workers/pyodide-worker.js` | Python execution worker |
| `src/lib/pyodide/executor.ts` | Pyodide client |
| `src/lib/lessons/fs.ts` | Lessons loader |
| `src/components/learn/MDXRenderer.tsx` | MDX renderer |

### Content Structure
- **Lessons**: `content/lessons/<phase>/<slug>.mdx`
- **Playbooks**: `content/playbooks/<name>.mdx`
- **Challenges**: `src/lib/challenges/defs/<category>.ts`

---

## Learning Path Recommendations

### 🚀 Fast Track (2 weeks)
1. Phase 0: Foundations (all challenges)
2. Phase 1: Data Layer (chunking basics)
3. Phase 2: Retrieval (BM25, hybrid)
4. Phase 3: Reranking (cascade, MMR)
5. Phase 5: Production basics (metrics, caching)

### 📚 Complete Mastery (8 weeks)
All phases including:
- Agentic RAG
- Graph RAG
- Multimodal RAG
- Fine-tuning
- Advanced 2025 techniques

### 🎯 Interview Prep (1 week)
- Phase 5: Evaluation challenges
- Phase 12: RAG Triad
- Playbook: `rag-interview-playbook.mdx`
- Playbook: `rag-evaluation-suite.mdx`

---

## Quick Start

```bash
# Install dependencies
npm install

# Create .env.local with Supabase credentials
cp .env.example .env.local

# Run development server
npm run dev
```

Open `http://localhost:3000` to access the platform.

---

## Contributing

To add new challenges:
1. Add challenge definition to `src/lib/challenges/defs/<category>.ts`
2. Import in `src/lib/challenges/defs/all.ts`
3. Add to appropriate phase in curriculum

To add lessons:
1. Create MDX file in `content/lessons/<phase>/<slug>.mdx`
2. Add frontmatter with title, description, order

---

*Last Updated: February 2026*
*Total Challenges: 230+*
*Total Lessons: 70+*
*Total Playbooks: 25+*
*Documentation Version: 1.3*
