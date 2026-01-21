"""
Retrieval and generation evaluation metrics.
"""

import json
from typing import Any, Callable

import numpy as np


def evaluate_retrieval(
    golden_set_path: str,
    retriever: Callable[[str], list[dict]],
    k_values: list[int] = [1, 3, 5, 10],
) -> dict:
    """
    Evaluate retrieval quality on a golden set.
    
    Args:
        golden_set_path: Path to golden set JSON
        retriever: Function that takes query and returns ranked results
        k_values: Values of k for Recall@k
    
    Returns:
        Dictionary of metrics
    """
    with open(golden_set_path) as f:
        golden_set = json.load(f)
    
    all_recalls = {k: [] for k in k_values}
    all_rr = []  # For MRR
    all_ndcg = []
    
    for item in golden_set:
        query = item["query"]
        expected = set(item["expected_sources"])
        
        # Get retrieval results
        results = retriever(query)
        retrieved_sources = [r.get("source", "") for r in results]
        
        # Recall@k
        for k in k_values:
            top_k_sources = set(retrieved_sources[:k])
            recall = len(top_k_sources & expected) / len(expected) if expected else 0
            all_recalls[k].append(recall)
        
        # Reciprocal Rank (for MRR)
        rr = 0
        for i, source in enumerate(retrieved_sources):
            if source in expected:
                rr = 1 / (i + 1)
                break
        all_rr.append(rr)
        
        # nDCG (simplified - binary relevance)
        relevance = [1 if s in expected else 0 for s in retrieved_sources[:10]]
        ndcg = compute_ndcg(relevance, len(expected))
        all_ndcg.append(ndcg)
    
    return {
        "recall_at_k": {f"recall@{k}": float(np.mean(all_recalls[k])) for k in k_values},
        "mrr": float(np.mean(all_rr)),
        "ndcg": float(np.mean(all_ndcg)),
    }


def compute_ndcg(relevance: list[int], num_relevant: int) -> float:
    """
    Compute Normalized Discounted Cumulative Gain.
    
    Args:
        relevance: List of relevance scores (0 or 1 for binary)
        num_relevant: Total number of relevant documents
    
    Returns:
        nDCG score
    """
    if not relevance or num_relevant == 0:
        return 0.0
    
    # DCG
    dcg = sum(rel / np.log2(i + 2) for i, rel in enumerate(relevance))
    
    # Ideal DCG (all relevant docs at top)
    ideal_relevance = [1] * min(num_relevant, len(relevance))
    idcg = sum(1 / np.log2(i + 2) for i in range(len(ideal_relevance)))
    
    return dcg / idcg if idcg > 0 else 0.0


def precision_at_k(retrieved: list[str], relevant: set[str], k: int) -> float:
    """Precision@k: fraction of top-k that are relevant."""
    top_k = set(retrieved[:k])
    return len(top_k & relevant) / k if k > 0 else 0.0


def recall_at_k(retrieved: list[str], relevant: set[str], k: int) -> float:
    """Recall@k: fraction of relevant that are in top-k."""
    top_k = set(retrieved[:k])
    return len(top_k & relevant) / len(relevant) if relevant else 0.0


def f1_at_k(retrieved: list[str], relevant: set[str], k: int) -> float:
    """F1@k: harmonic mean of precision and recall."""
    p = precision_at_k(retrieved, relevant, k)
    r = recall_at_k(retrieved, relevant, k)
    return 2 * p * r / (p + r) if (p + r) > 0 else 0.0


def mean_reciprocal_rank(rankings: list[list[str]], relevants: list[set[str]]) -> float:
    """
    Mean Reciprocal Rank across multiple queries.
    
    Args:
        rankings: List of ranked result lists
        relevants: List of relevant document sets
    
    Returns:
        MRR score
    """
    rr_sum = 0
    for ranking, relevant in zip(rankings, relevants):
        for i, doc in enumerate(ranking):
            if doc in relevant:
                rr_sum += 1 / (i + 1)
                break
    return rr_sum / len(rankings) if rankings else 0.0


# ─────────────────────────────────────────────────────────────
# Generation quality metrics
# ─────────────────────────────────────────────────────────────


def evaluate_answer_quality(
    answer: str,
    expected_contains: list[str],
    context: list[dict],
) -> dict:
    """
    Evaluate answer quality.
    
    Checks:
    - Keyword coverage from expected_contains
    - Citation presence
    - Grounding (citations reference actual context)
    """
    answer_lower = answer.lower()
    
    # Keyword coverage
    keywords_found = sum(1 for kw in expected_contains if kw.lower() in answer_lower)
    keyword_coverage = keywords_found / len(expected_contains) if expected_contains else 0
    
    # Citation analysis
    import re
    citations = re.findall(r'\[(\d+)\]', answer)
    has_citations = len(citations) > 0
    
    # Check if citations are valid (within context range)
    valid_citations = [int(c) for c in citations if 0 < int(c) <= len(context)]
    citation_validity = len(valid_citations) / len(citations) if citations else 0
    
    return {
        "keyword_coverage": keyword_coverage,
        "has_citations": has_citations,
        "citation_count": len(citations),
        "citation_validity": citation_validity,
    }


def run_full_evaluation(
    golden_set_path: str,
    retriever: Callable[[str], list[dict]],
    generator: Callable[[str, list[dict]], tuple[str, list[dict]]],
) -> dict:
    """
    Run full RAG evaluation: retrieval + generation.
    """
    with open(golden_set_path) as f:
        golden_set = json.load(f)
    
    retrieval_metrics = []
    generation_metrics = []
    
    for item in golden_set:
        query = item["query"]
        expected_sources = set(item["expected_sources"])
        expected_contains = item.get("expected_answer_contains", [])
        
        # Retrieval
        retrieved = retriever(query)
        retrieved_sources = [r.get("source", "") for r in retrieved]
        
        r_metrics = {
            "recall@5": recall_at_k(retrieved_sources, expected_sources, 5),
            "precision@5": precision_at_k(retrieved_sources, expected_sources, 5),
        }
        retrieval_metrics.append(r_metrics)
        
        # Generation
        answer, sources = generator(query, retrieved[:5])
        g_metrics = evaluate_answer_quality(answer, expected_contains, retrieved[:5])
        generation_metrics.append(g_metrics)
    
    # Aggregate
    return {
        "retrieval": {
            "mean_recall@5": np.mean([m["recall@5"] for m in retrieval_metrics]),
            "mean_precision@5": np.mean([m["precision@5"] for m in retrieval_metrics]),
        },
        "generation": {
            "mean_keyword_coverage": np.mean([m["keyword_coverage"] for m in generation_metrics]),
            "citation_rate": np.mean([1 if m["has_citations"] else 0 for m in generation_metrics]),
            "mean_citation_validity": np.mean([m["citation_validity"] for m in generation_metrics]),
        },
    }
