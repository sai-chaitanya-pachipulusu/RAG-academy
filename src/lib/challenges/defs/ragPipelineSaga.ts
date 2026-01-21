
import type { RawChallenge } from "@/lib/challenges/types";

export const RAG_PIPELINE_SAGA_CHALLENGES: RawChallenge[] = [
  {
    slug: "rag-pipeline-chunker",
    title: "Build RAG Pipeline (1): Chunker",
    description:
      "The first stage of RAG: turn documents into smaller, searchable chunks. Why: LLMs have context limits. Solves: Breaks long documents into digestible pieces while preserving semantic coherence.",
    group: "Phase 2 — Retrieval & Query Engineering",
    difficulty: "easy",
    xpReward: 50,
    starterCode: `from typing import List, Dict, Any

class Chunk:
    def __init__(self, text: str, metadata: Dict[str, Any] = None):
        self.text = text
        self.metadata = metadata or {}
        self.id = None  # Will be set by chunker

class Chunker:
    def __init__(self, chunk_size: int = 200, overlap: int = 50):
        self.chunk_size = chunk_size
        self.overlap = overlap
        self._id_counter = 0

    def _generate_id(self) -> str:
        self._id_counter += 1
        return f"chunk_{self._id_counter}"

    def chunk(self, document: str, source_meta: Dict[str, Any] = None) -> List[Chunk]:
        """
        Split document into overlapping chunks.
        Each chunk should have:
        - text: the chunk content
        - metadata: { "source": source_meta, "position": index_in_doc }
        - id: unique chunk id
        """
        # TODO: Implement chunking with overlap
        return []
`,
    testCode: `chunker = Chunker(chunk_size=100, overlap=20)
doc = "A" * 250  # 250 chars

chunks = chunker.chunk(doc, source_meta={"file": "test.txt"})

# Expect ~3 chunks with overlap
assert len(chunks) >= 2, f"Expected at least 2 chunks, got {len(chunks)}"
assert len(chunks[0].text) == 100, "First chunk should be 100 chars"
assert chunks[0].id is not None, "Chunk should have an ID"
assert chunks[0].metadata.get("source", {}).get("file") == "test.txt"

# Check overlap: second chunk should start where first ends minus overlap
# For chunk_size=100, overlap=20: chunk1=[0:100], chunk2=[80:180]
assert len(chunks[1].text) == 100

print("Chunker passed!")
`,
    hints: [
      "Use a while loop: `start = 0; while start < len(document): ...`",
      "Each iteration: `end = start + chunk_size`",
      "Next iteration: `start = end - overlap`",
      "Don't forget to handle the last chunk if it's shorter than chunk_size.",
    ],
    solution: `from typing import List, Dict, Any

class Chunk:
    def __init__(self, text: str, metadata: Dict[str, Any] = None):
        self.text = text
        self.metadata = metadata or {}
        self.id = None

class Chunker:
    def __init__(self, chunk_size: int = 200, overlap: int = 50):
        self.chunk_size = chunk_size
        self.overlap = overlap
        self._id_counter = 0

    def _generate_id(self) -> str:
        self._id_counter += 1
        return f"chunk_{self._id_counter}"

    def chunk(self, document: str, source_meta: Dict[str, Any] = None) -> List[Chunk]:
        chunks = []
        start = 0
        position = 0
        
        while start < len(document):
            end = min(start + self.chunk_size, len(document))
            text = document[start:end]
            
            chunk = Chunk(text, metadata={
                "source": source_meta or {},
                "position": position
            })
            chunk.id = self._generate_id()
            chunks.append(chunk)
            
            position += 1
            
            if end >= len(document):
                break
            start = end - self.overlap
        
        return chunks
`,
    complexity: {
      time: "O(n)",
      space: "O(n/chunk_size)",
      latency: "~1ms per 10KB document",
    },
    realWorld: {
      description: "Every RAG system starts with chunking. LangChain's RecursiveCharacterTextSplitter and LlamaIndex's NodeParser implement similar logic. Overlap prevents losing context at chunk boundaries.",
      companies: ["LangChain", "LlamaIndex", "Anthropic", "OpenAI"],
      useCases: ["Document preprocessing", "Context window management", "Semantic chunking"],
    },
    relatedChallenges: ["rag-pipeline-embedder", "rag-pipeline-retriever"],
    relatedPlaybooks: ["document-parsing-guide", "rag-techniques-encyclopedia"],
  },
  {
    slug: "rag-pipeline-embedder",
    title: "Build RAG Pipeline (2): Embedder",
    description:
      "Add an embedding layer to your pipeline. Why: Semantic search requires vectors. Solves: Converts text chunks into dense vectors using a mock or real embedding model.",
    group: "Phase 2 — Retrieval & Query Engineering",
    difficulty: "medium",
    xpReward: 75,
    starterCode: `from typing import List
import hashlib

class DenseVector:
    def __init__(self, values: List[float]):
        self.values = values

class MockEmbedder:
    """
    A deterministic mock embedder for testing.
    Real system would call OpenAI/Cohere/etc.
    """
    def __init__(self, dim: int = 4):
        self.dim = dim

    def embed(self, text: str) -> DenseVector:
        """
        Generate a fake but deterministic embedding based on text hash.
        This allows reproducible tests without an API.
        """
        # TODO: Hash the text, use the hash bytes to generate float values
        # Return a DenseVector of length self.dim
        raise NotImplementedError

    def embed_batch(self, texts: List[str]) -> List[DenseVector]:
        """Embed multiple texts efficiently."""
        # TODO: Just loop and call self.embed() for now
        return []
`,
    testCode: `embedder = MockEmbedder(dim=4)

# Test determinism: same text should give same embedding
v1 = embedder.embed("hello world")
v2 = embedder.embed("hello world")
assert v1.values == v2.values, "Same text should produce same embedding"

# Different text should produce different embedding
v3 = embedder.embed("different text")
assert v1.values != v3.values, "Different texts should produce different embeddings"

# Test dimension
assert len(v1.values) == 4, "Embedding should have 4 dimensions"

# Test batch
batch = embedder.embed_batch(["a", "b", "c"])
assert len(batch) == 3

print("Embedder passed!")
`,
    hints: [
      "Use `hashlib.sha256(text.encode()).digest()` to get deterministic bytes.",
      "Take the first `dim` bytes and convert each to a float: `float(b) / 255.0`.",
      "Normalize the vector for better search: divide by magnitude.",
    ],
    solution: `from typing import List
import hashlib
import math

class DenseVector:
    def __init__(self, values: List[float]):
        self.values = values

class MockEmbedder:
    def __init__(self, dim: int = 4):
        self.dim = dim

    def embed(self, text: str) -> DenseVector:
        h = hashlib.sha256(text.encode()).digest()
        vals = [float(b) / 255.0 for b in h[:self.dim]]
        
        # Normalize
        mag = math.sqrt(sum(v*v for v in vals))
        if mag > 0:
            vals = [v / mag for v in vals]
        
        return DenseVector(vals)

    def embed_batch(self, texts: List[str]) -> List[DenseVector]:
        return [self.embed(text) for text in texts]
`,
  },
  {
    slug: "rag-pipeline-retriever",
    title: "Build RAG Pipeline (3): Retriever",
    description:
      "Wire Chunker, Embedder, and Index together into a Retriever class. Why: End-to-end retrieval. Solves: Given a query string, return the most relevant chunks from your corpus.",
    group: "Phase 2 — Retrieval & Query Engineering",
    difficulty: "medium",
    xpReward: 100,
    starterCode: `from typing import List, Tuple, Dict, Any
import math
import hashlib

# --- Copy your DenseVector, MockEmbedder, FlatIndex, Chunker from previous challenges ---

class DenseVector:
    def __init__(self, values: List[float]):
        self.values = values; self._mag = math.sqrt(sum(x*x for x in values))
    def cosine_similarity(self, other: 'DenseVector') -> float:
        dot = sum(a*b for a,b in zip(self.values, other.values))
        return dot / (self._mag * other._mag) if self._mag and other._mag else 0.0

class MockEmbedder:
    def __init__(self, dim: int = 8):
        self.dim = dim
    def embed(self, text: str) -> DenseVector:
        h = hashlib.sha256(text.encode()).digest()
        vals = [float(b) / 255.0 for b in h[:self.dim]]
        mag = math.sqrt(sum(v*v for v in vals))
        return DenseVector([v/mag for v in vals] if mag else vals)

class FlatIndex:
    def __init__(self):
        self.vectors = []; self.ids = []
    def add(self, id: str, vector: DenseVector):
        self.vectors.append(vector); self.ids.append(id)
    def search(self, query: DenseVector, k: int = 1) -> List[Tuple[str, float]]:
        scores = [(self.ids[i], query.cosine_similarity(v)) for i, v in enumerate(self.vectors)]
        return sorted(scores, key=lambda x: x[1], reverse=True)[:k]

class Chunk:
    def __init__(self, text: str, metadata: Dict[str, Any] = None):
        self.text = text; self.metadata = metadata or {}; self.id = None

# --- Your Task: Build the Retriever ---

class Retriever:
    def __init__(self, embedder: MockEmbedder):
        self.embedder = embedder
        self.index = FlatIndex()
        self.chunk_store: Dict[str, Chunk] = {}  # id -> Chunk

    def add_documents(self, documents: List[str], chunk_size: int = 100, overlap: int = 20):
        """
        1. Chunk each document.
        2. Embed each chunk.
        3. Add to index.
        4. Store chunk in chunk_store by id.
        """
        # TODO: Implement
        pass

    def retrieve(self, query: str, k: int = 3) -> List[Chunk]:
        """
        1. Embed the query.
        2. Search index for top-k chunk IDs.
        3. Return the actual Chunk objects from chunk_store.
        """
        # TODO: Implement
        return []
`,
    testCode: `embedder = MockEmbedder(dim=8)
retriever = Retriever(embedder)

docs = [
    "Python is a great programming language for data science and machine learning.",
    "JavaScript runs in the browser and powers interactive web applications.",
]

retriever.add_documents(docs, chunk_size=50, overlap=10)

# The store should have some chunks
assert len(retriever.chunk_store) > 0, "Chunks should be stored"

# Query for python-related content
results = retriever.retrieve("python data science", k=1)
assert len(results) == 1, "Should return 1 result"
assert "python" in results[0].text.lower() or "data" in results[0].text.lower(), "Should find relevant chunk"

print("Retriever pipeline passed!")
`,
    hints: [
      "In `add_documents`: implement a simple chunking loop (or reuse your Chunker).",
      "For each chunk: call `embedder.embed(chunk.text)`, then `index.add(chunk.id, vector)`.",
      "In `retrieve`: embed the query, search the index, then lookup chunks in `chunk_store`.",
    ],
    solution: `class Retriever:
    def __init__(self, embedder):
        self.embedder = embedder
        self.index = FlatIndex()
        self.chunk_store = {}
        self._chunk_counter = 0

    def add_documents(self, documents, chunk_size=100, overlap=20):
        for doc in documents:
            start = 0
            while start < len(doc):
                end = min(start + chunk_size, len(doc))
                text = doc[start:end]
                
                chunk = Chunk(text)
                chunk.id = f"chunk_{self._chunk_counter}"
                self._chunk_counter += 1
                
                self.chunk_store[chunk.id] = chunk
                vec = self.embedder.embed(text)
                self.index.add(chunk.id, vec)
                
                if end >= len(doc):
                    break
                start = end - overlap

    def retrieve(self, query, k=3):
        query_vec = self.embedder.embed(query)
        results = self.index.search(query_vec, k)
        return [self.chunk_store[doc_id] for doc_id, _ in results]
`,
  },
  {
    slug: "rag-pipeline-generator",
    title: "Build RAG Pipeline (4): Generator",
    description:
      "Add the generation step: format retrieved context into a prompt and simulate an LLM response. Why: RAG is Retrieval + Generation. Solves: Transforms retrieved chunks into a coherent, grounded answer.",
    group: "Phase 2 — Retrieval & Query Engineering",
    difficulty: "hard",
    xpReward: 125,
    starterCode: `from typing import List, Dict, Any
import math
import hashlib

# --- Pre-built components from previous challenges ---

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
    def __init__(self): self.vectors = []; self.ids = []
    def add(self, id: str, vector: DenseVector): self.vectors.append(vector); self.ids.append(id)
    def search(self, query: DenseVector, k: int = 1):
        scores = [(self.ids[i], query.cosine_similarity(v)) for i, v in enumerate(self.vectors)]
        return sorted(scores, key=lambda x: x[1], reverse=True)[:k]

class Chunk:
    def __init__(self, text: str, metadata: Dict[str, Any] = None):
        self.text = text; self.metadata = metadata or {}; self.id = None

class Retriever:
    def __init__(self, embedder): self.embedder = embedder; self.index = FlatIndex(); self.chunk_store = {}
    def add_documents(self, docs, chunk_size=100, overlap=20):
        cid = 0
        for doc in docs:
            start = 0
            while start < len(doc):
                end = min(start + chunk_size, len(doc))
                c = Chunk(doc[start:end]); c.id = f"c_{cid}"; cid += 1
                self.chunk_store[c.id] = c
                self.index.add(c.id, self.embedder.embed(c.text))
                start = end - overlap if end < len(doc) else len(doc)
    def retrieve(self, query: str, k: int = 3):
        qv = self.embedder.embed(query)
        hits = self.index.search(qv, k)
        return [self.chunk_store[id] for id, _ in hits]

# --- Your Task: The Generator ---

class RAGPipeline:
    def __init__(self, retriever: Retriever):
        self.retriever = retriever

    def format_prompt(self, query: str, chunks: List[Chunk]) -> str:
        """
        Build a prompt for the LLM.
        Format:
        ---
        Context:
        [1] {chunk1.text}
        [2] {chunk2.text}
        ...

        Question: {query}

        Answer the question based ONLY on the context above.
        ---
        """
        # TODO: Implement prompt formatting
        raise NotImplementedError

    def generate(self, prompt: str) -> str:
        """
        Simulate LLM generation.
        For this exercise, just return: "Based on the context, the answer is derived from the provided information."
        (In a real system, you'd call OpenAI/Anthropic here.)
        """
        # TODO: Return the fixed mock response
        raise NotImplementedError

    def query(self, question: str, k: int = 3) -> Dict[str, Any]:
        """
        Full RAG pipeline:
        1. Retrieve top-k chunks
        2. Format prompt
        3. Generate answer
        4. Return {"answer": str, "sources": List[str]}
        """
        # TODO: Wire everything together
        raise NotImplementedError
`,
    testCode: `embedder = MockEmbedder(dim=8)
retriever = Retriever(embedder)
retriever.add_documents([
    "Python is great for data science. It has libraries like pandas and numpy.",
    "JavaScript is used for web development. React and Vue are popular frameworks.",
], chunk_size=50, overlap=10)

pipeline = RAGPipeline(retriever)

# Test prompt formatting
chunks = retriever.retrieve("python data", k=2)
prompt = pipeline.format_prompt("What is Python used for?", chunks)
assert "Context:" in prompt, "Prompt should have Context section"
assert "Question:" in prompt, "Prompt should have Question section"
assert "[1]" in prompt, "Chunks should be numbered"

# Test generate
response = pipeline.generate(prompt)
assert len(response) > 0, "Should return a response"

# Test full pipeline
result = pipeline.query("What is Python used for?", k=2)
assert "answer" in result, "Result should have 'answer' key"
assert "sources" in result, "Result should have 'sources' key"
assert isinstance(result["sources"], list), "Sources should be a list"

print("RAG Pipeline complete!")
`,
    hints: [
      "In `format_prompt`: use a loop with `enumerate(chunks, 1)` to number them.",
      "In `generate`: just return the mock string for now.",
      "In `query`: call `self.retriever.retrieve()`, then `self.format_prompt()`, then `self.generate()`.",
      "Return sources as `[c.id for c in chunks]`.",
    ],
    solution: `class RAGPipeline:
    def __init__(self, retriever):
        self.retriever = retriever

    def format_prompt(self, query, chunks):
        context_parts = []
        for i, chunk in enumerate(chunks, 1):
            context_parts.append(f"[{i}] {chunk.text}")
        
        context = "\\n".join(context_parts)
        
        return f"""Context:
{context}

Question: {query}

Answer the question based ONLY on the context above."""

    def generate(self, prompt):
        return "Based on the context, the answer is derived from the provided information."

    def query(self, question, k=3):
        chunks = self.retriever.retrieve(question, k)
        prompt = self.format_prompt(question, chunks)
        answer = self.generate(prompt)
        
        return {
            "answer": answer,
            "sources": [c.id for c in chunks]
        }
`,
  },
];

