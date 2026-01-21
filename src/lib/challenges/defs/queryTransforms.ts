import type { RawChallenge } from "@/lib/challenges/types";

export const QUERY_TRANSFORMS_CHALLENGES: RawChallenge[] = [
  {
    slug: "query-normalization",
    title: "Query Normalization (Rewrite Baseline)",
    description:
      "Normalize queries (tokenize, stopwords, dedupe) to improve retrieval stability. Why: Users type noisy input. Solves: Removes noise like 'the/a' that dilutes vector meaning.",
    group: "Phase 2 — Retrieval & Query Engineering",
    difficulty: "easy",
    xpReward: 50,
    starterCode: `from typing import List
import re

STOPWORDS = {
  "the","a","an","to","of","and","or","in","on","for","with","is","are","be",
  "how","what","when","where","why","can","could","should","i","we","you","do","does","did",
}

def tokenize(text: str) -> List[str]:
    # Keep letters, numbers, and underscores
    return re.findall(r"[a-z0-9_]+", text.lower())

def normalize_query(query: str) -> str:
    \"\"\"
    Return a normalized query string for retrieval.

    Rules:
    - lowercase + tokenize
    - remove STOPWORDS
    - deduplicate tokens preserving order
    - join with single spaces
    - return "" if nothing remains
    \"\"\"
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `assert normalize_query("") == ""
assert normalize_query("   ") == ""
assert normalize_query("is the a") == "" # Stopwords only

assert normalize_query("How do I rotate an API key?") == "rotate api key"
assert normalize_query("RAG: Hybrid search with BM25 + dense embeddings") == "rag hybrid search bm25 dense embeddings"
assert normalize_query("API key key rotation rotation") == "api key rotation"

print("All tests passed!")`,
    hints: [
      "Tokenize first, then filter out stopwords.",
      "Use a set to track seen tokens but keep an output list to preserve order.",
      "Join tokens with `' '.join(...)`.",
    ],
    solution: `from typing import List
import re

STOPWORDS = {
  "the","a","an","to","of","and","or","in","on","for","with","is","are","be",
  "how","what","when","where","why","can","could","should","i","we","you","do","does","did",
}

def tokenize(text: str) -> List[str]:
    return re.findall(r"[a-z0-9_]+", text.lower())

def normalize_query(query: str) -> str:
    tokens = tokenize(query)
    seen = set()
    result = []
    for t in tokens:
        if t not in STOPWORDS and t not in seen:
            seen.add(t)
            result.append(t)
    return " ".join(result)
`,
    realWorld: {
        description: "Standard practice in search engines for decades. By removing noise, you increase the 'signal-to-noise' ratio of your embeddings, leading to 5-10% better retrieval precision.",
        companies: ["Elastic", "Solr", "Google"],
        useCases: ["Cleaning User Input", "Reducing Index Size"],
    },
    timeEstimate: { minutes: 15, label: "15-20 min" },
    relatedPlaybooks: ["rag-techniques-encyclopedia", "quick-reference-cards"],
  },
  {
    slug: "self-query-filters",
    title: "Self-Query Filters (Query → Metadata Filters)",
    description:
      "Extract structured filters (tenant_id, doc_type, date) from a query before retrieval. Why: 'My emails from 2023' implies filters, not just vector similarity. Solves: Applies hard constraints (filters) before soft similarity (vectors), improving precision.",
    group: "Phase 2 — Retrieval & Query Engineering",
    difficulty: "medium",
    xpReward: 75,
    starterCode: `from typing import Dict, List, Tuple
import re

STOPWORDS = {
  "the","a","an","to","of","and","or","in","on","for","with","is","are","be",
  "how","what","when","where","why","can","could","should","i","we","you","do","does","did",
}

def _tokens(text: str) -> List[str]:
    return re.findall(r"[a-z0-9_:-]+", text.lower())

def normalize(text: str) -> str:
    toks = [t for t in re.findall(r"[a-z0-9_]+", text.lower()) if t and t not in STOPWORDS]
    out = []
    seen = set()
    for t in toks:
        if t in seen:
            continue
        seen.add(t)
        out.append(t)
    return " ".join(out)

def extract_filters(query: str) -> Tuple[str, Dict[str, str]]:
    \"\"\"
    Extract structured filters from a query.

    Supported patterns (case-insensitive):
    - tenant:t1 or tenant_id=t1   -> filters["tenant_id"] = "t1"
    - type:policy                 -> filters["doc_type"] = "policy"
    - after:2023                  -> filters["year_from"] = "2023"
    - before:2025                 -> filters["year_to"] = "2025"

    Return (cleaned_query, filters).
    cleaned_query should have filter tokens removed and then be normalized.
    \"\"\"
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `q, f = extract_filters("tenant:t1 type:policy API key rotation after:2023")
assert q == "api key rotation"
assert f == {"tenant_id": "t1", "doc_type": "policy", "year_from": "2023"}

q2, f2 = extract_filters("How to rotate keys tenant_id=t2 before:2025")
assert q2 == "rotate keys"
assert f2 == {"tenant_id": "t2", "year_to": "2025"}

q3, f3 = extract_filters("RRF fusion for hybrid retrieval")
assert q3 == "rrf fusion hybrid retrieval"
assert f3 == {}

# Conflict handling: usually last one wins or generic behavior. Detailed spec not enforced here,
# but ensure it extracts validly.
q4, f4 = extract_filters("tenant:t1 tenant:t2")
assert f4["tenant_id"] in ("t1", "t2")

print("All tests passed!")`,
    hints: [
      "Scan tokens and detect filter tokens with regex like `r\"^(tenant|tenant_id)[:=](.+)$\"`.",
      "Remove filter tokens from the query before normalizing.",
      "Normalize should remove stopwords and dedupe tokens.",
    ],
    solution: `from typing import Dict, List, Tuple
import re

STOPWORDS = {
  "the","a","an","to","of","and","or","in","on","for","with","is","are","be",
  "how","what","when","where","why","can","could","should","i","we","you","do","does","did",
}

def _tokens(text: str) -> List[str]:
    return re.findall(r"[a-z0-9_:-]+", text.lower())

def normalize(text: str) -> str:
    toks = [t for t in re.findall(r"[a-z0-9_]+", text.lower()) if t and t not in STOPWORDS]
    out = []
    seen = set()
    for t in toks:
        if t in seen:
            continue
        seen.add(t)
        out.append(t)
    return " ".join(out)

def extract_filters(query: str) -> Tuple[str, Dict[str, str]]:
    tokens = _tokens(query)
    filters = {}
    remaining = []
    
    for token in tokens:
        # Tenant filter
        m = re.match(r"^(tenant|tenant_id)[:=](.+)$", token)
        if m:
            filters["tenant_id"] = m.group(2)
            continue
        # Type filter
        m = re.match(r"^type[:=](.+)$", token)
        if m:
            filters["doc_type"] = m.group(1)
            continue
        # After filter
        m = re.match(r"^after[:=](.+)$", token)
        if m:
            filters["year_from"] = m.group(1)
            continue
        # Before filter
        m = re.match(r"^before[:=](.+)$", token)
        if m:
            filters["year_to"] = m.group(1)
            continue
        remaining.append(token)
    
    cleaned = normalize(" ".join(remaining))
    return (cleaned, filters)
`,
    timeEstimate: { minutes: 30, label: "30-40 min" },
    realWorld: {
        description: "Crucial for multi-tenant applications. Instead of relying on a vector match for 'User 123', you explicitly parse the tenant filter to guarantee data isolation.",
        companies: ["Slack", "Salesforce", "Linear"],
        useCases: ["SaaS RAG Data Isolation", "Structured Search Over Vectors"],
    },
  },
  {
    slug: "hyde-search",
    title: "HyDE Pipeline (Hypothetical Document Embedding)",
    description:
      "Implement HyDE: generate a hypothetical answer, embed that, and retrieve with improved recall. Why: Queries are questions; docs are answers. Embeddings match similar text. Solves: Bridges the gap by retrieving docs that look like the answer.",
    group: "Phase 2 — Retrieval & Query Engineering",
    difficulty: "medium",
    xpReward: 75,
    starterCode: `from typing import List, Tuple
import hashlib
import math
import re

def tokenize(text: str) -> List[str]:
    return re.findall(r"[a-z0-9_]+", text.lower())

def embed(text: str, dim: int = 64) -> List[float]:
    vec = [0.0] * dim
    for t in tokenize(text):
        idx = int(hashlib.sha1(t.encode("utf-8")).hexdigest(), 16) % dim
        vec[idx] += 1.0
    return vec

def cosine(a: List[float], b: List[float]) -> float:
    dot = sum(x*y for x, y in zip(a, b))
    da = sum(x*x for x in a)
    db = sum(x*x for x in b)
    if da == 0 or db == 0:
        return 0.0
    return dot / (math.sqrt(da) * math.sqrt(db))

EXPAND = {
  "renew": ["rotate", "rotation"],
  "secrets": ["api", "key", "api_key", "keys"],
  "secret": ["key", "api_key", "keys"],
  "credentials": ["api", "key", "api_key"],
}

def generate_hypothetical_answer(query: str) -> str:
    # Deterministic HyDE-like generator (simulates an LLM).
    toks = tokenize(query)
    out = []
    seen = set()
    for t in toks:
        if t not in seen:
            seen.add(t)
            out.append(t)
        for s in EXPAND.get(t, []):
            if s not in seen:
                seen.add(s)
                out.append(s)
    return "This is a technical note about " + " ".join(out) + "."

def hyde_search(docs: List[str], query: str, k: int = 3) -> List[Tuple[int, float]]:
    \"\"\"
    HyDE retrieval:
    1) Generate a hypothetical answer for the query.
    2) Embed the hypothetical answer (NOT the raw query).
    3) Score docs by cosine similarity and return top-k (doc_index, score).

    Rules:
    - k must be > 0
    - tie-break: lower doc_index first
    \"\"\"
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `docs = [
  "API key rotation policy: rotate keys every 90 days.",
  "Password reset instructions: use the profile page.",
  "Embedding cache: cache query embeddings by text hash.",
  "RRF fusion combines bm25 and dense rankings.",
]

# Verify Hypothetical Answer Generation (Basic check)
hypo = generate_hypothetical_answer("renew secrets")
assert "rotate" in hypo or "api" in hypo, "Hypothetical answer should expand terms"

out = hyde_search(docs, "How do I renew secrets?", k=2)
assert len(out) == 2
assert out[0][0] == 0, "HyDE should surface the rotation/key policy doc"
assert out[0][1] >= out[1][1]

try:
  hyde_search(docs, "x", k=0)
  raise AssertionError("Expected ValueError for k <= 0")
except ValueError:
  pass

print("All tests passed!")`,
    hints: [
      "Use `generate_hypothetical_answer(query)` to build the retrieval query.",
      "Embed the hypothetical answer and each doc, then score with `cosine()`.",
      "Sort by `(-score, doc_index)` for stable results.",
    ],
    solution: `from typing import List, Tuple
import re
import hashlib
import math

EXPAND = {
    "renew": ["rotate", "rotation", "api", "key"],
    "secrets": ["api", "key", "password", "token"],
}

def embed(text: str, dim: int = 64) -> List[float]:
    vec = [0.0] * dim
    for t in re.findall(r"[a-z0-9_]+", text.lower()):
        idx = int(hashlib.sha1(t.encode("utf-8")).hexdigest(), 16) % dim
        vec[idx] += 1.0
    norm = math.sqrt(sum(x*x for x in vec)) or 1.0
    return [x / norm for x in vec]

def cosine(a: List[float], b: List[float]) -> float:
    return sum(x * y for x, y in zip(a, b))

def generate_hypothetical_answer(query: str) -> str:
    toks = re.findall(r"[a-z0-9_]+", query.lower())
    out = []
    seen = set()
    for t in toks:
        if t not in seen:
            seen.add(t)
            out.append(t)
        for s in EXPAND.get(t, []):
            if s not in seen:
                seen.add(s)
                out.append(s)
    return "This is a technical note about " + " ".join(out) + "."

def hyde_search(docs: List[str], query: str, k: int = 3) -> List[Tuple[int, float]]:
    if k <= 0:
        raise ValueError("k must be > 0")
    
    hypo = generate_hypothetical_answer(query)
    hypo_vec = embed(hypo)
    
    scored = []
    for i, doc in enumerate(docs):
        doc_vec = embed(doc)
        score = cosine(hypo_vec, doc_vec)
        scored.append((i, score))
    
    scored.sort(key=lambda x: (-x[1], x[0]))
    return scored[:k]
`,
    realWorld: {
        description: "HyDE is one of the most effective zero-shot retrieval techniques. It works because the model's 'hallucination' of an answer is often more semantically similar to the target document than the user's short question.",
        companies: ["Microsoft", "Perplexity"],
        useCases: ["Zero-shot Retrieval", "Answering Knowledge-Gap Queries"],
    },
    prerequisites: ["basic-retrieval", "embed-and-search"],
    relatedPlaybooks: ["rag-techniques-encyclopedia", "rag-interview-questions"],
  },
  {
    slug: "multi-query-fusion",
    title: "Multi-Query + RRF (RAG-Fusion)",
    description:
      "Generate query variants, retrieve per-variant, then fuse rankings with RRF for recall. Why: A single query might miss keywords. Solves: 'Casts a wider net' by trying multiple phrasings, then finding the consensus top docs.",
    group: "Phase 2 — Retrieval & Query Engineering",
    difficulty: "hard",
    xpReward: 125,
    prerequisites: ["rrf-fusion"],
    starterCode: `from typing import Dict, List, Tuple
import hashlib
import math
import re

SYNONYMS: Dict[str, List[str]] = {
  "renew": ["rotate", "rotation"],
  "secrets": ["api key", "api_key", "keys"],
  "policy": ["guideline", "procedure"],
}

def tokenize(text: str) -> List[str]:
    return re.findall(r"[a-z0-9_]+", text.lower())

def embed(text: str, dim: int = 64) -> List[float]:
    vec = [0.0] * dim
    for t in tokenize(text):
        idx = int(hashlib.sha1(t.encode("utf-8")).hexdigest(), 16) % dim
        vec[idx] += 1.0
    return vec

def cosine(a: List[float], b: List[float]) -> float:
    dot = sum(x*y for x, y in zip(a, b))
    da = sum(x*x for x in a)
    db = sum(x*x for x in b)
    if da == 0 or db == 0:
        return 0.0
    return dot / (math.sqrt(da) * math.sqrt(db))

def dense_rank(docs: List[str], query: str, k: int = 10) -> List[int]:
    qv = embed(query)
    scored = [(i, cosine(qv, embed(docs[i]))) for i in range(len(docs))]
    scored.sort(key=lambda x: (-x[1], x[0]))
    return [i for i, _ in scored[: min(k, len(scored))]]

def rrf_fuse(rankings: List[List[int]], k: int = 60, top_n: int = 10) -> List[Tuple[int, float]]:
    scores: Dict[int, float] = {}
    for r in rankings:
        for idx, doc_id in enumerate(r):
            rank = idx + 1  # 1-based
            scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank)
    items = list(scores.items())
    items.sort(key=lambda x: (-x[1], x[0]))
    return items[:top_n]

def generate_queries(query: str, max_queries: int = 4) -> List[str]:
    \"\"\"
    Deterministically generate query variants.

    Rules:
    - Return a list of unique query strings (lowercased)
    - First item must be the original query (lowercased, normalized whitespace)
    - For each token in order, if token has synonyms, create variants by replacing that token
    - Stop once you reach max_queries

    Note: synonyms may contain spaces (e.g. "api key"). Keep them as-is.
    \"\"\"
    # TODO: implement
    raise NotImplementedError

def rag_fusion_search(docs: List[str], query: str, top_n: int = 3) -> List[int]:
    \"\"\"
    RAG-Fusion (multi-query + RRF):
    - generate queries
    - dense_rank per query
    - fuse the ranked lists with RRF
    - return the top_n doc_ids
    \"\"\"
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `docs = [
  "API key rotation policy: rotate keys every 90 days.",
  "Password reset instructions: use the profile page.",
  "Embedding cache: cache query embeddings by text hash.",
  "RRF fusion combines bm25 and dense rankings.",
  "Security guideline: rotate credentials regularly.",
]

qs = generate_queries("Renew secrets policy", max_queries=4)
assert qs[0] == "renew secrets policy"
assert len(qs) <= 4
assert len(set(qs)) == len(qs)

out = rag_fusion_search(docs, "Renew secrets policy", top_n=2)
assert len(out) == 2
assert out[0] in (0, 4), "Fusion should surface a rotation/credential guideline doc"

print("All tests passed!")`,
    hints: [
      "Normalize original query: lowercase + collapse whitespace to single spaces.",
      "Generate variants by replacing ONE token at a time (in left-to-right order).",
      "Use rrf_fuse([dense_rank(...), dense_rank(...), ...]) and return doc ids.",
    ],
    realWorld: {
        description: "Also known as RAG-Fusion. It generates query variations (rewriting) to cover different angles of the same intent. This is the 'Swiss Army Knife' of retrieval for ambiguous user queries.",
        companies: ["OpenAI (Voyage AI recommended)", "Pinecone"],
        useCases: ["Ambiguous Intent Retrieval", "Improving Recall in Sparse Data"],
    },
    relatedPlaybooks: ["rag-techniques-encyclopedia", "rag-formulas-cheatsheet"],
  },
  {
    slug: "step-back-prompting",
    title: "Step-Back Prompting",
    description:
      "Generate a broader, more abstract version of a query. Why: Detailed queries fail if keywords don't match; abstract queries find the 'chapter' containing the answer.",
    group: "Phase 2 — Retrieval & Query Engineering",
    difficulty: "medium",
    xpReward: 75,
    starterCode: `import re

def step_back(query: str) -> str:
    \"\"\"
    Generate a step-back question.
    
    Rules (Heuristic for this lab):
    - If query mentions specific error codes (e.g. 'Error 504'), ask "What are the API error codes?"
    - If query mentions specific methods ('rotate_key'), ask "How does key management work?"
    - If query asks about 'price for 100 users', ask "What is the pricing model?"
    - Otherwise, return the original query.
    \"\"\"
    q = query.lower()
    # TODO: implement regex-based heuristics
    raise NotImplementedError
`,
    testCode: `assert step_back("What does Error 504 mean?") == "What are the API error codes?"
assert step_back("I got Error 400 on login") == "What are the API error codes?"
assert step_back("How do I call rotate_key?") == "How does key management work?"
assert step_back("What is the price for 100 users?") == "What is the pricing model?"
assert step_back("Hello") == "Hello"

print("All tests passed!")`,
    hints: [
      "Use re.search or string containment.",
      "Generic error pattern: r'error \\d+'.",
      "Pricing pattern: 'price', 'cost', 'users'.",
    ],
    realWorld: {
        description: "Google DeepMind introduced Step-Back Prompting. It improves retrieval recall by enabling 'concept search' before specific search, reducing the chance of missing the right document because of hyper-specific keywords.",
        companies: ["Google DeepMind", "LangChain"],
        useCases: ["Complex QA", "Reasoning Tasks"],
    },
  },
];


