"""
RAG Academy — Python FastAPI Template
Production-ready RAG baseline with hybrid retrieval, reranking, and citations.
"""

import os
from contextlib import asynccontextmanager
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

# Import pipeline components (implement these based on your needs)
from pipeline.chunker import chunk_document
from pipeline.embedder import embed_chunks, embed_query
from pipeline.retriever import hybrid_retrieve
from pipeline.reranker import rerank
from pipeline.generator import generate_answer
from eval.metrics import evaluate_retrieval

# Vector store (swap based on VECTOR_DB env var)
vector_store = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize vector store on startup."""
    global vector_store
    db_type = os.getenv("VECTOR_DB", "chroma")
    
    if db_type == "chroma":
        import chromadb
        vector_store = chromadb.PersistentClient(path="./chroma_db")
    elif db_type == "pinecone":
        from pinecone import Pinecone
        pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
        vector_store = pc.Index(os.getenv("PINECONE_INDEX"))
    # Add more vector DBs as needed
    
    yield
    # Cleanup if needed


app = FastAPI(
    title="RAG Academy Template",
    description="Production-ready RAG API with hybrid retrieval and reranking",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────────────────────
# Request/Response Models
# ─────────────────────────────────────────────────────────────


class IngestRequest(BaseModel):
    content: str
    source: str
    metadata: Optional[dict] = None


class QueryRequest(BaseModel):
    query: str
    top_k: int = 10
    rerank: bool = True
    rerank_top_n: int = 5


class QueryResponse(BaseModel):
    answer: str
    sources: list[dict]
    retrieval_scores: list[float]
    latency_ms: float


class EvalRequest(BaseModel):
    golden_set_path: str = "eval/golden_set.json"


class EvalResponse(BaseModel):
    recall_at_k: dict[str, float]
    mrr: float
    ndcg: float


# ─────────────────────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────────────────────


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy", "vector_db": os.getenv("VECTOR_DB", "chroma")}


@app.post("/ingest")
async def ingest(request: IngestRequest):
    """
    Ingest a document into the vector store.
    
    Steps:
    1. Chunk the document (recursive, with overlap)
    2. Generate stable chunk IDs (content hash + source)
    3. Embed chunks
    4. Store in vector DB with metadata
    """
    try:
        # 1. Chunk
        chunks = chunk_document(
            content=request.content,
            source=request.source,
            chunk_size=int(os.getenv("CHUNK_SIZE", 512)),
            overlap=int(os.getenv("CHUNK_OVERLAP", 50)),
        )
        
        # 2. Embed
        embeddings = embed_chunks([c["text"] for c in chunks])
        
        # 3. Store (implement based on your vector DB)
        # vector_store.add(...)
        
        return {
            "status": "success",
            "chunks_created": len(chunks),
            "source": request.source,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ingest/file")
async def ingest_file(file: UploadFile):
    """Ingest a file (PDF, Markdown, text)."""
    content = await file.read()
    
    # Parse based on file type
    if file.filename.endswith(".pdf"):
        # Use pypdf, pdfplumber, or unstructured
        pass
    elif file.filename.endswith(".md"):
        content = content.decode("utf-8")
    else:
        content = content.decode("utf-8")
    
    return await ingest(IngestRequest(content=content, source=file.filename))


@app.post("/query", response_model=QueryResponse)
async def query(request: QueryRequest):
    """
    Query the RAG system.
    
    Steps:
    1. Embed query
    2. Hybrid retrieve (dense + sparse)
    3. Rerank (optional)
    4. Generate answer with citations
    """
    import time
    start = time.time()
    
    try:
        # 1. Embed query
        query_embedding = embed_query(request.query)
        
        # 2. Hybrid retrieve
        candidates = hybrid_retrieve(
            query=request.query,
            query_embedding=query_embedding,
            top_k=request.top_k,
            vector_store=vector_store,
        )
        
        # 3. Rerank
        if request.rerank and candidates:
            candidates = rerank(
                query=request.query,
                candidates=candidates,
                top_n=request.rerank_top_n,
            )
        
        # 4. Generate
        answer, sources = generate_answer(
            query=request.query,
            context=candidates,
        )
        
        latency_ms = (time.time() - start) * 1000
        
        return QueryResponse(
            answer=answer,
            sources=sources,
            retrieval_scores=[c.get("score", 0) for c in candidates],
            latency_ms=latency_ms,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/eval", response_model=EvalResponse)
async def run_evaluation(request: EvalRequest):
    """
    Run retrieval evaluation on a golden set.
    
    Golden set format:
    [
        {
            "query": "What is chunking?",
            "expected_sources": ["chunking-101.md#section-1", "..."]
        },
        ...
    ]
    """
    try:
        results = evaluate_retrieval(
            golden_set_path=request.golden_set_path,
            retriever=lambda q: hybrid_retrieve(q, embed_query(q), 10, vector_store),
        )
        return EvalResponse(**results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
