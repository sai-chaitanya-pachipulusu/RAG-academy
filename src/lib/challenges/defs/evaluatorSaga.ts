
import type { RawChallenge } from "@/lib/challenges/types";

export const EVALUATOR_SAGA_CHALLENGES: RawChallenge[] = [
  {
    slug: "evaluator-recall-at-k",
    title: "Build an Evaluator (1): Recall@K",
    description:
      "Implement the Recall@K metric from scratch. Why: Measures what percentage of relevant items you retrieved. Solves: Answers 'Did we find the right documents?'",
    group: "Phase 5 — Production Engineering & Security",
    difficulty: "medium",
    xpReward: 75,
    starterCode: `from typing import List, Set

def recall_at_k(retrieved: List[str], relevant: Set[str], k: int) -> float:
    """
    Calculate Recall@K.
    
    Recall@K = |relevant ∩ retrieved[:k]| / |relevant|
    
    Args:
        retrieved: Ordered list of retrieved document IDs
        relevant: Set of ground-truth relevant document IDs
        k: Cutoff position
    
    Returns:
        Recall score between 0.0 and 1.0
        If there are no relevant documents, return 0.0
    """
    # TODO: Implement
    raise NotImplementedError
`,
    testCode: `# Test case 1: Perfect recall
retrieved = ["d1", "d2", "d3", "d4", "d5"]
relevant = {"d1", "d2"}
assert recall_at_k(retrieved, relevant, k=2) == 1.0, "Should find both relevant docs"

# Test case 2: Partial recall
assert recall_at_k(retrieved, relevant, k=1) == 0.5, "Should find 1 of 2"

# Test case 3: Relevant doc not in top-k
retrieved2 = ["d3", "d4", "d1", "d2"]
assert recall_at_k(retrieved2, relevant, k=2) == 0.0, "Neither relevant doc in top-2"
assert recall_at_k(retrieved2, relevant, k=4) == 1.0, "Both in top-4"

# Test case 4: Empty relevant set
assert recall_at_k(retrieved, set(), k=3) == 0.0, "No relevant docs"

print("Recall@K passed!")
`,
    hints: [
      "Slice the retrieved list: `retrieved[:k]`",
      "Convert to set for intersection: `set(retrieved[:k]) & relevant`",
      "Handle division by zero when `len(relevant) == 0`",
    ],
    solution: `from typing import List, Set

def recall_at_k(retrieved: List[str], relevant: Set[str], k: int) -> float:
    if len(relevant) == 0:
        return 0.0
    
    top_k = set(retrieved[:k])
    found = top_k & relevant
    
    return len(found) / len(relevant)
`,
    complexity: {
      time: "O(k)",
      space: "O(k)",
    },
    realWorld: {
      description: "Recall@K is the primary metric for evaluating retrieval systems. Every RAG system in production tracks Recall@10 or Recall@100 to measure if the retriever fetches relevant context.",
      companies: ["Google Search", "Bing", "Elasticsearch", "Algolia"],
      useCases: ["Search quality measurement", "RAG evaluation", "A/B testing retrieval"],
    },
    relatedChallenges: ["evaluator-mrr", "evaluator-ndcg"],
    prerequisites: ["retrieval-metrics"],
    relatedPlaybooks: ["rag-evaluation-suite", "rag-formulas-cheatsheet"],
  },
  {
    slug: "evaluator-mrr",
    title: "Build an Evaluator (2): MRR",
    description:
      "Implement Mean Reciprocal Rank from scratch. Why: Measures how early the first relevant result appears. Solves: Answers 'How quickly do we get something useful?'",
    group: "Phase 5 — Production Engineering & Security",
    difficulty: "medium",
    xpReward: 75,
    starterCode: `from typing import List, Set

def reciprocal_rank(retrieved: List[str], relevant: Set[str]) -> float:
    """
    Calculate Reciprocal Rank for a single query.
    
    RR = 1 / rank_of_first_relevant_doc
    
    If no relevant doc is found, return 0.0.
    rank is 1-indexed (first position = rank 1).
    """
    # TODO: Implement
    raise NotImplementedError

def mean_reciprocal_rank(results: List[List[str]], relevants: List[Set[str]]) -> float:
    """
    Calculate Mean Reciprocal Rank across multiple queries.
    
    MRR = (1/N) * Σ reciprocal_rank(results[i], relevants[i])
    """
    # TODO: Implement
    raise NotImplementedError
`,
    testCode: `# Test RR
assert reciprocal_rank(["d1", "d2", "d3"], {"d1"}) == 1.0, "First position = RR 1.0"
assert reciprocal_rank(["d1", "d2", "d3"], {"d2"}) == 0.5, "Second position = RR 0.5"
assert reciprocal_rank(["d1", "d2", "d3"], {"d3"}) == 1/3, "Third position"
assert reciprocal_rank(["d1", "d2", "d3"], {"d4"}) == 0.0, "Not found"

# Test MRR
results = [
    ["d1", "d2"],  # Query 1: d1 is relevant (RR=1.0)
    ["d3", "d1"],  # Query 2: d1 is relevant (RR=0.5)
]
relevants = [{"d1"}, {"d1"}]
mrr = mean_reciprocal_rank(results, relevants)
assert abs(mrr - 0.75) < 1e-9, f"MRR should be 0.75, got {mrr}"

print("MRR passed!")
`,
    hints: [
      "In `reciprocal_rank`: use `enumerate(retrieved, 1)` to get 1-indexed positions.",
      "Return `1.0 / rank` for the first matching doc.",
      "In `mean_reciprocal_rank`: average all the individual RR scores.",
    ],
    solution: `from typing import List, Set

def reciprocal_rank(retrieved: List[str], relevant: Set[str]) -> float:
    for rank, doc in enumerate(retrieved, 1):
        if doc in relevant:
            return 1.0 / rank
    return 0.0

def mean_reciprocal_rank(results: List[List[str]], relevants: List[Set[str]]) -> float:
    if len(results) == 0:
        return 0.0
    
    total_rr = sum(reciprocal_rank(r, rel) for r, rel in zip(results, relevants))
    return total_rr / len(results)
`,
    prerequisites: ["evaluator-recall-at-k"],
    relatedPlaybooks: ["rag-evaluation-suite", "rag-formulas-cheatsheet"],
  },
  {
    slug: "evaluator-ndcg",
    title: "Build an Evaluator (3): nDCG",
    description:
      "Implement Normalized Discounted Cumulative Gain. Why: Accounts for graded relevance and position. Solves: Handles scenarios where some docs are 'more relevant' than others.",
    group: "Phase 5 — Production Engineering & Security",
    difficulty: "hard",
    xpReward: 100,
    starterCode: `from typing import List, Dict
import math

def dcg_at_k(scores: List[float], k: int) -> float:
    """
    Calculate Discounted Cumulative Gain at k.
    
    DCG@k = Σ (rel_i / log2(i + 1)) for i in 1..k
    
    Where rel_i is the relevance score at position i (1-indexed).
    """
    # TODO: Implement
    raise NotImplementedError

def ndcg_at_k(retrieved: List[str], relevance: Dict[str, float], k: int) -> float:
    """
    Calculate Normalized DCG at k.
    
    nDCG@k = DCG@k / IDCG@k
    
    Where IDCG is the DCG of the ideal (perfect) ranking.
    
    Args:
        retrieved: Ordered list of retrieved doc IDs
        relevance: Dict mapping doc_id -> relevance score (higher = better)
        k: Cutoff position
    
    Returns:
        nDCG score between 0.0 and 1.0
    """
    # TODO: Implement
    raise NotImplementedError
`,
    testCode: `# Test DCG
scores = [3.0, 2.0, 3.0, 0.0, 1.0]
dcg = dcg_at_k(scores, k=5)
# DCG = 3/log2(2) + 2/log2(3) + 3/log2(4) + 0/log2(5) + 1/log2(6)
expected_dcg = 3.0 + 2.0/1.585 + 3.0/2.0 + 0.0 + 1.0/2.585
assert abs(dcg - expected_dcg) < 0.01, f"DCG mismatch"

# Test nDCG
retrieved = ["d1", "d2", "d3"]
relevance = {"d1": 1.0, "d2": 3.0, "d3": 2.0}  # d2 is most relevant but ranked 2nd

ndcg = ndcg_at_k(retrieved, relevance, k=3)
# Actual: [1, 3, 2], Ideal: [3, 2, 1]
# Should be < 1.0 because ranking is not optimal
assert 0.0 < ndcg < 1.0, "nDCG should be between 0 and 1 for non-ideal ranking"

# Perfect ranking should give 1.0
perfect = ["d2", "d3", "d1"]
ndcg_perfect = ndcg_at_k(perfect, relevance, k=3)
assert abs(ndcg_perfect - 1.0) < 1e-6, "Perfect ranking should have nDCG = 1.0"

print("nDCG passed!")
`,
    hints: [
      "In `dcg_at_k`: use `log2(i + 1)` where i is 1-indexed.",
      "For IDCG: sort all relevance scores descending, then compute DCG on that ideal list.",
      "Handle edge case: if IDCG is 0, return 0.0 (no relevant docs).",
    ],
    solution: `from typing import List, Dict
import math

def dcg_at_k(scores: List[float], k: int) -> float:
    dcg = 0.0
    for i, rel in enumerate(scores[:k], 1):
        dcg += rel / math.log2(i + 1)
    return dcg

def ndcg_at_k(retrieved: List[str], relevance: Dict[str, float], k: int) -> float:
    # Get actual scores for retrieved docs
    actual_scores = [relevance.get(doc, 0.0) for doc in retrieved[:k]]
    
    # Compute DCG
    dcg = dcg_at_k(actual_scores, k)
    
    # Compute IDCG (ideal ranking)
    ideal_scores = sorted(relevance.values(), reverse=True)[:k]
    idcg = dcg_at_k(ideal_scores, k)
    
    if idcg == 0:
        return 0.0
    
    return dcg / idcg
`,
    prerequisites: ["evaluator-mrr"],
  },
  {
    slug: "evaluator-precision-at-k",
    title: "Build an Evaluator (4): Precision@K",
    description:
      "Implement Precision@K — measures what proportion of your top-K results are actually relevant. Critical for RAG where every context token counts.",
    group: "Phase 5 — Production Engineering & Security",
    difficulty: "medium",
    xpReward: 75,
    starterCode: `from typing import List, Set

def precision_at_k(retrieved: List[str], relevant: Set[str], k: int) -> float:
    """
    Calculate Precision@K.
    
    Precision@K = |relevant ∩ retrieved[:k]| / k
    
    Args:
        retrieved: Ordered list of retrieved document IDs
        relevant: Set of ground-truth relevant document IDs
        k: Cutoff position
    
    Returns:
        Precision score between 0.0 and 1.0
    
    Edge cases:
        - k <= 0: return 0.0
        - k > len(retrieved): use len(retrieved) as denominator
        - Empty retrieved: return 0.0
    """
    # TODO: Implement
    raise NotImplementedError
`,
    testCode: `# Test case 1: All relevant
retrieved = ["d1", "d2", "d3", "d4", "d5"]
relevant = {"d1", "d2", "d3", "d4", "d5"}
assert precision_at_k(retrieved, relevant, k=5) == 1.0, "All 5 relevant"

# Test case 2: Partial precision
relevant2 = {"d1", "d3"}
assert precision_at_k(retrieved, relevant2, k=5) == 0.4, "2 of 5 relevant"

# Test case 3: Top-K precision
assert precision_at_k(retrieved, relevant2, k=3) == 2/3, "2 of 3 in top-3"

# Test case 4: Edge cases
assert precision_at_k(retrieved, relevant, k=0) == 0.0, "k=0 should return 0"
assert precision_at_k([], relevant, k=5) == 0.0, "Empty retrieved"
assert precision_at_k(retrieved, set(), k=5) == 0.0, "No relevant docs"

# Test case 5: k > retrieved length
short = ["d1", "d2"]
assert precision_at_k(short, {"d1", "d2"}, k=10) == 1.0, "Use actual length"

print("Precision@K passed!")
`,
    hints: [
      "Handle k <= 0 and empty retrieved list first",
      "If k > len(retrieved), use len(retrieved) as denominator",
      "Use set intersection: `set(retrieved[:k]) & relevant`",
    ],
    solution: `from typing import List, Set

def precision_at_k(retrieved: List[str], relevant: Set[str], k: int) -> float:
    if k <= 0 or not retrieved:
        return 0.0
    
    top_k = retrieved[:k]
    actual_k = len(top_k)  # Handle k > len(retrieved)
    
    if actual_k == 0:
        return 0.0
    
    found = set(top_k) & relevant
    return len(found) / actual_k
`,
    complexity: {
      time: "O(k)",
      space: "O(k)",
    },
    realWorld: {
      description: "Precision@K measures context quality in RAG. Low Precision@5 means your LLM context is polluted with irrelevant chunks, causing hallucination.",
      companies: ["Anthropic", "OpenAI", "Cohere"],
      useCases: ["RAG quality", "Reranker tuning", "Context optimization"],
    },
    relatedChallenges: ["evaluator-recall-at-k", "evaluator-map"],
    prerequisites: ["evaluator-ndcg"],
  },
  {
    slug: "evaluator-map",
    title: "Build an Evaluator (5): MAP",
    description:
      "Implement Mean Average Precision — the gold standard for multi-relevant-document ranking evaluation. Combines precision and rank awareness.",
    group: "Phase 5 — Production Engineering & Security",
    difficulty: "hard",
    xpReward: 100,
    starterCode: `from typing import List, Set, Tuple

def average_precision(retrieved: List[str], relevant: Set[str]) -> float:
    """
    Calculate Average Precision for a single query.
    
    AP = (1/R) * Σ (Precision@i * rel(i))
    
    Where R is total relevant docs, and rel(i) is 1 if doc at i is relevant.
    
    Args:
        retrieved: Ordered list of retrieved doc IDs
        relevant: Set of relevant doc IDs
    
    Returns:
        AP score between 0.0 and 1.0
        If no relevant docs exist (R=0), return 0.0
    """
    # TODO: Implement
    raise NotImplementedError

def mean_average_precision(queries: List[Tuple[List[str], Set[str]]]) -> float:
    """
    Calculate MAP across multiple queries.
    
    MAP = (1/|Q|) * Σ AP(q)
    
    Args:
        queries: List of (retrieved, relevant) tuples
    
    Returns:
        MAP score between 0.0 and 1.0
    """
    # TODO: Implement
    raise NotImplementedError
`,
    testCode: `# Test AP: Worked example from content
# Relevant: {A, C, E}, Retrieved: [A, B, C, D, E]
retrieved = ["A", "B", "C", "D", "E"]
relevant = {"A", "C", "E"}
ap = average_precision(retrieved, relevant)
# Precision@1=1/1=1.0 (A relevant), Precision@3=2/3=0.67 (C relevant), Precision@5=3/5=0.6 (E relevant)
# AP = (1.0 + 0.67 + 0.6) / 3 = 0.757
assert abs(ap - 0.757) < 0.01, f"AP should be ~0.757, got {ap}"

# Test perfect ranking
perfect = ["A", "C", "E", "B", "D"]
ap_perfect = average_precision(perfect, relevant)
# All relevant at top: P@1=1, P@2=1, P@3=1
# AP = (1 + 1 + 1) / 3 = 1.0
assert abs(ap_perfect - 1.0) < 1e-6, "Perfect ranking should have AP=1.0"

# Test no relevant found
ap_none = average_precision(["X", "Y", "Z"], relevant)
assert ap_none == 0.0, "No relevant found should be 0"

# Test empty relevant set
ap_empty = average_precision(retrieved, set())
assert ap_empty == 0.0, "Empty relevant set should be 0"

# Test MAP
queries = [
    (["A", "B", "C"], {"A"}),     # AP = 1.0
    (["B", "A", "C"], {"A"}),     # AP = 0.5
    (["C", "B", "A"], {"A"}),     # AP = 0.33
]
map_score = mean_average_precision(queries)
expected_map = (1.0 + 0.5 + 1/3) / 3
assert abs(map_score - expected_map) < 0.01, f"MAP mismatch"

print("MAP passed!")
`,
    hints: [
      "Track running count of relevant docs found",
      "At each relevant position i, add Precision@i to the sum",
      "Divide by total number of relevant docs (R), not retrieved",
      "Edge case: if R=0, return 0.0 immediately",
    ],
    solution: `from typing import List, Set, Tuple

def average_precision(retrieved: List[str], relevant: Set[str]) -> float:
    if not relevant:
        return 0.0
    
    score = 0.0
    relevant_count = 0
    
    for i, doc in enumerate(retrieved, 1):
        if doc in relevant:
            relevant_count += 1
            precision_at_i = relevant_count / i
            score += precision_at_i
    
    return score / len(relevant)

def mean_average_precision(queries: List[Tuple[List[str], Set[str]]]) -> float:
    if not queries:
        return 0.0
    
    total_ap = sum(average_precision(r, rel) for r, rel in queries)
    return total_ap / len(queries)
`,
    complexity: {
      time: "O(n) per query, O(Q*n) for MAP",
      space: "O(1)",
    },
    realWorld: {
      description: "MAP is the gold standard for academic information retrieval benchmarks (TREC, MS MARCO). It combines precision with position-awareness.",
      companies: ["Google", "Microsoft Bing", "Amazon Search"],
      useCases: ["Retrieval benchmarking", "Model comparison", "Academic evaluation"],
    },
    relatedChallenges: ["evaluator-precision-at-k", "evaluator-ndcg"],
    prerequisites: ["evaluator-precision-at-k"],
  },
];
