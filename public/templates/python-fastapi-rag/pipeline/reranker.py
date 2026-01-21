"""
Reranking to boost precision after retrieval.
"""

import os
from typing import Optional

# Uncomment for Cohere Rerank:
# import cohere


def rerank(
    query: str,
    candidates: list[dict],
    top_n: int = 5,
    method: str = "cross-encoder",
) -> list[dict]:
    """
    Rerank candidates to improve precision.
    
    Args:
        query: User query
        candidates: Retrieved candidates
        top_n: Number of top results to keep
        method: Reranking method
            - "cross-encoder": Local cross-encoder model
            - "cohere": Cohere Rerank API
            - "llm": LLM-based listwise reranking
    
    Returns:
        Reranked candidates (top_n)
    """
    if not candidates:
        return []
    
    if method == "cohere":
        return rerank_cohere(query, candidates, top_n)
    elif method == "llm":
        return rerank_llm(query, candidates, top_n)
    else:
        return rerank_cross_encoder(query, candidates, top_n)


def rerank_cross_encoder(
    query: str,
    candidates: list[dict],
    top_n: int,
) -> list[dict]:
    """
    Rerank using a local cross-encoder model.
    
    Cross-encoders score (query, document) pairs jointly,
    giving better relevance estimates than bi-encoders.
    """
    try:
        from sentence_transformers import CrossEncoder
        
        # Load model (cached after first call)
        model = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
        
        # Create pairs
        pairs = [(query, c["text"]) for c in candidates]
        
        # Score
        scores = model.predict(pairs)
        
        # Sort by score
        scored = list(zip(candidates, scores))
        scored.sort(key=lambda x: x[1], reverse=True)
        
        result = []
        for candidate, score in scored[:top_n]:
            c = candidate.copy()
            c["rerank_score"] = float(score)
            result.append(c)
        
        return result
    
    except ImportError:
        # Fallback: return candidates as-is
        return candidates[:top_n]


def rerank_cohere(
    query: str,
    candidates: list[dict],
    top_n: int,
) -> list[dict]:
    """
    Rerank using Cohere Rerank API.
    
    Pros: High quality, no local GPU needed
    Cons: API cost, latency
    """
    import cohere
    
    client = cohere.Client(os.getenv("COHERE_API_KEY"))
    
    response = client.rerank(
        model="rerank-english-v3.0",
        query=query,
        documents=[c["text"] for c in candidates],
        top_n=top_n,
    )
    
    result = []
    for r in response.results:
        candidate = candidates[r.index].copy()
        candidate["rerank_score"] = r.relevance_score
        result.append(candidate)
    
    return result


def rerank_llm(
    query: str,
    candidates: list[dict],
    top_n: int,
) -> list[dict]:
    """
    Rerank using an LLM (listwise reranking).
    
    Pros: Can be very accurate for complex queries
    Cons: Slow, expensive, prompt engineering needed
    """
    from openai import OpenAI
    
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    # Build prompt with numbered candidates
    docs_text = "\n\n".join([
        f"[{i+1}] {c['text'][:500]}"  # Truncate for token budget
        for i, c in enumerate(candidates[:20])  # Limit candidates
    ])
    
    prompt = f"""Given the query and documents below, rank the documents by relevance.
Return ONLY a comma-separated list of document numbers, most relevant first.

Query: {query}

Documents:
{docs_text}

Ranking (comma-separated numbers, most relevant first):"""
    
    response = client.chat.completions.create(
        model=os.getenv("GENERATION_MODEL", "gpt-4o-mini"),
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
        max_tokens=100,
    )
    
    # Parse ranking
    ranking_text = response.choices[0].message.content.strip()
    try:
        ranking = [int(x.strip()) - 1 for x in ranking_text.split(",")]
        ranking = [r for r in ranking if 0 <= r < len(candidates)]
    except ValueError:
        # Fallback if parsing fails
        return candidates[:top_n]
    
    result = []
    for i, idx in enumerate(ranking[:top_n]):
        candidate = candidates[idx].copy()
        candidate["rerank_score"] = len(ranking) - i  # Higher = better
        result.append(candidate)
    
    return result


# ─────────────────────────────────────────────────────────────
# Cascade reranking (cheap → expensive)
# ─────────────────────────────────────────────────────────────


def rerank_cascade(
    query: str,
    candidates: list[dict],
    final_top_n: int = 5,
) -> list[dict]:
    """
    Cascade reranking: cheap model first, expensive model on top results.
    
    Pipeline:
    1. Cross-encoder on all candidates → top 20
    2. Cohere/LLM on top 20 → top N
    
    This balances cost and quality.
    """
    # Stage 1: Cheap cross-encoder
    stage1_results = rerank_cross_encoder(query, candidates, top_n=20)
    
    # Stage 2: Expensive reranker (if available)
    if os.getenv("COHERE_API_KEY"):
        return rerank_cohere(query, stage1_results, top_n=final_top_n)
    else:
        return stage1_results[:final_top_n]
