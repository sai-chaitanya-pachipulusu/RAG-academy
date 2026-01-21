
import type { RawChallenge } from "@/lib/challenges/types";

/**
 * ENHANCED CHALLENGES: Phase 0-5 Improvements
 * These challenges fill critical gaps to make the curriculum production-grade.
 */
export const ENHANCED_CHALLENGES: RawChallenge[] = [
  // ============================================================
  // PHASE 0: FOUNDATIONS - CRITICAL ADDITIONS
  // ============================================================
  {
    slug: "vector-normalization",
    title: "Vector Normalization (L2 Norm)",
    description: "Normalize a vector to unit length. Why: Most vector DBs assume normalized vectors; mixing unnormalized vectors breaks similarity. Solves: Ensures consistency when mixing embeddings from different sources.",
    group: "Phase 0 — Vector Math & Foundations",
    difficulty: "easy",
    xpReward: 25,
    starterCode: `from typing import List
import math

def l2_normalize(vec: List[float]) -> List[float]:
    """
    Return a unit-length vector (L2 norm = 1).
    
    Rules:
    - If vec is a zero vector, return it unchanged.
    - Preserve the number of dimensions.
    """
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `v1 = l2_normalize([3.0, 4.0])
assert abs(v1[0] - 0.6) < 1e-9
assert abs(v1[1] - 0.8) < 1e-9

# Check length is 1
import math
length = math.sqrt(sum(x*x for x in v1))
assert abs(length - 1.0) < 1e-9

# Zero vector
assert l2_normalize([0.0, 0.0]) == [0.0, 0.0]

print("All tests passed!")`,
    hints: [
      "Magnitude = sqrt(sum(x^2 for x in vec)).",
      "Divide each element by magnitude.",
      "Handle zero vector separately (can't divide by zero).",
    ],
    solution: `from typing import List
import math

def l2_normalize(vec: List[float]) -> List[float]:
    magnitude = math.sqrt(sum(x*x for x in vec))
    if magnitude == 0:
        return vec  # Return zero vector unchanged
    return [x / magnitude for x in vec]
`,
    timeEstimate: { minutes: 10, label: "10-15 min" },
    realWorld: {
      description: "Pinecone, Weaviate, and Qdrant all have a 'cosine' similarity mode that assumes vectors are already normalized. If you mix sources (OpenAI + Cohere embeddings), you MUST normalize before merging indexes.",
      companies: ["Pinecone", "Weaviate", "Qdrant"],
      useCases: ["Multi-model RAG", "Index Migration"],
    },
  },
  {
    slug: "sparse-vector-bow",
    title: "Sparse Vector (Bag of Words)",
    description: "Create a sparse Bag-of-Words representation of text. Why: Sparse vectors are the backbone of BM25 and hybrid search. Solves: Allows exact keyword matching that dense vectors miss.",
    group: "Phase 0 — Vector Math & Foundations",
    difficulty: "easy",
    xpReward: 25,
    starterCode: `from typing import Dict, List
import re

def to_bow(text: str) -> Dict[str, int]:
    """
    Create a Bag-of-Words (term frequency) dictionary.
    
    Rules:
    - Lowercase and tokenize by [a-z0-9]+.
    - Return a dict mapping token -> count.
    """
    # TODO: implement
    raise NotImplementedError

def sparse_dot_product(a: Dict[str, int], b: Dict[str, int]) -> int:
    """
    Compute dot product of two sparse BOW vectors.
    
    The dot product is the sum of term_a * term_b for shared keys.
    """
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `bow1 = to_bow("apple banana apple cherry")
assert bow1 == {"apple": 2, "banana": 1, "cherry": 1}

bow2 = to_bow("apple cherry cherry")
assert bow2 == {"apple": 1, "cherry": 2}

# Dot product: apple: 2*1 = 2, cherry: 1*2 = 2 -> Total = 4
assert sparse_dot_product(bow1, bow2) == 4

print("All tests passed!")`,
    hints: [
      "Use re.findall for tokenization.",
      "Use a Counter or dict to count tokens.",
      "For dot product, iterate over keys in one dict, check if present in other.",
    ],
    solution: `from typing import Dict, List
import re
from collections import Counter

def to_bow(text: str) -> Dict[str, int]:
    tokens = re.findall(r"[a-z0-9]+", text.lower())
    return dict(Counter(tokens))

def sparse_dot_product(a: Dict[str, int], b: Dict[str, int]) -> int:
    total = 0
    for key, val in a.items():
        if key in b:
            total += val * b[key]
    return total
`,
    timeEstimate: { minutes: 15, label: "15-20 min" },
    realWorld: {
      description: "Sparse vectors are how Elasticsearch and BM25 work. They allow exact 'Error 504' matches that dense vectors often miss because they rely on semantic similarity, not keyword overlap.",
      companies: ["Elastic", "Vespa AI", "Pinecone (Hybrid Mode)"],
      useCases: ["Hybrid Search", "Exact Keyword Matching"],
    },
  },
  {
    slug: "batch-dot-product",
    title: "Batched Dot Product (Matrix Multiply)",
    description: "Compute dot products for multiple query-document pairs efficiently. Why: Looping in Python is slow; vectorized operations are 100x faster. Solves: Scales retrieval from 1,000 to 1,000,000 vectors without timeout.",
    group: "Phase 0 — Vector Math & Foundations",
    difficulty: "medium",
    xpReward: 50,
    starterCode: `from typing import List

def batch_dot(query: List[float], documents: List[List[float]]) -> List[float]:
    """
    Compute dot product of 'query' with each document in 'documents'.
    
    Returns a list of scores where scores[i] = dot(query, documents[i]).
    
    Rules:
    - All vectors must have the same dimension as query.
    - Do NOT use numpy (for learning purposes; use list comprehensions).
    """
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `query = [1.0, 2.0]
docs = [[1.0, 0.0], [0.0, 1.0], [1.0, 1.0]]
scores = batch_dot(query, docs)
assert scores == [1.0, 2.0, 3.0]

print("All tests passed!")`,
    hints: [
      "Outer loop over documents.",
      "Inner sum over zip(query, doc).",
      "This is the 'pure Python' baseline; numpy would be matrix multiply.",
    ],
    solution: `from typing import List

def batch_dot(query: List[float], documents: List[List[float]]) -> List[float]:
    scores = []
    for doc in documents:
        score = sum(q * d for q, d in zip(query, doc))
        scores.append(score)
    return scores
`,
    timeEstimate: { minutes: 10, label: "10-15 min" },
    realWorld: {
      description: "Production vector search uses SIMD (Single Instruction Multiple Data) and GPU acceleration (FAISS, cuANN). This challenge teaches the mental model before moving to optimized libraries.",
      companies: ["NVIDIA (RAPIDS)", "Meta AI (FAISS)"],
      useCases: ["GPU-accelerated Search", "Low-latency RAG"],
    },
  },
  // ============================================================
  // PHASE 1: DATA LAYER - CRITICAL ADDITIONS
  // ============================================================
  {
    slug: "sentence-chunking",
    title: "Sentence-based Chunking",
    description: "Chunk text by sentences instead of characters. Why: Character boundaries can split words; sentence boundaries are semantically meaningful. Solves: Preserves complete thoughts for better retrieval quality.",
    group: "Phase 1 — The Data Layer (Ingestion & Indexing)",
    difficulty: "medium",
    xpReward: 50,
    starterCode: `from typing import List
import re

def split_sentences(text: str) -> List[str]:
    """
    Split text into sentences.
    
    Rules:
    - Split on '.', '!', '?' followed by whitespace or end of string.
    - Preserve the delimiter at the end of each sentence.
    - Strip leading/trailing whitespace from each sentence.
    - Discard empty strings.
    """
    # TODO: implement
    raise NotImplementedError

def chunk_by_sentences(text: str, max_sentences: int = 3) -> List[str]:
    """
    Chunk text so each chunk has at most max_sentences.
    
    Combine sentences with a single space.
    """
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `text = "Hello world. How are you? I am fine! This is RAG. It retrieves context."
sents = split_sentences(text)
assert len(sents) == 5
assert sents[0] == "Hello world."
assert sents[1] == "How are you?"

chunks = chunk_by_sentences(text, max_sentences=2)
assert len(chunks) == 3
assert chunks[0] == "Hello world. How are you?"
assert chunks[1] == "I am fine! This is RAG."
assert chunks[2] == "It retrieves context."

print("All tests passed!")`,
    hints: [
      "Use regex: re.split(r'(?<=[.!?])\\s+', text).",
      "Group sentences into chunks of max_sentences.",
    ],
    solution: `from typing import List
import re

def split_sentences(text: str) -> List[str]:
    # Split on sentence-ending punctuation followed by whitespace
    pattern = r'(?<=[.!?])\\s+'
    parts = re.split(pattern, text.strip())
    return [s.strip() for s in parts if s.strip()]

def chunk_by_sentences(text: str, max_sentences: int = 3) -> List[str]:
    sentences = split_sentences(text)
    chunks = []
    
    for i in range(0, len(sentences), max_sentences):
        chunk_sents = sentences[i:i + max_sentences]
        chunks.append(" ".join(chunk_sents))
    
    return chunks
`,
    timeEstimate: { minutes: 20, label: "20-25 min" },
    realWorld: {
      description: "Sentence chunking is how LlamaIndex's 'SentenceSplitter' works. It's preferred for Q&A because each chunk represents a complete idea, improving embedding quality.",
      companies: ["LlamaIndex", "Haystack"],
      useCases: ["FAQ Indexing", "Research Paper QA"],
    },
  },
  {
    slug: "recursive-splitter",
    title: "Recursive Character Splitter",
    description: "Implement the recursive splitting strategy used by LangChain. Why: One separator may not work for all documents. Solves: Falls back from paragraphs to sentences to words as needed.",
    group: "Phase 1 — The Data Layer (Ingestion & Indexing)",
    difficulty: "hard",
    xpReward: 125,
    starterCode: `from typing import List

def recursive_split(
    text: str,
    max_chunk_size: int,
    separators: List[str] = ["\\n\\n", "\\n", ". ", " "],
) -> List[str]:
    """
    Recursively split text to fit within max_chunk_size.
    
    Logic:
    1. Try to split by the first separator.
    2. If any resulting chunk is still too long, recursively split it with the next separator.
    3. If no separators left, split by character (hard limit).
    """
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `text = "First paragraph.\\n\\nSecond paragraph is long. It has many sentences. More content here.\\n\\nThird."
chunks = recursive_split(text, max_chunk_size=50)
for chunk in chunks:
    assert len(chunk) <= 50, f"Chunk too long: {chunk}"
assert len(chunks) >= 3
print("All tests passed!")`,
    hints: [
      "Base case: if text fits, return [text].",
      "Recursive case: split by sep[0], recursively call with sep[1:] on oversized chunks.",
      "Merge small adjacent pieces if they fit together.",
    ],
    solution: `from typing import List

def recursive_split(
    text: str,
    max_chunk_size: int,
    separators: List[str] = ["\\n\\n", "\\n", ". ", " "],
) -> List[str]:
    # Base case: text fits
    if len(text) <= max_chunk_size:
        return [text] if text.strip() else []
    
    # No separators left: hard split
    if not separators:
        chunks = []
        for i in range(0, len(text), max_chunk_size):
            chunk = text[i:i + max_chunk_size]
            if chunk.strip():
                chunks.append(chunk)
        return chunks
    
    # Try to split by first separator
    sep = separators[0]
    parts = text.split(sep)
    
    result = []
    for part in parts:
        if len(part) <= max_chunk_size:
            if part.strip():
                result.append(part)
        else:
            # Recursively split with remaining separators
            result.extend(recursive_split(part, max_chunk_size, separators[1:]))
    
    return result
`,
    timeEstimate: { minutes: 35, label: "35-45 min" },
    realWorld: {
      description: "The default chunker in LangChain. Its fallback ladder (paragraph -> sentence -> word -> character) makes it robust for any document type from Markdown to legal contracts.",
      companies: ["LangChain", "LlamaIndex"],
      useCases: ["Universal Document Ingestion", "Mixed-Format Processing"],
    },
  },
  // ============================================================
  // PHASE 2: RETRIEVAL - CRITICAL ADDITIONS
  // ============================================================
  {
    slug: "similarity-threshold",
    title: "Similarity Score Threshold",
    description: "Filter results by an absolute similarity threshold, not just top-K. Why: Top-k=10 might return 10 irrelevant docs. Solves: Ensures minimum quality for returned results.",
    group: "Phase 2 — Retrieval & Query Engineering",
    difficulty: "easy",
    xpReward: 50,
    starterCode: `from typing import List, Tuple

def filter_by_threshold(
    results: List[Tuple[int, float]],
    min_score: float,
) -> List[Tuple[int, float]]:
    """
    Filter (doc_id, score) pairs to keep only those with score >= min_score.
    
    Preserve original order.
    """
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `res = [(1, 0.95), (2, 0.70), (3, 0.50), (4, 0.30)]
filtered = filter_by_threshold(res, min_score=0.60)
assert filtered == [(1, 0.95), (2, 0.70)]

# Edge case: nothing passes
assert filter_by_threshold(res, min_score=0.99) == []

print("All tests passed!")`,
    hints: [
      "Simple list comprehension filter.",
      "Combine with top-k for 'top-k with minimum quality'.",
    ],
    solution: `from typing import List, Tuple

def filter_by_threshold(
    results: List[Tuple[int, float]],
    min_score: float,
) -> List[Tuple[int, float]]:
    return [(doc_id, score) for doc_id, score in results if score >= min_score]
`,
    timeEstimate: { minutes: 10, label: "10-15 min" },
    realWorld: {
      description: "Used in production to prevent 'garbage retrieval'. If the best match is only 0.3 similarity, the model should probably refuse to answer rather than try to fabricate an answer from bad context.",
      companies: ["Perplexity", "Cohere"],
      useCases: ["High-confidence Retrieval", "Refusal Policy Triggering"],
    },
  },
  {
    slug: "recency-boost",
    title: "Recency Boosting",
    description: "Boost retrieval scores based on document recency. Why: A 2024 policy overrides a 2019 policy. Solves: Ensures 'freshness' is a factor in retrieval, not just semantic similarity.",
    group: "Phase 2 — Retrieval & Query Engineering",
    difficulty: "medium",
    xpReward: 75,
    starterCode: `from typing import List, Tuple
import time

def boost_by_recency(
    results: List[Tuple[int, float, int]],  # (doc_id, score, timestamp)
    decay_factor: float = 0.5,
    reference_time: int = None,
) -> List[Tuple[int, float]]:
    """
    Boost scores based on recency.
    
    Formula:
    - age_days = (reference_time - timestamp) / 86400
    - boost = 1 / (1 + decay_factor * age_days)
    - new_score = score * boost
    
    If reference_time is None, use current time.
    
    Return (doc_id, new_score) sorted by new_score desc.
    """
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `now = 1700000000
results = [
    (1, 0.90, now - 86400),      # 1 day old
    (2, 0.85, now),              # fresh
    (3, 0.95, now - 86400 * 365) # 1 year old
]

boosted = boost_by_recency(results, decay_factor=0.1, reference_time=now)

# Fresh doc (2) should beat old doc (3) despite lower base score
assert boosted[0][0] == 2 or boosted[0][0] == 1

print("All tests passed!")`,
    hints: [
      "Calculate age in days from timestamp difference.",
      "Apply hyperbolic decay: 1 / (1 + factor * age).",
      "Sort by boosted score descending.",
    ],
    solution: `from typing import List, Tuple
import time

def boost_by_recency(
    results: List[Tuple[int, float, int]],
    decay_factor: float = 0.5,
    reference_time: int = None,
) -> List[Tuple[int, float]]:
    if reference_time is None:
        reference_time = int(time.time())
    
    boosted = []
    for doc_id, score, timestamp in results:
        age_days = (reference_time - timestamp) / 86400
        boost = 1 / (1 + decay_factor * age_days)
        new_score = score * boost
        boosted.append((doc_id, new_score))
    
    # Sort by new_score descending
    boosted.sort(key=lambda x: -x[1])
    return boosted
`,
    timeEstimate: { minutes: 20, label: "20-25 min" },
    realWorld: {
      description: "News and financial RAG systems always use recency boosting. A 2023 price quote is useless if a 2024 quote exists. Time-decay ensures the model uses the latest information.",
      companies: ["Bloomberg", "Reuters", "Google News"],
      useCases: ["News Aggregation", "Financial Analysis"],
    },
  },
  // ============================================================
  // PHASE 3: RERANKING - CRITICAL ADDITIONS
  // ============================================================
  {
    slug: "llm-reranker",
    title: "LLM-as-a-Reranker",
    description: "Use an LLM to rerank search results by asking 'Is this relevant?'. Why: Cross-encoders are good; LLMs can be even better for complex reasoning. Solves: Provides 'semantic reranking' for nuanced queries.",
    group: "Phase 3 — Reranking & Context Optimization",
    difficulty: "hard",
    xpReward: 125,
    starterCode: `from typing import List, Tuple

def simulate_llm_relevance(query: str, doc: str) -> float:
    """
    Simulate an LLM's relevance judgment (0.0 to 1.0).
    
    Heuristic for this lab:
    - If query keywords (nouns) appear in doc -> higher score.
    - If doc contains 'policy' or 'official' -> bonus.
    """
    import re
    q_tokens = set(re.findall(r'[a-z]+', query.lower()))
    d_tokens = set(re.findall(r'[a-z]+', doc.lower()))
    
    overlap = len(q_tokens & d_tokens) / max(len(q_tokens), 1)
    bonus = 0.1 if ('policy' in d_tokens or 'official' in d_tokens) else 0
    
    return min(1.0, overlap + bonus)

def llm_rerank(
    query: str,
    docs: List[str],
    top_k: int = 3,
) -> List[Tuple[int, float]]:
    """
    Rerank documents using the LLM simulator.
    
    Return top_k (doc_index, llm_score) sorted by score desc.
    """
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `docs = [
    "API key rotation policy: official guidelines say rotate every 90 days.",
    "Bananas are a popular fruit worldwide.",
    "How to rotate API keys using the dashboard.",
]
results = llm_rerank("api key rotation policy", docs, top_k=2)
assert results[0][0] == 0  # The 'policy' + 'official' doc should win
assert len(results) == 2

print("All tests passed!")`,
    hints: [
      "Call simulate_llm_relevance for each (query, doc) pair.",
      "Sort by score descending.",
      "Return top_k results.",
    ],
    solution: `from typing import List, Tuple
import re

def _tokens(text: str) -> set:
    return set(re.findall(r"[a-z0-9]+", text.lower()))

def simulate_llm_relevance(query: str, doc: str) -> float:
    q_tokens = _tokens(query)
    d_tokens = _tokens(doc)
    
    overlap = len(q_tokens & d_tokens) / max(len(q_tokens), 1)
    bonus = 0.1 if ('policy' in d_tokens or 'official' in d_tokens) else 0
    
    return min(1.0, overlap + bonus)

def llm_rerank(
    query: str,
    docs: List[str],
    top_k: int = 3,
) -> List[Tuple[int, float]]:
    scored = []
    for i, doc in enumerate(docs):
        score = simulate_llm_relevance(query, doc)
        scored.append((i, score))
    
    # Sort by score descending
    scored.sort(key=lambda x: -x[1])
    return scored[:top_k]
`,
    timeEstimate: { minutes: 25, label: "25-35 min" },
    realWorld: {
      description: "Cohere's Rerank API and Anthropic's ranking experiments show LLMs can outperform cross-encoders on complex 'reasoning' queries like 'Which document contradicts the other?'.",
      companies: ["Cohere", "Anthropic", "Jina AI"],
      useCases: ["Complex Query Reranking", "Reasoning-heavy QA"],
    },
  },
  {
    slug: "contextual-compression-llm",
    title: "LLM Context Compression",
    description: "Use an LLM to summarize retrieved chunks before passing to the generator. Why: Raw chunks contain noise. Solves: Increases effective context window by 3-5x by distilling only relevant facts.",
    group: "Phase 3 — Reranking & Context Optimization",
    difficulty: "hard",
    xpReward: 125,
    prerequisites: ["prompt-template"],
    starterCode: `from typing import List

def simulate_llm_compress(query: str, chunk: str) -> str:
    """
    Simulate LLM compression: extract sentences relevant to the query.
    
    Heuristic:
    - Split chunk into sentences.
    - Keep only sentences with 2+ token overlap with query.
    """
    import re
    q_tokens = set(re.findall(r'[a-z0-9]+', query.lower()))
    sentences = re.split(r'(?<=[.!?])\\s+', chunk.strip())
    
    relevant = []
    for sent in sentences:
        s_tokens = set(re.findall(r'[a-z0-9]+', sent.lower()))
        if len(q_tokens & s_tokens) >= 2:
            relevant.append(sent)
    
    return ' '.join(relevant) if relevant else sentences[0] if sentences else ""

def compress_context(query: str, chunks: List[str]) -> List[str]:
    """
    Compress each chunk to only the relevant parts.
    """
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `query = "api key rotation"
chunks = [
    "API key rotation policy. Rotate keys every 90 days. Bananas are yellow.",
    "Use the dashboard to manage api keys. Weather is nice today.",
]
compressed = compress_context(query, chunks)
assert "Bananas" not in compressed[0]
assert "Weather" not in compressed[1]
assert "API key" in compressed[0] or "api key" in compressed[0].lower()

print("All tests passed!")`,
    hints: [
      "Map simulate_llm_compress over chunks.",
      "Handle empty compression by keeping the first sentence as fallback.",
    ],
    solution: `from typing import List
import re

def simulate_llm_compress(query: str, chunk: str) -> str:
    q_tokens = set(re.findall(r'[a-z0-9]+', query.lower()))
    sentences = re.split(r'(?<=[.!?])\\s+', chunk)
    
    relevant = []
    for sent in sentences:
        s_tokens = set(re.findall(r'[a-z0-9]+', sent.lower()))
        if len(q_tokens & s_tokens) >= 2:
            relevant.append(sent)
    
    return ' '.join(relevant) if relevant else sentences[0] if sentences else ""

def compress_context(query: str, chunks: List[str]) -> List[str]:
    return [simulate_llm_compress(query, chunk) for chunk in chunks]
`,
    timeEstimate: { minutes: 25, label: "25-35 min" },
    realWorld: {
      description: "LangChain's 'LLMChainExtractor' and llamaIndex's 'ResponseSynthesizer' use this pattern. It's how production RAG fits 100 documents into a 4k token window.",
      companies: ["LangChain", "LlamaIndex"],
      useCases: ["Long-document Summarization", "Cost Reduction"],
    },
  },
  // ============================================================
  // PHASE 5: PRODUCTION OPS - CRITICAL ADDITIONS
  // ============================================================
  {
    slug: "rate-limiter",
    title: "Rate Limiter (Token Bucket)",
    description: "Implement a token bucket rate limiter to protect your database/LLM API from spikes. Why: Production systems need stability. Solves: Prevents 'Too Many Requests' errors.",
    group: "Phase 5 — Production Ops & Observability",
    difficulty: "hard",
    xpReward: 125,
    prerequisites: ["token-budget-packing"],
    starterCode: `import time

class TokenBucket:
    def __init__(self, capacity: int, refill_rate: float):
        """
        capacity: max tokens in bucket
        refill_rate: tokens added per second
        """
        self.capacity = capacity
        self.tokens = capacity
        self.refill_rate = refill_rate
        self.last_refill = time.time()
    
    def _refill(self):
        """Add tokens based on time elapsed."""
        now = time.time()
        elapsed = now - self.last_refill
        added = elapsed * self.refill_rate
        self.tokens = min(self.capacity, self.tokens + added)
        self.last_refill = now
    
    def consume(self, tokens: int = 1) -> bool:
        """
        Try to consume 'tokens' from the bucket.
        Return True if successful, False if rate limited.
        """
        # TODO: implement
        raise NotImplementedError
`,
    testCode: `bucket = TokenBucket(capacity=5, refill_rate=1.0)

# Should allow first 5
for _ in range(5):
    assert bucket.consume(1) == True

# 6th should fail (no tokens left)
assert bucket.consume(1) == False

# Wait for refill (simulate)
import time
time.sleep(1.1)
assert bucket.consume(1) == True

print("All tests passed!")`,
    hints: [
      "Call _refill() before checking tokens.",
      "If tokens >= requested, subtract and return True.",
      "Otherwise, return False (rate limited).",
    ],
    solution: `import time

class TokenBucket:
    def __init__(self, capacity: int, refill_rate: float):
        self.capacity = capacity
        self.tokens = capacity
        self.refill_rate = refill_rate
        self.last_refill = time.time()
    
    def _refill(self):
        now = time.time()
        elapsed = now - self.last_refill
        added = elapsed * self.refill_rate
        self.tokens = min(self.capacity, self.tokens + added)
        self.last_refill = now
    
    def consume(self, tokens: int = 1) -> bool:
        self._refill()
        if self.tokens >= tokens:
            self.tokens -= tokens
            return True
        return False
`,
    timeEstimate: { minutes: 20, label: "20-25 min" },
    realWorld: {
      description: "Every production API uses rate limiting. OpenAI's API returns 429 errors when you exceed your limit; your RAG service should do the same to prevent runaway costs.",
      companies: ["Stripe", "Cloudflare", "Kong"],
      useCases: ["API Protection", "Cost Control"],
    },
  },
  {
    slug: "audit-logger",
    title: "Audit Logger (Compliance)",
    description: "Log every RAG query and response for compliance and debugging. Why: GDPR/SOC2 require audit trails. Solves: 'What did we tell the CEO yesterday?' becomes answerable.",
    group: "Phase 5 — Production Engineering & Security",
    difficulty: "easy",
    xpReward: 50,
    starterCode: `from typing import Any, Dict, List
import json
import time

class AuditLogger:
    def __init__(self):
        self.logs: List[Dict[str, Any]] = []
    
    def log_query(
        self,
        user_id: str,
        query: str,
        retrieved_ids: List[str],
        answer: str,
    ) -> str:
        """
        Log a complete RAG interaction.
        
        Return a unique log_id (timestamp-based is fine for this lab).
        
        Log entry should include:
        - log_id
        - timestamp (ISO format)
        - user_id
        - query
        - retrieved_ids
        - answer
        """
        # TODO: implement
        raise NotImplementedError
    
    def get_logs_for_user(self, user_id: str) -> List[Dict[str, Any]]:
        """Return all logs for a specific user."""
        # TODO: implement
        raise NotImplementedError
    
    def export_json(self) -> str:
        """Export all logs as a JSON string."""
        # TODO: implement
        raise NotImplementedError
`,
    testCode: `logger = AuditLogger()

log_id = logger.log_query(
    user_id="u123",
    query="How to rotate API keys?",
    retrieved_ids=["doc1", "doc2"],
    answer="Rotate via the dashboard."
)
assert log_id is not None

logs = logger.get_logs_for_user("u123")
assert len(logs) == 1
assert logs[0]["query"] == "How to rotate API keys?"

export = logger.export_json()
assert "u123" in export

print("All tests passed!")`,
    hints: [
      "Use time.time() or datetime for log_id and timestamp.",
      "Store logs in a list of dicts.",
      "Filter by user_id with list comprehension.",
    ],
    solution: `from typing import Any, Dict, List
import json
import time
from datetime import datetime

class AuditLogger:
    def __init__(self):
        self.logs: List[Dict[str, Any]] = []
    
    def log_query(
        self,
        user_id: str,
        query: str,
        retrieved_ids: List[str],
        answer: str,
    ) -> str:
        log_id = f"{int(time.time() * 1000)}"
        entry = {
            "log_id": log_id,
            "timestamp": datetime.utcnow().isoformat(),
            "user_id": user_id,
            "query": query,
            "retrieved_ids": retrieved_ids,
            "answer": answer
        }
        self.logs.append(entry)
        return log_id
    
    def get_logs_for_user(self, user_id: str) -> List[Dict[str, Any]]:
        return [log for log in self.logs if log["user_id"] == user_id]
    
    def export_json(self) -> str:
        return json.dumps(self.logs, indent=2)
`,
    timeEstimate: { minutes: 20, label: "20-25 min" },
    realWorld: {
      description: "SOC2 Type II audits require full query logs. GDPR 'Right to Explanation' means you must be able to show WHAT data was retrieved and WHY an answer was given.",
      companies: ["Anthropic", "Vanta", "Drata"],
      useCases: ["Compliance Auditing", "Debugging Production Issues"],
    },
  },
  {
    slug: "source-fingerprint",
    title: "Source Fingerprinting (GDPR Deletion)",
    description: "Track which chunks came from which source for targeted deletion. Why: GDPR 'Right to be Forgotten' requires removing all data from a specific source. Solves: Enables compliant deletion without full re-index.",
    group: "Phase 5 — Production Engineering & Security",
    difficulty: "medium",
    xpReward: 75,
    starterCode: `from typing import Dict, List, Set

class SourceTracker:
    def __init__(self):
        # Maps source_id -> set of chunk_ids
        self.source_to_chunks: Dict[str, Set[str]] = {}
        # Maps chunk_id -> source_id
        self.chunk_to_source: Dict[str, str] = {}
    
    def register_chunk(self, chunk_id: str, source_id: str):
        """Register a chunk's source for later deletion tracking."""
        # TODO: implement
        raise NotImplementedError
    
    def get_chunks_by_source(self, source_id: str) -> List[str]:
        """Return all chunk_ids from a given source."""
        # TODO: implement
        raise NotImplementedError
    
    def delete_source(self, source_id: str) -> List[str]:
        """
        Delete a source and return all chunk_ids that should be removed.
        Also clean up internal mappings.
        """
        # TODO: implement
        raise NotImplementedError
`,
    testCode: `tracker = SourceTracker()

tracker.register_chunk("c1", "doc_A")
tracker.register_chunk("c2", "doc_A")
tracker.register_chunk("c3", "doc_B")

assert set(tracker.get_chunks_by_source("doc_A")) == {"c1", "c2"}

# Delete doc_A (GDPR request)
deleted = tracker.delete_source("doc_A")
assert set(deleted) == {"c1", "c2"}

# After deletion, doc_A should have no chunks
assert tracker.get_chunks_by_source("doc_A") == []

print("All tests passed!")`,
    hints: [
      "Use a dict of sets for source_to_chunks.",
      "Maintain reverse mapping for efficient lookup.",
      "On delete, remove from both mappings.",
    ],
    realWorld: {
      description: "GDPR requires that when a user asks to 'forget' them, ALL their data must be purged. Without source fingerprinting, you'd have to re-index the entire database from scratch.",
      companies: ["OneTrust", "TrustArc"],
      useCases: ["GDPR Compliance", "Data Governance"],
    },
  },
];
