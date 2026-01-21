import type { RawChallenge } from "@/lib/challenges/types";

import { TECH_SUPPORT_DATASET } from "../datasets/techSupport";

export const RETRIEVAL_CHALLENGES: RawChallenge[] = [
  {
    slug: "basic-retrieval",
    title: "Basic Retrieval (Top‑K)",
    description:
      "Given vectors and a query vector, retrieve the top‑k most similar items. Why: Finding relevant data in a sea of embeddings is the core task. Solves: Filters millions of documents to the few relevant ones needed for context.",
    group: "Phase 2 — Retrieval & Query Engineering",
    difficulty: "medium",
    xpReward: 50,
    starterCode: `from typing import List, Tuple
import math

def cosine_similarity(a: List[float], b: List[float]) -> float:
    if len(a) != len(b):
        raise ValueError("length mismatch")
    da = sum(x*x for x in a)
    db = sum(x*x for x in b)
    if da == 0 or db == 0:
        raise ValueError("zero magnitude")
    dot = sum(x*y for x, y in zip(a, b))
    return dot / (math.sqrt(da) * math.sqrt(db))

def top_k_cosine(vectors: List[List[float]], query: List[float], k: int) -> List[Tuple[int, float]]:
    \"\"\"
    Return top-k (index, score) pairs sorted by score desc.

    Rules:
    - k must be > 0
    - if k > len(vectors), return all
    \"\"\"
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `vecs = [
  [1, 0],
  [0, 1],
  [2, 0],
  [0.5, 0.5],
]
out = top_k_cosine(vecs, [1, 0], 2)
assert out[0][0] in (0, 2)
assert out[1][0] in (0, 2)
assert out[0][0] != out[1][0]
assert out[0][1] >= out[1][1]

# Test exact match
out_exact = top_k_cosine(vecs, [0, 1], 1)
assert out_exact[0][0] == 1
assert abs(out_exact[0][1] - 1.0) < 1e-9

try:
  top_k_cosine(vecs, [1, 0], 0)
  raise AssertionError("Expected ValueError for k <= 0")
except ValueError:
  pass

print("All tests passed!")`,
    hints: [
      "Loop through all vectors, compute `cosine_similarity` for each.",
      "Store results as `(index, score)` tuples.",
      "Use `sorted(results, key=lambda x: x[1], reverse=True)` to sort by score descending.",
      "Return the first `k` elements: `results[:k]`.",
    ],
    solution: `from typing import List, Tuple
import math

def cosine_similarity(a: List[float], b: List[float]) -> float:
    if len(a) != len(b):
        raise ValueError("length mismatch")
    da = sum(x*x for x in a)
    db = sum(x*x for x in b)
    if da == 0 or db == 0:
        raise ValueError("zero magnitude")
    dot = sum(x*y for x, y in zip(a, b))
    return dot / (math.sqrt(da) * math.sqrt(db))

def top_k_cosine(vectors: List[List[float]], query: List[float], k: int) -> List[Tuple[int, float]]:
    if k <= 0:
        raise ValueError("k must be > 0")
    
    results = []
    for i, vec in enumerate(vectors):
        score = cosine_similarity(vec, query)
        results.append((i, score))
    
    results.sort(key=lambda x: x[1], reverse=True)
    return results[:k]
`,
    timeEstimate: { minutes: 25, label: "25-30 min" },
    realWorld: {
        description: "Exact k-NN (k-Nearest Neighbors) search is the foundation of all vector retrieval. While approximate indexes (like HNSW) are faster, exact search is still used for small datasets (<10k vectors) where speed is already sub-millisecond.",
        companies: ["ChromaDB (default)", "FAISS (FlatIndex)"],
        useCases: ["Small Dataset Search", "Unit Testing Retrieval Pipelines"],
    },
    relatedPlaybooks: ["rag-techniques-encyclopedia", "tool-comparison-matrix"],
  },
  {
    slug: "embed-and-search",
    title: "Embed & Search (Toy Embeddings)",
    description:
      "Create simple embeddings and search documents without external APIs. Why: Understanding the internals builds intuition. Solves: Demystifies 'vector search' by implementing the full loop from scratch.",
    group: "Phase 2 — Retrieval & Query Engineering",
    difficulty: "medium",
    xpReward: 50,
    starterCode: `from typing import List, Tuple
import math
import re

def _tokens(text: str) -> List[str]:
    return re.findall(r"[a-z0-9]+", text.lower())

def embed(text: str, dim: int = 32) -> List[float]:
    \"\"\"
    Create a simple embedding vector of length dim using hashing.
    This is NOT a real embedding model; it’s for learning retrieval mechanics.
    \"\"\"
    # TODO: implement
    raise NotImplementedError

def cosine(a: List[float], b: List[float]) -> float:
    dot = sum(x*y for x, y in zip(a, b))
    da = sum(x*x for x in a)
    db = sum(x*x for x in b)
    if da == 0 or db == 0:
        return 0.0
    return dot / (math.sqrt(da) * math.sqrt(db))

def search(docs: List[str], query: str, k: int = 3) -> List[Tuple[int, float]]:
    \"\"\"
    Embed all docs and query, then return top-k doc indices by cosine similarity.
    \"\"\"
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `docs = [
  "RAG retrieves context then generates answers.",
  "Vector databases store embeddings for similarity search.",
  "Bananas are yellow fruit.",
]
out = search(docs, "How does retrieval augmented generation work?", k=2)
assert len(out) == 2
assert out[0][1] >= out[1][1]
# Based on simple hashing, "retrieval", "augmented", "generation" usually overlap 
# more with the first sentence than the banana sentence.
assert out[0][0] in (0, 1)

# Test empty query safely returns 0 scores (or low scores)
out_empty = search(docs, "", k=1)
assert len(out_empty) == 1
# Just ensure it runs without crashing

print("All tests passed!")`,
    hints: [
      "To embed: Initialize a vector of zeros `[0.0] * dim`.",
      "For each token in text, hash it: `idx = hash(token) % dim`.",
      "Increment that index: `vec[idx] += 1.0`.",
      "For search: Embed the query, then loop through embedded docs and compute cosine.",
    ],
    solution: `from typing import List, Tuple
import math
import re

def _tokens(text: str) -> List[str]:
    return re.findall(r"[a-z0-9]+", text.lower())

def embed(text: str, dim: int = 32) -> List[float]:
    vec = [0.0] * dim
    for token in _tokens(text):
        idx = hash(token) % dim
        vec[idx] += 1.0
    return vec

def cosine(a: List[float], b: List[float]) -> float:
    dot = sum(x*y for x, y in zip(a, b))
    da = sum(x*x for x in a)
    db = sum(x*x for x in b)
    if da == 0 or db == 0:
        return 0.0
    return dot / (math.sqrt(da) * math.sqrt(db))

def search(docs: List[str], query: str, k: int = 3) -> List[Tuple[int, float]]:
    query_vec = embed(query)
    results = []
    for i, doc in enumerate(docs):
        doc_vec = embed(doc)
        score = cosine(query_vec, doc_vec)
        results.append((i, score))
    results.sort(key=lambda x: (-x[1], x[0]))
    return results[:k]
`,
    timeEstimate: { minutes: 20, label: "20-25 min" },
    prerequisites: ["basic-retrieval"],
    realWorld: {
        description: "Production RAG used to rely on complex models, but 'Toy' techniques like the Hashing Trick are still used in edge-computing and embedded devices where memory is too scarce for big Transformer models.",
        companies: ["Apple (on-device search)", "Mozilla"],
        useCases: ["On-device Privacy-safe Search", "Edge Device Context Retrieval"],
    },
    relatedPlaybooks: ["rag-techniques-encyclopedia", "tool-comparison-matrix"],
  },
  {
    slug: "bm25-from-scratch",
    title: "BM25 (Sparse Retrieval)",
    description:
      "Implement BM25 ranking. Why: Dense vectors fail at exact keyword matching (e.g., 'Error 504'). Solves: Provides precise keyword/ID matching that semantic search often misses.",
    group: "Phase 1 — Online: Retrieval (Hybrid)",
    difficulty: "hard",
    xpReward: 125,
    benchmark: true,
    dataset: TECH_SUPPORT_DATASET,
    starterCode: `from typing import Dict, List, Tuple
import math
import re

def tokenize(text: str) -> List[str]:
    return re.findall(r"[a-z0-9]+", text.lower())

def build_df(docs_tokens: List[List[str]]) -> Dict[str, int]:
    \"\"\"
    Return document frequency per token.
    df[token] = number of documents that contain token at least once.
    \"\"\"
    # TODO: implement
    raise NotImplementedError

def bm25_score(
    query_tokens: List[str],
    doc_tokens: List[str],
    df: Dict[str, int],
    N: int,
    avgdl: float,
    k1: float = 1.5,
    b: float = 0.75,
) -> float:
    \"\"\"
    Compute BM25 score of one document for the given query.

    Use this IDF (common + stable in practice):
      idf(t) = ln(1 + (N - df(t) + 0.5) / (df(t) + 0.5))

    Notes:
    - Only query term presence in doc matters (term frequency helps via BM25 tf formula).
    - If a query token never appears in the corpus (not in df), it should contribute 0.
    \"\"\"
    # TODO: implement
    raise NotImplementedError

def bm25_rank(docs: List[str], query: str, k: int = 3) -> List[Tuple[int, float]]:
    \"\"\"
    Online step: return top-k (doc_index, score) sorted by score desc.
    \"\"\"
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `docs = [
  "the quick brown fox jumps over the lazy dog",
  "the quick brown dog leaps over the lazy fox",
  "lorem ipsum dolor sit amet",
  "api_key rotation policy: rotate keys every 90 days",
  "how to rotate api keys: use the security dashboard",
]

out = bm25_rank(docs, "brown fox", k=2)
assert len(out) == 2
assert out[0][1] >= out[1][1]
assert out[0][0] in (0, 1), "BM25 should rank the brown/fox docs highest"

out2 = bm25_rank(docs, "api_key rotation", k=2)
assert out2[0][0] in (3, 4), "BM25 should surface keyword-heavy policy docs"

# Test unknown token
out_unknown = bm25_rank(docs, "supercalifragilistic", k=5)
# Should all be zero (or close to), order doesn't matter much but shouldn't crash
assert len(out_unknown) == 5

# Basic sanity: k > len(docs) returns all docs
out3 = bm25_rank(docs, "quick", k=99)
assert len(out3) == len(docs)

print("All tests passed!")

# --- BENCHMARK (Scoring) ---
import time
import json

num_docs = 0
num_queries = 0

start = time.time()

if "DATASET" in globals() and DATASET:
    # Use injected dataset
    bench_docs = [d["content"] for d in DATASET["docs"]]
    bench_queries = [q["text"] for q in DATASET["queries"]]
    num_docs = len(bench_docs)
    num_queries = len(bench_queries)
    
    # Simple loop to load test
    results_for_viz = []
    for i, q in enumerate(bench_queries):
        ranks = bm25_rank(bench_docs, q, k=10)
        
        # Capture first 3 queries for visualization
        if i < 3:
            hits = []
            for doc_idx, score in ranks:
               if 0 <= doc_idx < len(bench_docs):
                   preview = bench_docs[doc_idx][:60] + "..."
                   hits.append({"doc_id": doc_idx, "score": round(score, 4), "preview": preview})
            results_for_viz.append({"query": q, "hits": hits})
else:
    # Synthetic fallback
    num_docs = 50
    num_queries = 1
    bench_docs = ["apple banana cherry " * 20 for _ in range(50)]
    _ = bm25_rank(bench_docs, "apple banana", k=10)
    results_for_viz = []

end = time.time()

latency_ms = (end - start) * 1000
# Simple adaptive score based on load
target_ms = 10 * num_queries
_SCORE = max(0, min(100, int(100 - (latency_ms - target_ms) * 0.5)))
_METRICS = {"latency_ms": round(latency_ms, 2), "docs": num_docs, "queries": num_queries}
_VISUALS = {"type": "retrieval", "samples": results_for_viz} if results_for_viz else {}`,
    hints: [
      "Step 1: Calculate `df` (Document Frequency). A set of unique tokens per doc helps: `df[t] += 1`.",
      "Step 2: Calculate `avgdl` (Average Document Length) = `total_tokens / num_docs`.",
      "Step 3: For each doc, sum up the score for every token in the query.",
      "Wait, don't loop over all query tokens? Yes, loop `for t in query_tokens`. If `t` is in doc, add to score.",
      "Use `math.log` for natural logarithm.",
    ],
    realWorld: {
      description: "BM25 is the industry-standard algorithm for keyword search, powering Elasticsearch, Solr, and Lucene. It remains superior to vector search for exact matches like product IDs or error codes.",
      companies: ["Elastic", "Amazon", "Wikipedia", "Home Depot"],
      useCases: ["E-commerce Search", "Log Analysis", "Legal Search (Exact Phrases)"],
    },
    relatedPlaybooks: ["rag-techniques-encyclopedia", "rag-formulas-cheatsheet"],
  },
  {
    slug: "bm25-field-boosting",
    title: "BM25 Field Boosting (Title vs Body)",
    description:
      "Boost matches in important fields (e.g., title). Why: A match in the title is worth more than a footnote. Solves: Improves relevance by weighting structural importance of terms.",
    group: "Phase 1 — Online: Retrieval (BM25)",
    difficulty: "medium",
    xpReward: 75,
    starterCode: `from typing import Any, Dict, List
import math
from collections import Counter

Doc = Dict[str, Any]  # {"id": str, "title": List[str], "body": List[str]}

def rank_docs_bm25_field_boost(
    docs: List[Doc],
    query_tokens: List[str],
    title_boost: float = 2.0,
    body_boost: float = 1.0,
    k1: float = 1.5,
    b: float = 0.75,
) -> List[str]:
    \"\"\"
    Rank docs by BM25 where term frequency is boosted per field:
      tf = title_boost*tf_title + body_boost*tf_body

    Requirements:
    - Compute df across docs using the combined fields (title+body)
    - avgdl is average combined length across docs
    - IDF: ln(1 + (N - df + 0.5) / (df + 0.5))
    - Validate: title_boost > 0, body_boost > 0, k1 > 0, 0 <= b <= 1
    - Return doc_ids sorted by score desc; tie-break by doc_id asc

    Notes:
    - docs already contain tokenized fields (lists of tokens).
    - Query tokens may contain duplicates; treat them as set-like (counting duplicates is optional).
    \"\"\"
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `docs = [
  {"id": "d1", "title": ["rag", "pipeline"], "body": ["intro", "to", "rag"]},
  {"id": "d2", "title": ["intro"], "body": ["rag", "pipeline", "rag", "pipeline"]},
  {"id": "d3", "title": ["pipeline"], "body": ["random", "text"]},
]
q = ["rag", "pipeline"]

out = rank_docs_bm25_field_boost(docs, q, title_boost=3.0, body_boost=1.0)
assert out[0] == "d1", "Title matches should win when title_boost is high"
assert set(out) == {"d1", "d2", "d3"}

out2 = rank_docs_bm25_field_boost(docs, q, title_boost=0.5, body_boost=1.0)
assert out2[0] == "d2", "Body repetition should win when title_boost is low"

try:
  rank_docs_bm25_field_boost(docs, q, title_boost=0.0)
  raise AssertionError("Expected ValueError for non-positive boost")
except ValueError:
  pass

print("All tests passed!")`,
    hints: [
      "Compute df[token] as #docs where token appears in (title+body) at least once.",
      "For each doc, compute tf_title and tf_body with Counter().",
      "BM25 uses: score += idf * ((tf*(k1+1)) / (tf + k1*(1-b + b*dl/avgdl))).",
    ],
    realWorld: {
        description: "Every major e-commerce site uses field boosting. They know a user searching for 'iPhone 15' wants documents where 'iPhone 15' is in the title, not just buried in the 10-page terms and conditions.",
        companies: ["Amazon", "eBay", "Shopify"],
        useCases: ["E-commerce Product Search", "Technical Documentation Search"],
    },
  },
  {
    slug: "rrf-fusion",
    title: "RRF Fusion (Hybrid Retrieval)",
    description:
      "Fuse BM25 + dense rankings using Reciprocal Rank Fusion (RRF). Why: Hybrid search is robust but scores are uncomparable. Solves: Combines different retrieval methods without needing complex score normalization.",
    group: "Phase 1 — Online: Retrieval (Hybrid)",
    difficulty: "medium",
    xpReward: 75,
    starterCode: `from typing import Dict, List, Tuple

def rrf_fuse(rankings: List[List[int]], k: int = 60, top_n: int = 10) -> List[Tuple[int, float]]:
    \"\"\"
    Reciprocal Rank Fusion.

    rankings: list of ranked lists of doc_ids (best first).

    Score:
      score(doc) = sum( 1 / (k + rank) ) over each ranking where doc appears
      where rank is 1-based (first item has rank 1).

    Return: list of (doc_id, score) sorted by score desc.
    \"\"\"
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `dense = [5, 1, 2, 3]
bm25 = [1, 4, 5, 2]
fused = rrf_fuse([dense, bm25], k=60, top_n=10)

# Basic shape
assert len(fused) >= 4
assert fused[0][1] >= fused[1][1]

# Doc 1 appears near top in both lists → should beat doc 4 (only appears once)
scores = {doc: score for doc, score in fused}
assert scores[1] > scores[4]

# Check precise math for doc 5
# dense: rank 1 (score 1/61)
# bm25: rank 3 (score 1/63)
# total: 1/61 + 1/63
expected_5 = (1.0/61.0) + (1.0/63.0)
assert abs(scores[5] - expected_5) < 1e-9

# top_n should cap output
fused2 = rrf_fuse([dense, bm25], k=60, top_n=2)
assert len(fused2) == 2

print("All tests passed!")`,
    hints: [
      "Initialize a `defaultdict(float)` to accumulate scores.",
      "Iterate `enumerate(ranking)` to get 0-based index `i`. Rank is `i + 1`.",
      "Formula per list per doc: `score += 1 / (k + rank)`.",
      "Finally, convert dict to list and sort.",
    ],
    solution: `from typing import List, Tuple
from collections import defaultdict

def rrf_fuse(
    rankings: List[List[Tuple[int, float]]],
    k: int = 60,
    top_n: int = 10,
) -> List[Tuple[int, float]]:
    scores = defaultdict(float)
    
    for ranking in rankings:
        for i, (doc_id, _) in enumerate(ranking):
            rank = i + 1  # 1-based rank
            scores[doc_id] += 1.0 / (k + rank)
    
    # Sort by score desc, then by doc_id for tie-breaking
    result = sorted(scores.items(), key=lambda x: (-x[1], x[0]))
    return result[:top_n]
`,
    timeEstimate: { minutes: 25, label: "25-30 min" },
    realWorld: {
        description: "RRF is why Hybrid Search (Vector + BM25) is so popular. It was popularized by Elasticsearch and Pinecone as a robust way to bypass the 'normalization problem' when combining different scoring systems.",
        companies: ["Elastic", "Pinecone", "Algolia"],
        useCases: ["Hybrid Semantic/Keyword Search", "Ranking Aggregation"],
    },
    relatedPlaybooks: ["rag-formulas-cheatsheet", "rag-techniques-encyclopedia"],
    benchmark: true,
    dataset: TECH_SUPPORT_DATASET,
  },
  {
    slug: "weighted-rrf-fusion",
    title: "Weighted RRF Fusion",
    description:
      "Implement weighted RRF to bias fusion toward one retriever. Why: Sometimes one signal is cleaner (e.g., strong keyword intent). Solves: Allows tuning the balance between semantic and keyword signals.",
    group: "Phase 1 — Online: Retrieval (Hybrid)",
    difficulty: "medium",
    xpReward: 75,
    starterCode: `from typing import List, Optional, Tuple

def weighted_rrf(
    results: List[List[str]],
    weights: Optional[List[float]] = None,
    k: int = 60,
) -> List[Tuple[str, float]]:
    \"\"\"
    Weighted Reciprocal Rank Fusion (RRF).

    Score:
      score(doc) = sum_i w_i * 1/(k + rank_i(doc))

    Where rank is 1-based (first item has rank 1).

    Rules:
    - results is a list of ranked doc_id lists (best first)
    - If weights is None, treat all weights as 1.0
    - If weights is provided, len(weights) must equal len(results) else raise ValueError
    - k must be > 0 else raise ValueError
    - Return list of (doc_id, score) sorted by score desc; tie-break by doc_id asc
    \"\"\"
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `res = [
  ["A", "B", "C"],
  ["B", "D", "A"],
]

out = weighted_rrf(res, k=60)
ids = [d for d, _ in out]
assert ids[0] == "B"
assert set(ids) == {"A", "B", "C", "D"}
assert out[0][1] >= out[1][1] >= out[2][1]

# If we heavily down-weight the 2nd list, docs that only appear in list 2 should drop
out2 = weighted_rrf(res, weights=[1.0, 0.1], k=60)
ids2 = [d for d, _ in out2]
assert ids2.index("C") < ids2.index("D"), "With list2 down-weighted, C should beat D"

try:
  weighted_rrf(res, weights=[1.0], k=60)
  raise AssertionError("Expected ValueError for weights length mismatch")
except ValueError:
  pass

try:
  weighted_rrf(res, k=0)
  raise AssertionError("Expected ValueError for k <= 0")
except ValueError:
  pass

print("All tests passed!")`,
    hints: [
      "Use a dict doc_id -> score and sum contributions across lists.",
      "Remember: rank is 1-based, so enumerate index+1.",
      "Sort by (-score, doc_id) for stable output.",
    ],
    solution: `from typing import List, Optional, Tuple
from collections import defaultdict

def weighted_rrf(
    results: List[List[str]],
    weights: Optional[List[float]] = None,
    k: int = 60,
) -> List[Tuple[str, float]]:
    if k <= 0:
        raise ValueError("k must be > 0")
    
    if weights is None:
        weights = [1.0] * len(results)
    
    if len(weights) != len(results):
        raise ValueError("weights length must match results length")
    
    scores = defaultdict(float)
    
    for ranking, weight in zip(results, weights):
        for i, doc_id in enumerate(ranking):
            rank = i + 1  # 1-based rank
            scores[doc_id] += weight * (1.0 / (k + rank))
    
    # Sort by score desc, then by doc_id for tie-breaking
    result = sorted(scores.items(), key=lambda x: (-x[1], x[0]))
    return result
`,
    timeEstimate: { minutes: 25, label: "25-35 min" },
    realWorld: {
        description: "Production engineers use weighted RRF to 'tilt' the system. For example, in a medical RAG, you might weight the peer-reviewed database higher than the general patient FAQ database.",
        companies: ["UpToDate", "LexisNexis"],
        useCases: ["Prioritizing Trusted Sources", "Tuning Multi-index Retrieval"],
    },
    prerequisites: ["rrf-fusion"],
    relatedPlaybooks: ["rag-formulas-cheatsheet", "rag-techniques-encyclopedia"],
  },
];


