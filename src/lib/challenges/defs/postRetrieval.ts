import type { RawChallenge } from "@/lib/challenges/types";

export const POST_RETRIEVAL_CHALLENGES: RawChallenge[] = [
  {
    slug: "rerank-cascade",
    title: "Reranking (Cross-Encoder Cascade)",
    description:
      "Implement a production reranking cascade: cheap shortlist → expensive cross-encoder. Why: Bi-encoders are fast but less accurate; cross-encoders are accurate but slow. Solves: Get high precision without burning 500ms per query.",
    group: "Phase 3 — Reranking & Context Optimization",
    difficulty: "medium",
    xpReward: 75,
    prerequisites: ["basic-retrieval"],
    starterCode: `from typing import List, Tuple
import re

CROSS_CALLS = 0

def _tokens(text: str) -> List[str]:
    return re.findall(r"[a-z0-9]+", text.lower())

def cheap_score(query: str, doc: str) -> float:
    # Cheap proxy: token overlap count
    q = set(_tokens(query))
    d = set(_tokens(doc))
    return float(len(q.intersection(d)))

def cross_encoder_score(query: str, doc: str) -> float:
    # Simulated "expensive" reranker (counts phrase + bigram matches).
    global CROSS_CALLS
    CROSS_CALLS += 1

    qt = _tokens(query)
    dt = _tokens(doc)

    # Token overlap
    overlap = len(set(qt).intersection(set(dt)))

    # Bigram overlap
    qb = set(zip(qt, qt[1:]))
    db = set(zip(dt, dt[1:]))
    bigrams = len(qb.intersection(db))

    # Phrase match bonus (after normalization)
    qnorm = " ".join(qt)
    dnorm = " ".join(dt)
    phrase = 1 if qnorm and qnorm in dnorm else 0

    return overlap + 3.0 * bigrams + 10.0 * phrase

def rerank_cascade(docs: List[str], query: str, k_initial: int = 20, k_final: int = 5) -> List[Tuple[int, float]]:
    \"\"\"
    Production pattern:
    1) Score ALL docs with cheap_score, keep top k_initial candidates.
    2) Score ONLY those candidates with cross_encoder_score.
    3) Return top k_final (doc_index, cross_score) sorted by score desc.

    Important: cross_encoder_score is 'expensive'. Do NOT call it on all docs.
    \"\"\"
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `docs = [
  "Bananas are yellow fruit.",
  "API key rotation policy: rotate keys every 90 days.",
  "How to rotate API keys: use the security dashboard to rotate your API key.",
  "RAG retrieves context then generates answers.",
]

# Reset counter and run
CROSS_CALLS = 0
out = rerank_cascade(docs, "api key rotation", k_initial=2, k_final=1)
assert len(out) == 1
assert out[0][0] in (1, 2), "Reranker should return the best policy/how-to doc"
assert CROSS_CALLS <= 2, "cross_encoder_score should only run on the shortlist"

# If k_initial is large, calls can be larger, but must still be <= k_initial
CROSS_CALLS = 0
_ = rerank_cascade(docs, "rag retrieves context", k_initial=3, k_final=2)
assert CROSS_CALLS <= 3

print("All tests passed!")`,
    hints: [
      "First stage: compute cheap_score for all docs, sort desc, keep top k_initial indices.",
      "Second stage: compute cross_encoder_score only for those indices, then sort desc and keep k_final.",
      "Resetting CROSS_CALLS in tests works because tests run in the same Python namespace.",
    ],
    solution: `from typing import List, Tuple
import re

CROSS_CALLS = 0

def _tokens(text: str) -> List[str]:
    return re.findall(r"[a-z0-9]+", text.lower())

def cheap_score(query: str, doc: str) -> float:
    q = set(_tokens(query))
    d = set(_tokens(doc))
    return float(len(q.intersection(d)))

def cross_encoder_score(query: str, doc: str) -> float:
    global CROSS_CALLS
    CROSS_CALLS += 1
    qt = _tokens(query)
    dt = _tokens(doc)
    overlap = len(set(qt).intersection(set(dt)))
    qb = set(zip(qt, qt[1:]))
    db = set(zip(dt, dt[1:]))
    bigrams = len(qb.intersection(db))
    qnorm = " ".join(qt)
    dnorm = " ".join(dt)
    phrase = 1 if qnorm and qnorm in dnorm else 0
    return overlap + 3.0 * bigrams + 10.0 * phrase

def rerank_cascade(docs: List[str], query: str, k_initial: int = 20, k_final: int = 5) -> List[Tuple[int, float]]:
    # Stage 1: Cheap scoring to get shortlist
    cheap_scores = [(i, cheap_score(query, doc)) for i, doc in enumerate(docs)]
    cheap_scores.sort(key=lambda x: x[1], reverse=True)
    shortlist = cheap_scores[:k_initial]
    
    # Stage 2: Expensive reranking on shortlist only
    reranked = []
    for idx, _ in shortlist:
        score = cross_encoder_score(query, docs[idx])
        reranked.append((idx, score))
    
    reranked.sort(key=lambda x: x[1], reverse=True)
    return reranked[:k_final]
`,
    realWorld: {
        description: "Standard pattern in 'Cascade Retrieval'. You use a fast but weak model (BM25/Bi-Encoder) to find 1000 docs, then a slow but powerful model (Cross-Encoder) to pick the best 5. This is how search engines like Google work.",
        companies: ["Google", "Cohere", "Baidu"],
        useCases: ["Million-scale Retrieval", "High-accuracy Enterprise Search"],
    },
    relatedPlaybooks: ["rag-techniques-encyclopedia", "tool-comparison-matrix"],
    benchmark: true,
  },
  {
    slug: "mmr-diversity",
    title: "MMR (Diversity / De-dup)",
    description:
      "Select a diverse context set using Maximal Marginal Relevance (MMR). Why: Top-k often returns 5 identical chunks. Solves: Ensures the model sees diverse perspectives, not just the same sentence repeated 5 times.",
    group: "Phase 3 — Reranking & Context Optimization",
    difficulty: "hard",
    xpReward: 125,
    starterCode: `from typing import Dict, List, Tuple

def mmr_select(
    candidates: List[int],
    relevance: Dict[int, float],
    similarity: Dict[Tuple[int, int], float],
    k: int,
    lambda_mult: float = 0.7,
) -> List[int]:
    \"\"\"
    Maximal Marginal Relevance (MMR) selection.

    Pick k items from candidates.

    For each step:
      score(d) = lambda * relevance(d) - (1-lambda) * max_{s in selected} sim(d, s)

    similarity is provided as a dict for (min_id, max_id) pairs.
    If a pair is missing, treat sim as 0.0.

    Tie-breaker: if scores are equal, pick smaller doc_id.
    \"\"\"
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `candidates = [0, 1, 2, 3]
relevance = {0: 0.95, 1: 0.94, 2: 0.80, 3: 0.79}
# 0 and 1 are near-duplicates; 2 and 3 are different
similarity = {
  (0, 1): 0.98,
  (0, 2): 0.10,
  (0, 3): 0.10,
  (1, 2): 0.10,
  (1, 3): 0.10,
  (2, 3): 0.05,
}

picked = mmr_select(candidates, relevance, similarity, k=2, lambda_mult=0.7)
assert picked[0] == 0, "Should pick the most relevant doc first"
assert picked[1] in (2, 3), "Should avoid near-duplicate doc 1"

picked3 = mmr_select(candidates, relevance, similarity, k=3, lambda_mult=0.7)
assert 1 not in picked3[:2], "Near-duplicate should be delayed when diversity matters"

# Test pure relevance (lambda=1.0)
picked_rel = mmr_select(candidates, relevance, similarity, k=2, lambda_mult=1.0)
assert picked_rel == [0, 1], "Lambda=1.0 should pick top relevance ignoring similarity"

print("All tests passed!")`,
    hints: [
      "Keep a selected list; loop until `len(selected) == k` or candidates exhausted.",
      "For max similarity against selected: `max(sim(d,s) for s in selected)` or 0 if none.",
      "Store similarity keys as `(min(a,b), max(a,b))` when looking up.",
    ],
    solution: `from typing import Dict, List, Tuple

def mmr_select(
    candidates: List[int],
    relevance: Dict[int, float],
    similarity: Dict[Tuple[int, int], float],
    k: int,
    lambda_mult: float = 0.7,
) -> List[int]:
    selected = []
    remaining = set(candidates)
    
    while len(selected) < k and remaining:
        best_doc = None
        best_score = float('-inf')
        
        for doc in remaining:
            rel = relevance.get(doc, 0.0)
            
            # Max similarity to any selected doc
            max_sim = 0.0
            for s in selected:
                key = (min(doc, s), max(doc, s))
                sim = similarity.get(key, 0.0)
                max_sim = max(max_sim, sim)
            
            # MMR score
            score = lambda_mult * rel - (1 - lambda_mult) * max_sim
            
            if score > best_score or (score == best_score and (best_doc is None or doc < best_doc)):
                best_score = score
                best_doc = doc
        
        if best_doc is not None:
            selected.append(best_doc)
            remaining.remove(best_doc)
    
    return selected
`,
    realWorld: {
        description: "MMR is essential for RAG when your documents contain many repetitive facts (like news articles about the same event). It prevents the 'Echo Chamber' effect where the LLM only sees one source's viewpoint.",
        companies: ["Bloomberg", "Reuters", "Microsoft Research"],
        useCases: ["News Aggregation", "Multi-source QA"],
    },
    prerequisites: ["cosine-similarity"],
    relatedPlaybooks: ["rag-formulas-cheatsheet", "rag-techniques-encyclopedia"],
  },
  {
    slug: "exact-dedup",
    title: "Exact De-duplication (Hash-Based)",
    description:
      "Remove duplicate chunks safely using content hashes. Why: Duplicates waste tokens and confuse the model. Solves: Hard-deduplication ensures unique information density.",
    group: "Phase 3 — Reranking & Context Optimization",
    difficulty: "medium",
    xpReward: 75,
    starterCode: `from typing import Dict, List, Tuple
import hashlib

def content_sha1(text: str) -> str:
    return hashlib.sha1(text.encode("utf-8")).hexdigest()

def dedup_keep_first(chunks: List[str]) -> Tuple[List[str], Dict[str, int]]:
    \"\"\"
    Remove exact-duplicate chunks using a stable content hash.

    Return:
    - unique_chunks: list of chunks, keeping the FIRST occurrence only
    - first_index_by_hash: mapping of sha1 -> first index where it appeared

    Rules:
    - preserve original chunk text exactly
    - preserve order of first occurrences
    \"\"\"
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `chunks = [
  "A: rotate keys every 90 days.",
  "B: use the dashboard to rotate keys.",
  "A: rotate keys every 90 days.",  # duplicate
  "C: store tenant_id metadata.",
  "B: use the dashboard to rotate keys.",  # duplicate
]

unique, idx = dedup_keep_first(chunks)
assert unique == [
  "A: rotate keys every 90 days.",
  "B: use the dashboard to rotate keys.",
  "C: store tenant_id metadata.",
]

assert idx[content_sha1("A: rotate keys every 90 days.")] == 0
assert idx[content_sha1("B: use the dashboard to rotate keys.")] == 1
assert idx[content_sha1("C: store tenant_id metadata.")] == 3

print("All tests passed!")`,
    hints: [
      "Compute sha1 for each chunk and keep a seen set.",
      "Keep first occurrence: if sha1 already seen, skip.",
      "Also populate the mapping sha1 -> first index.",
    ],
    solution: `from typing import Dict, List, Tuple
import hashlib

def content_sha1(text: str) -> str:
    return hashlib.sha1(text.encode("utf-8")).hexdigest()

def dedup_keep_first(chunks: List[str]) -> Tuple[List[str], Dict[str, int]]:
    unique_chunks = []
    first_index_by_hash = {}
    seen = set()
    
    for i, chunk in enumerate(chunks):
        h = content_sha1(chunk)
        if h not in seen:
            seen.add(h)
            unique_chunks.append(chunk)
            first_index_by_hash[h] = i
    
    return unique_chunks, first_index_by_hash
`,
    timeEstimate: { minutes: 15, label: "15-20 min" },
    realWorld: {
        description: "The simplest but most effective way to save money on RAG. Exact deduplication before vector indexing can reduce index size (and bill) by 20-40% in enterprise data.",
        companies: ["AWS", "Google Cloud", "Snowflake"],
        useCases: ["Cost Optimization", "Log Indexing"],
    },
    relatedPlaybooks: ["production-deployment-checklist", "rag-techniques-encyclopedia"],
  },
  {
    slug: "lost-in-the-middle-ordering",
    title: "Lost-in-the-Middle Ordering",
    description:
      "Order context so the most important evidence is at the start AND end. Why: LLMs pay more attention to the beginning and end of long prompts. Solves: Mitigates the 'Lost in the Middle' phenomenon where evidence buried in the center is ignored.",
    group: "Phase 3 — Reranking & Context Optimization",
    difficulty: "medium",
    xpReward: 75,
    starterCode: `from typing import List

def order_for_attention(doc_ids: List[int], scores: List[float]) -> List[int]:
    \"\"\"
    Given candidate doc_ids and their relevance scores (parallel arrays),
    return an ordered list that mitigates 'lost in the middle':

    Strategy:
    - Sort by score desc (tie-break: smaller doc_id first)
    - Place best at position 0, second-best at last, third at position 1, fourth at second last, etc.

    Rules:
    - len(doc_ids) == len(scores)
    - return [] if empty
    \"\"\"
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `ids = [10, 11, 12, 13, 14]
scores = [0.9, 0.88, 0.8, 0.79, 0.1]
out = order_for_attention(ids, scores)

# best (10) should be first, second best (11) should be last
assert out[0] == 10
assert out[-1] == 11

# must contain same set
assert set(out) == set(ids)

# Test even length
ids2 = [1, 2]
scores2 = [0.9, 0.1]
out2 = order_for_attention(ids2, scores2)
assert out2[0] == 1
assert out2[-1] == 2

print("All tests passed!")`,
    hints: [
      "Create a sorted list of `(score, doc_id)`, sort by `(-score, doc_id)`.",
      "Then build output by alternating front/back placement: index 0 -> front, 1 -> back, 2 -> front + 1...",
    ],
    solution: `from typing import List

def order_for_attention(doc_ids: List[int], scores: List[float]) -> List[int]:
    # Sort by score desc, then doc_id asc for tie-breaking
    paired = list(zip(scores, doc_ids))
    paired.sort(key=lambda x: (-x[0], x[1]))
    sorted_ids = [doc_id for _, doc_id in paired]
    
    # Build alternating placement: best at front, 2nd best at back, etc.
    result = [None] * len(sorted_ids)
    front = 0
    back = len(sorted_ids) - 1
    
    for i, doc_id in enumerate(sorted_ids):
        if i % 2 == 0:
            result[front] = doc_id
            front += 1
        else:
            result[back] = doc_id
            back -= 1
    
    return result
`,
    timeEstimate: { minutes: 25, label: "25-30 min" },
    realWorld: {
        description: "Stanford researchers found that LLM performance drops to 50% when the correct answer is in the middle of a long prompt. This 'U-Shaped' attention curve is why ordering matters as much as retrieval.",
        companies: ["Stanford University", "OpenAI", "Anthropic"],
        useCases: ["Long-Context RAG", "Legal Document Review"],
    },
    prerequisites: ["rerank-cascade"],
    relatedPlaybooks: ["rag-techniques-encyclopedia", "prompt-templates"],
  },
  {
    slug: "token-budget-packing",
    title: "Token Budget Packing (Context Window)",
    description:
      "Pack the best evidence into a token budget without exceeding the context window. Why: Context windows are finite and expensive. Solves: Maximizes information density per dollar.",
    group: "Phase 3 — Reranking & Context Optimization",
    difficulty: "hard",
    xpReward: 125,
    starterCode: `from typing import List, Tuple
import re

def estimate_tokens(text: str) -> int:
    \"\"\"
    Simple token estimate: count word-like tokens.
    (Production uses real tokenizers, but budgeting logic is similar.)
    \"\"\"
    return len(re.findall(r"[a-z0-9_]+", text.lower()))

def pack_context(
    items: List[Tuple[str, int]],
    max_tokens: int,
) -> List[Tuple[str, int]]:
    \"\"\"
    items: list of (text, score_int) where score_int is higher = better.

    Return a subset of items under max_tokens total (using estimate_tokens)
    maximizing total score (knapsack).

    Rules:
    - Must not exceed max_tokens
    - If multiple optimal solutions, prefer fewer items (for readability)
    - If still tied, prefer lexicographical smaller concatenation of texts
    \"\"\"
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `items = [
  ("Chunk A: api key rotation policy rotate keys every 90 days.", 10),
  ("Chunk B: use dashboard to rotate api keys.", 8),
  ("Chunk C: bananas are yellow fruit.", 1),
  ("Chunk D: caching embeddings by text hash saves cost.", 6),
]

# Tight budget should pick A + D (higher score) over A + B (if it doesn't fit)
out = pack_context(items, max_tokens=18)
texts = [t for t, _ in out]
assert sum(estimate_tokens(t) for t, _ in out) <= 18
assert sum(s for _, s in out) >= 16

print("All tests passed!")`,
    hints: [
      "This is a 0/1 knapsack problem. `dp[w] = max_score` for budget `w`.",
      "Or since N is small, just check combinations recursively.",
      "Track `(score, -count, -text)` to handle the tie-breaking preferences automatically.",
    ],
    solution: `from typing import List, Tuple
import re

def estimate_tokens(text: str) -> int:
    return len(re.findall(r"[a-z0-9_]+", text.lower()))

def pack_context(
    items: List[Tuple[str, int]],
    max_tokens: int,
) -> List[Tuple[str, int]]:
    # Greedy approach: sort by score/token ratio (efficiency)
    # Filter out items that exceed budget
    valid = [(text, score) for text, score in items if estimate_tokens(text) <= max_tokens]
    
    # Sort by score descending
    valid.sort(key=lambda x: -x[1])
    
    result = []
    remaining_budget = max_tokens
    
    for text, score in valid:
        tokens = estimate_tokens(text)
        if tokens <= remaining_budget:
            result.append((text, score))
            remaining_budget -= tokens
    
    return result
`,
    timeEstimate: { minutes: 30, label: "30-40 min" },
    realWorld: {
        description: "Standard algorithmic problem rebranded for AI. Every token costs fractions of a cent, but at scale, 'over-packing' irrelevant context can cost thousands of dollars per month.",
        companies: ["Stripe", "Intercom", "Notion"],
        useCases: ["Cost Management", "Low-Latency RAG"],
    },
    prerequisites: ["lost-in-the-middle-ordering"],
    relatedPlaybooks: ["production-deployment-checklist", "prompt-templates"],
  },
  {
    slug: "autocut-threshold",
    title: "Autocut (Similarity Drop-off)",
    description:
      "Automatically cut off search results where similarity scores drop significantly. Why: Top-k=10 might return 2 great results and 8 irrelevant ones. Solves: Prevents noisy, irrelevant context from entering the prompt.",
    group: "Phase 3 — Reranking & Context Optimization",
    difficulty: "medium",
    xpReward: 75,
    starterCode: `from typing import List, Tuple

def autocut(results: List[Tuple[int, float]], threshold_multiplier: float = 1.5) -> List[Tuple[int, float]]:
    \"\"\"
    Filter results by detecting the largest relative 'drop' in score.
    
    Rule:
    1. Calculate gaps between consecutive scores: gap[i] = score[i] - score[i+1].
    2. If gap[i] > average_of_previous_gaps * threshold_multiplier, cut off everything after i.
    \"\"\"
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `res = [(101, 0.95), (102, 0.94), (103, 0.92), (104, 0.50), (105, 0.48)]
cut = autocut(res, threshold_multiplier=2.0)
# Gap between 103 and 104 is 0.42. Previous gaps are 0.01 and 0.02.
# 0.42 is much larger than avg(0.01, 0.02) * 2.
assert len(cut) == 3
assert cut[-1][0] == 103

print("All tests passed!")`,
    hints: [
      "Keep track of cumulative average gap.",
      "Check if current gap exceeds the weighted average.",
    ],
    solution: `from typing import List, Tuple

def autocut(results: List[Tuple[int, float]], threshold_multiplier: float = 1.5) -> List[Tuple[int, float]]:
    if len(results) <= 1:
        return results
    
    gaps = []
    for i in range(len(results) - 1):
        gap = results[i][1] - results[i+1][1]
        gaps.append(gap)
    
    # Find where to cut
    for i, gap in enumerate(gaps):
        if i == 0:
            continue
        
        # Average of previous gaps
        avg_prev = sum(gaps[:i]) / i
        
        # If current gap is significantly larger than average
        if gap > avg_prev * threshold_multiplier:
            return results[:i+1]
    
    return results
`,
    timeEstimate: { minutes: 25, label: "25-35 min" },
    realWorld: {
        description: "Popularized by Weaviate. Instead of a hard 'k', Autocut adaptively shrinks or expands your context window based on how much the database actually 'knows' about the query.",
        companies: ["Weaviate", "Qdrant"],
        useCases: ["High-Precision RAG", "Dynamic Context Windows"],
    },
    relatedPlaybooks: ["rag-techniques-encyclopedia", "tool-comparison-matrix"],
  },
  {
    slug: "extractive-compression",
    title: "Extractive Compression (Keep Only Relevant Sentences)",
    description:
      "Compress long chunks by extracting only sentences relevant to the query. Why: Whole paragraphs contain fluff. Solves: Increases effective context window size by removing irrelevant sentences.",
    group: "Phase 3 — Reranking & Context Optimization",
    difficulty: "medium",
    xpReward: 75,
    starterCode: `from typing import List
import re

def split_sentences(text: str) -> List[str]:
    # Simple sentence split for the lab
    parts = re.split(r"(?<=[.!?])\\s+", text.strip())
    return [p for p in parts if p]

def compress_extractive(chunk: str, query: str, max_sentences: int = 2) -> str:
    \"\"\"
    Extractive compression:
    - split chunk into sentences
    - score each sentence by token overlap with query
    - keep up to max_sentences best sentences (original order)

    Rules:
    - If nothing overlaps, return the first sentence (fallback)
    - Preserve original sentence text exactly
    \"\"\"
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `chunk = (
  "API key rotation policy: rotate keys every 90 days. "
  "Bananas are yellow fruit. "
  "Use the security dashboard to rotate your api keys."
)
q = "how to rotate api key"
out = compress_extractive(chunk, q, max_sentences=2)
assert "rotate keys every 90 days" in out
assert "dashboard" in out
assert "Bananas" not in out

print("All tests passed!")`,
    hints: [
      "Tokenize by re.findall(r\"[a-z0-9_]+\", ...).",
      "Score sentence by |tokens(sentence) ∩ tokens(query)|.",
      "Keep best sentences but output them in original order for readability.",
    ],
    realWorld: {
        description: "Standard optimization in RAG pipelines. Instead of sending the full 1000-word chunk to the LLM, you 'skim' it for relevant sentences. This saves 70% in token costs and reduces noise, leading to more grounded answers.",
        companies: ["Glean", "Metaphor (Exa)", "Unstructured.io"],
        useCases: ["Token Cost Reduction", "Improving Model Concentration"],
    },
    relatedPlaybooks: ["rag-techniques-encyclopedia", "prompt-templates"],
  },
];


