# RAG Academy — Python FastAPI Template

A production-ready RAG baseline using FastAPI, LangChain, and your choice of vector DB.

## Quick Start

```bash
# Clone or download this folder
cd python-fastapi-rag

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your API keys

# Run the server
uvicorn main:app --reload
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         FastAPI                              │
├──────────────┬──────────────┬───────────────┬───────────────┤
│  /ingest     │  /query      │  /eval        │  /health      │
├──────────────┴──────────────┴───────────────┴───────────────┤
│                    RAG Pipeline                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ Chunker │→ │ Embedder│→ │Retriever│→ │Generator│        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
├─────────────────────────────────────────────────────────────┤
│                    Vector Store                              │
│        (Chroma local / Pinecone / Qdrant / pgvector)        │
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
- `RERANK_TOP_N` — Default: 5

## Files

```
├── main.py           # FastAPI app entry
├── pipeline/
│   ├── chunker.py    # Document chunking logic
│   ├── embedder.py   # Embedding generation
│   ├── retriever.py  # Hybrid retrieval (dense + sparse)
│   ├── reranker.py   # Cross-encoder reranking
│   └── generator.py  # LLM generation with citations
├── eval/
│   ├── golden_set.json    # Your evaluation queries
│   └── metrics.py         # Recall@k, MRR, nDCG
├── requirements.txt
├── .env.example
└── README.md
```

## Production Checklist

- [ ] Stable chunk IDs (content hash + source)
- [ ] Metadata tagging (source, page, timestamp)
- [ ] Rate limiting on /query
- [ ] Logging (retrieval scores, latency, token usage)
- [ ] Golden set evaluation (25–50 queries minimum)
- [ ] Citation validation (chunk ID → source mapping)
- [ ] PII redaction (if applicable)
- [ ] Prompt injection defense

## Learn More

- [RAG Academy — Study Plan](/plan)
- [Production RAG Blueprint](/playbooks/production-rag-blueprint)
- [Compare: Vector DBs](/compare/vector-dbs)
- [Compare: Reranking](/compare/reranking)
