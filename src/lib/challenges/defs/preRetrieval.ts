import type { RawChallenge } from "@/lib/challenges/types";

export const PRE_RETRIEVAL_CHALLENGES: RawChallenge[] = [
  {
    slug: "simple-chunking",
    title: "Simple Chunking",
    description:
      "Split text into fixed-size chunks (by characters) — your first chunker. Why: Large docs don't fit in context. Solves: Enables processing arbitrary length documents.",
    group: "Phase 1 — The Data Layer (Ingestion & Indexing)",
    difficulty: "easy",
    xpReward: 25,
    starterCode: `from typing import List

def chunk_text(text: str, chunk_size: int) -> List[str]:
    \"\"\"
    Split text into chunks of length <= chunk_size.

    Rules:
    - chunk_size must be > 0, else raise ValueError
    - preserve original text exactly (no trimming)
    - return [] for empty text
    \"\"\"
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `assert chunk_text("", 5) == []
assert chunk_text("hello", 5) == ["hello"]
assert chunk_text("hello!", 5) == ["hello", "!"]
assert chunk_text("abcdefghij", 3) == ["abc", "def", "ghi", "j"]
# Unicode Characters
assert chunk_text("こんにちは世界", 2) == ["こん", "にち", "は世", "界"]

try:
    chunk_text("x", 0)
    raise AssertionError("Expected ValueError for chunk_size <= 0")
except ValueError:
    pass

print("All tests passed!")`,
    hints: [
      "Walk the string in steps of chunk_size: `text[i:i+chunk_size]`.",
      "Validate `chunk_size > 0` first.",
      "Since this is Python, slicing `[start:end]` handles out-of-bounds `end` automatically.",
    ],
    solution: `from typing import List

def chunk_text(text: str, chunk_size: int) -> List[str]:
    if chunk_size <= 0:
        raise ValueError("chunk_size must be > 0")
    if not text:
        return []
    
    chunks = []
    for i in range(0, len(text), chunk_size):
        chunks.append(text[i:i + chunk_size])
    return chunks
`,
    timeEstimate: { minutes: 10, label: "10-15 min" },
    realWorld: {
        description: "The baseline for all RAG systems. While simple, it's often the most stable starting point for long-form data like legal contracts or research papers.",
        companies: ["Evernote", "Zoom"],
        useCases: ["Summarization Preprocessing", "Large Document Ingestion"],
    },
    relatedPlaybooks: ["rag-techniques-encyclopedia", "chunking-strategies"],
  },
  {
    slug: "overlap-chunking",
    title: "Overlap Chunking",
    description:
      "Chunk with overlap to reduce boundary loss (common in production RAG). Why: Fixed boundaries cut context in half. Solves: Preserves semantic meaning across cut points.",
    group: "Phase 1 — The Data Layer (Ingestion & Indexing)",
    difficulty: "easy",
    xpReward: 25,
    prerequisites: ["simple-chunking"],
    starterCode: `from typing import List

def chunk_text_overlap(text: str, chunk_size: int, overlap: int) -> List[str]:
    \"\"\"
    Split text into chunks with overlap.

    Rules:
    - chunk_size must be > 0
    - overlap must be >= 0 and < chunk_size
    - return [] for empty text
    \"\"\"
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `assert chunk_text_overlap("", 5, 1) == []
assert chunk_text_overlap("abcdef", 3, 1) == ["abc", "cde", "ef"]
assert chunk_text_overlap("abcdefgh", 4, 2) == ["abcd", "cdef", "efgh"]

try:
    chunk_text_overlap("x", 3, 3)
    raise AssertionError("Expected ValueError for overlap >= chunk_size")
except ValueError:
    pass

try:
    chunk_text_overlap("x", 0, 0)
    raise AssertionError("Expected ValueError for chunk_size <= 0")
except ValueError:
    pass

print("All tests passed!")`,
    hints: [
      "Step size is `chunk_size - overlap`.",
      "Generate chunks starting at `i=0`, then `i+=step` until you reach the end of the text.",
      "Make sure you handle the last chunk correctly even if it's shorter than `chunk_size`.",
    ],
    solution: `from typing import List

def chunk_text_overlap(text: str, chunk_size: int, overlap: int) -> List[str]:
    if chunk_size <= 0:
        raise ValueError("chunk_size must be > 0")
    if overlap < 0 or overlap >= chunk_size:
        raise ValueError("overlap must be >= 0 and < chunk_size")
    if not text:
        return []
    
    chunks = []
    step = chunk_size - overlap
    i = 0
    while i < len(text):
        chunks.append(text[i:i + chunk_size])
        i += step
    return chunks
`,
    timeEstimate: { minutes: 15, label: "15-20 min" },
    realWorld: {
      description: "Standard practice in every production RAG system (LangChain, LlamaIndex default). Overlap prevents 'context severance' where a key sentence is split in half at the boundary.",
      companies: ["LangChain", "LlamaIndex", "Cohere"],
      useCases: ["Document Indexing", "Financial Report Processing"],
    },
    relatedPlaybooks: ["rag-techniques-encyclopedia", "document-parsing-guide"],
  },
  {
    slug: "metadata-tagging",
    title: "Metadata Tagging",
    description:
      "Attach structured metadata to chunks (source, page, timestamp). Why: Production RAG needs filtering (e.g., 'only search PDFs from 2023'). Solves: Enables complex filtering logic downstream.",
    group: "Phase 1 — The Data Layer (Ingestion & Indexing)",
    difficulty: "medium",
    xpReward: 50,
    prerequisites: ["overlap-chunking"],
    starterCode: `from typing import Any, Dict, List, Tuple

Chunk = Tuple[str, Dict[str, Any]]

def tag_chunks(chunks: List[str], source: str) -> List[Chunk]:
    \"\"\"
    Turn a list of chunk strings into (chunk, metadata) tuples.

    Metadata requirements:
    - include "source" (string)
    - include "chunk_index" (int)
    \"\"\"
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `chunks = ["a", "b", "c"]
tagged = tag_chunks(chunks, source="doc.md")
assert len(tagged) == 3
assert tagged[0][0] == "a"
assert tagged[0][1]["source"] == "doc.md"
assert tagged[2][1]["chunk_index"] == 2

print("All tests passed!")`,
    hints: [
      "Use enumerate(chunks).",
      "Return [(chunk, {\"source\": source, \"chunk_index\": i}), ...].",
    ],
    solution: `from typing import Any, Dict, List, Tuple

Chunk = Tuple[str, Dict[str, Any]]

def tag_chunks(chunks: List[str], source: str) -> List[Chunk]:
    result = []
    for i, chunk in enumerate(chunks):
        metadata = {
            "source": source,
            "chunk_index": i
        }
        result.append((chunk, metadata))
    return result
`,
    timeEstimate: { minutes: 10, label: "10-15 min" },
    realWorld: {
        description: "Metadata is the 'connective tissue' of RAG. It enables citations, which are the #1 requirement for building trust in AI-generated answers.",
        companies: ["Wikipedia", "ArXiv"],
        useCases: ["Verified Answer Generation", "Filtered Search by Document Type"],
    },
    relatedPlaybooks: ["document-parsing-guide", "production-deployment-checklist"],
  },
  {
    slug: "stable-chunk-ids",
    title: "Stable Chunk IDs (Traceability)",
    description:
      "Create stable chunk IDs + hashes to enable citations, dedup, and safe re-indexing. Why: Random IDs break citations on re-index. Solves: Ensures URLs and citations remain valid after data updates.",
    group: "Phase 1 — The Data Layer (Ingestion & Indexing)",
    difficulty: "medium",
    xpReward: 75,
    prerequisites: ["metadata-tagging"],
    starterCode: `from typing import Any, Dict, List
import hashlib

def stable_chunk_id(doc_id: str, chunk_index: int, chunk_text: str) -> str:
    \"\"\"
    Return a deterministic chunk_id for traceability.

    Requirements:
    - Must be deterministic across runs (do NOT use Python's built-in hash())
    - Must include doc_id and chunk_index in the returned string
    - Must change if chunk_text changes
    \"\"\"
    # TODO: implement
    raise NotImplementedError

def chunk_with_overlap(text: str, chunk_size: int, overlap: int) -> List[str]:
    \"\"\"
    Split text into chunks with overlap (character-based).

    Rules:
    - chunk_size > 0
    - 0 <= overlap < chunk_size
    - return [] for empty text
    \"\"\"
    # TODO: implement
    raise NotImplementedError

def chunk_and_tag(text: str, doc_id: str, chunk_size: int, overlap: int) -> List[Dict[str, Any]]:
    \"\"\"
    Offline step: chunk the document and attach production-style metadata.

    Return a list of dicts with keys:
    - doc_id: str
    - chunk_index: int
    - chunk_id: str
    - content_sha1: str (full hex digest of chunk_text)
    - text: str (the chunk text)
    \"\"\"
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `import hashlib

text = "abcdefghijklmnopqrstuvwxyz"
out1 = chunk_and_tag(text, doc_id="docA", chunk_size=10, overlap=2)
out2 = chunk_and_tag(text, doc_id="docA", chunk_size=10, overlap=2)
assert out1 == out2, "chunk_and_tag must be deterministic"
assert len(out1) == 3

first = out1[0]
assert first["doc_id"] == "docA"
assert first["chunk_index"] == 0
assert first["chunk_id"].startswith("docA:"), "chunk_id should include doc_id prefix"
assert ":0:" in first["chunk_id"], "chunk_id should include chunk_index"
assert first["content_sha1"] == hashlib.sha1(first["text"].encode("utf-8")).hexdigest()

# doc_id changes should change chunk_id even if chunk text is identical
out_other_doc = chunk_and_tag(text, doc_id="docB", chunk_size=10, overlap=2)
assert out_other_doc[0]["text"] == out1[0]["text"]
assert out_other_doc[0]["chunk_id"] != out1[0]["chunk_id"]

print("All tests passed!")`,
    hints: [
      "Use hashlib.sha1 to build stable hashes (encode as UTF-8).",
      "A good chunk_id format: f\"{doc_id}:{chunk_index}:{sha1(chunk_text)[:12]}\".",
      "For overlap chunking: step = chunk_size - overlap, then slice text[i:i+chunk_size].",
    ],
    solution: `from typing import Any, Dict, List
import hashlib

def stable_chunk_id(doc_id: str, chunk_index: int, chunk_text: str) -> str:
    text_hash = hashlib.sha1(chunk_text.encode("utf-8")).hexdigest()[:12]
    return f"{doc_id}:{chunk_index}:{text_hash}"

def chunk_with_overlap(text: str, chunk_size: int, overlap: int) -> List[str]:
    if chunk_size <= 0:
        raise ValueError("chunk_size must be > 0")
    if overlap < 0 or overlap >= chunk_size:
        raise ValueError("overlap must be >= 0 and < chunk_size")
    if not text:
        return []
    
    chunks = []
    step = chunk_size - overlap
    i = 0
    while i < len(text):
        chunks.append(text[i:i + chunk_size])
        i += step
    return chunks

def chunk_and_tag(text: str, doc_id: str, chunk_size: int, overlap: int) -> List[Dict[str, Any]]:
    chunks = chunk_with_overlap(text, chunk_size, overlap)
    result = []
    for i, chunk_text in enumerate(chunks):
        result.append({
            "doc_id": doc_id,
            "chunk_index": i,
            "chunk_id": stable_chunk_id(doc_id, i, chunk_text),
            "content_sha1": hashlib.sha1(chunk_text.encode("utf-8")).hexdigest(),
            "text": chunk_text
        })
    return result
`,
    timeEstimate: { minutes: 25, label: "25-35 min" },
    realWorld: {
      description: "Crucial for 'idempotent indexing'. Without stable IDs, re-running your pipeline creates duplicates, doubling your vector bill and polluting search results.",
      companies: ["Notion", "Slack", "Glean"],
      useCases: ["Enterprise Search", "Incremental Updates", "Citation Stability"],
    },
    relatedPlaybooks: ["production-deployment-checklist", "document-parsing-guide"],
  },
  {
    slug: "markdown-header-chunking",
    title: "Markdown Header Chunking",
    description:
      "Chunk Markdown by section headers (#/##/###) and attach hierarchical metadata (production-grade). Why: Semantic boundaries (headers) matter more than character counts. Solves: Keeps related content (sections) together, improving retrieval relevance.",
    group: "Phase 1 — The Data Layer (Ingestion & Indexing)",
    difficulty: "medium",
    xpReward: 75,
    starterCode: `from typing import Any, Dict, List, Optional, Tuple

def _parse_heading(line: str) -> Optional[Tuple[int, str]]:
    \"\"\"
    If line is a markdown heading like '# Title', '## Section', '### Subsection',
    return (level, title). Otherwise return None.
    \"\"\"
    s = line.rstrip("\\n")
    if s.startswith("# "):
        return (1, s[2:].strip())
    if s.startswith("## "):
        return (2, s[3:].strip())
    if s.startswith("### "):
        return (3, s[4:].strip())
    return None

def chunk_markdown(md: str) -> List[Dict[str, Any]]:
    \"\"\"
    Split markdown into chunks starting at each heading (#, ##, ###).

    Return list of dicts with keys:
    - h1: Optional[str]
    - h2: Optional[str]
    - h3: Optional[str]
    - text: str  (must include the heading line at the top of the chunk)

    Rules:
    - Preserve original lines inside each chunk (no trimming/reformatting).
    - If there is content before the first heading, put it in a chunk with h1/h2/h3 = None.
    - Do NOT emit empty chunks.
    \"\"\"
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `md = (
  "# Title\\n"
  "intro line 1\\n"
  "intro line 2\\n"
  "\\n"
  "## Install\\n"
  "Step 1\\n"
  "\\n"
  "## Usage\\n"
  "Use it\\n"
  "\\n"
  "### Advanced\\n"
  "More\\n"
)

chunks = chunk_markdown(md)
assert len(chunks) == 4

assert chunks[0]["h1"] == "Title"
assert chunks[0]["h2"] is None
assert chunks[0]["h3"] is None
assert chunks[0]["text"].startswith("# Title\\n")
assert "intro line 2" in chunks[0]["text"]

assert chunks[1]["h1"] == "Title"
assert chunks[1]["h2"] == "Install"
assert chunks[1]["h3"] is None
assert chunks[1]["text"].startswith("## Install\\n")

assert chunks[2]["h2"] == "Usage"
assert chunks[2]["h3"] is None
assert chunks[2]["text"].startswith("## Usage\\n")

assert chunks[3]["h2"] == "Usage"
assert chunks[3]["h3"] == "Advanced"
assert chunks[3]["text"].startswith("### Advanced\\n")

print("All tests passed!")`,
    hints: [
      "Track the current heading context (h1/h2/h3) as you scan lines.",
      "Whenever you see a new heading, flush the previous chunk if it has content.",
      "Level rules: a new # resets h2/h3; a new ## resets h3; ### only sets h3.",
    ],
    solution: `from typing import Any, Dict, List, Optional, Tuple

def _parse_heading(line: str) -> Optional[Tuple[int, str]]:
    s = line.rstrip("\\n")
    if s.startswith("# "):
        return (1, s[2:].strip())
    if s.startswith("## "):
        return (2, s[3:].strip())
    if s.startswith("### "):
        return (3, s[4:].strip())
    return None

def chunk_markdown(md: str) -> List[Dict[str, Any]]:
    lines = md.split("\\n")
    chunks = []
    
    current = {"h1": None, "h2": None, "h3": None, "text_lines": []}
    
    for line in lines:
        heading = _parse_heading(line)
        
        if heading:
            level, title = heading
            # Flush previous chunk
            if current["text_lines"]:
                chunks.append({
                    "h1": current["h1"],
                    "h2": current["h2"],
                    "h3": current["h3"],
                    "text": "\\n".join(current["text_lines"])
                })
            
            # Update heading context
            if level == 1:
                current = {"h1": title, "h2": None, "h3": None, "text_lines": [line]}
            elif level == 2:
                current["h2"] = title
                current["h3"] = None
                current["text_lines"] = [line]
            else:
                current["h3"] = title
                current["text_lines"] = [line]
        else:
            current["text_lines"].append(line)
    
    # Flush last chunk
    if current["text_lines"]:
        chunks.append({
            "h1": current["h1"],
            "h2": current["h2"],
            "h3": current["h3"],
            "text": "\\n".join(current["text_lines"])
        })
    
    return chunks
`,
    timeEstimate: { minutes: 35, label: "35-45 min" },
    realWorld: {
        description: "Standard for developer tools and documentation. By respecting structural headers, you ensure that 'Code Snippets' stay paired with their 'Instructions', preventing out-of-context retrieval.",
        companies: ["GitHub", "Stripe", "DocuSign"],
        useCases: ["Documentation QA", "Internal Knowledge Base Search"],
    },
    relatedPlaybooks: ["document-parsing-guide", "rag-techniques-encyclopedia"],
  },
  {
    slug: "simhash-near-dedup",
    title: "Near De-duplication (SimHash)",
    description:
      "Detect near-duplicate chunks (same content, different punctuation) to reduce context rot. Why: Duplicate content wastes context space. Solves: Removes redundant information that might crowd out unique, relevant facts.",
    group: "Phase 1 — The Data Layer (Ingestion & Indexing)",
    difficulty: "medium",
    xpReward: 75,
    starterCode: `from typing import List
import hashlib
import re

def _tokens(text: str) -> List[str]:
    return re.findall(r"[a-z0-9]+", text.lower())

def _token_hash64(token: str) -> int:
    # Stable 64-bit hash from md5 (take first 16 hex chars)
    h = hashlib.md5(token.encode("utf-8")).hexdigest()[:16]
    return int(h, 16)

def simhash64(text: str) -> int:
    \"\"\"Return a 64-bit SimHash for the tokenized text.\"\"\"
    # TODO: implement
    raise NotImplementedError

def hamming_distance(a: int, b: int) -> int:
    \"\"\"Return Hamming distance between two 64-bit integers.\"\"\"
    # TODO: implement
    raise NotImplementedError

def dedup_near(texts: List[str], max_hamming: int = 3) -> List[str]:
    \"\"\"
    Keep the first occurrence of each near-duplicate text.

    Drop a text if its simhash is within max_hamming bits of ANY previously kept text.
    Preserve order of kept texts.
    \"\"\"
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `t1 = "RAG is retrieval augmented generation"
t2 = "RAG is retrieval-augmented generation!"
t3 = "GraphRAG uses graphs for multi-hop retrieval"

h1 = simhash64(t1)
h2 = simhash64(t2)
assert h1 == h2, "Tokenization should make these equivalent"
assert hamming_distance(h1, h2) == 0

kept = dedup_near([t1, t2, t3], max_hamming=0)
assert kept == [t1, t3]

try:
  dedup_near([t1], max_hamming=-1)
  raise AssertionError("Expected ValueError for negative max_hamming")
except ValueError:
  pass

print("All tests passed!")`,
    hints: [
      "For each token hash bit, add +1 if bit is 1 else -1 (vector of 64 ints).",
      "Final bit is 1 if accumulator > 0 else 0.",
      "Hamming distance can be computed by counting set bits in (a ^ b).",
    ],
    realWorld: {
        description: "Used by Google and Apache Solr for 'deduplication at scale'. SimHash allows you to find documents that are 90% similar without comparing every word, saving massive amounts of database storage.",
        companies: ["Google", "Apache Foundation"],
        useCases: ["Web Crawling Deduplication", "News Article Clustering"],
    },
    relatedPlaybooks: ["rag-techniques-encyclopedia", "production-deployment-checklist"],
  },
  {
    slug: "proposition-chunking",
    title: "Proposition Chunking (Atomic Facts)",
    description:
      "Break text into atomic, self-contained factual 'propositions'. Why: Paragraphs contain mixed facts. Solves: Precision retrieval by finding the exact sentence/proposition that answers a query.",
    group: "Phase 1 — The Data Layer (Ingestion & Indexing)",
    difficulty: "hard",
    xpReward: 125,
    starterCode: `from typing import List
import re

def to_propositions(text: str) -> List[str]:
    \"\"\"
    Simulate Proposition Chunking (breaking into atomic factual claims).
    
    Rules (Heuristic):
    - Split by sentence (. ! ?)
    - If a sentence contains 'and', 'but', or ';', split it further into independent clauses.
    - Trim whitespace and discard empty chunks.
    \"\"\"
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `text = "RAG is powerful and it enables accurate answers. Some models hallucinate; others are stable."
props = to_propositions(text)
assert "RAG is powerful" in props
assert "it enables accurate answers" in props
assert "Some models hallucinate" in props
assert "others are stable" in props
assert len(props) >= 4

print("All tests passed!")`,
    hints: [
      "Use `re.split` with multiple delimiters.",
      "Pattern for clause splitting: `r\"[.!?]|;| and | but \"`.",
    ],
    realWorld: {
        description: "Proposition chunking was popularized by researchers from Tongji University. It bridges the gap between 'dense vectors' and 'knowledge graphs' by creating atomic nodes of information.",
        companies: ["Perplexity", "Glean"],
        useCases: ["High-precision QA", "Fact Verification"],
    },
  },
  {
    slug: "contextual-chunk-headers",
    title: "Contextual Chunk Headers",
    description:
      "Prepend global document context (title, headers) to every chunk. Why: 'Section 4' in a chunk means nothing without knowing the document is the '2024 Revenue Report'. Solves: Retrieval drift where a chunk is highly relevant but lacks keywords present in its document title.",
    group: "Phase 1 — The Data Layer (Ingestion & Indexing)",
    difficulty: "medium",
    xpReward: 75,
    starterCode: `from typing import List

def add_contextual_headers(chunks: List[str], doc_title: str, doc_author: str) -> List[str]:
    \"\"\"
    Prepend a structured header to each chunk.
    
    Format:
    [Document: {title}]
    [Author: {author}]
    ---
    {chunk_text}
    \"\"\"
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `chunks = ["Revenue was $10M.", "Costs were $5M."]
headers = add_contextual_headers(chunks, "Q3 Report", "CFO")
assert headers[0].startswith("[Document: Q3 Report]")
assert "---" in headers[0]
assert headers[0].endswith("Revenue was $10M.")

print("All tests passed!")`,
    hints: [
      "Use an f-string to build the header template.",
      "Iterate chunks and join the template with the text.",
    ],
    solution: `from typing import List

def add_contextual_headers(chunks: List[str], doc_title: str, doc_source: str) -> List[str]:
    result = []
    header = f"[Document: {doc_title}] [Source: {doc_source}]\n---\n"
    for chunk in chunks:
        result.append(header + chunk)
    return result
`,
    timeEstimate: { minutes: 15, label: "15-20 min" },
    prerequisites: ["metadata-tagging"],
    realWorld: {
        description: "Anthropic's 'Contextual Retrieval' blog post highlighted this as a key technique. It prevents the model from losing the 'Big Picture' when looking at tiny context window segments.",
        companies: ["Anthropic", "Amazon"],
        useCases: ["Multi-document RAG", "Technical Manual Search"],
    },
    relatedPlaybooks: ["document-parsing-guide", "rag-techniques-encyclopedia"],
  },
  {
    slug: "late-chunking",
    title: "Late Chunking (Contextual Embeddings)",
    description:
      "Conceptually implement Late Chunking where embeddings are derived from the full document context before splitting. Why: Chunks lose context-sensitive meaning (e.g. 'it' refers to a word 3 paragraphs ago). Solves: Long-range semantic dependencies.",
    group: "Phase 1 — The Data Layer (Ingestion & Indexing)",
    difficulty: "hard",
    xpReward: 150,
    starterCode: `from typing import List, Tuple
import math

def simulate_late_chunking(doc_context: str, chunks: List[str]) -> List[List[float]]:
    \"\"\"
    Late chunking uses the global context to weight embedding dimensions.
    
    Heuristic for this lab:
    1. Calculate a 'Global Weight' vector (dim=8) based on total word counts in doc_context.
    2. For each chunk, calculate a 'Local Vector' (dim=8).
    3. Return 'Late Embedding' = Local Vector * (1 + Global Weight).
    \"\"\"
    # TODO: implement this simplified simulation
    raise NotImplementedError
`,
    testCode: `doc = "Apple is a fruit. Apple is also a tech company based in Cupertino."
chunks = ["Apple is a fruit.", "Apple is a tech company."]
vecs = simulate_late_chunking(doc, chunks)
assert len(vecs) == 2
assert len(vecs[0]) == 8
# The word 'Apple' should have its dimension boosted by the document-level frequency
assert any(v > 1.0 for v in vecs[0]), "Global context should boost some dimensions"

print("All tests passed!")`,
    hints: [
      "For Global Weight: count word occurrences in `doc_context`, mod by 8 to get dimension index.",
      "Normalization: Divide counts by `max(counts)` to keep weights between 0 and 1.",
    ],
    solution: `from typing import List, Tuple
import math
import re

def simulate_late_chunking(doc_context: str, chunks: List[str]) -> List[List[float]]:
    # Calculate global weights from document
    words = re.findall(r"[a-z]+", doc_context.lower())
    global_counts = [0.0] * 8
    for w in words:
        idx = hash(w) % 8
        global_counts[idx] += 1
    
    # Normalize global weights
    max_count = max(global_counts) if max(global_counts) > 0 else 1
    global_weights = [c / max_count for c in global_counts]
    
    # Generate embeddings for each chunk
    result = []
    for chunk in chunks:
        chunk_words = re.findall(r"[a-z]+", chunk.lower())
        local_vec = [0.0] * 8
        for w in chunk_words:
            idx = hash(w) % 8
            local_vec[idx] += 1.0
        
        # Apply late chunking: Local * (1 + Global)
        late_vec = [local_vec[i] * (1 + global_weights[i]) for i in range(8)]
        result.append(late_vec)
    
    return result
`,
    timeEstimate: { minutes: 40, label: "40-50 min" },
    prerequisites: ["overlap-chunking", "embed-and-search"],
    realWorld: {
        description: "Introduced by Jina AI. Unlike standard chunking which embeds segments in isolation, Late Chunking embeds the whole doc and then pools tokens, preserving pronouns and cross-references.",
        companies: ["Jina AI", "Mixedbread.ai"],
        useCases: ["Long-form Document Retrieval", "Legal Agreement Analysis"],
    },
    relatedPlaybooks: ["document-parsing-guide", "rag-techniques-encyclopedia"],
  },
];


