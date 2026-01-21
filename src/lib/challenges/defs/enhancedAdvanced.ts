
import type { RawChallenge } from "@/lib/challenges/types";

/**
 * ENHANCED ADVANCED CHALLENGES: Phase 6-10 Improvements
 * These challenges fill critical gaps to make the advanced curriculum production-grade.
 */
export const ENHANCED_ADVANCED_CHALLENGES: RawChallenge[] = [
  // ============================================================
  // PHASE 6: MULTI-MODAL & STRUCTURED RAG - ADDITIONS
  // ============================================================
  {
    slug: "json-schema-parser",
    title: "JSON/API Response Parser",
    description: "Parse nested JSON responses into flat, searchable chunks. Why: APIs return structured data that doesn't embed well as-is. Solves: Makes database records and API responses RAG-compatible.",
    group: "Phase 6 — Multi-Modal & Structured RAG",
    difficulty: "medium",
    xpReward: 75,
    starterCode: `from typing import Dict, List, Any

def flatten_json(data: Dict[str, Any], prefix: str = "") -> List[str]:
    """
    Flatten nested JSON into searchable text chunks.
    
    Example:
    {"user": {"name": "Alice", "email": "a@b.com"}}
    ->
    ["user.name: Alice", "user.email: a@b.com"]
    """
    # TODO: Implement recursive flattening
    raise NotImplementedError

def json_to_chunks(data: Dict[str, Any], max_chunk_size: int = 500) -> List[str]:
    """
    Convert JSON to chunks suitable for embedding.
    
    Rules:
    - Flatten the JSON first.
    - Group flattened items into chunks under max_chunk_size.
    """
    # TODO: Implement
    raise NotImplementedError
`,
    testCode: `data = {
    "company": "Acme",
    "employees": [
        {"name": "Alice", "role": "Engineer"},
        {"name": "Bob", "role": "Manager"}
    ]
}
flat = flatten_json(data)
assert any("company: Acme" in f for f in flat)
assert any("employees.0.name: Alice" in f for f in flat)

chunks = json_to_chunks(data, max_chunk_size=100)
assert all(len(c) <= 100 for c in chunks)

print("JSON parsing passed!")`,
    hints: [
      "Use recursion to handle nested dicts and lists.",
      "For lists, use index notation: employees.0.name",
      "Join key-value pairs with ': ' for readability.",
    ],
    solution: `from typing import Dict, List, Any

def flatten_json(data: Dict[str, Any], prefix: str = "") -> List[str]:
    result = []
    
    for key, value in data.items():
        full_key = f"{prefix}{key}" if prefix else key
        
        if isinstance(value, dict):
            result.extend(flatten_json(value, f"{full_key}."))
        elif isinstance(value, list):
            for i, item in enumerate(value):
                if isinstance(item, dict):
                    result.extend(flatten_json(item, f"{full_key}.{i}."))
                else:
                    result.append(f"{full_key}.{i}: {item}")
        else:
            result.append(f"{full_key}: {value}")
    
    return result

def json_to_chunks(data: Dict[str, Any], max_chunk_size: int = 500) -> List[str]:
    flat = flatten_json(data)
    chunks = []
    current_chunk = []
    current_size = 0
    
    for item in flat:
        if current_size + len(item) + 1 > max_chunk_size and current_chunk:
            chunks.append("\\n".join(current_chunk))
            current_chunk = []
            current_size = 0
        current_chunk.append(item)
        current_size += len(item) + 1
    
    if current_chunk:
        chunks.append("\\n".join(current_chunk))
    
    return chunks
`,
    timeEstimate: { minutes: 25, label: "25-35 min" },
    realWorld: {
      description: "Enterprise RAG often indexes CRM data, Salesforce records, or API responses. These are all JSON—you need to flatten them before they become searchable.",
      companies: ["Salesforce", "HubSpot", "MongoDB"],
      useCases: ["CRM Search", "Database Record Retrieval"],
    },
  },
  {
    slug: "pdf-layout-detector",
    title: "PDF Layout Detection",
    description: "Detect and separate headers, paragraphs, and sidebars from PDF text. Why: Raw PDF extraction mixes everything together. Solves: Enables semantic chunking respecting document structure.",
    group: "Phase 6 — Multi-Modal & Structured RAG",
    difficulty: "hard",
    xpReward: 125,
    starterCode: `from typing import Dict, List

def classify_text_block(text: str, font_size: float, is_bold: bool) -> str:
    """
    Classify a text block based on formatting.
    
    Return one of: "header", "subheader", "paragraph", "caption"
    
    Heuristics:
    - Large font + bold -> "header"
    - Medium font + bold -> "subheader"
    - Small font -> "caption"
    - Everything else -> "paragraph"
    """
    # TODO: Implement classification logic
    raise NotImplementedError

def group_by_section(blocks: List[Dict]) -> List[Dict[str, str]]:
    """
    Group text blocks into sections with their headers.
    
    blocks: [{"text": str, "font_size": float, "is_bold": bool}, ...]
    
    Return: [{"header": str, "content": str}, ...]
    """
    # TODO: Implement
    raise NotImplementedError
`,
    testCode: `assert classify_text_block("INTRODUCTION", 24.0, True) == "header"
assert classify_text_block("1.1 Background", 18.0, True) == "subheader"
assert classify_text_block("This is body text...", 12.0, False) == "paragraph"
assert classify_text_block("Figure 1", 10.0, False) == "caption"

blocks = [
    {"text": "Chapter 1", "font_size": 24.0, "is_bold": True},
    {"text": "Overview text here.", "font_size": 12.0, "is_bold": False},
    {"text": "Chapter 2", "font_size": 24.0, "is_bold": True},
    {"text": "More content.", "font_size": 12.0, "is_bold": False},
]
sections = group_by_section(blocks)
assert len(sections) == 2
assert sections[0]["header"] == "Chapter 1"

print("PDF layout detection passed!")`,
    hints: [
        "Define font size thresholds (e.g., >20 is header, >14 is subheader).",
        "Track the current header and accumulate paragraphs under it.",
    ],
    solution: `from typing import Dict, List

def classify_text_block(text: str, font_size: float, is_bold: bool) -> str:
    if font_size < 11.0:
        return "caption"
    if font_size >= 20.0 and is_bold:
        return "header"
    if font_size >= 14.0 and is_bold:
        return "subheader"
    return "paragraph"

def group_by_section(blocks: List[Dict]) -> List[Dict[str, str]]:
    sections = []
    current_header = ""
    current_content = []
    
    for block in blocks:
        block_type = classify_text_block(
            block["text"], 
            block["font_size"], 
            block["is_bold"]
        )
        
        if block_type == "header":
            # Flush previous section
            if current_header or current_content:
                sections.append({
                    "header": current_header,
                    "content": " ".join(current_content)
                })
            current_header = block["text"]
            current_content = []
        else:
            current_content.append(block["text"])
    
    # Flush last section
    if current_header or current_content:
        sections.append({
            "header": current_header,
            "content": " ".join(current_content)
        })
    
    return sections
`,
    timeEstimate: { minutes: 30, label: "30-40 min" },
    realWorld: {
      description: "Tools like Unstructured.io and LlamaParse specialize in layout-aware PDF parsing. Without it, you get 'Title Body Footnote' all mashed into one paragraph.",
      companies: ["Unstructured.io", "LlamaParse", "Adobe"],
      useCases: ["Legal Document Processing", "Research Paper Analysis"],
    },
  },
  {
    slug: "audio-transcript-chunking",
    title: "Audio Transcript Chunking",
    description: "Chunk audio transcripts by speaker turns and timestamps. Why: Raw transcripts are a wall of text; speaker-aware chunks improve retrieval. Solves: Enables 'What did the CEO say in the Q3 call?' queries.",
    group: "Phase 6 — Multi-Modal & Structured RAG",
    difficulty: "medium",
    xpReward: 75,
    starterCode: `from typing import Dict, List

def chunk_transcript(
    segments: List[Dict],  # [{"speaker": str, "start": float, "text": str}]
    max_duration: float = 60.0,
) -> List[Dict[str, str]]:
    """
    Chunk audio transcript segments intelligently.
    
    Rules:
    - Try to keep same-speaker segments together.
    - Don't exceed max_duration per chunk.
    - Include metadata: speaker, start_time, end_time.
    """
    # TODO: Implement
    raise NotImplementedError
`,
    testCode: `segments = [
    {"speaker": "CEO", "start": 0.0, "text": "Welcome to the earnings call."},
    {"speaker": "CEO", "start": 5.0, "text": "Revenue is up 20%."},
    {"speaker": "Analyst", "start": 30.0, "text": "What about margins?"},
    {"speaker": "CEO", "start": 35.0, "text": "Margins improved by 5%."},
]
chunks = chunk_transcript(segments, max_duration=30.0)
assert len(chunks) >= 2
assert "CEO" in chunks[0]["speaker"]

print("Audio transcript chunking passed!")`,
    hints: [
      "Group consecutive same-speaker segments.",
      "Split when duration exceeds threshold or speaker changes.",
    ],
    solution: `from typing import Dict, List

def chunk_transcript(
    segments: List[Dict],
    max_duration: float = 60.0,
) -> List[Dict[str, str]]:
    if not segments:
        return []
    
    chunks = []
    current_texts = []
    current_speaker = segments[0]["speaker"]
    current_start = segments[0]["start"]
    current_end = segments[0]["start"]
    
    for seg in segments:
        seg_end = seg["start"] + 5.0  # Assume 5s per segment
        
        # Check if we should start a new chunk
        duration = seg_end - current_start
        speaker_changed = seg["speaker"] != current_speaker
        
        if speaker_changed or duration > max_duration:
            # Save current chunk
            if current_texts:
                chunks.append({
                    "speaker": current_speaker,
                    "start_time": str(current_start),
                    "end_time": str(current_end),
                    "text": " ".join(current_texts)
                })
            # Start new chunk
            current_texts = [seg["text"]]
            current_speaker = seg["speaker"]
            current_start = seg["start"]
            current_end = seg_end
        else:
            current_texts.append(seg["text"])
            current_end = seg_end
    
    # Don't forget the last chunk
    if current_texts:
        chunks.append({
            "speaker": current_speaker,
            "start_time": str(current_start),
            "end_time": str(current_end),
            "text": " ".join(current_texts)
        })
    
    return chunks
`,
    timeEstimate: { minutes: 30, label: "30-40 min" },
    realWorld: {
      description: "Earnings call analysis, meeting summarization, and podcast search all require speaker-aware chunking. Tools like AssemblyAI and Deepgram provide this data.",
      companies: ["AssemblyAI", "Deepgram", "Otter.ai"],
      useCases: ["Earnings Call Analysis", "Meeting Search"],
    },
  },
  // ============================================================
  // PHASE 7: SOTA ARCHITECTURES - ADDITIONS
  // ============================================================
  {
    slug: "raptor-tree",
    title: "RAPTOR: Recursive Summarization Tree",
    description: "Build a hierarchical tree where leaves are chunks and nodes are summaries of their children. Why: Enables both specific and broad queries on the same corpus. Solves: Long-range reasoning across large documents.",
    group: "Phase 7 — SOTA Architectures & Agentic Memory",
    difficulty: "hard",
    xpReward: 150,
    starterCode: `from typing import Dict, List

class RAPTORNode:
    def __init__(self, text: str, children: List["RAPTORNode"] = None):
        self.text = text
        self.children = children or []
        self.is_leaf = len(self.children) == 0

def build_raptor_tree(chunks: List[str], summarize_fn) -> RAPTORNode:
    """
    Build a RAPTOR tree from leaf chunks.
    
    Algorithm:
    1. Start with chunks as leaves.
    2. Group leaves into pairs/triples.
    3. Summarize each group to create parent nodes.
    4. Repeat until you have a single root.
    
    summarize_fn: takes List[str] -> str
    """
    # TODO: Implement
    raise NotImplementedError

def search_raptor(root: RAPTORNode, query: str, scorer_fn) -> List[str]:
    """
    Search the tree top-down, expanding promising branches.
    
    scorer_fn: takes (query, text) -> float
    
    Return all relevant leaf texts.
    """
    # TODO: Implement
    raise NotImplementedError
`,
    testCode: `def mock_summarize(texts):
    return "Summary: " + " | ".join(t[:20] for t in texts)

def mock_scorer(query, text):
    return len(set(query.lower().split()) & set(text.lower().split()))

chunks = ["Apple revenue Q1", "Apple revenue Q2", "Google revenue Q1", "Google revenue Q2"]
tree = build_raptor_tree(chunks, mock_summarize)
assert tree.is_leaf == False
assert len(tree.children) >= 1

results = search_raptor(tree, "Apple revenue", mock_scorer)
assert any("Apple" in r for r in results)

print("RAPTOR tree passed!")`,
    hints: [
      "Build bottom-up: leaves -> intermediate summaries -> root.",
      "Search top-down: score each node, recurse into high-scoring branches.",
      "RAPTOR allows retrieving both specific chunks AND high-level summaries.",
    ],
    solution: `from typing import List

class RAPTORNode:
    def __init__(self, text: str, children: List["RAPTORNode"] = None):
        self.text = text
        self.children = children or []
        self.is_leaf = len(self.children) == 0

def build_raptor_tree(chunks: List[str], summarize_fn) -> RAPTORNode:
    # Create leaf nodes
    nodes = [RAPTORNode(text=chunk) for chunk in chunks]
    
    # Build tree bottom-up
    while len(nodes) > 1:
        new_level = []
        for i in range(0, len(nodes), 2):
            group = nodes[i:i+2]
            texts = [n.text for n in group]
            summary = summarize_fn(texts)
            parent = RAPTORNode(text=summary, children=group)
            new_level.append(parent)
        nodes = new_level
    
    return nodes[0] if nodes else RAPTORNode("")

def search_raptor(root: RAPTORNode, query: str, scorer_fn) -> List[str]:
    results = []
    
    def traverse(node, threshold=0):
        score = scorer_fn(query, node.text)
        
        if node.is_leaf:
            if score > threshold:
                results.append(node.text)
        else:
            # Recurse into children if promising
            if score > 0:
                for child in node.children:
                    traverse(child, threshold)
    
    traverse(root)
    return results
`,
    timeEstimate: { minutes: 40, label: "40-50 min" },
    realWorld: {
      description: "RAPTOR (Recursive Abstractive Processing for Tree-Organized Retrieval) from UC Berkeley enables both 'What was in paragraph 5?' and 'Summarize the whole document' from one index.",
      companies: ["UC Berkeley", "Anthropic", "Google DeepMind"],
      useCases: ["Book-length Document QA", "Research Paper Synthesis"],
    },
  },
  {
    slug: "self-rag-grader",
    title: "Self-RAG: Retrieval Necessity Predictor",
    description: "Decide whether to retrieve at all, or answer from the model's knowledge. Why: Not every question needs retrieval. Solves: Reduces latency and cost for simple factual questions.",
    group: "Phase 7 — SOTA Architectures & Agentic Memory",
    difficulty: "medium",
    xpReward: 100,
    starterCode: `from typing import Literal

def needs_retrieval(query: str) -> Literal["retrieve", "generate", "refuse"]:
    """
    Classify if a query needs retrieval.
    
    Rules (heuristic):
    - If query asks for recent events, specific data, or cites -> "retrieve"
    - If query is about common knowledge, definitions -> "generate"
    - If query is harmful, off-topic -> "refuse"
    """
    # TODO: Implement
    raise NotImplementedError
`,
    testCode: `assert needs_retrieval("What is the capital of France?") == "generate"
assert needs_retrieval("What was Apple's Q3 2024 revenue?") == "retrieve"
assert needs_retrieval("Tell me a joke") == "generate"
assert needs_retrieval("What does our policy say about refunds?") == "retrieve"

print("Self-RAG grader passed!")`,
    hints: [
      "Look for temporal markers: '2024', 'latest', 'recent'.",
      "Look for specific entity references: company names, policy numbers.",
      "Common knowledge: capitals, definitions, math.",
    ],
    solution: `from typing import Literal
import re

def needs_retrieval(query: str) -> Literal["retrieve", "generate"]:
    lower = query.lower()
    
    # Temporal markers suggest retrieval
    temporal = ["2023", "2024", "2025", "latest", "recent", "q3", "q4", "current"]
    if any(t in lower for t in temporal):
        return "retrieve"
    
    # Policy/company references suggest retrieval
    specific = ["policy", "our", "company", "revenue", "earnings", "sales"]
    if any(s in lower for s in specific):
        return "retrieve"
    
    # Common knowledge/simple tasks can be generated
    common_patterns = ["what is the capital", "tell me a joke", "calculate", "define"]
    if any(p in lower for p in common_patterns):
        return "generate"
    
    # Default to retrieval for safety
    return "retrieve"
`,
    timeEstimate: { minutes: 25, label: "25-35 min" },
    realWorld: {
      description: "Self-RAG (from CMU) introduces 'reflection tokens' that let the model decide when to retrieve, improving both efficiency and quality by avoiding unnecessary retrieval.",
      companies: ["CMU", "Microsoft Research"],
      useCases: ["Efficient RAG", "Hybrid Parametric-Retrieval Systems"],
    },
  },
  {
    slug: "corrective-rag",
    title: "Corrective RAG (CRAG) Evaluator",
    description: "Implement the document grading step of Corrective RAG. Why: Retrieved docs aren't always relevant. Solves: Filters out bad retrievals before they pollute the context.",
    group: "Phase 7 — SOTA Architectures & Agentic Memory",
    difficulty: "hard",
    xpReward: 125,
    starterCode: `from typing import List, Tuple, Literal

def grade_document(query: str, doc: str) -> Literal["relevant", "ambiguous", "irrelevant"]:
    """
    Grade a single document's relevance to the query.
    
    Heuristic (for this lab):
    - Count keyword overlap.
    - >50% overlap -> "relevant"
    - 20-50% overlap -> "ambiguous"
    - <20% overlap -> "irrelevant"
    """
    # TODO: Implement
    raise NotImplementedError

def crag_filter(
    query: str,
    docs: List[str],
) -> Tuple[List[str], bool]:
    """
    Corrective RAG filtering.
    
    Returns:
    - Filtered list of relevant docs
    - Boolean: True if web search fallback is needed (all docs irrelevant/ambiguous)
    """
    # TODO: Implement
    raise NotImplementedError
`,
    testCode: `docs = [
    "API key rotation policy: rotate every 90 days.",
    "Bananas are yellow fruit grown in tropical regions.",
    "Rotate API keys via the dashboard settings.",
]
query = "How to rotate API keys?"

assert grade_document(query, docs[0]) == "relevant"
assert grade_document(query, docs[1]) == "irrelevant"

filtered, needs_web = crag_filter(query, docs)
assert len(filtered) >= 1
assert "Bananas" not in str(filtered)
assert needs_web == False

# Test fallback scenario
filtered2, needs_web2 = crag_filter("quantum physics equations", docs)
assert needs_web2 == True

print("CRAG evaluator passed!")`,
    hints: [
      "Tokenize both query and doc.",
      "Calculate overlap percentage.",
      "If all docs are irrelevant, trigger web search fallback.",
    ],
    solution: `from typing import List, Tuple, Literal
import re

def _tokens(text: str) -> set:
    return set(re.findall(r"[a-z0-9]+", text.lower()))

def grade_document(query: str, doc: str) -> Literal["relevant", "ambiguous", "irrelevant"]:
    q_tokens = _tokens(query)
    d_tokens = _tokens(doc)
    
    if not q_tokens:
        return "irrelevant"
    
    overlap = len(q_tokens & d_tokens) / len(q_tokens)
    
    if overlap > 0.5:
        return "relevant"
    elif overlap >= 0.2:
        return "ambiguous"
    else:
        return "irrelevant"

def crag_filter(
    query: str,
    docs: List[str],
) -> Tuple[List[str], bool]:
    filtered = []
    has_relevant = False
    
    for doc in docs:
        grade = grade_document(query, doc)
        if grade == "relevant":
            filtered.append(doc)
            has_relevant = True
        elif grade == "ambiguous":
            filtered.append(doc)
    
    needs_web = not has_relevant and len(filtered) == 0
    return (filtered, needs_web)
`,
    timeEstimate: { minutes: 30, label: "30-40 min" },
    realWorld: {
      description: "CRAG (Corrective RAG) dynamically decides to use retrieved docs, fall back to web search, or refuse. It's the 'self-healing' RAG pattern.",
      companies: ["Microsoft", "Langchain"],
      useCases: ["Robust Enterprise QA", "Fallback Handling"],
    },
  },
  // ============================================================
  // PHASE 8: HIGH-SCALE INFRASTRUCTURE - ADDITIONS
  // ============================================================
  {
    slug: "index-sharding",
    title: "Index Sharding Strategy",
    description: "Design a sharding scheme to distribute vectors across multiple nodes. Why: Single-node indexes hit memory limits. Solves: Horizontal scaling to billions of vectors.",
    group: "Phase 8 — High-Scale Infrastructure & Compression",
    difficulty: "hard",
    xpReward: 125,
    starterCode: `from typing import Dict, List
import hashlib

class ShardRouter:
    def __init__(self, num_shards: int):
        self.num_shards = num_shards
        self.shards: Dict[int, List[str]] = {i: [] for i in range(num_shards)}
    
    def get_shard_id(self, doc_id: str) -> int:
        """
        Deterministically route a document to a shard.
        Use consistent hashing for even distribution.
        """
        # TODO: Implement
        raise NotImplementedError
    
    def insert(self, doc_id: str, content: str):
        """Insert a document into the correct shard."""
        # TODO: Implement
        raise NotImplementedError
    
    def search_all_shards(self, query: str) -> List[str]:
        """
        Search all shards and merge results.
        (Scatter-gather pattern)
        """
        # TODO: Implement
        raise NotImplementedError
`,
    testCode: `router = ShardRouter(num_shards=4)
router.insert("doc1", "Apple revenue data")
router.insert("doc2", "Google revenue data")
router.insert("doc3", "Meta revenue data")

# Check distribution
total_docs = sum(len(s) for s in router.shards.values())
assert total_docs == 3

# Same doc_id should always go to same shard
shard1 = router.get_shard_id("doc1")
shard1_again = router.get_shard_id("doc1")
assert shard1 == shard1_again

print("Index sharding passed!")`,
    hints: [
      "Use hash(doc_id) % num_shards for consistent routing.",
      "Search requires scatter (query all) and gather (merge results).",
    ],
    solution: `from typing import Dict, List
import hashlib

class ShardRouter:
    def __init__(self, num_shards: int):
        self.num_shards = num_shards
        self.shards: Dict[int, List[str]] = {i: [] for i in range(num_shards)}
    
    def get_shard_id(self, doc_id: str) -> int:
        # Use SHA1 for consistent hashing (not Python's hash which changes between runs)
        h = int(hashlib.sha1(doc_id.encode()).hexdigest(), 16)
        return h % self.num_shards
    
    def insert(self, doc_id: str, content: str):
        shard_id = self.get_shard_id(doc_id)
        self.shards[shard_id].append(content)
    
    def search_all_shards(self, query: str) -> List[str]:
        # Scatter-gather: query all shards, merge results
        results = []
        for shard_id in self.shards:
            results.extend(self.shards[shard_id])
        return results
`,
    timeEstimate: { minutes: 30, label: "30-40 min" },
    realWorld: {
      description: "Pinecone, Weaviate, and Milvus all use sharding internally. When you 'just add more pods', this is what's happening under the hood.",
      companies: ["Pinecone", "Weaviate", "Milvus"],
      useCases: ["Billion-scale Search", "Multi-region Deployment"],
    },
  },
  {
    slug: "async-batch-processor",
    title: "Async Batch Embedding Processor",
    description: "Process embeddings in batches asynchronously for throughput. Why: One-at-a-time API calls are 100x slower. Solves: Maximizes embedding throughput during ingestion.",
    group: "Phase 8 — High-Scale Infrastructure & Compression",
    difficulty: "medium",
    xpReward: 100,
    starterCode: `from typing import Callable, List
import time

def batch_embed(
    texts: List[str],
    embed_fn: Callable[[List[str]], List[List[float]]],
    batch_size: int = 32,
    delay_ms: int = 100,
) -> List[List[float]]:
    """
    Process texts in batches with rate limiting.
    
    embed_fn: Mock embedding function that takes a batch and returns vectors.
    batch_size: Max texts per API call.
    delay_ms: Delay between batches to avoid rate limits.
    
    Returns: List of embedding vectors for all texts.
    """
    # TODO: Implement
    raise NotImplementedError
`,
    testCode: `call_count = 0
def mock_embed(texts):
    global call_count
    call_count += 1
    return [[0.1] * 8 for _ in texts]

texts = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"]
vectors = batch_embed(texts, mock_embed, batch_size=3, delay_ms=10)

assert len(vectors) == 10
assert call_count == 4  # ceil(10 / 3) = 4 batches

print("Async batch processor passed!")`,
    hints: [
      "Split texts into batches: texts[i:i+batch_size].",
      "Call embed_fn on each batch.",
      "Add delay between batches with time.sleep(delay_ms / 1000).",
    ],
    solution: `from typing import Callable, List
import time

def batch_embed(
    texts: List[str],
    embed_fn: Callable[[List[str]], List[List[float]]],
    batch_size: int = 32,
    delay_ms: int = 100,
) -> List[List[float]]:
    all_vectors = []
    
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        vectors = embed_fn(batch)
        all_vectors.extend(vectors)
        
        # Rate limit delay (skip after last batch)
        if i + batch_size < len(texts):
            time.sleep(delay_ms / 1000)
    
    return all_vectors
`,
    timeEstimate: { minutes: 20, label: "20-25 min" },
    realWorld: {
      description: "OpenAI's embedding API accepts up to 2048 texts per call. Not using batching means 2048x more API calls and 100x slower ingestion.",
      companies: ["OpenAI", "Cohere", "Voyage AI"],
      useCases: ["High-throughput Ingestion", "Cost-efficient Embedding"],
    },
  },
  {
    slug: "index-warmup",
    title: "Index Warmup / Cache Preload",
    description: "Preload frequently-accessed vectors into memory for low-latency search. Why: Cold indexes have 10x higher latency. Solves: Eliminates 'cold start' penalty for common queries.",
    group: "Phase 8 — High-Scale Infrastructure & Compression",
    difficulty: "medium",
    xpReward: 75,
    starterCode: `from typing import Dict, List, Set

class WarmableIndex:
    def __init__(self):
        self.disk_store: Dict[str, List[float]] = {}
        self.memory_cache: Dict[str, List[float]] = {}
        self.access_count: Dict[str, int] = {}
    
    def add_to_disk(self, doc_id: str, vector: List[float]):
        """Store vector on 'disk' (cold storage)."""
        self.disk_store[doc_id] = vector
    
    def warmup(self, doc_ids: List[str]):
        """Preload specified doc_ids into memory cache."""
        # TODO: Implement
        raise NotImplementedError
    
    def search(self, query_vec: List[float], top_k: int = 5) -> List[str]:
        """
        Search with cache priority.
        First check memory_cache, then disk_store.
        Track access counts for analytics.
        """
        # TODO: Implement
        raise NotImplementedError
    
    def get_hot_docs(self, threshold: int = 10) -> Set[str]:
        """Return doc_ids accessed more than threshold times."""
        # TODO: Implement
        raise NotImplementedError
`,
    testCode: `idx = WarmableIndex()
idx.add_to_disk("doc1", [1.0, 0.0])
idx.add_to_disk("doc2", [0.0, 1.0])
idx.add_to_disk("doc3", [0.5, 0.5])

# Before warmup: not in cache
assert "doc1" not in idx.memory_cache

# Warmup
idx.warmup(["doc1", "doc2"])
assert "doc1" in idx.memory_cache
assert "doc3" not in idx.memory_cache

print("Index warmup passed!")`,
    hints: [
      "Copy from disk_store to memory_cache during warmup.",
      "Hot docs can be auto-detected by tracking access_count.",
    ],
    solution: `from typing import Dict, List, Set
import math

class WarmableIndex:
    def __init__(self):
        self.disk_store: Dict[str, List[float]] = {}
        self.memory_cache: Dict[str, List[float]] = {}
        self.access_count: Dict[str, int] = {}
    
    def add_to_disk(self, doc_id: str, vector: List[float]):
        self.disk_store[doc_id] = vector
    
    def warmup(self, doc_ids: List[str]):
        for doc_id in doc_ids:
            if doc_id in self.disk_store:
                self.memory_cache[doc_id] = self.disk_store[doc_id]
    
    def _cosine(self, a, b):
        dot = sum(x*y for x, y in zip(a, b))
        ma = math.sqrt(sum(x*x for x in a))
        mb = math.sqrt(sum(x*x for x in b))
        return dot / (ma * mb) if ma and mb else 0
    
    def search(self, query_vec: List[float], top_k: int = 5) -> List[str]:
        # First check cache, then disk
        combined = {**self.memory_cache, **self.disk_store}
        scored = []
        for doc_id, vec in combined.items():
            score = self._cosine(query_vec, vec)
            scored.append((doc_id, score))
            self.access_count[doc_id] = self.access_count.get(doc_id, 0) + 1
        
        scored.sort(key=lambda x: x[1], reverse=True)
        return [doc_id for doc_id, _ in scored[:top_k]]
    
    def get_hot_docs(self, threshold: int = 10) -> Set[str]:
        return {doc_id for doc_id, count in self.access_count.items() if count > threshold}
`,
    timeEstimate: { minutes: 25, label: "25-35 min" },
    realWorld: {
      description: "Pinecone's 'serverless' tier has cold start delays. Enterprise tiers offer 'always on' which is essentially pre-warmed indexes for consistent P99 latency.",
      companies: ["Pinecone", "Elasticsearch", "Redis"],
      useCases: ["Low-latency Search", "SLA Guarantees"],
    },
  },
  // ============================================================
  // PHASE 9: LLM-AS-JUDGE - ADDITIONS
  // ============================================================
  {
    slug: "context-recall-judge",
    title: "Context Recall Evaluator",
    description: "Measure what fraction of the ground-truth answer is covered by retrieved context. Why: Faithfulness without Recall = incomplete answers. Solves: Ensures retrieval is finding ALL the needed facts.",
    group: "Phase 9 — Strategic Operations (LLM-as-a-Judge)",
    difficulty: "medium",
    xpReward: 100,
    starterCode: `from typing import List

def context_recall(ground_truth: str, contexts: List[str]) -> float:
    """
    Measure what fraction of ground_truth facts are in contexts.
    
    Heuristic:
    - Tokenize ground_truth into significant words (len > 3).
    - Count how many appear in any context.
    - Return ratio: matched / total.
    """
    # TODO: Implement
    raise NotImplementedError
`,
    testCode: `gt = "The capital of France is Paris and it has the Eiffel Tower."
ctx = ["Paris is in France.", "The Eiffel Tower is iconic."]

recall = context_recall(gt, ctx)
assert recall >= 0.5  # Should find Paris, France, Eiffel, Tower

empty_recall = context_recall(gt, ["Bananas are yellow."])
assert empty_recall < 0.3

print("Context recall evaluator passed!")`,
    hints: [
      "Extract significant words from ground_truth.",
      "Combine all contexts into one big set of words.",
      "Compute intersection / len(ground_truth words).",
    ],
    solution: `from typing import List
import re

def context_recall(ground_truth: str, contexts: List[str]) -> float:
    # Tokenize ground truth into significant words
    gt_words = set(w.lower() for w in re.findall(r"[a-zA-Z]+", ground_truth) if len(w) > 3)
    
    if not gt_words:
        return 1.0
    
    # Combine all contexts
    all_context = " ".join(contexts).lower()
    ctx_words = set(re.findall(r"[a-z]+", all_context))
    
    # Find overlap
    matched = gt_words & ctx_words
    return len(matched) / len(gt_words)
`,
    timeEstimate: { minutes: 20, label: "20-25 min" },
    realWorld: {
      description: "Part of the RAG Triad (Faithfulness, Relevance, Recall). Even if an answer is faithful, if it misses half the facts because retrieval failed, it's incomplete.",
      companies: ["Ragas", "Arize Phoenix", "TruLens"],
      useCases: ["Retrieval Quality Measurement", "A/B Testing Chunking Strategies"],
    },
  },
  {
    slug: "toxicity-guard",
    title: "Toxicity / Safety Guard",
    description: "Detect toxic or harmful content in LLM outputs before serving. Why: Models can generate harmful content. Solves: Prevents reputational and legal risk.",
    group: "Phase 9 — Strategic Operations (LLM-as-a-Judge)",
    difficulty: "easy",
    xpReward: 50,
    starterCode: `from typing import Tuple

TOXIC_PATTERNS = [
    "kill", "hate", "illegal", "hack", "exploit",
    "discriminate", "racist", "sexist",
]

def check_toxicity(text: str) -> Tuple[bool, str]:
    """
    Check if text contains toxic patterns.
    
    Returns:
    - is_safe: True if no toxic patterns found
    - reason: The matched pattern if unsafe, else ""
    """
    # TODO: Implement
    raise NotImplementedError
`,
    testCode: `safe, _ = check_toxicity("Here's how to rotate API keys safely.")
assert safe == True

unsafe, reason = check_toxicity("Here's how to hack into the system.")
assert unsafe == False
assert "hack" in reason

print("Toxicity guard passed!")`,
    hints: [
      "Lowercase the text for matching.",
      "Check if any toxic pattern is a substring.",
    ],
    solution: `from typing import Tuple

TOXIC_PATTERNS = [
    "kill", "hate", "illegal", "hack", "exploit",
    "discriminate", "racist", "sexist",
]

def check_toxicity(text: str) -> Tuple[bool, str]:
    text_lower = text.lower()
    for pattern in TOXIC_PATTERNS:
        if pattern in text_lower:
            return (False, pattern)
    return (True, "")
`,
    timeEstimate: { minutes: 10, label: "10-15 min" },
    realWorld: {
      description: "Every production LLM system needs guardrails. Services like OpenAI Moderation, Anthropic Constitutional AI, and LlamaGuard provide this as a service.",
      companies: ["OpenAI", "Anthropic", "Meta (LlamaGuard)"],
      useCases: ["Content Moderation", "Compliance"],
    },
  },
  {
    slug: "multi-judge-consensus",
    title: "Multi-Judge Consensus Voting",
    description: "Aggregate multiple LLM judges with weighted voting. Why: Single judges are unreliable. Solves: Reduces evaluation variance through ensemble agreement.",
    group: "Phase 9 — Strategic Operations (LLM-as-a-Judge)",
    difficulty: "medium",
    xpReward: 75,
    starterCode: `from typing import Dict, List, Tuple

def consensus_vote(
    judgments: List[Tuple[str, float]],  # [(judge_id, score), ...]
    weights: Dict[str, float] = None,
) -> float:
    """
    Aggregate judge scores with optional weights.
    
    If weights is None, use equal weights.
    
    Returns: Weighted average score.
    """
    # TODO: Implement
    raise NotImplementedError

def majority_decision(
    judgments: List[Tuple[str, bool]],  # [(judge_id, pass/fail), ...]
) -> Tuple[bool, float]:
    """
    Return majority decision and confidence.
    
    Confidence = fraction of judges agreeing with majority.
    """
    # TODO: Implement
    raise NotImplementedError
`,
    testCode: `scores = [("gpt4", 0.9), ("claude", 0.8), ("llama", 0.7)]
avg = consensus_vote(scores)
assert abs(avg - 0.8) < 0.01

weighted_avg = consensus_vote(scores, {"gpt4": 2.0, "claude": 1.0, "llama": 0.5})
assert weighted_avg > 0.8  # GPT4 should pull it up

votes = [("judge1", True), ("judge2", True), ("judge3", False)]
decision, conf = majority_decision(votes)
assert decision == True
assert conf == 2/3

print("Multi-judge consensus passed!")`,
    hints: [
      "Weighted average: sum(score * weight) / sum(weights).",
      "Majority: count True vs False, return the majority with ratio.",
    ],
    solution: `from typing import Dict, List, Tuple

def consensus_vote(
    judgments: List[Tuple[str, float]],
    weights: Dict[str, float] = None,
) -> float:
    if not judgments:
        return 0.0
    
    if weights is None:
        weights = {j[0]: 1.0 for j in judgments}
    
    total_weight = 0.0
    weighted_sum = 0.0
    
    for judge_id, score in judgments:
        w = weights.get(judge_id, 1.0)
        weighted_sum += score * w
        total_weight += w
    
    return weighted_sum / total_weight if total_weight > 0 else 0.0

def majority_decision(
    judgments: List[Tuple[str, bool]],
) -> Tuple[bool, float]:
    true_count = sum(1 for _, vote in judgments if vote)
    false_count = len(judgments) - true_count
    
    if true_count >= false_count:
        return (True, true_count / len(judgments))
    else:
        return (False, false_count / len(judgments))
`,
    timeEstimate: { minutes: 20, label: "20-25 min" },
    realWorld: {
      description: "Research shows that ensembling 3+ judges reduces evaluation noise by 40%. This is why RAGAS and Arize use multi-model evaluation pipelines.",
      companies: ["Arize AI", "Ragas", "Patronus AI"],
      useCases: ["Robust Evaluation", "Reducing Single-Model Bias"],
    },
  },
  // ============================================================
  // PHASE 10: FINE-TUNING - ADDITIONS
  // ============================================================
  {
    slug: "embedding-finetuning",
    title: "Embedding Model Fine-Tuning (Contrastive Loss)",
    description: "Implement the core loss function for fine-tuning embedding models. Why: General embeddings miss domain-specific nuance. Solves: Creating embeddings that understand 'your' data.",
    group: "Phase 10 — Fine-Tuning & Adaptation",
    difficulty: "hard",
    xpReward: 150,
    starterCode: `from typing import List
import math

def contrastive_loss(
    anchor: List[float],
    positive: List[float],
    negatives: List[List[float]],
    temperature: float = 0.05,
) -> float:
    """
    Compute InfoNCE contrastive loss.
    
    Loss = -log(exp(sim(anchor, positive)/temp) / sum(exp(sim(anchor, x)/temp) for x in [positive] + negatives))
    
    sim = dot product (assuming normalized vectors).
    """
    # TODO: Implement
    raise NotImplementedError
`,
    testCode: `anchor = [1.0, 0.0]
positive = [0.9, 0.1]  # Similar
negatives = [[0.0, 1.0], [-1.0, 0.0]]  # Dissimilar

loss = contrastive_loss(anchor, positive, negatives)
assert loss > 0
assert loss < 5  # Should be reasonable for this setup

# Loss should be lower when positive is closer
positive_close = [0.99, 0.01]
loss2 = contrastive_loss(anchor, positive_close, negatives)
assert loss2 < loss

print("Contrastive loss passed!")`,
    hints: [
      "Compute dot products for all pairs.",
      "Use exp(dot / temperature) for softmax-style normalization.",
      "Take -log of the positive's probability.",
    ],
    solution: `from typing import List
import math

def contrastive_loss(
    anchor: List[float],
    positive: List[float],
    negatives: List[List[float]],
    temperature: float = 0.05,
) -> float:
    def dot(a, b):
        return sum(x*y for x, y in zip(a, b))
    
    pos_sim = dot(anchor, positive) / temperature
    neg_sims = [dot(anchor, neg) / temperature for neg in negatives]
    
    # Softmax denominator
    exp_pos = math.exp(pos_sim)
    exp_negs = sum(math.exp(s) for s in neg_sims)
    
    # Contrastive loss
    return -math.log(exp_pos / (exp_pos + exp_negs))
`,
    timeEstimate: { minutes: 35, label: "35-45 min" },
    realWorld: {
      description: "OpenAI, Cohere, and Voyage all fine-tune their base embeddings for customers. This loss function is the core of that process.",
      companies: ["OpenAI", "Cohere", "Voyage AI"],
      useCases: ["Domain-specific Embeddings", "Improving Retrieval for Jargon-heavy Fields"],
    },
  },
  {
    slug: "lora-adapter",
    title: "LoRA Adapter Architecture",
    description: "Implement the core LoRA (Low-Rank Adaptation) computation. Why: Full fine-tuning is expensive. Solves: Train 1% of weights for 80% of the benefit.",
    group: "Phase 10 — Fine-Tuning & Adaptation",
    difficulty: "hard",
    xpReward: 150,
    starterCode: `from typing import List

def lora_forward(
    x: List[float],
    W: List[List[float]],  # Original frozen weights
    A: List[List[float]],  # LoRA down-projection (dim x rank)
    B: List[List[float]],  # LoRA up-projection (rank x dim)
    alpha: float = 1.0,
) -> List[float]:
    """
    Compute LoRA-augmented forward pass.
    
    output = W @ x + (alpha * B @ A @ x)
    
    For simplicity, assume x is a 1D vector and W, A, B are 2D matrices.
    """
    # TODO: Implement
    raise NotImplementedError
`,
    testCode: `x = [1.0, 0.5]
W = [[1.0, 0.0], [0.0, 1.0]]  # Identity
A = [[0.1], [0.2]]  # 2x1
B = [[0.5, 0.3]]  # 1x2 (but we'll use it as 2x1 for output)

# For testing, simplify: just verify the function runs and adds something
result = lora_forward(x, W, [[0.1, 0.2]], [[0.5], [0.3]], alpha=0.1)
assert len(result) == 2
assert result != x  # Should be modified

print("LoRA adapter passed!")`,
    hints: [
      "Matrix multiply: A @ x gives low-rank representation.",
      "Then B @ (A @ x) gives full-rank output.",
      "Add to original: W @ x + alpha * LoRA_output.",
    ],
    solution: `from typing import List

def matmul_vec(matrix: List[List[float]], vec: List[float]) -> List[float]:
    result = []
    for row in matrix:
        result.append(sum(r * v for r, v in zip(row, vec)))
    return result

def lora_forward(
    x: List[float],
    W: List[List[float]],
    A: List[List[float]],
    B: List[List[float]],
    alpha: float = 1.0,
) -> List[float]:
    # Original output
    Wx = matmul_vec(W, x)
    
    # LoRA: B @ A @ x
    Ax = matmul_vec(A, x)  # Low-rank
    BAx = matmul_vec(B, Ax)  # Back to full rank
    
    # Combine
    return [w + alpha * lora for w, lora in zip(Wx, BAx)]
`,
    timeEstimate: { minutes: 40, label: "40-50 min" },
    realWorld: {
      description: "LoRA is how Hugging Face, Predibase, and Modal fine-tune LLMs cheaply. It trains <1% of parameters while achieving 95%+ of full fine-tuning performance.",
      companies: ["Hugging Face", "Predibase", "Modal"],
      useCases: ["Efficient LLM Customization", "Multi-tenant Model Serving"],
    },
  },
  {
    slug: "eval-dataset-curation",
    title: "Evaluation Dataset Curator",
    description: "Design a diverse evaluation set with stratified sampling. Why: Biased eval sets give misleading metrics. Solves: Ensures evaluation covers edge cases and all data distributions.",
    group: "Phase 10 — Fine-Tuning & Adaptation",
    difficulty: "medium",
    xpReward: 100,
    starterCode: `from typing import Dict, List
import random

def stratified_sample(
    examples: List[Dict],
    category_key: str,
    n_per_category: int,
) -> List[Dict]:
    """
    Sample n examples from each category for balanced evaluation.
    
    If a category has fewer than n examples, take all of them.
    """
    # TODO: Implement
    raise NotImplementedError

def diversity_check(
    examples: List[Dict],
    text_key: str,
) -> float:
    """
    Measure lexical diversity of the evaluation set.
    
    Return: unique_tokens / total_tokens (type-token ratio).
    """
    # TODO: Implement
    raise NotImplementedError
`,
    testCode: `examples = [
    {"id": 1, "category": "tech", "text": "API key rotation"},
    {"id": 2, "category": "tech", "text": "Server deployment"},
    {"id": 3, "category": "finance", "text": "Revenue report"},
    {"id": 4, "category": "finance", "text": "Quarterly earnings"},
    {"id": 5, "category": "hr", "text": "Employee handbook"},
]

sampled = stratified_sample(examples, "category", n_per_category=1)
categories = [e["category"] for e in sampled]
assert len(set(categories)) == 3  # One from each

diversity = diversity_check(examples, "text")
assert 0.5 < diversity <= 1.0  # Reasonable diversity

print("Eval dataset curator passed!")`,
    hints: [
      "Group examples by category.",
      "Random sample n from each group.",
      "Type-token ratio: len(unique_words) / len(all_words).",
    ],
    solution: `from typing import Dict, List
import random
import re
from collections import defaultdict

def stratified_sample(
    examples: List[Dict],
    category_key: str,
    n_per_category: int,
) -> List[Dict]:
    # Group by category
    groups = defaultdict(list)
    for ex in examples:
        groups[ex[category_key]].append(ex)
    
    # Sample from each category
    result = []
    for category, items in groups.items():
        sample_size = min(n_per_category, len(items))
        result.extend(random.sample(items, sample_size))
    
    return result

def diversity_check(
    examples: List[Dict],
    text_key: str,
) -> float:
    all_tokens = []
    for ex in examples:
        tokens = re.findall(r"[a-zA-Z]+", ex[text_key].lower())
        all_tokens.extend(tokens)
    
    if not all_tokens:
        return 0.0
    
    return len(set(all_tokens)) / len(all_tokens)
`,
    timeEstimate: { minutes: 25, label: "25-35 min" },
    realWorld: {
      description: "A biased eval set (all easy questions) makes your RAG look great until it fails in production. Stratified sampling ensures you test across difficulty levels, topics, and edge cases.",
      companies: ["Scale AI", "Snorkel AI", "Labelbox"],
      useCases: ["Benchmark Curation", "Model Monitoring Setup"],
    },
  },
];
