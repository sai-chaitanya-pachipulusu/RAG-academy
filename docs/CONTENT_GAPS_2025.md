# RAG Academy Content Gaps & Improvements (2025)

## Priority 1: Missing 2024-2025 Techniques

### Papers to Add to Reading List

```typescript
// Add to src/lib/research/readingList.ts

// 1. RAG 2.0 / End-to-End RAG
{
  id: "shi-2024-replug",
  title: "REPLUG: Retrieval-Augmented Black-Box Language Models",
  authors: "Shi et al.",
  year: 2024,
  links: [{ label: "arXiv", href: "https://arxiv.org/abs/2301.12652" }],
  tags: ["systems", "foundations"],
  why: "End-to-end fine-tuning of retriever + LLM together.",
},

// 2. Gemini's Retrieval Patterns
{
  id: "google-2024-gemini-retrieval",
  title: "Gemini 1.5: Understanding Extremely Long Documents",
  authors: "Google DeepMind",
  year: 2024,
  links: [{ label: "Blog", href: "https://deepmind.google/technologies/gemini/" }],
  tags: ["context-management", "systems"],
  why: "1M token context - when RAG becomes optional.",
},

// 3. GRIT (Generative Retrieval)
{
  id: "lee-2024-grit",
  title: "GRIT: Generative Representational Instruction Tuning",
  authors: "Lee et al.",
  year: 2024,
  links: [{ label: "arXiv", href: "https://arxiv.org/abs/2402.09906" }],
  tags: ["retrieval", "foundations"],
  why: "Unified embedding + generation in one model.",
},

// 4. Structured RAG Outputs
{
  id: "openai-2024-structured-outputs",
  title: "Structured Outputs in the API",
  authors: "OpenAI",
  year: 2024,
  links: [{ label: "Docs", href: "https://platform.openai.com/docs/guides/structured-outputs" }],
  tags: ["generation", "systems"],
  why: "Guaranteed JSON output for RAG citations.",
},

// 5. Claude Citations
{
  id: "anthropic-2024-citations",
  title: "Claude's Citation Capabilities",
  authors: "Anthropic",
  year: 2024,
  links: [{ label: "Docs", href: "https://docs.anthropic.com/" }],
  tags: ["grounding-safety", "generation"],
  why: "Native citation support in generation.",
},

// 6. Qwen 2.5 Long Context
{
  id: "qwen-2024-long-context",
  title: "Qwen2.5: A Party of Foundation Models",
  authors: "Alibaba",
  year: 2024,
  links: [{ label: "Blog", href: "https://qwenlm.github.io/blog/qwen2.5/" }],
  tags: ["context-management", "systems"],
  why: "128K context with excellent needle-in-haystack.",
},

// 7. Cohere Rerank 3.5
{
  id: "cohere-2024-rerank",
  title: "Rerank 3.5: State-of-the-Art Reranking",
  authors: "Cohere",
  year: 2024,
  links: [{ label: "Docs", href: "https://docs.cohere.com/docs/rerank" }],
  tags: ["reranking"],
  why: "Best production reranker as of late 2024.",
},

// 8. Instructor Embeddings
{
  id: "instructor-2024",
  title: "Instructor: Instruction-Finetuned Text Embeddings",
  authors: "Su et al.",
  year: 2024,
  links: [{ label: "arXiv", href: "https://arxiv.org/abs/2212.09741" }],
  tags: ["retrieval", "foundations"],
  why: "Task-specific embeddings via instruction prefix.",
},
```

## Priority 2: Missing Production Patterns

### Lessons to Create

1. **Query Routing (Multi-Pipeline RAG)**
   - Route queries to specialized RAG pipelines
   - Code search vs docs search vs general
   - Model-based vs rule-based routing

2. **Advanced Semantic Caching**
   - Cache hit strategies
   - TTL and invalidation
   - Embedding similarity thresholds

3. **Guardrails Integration**
   - NeMo Guardrails
   - Guardrails AI
   - Input/output validation

4. **Evaluation-Driven Development**
   - CI/CD with RAG evaluation
   - Regression testing for retrieval
   - A/B testing RAG versions

5. **Cost Optimization Deep Dive**
   - Model routing (cheap vs expensive)
   - Tiered retrieval (BM25 → dense → rerank)
   - Token budget management

### Challenges to Create

```
# Missing challenges
- query-router: Route queries to appropriate RAG pipeline
- semantic-cache-advanced: Build cache with similarity threshold
- guardrails-input: Validate and sanitize RAG inputs
- guardrails-output: Verify and filter RAG outputs
- rag-regression-test: Build retrieval regression suite
- cost-aware-routing: Route based on query complexity
- streaming-citations: Stream answers with inline citations
- multi-tenant-rag: Implement tenant isolation
```

## Priority 3: Framework Updates

### Documentation Needed

1. **LlamaIndex 2024 Patterns**
   - Document agents
   - Auto-retriever
   - Property graph index

2. **LangChain/LangGraph 2024**
   - LangGraph Studio
   - Memory patterns
   - Checkpointing

3. **Vercel AI SDK**
   - RAG with RSC
   - Streaming patterns
   - Edge RAG

4. **Haystack 2.0**
   - Pipeline components
   - Evaluation module
   - Production deployment

## Priority 4: Enterprise Patterns

### Playbooks to Add

1. **Multi-Tenancy Deep Dive**
   - Data isolation strategies
   - Namespace vs filtering
   - Performance implications

2. **RBAC for RAG**
   - Document-level permissions
   - Query-time filtering
   - Admin vs user views

3. **Compliance & Audit**
   - Logging requirements
   - PII handling
   - Data retention

4. **Cost Allocation**
   - Per-tenant billing
   - Usage metering
   - Budget alerts

## Priority 5: Missing 2025 Topics

### Emerging Areas

1. **Video RAG**
   - Video transcription + retrieval
   - Frame-based retrieval
   - Multi-modal video Q&A

2. **Audio RAG**
   - Podcast/meeting retrieval
   - Voice query handling
   - Speaker diarization

3. **Real-Time RAG**
   - Streaming data ingestion
   - Live document updates
   - Event-driven retrieval

4. **Federated RAG**
   - Cross-organization retrieval
   - Privacy-preserving search
   - Decentralized indexes

## Implementation Priority

| Priority | Items                            | Effort  | Impact |
| -------- | -------------------------------- | ------- | ------ |
| **P0**   | Add 8 missing papers             | 1 hour  | High   |
| **P1**   | Query routing lesson + challenge | 4 hours | High   |
| **P1**   | Advanced caching lesson          | 3 hours | High   |
| **P2**   | Guardrails integration           | 4 hours | Medium |
| **P2**   | Enterprise playbooks             | 6 hours | Medium |
| **P3**   | Framework update docs            | 8 hours | Medium |
| **P3**   | Video/Audio RAG                  | 8 hours | Low    |

## Quick Wins (Do Today)

1. Add missing papers to `readingList.ts` ✅
2. Update "Late 2025 Techniques" with Gemini/Qwen context lengths
3. Add Cohere Rerank 3.5 to reranker comparisons
4. Add structured outputs section to generation lessons

---

## ✅ Completed Enhancements (January 2025)

Based on analysis of [patchy631/ai-engineering-hub](https://github.com/patchy631/ai-engineering-hub) and [Shubhamsaboo/awesome-llm-apps](https://github.com/Shubhamsaboo/awesome-llm-apps):

### New Lessons Created

- ✅ `lessons/graph-rag-introduction.mdx` - Comprehensive Graph RAG lesson
- ✅ `lessons/measuring-rag-success.mdx` - RAG Evaluation with PM interview focus
- ✅ `lessons/external-rag-project-gallery.mdx` - Curated external projects

### New Challenges Created

- ✅ `challenges/llm-as-judge.mdx` - Automated evaluation with LLM judges
- ✅ `challenges/knowledge-graph-extraction.mdx` - Foundation for Graph RAG

### New Playbooks Created

- ✅ `playbooks/rag-interview-playbook.mdx` - Complete PM/AI Engineer interview prep

### Roadmap Updates

- ✅ Phase 11: Graph RAG & Multi-Hop Reasoning (7 challenges)
- ✅ Phase 12: RAG Evaluation & Interview Prep (3 challenges)
- ✅ Updated curriculum summary with learning paths

### New Concepts Covered

1. **Graph RAG Decision Framework** - When to use Graph RAG vs Traditional RAG
2. **RAG Success Formula** - Success = Retrieval Quality × Generation Quality
3. **RAG Triad** - Faithfulness + Relevancy + Context Recall
4. **LLM-as-a-Judge Pattern** - Scaling evaluation
5. **First Principles PM Interview Answers** - Why traditional metrics fail

### External Resources Curated

- 40+ projects from both GitHub repositories
- Organized by difficulty (Beginner/Intermediate/Advanced)
- Categorized by pattern (Agentic, Voice, MCP, Production)

---

## Remaining High-Priority Items

### Challenges to Create

```
# Phase 11: Graph RAG (partial)
- entity-linking.mdx
- community-detection.mdx
- multi-hop-retrieval.mdx
- community-summarization.mdx
- graph-vector-fusion.mdx

# Phase 12: Evaluation (partial)
- rag-triad-scorer.mdx

# Production Patterns
- mcp-rag-server.mdx - MCP integration for RAG
- voice-query-processing.mdx - Voice RAG
- confidence-scoring.mdx - Answer uncertainty
```

### Lessons to Create

```
# Theory Gaps
- agentic-rag-patterns.mdx - When to add agents to RAG
- mcp-integration-guide.mdx - Model Context Protocol for RAG
- voice-rag-overview.mdx - Audio/voice RAG systems
- rag-vs-long-context.mdx - When to skip RAG
```

### Framework Documentation Needed

1. LlamaIndex 2024 patterns (Property Graph, Auto-Retriever)
2. LangGraph 2024 (Memory, Checkpointing)
3. Vercel AI SDK (Streaming, Edge RAG)
4. Haystack 2.0 (Pipeline components)
