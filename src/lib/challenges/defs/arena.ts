
import type { RawChallenge } from "@/lib/challenges/types";
import { TECH_SUPPORT_DATASET } from "../datasets/techSupport";

export const ARENA_CHALLENGES: RawChallenge[] = [
  {
    slug: "arena-tfidf-log-search",
    title: "Daily Arena: TF-IDF Log Search",
    description:
      "Optimize search for tech support logs using TF-IDF. Why: Simple term counting biases towards long documents; TF-IDF penalizes common words and normalizes length. Solves: Better ranking for short, concise error messages.",
    group: "The Arena",
    difficulty: "medium",
    xpReward: 200,
    benchmark: true,
    dataset: TECH_SUPPORT_DATASET,
    starterCode: `from typing import Dict, List, Tuple
import math
import re

def tokenize(text: str) -> List[str]:
    # Simple whitespace/alphanumeric tokenizer
    return re.findall(r"[a-z0-9]+", text.lower())

def train_tfidf(docs: List[str]) -> Tuple[Dict[str, int], int]:
    """
    Pre-compute IDF statistics.
    Returns (df, N) where df is doc freq, N is total docs.
    """
    # TODO: Implement
    return {}, 0

def rank_tfidf(docs: List[str], query: str, k: int = 3) -> List[Tuple[int, float]]:
    """
    Return top-k docs sorted by TF-IDF score.
    TF(t, d) = count(t in d) / len(d)
    IDF(t) = log(N / (df(t) + 1))
    Score = sum(TF * IDF) for t in query
    """
    # TODO: Implement
    return []
`,
    testCode: `
# --- TESTS ---
docs = [
  "error 503 service unavailable",
  "error 504 gateway timeout",
  "connection reset by peer",
  "service checklist: restart service if 503 error persists",
]

# Basic Smoke Test
out = rank_tfidf(docs, "error 503", k=1)
assert len(out) == 1, "Should return 1 result"

# --- BENCHMARK ---
import time
import json

start = time.time()
num_docs = 0
num_queries = 0
results_for_viz = []

if "DATASET" in globals() and DATASET:
    bench_docs = [d["content"] for d in DATASET["docs"]]
    bench_queries = [q["text"] for q in DATASET["queries"]]
    num_docs = len(bench_docs)
    num_queries = len(bench_queries)

    for i, q in enumerate(bench_queries):
        ranks = rank_tfidf(bench_docs, q, k=5)
        
        # Viz Sample
        if i < 3:
            hits = []
            for doc_idx, score in ranks:
               if 0 <= doc_idx < len(bench_docs):
                   preview = bench_docs[doc_idx][:60] + "..."
                   hits.append({"doc_id": doc_idx, "score": round(score, 4), "preview": preview})
            results_for_viz.append({"query": q, "hits": hits})
else:
    # Synthetic
    bench_docs = ["test " * 10 for _ in range(50)]
    _ = rank_tfidf(bench_docs, "test", k=5)

end = time.time()
latency_ms = (end - start) * 1000
_SCORE = max(0, min(100, int(100 - (latency_ms - (num_queries * 5)) * 0.5)))
_METRICS = {"latency_ms": round(latency_ms, 2), "docs": num_docs}
_VISUALS = {"type": "retrieval", "samples": results_for_viz} if results_for_viz else {}
`,
    hints: [
      "TF (Term Frequency) = (count of term in doc) / (total terms in doc).",
      "IDF (Inverse Document Frequency) = log(N / (df + 1)). Adding 1 avoids division by zero.",
      "Pre-calculate IDF in `train_tfidf` so the online `rank_tfidf` is fast.",
    ],
    realWorld: {
        description: "TF-IDF is the 'Great Grandfather' of RAG. Before vector embeddings, this was how nearly all enterprise search worked. It still outperforms dense vectors on 'keyword-heavy' queries (like specific error codes).",
        companies: ["Elastic", "Lucidworks", "Microsoft"],
        useCases: ["Search Engine Baselines", "Error Log Search"],
    },
  },
];
