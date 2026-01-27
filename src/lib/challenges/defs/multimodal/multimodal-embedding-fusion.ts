import type { RawChallenge } from "@/lib/challenges/types";

export const multimodalEmbeddingFusionChallenge: RawChallenge = {
  slug: "multimodal-embedding-fusion",
  title: "Multimodal Embedding Fusion",
  difficulty: "hard",
  xpReward: 275,
  group: "Multimodal RAG",
  description:
    "Goal: Combine text and image embeddings for multimodal retrieval using CLIP-style fusion. Why: Real-world applications need to search across text and images simultaneously. Production impact: Essential for e-commerce visual search, medical imaging with notes, and content recommendation.",
  prerequisites: ["cosine-similarity"],
  starterCode: `# Multimodal Embedding Fusion
# Combine text and image embeddings for unified retrieval

import numpy as np
from dataclasses import dataclass
from typing import Optional

@dataclass
class MultimodalItem:
    """An item with optional text and image embeddings."""
    id: str
    text_embedding: Optional[np.ndarray] = None
    image_embedding: Optional[np.ndarray] = None
    metadata: dict = None
    
    def __post_init__(self):
        self.metadata = self.metadata or {}

@dataclass  
class MultimodalQuery:
    """A query with optional text and image components."""
    text_embedding: Optional[np.ndarray] = None
    image_embedding: Optional[np.ndarray] = None


def normalize_embedding(embedding: np.ndarray) -> np.ndarray:
    """L2 normalize an embedding vector."""
    # TODO: Normalize to unit length
    pass


def concatenate_fusion(
    text_emb: Optional[np.ndarray],
    image_emb: Optional[np.ndarray],
    text_weight: float = 0.5
) -> np.ndarray:
    """
    Fuse embeddings by weighted concatenation.
    If one modality is missing, use only the other.
    """
    # TODO: Implement weighted concatenation fusion
    pass


def average_fusion(
    text_emb: Optional[np.ndarray],
    image_emb: Optional[np.ndarray],
    text_weight: float = 0.5
) -> np.ndarray:
    """
    Fuse embeddings by weighted average.
    Assumes embeddings are in same space (like CLIP).
    """
    # TODO: Implement weighted average fusion
    pass


def compute_multimodal_similarity(
    query: MultimodalQuery,
    item: MultimodalItem,
    fusion_method: str = "average",
    text_weight: float = 0.5
) -> float:
    """
    Compute similarity between multimodal query and item.
    """
    # TODO: Fuse embeddings and compute similarity
    pass


def multimodal_search(
    query: MultimodalQuery,
    items: list[MultimodalItem],
    k: int = 5,
    fusion_method: str = "average",
    text_weight: float = 0.5
) -> list[tuple[MultimodalItem, float]]:
    """
    Search for most similar items to a multimodal query.
    Returns: List of (item, score) tuples, sorted by similarity.
    """
    # TODO: Compute similarities and return top-k
    pass


def cross_modal_search(
    query_embedding: np.ndarray,
    query_modality: str,  # "text" or "image"
    items: list[MultimodalItem],
    k: int = 5
) -> list[tuple[MultimodalItem, float]]:
    """
    Search using one modality to find items with the other modality.
    E.g., text query to find relevant images.
    """
    # TODO: Implement cross-modal search
    pass
`,
  testCode: `import numpy as np

np.random.seed(42)
dim = 768

# Test normalize_embedding
emb = np.random.randn(dim)
normalized = normalize_embedding(emb)
assert abs(np.linalg.norm(normalized) - 1.0) < 1e-6, "Should be unit norm"

# Test concatenate_fusion
text_emb = np.random.randn(dim)
image_emb = np.random.randn(dim)

fused = concatenate_fusion(text_emb, image_emb, text_weight=0.6)
assert fused.shape[0] >= dim, f"Fused should include both, got {fused.shape}"

fused_text_only = concatenate_fusion(text_emb, None)
assert fused_text_only is not None, "Should handle missing modality"

# Test average_fusion
avg_fused = average_fusion(text_emb, image_emb, text_weight=0.5)
assert avg_fused.shape == (dim,), "Average fusion should keep dim"

# Test multimodal similarity
query = MultimodalQuery(
    text_embedding=np.random.randn(dim),
    image_embedding=np.random.randn(dim)
)
item = MultimodalItem(
    id="item1",
    text_embedding=np.random.randn(dim),
    image_embedding=np.random.randn(dim)
)

sim = compute_multimodal_similarity(query, item, "average")
assert -1 <= sim <= 1, f"Cosine similarity should be in [-1,1], got {sim}"

# Test multimodal search
items = [
    MultimodalItem(id=f"item{i}", 
                  text_embedding=np.random.randn(dim),
                  image_embedding=np.random.randn(dim))
    for i in range(10)
]

results = multimodal_search(query, items, k=3)
assert len(results) == 3, f"Should return 3 results, got {len(results)}"
assert all(isinstance(r[0], MultimodalItem) for r in results)
assert results[0][1] >= results[1][1] >= results[2][1], "Should be sorted"

# Test cross-modal search
text_query = np.random.randn(dim)
cross_results = cross_modal_search(text_query, "text", items, k=3)
assert len(cross_results) == 3

print("All tests passed!")`,
  solution: `import numpy as np
from dataclasses import dataclass
from typing import Optional

@dataclass
class MultimodalItem:
    id: str
    text_embedding: Optional[np.ndarray] = None
    image_embedding: Optional[np.ndarray] = None
    metadata: dict = None
    
    def __post_init__(self):
        self.metadata = self.metadata or {}

@dataclass  
class MultimodalQuery:
    text_embedding: Optional[np.ndarray] = None
    image_embedding: Optional[np.ndarray] = None


def normalize_embedding(embedding: np.ndarray) -> np.ndarray:
    norm = np.linalg.norm(embedding)
    if norm < 1e-10:
        return embedding
    return embedding / norm


def concatenate_fusion(
    text_emb: Optional[np.ndarray],
    image_emb: Optional[np.ndarray],
    text_weight: float = 0.5
) -> np.ndarray:
    if text_emb is None and image_emb is None:
        raise ValueError("At least one embedding required")
    
    if text_emb is None:
        return normalize_embedding(image_emb)
    if image_emb is None:
        return normalize_embedding(text_emb)
    
    weighted_text = text_emb * text_weight
    weighted_image = image_emb * (1 - text_weight)
    
    fused = np.concatenate([weighted_text, weighted_image])
    return normalize_embedding(fused)


def average_fusion(
    text_emb: Optional[np.ndarray],
    image_emb: Optional[np.ndarray],
    text_weight: float = 0.5
) -> np.ndarray:
    if text_emb is None and image_emb is None:
        raise ValueError("At least one embedding required")
    
    if text_emb is None:
        return normalize_embedding(image_emb)
    if image_emb is None:
        return normalize_embedding(text_emb)
    
    fused = text_weight * text_emb + (1 - text_weight) * image_emb
    return normalize_embedding(fused)


def compute_multimodal_similarity(
    query: MultimodalQuery,
    item: MultimodalItem,
    fusion_method: str = "average",
    text_weight: float = 0.5
) -> float:
    fusion_fn = average_fusion if fusion_method == "average" else concatenate_fusion
    
    query_fused = fusion_fn(
        query.text_embedding,
        query.image_embedding,
        text_weight
    )
    
    item_fused = fusion_fn(
        item.text_embedding,
        item.image_embedding,
        text_weight
    )
    
    return float(np.dot(query_fused, item_fused))


def multimodal_search(
    query: MultimodalQuery,
    items: list[MultimodalItem],
    k: int = 5,
    fusion_method: str = "average",
    text_weight: float = 0.5
) -> list[tuple[MultimodalItem, float]]:
    scored_items = []
    
    for item in items:
        try:
            sim = compute_multimodal_similarity(
                query, item, fusion_method, text_weight
            )
            scored_items.append((item, sim))
        except ValueError:
            continue
    
    scored_items.sort(key=lambda x: x[1], reverse=True)
    
    return scored_items[:k]


def cross_modal_search(
    query_embedding: np.ndarray,
    query_modality: str,
    items: list[MultimodalItem],
    k: int = 5
) -> list[tuple[MultimodalItem, float]]:
    query_norm = normalize_embedding(query_embedding)
    scored_items = []
    
    for item in items:
        if query_modality == "text":
            item_emb = item.image_embedding
        else:
            item_emb = item.text_embedding
        
        if item_emb is None:
            continue
        
        item_norm = normalize_embedding(item_emb)
        sim = float(np.dot(query_norm, item_norm))
        scored_items.append((item, sim))
    
    scored_items.sort(key=lambda x: x[1], reverse=True)
    return scored_items[:k]
`,
  hints: [
    "normalize_embedding: divide by np.linalg.norm",
    "concatenate_fusion: np.concatenate([weighted_text, weighted_image])",
    "average_fusion: text_weight * text + (1-text_weight) * image",
    "cross_modal_search: use query's modality to search in OPPOSITE modality",
  ],
  realWorld: {
    description: "Multimodal RAG is essential for applications involving both text and images. CLIP-style models enable searching across modalities.",
    companies: ["OpenAI (CLIP)", "Google", "Pinterest", "Amazon"],
    useCases: [
      "E-commerce visual search",
      "Medical imaging with notes",
      "Content recommendation",
    ],
  },
  timeEstimate: { minutes: 35, label: "30-40 min" },
};
