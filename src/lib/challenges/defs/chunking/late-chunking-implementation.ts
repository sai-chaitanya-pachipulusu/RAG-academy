import type { RawChallenge } from "@/lib/challenges/types";

export const lateChunkingImplementationChallenge: RawChallenge = {
  slug: "late-chunking-implementation",
  title: "Late Chunking Implementation",
  difficulty: "medium",
  xpReward: 175,
  group: "Chunking Strategies",
  description:
    "Goal: Implement late chunking to preserve cross-chunk context by embedding before chunking. Why: Naive chunking loses pronoun references and cross-sentence context. Late chunking embeds the full document first, preserving relationships. Production impact: Critical for narrative documents, transcripts, and any content with coreferences.",
  prerequisites: ["semantic-chunking-pipeline"],
  starterCode: `# Late Chunking Implementation
# Preserve cross-chunk context by embedding before chunking

from dataclasses import dataclass
import numpy as np
from typing import Tuple

@dataclass
class Chunk:
    text: str
    embedding: np.ndarray
    char_range: Tuple[int, int]
    token_range: Tuple[int, int]

def find_chunk_boundaries(
    text: str,
    chunk_size: int = 200,
    overlap: int = 20
) -> list[Tuple[int, int]]:
    """
    Find character-level chunk boundaries.
    
    Args:
        text: Input document text
        chunk_size: Target chunk size in characters
        overlap: Overlap between chunks in characters
        
    Returns:
        List of (start, end) character positions
    """
    # TODO: Implement chunking logic
    # Hint: Try to break at sentence boundaries when possible
    pass


def map_char_to_tokens(
    char_start: int,
    char_end: int,
    offset_mapping: list[Tuple[int, int]]
) -> Tuple[int, int]:
    """
    Map character boundaries to token indices.
    
    Args:
        char_start: Start character position
        char_end: End character position  
        offset_mapping: List of (char_start, char_end) for each token
        
    Returns:
        (token_start, token_end) indices
    """
    # TODO: Find which tokens fall within the character range
    pass


def mean_pool_embeddings(
    token_embeddings: np.ndarray,
    token_start: int,
    token_end: int
) -> np.ndarray:
    """
    Mean pool token embeddings for a chunk.
    
    Args:
        token_embeddings: Array of shape (num_tokens, embedding_dim)
        token_start: Start token index (inclusive)
        token_end: End token index (exclusive)
        
    Returns:
        Mean-pooled embedding of shape (embedding_dim,)
    """
    # TODO: Extract and mean-pool the token embeddings
    pass


def late_chunk(
    text: str,
    token_embeddings: np.ndarray,
    offset_mapping: list[Tuple[int, int]],
    chunk_size: int = 200
) -> list[Chunk]:
    """
    Perform late chunking: create context-aware chunk embeddings.
    
    Args:
        text: Original document text
        token_embeddings: Token-level embeddings from transformer
        offset_mapping: Maps each token to character positions
        chunk_size: Target chunk size in characters
        
    Returns:
        List of Chunk objects with text and embeddings
    """
    # TODO: Orchestrate the late chunking pipeline
    pass
`,
  testCode: `import numpy as np

# Test with mock data
text = "Alice was exploring the garden. She spotted a white rabbit. She fell into a hole while chasing it. The underground world was strange."

# Mock: 20 tokens, 64-dim embeddings
np.random.seed(42)
token_embeddings = np.random.randn(20, 64)

# Mock offset mapping
offset_mapping = [
    (0, 5), (6, 9), (10, 19), (20, 23), (24, 30), (30, 31),
    (32, 35), (36, 43), (44, 45), (46, 51), (52, 58), (58, 59),
    (60, 63), (64, 68), (69, 73), (74, 75), (76, 80), (81, 88), (89, 91), (91, 92)
]

# Test find_chunk_boundaries
boundaries = find_chunk_boundaries(text, chunk_size=60, overlap=10)
assert len(boundaries) >= 2, f"Should have multiple chunks, got {len(boundaries)}"

# Test map_char_to_tokens
token_start, token_end = map_char_to_tokens(0, 31, offset_mapping)
assert token_start == 0, f"Token start should be 0, got {token_start}"
assert token_end == 6, f"Token end should be 6, got {token_end}"

# Test mean_pool_embeddings
pooled = mean_pool_embeddings(token_embeddings, 0, 6)
assert pooled.shape == (64,), f"Pooled should be (64,), got {pooled.shape}"
expected = token_embeddings[0:6].mean(axis=0)
assert np.allclose(pooled, expected), "Mean pooling incorrect"

# Test late_chunk
chunks = late_chunk(text, token_embeddings, offset_mapping, chunk_size=60)
assert len(chunks) >= 2, f"Should have chunks, got {len(chunks)}"
assert all(isinstance(c, Chunk) for c in chunks)
assert all(c.embedding.shape == (64,) for c in chunks)

# Verify chunk text matches boundaries
for chunk in chunks:
    expected_text = text[chunk.char_range[0]:chunk.char_range[1]]
    assert chunk.text == expected_text

print("All tests passed!")`,
  solution: `from dataclasses import dataclass
import numpy as np
from typing import Tuple

@dataclass
class Chunk:
    text: str
    embedding: np.ndarray
    char_range: Tuple[int, int]
    token_range: Tuple[int, int]

def find_chunk_boundaries(
    text: str,
    chunk_size: int = 200,
    overlap: int = 20
) -> list[Tuple[int, int]]:
    boundaries = []
    start = 0
    
    while start < len(text):
        end = min(start + chunk_size, len(text))
        
        if end < len(text):
            for char in ".!?\\n":
                last_break = text.rfind(char, start + chunk_size // 2, end)
                if last_break > start:
                    end = last_break + 1
                    break
        
        boundaries.append((start, end))
        start = end - overlap
        if start >= len(text) or end >= len(text):
            break
    
    return boundaries


def map_char_to_tokens(
    char_start: int,
    char_end: int,
    offset_mapping: list[Tuple[int, int]]
) -> Tuple[int, int]:
    token_start = None
    token_end = None
    
    for idx, (tok_char_start, tok_char_end) in enumerate(offset_mapping):
        if tok_char_start >= char_start and token_start is None:
            token_start = idx
        if tok_char_end <= char_end:
            token_end = idx + 1
    
    if token_start is None:
        token_start = 0
    if token_end is None:
        token_end = len(offset_mapping)
    
    return token_start, token_end


def mean_pool_embeddings(
    token_embeddings: np.ndarray,
    token_start: int,
    token_end: int
) -> np.ndarray:
    chunk_tokens = token_embeddings[token_start:token_end]
    
    if len(chunk_tokens) == 0:
        return np.zeros(token_embeddings.shape[1])
    
    return chunk_tokens.mean(axis=0)


def late_chunk(
    text: str,
    token_embeddings: np.ndarray,
    offset_mapping: list[Tuple[int, int]],
    chunk_size: int = 200
) -> list[Chunk]:
    char_boundaries = find_chunk_boundaries(text, chunk_size)
    
    chunks = []
    for char_start, char_end in char_boundaries:
        token_start, token_end = map_char_to_tokens(
            char_start, char_end, offset_mapping
        )
        
        embedding = mean_pool_embeddings(
            token_embeddings, token_start, token_end
        )
        
        chunks.append(Chunk(
            text=text[char_start:char_end],
            embedding=embedding,
            char_range=(char_start, char_end),
            token_range=(token_start, token_end)
        ))
    
    return chunks
`,
  hints: [
    "For find_chunk_boundaries, use rfind() to search backwards for sentence endings",
    "In map_char_to_tokens, iterate through offset_mapping to find overlapping ranges",
    "mean_pool_embeddings is just numpy slicing + .mean(axis=0)",
    "late_chunk orchestrates the other three functions in sequence",
  ],
  realWorld: {
    description: "Late chunking is critical for documents where context flows across chunk boundaries. Pioneered by Jina AI for their embedding models.",
    companies: ["Jina AI", "Contextual AI", "Anthropic"],
    useCases: [
      "Narrative document processing",
      "Legal document chunking",
      "Technical documentation",
    ],
  },
  timeEstimate: { minutes: 25, label: "20-30 min" },
};
