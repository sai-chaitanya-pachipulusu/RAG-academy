import type { RawChallenge } from "@/lib/challenges/types";

export const EVALUATION_OPS_CHALLENGES: RawChallenge[] = [
  {
    slug: "retrieval-metrics",
    title: "Retrieval Metrics (Recall@K, MRR, nDCG)",
    description:
      "Implement core retrieval metrics (Recall@K, MRR, nDCG). Why: 'It feels better' is not a metric. Solves: Quantifies retrieval quality so you can A/B test improvements.",
    group: "Phase 5 — Production Engineering & Security",
    difficulty: "medium",
    xpReward: 75,
    starterCode: `from typing import Dict, List, Set
import math

def recall_at_k(retrieved: List[int], relevant: Set[int], k: int) -> float:
    # TODO: implement
    raise NotImplementedError

def mrr_at_k(retrieved: List[int], relevant: Set[int], k: int) -> float:
    # TODO: implement
    raise NotImplementedError

def ndcg_at_k(retrieved: List[int], rel: Dict[int, int], k: int) -> float:
    \"\"\"
    nDCG@k with graded relevance rel[doc_id] in {0..}.

    DCG = sum_{i=1..k} (2^rel_i - 1) / log2(i+1)
    nDCG = DCG / IDCG
    \"\"\"
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `retrieved = [4, 1, 2, 3]
relevant = {1, 3}
assert recall_at_k(retrieved, relevant, 1) == 0.0
assert recall_at_k(retrieved, relevant, 2) == 0.5
assert recall_at_k(retrieved, relevant, 4) == 1.0

assert mrr_at_k(retrieved, relevant, 4) == 0.5  # first relevant at rank 2
assert mrr_at_k(retrieved, relevant, 1) == 0.0

# No relevant docs retrieved
assert recall_at_k([9, 8], relevant, 2) == 0.0
assert mrr_at_k([9, 8], relevant, 2) == 0.0

rel = {1: 3, 3: 1}  # graded relevance
v = ndcg_at_k(retrieved, rel, 4)
assert 0.0 <= v <= 1.0
assert v > 0.0

# Perfect ranking should yield 1.0
perfect = [1, 3, 4, 2]
assert abs(ndcg_at_k(perfect, rel, 4) - 1.0) < 1e-9

print("All tests passed!")`,
    hints: [
      "Recall@k = (# relevant in top k) / (total relevant). Handle empty relevant set (guard divide by zero).",
      "MRR@k = 1/rank of first relevant in top k, else 0.",
      "IDCG is DCG of the ideal ordering (sort rel scores desc).",
    ],
    solution: `from typing import Dict, List, Set
import math

def recall_at_k(retrieved: List[int], relevant: Set[int], k: int) -> float:
    if not relevant:
        return 0.0
    top_k = set(retrieved[:k])
    found = len(top_k & relevant)
    return found / len(relevant)

def mrr_at_k(retrieved: List[int], relevant: Set[int], k: int) -> float:
    for rank, doc_id in enumerate(retrieved[:k], start=1):
        if doc_id in relevant:
            return 1.0 / rank
    return 0.0

def ndcg_at_k(retrieved: List[int], rel: Dict[int, int], k: int) -> float:
    def dcg(rankings: List[int]) -> float:
        total = 0.0
        for i, doc_id in enumerate(rankings[:k], start=1):
            relevance = rel.get(doc_id, 0)
            total += (2**relevance - 1) / math.log2(i + 1)
        return total
    
    # Calculate DCG
    dcg_score = dcg(retrieved)
    
    # Calculate IDCG (ideal ordering)
    ideal_order = sorted(rel.items(), key=lambda x: x[1], reverse=True)
    ideal_list = [doc_id for doc_id, _ in ideal_order]
    idcg_score = dcg(ideal_list)
    
    if idcg_score == 0:
        return 0.0
    return dcg_score / idcg_score
`,
    realWorld: {
        description: "Recall@K and nDCG are the gold standards for ranking. In companies like Google or Amazon, even a 0.5% improvement in nDCG can translate to millions of dollars in revenue or massive productivity gains.",
        companies: ["Google", "Amazon", "Elastic", "Microsoft"],
        useCases: ["Search Relevance Tuning", "Recommendation System Eval"],
    },
    relatedPlaybooks: ["rag-formulas-cheatsheet", "rag-evaluation-suite"],
    prerequisites: ["basic-retrieval"],
  },
  {
    slug: "train-only-retrieval-guard",
    title: "Train‑Only Retrieval Guard (No Leakage)",
    description:
      "Build a train-only index and enforce guards. Why: Testing on training data yields 100% accuracy but fails in prod. Solves: Ensures your evaluation metrics reflect real-world generalization.",
    group: "Phase 5 — Production Engineering & Security",
    difficulty: "medium",
    xpReward: 100,
    starterCode: `from typing import Dict, List

Record = Dict[str, str]  # {"id": str, "split": str, "question_hash": str, "text": str}

def build_train_only(records: List[Record]) -> List[Record]:
    \"\"\"
    Keep only split == "train".
    Deduplicate by question_hash (keep the FIRST occurrence).
    Preserve original order of kept records.
    \"\"\"
    # TODO: implement
    raise NotImplementedError

def select_few_shots(candidates: List[Record], k: int, blocked_question_hashes: List[str]) -> List[Record]:
    \"\"\"
    Select exactly k few-shot records from the candidate list, in order.

    Guards:
    - Only split == "train" allowed
    - question_hash must NOT be in blocked_question_hashes

    Raise ValueError if you cannot select k records.
    \"\"\"
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `records = [
  {"id": "1", "split": "train", "question_hash": "a", "text": "t1"},
  {"id": "2", "split": "train", "question_hash": "a", "text": "t1-dup"},
  {"id": "3", "split": "valid", "question_hash": "b", "text": "v1"},
  {"id": "4", "split": "train", "question_hash": "c", "text": "t2"},
]

train = build_train_only(records)
assert [r["id"] for r in train] == ["1", "4"]

candidates = [
  {"id": "x", "split": "train", "question_hash": "z", "text": "x"},
  {"id": "y", "split": "test", "question_hash": "t", "text": "y"},
  {"id": "z", "split": "train", "question_hash": "a", "text": "z"},
  {"id": "w", "split": "train", "question_hash": "b", "text": "w"},
]

sel = select_few_shots(candidates, k=2, blocked_question_hashes=["a"])
assert [r["id"] for r in sel] == ["x", "w"]

try:
  select_few_shots(candidates, k=3, blocked_question_hashes=["a"])
  raise AssertionError("Expected ValueError when not enough candidates pass guards")
except ValueError:
  pass

print("All tests passed!")`,
    hints: [
      "Use a set() to track seen `question_hash` values in `build_train_only`.",
      "In `select_few_shots`, iterate candidates and keep those that pass guards until you reach `k`.",
      "If you exit the loop before selecting `k`, raise `ValueError`.",
    ],
    solution: `from typing import Dict, List

Record = Dict[str, str]

def build_train_only(records: List[Record]) -> List[Record]:
    seen_hashes = set()
    result = []
    for record in records:
        if record["split"] != "train":
            continue
        qh = record["question_hash"]
        if qh in seen_hashes:
            continue
        seen_hashes.add(qh)
        result.append(record)
    return result

def select_few_shots(candidates: List[Record], k: int, blocked_question_hashes: List[str]) -> List[Record]:
    blocked = set(blocked_question_hashes)
    selected = []
    
    for record in candidates:
        if record["split"] != "train":
            continue
        if record["question_hash"] in blocked:
            continue
        selected.append(record)
        if len(selected) == k:
            break
    
    if len(selected) < k:
        raise ValueError(f"Could not select {k} records")
    
    return selected
`,
    timeEstimate: { minutes: 25, label: "25-35 min" },
    realWorld: {
        description: "Data contamination is the 'silent killer' of AI papers and products. If your evaluation set contains snippets that were also in your fine-tuning or few-shot set, your results are 'hallucinated' and won't hold up in production.",
        companies: ["Hugging Face", "OpenAI", "DeepMind"],
        useCases: ["Benchmark Integrity", "LLM Fine-tuning Safety"],
    },
    prerequisites: ["retrieval-metrics"],
    relatedPlaybooks: ["rag-evaluation-suite", "production-deployment-checklist"],
  },
  {
    slug: "embedding-cache",
    title: "Embedding Cache (Latency & Cost)",
    description:
      "Implement an embedding cache keyed by (model, text hash). Why: Embeddings take 50ms+. Solves: Reduces P99 latency and bills for frequent/duplicate indexing requests.",
    group: "Phase 5 — Production Engineering & Security",
    difficulty: "medium",
    xpReward: 75,
    starterCode: `from typing import Dict, List
import hashlib
import re

EMBED_CALLS = 0

def _tokens(text: str) -> List[str]:
    return re.findall(r"[a-z0-9]+", text.lower())

def expensive_embed(model: str, text: str, dim: int = 16) -> List[float]:
    \"\"\"
    Simulated embedding function (deterministic but 'expensive').
    The tests will track EMBED_CALLS to ensure caching works.
    \"\"\"
    global EMBED_CALLS
    EMBED_CALLS += 1

    vec = [0.0] * dim
    for t in _tokens(text):
        idx = int(hashlib.sha1((model + ":" + t).encode("utf-8")).hexdigest(), 16) % dim
        vec[idx] += 1.0
    return vec

class EmbeddingCache:
    def __init__(self):
        # key -> embedding vector
        self._cache: Dict[str, List[float]] = {}

    def embed(self, model: str, text: str) -> List[float]:
        \"\"\"
        Return embedding for (model, text), caching results.

        Requirements:
        - Key must include model AND a stable hash of text (sha1 is fine)
        - Must not call expensive_embed more than once for identical inputs
        - Must return identical vectors for identical inputs
        \"\"\"
        # TODO: implement
        raise NotImplementedError
`,
    testCode: `# Reset counter and validate caching
EMBED_CALLS = 0
c = EmbeddingCache()

v1 = c.embed("m1", "hello world")
v2 = c.embed("m1", "hello world")
assert v1 == v2
assert EMBED_CALLS == 1, "identical (model,text) should be cached"

_ = c.embed("m2", "hello world")
assert EMBED_CALLS == 2, "different model must not reuse cache"

_ = c.embed("m1", "hello world!")
assert EMBED_CALLS == 3, "different text must not reuse cache"

# Cross-model collision check (unlikely with sha1 but logical check)
v3 = c.embed("m1", "hash_collision")
v4 = c.embed("m2", "hash_collision")
assert v3 != v4 or EMBED_CALLS == 5, "Should call expensive_embed for both"

print("All tests passed!")`,
    hints: [
      "Use `hashlib.sha1(text.encode('utf-8')).hexdigest()` for a stable text hash.",
      "A simple cache key: `f\"{model}:{text_sha1}\"`.",
      "Cache should store and return the computed vector (not recompute).",
    ],
    solution: `from typing import Dict, List
import hashlib
import re

EMBED_CALLS = 0

def _tokens(text: str) -> List[str]:
    return re.findall(r"[a-z0-9]+", text.lower())

def expensive_embed(model: str, text: str, dim: int = 16) -> List[float]:
    global EMBED_CALLS
    EMBED_CALLS += 1
    vec = [0.0] * dim
    for t in _tokens(text):
        idx = int(hashlib.sha1((model + ":" + t).encode("utf-8")).hexdigest(), 16) % dim
        vec[idx] += 1.0
    return vec

class EmbeddingCache:
    def __init__(self):
        self._cache: Dict[str, List[float]] = {}
    
    def embed(self, model: str, text: str) -> List[float]:
        text_hash = hashlib.sha1(text.encode("utf-8")).hexdigest()
        key = f"{model}:{text_hash}"
        
        if key not in self._cache:
            self._cache[key] = expensive_embed(model, text)
        
        return self._cache[key]
`,
    realWorld: {
        description: "Large-scale RAG pipelines (like those indexing millions of documents daily) often spend 60% of their compute on redundant embeddings. Semantic caching can reduce API costs by 30-50% in multi-turn assistant scenarios.",
        companies: ["Cohere", "Pinecone", "Redis"],
        useCases: ["Reducing API Bills", "Low-Latency Autocomplete"],
    },
    relatedPlaybooks: ["production-deployment-checklist", "rag-troubleshooting-guide"],
    prerequisites: ["embed-and-search"],
  },
  {
    slug: "retrieval-cache-key",
    title: "Retrieval Cache Key (Stable & Safe)",
    description:
      "Design a deterministic cache key for retrieval results (query + filters). Why: 'Same' query needs to hit cache even if json key order differs. Solves: Prevents cache fragmentation.",
    group: "Phase 5 — Production Engineering & Security",
    difficulty: "medium",
    xpReward: 75,
    starterCode: `from typing import Any, Dict, Optional
import hashlib
import json
import re

def normalize_query(q: str) -> str:
    \"\"\"Lowercase, trim, and collapse whitespace.\"\"\"
    # TODO: implement
    raise NotImplementedError

def normalize_filters(obj: Any) -> Any:
    \"\"\"
    Produce a JSON-serializable normalized structure where:
    - dict keys are sorted (recursively)
    - lists of primitive values are sorted for stability
    \"\"\"
    # TODO: implement
    raise NotImplementedError

def retrieval_cache_key(query: str, filters: Optional[Dict[str, Any]], index_version: str) -> str:
    \"\"\"
    Return a stable SHA256 hex key for (normalized query, normalized filters, index_version).

    Rules:
    - Treat filters None and {} equivalently.
    - Key must be deterministic regardless of dict key order / list order.
    \"\"\"
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `f1 = {"dept": "hr", "date": {"$gte": "2024-01-01"}, "tags": ["a", "b"]}
f2 = {"tags": ["b", "a"], "date": {"$gte": "2024-01-01"}, "dept": "hr"}

k1 = retrieval_cache_key("  Rotate   API  Key ", f1, index_version="v1")
k2 = retrieval_cache_key("rotate api key", f2, index_version="v1")
assert k1 == k2, "Order-insensitive filters and query normalization should match"

k3 = retrieval_cache_key("rotate api key", f2, index_version="v2")
assert k3 != k2, "Index version must affect cache key"

k4 = retrieval_cache_key("rotate api key", None, index_version="v1")
k5 = retrieval_cache_key("rotate api key", {}, index_version="v1")
assert k4 == k5, "None and {} filters should be treated the same"

# Nested list stability
f3 = {"groups": [["b", "a"], ["d", "c"]]} # list of lists
f4 = {"groups": [["b", "a"], ["c", "d"]]} # value sort inside list might differ? 
# Depends on spec, but let's just ensure robust serialization doesn't crash
_ = retrieval_cache_key("q", f3, "v1")

print("All tests passed!")`,
    hints: [
      "Normalize query using regex: `re.sub(r\"\\s+\", \" \", q.strip().lower())`.",
      "For `normalize_filters`: recurse; for dicts sort keys; for lists of strings/numbers sort values.",
      "Serialize with `json.dumps(..., sort_keys=True, separators=(\",\", \":\"))` before hashing.",
    ],
    realWorld: {
        description: "Deterministic cache keys enable 'Read-Through' caching. If your key design is weak (e.g. doesn't sort filters), you'll end up with duplicate entries for the same query, wasting storage and compute.",
        companies: ["Cloudflare", "Akamai", "Vercel"],
        useCases: ["Edge Caching", "Global Search Low Latency"],
    },
    prerequisites: ["embedding-cache"],
    relatedPlaybooks: ["production-deployment-checklist", "rag-techniques-encyclopedia"],
  },
  {
    slug: "route-by-difficulty",
    title: "Query Routing (Fast/Standard/Slow Path)",
    description:
      "Route queries to different retrieval pipelines based on difficulty. Why: HyDE is expensive; not every query needs it. Solves: Optimizes cost/latency by applying 'heavy' techniques only when necessary.",
    group: "Phase 5 — Production Engineering & Security",
    difficulty: "medium",
    xpReward: 75,
    starterCode: `from typing import Dict, List
import re

def _tokens(q: str) -> List[str]:
    return re.findall(r"[a-z0-9_]+", q.lower())

def route_query(query: str) -> Dict[str, object]:
    \"\"\"
    Return a routing plan dict with keys:
      - path: "fast" | "standard" | "slow"
      - use_hyde: bool
      - use_multi_query: bool
      - use_hybrid: bool
      - k_initial: int
      - k_final: int

    Rules (simple production-inspired heuristics):
    - If token_count <= 3: slow path (enable HyDE + multi-query + hybrid, bigger candidate pool)
    - Else if query contains ID-like tokens (digits or underscore): standard path but hybrid on
    - Else if token_count >= 12: fast path (no HyDE/multi-query; hybrid still on)
    - Else: standard path
    \"\"\"
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `p1 = route_query("renew secrets")
assert p1["path"] == "slow"
assert p1["use_hyde"] is True
assert p1["use_multi_query"] is True
assert p1["use_hybrid"] is True
assert p1["k_initial"] >= 30

p2 = route_query("api_key rotation policy 2024")
assert p2["path"] in ("standard", "fast")
assert p2["use_hybrid"] is True

p3 = route_query("how do i implement reciprocal rank fusion for hybrid retrieval in production systems")
assert p3["path"] == "fast"
assert p3["use_hyde"] is False
assert p3["use_multi_query"] is False

# Standard path specifically (moderate length, no IDs)
p4 = route_query("concept of retrieval")
assert p4["path"] == "standard"

print("All tests passed!")`,
    hints: [
      "Compute `token_count = len(_tokens(query))`.",
      "Detect ID-like tokens by checking: `any(char.isdigit() for char in token)` or `'_' in token`.",
      "Return concrete `k_initial`/`k_final` values (e.g. slow: 50→8, standard: 20→5, fast: 15→5).",
    ],
    realWorld: {
        description: "Dynamic routing allows a system to support both power-users (who need expensive reasoning) and light-users (who need fast answers) without blowing the budget. It's the key to making RAG economically viable at scale.",
        companies: ["Intercom", "Klarna", "Shopify"],
        useCases: ["Cost-aware AI Architects", "Hybrid Query Optimization"],
    },
    prerequisites: ["tool-use-basics"],
    relatedPlaybooks: ["rag-techniques-encyclopedia", "production-deployment-checklist"],
  },
];
