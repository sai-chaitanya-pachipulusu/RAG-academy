// Comprehensive Micro-task system for ALL challenges
// Inspired by PaperCode's approach - breaks monolithic challenges into atomic steps

export interface MicroTask {
  id: string;
  title: string;
  description: string;
  starterCode: string;
  testCode: string;
  hints: string[];
  estimatedMinutes: number;
  order: number;
}

export interface MicroTaskChallenge {
  challengeSlug: string;
  totalTasks: number;
  tasks: MicroTask[];
}

// =====================================================
// FOUNDATIONS CHALLENGES - Phase 0
// =====================================================

const DOT_PRODUCT_TASKS: MicroTask[] = [
  {
    id: "dot-1",
    title: "Step 1: Validate Input Lengths",
    description: "First, check if both vectors have the same length. If not, raise a ValueError.",
    starterCode: `from typing import List

def dot(a: List[float], b: List[float]) -> float:
    # Check if lengths match
    # If not, raise ValueError
    pass`,
    testCode: `
try:
    dot([1, 2], [1])
    print("❌ Should have raised ValueError")
except ValueError:
    print("✓ Step 1 passed!")
`,
    hints: ["Use len(a) != len(b) to check", "raise ValueError('message')"],
    estimatedMinutes: 2,
    order: 1,
  },
  {
    id: "dot-2",
    title: "Step 2: Handle Empty Vectors",
    description: "Empty vectors should return 0.0. Check for this case.",
    starterCode: `def dot(a: List[float], b: List[float]) -> float:
    if len(a) != len(b):
        raise ValueError("Lengths must match")
    
    if len(a) == 0:
        return 0.0
    
    # Continue implementation...
    pass`,
    testCode: `
result = dot([], [])
assert result == 0.0, f"Expected 0.0, got {result}"
print("✓ Step 2 passed!")
`,
    hints: ["if len(a) == 0: return 0.0"],
    estimatedMinutes: 1,
    order: 2,
  },
  {
    id: "dot-3",
    title: "Step 3: Compute the Dot Product",
    description: "Multiply corresponding elements and sum them. Use zip() to iterate both lists together.",
    starterCode: `def dot(a: List[float], b: List[float]) -> float:
    if len(a) != len(b):
        raise ValueError("Lengths must match")
    
    # Sum of element-wise products
    # Use: sum(x * y for x, y in zip(a, b))
    pass`,
    testCode: `
result = dot([1, 2, 3], [4, 5, 6])
assert result == 32, f"Expected 32, got {result}"
print("✓ Step 3 passed!")
print("🎉 Challenge complete!")
`,
    hints: ["zip(a, b) pairs elements: [(1,4), (2,5), (3,6)]", "sum(x * y for x, y in zip(a, b))"],
    estimatedMinutes: 2,
    order: 3,
  },
];

const COSINE_SIMILARITY_TASKS: MicroTask[] = [
  {
    id: "cosine-1",
    title: "Step 1: Compute Dot Product",
    description: "First, compute the dot product of the two vectors.",
    starterCode: `from typing import List
import math

def cosine_similarity(a: List[float], b: List[float]) -> float:
    # First compute dot product
    dot_product = sum(x * y for x, y in zip(a, b))
    # Continue...
    pass`,
    testCode: `
# Just testing structure
result = cosine_similarity([1, 0], [1, 0])
print("✓ Step 1: Function structure correct")
`,
    hints: ["dot = sum(x * y for x, y in zip(a, b))"],
    estimatedMinutes: 2,
    order: 1,
  },
  {
    id: "cosine-2",
    title: "Step 2: Compute Magnitudes",
    description: "Calculate the L2 norm (magnitude) of each vector. Magnitude = sqrt(sum of squares).",
    starterCode: `def cosine_similarity(a: List[float], b: List[float]) -> float:
    dot_product = sum(x * y for x, y in zip(a, b))
    
    # Compute magnitudes
    mag_a = math.sqrt(sum(x * x for x in a))
    mag_b = math.sqrt(sum(x * x for x in b))
    # Continue...
    pass`,
    testCode: `
# Test magnitude calculation internally
import math
a = [3, 4]
mag = math.sqrt(sum(x*x for x in a))
assert abs(mag - 5.0) < 0.001, "Magnitude of [3,4] should be 5"
print("✓ Step 2 passed!")
`,
    hints: ["math.sqrt(sum(x * x for x in vector))", "Magnitude of [3,4] is 5 (Pythagorean)"],
    estimatedMinutes: 2,
    order: 2,
  },
  {
    id: "cosine-3",
    title: "Step 3: Handle Zero Magnitude",
    description: "If either vector has zero magnitude, raise ValueError (can't divide by zero).",
    starterCode: `def cosine_similarity(a: List[float], b: List[float]) -> float:
    if len(a) != len(b):
        raise ValueError("Lengths must match")
    
    dot_product = sum(x * y for x, y in zip(a, b))
    mag_a = math.sqrt(sum(x * x for x in a))
    mag_b = math.sqrt(sum(x * x for x in b))
    
    if mag_a == 0 or mag_b == 0:
        raise ValueError("Cannot compute with zero magnitude")
    # Continue...
    pass`,
    testCode: `
try:
    cosine_similarity([0, 0], [1, 2])
    print("❌ Should have raised ValueError")
except ValueError:
    print("✓ Step 3 passed!")
`,
    hints: ["if mag_a == 0 or mag_b == 0: raise ValueError"],
    estimatedMinutes: 1,
    order: 3,
  },
  {
    id: "cosine-4",
    title: "Step 4: Compute Final Result",
    description: "Divide dot product by the product of magnitudes to get cosine similarity.",
    starterCode: `def cosine_similarity(a: List[float], b: List[float]) -> float:
    if len(a) != len(b):
        raise ValueError("Lengths must match")
    
    dot_product = sum(x * y for x, y in zip(a, b))
    mag_a = math.sqrt(sum(x * x for x in a))
    mag_b = math.sqrt(sum(x * x for x in b))
    
    if mag_a == 0 or mag_b == 0:
        raise ValueError("Cannot compute with zero magnitude")
    
    return dot_product / (mag_a * mag_b)`,
    testCode: `
result = cosine_similarity([1, 0], [1, 0])
assert abs(result - 1.0) < 0.001, "Same direction should be 1.0"
result2 = cosine_similarity([1, 0], [0, 1])
assert abs(result2 - 0.0) < 0.001, "Orthogonal should be 0.0"
print("✓ Step 4 passed!")
print("🎉 Challenge complete!")
`,
    hints: ["return dot_product / (mag_a * mag_b)"],
    estimatedMinutes: 2,
    order: 4,
  },
];

const EUCLIDEAN_DISTANCE_TASKS: MicroTask[] = [
  {
    id: "euclidean-1",
    title: "Step 1: Validate Lengths",
    description: "Check if both vectors have the same length.",
    starterCode: `from typing import List
import math

def euclidean_distance(a: List[float], b: List[float]) -> float:
    if len(a) != len(b):
        raise ValueError("Vectors must have same length")
    pass`,
    testCode: `
try:
    euclidean_distance([1, 2], [1])
    print("❌ Should raise ValueError")
except ValueError:
    print("✓ Step 1 passed!")
`,
    hints: ["if len(a) != len(b): raise ValueError"],
    estimatedMinutes: 1,
    order: 1,
  },
  {
    id: "euclidean-2",
    title: "Step 2: Compute Squared Differences",
    description: "For each pair of elements, compute (a[i] - b[i])^2 and sum them.",
    starterCode: `def euclidean_distance(a: List[float], b: List[float]) -> float:
    if len(a) != len(b):
        raise ValueError("Vectors must have same length")
    
    # Sum of squared differences
    squared_sum = sum((x - y) ** 2 for x, y in zip(a, b))
    # Continue...
    pass`,
    testCode: `
# Test intermediate step
squared = sum((x - y) ** 2 for x, y in zip([0, 0], [3, 4]))
assert squared == 25, f"Squared sum should be 25, got {squared}"
print("✓ Step 2 passed!")
`,
    hints: ["(x - y) ** 2 computes squared difference", "zip pairs elements together"],
    estimatedMinutes: 2,
    order: 2,
  },
  {
    id: "euclidean-3",
    title: "Step 3: Take Square Root",
    description: "Return the square root of the sum of squared differences.",
    starterCode: `def euclidean_distance(a: List[float], b: List[float]) -> float:
    if len(a) != len(b):
        raise ValueError("Vectors must have same length")
    
    squared_sum = sum((x - y) ** 2 for x, y in zip(a, b))
    return math.sqrt(squared_sum)`,
    testCode: `
result = euclidean_distance([0, 0], [3, 4])
assert abs(result - 5.0) < 0.001, "3-4-5 triangle distance should be 5"
assert euclidean_distance([], []) == 0.0
print("✓ Step 3 passed!")
print("🎉 Challenge complete!")
`,
    hints: ["math.sqrt(squared_sum)", "Empty vectors have distance 0"],
    estimatedMinutes: 2,
    order: 3,
  },
];

// =====================================================
// VECTOR DB SAGA CHALLENGES
// =====================================================

const DENSE_VECTOR_TASKS: MicroTask[] = [
  {
    id: "dense-1",
    title: "Step 1: Store Vector Values",
    description: "Initialize the DenseVector class to store values and dimension.",
    starterCode: `import math
from typing import List

class DenseVector:
    def __init__(self, values: List[float]):
        self.values = values
        self.dim = len(values)
        self._magnitude = None  # Cache for optimization`,
    testCode: `
v = DenseVector([1.0, 2.0, 3.0])
assert v.dim == 3
assert v.values == [1.0, 2.0, 3.0]
print("✓ Step 1 passed!")
`,
    hints: ["Store self.values and compute self.dim"],
    estimatedMinutes: 2,
    order: 1,
  },
  {
    id: "dense-2",
    title: "Step 2: Implement Dot Product",
    description: "Add a dot() method that computes dot product with another DenseVector.",
    starterCode: `def dot(self, other: 'DenseVector') -> float:
    return sum(a * b for a, b in zip(self.values, other.values))`,
    testCode: `
v1 = DenseVector([1.0, 2.0, 3.0])
v2 = DenseVector([4.0, 5.0, 6.0])
assert v1.dot(v2) == 32.0
print("✓ Step 2 passed!")
`,
    hints: ["sum(a * b for a, b in zip(self.values, other.values))"],
    estimatedMinutes: 2,
    order: 2,
  },
  {
    id: "dense-3",
    title: "Step 3: Implement Magnitude",
    description: "Add a magnitude property using L2 norm. Cache the result for efficiency.",
    starterCode: `@property
def magnitude(self) -> float:
    if self._magnitude is None:
        self._magnitude = math.sqrt(sum(x * x for x in self.values))
    return self._magnitude`,
    testCode: `
v = DenseVector([3.0, 4.0])
assert abs(v.magnitude - 5.0) < 0.001
print("✓ Step 3 passed!")
`,
    hints: ["Cache result in self._magnitude", "math.sqrt(sum(x * x for x in self.values))"],
    estimatedMinutes: 3,
    order: 3,
  },
  {
    id: "dense-4",
    title: "Step 4: Implement Cosine Similarity",
    description: "Add cosine_similarity() method using dot product and magnitudes.",
    starterCode: `def cosine_similarity(self, other: 'DenseVector') -> float:
    dot_product = self.dot(other)
    return dot_product / (self.magnitude * other.magnitude)`,
    testCode: `
v1 = DenseVector([1.0, 0.0])
v2 = DenseVector([0.0, 1.0])
assert v1.cosine_similarity(v2) == 0.0
v3 = DenseVector([1.0, 1.0])
assert abs(v3.cosine_similarity(v3) - 1.0) < 0.001
print("✓ Step 4 passed!")
print("🎉 Challenge complete!")
`,
    hints: ["dot / (mag1 * mag2)", "Handle zero magnitude case"],
    estimatedMinutes: 3,
    order: 4,
  },
];

const FLAT_INDEX_TASKS: MicroTask[] = [
  {
    id: "flat-1",
    title: "Step 1: Initialize the Index",
    description: "Create storage for vectors and store the dimension.",
    starterCode: `class FlatIndex:
    def __init__(self, dimension: int):
        self.dimension = dimension
        self.vectors = []
        self.ids = []`,
    testCode: `
idx = FlatIndex(128)
assert idx.dimension == 128
assert len(idx.vectors) == 0
print("✓ Step 1 passed!")
`,
    hints: ["self.vectors = [] to store vectors", "self.dimension = dimension"],
    estimatedMinutes: 2,
    order: 1,
  },
  {
    id: "flat-2",
    title: "Step 2: Add Vectors",
    description: "Implement add() to insert a vector and return its index.",
    starterCode: `def add(self, vector: list) -> int:
    if len(vector) != self.dimension:
        raise ValueError("Dimension mismatch")
    idx = len(self.vectors)
    self.vectors.append(vector)
    return idx`,
    testCode: `
idx = FlatIndex(3)
id1 = idx.add([1.0, 2.0, 3.0])
id2 = idx.add([4.0, 5.0, 6.0])
assert id1 == 0 and id2 == 1
print("✓ Step 2 passed!")
`,
    hints: ["Return len(self.vectors) - 1 after append", "Validate dimension first"],
    estimatedMinutes: 3,
    order: 2,
  },
  {
    id: "flat-3",
    title: "Step 3: Search (Dot Product)",
    description: "Implement brute-force search computing dot product with all vectors.",
    starterCode: `def search(self, query: list, k: int) -> list:
    scores = []
    for i, vec in enumerate(self.vectors):
        score = sum(a * b for a, b in zip(query, vec))
        scores.append((i, score))
    
    # Sort by score descending
    scores.sort(key=lambda x: x[1], reverse=True)
    return scores[:k]`,
    testCode: `
idx = FlatIndex(3)
idx.add([1.0, 0.0, 0.0])
idx.add([0.0, 1.0, 0.0])
idx.add([1.0, 1.0, 0.0])
results = idx.search([1.0, 0.0, 0.0], k=2)
assert results[0][0] in [0, 2]
print("✓ Step 3 passed!")
print("🎉 Challenge complete!")
`,
    hints: ["Compute dot product for each vector", "Sort by score descending", "Return top k"],
    estimatedMinutes: 5,
    order: 3,
  },
];

const IVF_INDEX_TASKS: MicroTask[] = [
  {
    id: "ivf-1",
    title: "Step 1: Initialize with Centroids",
    description: "Store k-means centroids and create empty lists for each cluster.",
    starterCode: `class IVFIndex:
    def __init__(self, centroids: list):
        self.centroids = centroids
        self.num_lists = len(centroids)
        self.inverted_lists = [[] for _ in range(self.num_lists)]`,
    testCode: `
centroids = [[1, 0], [0, 1]]
idx = IVFIndex(centroids)
assert idx.num_lists == 2
assert len(idx.inverted_lists) == 2
print("✓ Step 1 passed!")
`,
    hints: ["Create one inverted list per centroid", "self.inverted_lists = [[] for _ in range(n)]"],
    estimatedMinutes: 2,
    order: 1,
  },
  {
    id: "ivf-2",
    title: "Step 2: Find Nearest Centroid",
    description: "Helper method to find which centroid a vector is closest to.",
    starterCode: `def _find_nearest_centroid(self, vector: list) -> int:
    best_idx = 0
    best_score = float('-inf')
    for i, centroid in enumerate(self.centroids):
        score = sum(a * b for a, b in zip(vector, centroid))
        if score > best_score:
            best_score = score
            best_idx = i
    return best_idx`,
    testCode: `
centroids = [[1, 0], [0, 1]]
idx = IVFIndex(centroids)
assert idx._find_nearest_centroid([0.9, 0.1]) == 0
assert idx._find_nearest_centroid([0.1, 0.9]) == 1
print("✓ Step 2 passed!")
`,
    hints: ["Compute dot product with each centroid", "Return index of highest score"],
    estimatedMinutes: 3,
    order: 2,
  },
  {
    id: "ivf-3",
    title: "Step 3: Add to Inverted List",
    description: "Add vectors to their nearest centroid's inverted list.",
    starterCode: `def add(self, vector: list, vector_id: int):
    list_idx = self._find_nearest_centroid(vector)
    self.inverted_lists[list_idx].append((vector_id, vector))`,
    testCode: `
centroids = [[1, 0], [0, 1]]
idx = IVFIndex(centroids)
idx.add([0.9, 0.1], 0)
idx.add([0.1, 0.9], 1)
assert len(idx.inverted_lists[0]) == 1
assert len(idx.inverted_lists[1]) == 1
print("✓ Step 3 passed!")
`,
    hints: ["Find nearest centroid first", "Append (id, vector) tuple to that list"],
    estimatedMinutes: 2,
    order: 3,
  },
  {
    id: "ivf-4",
    title: "Step 4: Search with nprobe",
    description: "Search only the nprobe nearest centroids (not all vectors).",
    starterCode: `def search(self, query: list, k: int, nprobe: int = 1) -> list:
    # Find nprobe nearest centroids
    centroid_scores = []
    for i, c in enumerate(self.centroids):
        score = sum(a * b for a, b in zip(query, c))
        centroid_scores.append((i, score))
    centroid_scores.sort(key=lambda x: x[1], reverse=True)
    
    # Search those lists
    candidates = []
    for list_idx, _ in centroid_scores[:nprobe]:
        for vec_id, vec in self.inverted_lists[list_idx]:
            score = sum(a * b for a, b in zip(query, vec))
            candidates.append((vec_id, score))
    
    candidates.sort(key=lambda x: x[1], reverse=True)
    return candidates[:k]`,
    testCode: `
centroids = [[1, 0], [0, 1]]
idx = IVFIndex(centroids)
idx.add([1, 0], 0)
idx.add([0, 1], 1)
results = idx.search([1, 0], k=1, nprobe=1)
assert results[0][0] == 0
print("✓ Step 4 passed!")
print("🎉 Challenge complete!")
`,
    hints: ["First find nearest centroids", "Only search those inverted lists", "nprobe controls recall vs speed"],
    estimatedMinutes: 5,
    order: 4,
  },
];

// =====================================================
// RAG PIPELINE SAGA CHALLENGES
// =====================================================

const CHUNKER_TASKS: MicroTask[] = [
  {
    id: "chunker-1",
    title: "Step 1: Basic Chunking Loop",
    description: "Split text into fixed-size chunks using a while loop.",
    starterCode: `def chunk(self, document: str) -> list:
    chunks = []
    start = 0
    while start < len(document):
        end = start + self.chunk_size
        text = document[start:end]
        chunks.append(text)
        start = end
    return chunks`,
    testCode: `
chunker = Chunker(chunk_size=5, overlap=0)
result = chunker.chunk("HelloWorld")
assert result == ["Hello", "World"]
print("✓ Step 1 passed!")
`,
    hints: ["Use while start < len(document)", "Slice: document[start:end]"],
    estimatedMinutes: 3,
    order: 1,
  },
  {
    id: "chunker-2",
    title: "Step 2: Add Overlap",
    description: "Modify the loop to overlap chunks by moving start back.",
    starterCode: `def chunk(self, document: str) -> list:
    chunks = []
    start = 0
    while start < len(document):
        end = min(start + self.chunk_size, len(document))
        text = document[start:end]
        chunks.append(text)
        if end >= len(document):
            break
        start = end - self.overlap  # Move back by overlap
    return chunks`,
    testCode: `
chunker = Chunker(chunk_size=5, overlap=2)
result = chunker.chunk("ABCDEFGHIJ")
assert "ABC" in result[0] and "CDE" in result[1]
print("✓ Step 2 passed!")
`,
    hints: ["start = end - self.overlap", "Ensure forward progress when overlap > 0"],
    estimatedMinutes: 3,
    order: 2,
  },
  {
    id: "chunker-3",
    title: "Step 3: Add Metadata",
    description: "Return Chunk objects with text, id, and metadata.",
    starterCode: `def chunk(self, document: str, source_meta=None) -> list:
    chunks = []
    start = 0
    position = 0
    
    while start < len(document):
        end = min(start + self.chunk_size, len(document))
        text = document[start:end]
        
        chunk = Chunk(text, metadata={
            "source": source_meta or {},
            "position": position,
            "start_char": start,
            "end_char": end
        })
        chunk.id = self._generate_id()
        chunks.append(chunk)
        
        position += 1
        if end >= len(document):
            break
        start = end - self.overlap
    
    return chunks`,
    testCode: `
chunker = Chunker(chunk_size=10, overlap=2)
result = chunker.chunk("Test document", source_meta={"file": "test.txt"})
assert result[0].id is not None
assert result[0].metadata["source"]["file"] == "test.txt"
print("✓ Step 3 passed!")
print("🎉 Challenge complete!")
`,
    hints: ["Include start_char and end_char for citation", "Generate unique IDs"],
    estimatedMinutes: 4,
    order: 3,
  },
];

const EMBEDDER_TASKS: MicroTask[] = [
  {
    id: "embedder-1",
    title: "Step 1: Tokenize Text",
    description: "Split text into words for simple bag-of-words embedding.",
    starterCode: `def _tokenize(self, text: str) -> list:
    return text.lower().split()`,
    testCode: `
embedder = MockEmbedder(dim=10)
tokens = embedder._tokenize("Hello World")
assert tokens == ["hello", "world"]
print("✓ Step 1 passed!")
`,
    hints: ["text.lower().split()", "Handle punctuation if needed"],
    estimatedMinutes: 2,
    order: 1,
  },
  {
    id: "embedder-2",
    title: "Step 2: Initialize Vocabulary",
    description: "Map words to dimensions in the embedding space.",
    starterCode: `def __init__(self, dim: int = 128):
    self.dim = dim
    self.vocab = {}
    self.next_idx = 0

def _get_word_idx(self, word: str) -> int:
    if word not in self.vocab:
        self.vocab[word] = self.next_idx % self.dim
        self.next_idx += 1
    return self.vocab[word]`,
    testCode: `
embedder = MockEmbedder(dim=10)
idx1 = embedder._get_word_idx("hello")
idx2 = embedder._get_word_idx("hello")
assert idx1 == idx2
print("✓ Step 2 passed!")
`,
    hints: ["Map words to indices consistently", "Use modulo to stay within dim"],
    estimatedMinutes: 3,
    order: 2,
  },
  {
    id: "embedder-3",
    title: "Step 3: Create Embedding Vector",
    description: "Create a sparse vector where word indices have non-zero values.",
    starterCode: `def embed(self, text: str) -> list:
    vector = [0.0] * self.dim
    tokens = self._tokenize(text)
    
    for token in tokens:
        idx = self._get_word_idx(token)
        vector[idx] += 1.0
    
    # Normalize
    magnitude = sum(x * x for x in vector) ** 0.5
    if magnitude > 0:
        vector = [x / magnitude for x in vector]
    
    return vector`,
    testCode: `
embedder = MockEmbedder(dim=10)
vec = embedder.embed("hello world")
assert len(vec) == 10
assert sum(abs(x) for x in vec) > 0
print("✓ Step 3 passed!")
print("🎉 Challenge complete!")
`,
    hints: ["Increment at word index", "Normalize for cosine similarity"],
    estimatedMinutes: 4,
    order: 3,
  },
];

// =====================================================
// RERANKER SAGA CHALLENGES
// =====================================================

const RERANKER_SCORE_TASKS: MicroTask[] = [
  {
    id: "rerank-1",
    title: "Step 1: Extract Query Words",
    description: "Split query into lowercase words for matching.",
    starterCode: `def score(self, query: str, document: str) -> float:
    query_words = query.lower().split()
    if not query_words:
        return 0.0
    # Continue...
    pass`,
    testCode: `
encoder = MockCrossEncoder()
words = "Python Data Science".lower().split()
assert words == ["python", "data", "science"]
print("✓ Step 1 passed!")
`,
    hints: ["query.lower().split()", "Handle empty query"],
    estimatedMinutes: 2,
    order: 1,
  },
  {
    id: "rerank-2",
    title: "Step 2: Count Matches",
    description: "Count how many query words appear in the document.",
    starterCode: `def score(self, query: str, document: str) -> float:
    query_words = query.lower().split()
    if not query_words:
        return 0.0
    
    doc_lower = document.lower()
    matches = sum(1 for word in query_words if word in doc_lower)
    # Continue...
    pass`,
    testCode: `
encoder = MockCrossEncoder()
score = encoder.score("python data", "Python is great for data science")
assert score > 0.5
print("✓ Step 2 passed!")
`,
    hints: ["Check if word is in doc_lower", "Use sum() with generator"],
    estimatedMinutes: 2,
    order: 2,
  },
  {
    id: "rerank-3",
    title: "Step 3: Compute Final Score",
    description: "Return ratio of matching words to total query words.",
    starterCode: `def score(self, query: str, document: str) -> float:
    query_words = query.lower().split()
    if not query_words:
        return 0.0
    
    doc_lower = document.lower()
    matches = sum(1 for word in query_words if word in doc_lower)
    
    return matches / len(query_words)`,
    testCode: `
encoder = MockCrossEncoder()
score1 = encoder.score("python data", "Python is for data")
assert abs(score1 - 1.0) < 0.001
score2 = encoder.score("python data", "JavaScript is cool")
assert score2 == 0.0
print("✓ Step 3 passed!")
print("🎉 Challenge complete!")
`,
    hints: ["matches / len(query_words)", "All words match = 1.0, none = 0.0"],
    estimatedMinutes: 2,
    order: 3,
  },
];

// =====================================================
// EVALUATOR SAGA CHALLENGES
// =====================================================

const RECALL_AT_K_TASKS: MicroTask[] = [
  {
    id: "recall-1",
    title: "Step 1: Handle Edge Case",
    description: "If there are no relevant documents, return 0.0.",
    starterCode: `def recall_at_k(retrieved: list, relevant: set, k: int) -> float:
    if len(relevant) == 0:
        return 0.0
    # Continue...
    pass`,
    testCode: `
result = recall_at_k(["a", "b"], set(), k=2)
assert result == 0.0
print("✓ Step 1 passed!")
`,
    hints: ["if len(relevant) == 0: return 0.0", "Prevents division by zero"],
    estimatedMinutes: 1,
    order: 1,
  },
  {
    id: "recall-2",
    title: "Step 2: Get Top K Retrieved",
    description: "Slice the retrieved list to get only the first k items.",
    starterCode: `def recall_at_k(retrieved: list, relevant: set, k: int) -> float:
    if len(relevant) == 0:
        return 0.0
    
    top_k = set(retrieved[:k])
    # Continue...
    pass`,
    testCode: `
top_k = set(["a", "b", "c", "d", "e"][:3])
assert top_k == {"a", "b", "c"}
print("✓ Step 2 passed!")
`,
    hints: ["retrieved[:k] slices first k items", "Convert to set for intersection"],
    estimatedMinutes: 1,
    order: 2,
  },
  {
    id: "recall-3",
    title: "Step 3: Compute Intersection",
    description: "Find which relevant items were retrieved in top k.",
    starterCode: `def recall_at_k(retrieved: list, relevant: set, k: int) -> float:
    if len(relevant) == 0:
        return 0.0
    
    top_k = set(retrieved[:k])
    found = top_k & relevant  # Set intersection
    
    return len(found) / len(relevant)`,
    testCode: `
result = recall_at_k(["a", "b", "c"], {"a", "b"}, k=3)
assert result == 1.0
result2 = recall_at_k(["a", "b", "c"], {"a", "d"}, k=3)
assert result2 == 0.5
print("✓ Step 3 passed!")
print("🎉 Challenge complete!")
`,
    hints: ["top_k & relevant for intersection", "len(found) / len(relevant)"],
    estimatedMinutes: 2,
    order: 3,
  },
];

const MRR_TASKS: MicroTask[] = [
  {
    id: "mrr-1",
    title: "Step 1: Find First Relevant Position",
    description: "Loop through retrieved items to find the first relevant one.",
    starterCode: `def mrr(retrieved: list, relevant: set) -> float:
    for i, doc in enumerate(retrieved):
        if doc in relevant:
            # Found first relevant!
            rank = i + 1  # 1-indexed
            return 1.0 / rank
    return 0.0`,
    testCode: `
result = mrr(["a", "b", "c"], {"b"})
assert result == 0.5
result2 = mrr(["a", "b", "c"], {"a"})
assert result2 == 1.0
print("✓ Step 1 passed!")
`,
    hints: ["enumerate gives (index, item)", "Rank is 1-indexed: i + 1"],
    estimatedMinutes: 3,
    order: 1,
  },
  {
    id: "mrr-2",
    title: "Step 2: Handle No Relevant Found",
    description: "Return 0.0 if no relevant document is in the retrieved list.",
    starterCode: `def mrr(retrieved: list, relevant: set) -> float:
    for i, doc in enumerate(retrieved):
        if doc in relevant:
            return 1.0 / (i + 1)
    return 0.0  # No relevant found`,
    testCode: `
result = mrr(["a", "b", "c"], {"d"})
assert result == 0.0
print("✓ Step 2 passed!")
print("🎉 Challenge complete!")
`,
    hints: ["Return 0.0 after loop ends", "Means first relevant was never found"],
    estimatedMinutes: 2,
    order: 2,
  },
];

const NDCG_TASKS: MicroTask[] = [
  {
    id: "ndcg-1",
    title: "Step 1: Compute DCG",
    description: "DCG = Σ(relevance / log2(rank + 1)) for each position.",
    starterCode: `import math

def dcg(relevances: list) -> float:
    total = 0.0
    for i, rel in enumerate(relevances):
        rank = i + 1  # 1-indexed
        total += rel / math.log2(rank + 1)
    return total`,
    testCode: `
result = dcg([3, 2, 1, 0])
assert result > 0
print("✓ Step 1 passed!")
`,
    hints: ["Use math.log2(rank + 1)", "Position 1 has log2(2) = 1"],
    estimatedMinutes: 3,
    order: 1,
  },
  {
    id: "ndcg-2",
    title: "Step 2: Compute Ideal DCG",
    description: "IDCG is DCG of the ideal ordering (sorted by relevance descending).",
    starterCode: `def idcg(relevances: list) -> float:
    sorted_rels = sorted(relevances, reverse=True)
    return dcg(sorted_rels)`,
    testCode: `
result = idcg([1, 3, 2])
ideal_result = dcg([3, 2, 1])
assert abs(result - ideal_result) < 0.001
print("✓ Step 2 passed!")
`,
    hints: ["Sort descending for ideal", "sorted(relevances, reverse=True)"],
    estimatedMinutes: 2,
    order: 2,
  },
  {
    id: "ndcg-3",
    title: "Step 3: Compute nDCG",
    description: "nDCG = DCG / IDCG (normalized between 0 and 1).",
    starterCode: `def ndcg(relevances: list) -> float:
    ideal = idcg(relevances)
    if ideal == 0:
        return 0.0
    return dcg(relevances) / ideal`,
    testCode: `
result = ndcg([3, 2, 1])
assert abs(result - 1.0) < 0.001  # Perfect ordering
result2 = ndcg([1, 2, 3])
assert result2 < 1.0  # Not perfect
print("✓ Step 3 passed!")
print("🎉 Challenge complete!")
`,
    hints: ["Handle IDCG = 0 (no relevance)", "Perfect ordering = 1.0"],
    estimatedMinutes: 3,
    order: 3,
  },
];

// =====================================================
// ADDITIONAL CHALLENGES - TOKENIZER
// =====================================================

const TOKENIZER_TASKS: MicroTask[] = [
  {
    id: "tokenizer-1",
    title: "Step 1: Lowercase the Input",
    description: "First, convert all text to lowercase to normalize case.",
    starterCode: `import re
from typing import List

def tokenize(text: str) -> List[str]:
    text = text.lower()
    # Continue...
    pass`,
    testCode: `
result = "Hello WORLD".lower()
assert result == "hello world"
print("✓ Step 1 passed!")
`,
    hints: ["text.lower()", "Normalize before splitting"],
    estimatedMinutes: 1,
    order: 1,
  },
  {
    id: "tokenizer-2",
    title: "Step 2: Extract Alphanumeric Tokens",
    description: "Use regex to find all alphanumeric sequences.",
    starterCode: `def tokenize(text: str) -> List[str]:
    text = text.lower()
    return re.findall(r'[a-z0-9]+', text)`,
    testCode: `
result = tokenize("Hello, world!")
assert result == ["hello", "world"]
print("✓ Step 2 passed!")
`,
    hints: ["re.findall(r'[a-z0-9]+', text)", "This automatically splits on punctuation"],
    estimatedMinutes: 2,
    order: 2,
  },
  {
    id: "tokenizer-3",
    title: "Step 3: Implement Token Counter",
    description: "Create a function to count the number of tokens.",
    starterCode: `def count_tokens(text: str) -> int:
    return len(tokenize(text))`,
    testCode: `
assert count_tokens("Hello, world!") == 2
assert count_tokens("A B C") == 3
assert count_tokens("") == 0
print("✓ Step 3 passed!")
print("🎉 Challenge complete!")
`,
    hints: ["Just return len(tokenize(text))"],
    estimatedMinutes: 1,
    order: 3,
  },
];

// =====================================================
// ADDITIONAL CHALLENGES - RETRIEVER
// =====================================================

const RETRIEVER_TASKS: MicroTask[] = [
  {
    id: "retriever-1",
    title: "Step 1: Initialize Components",
    description: "Set up the embedder, index, and chunk store.",
    starterCode: `class Retriever:
    def __init__(self, embedder):
        self.embedder = embedder
        self.index = FlatIndex()
        self.chunk_store = {}  # id -> Chunk`,
    testCode: `
embedder = MockEmbedder(dim=8)
retriever = Retriever(embedder)
assert retriever.index is not None
assert retriever.chunk_store == {}
print("✓ Step 1 passed!")
`,
    hints: ["Store embedder, create empty index and chunk_store"],
    estimatedMinutes: 2,
    order: 1,
  },
  {
    id: "retriever-2",
    title: "Step 2: Add Documents (Chunk + Embed)",
    description: "Chunk documents and add embeddings to the index.",
    starterCode: `def add_documents(self, docs, chunk_size=100, overlap=20):
    cid = 0
    for doc in docs:
        start = 0
        while start < len(doc):
            end = min(start + chunk_size, len(doc))
            c = Chunk(doc[start:end])
            c.id = f"c_{cid}"
            cid += 1
            
            # Store chunk
            self.chunk_store[c.id] = c
            
            # Embed and index
            vec = self.embedder.embed(c.text)
            self.index.add(c.id, vec)
            
            if end >= len(doc):
                break
            start = end - overlap`,
    testCode: `
retriever = Retriever(MockEmbedder(dim=8))
retriever.add_documents(["Test document about Python."])
assert len(retriever.chunk_store) > 0
print("✓ Step 2 passed!")
`,
    hints: ["Chunk each doc, embed each chunk, add to index", "Store chunk by ID"],
    estimatedMinutes: 5,
    order: 2,
  },
  {
    id: "retriever-3",
    title: "Step 3: Retrieve Top-K Chunks",
    description: "Embed query and search index for similar chunks.",
    starterCode: `def retrieve(self, query: str, k: int = 3) -> list:
    query_vec = self.embedder.embed(query)
    hits = self.index.search(query_vec, k)
    return [self.chunk_store[id] for id, _ in hits]`,
    testCode: `
retriever = Retriever(MockEmbedder(dim=8))
retriever.add_documents(["Python is great for data science."])
results = retriever.retrieve("python", k=1)
assert len(results) >= 1
print("✓ Step 3 passed!")
print("🎉 Challenge complete!")
`,
    hints: ["Embed query, search index, map IDs to chunks"],
    estimatedMinutes: 3,
    order: 3,
  },
];

// =====================================================
// ADDITIONAL CHALLENGES - RAG GENERATOR
// =====================================================

const GENERATOR_TASKS: MicroTask[] = [
  {
    id: "generator-1",
    title: "Step 1: Format Context Section",
    description: "Create numbered context from retrieved chunks.",
    starterCode: `def format_context(self, chunks: list) -> str:
    lines = []
    for i, c in enumerate(chunks, 1):
        lines.append(f"[{i}] {c.text}")
    return "\\n".join(lines)`,
    testCode: `
class FakeChunk:
    def __init__(self, text): self.text = text

pipeline = RAGPipeline(None)
result = pipeline.format_context([FakeChunk("Hello"), FakeChunk("World")])
assert "[1] Hello" in result and "[2] World" in result
print("✓ Step 1 passed!")
`,
    hints: ["Use enumerate with start=1", "Join with newlines"],
    estimatedMinutes: 2,
    order: 1,
  },
  {
    id: "generator-2",
    title: "Step 2: Build Full Prompt",
    description: "Combine context and question into a prompt.",
    starterCode: `def format_prompt(self, query: str, chunks: list) -> str:
    context = self.format_context(chunks)
    return f\"\"\"Context:
{context}

Question: {query}

Answer the question based ONLY on the context above.\"\"\"`,
    testCode: `
pipeline = RAGPipeline(None)
prompt = pipeline.format_prompt("What is X?", [FakeChunk("X is Y")])
assert "Context:" in prompt
assert "Question:" in prompt
assert "[1]" in prompt
print("✓ Step 2 passed!")
`,
    hints: ["Include Context: section and Question: section"],
    estimatedMinutes: 3,
    order: 2,
  },
  {
    id: "generator-3",
    title: "Step 3: Mock Generate Response",
    description: "Return a mock LLM response (in production, call OpenAI).",
    starterCode: `def generate(self, prompt: str) -> str:
    # Mock response - in production call OpenAI/Anthropic
    return "Based on the context, the answer is derived from the provided information."`,
    testCode: `
pipeline = RAGPipeline(None)
response = pipeline.generate("Any prompt")
assert len(response) > 0
print("✓ Step 3 passed!")
`,
    hints: ["Return a mock string", "Real implementation calls LLM API"],
    estimatedMinutes: 1,
    order: 3,
  },
  {
    id: "generator-4",
    title: "Step 4: Wire Full Pipeline",
    description: "Connect retrieve -> format_prompt -> generate.",
    starterCode: `def query(self, question: str, k: int = 3) -> dict:
    chunks = self.retriever.retrieve(question, k)
    prompt = self.format_prompt(question, chunks)
    answer = self.generate(prompt)
    
    return {
        "answer": answer,
        "sources": [c.id for c in chunks]
    }`,
    testCode: `
# Uses a complete pipeline
retriever = Retriever(MockEmbedder(dim=8))
retriever.add_documents(["Python is for data science."])
pipeline = RAGPipeline(retriever)
result = pipeline.query("What is Python?")
assert "answer" in result and "sources" in result
print("✓ Step 4 passed!")
print("🎉 Challenge complete!")
`,
    hints: ["Retrieve -> Format -> Generate -> Return dict"],
    estimatedMinutes: 3,
    order: 4,
  },
];

// =====================================================
// ADDITIONAL CHALLENGES - CASCADE RERANKER
// =====================================================

const CASCADE_RERANKER_TASKS: MicroTask[] = [
  {
    id: "cascade-1",
    title: "Step 1: Index Documents for Fast Retrieval",
    description: "Embed all documents and add to fast index.",
    starterCode: `def add_documents(self, documents: list):
    for i, doc in enumerate(documents):
        vec = self.embedder.embed(doc)
        self.index.add(f"doc_{i}", vec, doc)`,
    testCode: `
reranker = CascadeReranker(MockEmbedder(dim=8), MockCrossEncoder())
reranker.add_documents(["Doc 1", "Doc 2", "Doc 3"])
assert len(reranker.index.vectors) == 3
print("✓ Step 1 passed!")
`,
    hints: ["Embed each doc and add to index with ID"],
    estimatedMinutes: 2,
    order: 1,
  },
  {
    id: "cascade-2",
    title: "Step 2: First Stage - Fast Retrieval",
    description: "Use embedding similarity to get initial candidates.",
    starterCode: `def search(self, query: str, first_stage_k: int = 10, final_k: int = 3):
    # Stage 1: Fast embedding search
    query_vec = self.embedder.embed(query)
    candidates = self.index.search(query_vec, first_stage_k)
    # Continue...`,
    testCode: `
reranker = CascadeReranker(MockEmbedder(dim=8), MockCrossEncoder())
reranker.add_documents(["Python is great", "Java is okay"])
query_vec = reranker.embedder.embed("Python")
candidates = reranker.index.search(query_vec, 2)
assert len(candidates) == 2
print("✓ Step 2 passed!")
`,
    hints: ["Embed query, call index.search"],
    estimatedMinutes: 2,
    order: 2,
  },
  {
    id: "cascade-3",
    title: "Step 3: Second Stage - Cross-Encoder Rerank",
    description: "Score candidates with slow but accurate cross-encoder.",
    starterCode: `def search(self, query: str, first_stage_k: int = 10, final_k: int = 3):
    query_vec = self.embedder.embed(query)
    candidates = self.index.search(query_vec, first_stage_k)
    
    # Stage 2: Slow cross-encoder rerank
    reranked = []
    for doc_id, doc_text, embed_score in candidates:
        rerank_score = self.cross_encoder.score(query, doc_text)
        reranked.append((doc_text, rerank_score))
    
    # Sort by rerank score
    reranked.sort(key=lambda x: x[1], reverse=True)
    return reranked[:final_k]`,
    testCode: `
reranker = CascadeReranker(MockEmbedder(dim=8), MockCrossEncoder())
reranker.add_documents(["Python is excellent", "Java is popular", "Python ML is great"])
results = reranker.search("python machine learning", first_stage_k=3, final_k=2)
assert len(results) == 2
assert "python" in results[0][0].lower()
print("✓ Step 3 passed!")
print("🎉 Challenge complete!")
`,
    hints: ["Score each candidate with cross_encoder.score()", "Sort by NEW scores, not embedding scores"],
    estimatedMinutes: 4,
    order: 3,
  },
];

// =====================================================
// PRE-RETRIEVAL CHALLENGES
// =====================================================

const SIMPLE_CHUNKING_TASKS: MicroTask[] = [
  {
    id: "simple-chunk-1",
    title: "Step 1: Validate chunk_size",
    description: "Check that chunk_size > 0, else raise ValueError.",
    starterCode: `def chunk_text(text: str, chunk_size: int) -> List[str]:
    if chunk_size <= 0:
        raise ValueError("chunk_size must be > 0")
    pass`,
    testCode: `
try:
    chunk_text("hello", 0)
    print("❌ Should raise ValueError")
except ValueError:
    print("✓ Step 1 passed!")
`,
    hints: ["if chunk_size <= 0: raise ValueError"],
    estimatedMinutes: 1,
    order: 1,
  },
  {
    id: "simple-chunk-2",
    title: "Step 2: Handle Empty Text",
    description: "Return empty list for empty text.",
    starterCode: `def chunk_text(text: str, chunk_size: int) -> List[str]:
    if chunk_size <= 0:
        raise ValueError("chunk_size must be > 0")
    if not text:
        return []
    pass`,
    testCode: `
result = chunk_text("", 5)
assert result == []
print("✓ Step 2 passed!")
`,
    hints: ["if not text: return []"],
    estimatedMinutes: 1,
    order: 2,
  },
  {
    id: "simple-chunk-3",
    title: "Step 3: Split into Chunks",
    description: "Use a loop to slice text into fixed-size chunks.",
    starterCode: `def chunk_text(text: str, chunk_size: int) -> List[str]:
    if chunk_size <= 0:
        raise ValueError("chunk_size must be > 0")
    if not text:
        return []
    
    chunks = []
    for i in range(0, len(text), chunk_size):
        chunks.append(text[i:i + chunk_size])
    return chunks`,
    testCode: `
result = chunk_text("abcdefghij", 3)
assert result == ["abc", "def", "ghi", "j"]
print("✓ Step 3 passed!")
print("🎉 Challenge complete!")
`,
    hints: ["range(0, len(text), chunk_size)", "text[i:i+chunk_size]"],
    estimatedMinutes: 2,
    order: 3,
  },
];

const OVERLAP_CHUNKING_TASKS: MicroTask[] = [
  {
    id: "overlap-1",
    title: "Step 1: Validate Parameters",
    description: "Ensure chunk_size > 0 and 0 <= overlap < chunk_size.",
    starterCode: `def chunk_text_overlap(text: str, chunk_size: int, overlap: int) -> List[str]:
    if chunk_size <= 0:
        raise ValueError("chunk_size must be > 0")
    if overlap < 0 or overlap >= chunk_size:
        raise ValueError("overlap must be >= 0 and < chunk_size")
    pass`,
    testCode: `
try:
    chunk_text_overlap("test", 3, 3)
    print("❌ Should raise ValueError")
except ValueError:
    print("✓ Step 1 passed!")
`,
    hints: ["overlap >= chunk_size means no progress"],
    estimatedMinutes: 1,
    order: 1,
  },
  {
    id: "overlap-2",
    title: "Step 2: Calculate Step Size",
    description: "Step size = chunk_size - overlap.",
    starterCode: `def chunk_text_overlap(text: str, chunk_size: int, overlap: int) -> List[str]:
    if chunk_size <= 0:
        raise ValueError("chunk_size must be > 0")
    if overlap < 0 or overlap >= chunk_size:
        raise ValueError("overlap must be >= 0 and < chunk_size")
    if not text:
        return []
    
    step = chunk_size - overlap
    # Continue...
    pass`,
    testCode: `
step = 5 - 2  # chunk_size=5, overlap=2
assert step == 3
print("✓ Step 2 passed!")
`,
    hints: ["step = chunk_size - overlap"],
    estimatedMinutes: 1,
    order: 2,
  },
  {
    id: "overlap-3",
    title: "Step 3: Generate Overlapping Chunks",
    description: "Use step size to create overlapping chunks.",
    starterCode: `def chunk_text_overlap(text: str, chunk_size: int, overlap: int) -> List[str]:
    if chunk_size <= 0:
        raise ValueError("chunk_size must be > 0")
    if overlap < 0 or overlap >= chunk_size:
        raise ValueError("overlap must be >= 0 and < chunk_size")
    if not text:
        return []
    
    step = chunk_size - overlap
    chunks = []
    i = 0
    while i < len(text):
        chunks.append(text[i:i + chunk_size])
        i += step
    return chunks`,
    testCode: `
result = chunk_text_overlap("abcdef", 3, 1)
assert result == ["abc", "cde", "ef"]
print("✓ Step 3 passed!")
print("🎉 Challenge complete!")
`,
    hints: ["i += step (not i += chunk_size)", "while i < len(text)"],
    estimatedMinutes: 2,
    order: 3,
  },
];

// =====================================================
// RETRIEVAL CHALLENGES  
// =====================================================

const BASIC_RETRIEVAL_TASKS: MicroTask[] = [
  {
    id: "basic-ret-1",
    title: "Step 1: Validate k Parameter",
    description: "Ensure k > 0.",
    starterCode: `def top_k_cosine(vectors, query, k):
    if k <= 0:
        raise ValueError("k must be > 0")
    pass`,
    testCode: `
try:
    top_k_cosine([[1,0]], [1,0], 0)
    print("❌ Should raise ValueError")
except ValueError:
    print("✓ Step 1 passed!")
`,
    hints: ["if k <= 0: raise ValueError"],
    estimatedMinutes: 1,
    order: 1,
  },
  {
    id: "basic-ret-2",
    title: "Step 2: Compute All Scores",
    description: "Calculate cosine similarity for each vector.",
    starterCode: `def top_k_cosine(vectors, query, k):
    if k <= 0:
        raise ValueError("k must be > 0")
    
    scores = []
    for i, vec in enumerate(vectors):
        score = cosine_similarity(vec, query)
        scores.append((i, score))
    # Continue...
    pass`,
    testCode: `
vecs = [[1,0], [0,1]]
scores = [(i, cosine_similarity(v, [1,0])) for i, v in enumerate(vecs)]
assert scores[0][1] == 1.0
print("✓ Step 2 passed!")
`,
    hints: ["enumerate gives (index, vector)", "Store as (index, score) tuples"],
    estimatedMinutes: 2,
    order: 2,
  },
  {
    id: "basic-ret-3",
    title: "Step 3: Sort and Return Top K",
    description: "Sort by score descending and return top k.",
    starterCode: `def top_k_cosine(vectors, query, k):
    if k <= 0:
        raise ValueError("k must be > 0")
    
    scores = []
    for i, vec in enumerate(vectors):
        score = cosine_similarity(vec, query)
        scores.append((i, score))
    
    scores.sort(key=lambda x: x[1], reverse=True)
    return scores[:k]`,
    testCode: `
vecs = [[1,0], [0,1], [2,0]]
result = top_k_cosine(vecs, [1,0], 2)
assert result[0][1] == 1.0  # Perfect match
assert len(result) == 2
print("✓ Step 3 passed!")
print("🎉 Challenge complete!")
`,
    hints: ["sort(key=lambda x: x[1], reverse=True)", "[:k] to slice"],
    estimatedMinutes: 2,
    order: 3,
  },
];

// =====================================================
// QUERY TRANSFORMS CHALLENGES
// =====================================================

const QUERY_NORMALIZATION_TASKS: MicroTask[] = [
  {
    id: "query-norm-1",
    title: "Step 1: Tokenize Input",
    description: "Convert to lowercase and extract words.",
    starterCode: `def normalize_query(query: str) -> str:
    tokens = tokenize(query)  # Pre-provided: returns lowercase words
    # Continue...
    pass`,
    testCode: `
tokens = re.findall(r"[a-z0-9_]+", "Hello World".lower())
assert tokens == ["hello", "world"]
print("✓ Step 1 passed!")
`,
    hints: ["tokenize() already handles lowercase"],
    estimatedMinutes: 1,
    order: 1,
  },
  {
    id: "query-norm-2",
    title: "Step 2: Remove Stopwords",
    description: "Filter out common words like 'the', 'a', 'is'.",
    starterCode: `def normalize_query(query: str) -> str:
    tokens = tokenize(query)
    filtered = [t for t in tokens if t not in STOPWORDS]
    # Continue...
    pass`,
    testCode: `
stopwords = {"the", "a", "is"}
tokens = ["the", "cat", "is", "big"]
filtered = [t for t in tokens if t not in stopwords]
assert filtered == ["cat", "big"]
print("✓ Step 2 passed!")
`,
    hints: ["[t for t in tokens if t not in STOPWORDS]"],
    estimatedMinutes: 1,
    order: 2,
  },
  {
    id: "query-norm-3",
    title: "Step 3: Deduplicate Preserving Order",
    description: "Remove duplicates while keeping first occurrence.",
    starterCode: `def normalize_query(query: str) -> str:
    tokens = tokenize(query)
    filtered = [t for t in tokens if t not in STOPWORDS]
    
    seen = set()
    unique = []
    for t in filtered:
        if t not in seen:
            seen.add(t)
            unique.append(t)
    
    return " ".join(unique)`,
    testCode: `
result = normalize_query("API key key rotation rotation")
assert result == "api key rotation"
print("✓ Step 3 passed!")
print("🎉 Challenge complete!")
`,
    hints: ["Use set to track seen, list for order", "join with spaces"],
    estimatedMinutes: 2,
    order: 3,
  },
];

// =====================================================
// POST-RETRIEVAL CHALLENGES
// =====================================================

const MMR_DIVERSITY_TASKS: MicroTask[] = [
  {
    id: "mmr-1",
    title: "Step 1: Initialize Selection",
    description: "Start with empty selected list and remaining candidates.",
    starterCode: `def mmr_select(candidates, relevance, similarity, k, lambda_param=0.5):
    if not candidates or k <= 0:
        return []
    
    selected = []
    remaining = set(candidates)
    # Continue...
    pass`,
    testCode: `
remaining = set([1, 2, 3])
assert len(remaining) == 3
print("✓ Step 1 passed!")
`,
    hints: ["selected = []", "remaining = set(candidates)"],
    estimatedMinutes: 1,
    order: 1,
  },
  {
    id: "mmr-2",
    title: "Step 2: Calculate MMR Score",
    description: "MMR = λ * relevance - (1-λ) * max_similarity_to_selected.",
    starterCode: `def mmr_score(doc_id, selected, relevance, similarity, lambda_param):
    rel = relevance.get(doc_id, 0)
    
    if not selected:
        max_sim = 0
    else:
        max_sim = max(similarity.get((doc_id, s), 0) for s in selected)
    
    return lambda_param * rel - (1 - lambda_param) * max_sim`,
    testCode: `
relevance = {1: 0.9, 2: 0.8}
similarity = {(1, 2): 0.5}
score = 0.5 * 0.9 - 0.5 * 0  # No selected yet
assert score == 0.45
print("✓ Step 2 passed!")
`,
    hints: ["λ * relevance - (1-λ) * max_similarity", "max_sim=0 if nothing selected"],
    estimatedMinutes: 3,
    order: 2,
  },
  {
    id: "mmr-3",
    title: "Step 3: Iteratively Select Best",
    description: "Greedily select the doc with highest MMR score.",
    starterCode: `def mmr_select(candidates, relevance, similarity, k, lambda_param=0.5):
    if not candidates or k <= 0:
        return []
    
    selected = []
    remaining = set(candidates)
    
    while len(selected) < k and remaining:
        best_id = None
        best_score = float('-inf')
        
        for doc_id in remaining:
            score = mmr_score(doc_id, selected, relevance, similarity, lambda_param)
            if score > best_score:
                best_score = score
                best_id = doc_id
        
        selected.append(best_id)
        remaining.remove(best_id)
    
    return selected`,
    testCode: `
candidates = [1, 2, 3]
relevance = {1: 0.9, 2: 0.85, 3: 0.8}
similarity = {(1, 2): 0.95, (2, 1): 0.95}  # 1 and 2 are very similar
result = mmr_select(candidates, relevance, similarity, k=2, lambda_param=0.5)
assert result[0] == 1  # Most relevant first
assert result[1] != 2  # Should pick 3 (more diverse) over 2
print("✓ Step 3 passed!")
print("🎉 Challenge complete!")
`,
    hints: ["Greedy selection: pick highest MMR each round", "Remove selected from remaining"],
    estimatedMinutes: 4,
    order: 3,
  },
];

// =====================================================
// GROUNDING & SAFETY CHALLENGES
// =====================================================

const PROMPT_TEMPLATE_TASKS: MicroTask[] = [
  {
    id: "prompt-1",
    title: "Step 1: Number the Contexts",
    description: "Format contexts with [1], [2], etc. labels.",
    starterCode: `def format_contexts(contexts: list) -> str:
    lines = []
    for i, ctx in enumerate(contexts, 1):
        lines.append(f"[{i}] {ctx}")
    return "\\n".join(lines)`,
    testCode: `
result = format_contexts(["Doc A", "Doc B"])
assert "[1] Doc A" in result
assert "[2] Doc B" in result
print("✓ Step 1 passed!")
`,
    hints: ["enumerate(contexts, 1) for 1-indexed", "Join with newlines"],
    estimatedMinutes: 2,
    order: 1,
  },
  {
    id: "prompt-2",
    title: "Step 2: Build the Full Prompt",
    description: "Include Question, Context, and Citation Instructions.",
    starterCode: `def build_rag_prompt(question: str, contexts: list) -> str:
    ctx_text = format_contexts(contexts)
    
    return f\"\"\"You are a helpful assistant. Answer ONLY using the provided context.
Cite sources like [1], [2] in your answer.

Context:
{ctx_text}

Question: {question}

Answer:\"\"\"`,
    testCode: `
prompt = build_rag_prompt("What is RAG?", ["RAG = retrieve.", "Use citations."])
assert "What is RAG?" in prompt
assert "[1]" in prompt
assert "cite" in prompt.lower()
print("✓ Step 2 passed!")
print("🎉 Challenge complete!")
`,
    hints: ["Include explicit citation instruction", "Number contexts for reference"],
    estimatedMinutes: 3,
    order: 2,
  },
];

const METADATA_FILTERING_TASKS: MicroTask[] = [
  {
    id: "metafilter-1",
    title: "Step 1: Filter by Tenant ID",
    description: "Only allow docs matching the tenant_id filter.",
    starterCode: `def filter_by_tenant(docs, tenant_id):
    return [
        (i, d) for i, d in enumerate(docs)
        if d.get("meta", {}).get("tenant_id") == tenant_id
    ]`,
    testCode: `
docs = [
    {"text": "Doc A", "meta": {"tenant_id": "t1"}},
    {"text": "Doc B", "meta": {"tenant_id": "t2"}},
]
result = filter_by_tenant(docs, "t1")
assert len(result) == 1
assert result[0][1]["text"] == "Doc A"
print("✓ Step 1 passed!")
`,
    hints: ["Filter BEFORE scoring", "Check meta.tenant_id"],
    estimatedMinutes: 2,
    order: 1,
  },
  {
    id: "metafilter-2",
    title: "Step 2: Apply All Filters",
    description: "Check all filter conditions on each document.",
    starterCode: `def apply_filters(docs, filters):
    eligible = []
    for i, d in enumerate(docs):
        meta = d.get("meta", {})
        match = True
        for key, val in filters.items():
            if meta.get(key) != val:
                match = False
                break
        if match:
            eligible.append((i, d))
    return eligible`,
    testCode: `
docs = [
    {"text": "Doc A", "meta": {"tenant_id": "t1", "type": "policy"}},
    {"text": "Doc B", "meta": {"tenant_id": "t1", "type": "howto"}},
]
result = apply_filters(docs, {"tenant_id": "t1", "type": "policy"})
assert len(result) == 1
print("✓ Step 2 passed!")
`,
    hints: ["All filter conditions must match", "Missing meta field = no match"],
    estimatedMinutes: 3,
    order: 2,
  },
  {
    id: "metafilter-3",
    title: "Step 3: Score and Rank Filtered Docs",
    description: "Only score eligible docs, return top-k.",
    starterCode: `def search_filtered(docs, query, filters, k=3):
    eligible = apply_filters(docs, filters)
    
    scored = []
    for idx, d in eligible:
        score = score_overlap(query, d["text"])
        scored.append((idx, score))
    
    scored.sort(key=lambda x: x[1], reverse=True)
    return scored[:k]`,
    testCode: `
docs = [
    {"text": "API key rotation", "meta": {"tenant_id": "t1"}},
    {"text": "API key rotation", "meta": {"tenant_id": "t2"}},
]
result = search_filtered(docs, "API key", {"tenant_id": "t1"}, k=5)
assert all(i == 0 for i, _ in result)
print("✓ Step 3 passed!")
print("🎉 Challenge complete!")
`,
    hints: ["Never score cross-tenant docs", "Sort by score descending"],
    estimatedMinutes: 3,
    order: 3,
  },
];

// =====================================================
// AGENTIC CHALLENGES
// =====================================================

const TOOL_USE_TASKS: MicroTask[] = [
  {
    id: "tool-1",
    title: "Step 1: Detect Math Queries",
    description: "Check for math keywords to route to calculator.",
    starterCode: `def is_math_query(query: str) -> bool:
    math_keywords = ["calculate", "sum", "add", "multiply", "divide", "sqrt", "square root", "+", "*", "/", "-"]
    q = query.lower()
    return any(kw in q for kw in math_keywords)`,
    testCode: `
assert is_math_query("Calculate 25 * 47") == True
assert is_math_query("What is the square root of 144?") == True
assert is_math_query("Hello there!") == False
print("✓ Step 1 passed!")
`,
    hints: ["Check for operators: +, *, /, -", "Check for keywords: calculate, sqrt"],
    estimatedMinutes: 2,
    order: 1,
  },
  {
    id: "tool-2",
    title: "Step 2: Detect Search Queries",
    description: "Route factual questions to search.",
    starterCode: `def is_search_query(query: str) -> bool:
    q = query.lower()
    question_words = ["who", "what", "when", "where", "why"]
    factual_keywords = ["capital", "president", "election", "news", "latest"]
    has_question = any(q.startswith(w) or w + " " in q for w in question_words)
    has_factual = any(kw in q for kw in factual_keywords)
    return has_question or has_factual`,
    testCode: `
assert is_search_query("What is the capital of France?") == True
assert is_search_query("Who won the 2024 election?") == True
assert is_search_query("Hello there!") == False
print("✓ Step 2 passed!")
`,
    hints: ["Check for question words", "Check for entity queries"],
    estimatedMinutes: 2,
    order: 2,
  },
  {
    id: "tool-3",
    title: "Step 3: Implement Router",
    description: "Return the appropriate tool choice.",
    starterCode: `def decide_tool(query: str) -> str:
    if is_math_query(query):
        return "calculator"
    if is_search_query(query):
        return "search"
    return "none"`,
    testCode: `
assert decide_tool("Calculate 25 * 47") == "calculator"
assert decide_tool("What is the capital of France?") == "search"
assert decide_tool("Hello there!") == "none"
print("✓ Step 3 passed!")
print("🎉 Challenge complete!")
`,
    hints: ["Check calculator first (more specific)", "Default to 'none'"],
    estimatedMinutes: 2,
    order: 3,
  },
];

const REACT_TASKS: MicroTask[] = [
  {
    id: "react-1",
    title: "Step 1: Extract Thought",
    description: "Parse the 'Thought:' line from LLM output.",
    starterCode: `import re

def extract_thought(text: str) -> str | None:
    match = re.search(r"Thought:\\s*(.+?)(?=\\n|Action:|$)", text, re.DOTALL)
    return match.group(1).strip() if match else None`,
    testCode: `
text = "Thought: I need to look up the stock price."
result = extract_thought(text)
assert "stock price" in result
print("✓ Step 1 passed!")
`,
    hints: ["Use regex: r'Thought:\\s*(.+)'", "Handle multiline"],
    estimatedMinutes: 2,
    order: 1,
  },
  {
    id: "react-2",
    title: "Step 2: Extract Action",
    description: "Parse the 'Action:' and 'Action Input:' lines.",
    starterCode: `def extract_action(text: str) -> tuple:
    action_match = re.search(r"Action:\\s*(.+)", text)
    input_match = re.search(r"Action Input:\\s*(.+)", text)
    
    action = action_match.group(1).strip() if action_match else None
    action_input = input_match.group(1).strip() if input_match else None
    
    return action, action_input`,
    testCode: `
text = "Action: stock_search\\nAction Input: AAPL"
action, input = extract_action(text)
assert action == "stock_search"
assert input == "AAPL"
print("✓ Step 2 passed!")
`,
    hints: ["Action and Action Input may not exist", "Strip whitespace"],
    estimatedMinutes: 2,
    order: 2,
  },
  {
    id: "react-3",
    title: "Step 3: Combine into Parser",
    description: "Return (thought, action, action_input) tuple.",
    starterCode: `def parse_react_output(llm_output: str):
    thought = extract_thought(llm_output)
    action, action_input = extract_action(llm_output)
    return (thought, action, action_input)`,
    testCode: `
sample = \"\"\"
Thought: The user asks about apple stock.
Action: stock_search
Action Input: AAPL
\"\"\"
t, a, i = parse_react_output(sample)
assert "apple stock" in t
assert a == "stock_search"
assert i == "AAPL"
print("✓ Step 3 passed!")
print("🎉 Challenge complete!")
`,
    hints: ["Return tuple of 3 values", "None for missing parts"],
    estimatedMinutes: 2,
    order: 3,
  },
];

// =====================================================
// ADVANCED RETRIEVAL CHALLENGES
// =====================================================

const PARENT_DOC_TASKS: MicroTask[] = [
  {
    id: "parent-1",
    title: "Step 1: Calculate Window Bounds",
    description: "Compute start and end indices with boundary checks.",
    starterCode: `def get_window_bounds(hit_idx, total_chunks, window=1):
    start = max(0, hit_idx - window)
    end = min(total_chunks, hit_idx + window + 1)
    return start, end`,
    testCode: `
start, end = get_window_bounds(2, 5, window=1)
assert start == 1 and end == 4
start2, end2 = get_window_bounds(0, 5, window=1)
assert start2 == 0
print("✓ Step 1 passed!")
`,
    hints: ["max(0, hit - window) for start", "min(len, hit + window + 1) for end"],
    estimatedMinutes: 2,
    order: 1,
  },
  {
    id: "parent-2",
    title: "Step 2: Merge Chunk Window",
    description: "Join neighboring chunks into parent context.",
    starterCode: `def get_parent_context(hit_chunk_index, all_chunks, window_expansion=1):
    start, end = get_window_bounds(hit_chunk_index, len(all_chunks), window_expansion)
    return " ".join(all_chunks[start:end])`,
    testCode: `
chunks = ["Intro.", "Part A.", "Part B.", "Part C.", "Conclusion."]
result = get_parent_context(2, chunks, 1)
assert result == "Part A. Part B. Part C."
print("✓ Step 2 passed!")
print("🎉 Challenge complete!")
`,
    hints: ["Slice with chunks[start:end]", "Join with space"],
    estimatedMinutes: 2,
    order: 2,
  },
];

const EXACT_DEDUP_TASKS: MicroTask[] = [
  {
    id: "dedup-1",
    title: "Step 1: Hash Each Chunk",
    description: "Compute SHA1 hash for each chunk.",
    starterCode: `import hashlib

def content_sha1(text: str) -> str:
    return hashlib.sha1(text.encode("utf-8")).hexdigest()`,
    testCode: `
hash1 = content_sha1("Hello")
hash2 = content_sha1("Hello")
hash3 = content_sha1("World")
assert hash1 == hash2
assert hash1 != hash3
print("✓ Step 1 passed!")
`,
    hints: ["hashlib.sha1(text.encode()).hexdigest()", "Same text = same hash"],
    estimatedMinutes: 1,
    order: 1,
  },
  {
    id: "dedup-2",
    title: "Step 2: Keep First Occurrence Only",
    description: "Track seen hashes and filter duplicates.",
    starterCode: `def dedup_keep_first(chunks):
    seen = set()
    unique = []
    first_index = {}
    
    for i, chunk in enumerate(chunks):
        h = content_sha1(chunk)
        if h not in seen:
            seen.add(h)
            unique.append(chunk)
            first_index[h] = i
    
    return unique, first_index`,
    testCode: `
chunks = ["A", "B", "A", "C", "B"]
unique, idx = dedup_keep_first(chunks)
assert unique == ["A", "B", "C"]
print("✓ Step 2 passed!")
print("🎉 Challenge complete!")
`,
    hints: ["Track original index for first occurrence", "Use set for seen hashes"],
    estimatedMinutes: 3,
    order: 2,
  },
];

// =====================================================
// LIVE PROJECT CHALLENGES
// =====================================================

const NEWS_AGENT_TASKS: MicroTask[] = [
  {
    id: "news-1",
    title: "Step 1: Extract Search Keywords",
    description: "Normalize query for the search tool.",
    starterCode: `def extract_keywords(query: str) -> str:
    import re
    return " ".join(re.findall(r"[a-z0-9]+", query.lower()))`,
    testCode: `
result = extract_keywords("What is the weather in SF?")
assert "weather" in result and "sf" in result
print("✓ Step 1 passed!")
`,
    hints: ["Lowercase and extract alphanumeric", "Remove question words if needed"],
    estimatedMinutes: 2,
    order: 1,
  },
  {
    id: "news-2",
    title: "Step 2: Call Search Tool",
    description: "Use extracted keywords to search.",
    starterCode: `def news_agent_solve(user_query: str) -> str:
    keywords = extract_keywords(user_query)
    search_result = search_tool(keywords)
    
    if "No relevant" in search_result:
        return "I couldn't find relevant information."
    
    return f"Based on my search: {search_result}"`,
    testCode: `
ans = news_agent_solve("What is the weather in San Francisco?")
assert "65F" in ans or "sunny" in ans
print("✓ Step 2 passed!")
print("🎉 Challenge complete!")
`,
    hints: ["Extract keywords first", "Format answer with search result"],
    estimatedMinutes: 3,
    order: 2,
  },
];

const CRYPTO_ANALYST_TASKS: MicroTask[] = [
  {
    id: "crypto-1",
    title: "Step 1: Fetch Price Data",
    description: "Get current price for ticker.",
    starterCode: `def get_price_info(ticker: str) -> str:
    price = get_price(ticker)
    return f"{ticker.upper()} is currently trading at \${price}"`,
    testCode: `
result = get_price_info("BTC")
assert "50000" in result
print("✓ Step 1 passed!")
`,
    hints: ["Call get_price(ticker)", "Format as readable string"],
    estimatedMinutes: 1,
    order: 1,
  },
  {
    id: "crypto-2",
    title: "Step 2: Retrieve Analyst Notes",
    description: "Get relevant notes from vector DB.",
    starterCode: `def get_notes_summary(ticker: str) -> str:
    notes = retrieve_notes(ticker)
    if not notes:
        return "No analyst notes available."
    return " ".join(notes)`,
    testCode: `
result = get_notes_summary("BTC")
assert "resistance" in result.lower() or "52k" in result
print("✓ Step 2 passed!")
`,
    hints: ["Call retrieve_notes(ticker)", "Join multiple notes"],
    estimatedMinutes: 2,
    order: 2,
  },
  {
    id: "crypto-3",
    title: "Step 3: Synthesize Analysis",
    description: "Combine price and notes into analysis.",
    starterCode: `def crypto_analysis(ticker: str) -> str:
    price_info = get_price_info(ticker)
    notes = get_notes_summary(ticker)
    
    return f"{price_info}. Analysis: {notes}"`,
    testCode: `
ans = crypto_analysis("ETH")
assert "3000" in ans
assert "bullish" in ans.lower()
print("✓ Step 3 passed!")
print("🎉 Challenge complete!")
`,
    hints: ["Combine structured + unstructured data", "Return coherent synthesis"],
    estimatedMinutes: 2,
    order: 3,
  },
];

// =====================================================
// MASTER MAPPING
// =====================================================

export const MICRO_TASKS: Record<string, MicroTaskChallenge> = {
  // Foundations
  "dot-product": {
    challengeSlug: "dot-product",
    totalTasks: DOT_PRODUCT_TASKS.length,
    tasks: DOT_PRODUCT_TASKS,
  },
  "cosine-similarity": {
    challengeSlug: "cosine-similarity",
    totalTasks: COSINE_SIMILARITY_TASKS.length,
    tasks: COSINE_SIMILARITY_TASKS,
  },
  "euclidean-distance": {
    challengeSlug: "euclidean-distance",
    totalTasks: EUCLIDEAN_DISTANCE_TASKS.length,
    tasks: EUCLIDEAN_DISTANCE_TASKS,
  },

  // Vector DB Saga
  "dense-vector-class": {
    challengeSlug: "dense-vector-class",
    totalTasks: DENSE_VECTOR_TASKS.length,
    tasks: DENSE_VECTOR_TASKS,
  },
  "naive-flat-index": {
    challengeSlug: "naive-flat-index",
    totalTasks: FLAT_INDEX_TASKS.length,
    tasks: FLAT_INDEX_TASKS,
  },
  "ivf-flat-index": {
    challengeSlug: "ivf-flat-index",
    totalTasks: IVF_INDEX_TASKS.length,
    tasks: IVF_INDEX_TASKS,
  },

  // RAG Pipeline Saga
  "rag-pipeline-chunker": {
    challengeSlug: "rag-pipeline-chunker",
    totalTasks: CHUNKER_TASKS.length,
    tasks: CHUNKER_TASKS,
  },
  "rag-pipeline-embedder": {
    challengeSlug: "rag-pipeline-embedder",
    totalTasks: EMBEDDER_TASKS.length,
    tasks: EMBEDDER_TASKS,
  },

  // Reranker Saga
  "reranker-score-function": {
    challengeSlug: "reranker-score-function",
    totalTasks: RERANKER_SCORE_TASKS.length,
    tasks: RERANKER_SCORE_TASKS,
  },

  // Evaluator Saga
  "evaluator-recall-at-k": {
    challengeSlug: "evaluator-recall-at-k",
    totalTasks: RECALL_AT_K_TASKS.length,
    tasks: RECALL_AT_K_TASKS,
  },
  "evaluator-mrr": {
    challengeSlug: "evaluator-mrr",
    totalTasks: MRR_TASKS.length,
    tasks: MRR_TASKS,
  },
  "evaluator-ndcg": {
    challengeSlug: "evaluator-ndcg",
    totalTasks: NDCG_TASKS.length,
    tasks: NDCG_TASKS,
  },

  // Foundations - Tokenizer
  "tokenizer-basics": {
    challengeSlug: "tokenizer-basics",
    totalTasks: TOKENIZER_TASKS.length,
    tasks: TOKENIZER_TASKS,
  },

  // RAG Pipeline - Retriever & Generator
  "rag-pipeline-retriever": {
    challengeSlug: "rag-pipeline-retriever",
    totalTasks: RETRIEVER_TASKS.length,
    tasks: RETRIEVER_TASKS,
  },
  "rag-pipeline-generator": {
    challengeSlug: "rag-pipeline-generator",
    totalTasks: GENERATOR_TASKS.length,
    tasks: GENERATOR_TASKS,
  },

  // Reranker - Cascade
  "reranker-cascade": {
    challengeSlug: "reranker-cascade",
    totalTasks: CASCADE_RERANKER_TASKS.length,
    tasks: CASCADE_RERANKER_TASKS,
  },

  // Pre-Retrieval
  "simple-chunking": {
    challengeSlug: "simple-chunking",
    totalTasks: SIMPLE_CHUNKING_TASKS.length,
    tasks: SIMPLE_CHUNKING_TASKS,
  },
  "overlap-chunking": {
    challengeSlug: "overlap-chunking",
    totalTasks: OVERLAP_CHUNKING_TASKS.length,
    tasks: OVERLAP_CHUNKING_TASKS,
  },

  // Retrieval
  "basic-retrieval": {
    challengeSlug: "basic-retrieval",
    totalTasks: BASIC_RETRIEVAL_TASKS.length,
    tasks: BASIC_RETRIEVAL_TASKS,
  },

  // Query Transforms
  "query-normalization": {
    challengeSlug: "query-normalization",
    totalTasks: QUERY_NORMALIZATION_TASKS.length,
    tasks: QUERY_NORMALIZATION_TASKS,
  },

  // Post-Retrieval
  "mmr-diversity": {
    challengeSlug: "mmr-diversity",
    totalTasks: MMR_DIVERSITY_TASKS.length,
    tasks: MMR_DIVERSITY_TASKS,
  },

  // Grounding & Safety
  "prompt-template": {
    challengeSlug: "prompt-template",
    totalTasks: PROMPT_TEMPLATE_TASKS.length,
    tasks: PROMPT_TEMPLATE_TASKS,
  },
  "metadata-filtering": {
    challengeSlug: "metadata-filtering",
    totalTasks: METADATA_FILTERING_TASKS.length,
    tasks: METADATA_FILTERING_TASKS,
  },

  // Agentic
  "tool-use-basics": {
    challengeSlug: "tool-use-basics",
    totalTasks: TOOL_USE_TASKS.length,
    tasks: TOOL_USE_TASKS,
  },
  "react-implementation": {
    challengeSlug: "react-implementation",
    totalTasks: REACT_TASKS.length,
    tasks: REACT_TASKS,
  },

  // Advanced Retrieval
  "parent-document-tokenizer": {
    challengeSlug: "parent-document-tokenizer",
    totalTasks: PARENT_DOC_TASKS.length,
    tasks: PARENT_DOC_TASKS,
  },
  "exact-dedup": {
    challengeSlug: "exact-dedup",
    totalTasks: EXACT_DEDUP_TASKS.length,
    tasks: EXACT_DEDUP_TASKS,
  },

  // Live Projects
  "news-search-tool": {
    challengeSlug: "news-search-tool",
    totalTasks: NEWS_AGENT_TASKS.length,
    tasks: NEWS_AGENT_TASKS,
  },
  "financial-analyst-agent": {
    challengeSlug: "financial-analyst-agent",
    totalTasks: CRYPTO_ANALYST_TASKS.length,
    tasks: CRYPTO_ANALYST_TASKS,
  },
};

// Helper functions
export function getMicroTasks(challengeSlug: string): MicroTask[] | null {
  const challenge = MICRO_TASKS[challengeSlug];
  return challenge?.tasks || null;
}

export function getMicroTaskProgress(
  challengeSlug: string
): { completed: number; total: number } {
  const tasks = getMicroTasks(challengeSlug);
  if (!tasks) return { completed: 0, total: 0 };

  if (typeof window === "undefined") return { completed: 0, total: tasks.length };

  const stored = localStorage.getItem(`microtasks_${challengeSlug}`);
  const completed = stored ? JSON.parse(stored).filter(Boolean).length : 0;

  return { completed, total: tasks.length };
}

export function markMicroTaskComplete(
  challengeSlug: string,
  taskIndex: number
): void {
  if (typeof window === "undefined") return;

  const key = `microtasks_${challengeSlug}`;
  const stored = localStorage.getItem(key);
  const progress = stored ? JSON.parse(stored) : [];

  progress[taskIndex] = true;
  localStorage.setItem(key, JSON.stringify(progress));
}

export function getAllMicroTaskChallenges(): string[] {
  return Object.keys(MICRO_TASKS);
}
