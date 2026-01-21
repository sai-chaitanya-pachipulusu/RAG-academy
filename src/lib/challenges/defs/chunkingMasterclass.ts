import type { RawChallenge } from "@/lib/challenges/types";

/**
 * CHUNKING MASTER CLASS
 * 
 * This module teaches chunking from first principles, explaining:
 * - WHY each technique was introduced
 * - WHAT problem it solved that predecessors couldn't
 * - HOW to implement it correctly
 * 
 * Learning Path:
 * 1. Fixed-Size → 2. Overlapping → 3. Sentence-Based → 4. Paragraph-Based
 * → 5. Sliding Window → 6. Recursive → 7. Section-Based → 8. Semantic 
 * → 9. Hierarchical → 10. Metadata-Aware
 */

export const CHUNKING_MASTERCLASS_CHALLENGES: RawChallenge[] = [
  // ============================================================================
  // LEVEL 1: FIXED-SIZE CHUNKING (The Foundation)
  // ============================================================================
  {
    slug: "fixed-size-chunking-fundamentals",
    title: "Fixed-Size Chunking: The Foundation",
    description:
      `The very first chunking technique. WHY INTRODUCED: LLMs have fixed context windows (4K-128K tokens). A 500-page PDF doesn't fit. PROBLEM IT SOLVED: Made arbitrarily long documents processable. LIMITATION: Cuts words mid-sentence, destroying meaning at boundaries.`,
    group: "Chunking Masterclass — Level 1: Basics",
    difficulty: "easy",
    xpReward: 30,
    starterCode: `from typing import List

def fixed_size_chunk(text: str, chunk_size: int, by_tokens: bool = False) -> List[str]:
    """
    The simplest chunking: split text into fixed-size pieces.
    
    First Principles:
    - LLMs have fixed context windows (e.g., 4096 tokens for GPT-3.5)
    - A 100-page document might have 50,000 tokens
    - We MUST split it somehow - this is the simplest way
    
    Args:
        text: The input text to chunk
        chunk_size: Maximum size per chunk (characters if by_tokens=False)
        by_tokens: If True, count words as proxy for tokens
        
    Returns:
        List of chunks, each <= chunk_size in length
        
    Rules:
        - chunk_size must be > 0, else ValueError
        - Return [] for empty text
        - If by_tokens=True, split by words and count words as "tokens"
    """
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `# Test character-based chunking
assert fixed_size_chunk("", 100) == []
assert fixed_size_chunk("hello world", 5) == ["hello", " worl", "d"]
assert fixed_size_chunk("abcdefgh", 3) == ["abc", "def", "gh"]

# Test token-based chunking (words as proxy)
assert fixed_size_chunk("one two three four five", 2, by_tokens=True) == ["one two", "three four", "five"]
assert fixed_size_chunk("a b c d e f", 3, by_tokens=True) == ["a b c", "d e f"]

# Edge cases
try:
    fixed_size_chunk("test", 0)
    assert False, "Should raise ValueError"
except ValueError:
    pass

print("All tests passed!")`,
    hints: [
      "For character-based: use text[i:i+chunk_size] in a loop",
      "For token-based: split by whitespace, group every chunk_size words",
      "Don't forget to validate chunk_size > 0",
    ],
    solution: `from typing import List

def fixed_size_chunk(text: str, chunk_size: int, by_tokens: bool = False) -> List[str]:
    if chunk_size <= 0:
        raise ValueError("chunk_size must be > 0")
    if not text:
        return []
    
    if by_tokens:
        words = text.split()
        chunks = []
        for i in range(0, len(words), chunk_size):
            chunks.append(" ".join(words[i:i + chunk_size]))
        return chunks
    else:
        chunks = []
        for i in range(0, len(text), chunk_size):
            chunks.append(text[i:i + chunk_size])
        return chunks
`,
    timeEstimate: { minutes: 15, label: "15-20 min" },
    realWorld: {
      description: "The baseline for all RAG systems. Every framework (LangChain, LlamaIndex) starts here. Simple but often sufficient for structured documents.",
      companies: ["LangChain", "LlamaIndex", "OpenAI Cookbook"],
      useCases: ["Quick prototypes", "Uniform documents like logs"],
    },
    relatedPlaybooks: ["document-parsing-guide", "rag-techniques-encyclopedia"],
  },

  // ============================================================================
  // LEVEL 2: OVERLAPPING CHUNKING (The First Improvement)
  // ============================================================================
  {
    slug: "overlapping-chunking-explained",
    title: "Overlapping Chunking: Preserving Context",
    description:
      `WHY INTRODUCED: Fixed-size chunks cut sentences in half. The word "machine" in "machine learning" might end up in chunk 1 while "learning" is in chunk 2. PROBLEM IT SOLVED: Retrieval now finds related content even if the query spans a boundary. IMPROVEMENT: 15-25% better recall on boundary-crossing queries. TRADEOFF: More chunks = more storage and compute.`,
    group: "Chunking Masterclass — Level 1: Basics",
    difficulty: "easy",
    xpReward: 35,
    prerequisites: ["fixed-size-chunking-fundamentals"],
    starterCode: `from typing import List

def overlap_chunk(text: str, chunk_size: int, overlap: int) -> List[str]:
    """
    Chunking with overlap to preserve context at boundaries.
    
    First Principles:
    - Fixed-size chunking loses context at boundaries
    - If query term spans two chunks, retrieval fails
    - By OVERLAPPING, we duplicate boundary content in both chunks
    
    Visual example (chunk_size=10, overlap=3):
    
    Text:     [AAAAAAAAAA][BBBBBBBBBB][CCCCCCCCCC]
    Chunk 1:  [AAAAAAAAAA]
    Chunk 2:        [AAA][BBBBBBB]  <- overlap captures "AAA" again
    Chunk 3:              [BBB][CCCCCCC]
    
    Args:
        text: Input text
        chunk_size: Size of each chunk
        overlap: Number of characters to overlap between consecutive chunks
        
    Returns:
        List of overlapping chunks
        
    Rules:
        - chunk_size must be > 0
        - overlap must be >= 0 and < chunk_size
        - step_size = chunk_size - overlap
    """
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `# Basic overlap
chunks = overlap_chunk("0123456789ABCDEF", 6, 2)
assert chunks[0] == "012345"
assert chunks[1] == "456789"  # overlaps with "45" from previous
assert "9A" in chunks[2] or "89AB" in chunks[2]

# No overlap = fixed-size
assert overlap_chunk("abcdefgh", 4, 0) == ["abcd", "efgh"]

# High overlap
chunks = overlap_chunk("123456789", 5, 3)
assert len(chunks) >= 3  # More chunks due to high overlap

# Edge cases
try:
    overlap_chunk("test", 5, 5)  # overlap >= chunk_size
    assert False, "Should raise ValueError"
except ValueError:
    pass

print("All tests passed!")`,
    hints: [
      "step_size = chunk_size - overlap",
      "Loop: start at 0, increment by step_size",
      "Each chunk is text[i:i+chunk_size]",
    ],
    solution: `from typing import List

def overlap_chunk(text: str, chunk_size: int, overlap: int) -> List[str]:
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
    return chunks
`,
    timeEstimate: { minutes: 15, label: "15-20 min" },
    realWorld: {
      description: "Industry standard. LangChain's RecursiveCharacterTextSplitter uses 200-char overlap by default. Pinecone recommends 10-20% overlap.",
      companies: ["Pinecone", "LangChain", "Weaviate"],
      useCases: ["All production RAG", "Legal document search"],
    },
    relatedPlaybooks: ["document-parsing-guide", "rag-techniques-encyclopedia"],
  },

  // ============================================================================
  // LEVEL 3: SENTENCE-BASED CHUNKING (Semantic Boundaries)
  // ============================================================================
  {
    slug: "sentence-based-chunking",
    title: "Sentence-Based Chunking: Respecting Language",
    description:
      `WHY INTRODUCED: Fixed-size cuts mid-word ("mach|ine"). Overlap helps but still creates awkward breaks. INSIGHT: Humans write in sentences - natural semantic units. PROBLEM IT SOLVED: Each chunk is now a complete thought. IMPROVEMENT: Better embedding quality because sentences are self-contained. TRADEOFF: Highly variable chunk sizes.`,
    group: "Chunking Masterclass — Level 2: Linguistic",
    difficulty: "medium",
    xpReward: 50,
    prerequisites: ["overlapping-chunking-explained"],
    starterCode: `from typing import List
import re

def sentence_chunk(text: str, max_sentences: int = 3) -> List[str]:
    """
    Chunk by sentences - the natural unit of meaning.
    
    First Principles:
    - Sentences are complete thoughts
    - Cutting mid-sentence destroys meaning
    - Embeddings of complete sentences are more coherent
    
    Why this matters for RAG:
    - Query: "What is machine learning?"
    - Bad chunk: "Machine learning is" (incomplete)
    - Good chunk: "Machine learning is a subset of AI." (complete)
    
    Args:
        text: Input text
        max_sentences: Maximum sentences per chunk
        
    Returns:
        List of chunks, each containing up to max_sentences sentences
        
    Rules:
        - Split on sentence boundaries (. ! ?)
        - Group sentences into chunks of max_sentences
        - Preserve original punctuation
        - Handle edge cases: Mr., Dr., etc.
    """
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `# Basic sentence chunking
text = "First sentence. Second sentence. Third sentence. Fourth sentence."
chunks = sentence_chunk(text, max_sentences=2)
assert len(chunks) == 2
assert "First sentence. Second sentence." in chunks[0]
assert "Third sentence. Fourth sentence." in chunks[1]

# Handle different punctuation
text2 = "What is RAG? It retrieves context! Then generates answers."
chunks2 = sentence_chunk(text2, max_sentences=1)
assert len(chunks2) == 3
assert "What is RAG?" in chunks2[0]

# Edge case: single long sentence
text3 = "This is one very long sentence without any breaks"
chunks3 = sentence_chunk(text3, max_sentences=2)
assert len(chunks3) == 1

print("All tests passed!")`,
    hints: [
      "Use regex: r'(?<=[.!?])\\s+' to split on sentence boundaries",
      "Group split sentences into batches of max_sentences",
      "Handle edge case of sentences without final punctuation",
    ],
    solution: `from typing import List
import re

def sentence_chunk(text: str, max_sentences: int = 3) -> List[str]:
    if not text:
        return []
    if max_sentences <= 0:
        raise ValueError("max_sentences must be > 0")
    
    # Split on sentence-ending punctuation followed by whitespace
    sentences = re.split(r'(?<=[.!?])\\s+', text.strip())
    sentences = [s.strip() for s in sentences if s.strip()]
    
    if not sentences:
        return [text] if text.strip() else []
    
    chunks = []
    for i in range(0, len(sentences), max_sentences):
        chunk = " ".join(sentences[i:i + max_sentences])
        chunks.append(chunk)
    
    return chunks
`,
    timeEstimate: { minutes: 20, label: "20-25 min" },
    realWorld: {
      description: "Preferred for narrative content like articles, stories, support tickets. NLTK's sent_tokenize and spaCy's sentencizer are production tools.",
      companies: ["Grammarly", "Medium", "Notion"],
      useCases: ["Blog search", "Customer support RAG", "News retrieval"],
    },
    relatedPlaybooks: ["document-parsing-guide", "rag-techniques-encyclopedia"],
  },

  // ============================================================================
  // LEVEL 4: PARAGRAPH-BASED CHUNKING (Document Structure)
  // ============================================================================
  {
    slug: "paragraph-based-chunking",
    title: "Paragraph-Based Chunking: Thematic Units",
    description:
      `WHY INTRODUCED: Sentences are semantic units, but paragraphs are THEMATIC units. A paragraph develops ONE idea fully. PROBLEM IT SOLVED: Keeps related sentences together. IMPROVEMENT: Chunks have internal coherence - all sentences support the same point. TRADEOFF: Paragraph lengths vary wildly (1 sentence to 20+ sentences).`,
    group: "Chunking Masterclass — Level 2: Linguistic",
    difficulty: "medium",
    xpReward: 50,
    prerequisites: ["sentence-based-chunking"],
    starterCode: `from typing import List

def paragraph_chunk(text: str, min_length: int = 50, max_length: int = 500) -> List[str]:
    """
    Chunk by paragraphs - thematic units of text.
    
    First Principles:
    - Writers use paragraphs to group related ideas
    - Each paragraph typically develops ONE main point
    - Keeping paragraphs intact preserves argument structure
    
    Why this matters for RAG:
    - Query: "Explain the benefits of RAG"
    - A single paragraph might list all benefits together
    - Splitting it would scatter the answer across chunks
    
    Args:
        text: Input text
        min_length: Minimum chars per chunk (merge short paragraphs)
        max_length: Maximum chars per chunk (split long paragraphs)
        
    Returns:
        List of paragraph-based chunks
        
    Rules:
        - Split on double newlines (paragraph separator)
        - Merge paragraphs shorter than min_length with next
        - Split paragraphs longer than max_length at sentence boundaries
    """
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `# Basic paragraph chunking
text = \"\"\"First paragraph with some content here.

Second paragraph has different information.

Third paragraph concludes the document.\"\"\"

chunks = paragraph_chunk(text, min_length=10, max_length=500)
assert len(chunks) == 3
assert "First paragraph" in chunks[0]
assert "Second paragraph" in chunks[1]

# Merge short paragraphs
text2 = \"\"\"Short.

Also short.

This is a longer paragraph with more content.\"\"\"

chunks2 = paragraph_chunk(text2, min_length=50, max_length=500)
assert len(chunks2) <= 2  # Short ones merged

# Split long paragraphs
long_para = "A. " * 100  # Very long paragraph
chunks3 = paragraph_chunk(long_para, min_length=10, max_length=100)
assert len(chunks3) > 1  # Should be split

print("All tests passed!")`,
    hints: [
      "Split on '\\n\\n' or '\\n\\s*\\n' for paragraphs",
      "Build chunks by merging small paragraphs",
      "Use sentence boundaries to split oversized paragraphs",
    ],
    solution: `from typing import List
import re

def paragraph_chunk(text: str, min_length: int = 50, max_length: int = 500) -> List[str]:
    if not text:
        return []
    
    # Split on paragraph boundaries (double newlines)
    paragraphs = re.split(r'\\n\\s*\\n', text.strip())
    paragraphs = [p.strip() for p in paragraphs if p.strip()]
    
    if not paragraphs:
        return []
    
    chunks = []
    current_chunk = ""
    
    for para in paragraphs:
        # If paragraph is too long, split it
        if len(para) > max_length:
            # First, add any accumulated content
            if current_chunk:
                chunks.append(current_chunk.strip())
                current_chunk = ""
            
            # Split long paragraph by sentences
            sentences = re.split(r'(?<=[.!?])\\s+', para)
            temp = ""
            for sent in sentences:
                if len(temp) + len(sent) <= max_length:
                    temp += sent + " "
                else:
                    if temp:
                        chunks.append(temp.strip())
                    temp = sent + " "
            if temp:
                chunks.append(temp.strip())
        else:
            # Merge short paragraphs
            if len(current_chunk) + len(para) <= max_length:
                current_chunk += para + " "
            else:
                if current_chunk and len(current_chunk) >= min_length:
                    chunks.append(current_chunk.strip())
                    current_chunk = para + " "
                else:
                    current_chunk += para + " "
    
    if current_chunk and current_chunk.strip():
        chunks.append(current_chunk.strip())
    
    return chunks
`,
    timeEstimate: { minutes: 25, label: "25-30 min" },
    realWorld: {
      description: "Ideal for blog posts, Wikipedia articles, research papers. Many CMS systems already segment content by paragraphs.",
      companies: ["Wikipedia", "Medium", "Substack"],
      useCases: ["Wiki-style RAG", "Article summarization", "FAQ systems"],
    },
    relatedPlaybooks: ["document-parsing-guide", "rag-techniques-encyclopedia"],
  },

  // ============================================================================
  // LEVEL 5: SLIDING WINDOW CHUNKING (Dense Overlap)
  // ============================================================================
  {
    slug: "sliding-window-chunking",
    title: "Sliding Window Chunking: Maximum Coverage",
    description:
      `WHY INTRODUCED: Standard overlap (10-20%) still misses some boundary cases. INSIGHT: What if we generate MANY overlapping views of the same content? PROBLEM IT SOLVED: For critical documents, ensures every possible query has a matching chunk. IMPROVEMENT: Near-perfect recall for exact-match queries. TRADEOFF: 3-5x more chunks = higher storage and inference cost.`,
    group: "Chunking Masterclass — Level 3: Advanced",
    difficulty: "medium",
    xpReward: 60,
    prerequisites: ["overlapping-chunking-explained"],
    starterCode: `from typing import List, Tuple

def sliding_window_chunk(
    text: str, 
    window_size: int, 
    stride: int
) -> List[Tuple[str, int]]:
    """
    Dense sliding window chunking for maximum coverage.
    
    First Principles:
    - Traditional overlap still has "blind spots"
    - By sliding with small strides, we create many views
    - SOME chunk will align perfectly with ANY query
    
    Visual (window=10, stride=3):
    Text: [0123456789ABCDEF...]
    Win1: [0123456789]
    Win2:    [3456789ABC]
    Win3:       [6789ABCDEF]
    
    Use case: Legal contracts where missing a clause = lawsuit
    
    Args:
        text: Input text
        window_size: Size of each window
        stride: How many characters to move between windows
        
    Returns:
        List of (chunk, start_position) tuples
        
    Rules:
        - stride must be > 0 and <= window_size
        - Return position for citation/reference back to source
    """
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `# Basic sliding window
chunks = sliding_window_chunk("0123456789", 5, 2)
assert len(chunks) >= 3
assert chunks[0] == ("01234", 0)
assert chunks[1] == ("23456", 2)

# Stride equals window (no overlap - same as fixed)
chunks2 = sliding_window_chunk("ABCDEFGH", 4, 4)
assert len(chunks2) == 2
assert chunks2[0] == ("ABCD", 0)
assert chunks2[1] == ("EFGH", 4)

# Dense sliding (stride=1) - maximum coverage
chunks3 = sliding_window_chunk("hello", 3, 1)
assert len(chunks3) == 3
assert chunks3[0] == ("hel", 0)
assert chunks3[1] == ("ell", 1)
assert chunks3[2] == ("llo", 2)

# Edge cases
try:
    sliding_window_chunk("test", 5, 0)  # stride must be > 0
    assert False
except ValueError:
    pass

print("All tests passed!")`,
    hints: [
      "Loop with range(0, len(text) - window_size + 1, stride)",
      "Return tuples of (chunk_text, start_position)",
      "Handle case where text is shorter than window_size",
    ],
    solution: `from typing import List, Tuple

def sliding_window_chunk(
    text: str, 
    window_size: int, 
    stride: int
) -> List[Tuple[str, int]]:
    if stride <= 0:
        raise ValueError("stride must be > 0")
    if window_size <= 0:
        raise ValueError("window_size must be > 0")
    if stride > window_size:
        raise ValueError("stride should not exceed window_size")
    if not text:
        return []
    
    chunks = []
    for i in range(0, len(text) - window_size + 1, stride):
        chunks.append((text[i:i + window_size], i))
    
    # Handle last partial window if text doesn't divide evenly
    last_start = ((len(text) - window_size) // stride) * stride
    if last_start + window_size < len(text):
        final_start = len(text) - window_size
        if final_start >= 0 and (not chunks or chunks[-1][1] != final_start):
            chunks.append((text[final_start:], final_start))
    
    return chunks
`,
    timeEstimate: { minutes: 25, label: "25-30 min" },
    realWorld: {
      description: "Used in high-stakes domains: legal discovery, medical records, compliance audits. OpenAI's embedding best practices mention this for critical retrieval.",
      companies: ["LexisNexis", "Westlaw", "Epic (Healthcare)"],
      useCases: ["Legal e-discovery", "Contract analysis", "Regulatory compliance"],
    },
    relatedPlaybooks: ["document-parsing-guide", "production-deployment-checklist"],
  },

  // ============================================================================
  // LEVEL 6: RECURSIVE CHUNKING (The Production Standard)
  // ============================================================================
  {
    slug: "recursive-chunking",
    title: "Recursive Chunking: The Production Standard",
    description:
      `WHY INTRODUCED: Real documents have structure (paragraphs > sentences > words). We should TRY to split at natural boundaries. INSIGHT: Split at paragraphs first. If still too big, split at sentences. If still too big, split by characters. PROBLEM IT SOLVED: Balances chunk size consistency with semantic preservation. IMPROVEMENT: The most popular production algorithm - LangChain's default.`,
    group: "Chunking Masterclass — Level 3: Advanced",
    difficulty: "hard",
    xpReward: 100,
    prerequisites: ["paragraph-based-chunking"],
    starterCode: `from typing import List

def recursive_chunk(
    text: str,
    chunk_size: int,
    chunk_overlap: int,
    separators: List[str] = None
) -> List[str]:
    """
    Recursive chunking - the industry standard algorithm.
    
    First Principles:
    - Documents have hierarchy: paragraphs > sentences > words
    - We WANT to split at high-level boundaries if possible
    - Only fall back to lower-level splits when necessary
    
    Algorithm:
    1. Try to split on first separator (e.g., "\\n\\n" for paragraphs)
    2. If any piece is still > chunk_size, recursively split on next separator
    3. Continue until using character splits as last resort
    4. Merge small pieces, respecting overlap
    
    Default separators (in order of preference):
    ["\\n\\n", "\\n", ". ", " ", ""]
    
    Args:
        text: Input text
        chunk_size: Target maximum chunk size
        chunk_overlap: Overlap between chunks
        separators: List of separators to try, in order
        
    Returns:
        List of chunks
    """
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `# Should prefer paragraph splits
text = \"\"\"First paragraph here.

Second paragraph with more content.

Third paragraph ends it.\"\"\"
chunks = recursive_chunk(text, 50, 10)
assert len(chunks) >= 2

# Falls back to sentence split for long paragraphs
long_para = "Sentence one. Sentence two. Sentence three. Sentence four. Sentence five."
chunks2 = recursive_chunk(long_para, 30, 5)
assert len(chunks2) >= 2

# Character split as last resort
no_separators = "abcdefghijklmnopqrstuvwxyz"
chunks3 = recursive_chunk(no_separators, 10, 2)
assert all(len(c) <= 10 for c in chunks3)

# Custom separators
code = "def foo():\\n    pass\\ndef bar():\\n    return 1"
chunks4 = recursive_chunk(code, 20, 5, separators=["\\ndef ", "\\n", " "])
assert "def foo" in chunks4[0]

print("All tests passed!")`,
    hints: [
      "Start with default separators: ['\\n\\n', '\\n', '. ', ' ', '']",
      "Split on current separator, then recursively process pieces > chunk_size",
      "Empty string separator ('') means character-by-character split",
      "After splitting, merge small pieces with overlap",
    ],
    solution: `from typing import List

def recursive_chunk(
    text: str,
    chunk_size: int,
    chunk_overlap: int,
    separators: List[str] = None
) -> List[str]:
    if separators is None:
        separators = ["\\n\\n", "\\n", ". ", " ", ""]
    
    if not text:
        return []
    
    def _split_text(text: str, seps: List[str]) -> List[str]:
        if not seps:
            # Character split as last resort
            return [text[i:i + chunk_size] for i in range(0, len(text), chunk_size - chunk_overlap)]
        
        sep = seps[0]
        remaining_seps = seps[1:]
        
        if sep == "":
            # Character split
            return [text[i:i + chunk_size] for i in range(0, len(text), chunk_size - chunk_overlap)]
        
        if sep not in text:
            # This separator not found, try next
            return _split_text(text, remaining_seps)
        
        splits = text.split(sep)
        chunks = []
        current = ""
        
        for piece in splits:
            piece_with_sep = piece + sep if piece != splits[-1] else piece
            
            if len(current) + len(piece_with_sep) <= chunk_size:
                current += piece_with_sep
            else:
                if current:
                    chunks.append(current.strip())
                
                if len(piece_with_sep) > chunk_size:
                    # Recursively split this piece with remaining separators
                    sub_chunks = _split_text(piece_with_sep, remaining_seps)
                    chunks.extend(sub_chunks)
                    current = ""
                else:
                    current = piece_with_sep
        
        if current:
            chunks.append(current.strip())
        
        return [c for c in chunks if c]
    
    return _split_text(text, separators)
`,
    timeEstimate: { minutes: 40, label: "40-50 min" },
    realWorld: {
      description: "LangChain's RecursiveCharacterTextSplitter. LlamaIndex's SentenceSplitter. This is what 80% of production RAG systems use.",
      companies: ["LangChain", "LlamaIndex", "Anthropic"],
      useCases: ["General-purpose RAG", "Mixed-format documents"],
    },
    relatedPlaybooks: ["document-parsing-guide", "rag-techniques-encyclopedia"],
  },

  // ============================================================================
  // LEVEL 7: SECTION-BASED CHUNKING (Document Structure Aware)
  // ============================================================================
  {
    slug: "section-based-chunking",
    title: "Section-Based Chunking: Respecting Document Structure",
    description:
      `WHY INTRODUCED: Technical docs, papers, and manuals have explicit sections (headers, chapters). INSIGHT: A section's header DESCRIBES its content - invaluable metadata! PROBLEM IT SOLVED: Chunks now carry structural context. If a chunk is under "## Error Handling", we KNOW what topic it covers. IMPROVEMENT: 20-40% better retrieval on structured documents vs recursive chunking.`,
    group: "Chunking Masterclass — Level 4: Structure-Aware",
    difficulty: "hard",
    xpReward: 100,
    prerequisites: ["recursive-chunking"],
    starterCode: `from typing import List, Dict, Any
import re

def section_chunk(
    text: str,
    max_chunk_size: int = 500,
    header_patterns: List[str] = None
) -> List[Dict[str, Any]]:
    """
    Chunk by document sections (headers/titles).
    
    First Principles:
    - Documents have explicit structure (H1, H2, H3...)
    - Headers DESCRIBE the content below them
    - This is valuable semantic information we should preserve
    
    Why this matters:
    - Query: "How do I handle errors?"
    - Chunk from "## Error Handling" section = HIGH relevance
    - Same chunk from "## Introduction" = probably less relevant
    
    Args:
        text: Markdown or structured text
        max_chunk_size: Maximum size before splitting within section
        header_patterns: Regex patterns for headers (default: markdown ##)
        
    Returns:
        List of dicts with keys:
        - 'text': chunk content
        - 'header': section header
        - 'level': header level (1, 2, 3...)
        - 'breadcrumb': full path like "User Guide > Installation"
    """
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `markdown = \"\"\"# Main Title

Introduction paragraph here.

## Getting Started

Setup instructions go here.

### Prerequisites

You need Python 3.8+.

## Advanced Topics

More complex content here.\"\"\"

chunks = section_chunk(markdown, max_chunk_size=200)

# Should have multiple sections
assert len(chunks) >= 3

# Check structure
intro_chunk = [c for c in chunks if "Introduction" in c['text']]
assert len(intro_chunk) > 0
assert intro_chunk[0]['header'] == "Main Title"
assert intro_chunk[0]['level'] == 1

# Check breadcrumbs
prereq_chunk = [c for c in chunks if "Python 3.8" in c['text']]
assert len(prereq_chunk) > 0
assert "Getting Started" in prereq_chunk[0]['breadcrumb']

print("All tests passed!")`,
    hints: [
      "Use regex to detect headers: r'^(#{1,6})\\s+(.+)$' for markdown",
      "Track header stack to build breadcrumbs",
      "When encountering new header, flush current section content",
    ],
    solution: `from typing import List, Dict, Any
import re

def section_chunk(
    text: str,
    max_chunk_size: int = 500,
    header_patterns: List[str] = None
) -> List[Dict[str, Any]]:
    if not text:
        return []
    
    if header_patterns is None:
        header_patterns = [r'^(#{1,6})\\s+(.+)$']
    
    lines = text.split('\\n')
    chunks = []
    
    header_stack = []  # [(level, title), ...]
    current_content = []
    current_header = "Document"
    current_level = 0
    
    def flush_section():
        if current_content:
            content = '\\n'.join(current_content).strip()
            if content:
                breadcrumb = ' > '.join([h[1] for h in header_stack]) if header_stack else current_header
                chunks.append({
                    'text': content,
                    'header': current_header,
                    'level': current_level,
                    'breadcrumb': breadcrumb
                })
    
    for line in lines:
        # Check if line is a header
        header_match = re.match(r'^(#{1,6})\\s+(.+)$', line)
        
        if header_match:
            # Flush previous section
            flush_section()
            current_content = []
            
            level = len(header_match.group(1))
            title = header_match.group(2).strip()
            
            # Update header stack
            while header_stack and header_stack[-1][0] >= level:
                header_stack.pop()
            header_stack.append((level, title))
            
            current_header = title
            current_level = level
            current_content.append(line)
        else:
            current_content.append(line)
    
    # Flush final section
    flush_section()
    
    return chunks
`,
    timeEstimate: { minutes: 35, label: "35-45 min" },
    realWorld: {
      description: "Essential for documentation RAG (GitBook, ReadTheDocs, Confluence). LlamaIndex's MarkdownNodeParser implements this pattern.",
      companies: ["GitBook", "Notion", "Confluence", "ReadTheDocs"],
      useCases: ["Documentation search", "Technical manuals", "API reference"],
    },
    relatedPlaybooks: ["document-parsing-guide", "rag-techniques-encyclopedia"],
  },

  // ============================================================================
  // LEVEL 8: SEMANTIC CHUNKING (AI-Powered Boundaries)
  // ============================================================================
  {
    slug: "semantic-chunking",
    title: "Semantic Chunking: AI-Detected Boundaries",
    description:
      `WHY INTRODUCED: ALL previous methods use syntactic rules (characters, sentences, headers). But meaning doesn't always follow syntax! INSIGHT: Use embeddings to detect when topics CHANGE. Place boundaries where semantic similarity drops. PROBLEM IT SOLVED: Discovers implicit topic shifts invisible to syntax-based methods. IMPROVEMENT: 30-50% better on documents without clear structural markers. TRADEOFF: Requires inference at chunking time (slower, costs more).`,
    group: "Chunking Masterclass — Level 5: AI-Powered",
    difficulty: "hard",
    xpReward: 125,
    prerequisites: ["sentence-based-chunking"],
    starterCode: `from typing import List, Tuple
import re

def semantic_chunk(
    text: str,
    similarity_threshold: float = 0.5,
    min_chunk_size: int = 50
) -> List[str]:
    """
    Chunk based on semantic similarity between sentences.
    
    First Principles:
    - Topics don't always change at structural boundaries
    - Two consecutive sentences might be about completely different things
    - Embeddings capture MEANING, not just syntax
    
    Algorithm:
    1. Split into sentences
    2. Embed each sentence (we'll simulate with word overlap)
    3. Calculate similarity between consecutive sentences
    4. Place chunk boundary where similarity drops below threshold
    
    Example:
    "The cat sat on the mat. Dogs are loyal pets."
    - Sentence 1 ↔ Sentence 2 similarity is LOW
    - This should be a chunk boundary!
    
    Args:
        text: Input text
        similarity_threshold: Break if similarity < this value
        min_chunk_size: Minimum characters per chunk (merge small ones)
        
    Returns:
        List of semantically coherent chunks
    """
    # TODO: implement (using word overlap as simulated "embedding similarity")
    raise NotImplementedError
`,
    testCode: `# Topic change should create boundary
text1 = "Machine learning uses algorithms. Neural networks are deep. The weather today is sunny. Rain is expected tomorrow."
chunks1 = semantic_chunk(text1, similarity_threshold=0.3)
# ML/weather should be in different chunks if threshold is reasonable
assert len(chunks1) >= 2

# Coherent text should stay together
text2 = "Python is a programming language. Python has simple syntax. Python is popular for data science."
chunks2 = semantic_chunk(text2, similarity_threshold=0.2)
# All about Python - should be one or few chunks
assert len(chunks2) <= 2

# Single sentence
text3 = "Just one sentence here."
chunks3 = semantic_chunk(text3)
assert len(chunks3) == 1

print("All tests passed!")`,
    hints: [
      "Split by sentences first",
      "For each pair, calculate Jaccard similarity of word sets",
      "When similarity drops below threshold, start new chunk",
      "Merge chunks smaller than min_chunk_size",
    ],
    solution: `from typing import List, Set
import re

def semantic_chunk(
    text: str,
    similarity_threshold: float = 0.5,
    min_chunk_size: int = 50
) -> List[str]:
    if not text:
        return []
    
    # Split into sentences
    sentences = re.split(r'(?<=[.!?])\\s+', text.strip())
    sentences = [s.strip() for s in sentences if s.strip()]
    
    if len(sentences) <= 1:
        return [text.strip()] if text.strip() else []
    
    def get_words(s: str) -> Set[str]:
        return set(re.findall(r'[a-z]+', s.lower()))
    
    def jaccard_similarity(s1: str, s2: str) -> float:
        words1 = get_words(s1)
        words2 = get_words(s2)
        if not words1 or not words2:
            return 0.0
        intersection = len(words1 & words2)
        union = len(words1 | words2)
        return intersection / union if union > 0 else 0.0
    
    # Find boundaries
    chunks = []
    current_chunk = [sentences[0]]
    
    for i in range(1, len(sentences)):
        similarity = jaccard_similarity(sentences[i-1], sentences[i])
        
        if similarity < similarity_threshold:
            # Topic change - start new chunk
            chunk_text = " ".join(current_chunk)
            chunks.append(chunk_text)
            current_chunk = [sentences[i]]
        else:
            current_chunk.append(sentences[i])
    
    # Add final chunk
    if current_chunk:
        chunks.append(" ".join(current_chunk))
    
    # Merge small chunks
    merged = []
    for chunk in chunks:
        if merged and len(merged[-1]) < min_chunk_size:
            merged[-1] = merged[-1] + " " + chunk
        else:
            merged.append(chunk)
    
    return merged
`,
    timeEstimate: { minutes: 45, label: "45-60 min" },
    realWorld: {
      description: "LlamaIndex's SemanticSplitter, Anthropic's research on contextual chunking. Used when documents lack clear structure.",
      companies: ["LlamaIndex", "Anthropic", "Jina AI"],
      useCases: ["Unstructured documents", "Transcripts", "Social media content"],
    },
    relatedPlaybooks: ["rag-techniques-encyclopedia", "document-parsing-guide"],
  },

  // ============================================================================
  // LEVEL 9: HIERARCHICAL CHUNKING (Multi-Resolution)
  // ============================================================================
  {
    slug: "hierarchical-chunking",
    title: "Hierarchical Chunking: Multi-Resolution Retrieval",
    description:
      `WHY INTRODUCED: Different queries need different granularity. "What is RAG?" → need a paragraph. "What's the exact API rate limit?" → need a sentence. INSIGHT: Create chunks at MULTIPLE levels and link them. PROBLEM IT SOLVED: One index serves both broad and specific queries. IMPROVEMENT: Enables RAPTOR-style summarization trees and parent-child retrieval.`,
    group: "Chunking Masterclass — Level 5: AI-Powered",
    difficulty: "hard",
    xpReward: 150,
    prerequisites: ["section-based-chunking", "recursive-chunking"],
    starterCode: `from typing import List, Dict, Any
import uuid

def hierarchical_chunk(
    text: str,
    levels: List[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Create a hierarchy of chunks at multiple resolutions.
    
    First Principles:
    - Queries have different specificity levels
    - "Explain machine learning" → big chunk answer
    - "What's the learning rate?" → small chunk answer
    - ONE index can't serve both optimally... unless we have MULTIPLE resolutions
    
    Structure created:
    Document
    ├── Section 1 (summary)
    │   ├── Paragraph 1.1
    │   │   ├── Sentence 1.1.1
    │   │   └── Sentence 1.1.2
    │   └── Paragraph 1.2
    └── Section 2 (summary)
        └── ...
    
    Args:
        text: Input text
        levels: Config for each level. Default:
                [{"name": "document", "size": 2000},
                 {"name": "section", "size": 500},
                 {"name": "paragraph", "size": 150}]
                 
    Returns:
        Dict with structure:
        {
            "id": "...",
            "level": "document",
            "text": "...",
            "children": [...],  # child chunks
            "parent_id": None or "..."
        }
    """
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `text = \"\"\"# Introduction

This is an introduction paragraph with some content. It explains the basics.

More details in this paragraph about the topic.

# Methods

The methodology section describes approaches. We use several techniques.

Each technique has specific steps to follow.\"\"\"

result = hierarchical_chunk(text)

# Should have root document
assert result['level'] == 'document'
assert 'text' in result
assert 'children' in result

# Should have children at lower levels
assert len(result['children']) > 0
for child in result['children']:
    assert 'id' in child
    assert 'level' in child
    assert 'parent_id' in child
    assert child['parent_id'] == result['id']

# Check parent-child links
def count_nodes(node):
    return 1 + sum(count_nodes(c) for c in node.get('children', []))

total_nodes = count_nodes(result)
assert total_nodes >= 3  # At least doc + 2 sections

print("All tests passed!")`,
    hints: [
      "Use UUIDs to create unique IDs for each node",
      "Split recursively: doc → sections → paragraphs → sentences",
      "Each child stores its parent_id for upward traversal",
      "Store the full text AND children at each level",
    ],
    solution: `from typing import List, Dict, Any
import uuid
import re

def hierarchical_chunk(
    text: str,
    levels: List[Dict[str, Any]] = None
) -> Dict[str, Any]:
    if levels is None:
        levels = [
            {"name": "document", "separator": None},
            {"name": "section", "separator": r"\\n#+ "},
            {"name": "paragraph", "separator": r"\\n\\n"},
            {"name": "sentence", "separator": r"(?<=[.!?])\\s+"}
        ]
    
    def create_node(text: str, level: str, parent_id: str = None) -> Dict[str, Any]:
        return {
            "id": str(uuid.uuid4())[:8],
            "level": level,
            "text": text.strip(),
            "children": [],
            "parent_id": parent_id
        }
    
    def split_recursive(text: str, level_idx: int, parent_id: str = None) -> Dict[str, Any]:
        if level_idx >= len(levels) or not text.strip():
            return None
        
        level_config = levels[level_idx]
        node = create_node(text, level_config["name"], parent_id)
        
        # Try to split for children
        if level_idx + 1 < len(levels):
            next_level = levels[level_idx + 1]
            separator = next_level.get("separator")
            
            if separator:
                parts = re.split(separator, text)
                parts = [p.strip() for p in parts if p.strip()]
                
                for part in parts:
                    child = split_recursive(part, level_idx + 1, node["id"])
                    if child:
                        node["children"].append(child)
        
        return node
    
    return split_recursive(text, 0)
`,
    timeEstimate: { minutes: 50, label: "50-60 min" },
    realWorld: {
      description: "Powers RAPTOR (recursive summarization), LlamaIndex's auto-merging retriever, and Google's hierarchical document understanding.",
      companies: ["Google Research", "LlamaIndex", "Stanford NLP"],
      useCases: ["Multi-resolution search", "Document summarization", "Knowledge graphs"],
    },
    relatedPlaybooks: ["rag-techniques-encyclopedia", "learning-paths"],
  },

  // ============================================================================
  // LEVEL 10: METADATA-AWARE CHUNKING (Production Context)
  // ============================================================================
  {
    slug: "metadata-aware-chunking",
    title: "Metadata-Aware Chunking: Production Context",
    description:
      `WHY INTRODUCED: Chunks exist in CONTEXT - they have sources, authors, dates, topics, permissions. INSIGHT: Losing metadata = losing the ability to filter, cite, and trust. PROBLEM IT SOLVED: Every chunk is traceable and filterable. IMPROVEMENT: Enables citations, time-filtering, access control, and provenance tracking.`,
    group: "Chunking Masterclass — Level 6: Production",
    difficulty: "hard",
    xpReward: 125,
    prerequisites: ["section-based-chunking"],
    starterCode: `from typing import List, Dict, Any
from datetime import datetime
import hashlib

def metadata_aware_chunk(
    text: str,
    source_metadata: Dict[str, Any],
    chunk_size: int = 500
) -> List[Dict[str, Any]]:
    """
    Chunk with rich metadata for production RAG.
    
    First Principles:
    - Chunks don't exist in vacuum - they come from documents
    - Documents have: author, date, source, permissions, topics
    - Users need: citations, filtering, access control
    
    Production requirements:
    1. SOURCE TRACKING: Where did this chunk come from?
    2. CITATIONS: Can we generate "Source: Doc X, Page Y"?
    3. FILTERING: Can we search only docs from 2024?
    4. ACCESS CONTROL: Does this user have permission?
    5. DEDUPLICATION: Same content = same chunk ID
    
    Args:
        text: Input text
        source_metadata: Dict with at minimum:
            - 'source_id': Unique document identifier
            - 'source_name': Human-readable name
            - 'author': Author name (optional)
            - 'created_at': Creation date (optional)
            - 'access_level': 'public' | 'private' | 'restricted'
        chunk_size: Target chunk size
        
    Returns:
        List of dicts with:
        - 'chunk_id': Deterministic hash (same content = same ID)
        - 'text': Chunk content
        - 'source_id': Parent document ID
        - 'source_name': Human-readable source
        - 'chunk_index': Position in document
        - 'char_start': Character offset start
        - 'char_end': Character offset end
        - 'created_at': Timestamp
        - 'access_level': Permission level
        - 'content_hash': For deduplication
    """
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `text = "First paragraph of content here. Second sentence in first chunk. Third sentence continues. Fourth sentence starts new chunk probably. Fifth sentence. Sixth sentence ends."

metadata = {
    'source_id': 'doc_123',
    'source_name': 'User Manual v2.0',
    'author': 'Jane Doe',
    'created_at': '2024-01-15',
    'access_level': 'public'
}

chunks = metadata_aware_chunk(text, metadata, chunk_size=100)

# Basic structure checks
assert len(chunks) >= 2
for chunk in chunks:
    assert 'chunk_id' in chunk
    assert 'text' in chunk
    assert 'source_id' in chunk
    assert chunk['source_id'] == 'doc_123'
    assert 'chunk_index' in chunk
    assert 'char_start' in chunk
    assert 'char_end' in chunk
    assert 'content_hash' in chunk

# Chunk IDs should be deterministic
chunks2 = metadata_aware_chunk(text, metadata, chunk_size=100)
assert chunks[0]['chunk_id'] == chunks2[0]['chunk_id']

# Chunk indices should be ordered
indices = [c['chunk_index'] for c in chunks]
assert indices == sorted(indices)

# Character offsets should be consistent
for chunk in chunks:
    assert text[chunk['char_start']:chunk['char_end']] in chunk['text'] or chunk['text'] in text

print("All tests passed!")`,
    hints: [
      "Use hashlib.sha256 for deterministic chunk_id and content_hash",
      "Track char_start and char_end as you iterate",
      "Include source_id in the chunk_id hash for uniqueness across docs",
      "Copy relevant metadata to each chunk",
    ],
    solution: `from typing import List, Dict, Any
from datetime import datetime
import hashlib

def metadata_aware_chunk(
    text: str,
    source_metadata: Dict[str, Any],
    chunk_size: int = 500
) -> List[Dict[str, Any]]:
    if not text:
        return []
    
    chunks = []
    char_start = 0
    chunk_index = 0
    
    while char_start < len(text):
        char_end = min(char_start + chunk_size, len(text))
        
        # Try to break at sentence boundary
        if char_end < len(text):
            last_period = text.rfind('. ', char_start, char_end)
            if last_period > char_start + chunk_size // 2:
                char_end = last_period + 1
        
        chunk_text = text[char_start:char_end].strip()
        
        if chunk_text:
            # Generate deterministic IDs
            content_hash = hashlib.sha256(chunk_text.encode()).hexdigest()[:12]
            chunk_id_input = f"{source_metadata.get('source_id', 'unknown')}:{chunk_index}:{content_hash}"
            chunk_id = hashlib.sha256(chunk_id_input.encode()).hexdigest()[:16]
            
            chunks.append({
                'chunk_id': chunk_id,
                'text': chunk_text,
                'source_id': source_metadata.get('source_id'),
                'source_name': source_metadata.get('source_name'),
                'author': source_metadata.get('author'),
                'chunk_index': chunk_index,
                'char_start': char_start,
                'char_end': char_end,
                'created_at': source_metadata.get('created_at', datetime.now().isoformat()),
                'access_level': source_metadata.get('access_level', 'public'),
                'content_hash': content_hash
            })
            chunk_index += 1
        
        char_start = char_end
    
    return chunks
`,
    timeEstimate: { minutes: 40, label: "40-50 min" },
    realWorld: {
      description: "Essential for enterprise RAG. Enables 'Show Source' buttons, time-filtered search, and role-based access control.",
      companies: ["Glean", "Notion", "Confluence", "SharePoint"],
      useCases: ["Enterprise search", "Compliance RAG", "Citation generation"],
    },
    relatedPlaybooks: ["production-deployment-checklist", "document-parsing-guide"],
  },
];
