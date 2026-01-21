# RAG Academy: Learning Structure & Pedagogy

Welcome to RAG Academy. Our curriculum is designed to transform you from a "Prompt Engineer" into a "RAG Architect." We follow a **Saga-based learning model**, where individual skills are built up into complex, production-ready systems.

## 1. The Core Sagas

These are high-continuity paths where you implement a single system across multiple challenges.

### **The Vector DB Saga** (`vectorDbSaga.ts`)

- **Goal**: Build a high-performance vector database from scratch.
- **Path**: `DenseVector` -> `FlatIndex` -> `IVF (Clustering)` -> `HNSW (Graphs)`.
- **Outcome**: Understand how high-scale databases like Pinecone and Milvus work under the hood.

### **The RAG Pipeline Saga** (`ragPipelineSaga.ts`)

- **Goal**: Construct an end-to-end RAG architecture.
- **Path**: `Chunker` -> `Embedder` -> `Retriever` -> `Generator`.
- **Outcome**: A working "Toy" RAG system that simulates the full lifecycle of a user query.

### **The Reranker Saga** (`rerankerSaga.ts`)

- **Goal**: Implement a production-grade reranking cascade.
- **Path**: `MockCrossEncoder` -> `CascadeReranker`.
- **Outcome**: Learn the "Precision vs. Latency" trade-off and how to optimize for both.

### **The Evaluator Saga** (`evaluatorSaga.ts`)

- **Goal**: Build a quantitative evaluation suite.
- **Path**: `Recall@K` -> `MRR` -> `nDCG (Graded Relevance)`.
- **Outcome**: Master the metrics that separate "toy" apps from production systems.

---

## 2. Advanced Technique Tracks

In addition to Sagas, we offer specialized tracks for advanced optimization:

- **Ingestion Mastery**: Deep dive into chunking (Proposition, Late, Contextual) and deduplication (SimHash).
- **Query Engineering**: Master Query Expansion (Multi-query), Decomposition (Step-back), and Synthesis (HyDE).
- **Context Shaping**: Learn how to "sculpt" the LLM's view using MMR, Autocut, and Attention Reordering (Lost in the Middle).
- **Security & Safety**: Implement multi-tenant filtering (metadata), PII redaction, and prompt injection sanitizers.

---

## 3. The "Benchmark" Framework

Select challenges feature a `benchmark: true` flag. These exercises:

- Measure your implementation against the **`TECH_SUPPORT_DATASET`**.
- Calculate real-world **Latency (ms)** and **Recall**.
- Encourage you to optimize your code for performance, not just correctness.

---

## 4. Real-World Context

Every challenge includes a `realWorld` block which identifies:

- **Companies**: Who uses this technique (e.g., Anthropic, Uber, Meta).
- **Use Cases**: Why it matters (e.g., HIPAA compliance, Reducing API costs).

---

## How to use this platform

1.  **Start with Foundations**: Master the math first.
2.  **Pick a Saga**: Follow one story (e.g., Vector DB) to completion.
3.  **Benchmark your performance**: Use the "Arena" and benchmark challenges to see how your code holds up under load.
4.  **Check the Roadmap**: See `RAG_MASTERY_ROADMAP.md` for a complete checklist of skills.
