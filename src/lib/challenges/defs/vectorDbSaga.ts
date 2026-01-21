
import type { RawChallenge } from "@/lib/challenges/types";

export const VECTOR_DB_SAGA_CHALLENGES: RawChallenge[] = [
  {
    slug: "dense-vector-class",
    title: "Build Vector DB (1): DenseVector",
    description:
      "Create a robust `DenseVector` class. Why: In a real Vector DB, vectors are objects with properties like dimension and magnitude, not just raw lists. Solves: Encapsulation allows optimization (e.g., caching magnitude).",
    group: "Phase 1 — The Data Layer (Ingestion & Indexing)",
    difficulty: "medium",
    xpReward: 50,
    starterCode: `import math
from typing import List, Union

class DenseVector:
    def __init__(self, values: List[float]):
        self.values = values
        self.dim = len(values)
        # Optimization: cache magnitude if needed
        self._magnitude = None

    def dot(self, other: 'DenseVector') -> float:
        """Compute dot product with another vector."""
        # TODO: Implement
        raise NotImplementedError

    @property
    def magnitude(self) -> float:
        """Compute L2 norm (Euclidean length) and cache it."""
        # TODO: Implement
        raise NotImplementedError

    def cosine_similarity(self, other: 'DenseVector') -> float:
        """Compute cosine similarity."""
        # TODO: Implement: dot / (mag * mag)
        raise NotImplementedError
`,
    testCode: `v1 = DenseVector([1.0, 2.0, 3.0])
v2 = DenseVector([4.0, 5.0, 6.0])

# Test dot
assert v1.dot(v2) == 32.0, f"Expected 32.0, got {v1.dot(v2)}"

# Test magnitude
assert abs(v1.magnitude - 3.741657) < 1e-5, "Magnitude calculation incorrect"

# Test cosine
v3 = DenseVector([1.0, 0.0])
v4 = DenseVector([0.0, 1.0])
assert v3.cosine_similarity(v4) == 0.0, "Orthogonal vectors should have 0 cosine sim"

v5 = DenseVector([1.0, 1.0])
assert abs(v5.cosine_similarity(v5) - 1.0) < 1e-9, "Self-similarity should be 1.0"

print("All tests passed!")
`,
    hints: [
      "Use `sum(a*b for a,b in zip(...))` for dot product.",
      "Magnitude is `sqrt(sum(x**2))`.",
      "Cosine Similarity = `dot(A, B) / (mag(A) * mag(B))`.",
      "Don't forget to handle the cached `_magnitude` so you don't recompute it every time.",
    ],
    solution: `import math
from typing import List

class DenseVector:
    def __init__(self, values: List[float]):
        self.values = values
        self.dim = len(values)
        self._magnitude = None

    def dot(self, other: 'DenseVector') -> float:
        return sum(a * b for a, b in zip(self.values, other.values))

    @property
    def magnitude(self) -> float:
        if self._magnitude is None:
            self._magnitude = math.sqrt(sum(x * x for x in self.values))
        return self._magnitude

    def cosine_similarity(self, other: 'DenseVector') -> float:
        if self.magnitude == 0 or other.magnitude == 0:
            return 0.0
        return self.dot(other) / (self.magnitude * other.magnitude)
`,
    complexity: {
      time: "O(d)",
      space: "O(d)",
      latency: "~0.001ms per operation (d=768)",
    },
    realWorld: {
      description: "This is the core data structure inside FAISS, ChromaDB, and Pinecone. Every vector database stores embeddings as dense vectors with cached magnitudes for fast similarity computation.",
      companies: ["OpenAI", "Pinecone", "Weaviate", "Qdrant", "ChromaDB"],
      useCases: ["Embedding storage", "Semantic search", "Recommendation systems"],
    },
    prerequisites: ["dot-product", "cosine-similarity"],
    relatedChallenges: ["naive-flat-index", "ivf-flat-index"],
    relatedPlaybooks: ["rag-formulas-cheatsheet", "tool-comparison-matrix"],
  },
  {
    slug: "naive-flat-index",
    title: "Build Vector DB (2): Flat Index",
    description:
      "Implement a `FlatIndex` that stores vectors and performs exact k-NN search. Why: This is the baseline search algorithm for every Vector DB. Solves: Finds the exact nearest neighbors by comparing query to ALL vectors.",
    group: "Phase 1 — The Data Layer (Ingestion & Indexing)",
    difficulty: "medium",
    xpReward: 75,
    starterCode: `from typing import List, Tuple
import math

# --- Re-use your DenseVector class or use this simplified one ---
class DenseVector:
    def __init__(self, values: List[float]):
        self.values = values
        self.dim = len(values)
        self._mag = math.sqrt(sum(x*x for x in values))
    
    def cosine_similarity(self, other: 'DenseVector') -> float:
        dot = sum(a*b for a,b in zip(self.values, other.values))
        return dot / (self._mag * other._mag) if self._mag and other._mag else 0.0

class FlatIndex:
    def __init__(self):
        self.vectors: List[DenseVector] = []
        self.ids: List[str] = []

    def add(self, id: str, vector: DenseVector):
        """Add a vector to the index."""
        # TODO: Store vector and id
        pass

    def search(self, query: DenseVector, k: int = 1) -> List[Tuple[str, float]]:
        """
        Return top-k (id, score) sorted by cosine similarity (descending).
        """
        # TODO: Scan all vectors, compute scores, sort, return top-k
        return []
`,
    testCode: `idx = FlatIndex()
idx.add("vec1", DenseVector([1.0, 0.0, 0.0]))
idx.add("vec2", DenseVector([0.9, 0.1, 0.0]))
idx.add("vec3", DenseVector([0.0, 0.0, 1.0]))

query = DenseVector([1.0, 0.0, 0.0])
results = idx.search(query, k=2)

assert len(results) == 2, "Should return top 2 results"
assert results[0][0] == "vec1", "vec1 should be first (exact match)"
assert abs(results[0][1] - 1.0) < 1e-5
assert results[1][0] == "vec2", "vec2 should be second (0.9 match)"

print("Index search passed!")
`,
    hints: [
      "Store vectors in a simple list: `self.vectors.append(vector)`.",
      "In `search`, loop through `self.vectors`, compute `query.cosine_similarity(v)`, and store `(id, score)`.",
      "Use `sorted(scores, key=lambda x: x[1], reverse=True)` to sort by score descending.",
      "Slice the sorted list `[:k]` to get top-k.",
    ],
    solution: `from typing import List, Tuple
import math

class DenseVector:
    def __init__(self, values: List[float]):
        self.values = values
        self._mag = math.sqrt(sum(x*x for x in values))
    
    def cosine_similarity(self, other: 'DenseVector') -> float:
        dot = sum(a*b for a,b in zip(self.values, other.values))
        return dot / (self._mag * other._mag) if self._mag and other._mag else 0.0

class FlatIndex:
    def __init__(self):
        self.vectors: List[DenseVector] = []
        self.ids: List[str] = []

    def add(self, id: str, vector: DenseVector):
        self.ids.append(id)
        self.vectors.append(vector)

    def search(self, query: DenseVector, k: int = 1) -> List[Tuple[str, float]]:
        scores = []
        for i, vec in enumerate(self.vectors):
            score = query.cosine_similarity(vec)
            scores.append((self.ids[i], score))
        
        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:k]
`,
  },
  {
    slug: "ivf-flat-index",
    title: "Build Vector DB (3): IVF Index",
    description:
      "Implement an Inverted File (IVF) Index to speed up search. Why: Scanning 1M vectors is too slow. Solves: Partitions the space into clusters; you only search the clusters closest to your query.",
    group: "Phase 1 — The Data Layer (Ingestion & Indexing)",
    difficulty: "hard",
    xpReward: 100,
    starterCode: `from typing import List, Tuple, Dict
import math
import random

# --- Re-use DenseVector ---
class DenseVector:
    def __init__(self, values: List[float]):
        self.values = values
        self._mag = math.sqrt(sum(x*x for x in values))
    
    def cosine_similarity(self, other: 'DenseVector') -> float:
        dot = sum(a*b for a,b in zip(self.values, other.values))
        return dot / (self._mag * other._mag) if self._mag and other._mag else 0.0

class IVFIndex:
    def __init__(self, num_clusters: int = 2):
        self.num_clusters = num_clusters
        self.centroids: List[DenseVector] = []
        # Inverted lists: cluster_id -> List[(doc_id, vector)]
        self.inverted_lists: Dict[int, List[Tuple[str, DenseVector]]] = {i: [] for i in range(num_clusters)}

    def train(self, vectors: List[DenseVector]):
        """
        Naive training: Randomly select 'num_clusters' vectors as centroids.
        (Real DBs use K-means, but random is fine for this demo).
        """
        # TODO: Select k random vectors from input to be centroids
        pass

    def add(self, id: str, vector: DenseVector):
        """
        Assign vector to the nearest centroid and store in that bucket.
        """
        # TODO: Find nearest centroid (highest cosine sim)
        # TODO: Append (id, vector) to self.inverted_lists[best_cluster_id]
        pass

    def search(self, query: DenseVector, k: int = 1, nprobe: int = 1) -> List[Tuple[str, float]]:
        """
        1. Find 'nprobe' centroids closest to query.
        2. Scan ONLY vectors in those clusters.
        3. Return top-k overall.
        """
        # TODO: Implement approximate search
        return []
`,
    testCode: `
# Setup: 4 vectors in 2 obvious clusters
# Cluster A: ~[1, 0]
vec_a1 = DenseVector([1.0, 0.1])
vec_a2 = DenseVector([0.9, 0.0])
# Cluster B: ~[0, 1]
vec_b1 = DenseVector([0.0, 1.0])
vec_b2 = DenseVector([0.1, 0.9])

idx = IVFIndex(num_clusters=2)

# Cheat for deterministic testing: Force centroids to be ideally orthogonal
idx.centroids = [DenseVector([1.0, 0.0]), DenseVector([0.0, 1.0])]

idx.add("a1", vec_a1)
idx.add("a2", vec_a2)
idx.add("b1", vec_b1)
idx.add("b2", vec_b2)

# Sanity check: Buckets should be populated correctly
assert len(idx.inverted_lists[0]) == 2, "Cluster 0 should have 2 vectors"
assert len(idx.inverted_lists[1]) == 2, "Cluster 1 should have 2 vectors"

# Test Search
# Query near Cluster A
query = DenseVector([1.0, 0.0])
results = idx.search(query, k=1, nprobe=1)

assert len(results) == 1
assert results[0][0] in ["a1", "a2"], "Should retrieve from Cluster A"

print("IVF Index passed!")
`,
    hints: [
      "In `add`: iterate `enumerate(self.centroids)` to find the index `i` with max similarity.",
      "In `search`: first rank the centroids. Pick the top `nprobe` indices.",
      "Then loop over those specific lists in `self.inverted_lists` and collect candidates.",
      "Finally, sort the collected candidates and return top-k.",
    ],
    realWorld: {
        description: "IVF (Inverted File) is the most popular indexing strategy for billion-scale datasets. It's used by FAISS and Milvus to turn a linear scan into a 'pick-a-bucket' operation, reducing search time from seconds to milliseconds.",
        companies: ["Meta (FAISS)", "Zilliz (Milvus)", "JD.com"],
        useCases: ["Image Search at Scale", "Billion-scale Identity Matching"],
    },
    prerequisites: ["naive-flat-index"],
    relatedPlaybooks: ["tool-comparison-matrix", "production-deployment-checklist"],
    solution: `from typing import List, Tuple, Dict
import math
import random

class DenseVector:
    def __init__(self, values: List[float]):
        self.values = values
        self._mag = math.sqrt(sum(x*x for x in values))
    
    def cosine_similarity(self, other: 'DenseVector') -> float:
        dot = sum(a*b for a,b in zip(self.values, other.values))
        return dot / (self._mag * other._mag) if self._mag and other._mag else 0.0

class IVFIndex:
    def __init__(self, num_clusters: int = 2):
        self.num_clusters = num_clusters
        self.centroids: List[DenseVector] = []
        self.inverted_lists: Dict[int, List[Tuple[str, DenseVector]]] = {
            i: [] for i in range(num_clusters)
        }

    def train(self, vectors: List[DenseVector]):
        # Simple: pick random vectors as centroids
        self.centroids = random.sample(vectors, min(self.num_clusters, len(vectors)))

    def add(self, id: str, vector: DenseVector):
        # Find nearest centroid
        best_cluster = 0
        best_sim = -1
        for i, centroid in enumerate(self.centroids):
            sim = vector.cosine_similarity(centroid)
            if sim > best_sim:
                best_sim = sim
                best_cluster = i
        self.inverted_lists[best_cluster].append((id, vector))

    def search(self, query: DenseVector, k: int = 1, nprobe: int = 1) -> List[Tuple[str, float]]:
        # Rank centroids
        centroid_scores = [(i, query.cosine_similarity(c)) for i, c in enumerate(self.centroids)]
        centroid_scores.sort(key=lambda x: x[1], reverse=True)
        top_clusters = [c[0] for c in centroid_scores[:nprobe]]
        
        # Collect candidates from those clusters
        candidates = []
        for cluster_id in top_clusters:
            for doc_id, vec in self.inverted_lists[cluster_id]:
                score = query.cosine_similarity(vec)
                candidates.append((doc_id, score))
        
        candidates.sort(key=lambda x: x[1], reverse=True)
        return candidates[:k]
`,
  },
  {
    slug: "hnsw-index",
    title: "Build Vector DB (4): HNSW Graph",
    description:
      "Implement a Hierarchical Navigable Small World graph for O(log n) search. Why: IVF still scans entire clusters; HNSW navigates a graph. Solves: Enables sub-millisecond search on million-scale datasets.",
    group: "Phase 1 — The Data Layer (Ingestion & Indexing)",
    difficulty: "hard",
    xpReward: 150,
    starterCode: `from typing import List, Tuple, Dict, Set
import math
import random

class DenseVector:
    def __init__(self, values: List[float]):
        self.values = values
        self._mag = math.sqrt(sum(x*x for x in values))
    
    def cosine_similarity(self, other: 'DenseVector') -> float:
        dot = sum(a*b for a,b in zip(self.values, other.values))
        return dot / (self._mag * other._mag) if self._mag and other._mag else 0.0

class HNSWNode:
    def __init__(self, id: str, vector: DenseVector, level: int):
        self.id = id
        self.vector = vector
        self.level = level
        # Connections at each level: level -> Set[node_id]
        self.neighbors: Dict[int, Set[str]] = {l: set() for l in range(level + 1)}

class HNSWIndex:
    def __init__(self, M: int = 4, ef_construction: int = 16):
        """
        M: max number of neighbors per node per level
        ef_construction: size of dynamic candidate list during construction
        """
        self.M = M
        self.ef_construction = ef_construction
        self.nodes: Dict[str, HNSWNode] = {}
        self.entry_point: str = None
        self.max_level: int = 0
        self.ml = 1.0 / math.log(M)  # Level multiplier

    def _random_level(self) -> int:
        """Generate random level for new node (higher = rarer)."""
        level = 0
        while random.random() < 0.5 and level < 10:
            level += 1
        return level

    def add(self, id: str, vector: DenseVector):
        """
        Insert a new node into the HNSW graph.
        1. Generate random level for the node.
        2. If graph is empty, set as entry point.
        3. Otherwise, search from entry point down to level 0, connecting neighbors.
        """
        # TODO: Implement insertion
        pass

    def search(self, query: DenseVector, k: int = 1, ef: int = 10) -> List[Tuple[str, float]]:
        """
        Search for k nearest neighbors.
        1. Start at entry point.
        2. Greedily descend through levels.
        3. At level 0, do a more thorough search with 'ef' candidates.
        4. Return top-k.
        """
        # TODO: Implement search
        return []

    def _search_layer(self, query: DenseVector, entry_id: str, ef: int, level: int) -> List[Tuple[str, float]]:
        """
        Search within a single layer.
        Uses a greedy best-first approach with 'ef' candidates.
        """
        # TODO: Implement layer search
        return []
`,
    testCode: `random.seed(42)  # For reproducibility

idx = HNSWIndex(M=4, ef_construction=8)

# Add some vectors
vectors = [
    ("v1", DenseVector([1.0, 0.0, 0.0])),
    ("v2", DenseVector([0.9, 0.1, 0.0])),
    ("v3", DenseVector([0.0, 1.0, 0.0])),
    ("v4", DenseVector([0.0, 0.0, 1.0])),
    ("v5", DenseVector([0.5, 0.5, 0.0])),
]

for vid, vec in vectors:
    idx.add(vid, vec)

# Should have nodes
assert len(idx.nodes) == 5, "Should have 5 nodes"
assert idx.entry_point is not None, "Should have an entry point"

# Search should return nearest
query = DenseVector([1.0, 0.0, 0.0])
results = idx.search(query, k=2, ef=5)

assert len(results) == 2, "Should return 2 results"
assert results[0][0] == "v1", "v1 should be the nearest (exact match)"

print("HNSW Index passed!")
`,
    hints: [
      "In `add`: if graph is empty, create node and set as entry_point. Return early.",
      "For subsequent inserts: search from top level down to find entry points at each level.",
      "In `_search_layer`: use a visited set and a priority queue (sorted list) of candidates.",
      "Connect the new node to closest neighbors and update their neighbor lists too.",
    ],
    realWorld: {
        description: "HNSW is the 'Ferrari' of vector indexing. It provides the best trade-off between speed and recall by using a multi-layered graph. It is the default index type for high-performance databases like Pinecone and Weaviate.",
        companies: ["Pinecone", "Elastic", "Weaviate", "Azure SQL"],
        useCases: ["High-performance RAG", "Real-time Product Search"],
    },
    prerequisites: ["naive-flat-index", "ivf-flat-index"],
    relatedPlaybooks: ["tool-comparison-matrix", "rag-techniques-encyclopedia"],
    solution: `from typing import List, Tuple, Dict, Set
import math
import random

class DenseVector:
    def __init__(self, values: List[float]):
        self.values = values
        self._mag = math.sqrt(sum(x*x for x in values))
    
    def cosine_similarity(self, other: 'DenseVector') -> float:
        dot = sum(a*b for a,b in zip(self.values, other.values))
        return dot / (self._mag * other._mag) if self._mag and other._mag else 0.0

class HNSWNode:
    def __init__(self, id: str, vector: DenseVector, level: int):
        self.id = id
        self.vector = vector
        self.level = level
        self.neighbors: Dict[int, Set[str]] = {l: set() for l in range(level + 1)}

class HNSWIndex:
    def __init__(self, M: int = 4, ef_construction: int = 16):
        self.M = M
        self.ef_construction = ef_construction
        self.nodes: Dict[str, HNSWNode] = {}
        self.entry_point_id: str = None
        self.max_level: int = -1

    def _random_level(self) -> int:
        level = 0
        while random.random() < 0.5 and level < 10:
            level += 1
        return level

    def add(self, id: str, vector: DenseVector):
        level = self._random_level()
        node = HNSWNode(id, vector, level)
        self.nodes[id] = node

        if self.entry_point_id is None:
            self.entry_point_id = id
            self.max_level = level
            return

        curr_id = self.entry_point_id
        # 1. Greedy descend to the node's level
        for l in range(self.max_level, level, -1):
            curr_id = self._search_layer_greedy(vector, curr_id, l)

        # 2. Add to layers
        for l in range(min(level, self.max_level), -1, -1):
            candidates = self._search_layer(vector, curr_id, self.ef_construction, l)
            # Connect to M nearest
            for cand_id, _ in candidates[:self.M]:
                node.neighbors[l].add(cand_id)
                self.nodes[cand_id].neighbors[l].add(id)
            curr_id = candidates[0][0]

        if level > self.max_level:
            self.entry_point_id = id
            self.max_level = level

    def _search_layer_greedy(self, query: DenseVector, entry_id: str, level: int) -> str:
        curr_id = entry_id
        curr_sim = query.cosine_similarity(self.nodes[curr_id].vector)
        while True:
            changed = False
            for neighbor_id in self.nodes[curr_id].neighbors[level]:
                sim = query.cosine_similarity(self.nodes[neighbor_id].vector)
                if sim > curr_sim:
                    curr_sim = sim
                    curr_id = neighbor_id
                    changed = True
            if not changed: break
        return curr_id

    def _search_layer(self, query: DenseVector, entry_id: str, ef: int, level: int) -> List[Tuple[str, float]]:
        visited = {entry_id}
        candidates = [(entry_id, query.cosine_similarity(self.nodes[entry_id].vector))]
        results = candidates[:]
        
        while candidates:
            candidates.sort(key=lambda x: x[1], reverse=True)
            curr_id, curr_sim = candidates.pop(0)
            
            if curr_sim < results[-1][1] and len(results) >= ef:
                break
                
            for neighbor_id in self.nodes[curr_id].neighbors[level]:
                if neighbor_id not in visited:
                    visited.add(neighbor_id)
                    sim = query.cosine_similarity(self.nodes[neighbor_id].vector)
                    if len(results) < ef or sim > results[-1][1]:
                        candidates.append((neighbor_id, sim))
                        results.append((neighbor_id, sim))
                        results.sort(key=lambda x: x[1], reverse=True)
                        results = results[:ef]
        return results

    def search(self, query: DenseVector, k: int = 1, ef: int = 10) -> List[Tuple[str, float]]:
        if not self.entry_point_id: return []
        curr_id = self.entry_point_id
        for l in range(self.max_level, 0, -1):
            curr_id = self._search_layer_greedy(query, curr_id, l)
        return self._search_layer(query, curr_id, ef, 0)[:k]
`,
    benchmark: true,
  },
];
