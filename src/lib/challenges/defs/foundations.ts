import type { RawChallenge } from "@/lib/challenges/types";

export const FOUNDATIONS_CHALLENGES: RawChallenge[] = [
  {
    slug: "dot-product",
    title: "Dot Product",
    description:
      "Goal: Implement dot product — the primitive behind cosine similarity and vector search. Why: It's the fundamental operation for measuring semantic similarity between embeddings. Production impact: Vector databases compute millions of dot products per second; understanding this operation is essential for optimizing retrieval performance.",
    group: "Phase 0 — Vector Math & Foundations",
    difficulty: "easy",
    xpReward: 25,
    starterCode: `from typing import List

def dot(a: List[float], b: List[float]) -> float:
    \"\"\"
    Return the dot product of two equal-length vectors.

    Rules:
    - If lengths differ, raise ValueError.
    - Empty vectors are allowed (dot([], []) == 0.0).
    \"\"\"
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `def _almost_equal(x, y, eps=1e-9):
    return abs(x - y) <= eps

# Helper to provide descriptive errors
def assert_eq(actual, expected, msg):
    assert actual == expected, f"{msg}: Expected {expected}, but got {actual}"

def assert_near(actual, expected, msg):
    assert _almost_equal(actual, expected), f"{msg}: Expected {expected}, but got {actual}"

assert_eq(dot([], []), 0.0, "Dot product of empty lists should be 0.0")

result = dot([1, 2, 3], [4, 5, 6])
assert_eq(result, 32, "Simple dot product ([1,2,3] · [4,5,6]) failed")

result = dot([-1, 2], [3, -4])
assert_eq(result, -11, "Dot product with negative numbers ([-1,2] · [3,-4]) failed")

result = dot([0.1, 0.2], [0.3, 0.4])
assert_near(result, 0.11, "Dot product with floats ([0.1,0.2] · [0.3,0.4]) failed")

try:
    dot([1, 2], [1])
    raise AssertionError("Validation failed: Did not raise ValueError for length mismatch")
except ValueError:
    pass

print("All tests passed!")`,
    hints: [
      "Start by validating the lengths match. If `len(a) != len(b)`, raise `ValueError`.",
      "Iterate through both lists simultaneously using `zip(a, b)`.",
      "Accumulate the product of corresponding elements: `sum += a[i] * b[i]`.",
      "Review the definition: geometric dot product is magnitude * magnitude * cos(theta).",
    ],
    solution: `from typing import List

def dot(a: List[float], b: List[float]) -> float:
    if len(a) != len(b):
        raise ValueError("Vectors must have the same length")
    
    return sum(x * y for x, y in zip(a, b))
`,
    complexity: {
      time: "O(n)",
      space: "O(1)",
    },
    realWorld: {
      description: "The dot product is the core operation behind every embedding similarity computation. When you call OpenAI's embedding API and compare two vectors, you're computing a dot product.",
      companies: ["OpenAI", "Google", "Meta AI", "Hugging Face"],
      useCases: ["Embedding similarity", "Neural network forward pass", "Attention mechanism"],
    },
    relatedChallenges: ["cosine-similarity", "euclidean-distance", "dense-vector-class"],
    relatedPlaybooks: ["rag-formulas-cheatsheet", "quick-reference-cards"],
    timeEstimate: { minutes: 10, label: "10-15 min" },
  },
  {
    slug: "cosine-similarity",
    title: "Cosine Similarity",
    description:
      "Goal: Implement cosine similarity — the industry-standard metric for comparing embeddings. Why: Unlike dot product, it normalizes for vector magnitude, so document length doesn't artificially inflate similarity scores. Production impact: Every semantic search engine (Pinecone, Weaviate, Qdrant) defaults to cosine similarity for text embeddings.",
    group: "Phase 0 — Vector Math & Foundations",
    difficulty: "easy",
    xpReward: 25,
    starterCode: `from typing import List
import math

def cosine_similarity(a: List[float], b: List[float]) -> float:
    \"\"\"
    Return cosine similarity between two equal-length vectors.

    Rules:
    - If lengths differ, raise ValueError.
    - If either vector has zero magnitude, raise ValueError.
    - Empty vectors raise ValueError (no direction to compare).
    \"\"\"
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `def _almost_equal(x, y, eps=1e-9):
    return abs(x - y) <= eps

assert _almost_equal(cosine_similarity([1, 0], [2, 0]), 1.0) # Direction matters, magnitude doesn't
assert _almost_equal(cosine_similarity([1, 0], [0, 1]), 0.0) # Orthogonal
assert _almost_equal(cosine_similarity([1, 2, 3], [1, 2, 3]), 1.0)
assert _almost_equal(cosine_similarity([1, 1], [-1, -1]), -1.0) # Opposite direction

try:
    cosine_similarity([1, 2], [1])
    raise AssertionError("Expected ValueError for length mismatch")
except ValueError:
    pass

try:
    cosine_similarity([0, 0], [1, 2])
    raise AssertionError("Expected ValueError for zero magnitude")
except ValueError:
    pass

try:
    cosine_similarity([], [1])
    raise AssertionError("Expected ValueError for mismatch empty vs non-empty")
except ValueError:
    pass

print("All tests passed!")`,
    hints: [
      "Formula: `dot(a, b) / (magnitude(a) * magnitude(b))`.",
      "Magnitude (L2 norm) is `sqrt(sum(x^2))`.",
      "Ensure you handle the 'division by zero' case by raising a `ValueError` if magnitude is 0.",
    ],
    solution: `from typing import List
import math

def cosine_similarity(a: List[float], b: List[float]) -> float:
    if len(a) != len(b):
        raise ValueError("Vectors must have the same length")
    
    if len(a) == 0 and len(b) == 0:
        raise ValueError("Cannot compute cosine similarity of empty vectors")
    
    dot_product = sum(x * y for x, y in zip(a, b))
    mag_a = math.sqrt(sum(x * x for x in a))
    mag_b = math.sqrt(sum(x * x for x in b))
    
    if mag_a == 0 or mag_b == 0:
        raise ValueError("Cannot compute cosine similarity with zero magnitude vector")
    
    return dot_product / (mag_a * mag_b)
`,
    complexity: {
      time: "O(n)",
      space: "O(1)",
    },
    prerequisites: ["dot-product"],
    relatedChallenges: ["euclidean-distance", "dense-vector-class"],
    relatedPlaybooks: ["rag-formulas-cheatsheet", "tool-comparison-matrix"],
    realWorld: {
      description: "Cosine similarity is the industry standard for semantic search because it measures the 'angle' between concepts, ignoring the length of the document.",
      companies: ["Netflix", "Spotify", "OpenAI"],
      useCases: ["Semantic Search", "Recommender Systems"],
    },
    timeEstimate: { minutes: 15, label: "15-20 min" },
  },
  {
    slug: "euclidean-distance",
    title: "Euclidean Distance",
    description:
      "Goal: Implement Euclidean distance — the L2 norm between points in vector space. Why: While cosine measures direction, Euclidean measures absolute spatial distance between concepts. Production impact: Essential for clustering algorithms (K-Means), geospatial search, and applications where vector magnitude represents importance.",
    group: "Phase 0 — Vector Math & Foundations",
    difficulty: "easy",
    xpReward: 25,
    prerequisites: ["dot-product"],
    starterCode: `from typing import List
import math

def euclidean_distance(a: List[float], b: List[float]) -> float:
    \"\"\"
    Return Euclidean distance between two equal-length vectors.

    Rules:
    - If lengths differ, raise ValueError.
    - Empty vectors are allowed (distance([], []) == 0.0).
    \"\"\"
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `def _almost_equal(x, y, eps=1e-9):
    return abs(x - y) <= eps

assert euclidean_distance([], []) == 0.0
assert euclidean_distance([1, 2, 3], [1, 2, 3]) == 0.0
assert _almost_equal(euclidean_distance([0, 0], [3, 4]), 5.0) # 3-4-5 triangle
assert _almost_equal(euclidean_distance([1, 1], [4, 5]), 5.0)

try:
    euclidean_distance([1, 2], [1])
    raise AssertionError("Expected ValueError for length mismatch")
except ValueError:
    pass

print("All tests passed!")`,
    hints: [
      "Formula: `sqrt(sum((a[i] - b[i])^2))`.",
      "Think of it as the length of the line segment connecting the two points.",
      "Use `math.sqrt` or `** 0.5`.",
    ],
    solution: `from typing import List
import math

def euclidean_distance(a: List[float], b: List[float]) -> float:
    if len(a) != len(b):
        raise ValueError("Vectors must have the same length")
    
    if len(a) == 0:
        return 0.0
    
    squared_diff_sum = sum((x - y) ** 2 for x, y in zip(a, b))
    return math.sqrt(squared_diff_sum)
`,
    complexity: {
      time: "O(n)",
      space: "O(1)",
    },
    realWorld: {
      description: "While Cosine is for semantic meaning, Euclidean is for 'physical' distance. It's crucial for geospatial data (finding nearest Uber) or when vector magnitude represents importance.",
      companies: ["Uber", "Google Maps"],
      useCases: ["Geospatial Indexing", "Clustering (K-Means)"],
    },
    relatedPlaybooks: ["rag-formulas-cheatsheet", "quick-reference-cards"],
  },
  {
    slug: "tokenizer-basics",
    title: "Tokenizer Basics",
    description:
      "Goal: Build a basic word tokenizer to understand how LLMs process text. Why: LLMs don't see sentences — they see token sequences. Context windows, API costs, and prompt engineering all depend on tokenization. Production impact: Knowing token counts prevents 'Context Window Exceeded' errors and helps estimate API costs (\$0.01 per 1K tokens adds up fast).",
    group: "Phase 0 — Vector Math & Foundations",
    difficulty: "easy",
    xpReward: 25,
    starterCode: `import re
from typing import List

def tokenize(text: str) -> List[str]:
    \"\"\"
    Split text into tokens.

    Requirements:
    - Lowercase everything
    - Keep words and numbers (a-z, 0-9)
    - Treat punctuation as separators
    - Collapse whitespace
    \"\"\"
    # TODO: implement
    raise NotImplementedError

def count_tokens(text: str) -> int:
    \"\"\"
    Return number of tokens in text (using tokenize()).
    \"\"\"
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `assert tokenize("") == []
assert tokenize("Hello, world!") == ["hello", "world"]
assert tokenize("RAG 101: vectors + tokens") == ["rag", "101", "vectors", "tokens"]
assert tokenize("  multiple   spaces\\nlines\\t") == ["multiple", "spaces", "lines"]
# Test mixed punctuation
assert tokenize("email@example.com") == ["email", "example", "com"] 
assert count_tokens("Hello, world!") == 2
assert count_tokens("A B C") == 3

print("All tests passed!")`,
    hints: [
      "Use `text.lower()` to normalize case first.",
      "Regex `[a-z0-9]+` matches alphanumeric sequences, effectively splitting by everything else.",
      "Use `re.findall(pattern, text)` to get the list of tokens directly.",
    ],
    solution: `import re
from typing import List

def tokenize(text: str) -> List[str]:
    # Lowercase and find all alphanumeric sequences
    return re.findall(r'[a-z0-9]+', text.lower())

def count_tokens(text: str) -> int:
    return len(tokenize(text))
`,
    complexity: {
      time: "O(n)",
      space: "O(n)",
    },
    realWorld: {
      description: "LLMs don't see words; they see tokens. Misunderstanding tokenization leads to 'Context Window Exceeded' errors and unexpected API bills.",
      companies: ["Anthropic", "OpenAI", "Hugging Face"],
      useCases: ["Cost Estimation", "Context Window Management"],
    },
    relatedPlaybooks: ["quick-reference-cards"],
  },
];


