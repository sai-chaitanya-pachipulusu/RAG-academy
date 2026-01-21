"""
Embedding generation with caching and batching.
"""

import os
from functools import lru_cache
from typing import Optional

import numpy as np
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def get_embedding_model() -> str:
    """Get configured embedding model."""
    return os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")


def embed_query(query: str) -> list[float]:
    """
    Embed a single query.
    
    For queries, we don't cache since they're usually unique.
    """
    response = client.embeddings.create(
        model=get_embedding_model(),
        input=query,
    )
    return response.data[0].embedding


def embed_chunks(texts: list[str], batch_size: int = 100) -> list[list[float]]:
    """
    Embed multiple texts with batching.
    
    OpenAI's API supports batching up to ~2048 inputs.
    We use smaller batches for reliability.
    """
    all_embeddings = []
    
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        response = client.embeddings.create(
            model=get_embedding_model(),
            input=batch,
        )
        batch_embeddings = [d.embedding for d in response.data]
        all_embeddings.extend(batch_embeddings)
    
    return all_embeddings


# ─────────────────────────────────────────────────────────────
# Embedding utilities
# ─────────────────────────────────────────────────────────────


def cosine_similarity(a: list[float], b: list[float]) -> float:
    """Compute cosine similarity between two vectors."""
    a_np = np.array(a)
    b_np = np.array(b)
    return float(np.dot(a_np, b_np) / (np.linalg.norm(a_np) * np.linalg.norm(b_np)))


def normalize_embedding(embedding: list[float]) -> list[float]:
    """L2 normalize an embedding vector."""
    arr = np.array(embedding)
    norm = np.linalg.norm(arr)
    if norm == 0:
        return embedding
    return (arr / norm).tolist()


# ─────────────────────────────────────────────────────────────
# Optional: Local embeddings with sentence-transformers
# ─────────────────────────────────────────────────────────────


_local_model = None


def get_local_model():
    """Lazy load local embedding model."""
    global _local_model
    if _local_model is None:
        from sentence_transformers import SentenceTransformer
        _local_model = SentenceTransformer("all-MiniLM-L6-v2")
    return _local_model


def embed_local(texts: list[str]) -> list[list[float]]:
    """
    Embed texts using a local model.
    
    Useful for:
    - Development/testing without API costs
    - High-volume embedding with latency requirements
    - Privacy-sensitive applications
    """
    model = get_local_model()
    embeddings = model.encode(texts, convert_to_numpy=True)
    return embeddings.tolist()
