# The RAG Engineer's Handbook: "LeetCode for RAG"

This roadmap is designed as a **coding-first curriculum**. Instead of just reading theory, you will **implement every component from scratch** to truly master the Retrieval-Augmented Generation stack.

Each section below corresponds to a specific coding challenge or set of challenges in the RAG Academy platform.

---

### **Phase 0: Vector Math & Foundations**

_Before building RAG, you must understand the math of high-dimensional spaces._

- **[Challenge 0.1]: The Dot Product**
  - **Task**: Implement `dot_product(vec_a, vec_b)` from scratch.
  - **Concept**: The fundamental operation of similarity.
  - **File**: `challenges/dot-product.mdx`
- **[Challenge 0.2]: Cosine Similarity**
  - **Task**: Implement `cosine_similarity(vec_a, vec_b)` handling normalization.
  - **Concept**: Measuring orientation vs. magnitude.
  - **File**: `challenges/cosine-similarity.mdx`
- **[Challenge 0.3]: Euclidean Distance**
  - **Task**: Implement L2 distance for geometric proximity.
  - **Concept**: Spatial distance in vector space.
  - **File**: `challenges/euclidean-distance.mdx`
- **[Challenge 0.4]: Build a Tokenizer**
  - **Task**: Create a basic tokenizer that splits text and counts tokens.
  - **Concept**: How LLMs "see" text.
  - **File**: `challenges/tokenizer-basics.mdx`
- **[Challenge 0.5]: Vector Normalization** ⭐ _NEW_
  - **Task**: Normalize vectors to unit length (L2 norm).
  - **Concept**: Required for consistent similarity when mixing embedding sources.
  - **File**: `challenges/vector-normalization.mdx`
- **[Challenge 0.6]: Sparse Vectors (Bag of Words)** ⭐ _NEW_
  - **Task**: Create BOW representations for hybrid search.
  - **Concept**: Foundation of BM25 and exact keyword matching.
  - **File**: `challenges/sparse-vector-bow.mdx`
- **[Challenge 0.7]: Batched Dot Product** ⭐ _NEW_
  - **Task**: Compute similarity scores for multiple documents efficiently.
  - **Concept**: The mental model behind GPU-accelerated search.
  - **File**: `challenges/batch-dot-product.mdx`

---

### **Phase 1: The Data Layer (Ingestion & Indexing)**

_Garbage in, garbage out. Learn to parse, chunk, and index data efficiently._

#### **1.1 Chunking Strategies**

- **[Challenge 1.1]: Simple & Overlap Chunking**
  - **Task**: Split text by character count with sliding windows.
  - **Concept**: Preserving context at boundaries.
  - **File**: `challenges/overlap-chunking.mdx`
- **[Challenge 1.2]: Semantic / Markdown Chunking**
  - **Task**: Parse Markdown boundaries to chunk by logical sections.
  - **Concept**: Layout-aware parsing.
  - **File**: `challenges/markdown-header-chunking.mdx`
- **[Challenge 1.3]: Parent Document Retrieval**
  - **Task**: Index small chunks but return their large parent context.
  - **Concept**: Decoupling retrieval content from generation context.
  - **File**: `challenges/parent-document-tokenizer.mdx`
- **[Challenge 1.4]: Proposition Chunking**
  - **Task**: Break text into atomic factual propositions.
  - **Concept**: High-precision fact retrieval.
  - **File**: `challenges/proposition-chunking.mdx`
- **[Challenge 1.5]: Contextual Chunk Headers**
  - **Task**: Prepend doc-level context to every chunk.
  - **Concept**: Preventing keyword drift.
  - **File**: `challenges/contextual-chunk-headers.mdx`
- **[Challenge 1.6]: Late Chunking**
  - **Task**: Embed whole docs before splitting into chunks.
  - **Concept**: Preserving long-range semantic dependencies.
  - **File**: `challenges/late-chunking.mdx`
- **[Challenge 1.7]: Sentence-based Chunking** ⭐ _NEW_
  - **Task**: Chunk text by sentences instead of characters.
  - **Concept**: Preserving complete thoughts for better embeddings.
  - **File**: `challenges/sentence-chunking.mdx`
- **[Challenge 1.8]: Recursive Character Splitter** ⭐ _NEW_
  - **Task**: Implement the LangChain-default recursive splitting strategy.
  - **Concept**: Adaptive chunking that works for any document type.
  - **File**: `challenges/recursive-splitter.mdx`

#### **1.2 Data Hygiene & Deduplication**

- **[Challenge 1.4]: Exact Deduplication**
  - **Task**: Hash chunks to remove exact duplicates.
  - **Concept**: Index efficiency.
  - **File**: `challenges/exact-dedup.mdx`
- **[Challenge 1.5]: Near-Duplicate Detection (SimHash)**
  - **Task**: Implement SimHash or MinHash to find 99% similar docs.
  - **Concept**: Fuzzy deduplication.
  - **File**: `challenges/simhash-near-dedup.mdx`
- **[Challenge 1.10]: Stable Deterministic IDs**
  - **Task**: Generate idempotent IDs based on content hash.
  - **Concept**: Idempotency and updates.
  - **File**: `challenges/stable-chunk-ids.mdx`

#### **1.3 Vector Indexing Algorithms**

- **[Challenge 1.7]: Naive Flat Index**
  - **Task**: Implement a brute-force search (`O(N)`).
  - **Concept**: Baseline performance.
  - **File**: `challenges/naive-flat-index.mdx`
- **[Challenge 1.8]: IVF (Inverted File) Index**
  - **Task**: Implement K-Means clustering to partition the vector space.
  - **Concept**: Approximate Nearest Neighbors (ANN).
  - **File**: `challenges/ivf-flat-index.mdx`
- **[Challenge 1.9]: HNSW (Hierarchical Navigable Small World)**
  - **Task**: Build a multi-layer graph for logarithmic search time.
  - **Concept**: SOTA vector search.
  - **File**: `challenges/hnsw-index.mdx`

---

### **Phase 2: Retrieval & Query Engineering**

_Learn to interpret user intent and find the right data._

#### **2.1 Keyword & Sparse Search**

- **[Challenge 2.1]: BM25 From Scratch**
  - **Task**: Implement TF-IDF and the BM25 scoring formula.
  - **Concept**: Sparse retrieval and term frequency.
  - **File**: `challenges/bm25-from-scratch.mdx`
- **[Challenge 2.2]: Field Boosting**
  - **Task**: Weigh matches in "Title" higher than "Body".
  - **Concept**: Weighted retrieval.
  - **File**: `challenges/bm25-field-boosting.mdx`

#### **2.2 Query Transformation**

- **[Challenge 2.3]: Query Normalization**
  - **Task**: Build a pipeline to lowercase, stem, and remove stopwords.
  - **Concept**: Input sanitization.
  - **File**: `challenges/query-normalization.mdx`
- **[Challenge 2.4]: HyDE (Hypothetical Document Embeddings)**
  - **Task**: Generate a fake answer, embed it, and search.
  - **Concept**: Bridging the semantic gap.
  - **File**: `challenges/hyde-search.mdx`
- **[Challenge 2.5]: Self-Query Filters**
  - **Task**: Use an LLM to extract metadata filters (`{ "price": "<500" }`) from a query.
  - **Concept**: Structured search.
  - **File**: `challenges/self-query-filters.mdx`
- **[Challenge 2.6]: Multi-Query Expansion**
  - **Task**: Generate 3 variatons of a query and search all of them.
  - **Concept**: Improving recall.
  - **File**: `challenges/multi-query-fusion.mdx`
- **[Challenge 2.7]: Step-Back Prompting**
  - **Task**: Generate a broader, abstract version of a query.
  - **Concept**: Concept-level search.
  - **File**: `challenges/step-back-prompting.mdx`

#### **2.3 Routing**

- **[Challenge 2.8]: Semantic Routing**
  - **Task**: Classify a query as "Technical", "Sales", or "Chit-Chat" to pick a database.
  - **Concept**: Efficiency and specialization.
  - **File**: `challenges/route-by-difficulty.mdx`

#### **2.4 Quality Control** ⭐ _NEW SECTION_

- **[Challenge 2.9]: Similarity Score Threshold** ⭐ _NEW_
  - **Task**: Filter results by absolute similarity, not just top-K.
  - **Concept**: Ensures minimum quality for returned results.
  - **File**: `challenges/similarity-threshold.mdx`
- **[Challenge 2.10]: Recency Boosting** ⭐ _NEW_
  - **Task**: Boost retrieval scores based on document freshness.
  - **Concept**: Time-decay ensures the model uses the latest information.
  - **File**: `challenges/recency-boost.mdx`

---

### **Phase 3: Reranking & Context Optimization**

_You retrieved 50 documents. Now pick the best 5 for the LLM._

#### **3.1 Fusion & Reranking**

- **[Challenge 3.1]: Reciprocal Rank Fusion (RRF)**
  - **Task**: Combine results from Keyword Search and Vector Search.
  - **Concept**: Hybrid search.
  - **File**: `challenges/rrf-fusion.mdx`
- **[Challenge 3.2]: Cross-Encoder Reranking**
  - **Task**: Re-score the top 20 candidates using a BERT-based classifier.
  - **Concept**: Precision maximization.
  - **File**: `challenges/reranker-cascade.mdx`
- **[Challenge 3.3]: MMR (Maximal Marginal Relevance)**
  - **Task**: Rerank to maximize diversity (penalize similar chunks).
  - **Concept**: Removing redundancy.
  - **File**: `challenges/mmr-diversity.mdx`
- **[Challenge 3.4]: Autocut Threshold**
  - **Task**: Detect significant similarity drops to cut off search results.
  - **Concept**: Dynamic top-k selection.
  - **File**: `challenges/autocut-threshold.mdx`

#### **3.2 Context Construction**

- **[Challenge 3.4]: Token Budget Packing**
  - **Task**: Select chunks that fit exactly into 4096 tokens (Knapsack problem).
  - **Concept**: Context window management.
  - **File**: `challenges/token-budget-packing.mdx`
- **[Challenge 3.5]: "Lost in the Middle" Reordering**
  - **Task**: Reorder chunks so the most relevant are at the start and end.
  - **Concept**: Attention optimization.
  - **File**: `challenges/lost-in-the-middle-ordering.mdx`
- **[Challenge 3.6]: Extractive Compression**
  - **Task**: Use NLP to keep only relevant sentences from a chunk.
  - **Concept**: Noise reduction.
  - **File**: `challenges/extractive-compression.mdx`

#### **3.3 LLM-Powered Reranking** ⭐ _NEW SECTION_

- **[Challenge 3.7]: LLM-as-a-Reranker** ⭐ _NEW_
  - **Task**: Use an LLM to rerank results for complex reasoning queries.
  - **Concept**: Semantic reranking beyond cross-encoders.
  - **File**: `challenges/llm-reranker.mdx`
- **[Challenge 3.8]: LLM Context Compression** ⭐ _NEW_
  - **Task**: Summarize retrieved chunks before passing to the generator.
  - **Concept**: Increases effective context window by 3-5x.
  - **File**: `challenges/contextual-compression-llm.mdx`

---

### **Phase 4: Advanced Systems & Agents**

_Moving from static chains to dynamic cognitive architectures._

- **[Challenge 4.1]: Recursive Retrieval**
  - **Task**: Search summaries, then retrieve underlying chunks.
  - **Concept**: Hierarchical index.
  - **File**: `challenges/recursive-retrieval.mdx`
- **[Challenge 4.2]: React Agent Loop**
  - **Task**: Implement a `Thought -> Action -> Observation` loop.
  - **Concept**: Agentic reasoning.
  - **File**: `challenges/react-implementation.mdx`
- **[Challenge 4.3]: Tool Use Basics**
  - **Task**: Bind a "Search" function to an LLM.
  - **Concept**: Function calling.
  - **File**: `challenges/tool-use-basics.mdx`
- **[Challenge 4.4]: Self-Correction**
  - **Task**: Check if retrieval results are empty, rewrite query, try again.
  - **Concept**: Error recovery.
  - **File**: `challenges/self-correction-loop.mdx`

---

### **Phase 5: Production Engineering & Security**

_Making it safe, fast, and measurable._

#### **5.1 Security**

- **[Challenge 5.1]: PII Redaction**
  - **Task**: Detect and mask emails/phone numbers in retrieval results.
  - **Concept**: Data privacy.
  - **File**: `challenges/pii-redaction.mdx`
- **[Challenge 5.2]: Prompt Injection Validator**
  - **Task**: Detect heuristic patterns like "Ignore previous instructions".
  - **Concept**: Security guardrails.
  - **File**: `challenges/prompt-injection-sanitizer.mdx`
- **[Challenge 5.3]: ACL Enforcement**
  - **Task**: Filter search results based on UserID permissions.
  - **Concept**: Authorization.
  - **File**: `challenges/acl-filter-enforcement.mdx`

#### **5.2 Evaluation**

- **[Challenge 5.4]: Measurement (Recall@K / MRR)**
  - **Task**: Calculate retrieval quality metrics on a test set.
  - **Concept**: Quantitative evaluation.
  - **File**: `challenges/retrieval-metrics.mdx`
- **[Challenge 5.5]: Contamination Guard**
  - **Task**: Ensure test questions don't appear in the knowledge base.
  - **Concept**: Integrity testing.
  - **File**: `challenges/train-only-retrieval-guard.mdx`
- **[Challenge 5.6]: Citation Validation**
  - **Task**: Check if the LLM's generated citations `[1]` actually support the claim.
  - **Concept**: Hallucination detection.
  - **File**: `challenges/citation-range-validator.mdx`

#### **5.3 Caching**

- **[Challenge 5.7]: Semantic Cache**
  - **Task**: Cache query embeddings to serve repeated similar questions instantly.
  - **Concept**: Latency and cost reduction.
  - **File**: `challenges/embedding-cache.mdx`

#### **5.4 Production Operations** ⭐ _NEW SECTION_

- **[Challenge 5.8]: Rate Limiter (Token Bucket)** ⭐ _NEW_
  - **Task**: Protect your RAG endpoint from abuse and runaway costs.
  - **Concept**: API protection and cost control.
  - **File**: `challenges/rate-limiter.mdx`
- **[Challenge 5.9]: Audit Logger** ⭐ _NEW_
  - **Task**: Log every query and response for compliance.
  - **Concept**: SOC2/GDPR audit trails.
  - **File**: `challenges/audit-logger.mdx`
- **[Challenge 5.10]: Source Fingerprinting (GDPR)** ⭐ _NEW_
  - **Task**: Track chunk sources for targeted deletion compliance.
  - **Concept**: Right to be Forgotten without full re-index.
  - **File**: `challenges/source-fingerprint.mdx`

---

### **Phase 6: Multi-Modal & Structured RAG**

_RAG is moving beyond simple text. Learn to handle tables, images, and structured data._

- **[Challenge 6.1]: Table-to-Markdown Parser**
  - **Task**: Parse semi-structured PDF tables into clean Markdown representations.
  - **Concept**: Layout-aware retrieval.
  - **File**: `challenges/table-parsing.mdx`
- **[Challenge 6.2]: Entity extraction (Basic GraphRAG)**
  - **Task**: Extract (Subject, Predicate, Object) triples from a text corpus.
  - **Concept**: Knowledge Graph construction.
  - **File**: `challenges/entity-extraction.mdx`
- **[Challenge 6.3]: Multi-Modal Retrieval (CLIP)**
  - **Task**: Implement a retriever that finds relevant images for a text query.
  - **Concept**: Cross-modal embeddings.
  - **File**: `challenges/multimodal-retrieval.mdx`
- **[Challenge 6.4]: JSON/API Response Parser** ⭐ _NEW_
  - **Task**: Flatten nested JSON into searchable text chunks.
  - **Concept**: Structured data indexing.
  - **File**: `challenges/json-schema-parser.mdx`
- **[Challenge 6.5]: PDF Layout Detection** ⭐ _NEW_
  - **Task**: Classify text blocks by formatting (header, paragraph, caption).
  - **Concept**: Layout-aware document processing.
  - **File**: `challenges/pdf-layout-detector.mdx`
- **[Challenge 6.6]: Audio Transcript Chunking** ⭐ _NEW_
  - **Task**: Chunk transcripts by speaker turns and timestamps.
  - **Concept**: Multi-modal meeting/podcast search.
  - **File**: `challenges/audio-transcript-chunking.mdx`

---

### **Phase 7: SOTA Architectures & Agentic Memory**

_Master the absolute edge of RAG research._

- **[Challenge 7.1]: ColBERT MaxSim (Late Interaction)**
  - **Task**: Implement the MaxSim operator for token-level retrieval.
  - **Concept**: High-precision token interaction.
  - **File**: `challenges/colbert-maxsim.mdx`
- **[Challenge 7.2]: Long-term Conversational Memory**
  - **Task**: Build a memory manager that summarizes past turns to preserve context.
  - **Concept**: State management in agents.
  - **File**: `challenges/agent-long-term-memory.mdx`
- **[Challenge 7.3]: Speculative RAG (Draft & Verify)**
  - **Task**: Use a small model to draft an answer and a large model to verify/correct it.
  - **Concept**: Performance vs. Accuracy optimization.
  - **File**: `challenges/speculative-rag.mdx`
- **[Challenge 7.4]: RAPTOR Summarization Tree** ⭐ _NEW_
  - **Task**: Build a hierarchical tree with chunks as leaves and summaries as nodes.
  - **Concept**: Multi-level retrieval for broad and specific queries.
  - **File**: `challenges/raptor-tree.mdx`
- **[Challenge 7.5]: Self-RAG Retrieval Predictor** ⭐ _NEW_
  - **Task**: Decide whether to retrieve, generate from knowledge, or refuse.
  - **Concept**: Efficient RAG with adaptive retrieval.
  - **File**: `challenges/self-rag-grader.mdx`
- **[Challenge 7.6]: Corrective RAG (CRAG)** ⭐ _NEW_
  - **Task**: Grade document relevance and trigger fallbacks for bad retrievals.
  - **Concept**: Self-healing RAG pipelines.
  - **File**: `challenges/corrective-rag.mdx`

---

### **Phase 8: High-Scale Infrastructure & Compression**

_When you move from 1,000 to 1,000,000,000 vectors, you need infrastructure._

- **[Challenge 8.1]: Product Quantization (Vector Compression)**
  - **Task**: Implement a PQ compressor that reduces vector size by 10x.
  - **Concept**: Memory-efficient search.
  - **File**: `challenges/product-quantization.mdx`
- **[Challenge 8.2]: Metadata Bitmap Indexing**
  - **Task**: Implement a bitmap index for rapid metadata filtering.
  - **Concept**: Beyond list filtering.
  - **File**: `challenges/bitmap-indexing.mdx`
- **[Challenge 8.3]: Partitioned Vector Tables**
  - **Task**: Design a multi-tenant storage layer with hard partition isolation.
  - **Concept**: Enterprise security at scale.
  - **File**: `challenges/partitioned-storage.mdx`
- **[Challenge 8.4]: Index Sharding Strategy** ⭐ _NEW_
  - **Task**: Design a sharding scheme to distribute vectors across nodes.
  - **Concept**: Horizontal scaling to billions of vectors.
  - **File**: `challenges/index-sharding.mdx`
- **[Challenge 8.5]: Async Batch Embedding Processor** ⭐ _NEW_
  - **Task**: Process embeddings in batches for maximum throughput.
  - **Concept**: 100x faster ingestion with batching.
  - **File**: `challenges/async-batch-processor.mdx`
- **[Challenge 8.6]: Index Warmup / Cache Preload** ⭐ _NEW_
  - **Task**: Preload frequently-accessed vectors for low-latency search.
  - **Concept**: Eliminating cold start latency.
  - **File**: `challenges/index-warmup.mdx`

---

### **Phase 9: Strategic Operations (LLM-as-a-Judge)**

_Automate the evaluation of quality using larger LLMs._

- **[Challenge 9.1]: Faithfulness Evaluator (NLI)**
  - **Task**: Use an LLM to detect if an answer is supported by the context.
  - **Concept**: Automated hallucination detection.
  - **File**: `challenges/faithfulness-judge.mdx`
- **[Challenge 9.2]: Answer Relevance Evaluator**
  - **Task**: Grade how well the answer addresses the user's specific query.
  - **Concept**: Semantic relevance.
  - **File**: `challenges/relevance-judge.mdx`
- **[Challenge 9.3]: Cost-Aware Query Router**
  - **Task**: Build a router that picks the cheapest model capable of answering the query.
  - **Concept**: Economic optimization.
  - **File**: `challenges/cost-aware-router.mdx`
- **[Challenge 9.4]: Context Recall Evaluator** ⭐ _NEW_
  - **Task**: Measure what fraction of ground-truth facts are in retrieved context.
  - **Concept**: Completing the RAG Triad (Faithfulness + Relevance + Recall).
  - **File**: `challenges/context-recall-judge.mdx`
- **[Challenge 9.5]: Toxicity / Safety Guard** ⭐ _NEW_
  - **Task**: Detect toxic or harmful content before serving to users.
  - **Concept**: Content moderation and safety.
  - **File**: `challenges/toxicity-guard.mdx`
- **[Challenge 9.6]: Multi-Judge Consensus Voting** ⭐ _NEW_
  - **Task**: Aggregate multiple LLM judges with weighted voting.
  - **Concept**: Reducing evaluation variance through ensembling.
  - **File**: `challenges/multi-judge-consensus.mdx`

---

### **Phase 10: Fine-Tuning & Adaptation**

_When general-purpose models aren't enough, you must specialize._

- **[Challenge 10.1]: Synthetic Data Generation**
  - **Task**: Use an LLM to generate (Q, A, C) triplets from raw text.
  - **Concept**: Automating evaluation datasets.
  - **File**: `challenges/synthetic-data-gen.mdx`
- **[Challenge 10.2]: RLHF/SFT Dataset Formatting**
  - **Task**: Format raw data into ChatML/Alpaca templates for training.
  - **Concept**: Training data hygiene.
  - **File**: `challenges/dataset-tokenization.mdx`
- **[Challenge 10.3]: Ranker Distillation**
  - **Task**: Train a Student model to match a Teacher's ranking scores.
  - **Concept**: Performance vs. Cost distillation.
  - **File**: `challenges/ranker-distillation.mdx`
- **[Challenge 10.4]: Embedding Model Fine-Tuning** ⭐ _NEW_
  - **Task**: Implement contrastive loss for domain-specific embeddings.
  - **Concept**: Creating embeddings that understand 'your' data.
  - **File**: `challenges/embedding-finetuning.mdx`
- **[Challenge 10.5]: LoRA Adapter Architecture** ⭐ _NEW_
  - **Task**: Implement the core LoRA computation for efficient fine-tuning.
  - **Concept**: Train <1% of parameters for 95%+ performance.
  - **File**: `challenges/lora-adapter.mdx`
- **[Challenge 10.6]: Evaluation Dataset Curator** ⭐ _NEW_
  - **Task**: Design a diverse evaluation set with stratified sampling.
  - **Concept**: Avoiding biased metrics through representative testing.
  - **File**: `challenges/eval-dataset-curation.mdx`

---

### **Phase 11: Graph RAG & Multi-Hop Reasoning** ⭐ _NEW PHASE_

_When traditional RAG isn't enough. Learn to understand connections, not just content._

> **The Pattern:** Graph RAG excels when you need to understand **connections**, not just **content**.

#### **11.1 The Three Problems Graph RAG Solves**

| Problem                    | Traditional RAG                             | Graph RAG Solution                          |
| -------------------------- | ------------------------------------------- | ------------------------------------------- |
| **Multi-Hop Reasoning**    | Returns docs mentioning keywords separately | Traces relationship chains across entities  |
| **Thematic Synthesis**     | Retrieves similar documents                 | Identifies concept clusters across ALL docs |
| **Relationship Discovery** | "Here are docs about A and B"               | "A connects to B through X, Y, Z"           |

#### **11.2 Knowledge Graph Construction**

- **[Challenge 11.1]: Knowledge Graph Extraction** ⭐ _NEW_
  - **Task**: Extract (Subject, Predicate, Object) triples from documents.
  - **Concept**: Building the foundation for Graph RAG.
  - **File**: `challenges/knowledge-graph-extraction.mdx`
- **[Challenge 11.2]: Entity Linking & Normalization**
  - **Task**: Resolve "OpenAI", "OPEN AI", "Open AI Inc" to the same entity.
  - **Concept**: Coreference resolution for clean graphs.
  - **File**: `challenges/entity-linking.mdx`
- **[Challenge 11.3]: Community Detection (Leiden)**
  - **Task**: Apply Leiden algorithm to find topic clusters in your graph.
  - **Concept**: Thematic grouping for synthesis queries.
  - **File**: `challenges/community-detection.mdx`

#### **11.3 Graph-Augmented Retrieval**

- **[Challenge 11.4]: Graph Traversal Search**
  - **Task**: Implement BFS/DFS for relationship-based queries.
  - **Concept**: Finding paths between concepts.
  - **File**: `challenges/graph-traversal-rag.mdx`
- **[Challenge 11.5]: Multi-Hop Retrieval Chain**
  - **Task**: Chain multiple retrieval steps for complex reasoning.
  - **Concept**: Answering "what connects A to B?" questions.
  - **File**: `challenges/multi-hop-retrieval.mdx`
- **[Challenge 11.6]: Community Summarization**
  - **Task**: Generate summaries for each topic cluster at index time.
  - **Concept**: Enabling broad thematic queries.
  - **File**: `challenges/community-summarization.mdx`

#### **11.4 Hybrid Graph + Vector RAG**

- **[Challenge 11.7]: Graph-Vector Fusion**
  - **Task**: Combine graph traversal with vector similarity.
  - **Concept**: Best of both worlds - precision + semantics.
  - **File**: `challenges/graph-vector-fusion.mdx`

#### **Decision Framework: When to Use Graph RAG**

**Use Graph RAG when:**

- ✅ Multi-document synthesis needed
- ✅ Relationship mapping matters
- ✅ "How do these connect?" questions
- ✅ Knowledge graph construction required

**Continue with Traditional RAG when:**

- ⚡ Simple similarity search
- ⚡ Single-document retrieval
- ⚡ "Find documents about X" questions
- ⚡ Speed is critical (< 100ms latency)

---

### **Phase 12: RAG Evaluation & Interview Prep** ⭐ _NEW PHASE_

_Master the metrics that matter. Ace the PM and AI Engineer interviews._

> **The Formula:** RAG Success = Retrieval Quality × Generation Quality

#### **12.1 The RAG Triad**

- **[Challenge 12.1]: LLM-as-a-Judge** ⭐ _NEW_
  - **Task**: Build automated evaluation using LLM judges.
  - **Concept**: Scaling evaluation to thousands of test cases.
  - **File**: `challenges/llm-as-judge.mdx`
- **[Challenge 12.2]: Complete RAG Triad Scorer**
  - **Task**: Implement Faithfulness + Relevancy + Context Recall as one suite.
  - **Concept**: The three pillars of RAG quality.
  - **File**: `challenges/rag-triad-scorer.mdx`
- **[Challenge 12.3]: Multi-Judge Consensus**
  - **Task**: Aggregate multiple LLM judges with weighted voting.
  - **Concept**: Robustness through ensembling.
  - **File**: `challenges/multi-judge-consensus.mdx`

#### **12.2 Why Traditional Metrics Fail**

| Metric           | Why It's Deceptive in RAG                      |
| ---------------- | ---------------------------------------------- |
| Session Length   | Frustrated users also have long sessions       |
| Messages/Session | More messages = more confusion, not engagement |
| User Rating      | Doesn't identify WHERE the system failed       |

#### **12.3 First Principles Metrics**

**Retrieval Metrics:**

- **Recall@K**: Is the correct answer in top-K results?
- **Precision@K**: How much noise in top-K?
- **MRR**: How high is the first relevant result?

**Generation Metrics:**

- **Faithfulness**: Is the answer grounded in context?
- **Answer Relevancy**: Does it address the user's question?
- **Context Recall**: Did we use all relevant facts?

#### **12.4 Interview Prep Resources**

- **Playbook**: `playbooks/rag-interview-playbook.mdx` ⭐ _NEW_
- **Lesson**: `lessons/measuring-rag-success.mdx` ⭐ _NEW_
- Covers: PM interviews, system design, STAR examples

---

## 🎉 Curriculum Complete!

You have now completed the **RAG Engineer's Handbook** — the most comprehensive "LeetCode for RAG" curriculum available.

**Total Challenges**: 242+
**Phases**: 12 (Foundations → Graph RAG → Interview Prep)
**Coverage**: From dot products to Graph RAG to PM interviews

### What Sets This Curriculum Apart

| Topic               | Other Platforms | RAG Academy                              |
| ------------------- | --------------- | ---------------------------------------- |
| Vector DB Internals | ❌              | ✅ HNSW, IVF, PQ                         |
| Graph RAG           | ❌              | ✅ Full track (7 challenges)             |
| RAG Evaluation      | Basic           | ✅ RAG Triad + LLM-as-Judge              |
| Interview Prep      | Generic         | ✅ RAG-specific playbook                 |
| Production Patterns | ❌              | ✅ Caching, rate limiting, observability |

### Learning Paths

**🚀 Fast Track (2 weeks)**
Phases 0, 1, 2, 3, 9 → Core RAG competency

**📚 Complete Mastery (8 weeks)**
All Phases → Senior AI Engineer level

**🎯 Interview Prep (1 week)**
Phase 12 + Playbook → PM/AI Engineer interviews

Build. Ship. Master RAG.
