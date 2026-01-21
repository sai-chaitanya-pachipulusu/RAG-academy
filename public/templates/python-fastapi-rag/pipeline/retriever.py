"""
Hybrid retrieval combining dense (vector) and sparse (BM25) search.
"""

import os
from typing import Any, Optional

from rank_bm25 import BM25Okapi

from .embedder import cosine_similarity


def hybrid_retrieve(
    query: str,
    query_embedding: list[float],
    top_k: int,
    vector_store: Any,
    alpha: Optional[float] = None,
) -> list[dict]:
    """
    Hybrid retrieval: combine dense and sparse results.
    
    Args:
        query: User query text
        query_embedding: Pre-computed query embedding
        top_k: Number of results to return
        vector_store: Vector database client
        alpha: Weight for dense vs sparse (0=sparse only, 1=dense only)
               Default from env: HYBRID_ALPHA
    
    Returns:
        List of candidate chunks with scores
    """
    if alpha is None:
        alpha = float(os.getenv("HYBRID_ALPHA", 0.7))
    
    # Get more candidates than needed for fusion
    candidates_k = top_k * 3
    
    # Dense retrieval
    dense_results = dense_retrieve(query_embedding, candidates_k, vector_store)
    
    # Sparse retrieval (if we have a BM25 index)
    sparse_results = sparse_retrieve(query, candidates_k, vector_store)
    
    # Combine with RRF (Reciprocal Rank Fusion) or weighted scores
    if sparse_results:
        combined = reciprocal_rank_fusion(
            [dense_results, sparse_results],
            weights=[alpha, 1 - alpha],
            k=60,  # RRF constant
        )
    else:
        combined = dense_results
    
    return combined[:top_k]


def dense_retrieve(
    query_embedding: list[float],
    top_k: int,
    vector_store: Any,
) -> list[dict]:
    """
    Dense vector retrieval.
    
    Implement based on your vector store:
    - Chroma: collection.query(query_embeddings=[...])
    - Pinecone: index.query(vector=..., top_k=...)
    - Qdrant: client.search(...)
    """
    # Example for Chroma:
    # results = vector_store.get_collection("documents").query(
    #     query_embeddings=[query_embedding],
    #     n_results=top_k,
    # )
    
    # Placeholder - implement based on your vector DB
    return []


def sparse_retrieve(
    query: str,
    top_k: int,
    vector_store: Any,
) -> list[dict]:
    """
    Sparse retrieval using BM25.
    
    Options:
    1. In-memory BM25 (for small corpora)
    2. Elasticsearch/OpenSearch (for large corpora)
    3. Vector DB with sparse vector support (Qdrant, Weaviate)
    """
    # Placeholder - implement based on your setup
    # 
    # For in-memory BM25:
    # tokenized_query = query.lower().split()
    # scores = bm25.get_scores(tokenized_query)
    # top_indices = np.argsort(scores)[::-1][:top_k]
    
    return []


def reciprocal_rank_fusion(
    result_lists: list[list[dict]],
    weights: Optional[list[float]] = None,
    k: int = 60,
) -> list[dict]:
    """
    Reciprocal Rank Fusion (RRF) to combine multiple ranked lists.
    
    RRF score = sum(weight_i / (k + rank_i)) for each result list
    
    Args:
        result_lists: List of ranked result lists
        weights: Optional weights for each list (default: equal)
        k: RRF constant (default: 60)
    
    Returns:
        Combined and re-ranked results
    """
    if weights is None:
        weights = [1.0] * len(result_lists)
    
    # Normalize weights
    total_weight = sum(weights)
    weights = [w / total_weight for w in weights]
    
    # Score by ID
    scores: dict[str, float] = {}
    docs: dict[str, dict] = {}
    
    for result_list, weight in zip(result_lists, weights):
        for rank, doc in enumerate(result_list):
            doc_id = doc.get("id", str(hash(doc.get("text", ""))))
            rrf_score = weight / (k + rank + 1)  # rank is 0-indexed
            
            scores[doc_id] = scores.get(doc_id, 0) + rrf_score
            if doc_id not in docs:
                docs[doc_id] = doc
    
    # Sort by combined score
    sorted_ids = sorted(scores.keys(), key=lambda x: scores[x], reverse=True)
    
    result = []
    for doc_id in sorted_ids:
        doc = docs[doc_id].copy()
        doc["score"] = scores[doc_id]
        doc["fusion_method"] = "rrf"
        result.append(doc)
    
    return result


# ─────────────────────────────────────────────────────────────
# Metadata filtering
# ─────────────────────────────────────────────────────────────


def apply_metadata_filters(
    candidates: list[dict],
    filters: dict[str, Any],
) -> list[dict]:
    """
    Filter candidates by metadata.
    
    Example filters:
    - {"source": "docs/"}  # Only from docs folder
    - {"timestamp": {"$gte": "2024-01-01"}}  # Recent docs
    - {"category": ["guide", "tutorial"]}  # Multiple values
    """
    if not filters:
        return candidates
    
    filtered = []
    for candidate in candidates:
        metadata = candidate.get("metadata", {})
        matches = True
        
        for key, value in filters.items():
            if key not in metadata:
                matches = False
                break
            
            if isinstance(value, list):
                if metadata[key] not in value:
                    matches = False
                    break
            elif isinstance(value, dict):
                # Handle operators like $gte, $lte, $in
                for op, op_value in value.items():
                    if op == "$gte" and metadata[key] < op_value:
                        matches = False
                    elif op == "$lte" and metadata[key] > op_value:
                        matches = False
                    elif op == "$in" and metadata[key] not in op_value:
                        matches = False
            else:
                if metadata[key] != value:
                    matches = False
                    break
        
        if matches:
            filtered.append(candidate)
    
    return filtered
