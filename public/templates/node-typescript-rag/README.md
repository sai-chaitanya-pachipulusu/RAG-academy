# RAG Academy — Node.js/TypeScript Template

A production-ready RAG baseline using Express, LangChain.js, and your choice of vector DB.

## Quick Start

```bash
# Clone or download this folder
cd node-typescript-rag

# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your API keys

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Express                              │
├──────────────┬──────────────┬───────────────┬───────────────┤
│  /ingest     │  /query      │  /eval        │  /health      │
├──────────────┴──────────────┴───────────────┴───────────────┤
│                    RAG Pipeline                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ Chunker │→ │ Embedder│→ │Retriever│→ │Generator│        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
├─────────────────────────────────────────────────────────────┤
│                    Vector Store                              │
│        (Chroma / Pinecone / Qdrant / pgvector)              │
└─────────────────────────────────────────────────────────────┘
```

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/ingest` | POST | Ingest documents (PDF, Markdown, text) |
| `/query` | POST | Query the RAG system |
| `/eval` | POST | Run evaluation on a golden set |
| `/health` | GET | Health check |

## Configuration

Edit `.env` to configure:

- `OPENAI_API_KEY` — For embeddings and generation
- `VECTOR_DB` — `chroma`, `pinecone`, `qdrant`, or `pgvector`
- `CHUNK_SIZE` — Default: 512 tokens
- `CHUNK_OVERLAP` — Default: 50 tokens
- `TOP_K` — Default: 10
- `RERANK_ENABLED` — Default: true

## Files

```
├── src/
│   ├── index.ts          # Express app entry
│   ├── pipeline/
│   │   ├── chunker.ts    # Document chunking
│   │   ├── embedder.ts   # Embedding generation
│   │   ├── retriever.ts  # Hybrid retrieval
│   │   ├── reranker.ts   # Cross-encoder reranking
│   │   └── generator.ts  # LLM generation
│   ├── eval/
│   │   └── metrics.ts    # Evaluation metrics
│   └── types.ts          # TypeScript types
├── eval/
│   └── golden_set.json   # Your evaluation queries
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Production Checklist

- [ ] Stable chunk IDs (content hash + source)
- [ ] Metadata tagging (source, page, timestamp)
- [ ] Rate limiting on /query
- [ ] Logging (retrieval scores, latency, token usage)
- [ ] Golden set evaluation (25–50 queries minimum)
- [ ] Citation validation
- [ ] Error handling and graceful degradation

## Learn More

- [RAG Academy — Study Plan](/plan)
- [Production RAG Blueprint](/playbooks/production-rag-blueprint)
- [Compare: Vector DBs](/compare/vector-dbs)
