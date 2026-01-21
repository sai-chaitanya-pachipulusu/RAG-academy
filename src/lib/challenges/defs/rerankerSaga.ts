
import type { RawChallenge } from "@/lib/challenges/types";

export const RERANKER_SAGA_CHALLENGES: RawChallenge[] = [
  {
    slug: "reranker-score-function",
    title: "Build a Reranker (1): Score Function",
    description:
      "Implement a basic cross-encoder scoring function. Why: Bi-encoders (embeddings) are fast but imprecise; cross-encoders are slow but accurate. Solves: Enables high-precision reranking of candidate results.",
    group: "Phase 3 — Reranking & Context Optimization",
    difficulty: "medium",
    xpReward: 75,
    starterCode: `from typing import List, Tuple

class MockCrossEncoder:
    """
    Simulates a cross-encoder model.
    Real models (e.g., ms-marco-MiniLM) take (query, doc) pairs and return a relevance score.
    """
    def __init__(self):
        pass

    def score(self, query: str, document: str) -> float:
        """
        Return a relevance score for the (query, document) pair.
        
        Simulation logic:
        - Count how many query words appear in the document (case-insensitive).
        - Score = (matching_words / total_query_words)
        - This mimics "semantic overlap" in a very naive way.
        """
        # TODO: Implement
        raise NotImplementedError

    def score_batch(self, query: str, documents: List[str]) -> List[float]:
        """Score multiple documents against a single query."""
        # TODO: Call self.score() for each document
        return []
`,
    testCode: `encoder = MockCrossEncoder()

# Test basic scoring
score1 = encoder.score("python data science", "Python is great for data science and ML.")
score2 = encoder.score("python data science", "JavaScript is for web development.")

assert score1 > score2, "Python doc should score higher for Python query"

# Test edge cases
score_empty = encoder.score("test", "")
assert score_empty == 0.0, "Empty doc should score 0"

# Test batch
scores = encoder.score_batch("python", ["python rocks", "java is cool", "python and java"])
assert len(scores) == 3
assert scores[0] > scores[1], "Python doc should score higher"

print("Cross-encoder passed!")
`,
    hints: [
      "Use `query.lower().split()` to get query words.",
      "Use `document.lower()` and check if each query word is `in` the document string.",
      "Handle edge case: if query has 0 words, return 0.0.",
    ],
    solution: `from typing import List

class MockCrossEncoder:
    def __init__(self):
        pass

    def score(self, query: str, document: str) -> float:
        query_words = query.lower().split()
        if not query_words:
            return 0.0
        
        doc_lower = document.lower()
        matches = sum(1 for word in query_words if word in doc_lower)
        
        return matches / len(query_words)

    def score_batch(self, query: str, documents: List[str]) -> List[float]:
        return [self.score(query, doc) for doc in documents]
`,
    complexity: {
      time: "O(q × d)",
      space: "O(1)",
      latency: "~50ms per (query, doc) pair with real model",
    },
    realWorld: {
      description: "Cross-encoders like ms-marco-MiniLM score query-document pairs directly. Cohere Rerank, Jina Reranker, and BGE Reranker all use this pattern. It's slower than embeddings but much more accurate.",
      companies: ["Cohere", "Jina AI", "BAAI", "Microsoft"],
      useCases: ["Search reranking", "RAG precision boost", "Document relevance scoring"],
    },
    prerequisites: ["dense-vector-class"],
    relatedChallenges: ["reranker-cascade"],
    relatedPlaybooks: ["rag-techniques-encyclopedia", "tool-comparison-matrix"],
  },
  {
    slug: "reranker-cascade",
    title: "Build a Reranker (2): Cascade Reranker",
    description:
      "Build a two-stage retrieval system: fast retrieval + slow rerank. Why: Balance speed and accuracy. Solves: Get the best of both worlds by retrieving 100 candidates fast, then reranking top 10 precisely.",
    group: "Phase 3 — Reranking & Context Optimization",
    difficulty: "hard",
    xpReward: 100,
    starterCode: `from typing import List, Tuple, Dict, Any
import math
import hashlib

# --- Pre-built components ---

class DenseVector:
    def __init__(self, values: List[float]):
        self.values = values; self._mag = math.sqrt(sum(x*x for x in values))
    def cosine_similarity(self, other: 'DenseVector') -> float:
        dot = sum(a*b for a,b in zip(self.values, other.values))
        return dot / (self._mag * other._mag) if self._mag and other._mag else 0.0

class MockEmbedder:
    def __init__(self, dim: int = 8): self.dim = dim
    def embed(self, text: str) -> DenseVector:
        h = hashlib.sha256(text.encode()).digest()
        vals = [float(b) / 255.0 for b in h[:self.dim]]
        mag = math.sqrt(sum(v*v for v in vals))
        return DenseVector([v/mag for v in vals] if mag else vals)

class FlatIndex:
    def __init__(self): self.vectors = []; self.ids = []; self.docs = []
    def add(self, id: str, vector: DenseVector, doc: str):
        self.vectors.append(vector); self.ids.append(id); self.docs.append(doc)
    def search(self, query: DenseVector, k: int = 10) -> List[Tuple[str, str, float]]:
        scores = [(self.ids[i], self.docs[i], query.cosine_similarity(v)) for i, v in enumerate(self.vectors)]
        return sorted(scores, key=lambda x: x[2], reverse=True)[:k]

class MockCrossEncoder:
    def score(self, query: str, document: str) -> float:
        qwords = set(query.lower().split())
        if not qwords: return 0.0
        doc_lower = document.lower()
        return sum(1 for w in qwords if w in doc_lower) / len(qwords)

# --- Your Task: Cascade Reranker ---

class CascadeReranker:
    def __init__(self, embedder: MockEmbedder, cross_encoder: MockCrossEncoder):
        self.embedder = embedder
        self.cross_encoder = cross_encoder
        self.index = FlatIndex()

    def add_documents(self, documents: List[str]):
        """Index all documents for fast first-stage retrieval."""
        for i, doc in enumerate(documents):
            vec = self.embedder.embed(doc)
            self.index.add(f"doc_{i}", vec, doc)

    def search(self, query: str, first_stage_k: int = 10, final_k: int = 3) -> List[Tuple[str, float]]:
        """
        Two-stage retrieval:
        1. Retrieve top first_stage_k using embedding similarity (fast).
        2. Rerank those using cross-encoder (slow but precise).
        3. Return top final_k as [(doc_text, rerank_score), ...].
        """
        # TODO: Implement cascade
        return []
`,
    testCode: `embedder = MockEmbedder(dim=8)
cross_encoder = MockCrossEncoder()
reranker = CascadeReranker(embedder, cross_encoder)

docs = [
    "Python is excellent for machine learning and data analysis.",
    "Java is a popular enterprise programming language.",
    "Python libraries include pandas, numpy, and scikit-learn.",
    "Ruby on Rails is great for web development.",
    "Data science with Python involves statistics and ML.",
]

reranker.add_documents(docs)

# Search for python-related content
results = reranker.search("python machine learning", first_stage_k=4, final_k=2)

assert len(results) == 2, "Should return 2 results"
# The top result should mention python and ML
assert "python" in results[0][0].lower(), "Top result should be Python-related"

print("Cascade Reranker passed!")
`,
    hints: [
      "Step 1: `candidates = self.index.search(self.embedder.embed(query), first_stage_k)`",
      "Step 2: `[(doc, self.cross_encoder.score(query, doc)) for _, doc, _ in candidates]`",
      "Step 3: Sort by rerank score descending, slice `[:final_k]`.",
    ],
    solution: `class CascadeReranker:
    def __init__(self, embedder, cross_encoder):
        self.embedder = embedder
        self.cross_encoder = cross_encoder
        self.index = FlatIndex()

    def add_documents(self, documents):
        for i, doc in enumerate(documents):
            vec = self.embedder.embed(doc)
            self.index.add(f"doc_{i}", vec, doc)

    def search(self, query, first_stage_k=10, final_k=3):
        # Stage 1: Fast embedding search
        query_vec = self.embedder.embed(query)
        candidates = self.index.search(query_vec, first_stage_k)
        
        # Stage 2: Slow cross-encoder rerank
        reranked = []
        for doc_id, doc_text, embed_score in candidates:
            rerank_score = self.cross_encoder.score(query, doc_text)
            reranked.append((doc_text, rerank_score))
        
        # Sort by rerank score (not embedding score)
        reranked.sort(key=lambda x: x[1], reverse=True)
        
        return reranked[:final_k]
`,
  },
];
