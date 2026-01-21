"""
Document chunking with stable IDs and metadata.
"""

import hashlib
import re
from typing import Optional


def generate_chunk_id(content: str, source: str, index: int) -> str:
    """
    Generate a stable, reproducible chunk ID.
    
    Format: {source_hash}_{content_hash}_{index}
    
    This ensures:
    - Same content always gets same ID (reproducible)
    - Re-ingestion doesn't create duplicates
    - IDs are traceable to source
    """
    source_hash = hashlib.md5(source.encode()).hexdigest()[:8]
    content_hash = hashlib.md5(content.encode()).hexdigest()[:8]
    return f"{source_hash}_{content_hash}_{index:04d}"


def chunk_document(
    content: str,
    source: str,
    chunk_size: int = 512,
    overlap: int = 50,
    metadata: Optional[dict] = None,
) -> list[dict]:
    """
    Chunk a document using recursive character splitting.
    
    Args:
        content: Document text
        source: Source identifier (filename, URL, etc.)
        chunk_size: Target chunk size in characters (not tokens for simplicity)
        overlap: Overlap between chunks
        metadata: Additional metadata to attach to each chunk
    
    Returns:
        List of chunk dictionaries with text, id, and metadata
    """
    if not content.strip():
        return []
    
    # Recursive separators (most to least specific)
    separators = [
        "\n\n",      # Paragraphs
        "\n",        # Lines
        ". ",        # Sentences
        ", ",        # Clauses
        " ",         # Words
        "",          # Characters (fallback)
    ]
    
    chunks = _recursive_split(content, separators, chunk_size, overlap)
    
    result = []
    for i, chunk_text in enumerate(chunks):
        chunk_id = generate_chunk_id(chunk_text, source, i)
        result.append({
            "id": chunk_id,
            "text": chunk_text,
            "source": source,
            "index": i,
            "metadata": metadata or {},
        })
    
    return result


def _recursive_split(
    text: str,
    separators: list[str],
    chunk_size: int,
    overlap: int,
) -> list[str]:
    """Recursively split text using the most appropriate separator."""
    if len(text) <= chunk_size:
        return [text.strip()] if text.strip() else []
    
    # Find the best separator that produces chunks
    for sep in separators:
        if sep in text:
            splits = text.split(sep)
            chunks = []
            current_chunk = ""
            
            for split in splits:
                test_chunk = current_chunk + (sep if current_chunk else "") + split
                
                if len(test_chunk) <= chunk_size:
                    current_chunk = test_chunk
                else:
                    if current_chunk:
                        chunks.append(current_chunk.strip())
                    
                    # Handle splits larger than chunk_size
                    if len(split) > chunk_size:
                        # Recurse with next separator
                        sub_chunks = _recursive_split(
                            split,
                            separators[separators.index(sep) + 1:],
                            chunk_size,
                            overlap,
                        )
                        chunks.extend(sub_chunks)
                        current_chunk = ""
                    else:
                        current_chunk = split
            
            if current_chunk.strip():
                chunks.append(current_chunk.strip())
            
            # Add overlap between chunks
            if overlap > 0 and len(chunks) > 1:
                chunks = _add_overlap(chunks, overlap)
            
            return chunks
    
    # Fallback: character-level splitting
    return [text[i:i + chunk_size] for i in range(0, len(text), chunk_size - overlap)]


def _add_overlap(chunks: list[str], overlap: int) -> list[str]:
    """Add overlap from previous chunk to each chunk."""
    result = [chunks[0]]
    for i in range(1, len(chunks)):
        prev_suffix = chunks[i - 1][-overlap:] if len(chunks[i - 1]) >= overlap else chunks[i - 1]
        result.append(prev_suffix + " " + chunks[i])
    return result


# ─────────────────────────────────────────────────────────────
# Specialized chunkers
# ─────────────────────────────────────────────────────────────


def chunk_markdown(content: str, source: str, metadata: Optional[dict] = None) -> list[dict]:
    """
    Chunk markdown with header awareness.
    Preserves section context by including headers in chunks.
    """
    # Split by headers
    header_pattern = r'^(#{1,6})\s+(.+)$'
    sections = []
    current_header = ""
    current_content = []
    
    for line in content.split("\n"):
        match = re.match(header_pattern, line)
        if match:
            if current_content:
                sections.append({
                    "header": current_header,
                    "content": "\n".join(current_content),
                })
            current_header = line
            current_content = []
        else:
            current_content.append(line)
    
    if current_content:
        sections.append({
            "header": current_header,
            "content": "\n".join(current_content),
        })
    
    # Chunk each section, prepending header for context
    all_chunks = []
    for section in sections:
        section_text = f"{section['header']}\n\n{section['content']}" if section['header'] else section['content']
        chunks = chunk_document(
            section_text,
            source,
            metadata={**(metadata or {}), "section_header": section['header']},
        )
        all_chunks.extend(chunks)
    
    return all_chunks


def chunk_code(content: str, source: str, language: str = "python", metadata: Optional[dict] = None) -> list[dict]:
    """
    Chunk code files by logical boundaries (functions, classes).
    """
    # Simplified: split by function/class definitions
    if language == "python":
        pattern = r'^(def |class |async def )'
    elif language in ["javascript", "typescript"]:
        pattern = r'^(function |class |const .* = |export )'
    else:
        pattern = r'^(function |class |def )'
    
    blocks = re.split(f'(?m)(?={pattern})', content)
    
    chunks = []
    for i, block in enumerate(blocks):
        if block.strip():
            chunk_id = generate_chunk_id(block, source, i)
            chunks.append({
                "id": chunk_id,
                "text": block.strip(),
                "source": source,
                "index": i,
                "metadata": {**(metadata or {}), "language": language},
            })
    
    return chunks
