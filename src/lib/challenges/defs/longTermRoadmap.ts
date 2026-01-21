import type { RawChallenge } from "@/lib/challenges/types";

/**
 * LONG-TERM ROADMAP CHALLENGES
 * Advanced RAG techniques and production patterns
 */
export const LONG_TERM_ROADMAP_CHALLENGES: RawChallenge[] = [
  // ============================================================
  // GRAPHRAG & KNOWLEDGE GRAPHS
  // ============================================================
  {
    slug: "graphrag-knowledge-graph",
    title: "GraphRAG: Entity Extraction",
    description: "Extract entities and relationships from text to build a knowledge graph. Why: GraphRAG enables reasoning over document relationships. Solves: Complex queries requiring multi-hop reasoning.",
    group: "Phase 7 — SOTA Architectures & Agentic Memory",
    difficulty: "hard",
    xpReward: 150,
    starterCode: `from typing import Dict, List, Tuple

def extract_entities(text: str) -> List[str]:
    """
    Extract named entities from text.
    
    Return a list of entity names (people, organizations, locations).
    Use simple heuristics: capitalized words that aren't sentence starts.
    """
    # TODO: Implement
    raise NotImplementedError

def extract_relationships(text: str, entities: List[str]) -> List[Tuple[str, str, str]]:
    """
    Extract relationships between entities.
    
    Return list of (entity1, relationship, entity2) tuples.
    Look for patterns like "X works at Y", "X is CEO of Y", etc.
    """
    # TODO: Implement
    raise NotImplementedError

def build_knowledge_graph(texts: List[str]) -> Dict:
    """
    Build a knowledge graph from multiple texts.
    
    Returns:
    {
        "entities": [list of unique entities],
        "relationships": [list of (e1, rel, e2) tuples],
        "entity_docs": {entity: [doc_indices where it appears]}
    }
    """
    # TODO: Implement
    raise NotImplementedError
`,
    testCode: `# Test entity extraction
text1 = "John Smith works at OpenAI. He is the CEO."
entities = extract_entities(text1)
assert "John Smith" in entities or "John" in entities
assert "OpenAI" in entities

# Test relationship extraction
text2 = "Alice works at Google. Bob is CEO of Meta."
entities2 = extract_entities(text2)
rels = extract_relationships(text2, entities2)
assert len(rels) >= 2

# Test knowledge graph building
texts = [
    "Alice works at Google.",
    "Bob works at Google too.",
    "Google is located in California."
]
kg = build_knowledge_graph(texts)
assert "Google" in kg["entities"]
assert len(kg["relationships"]) >= 2

print("GraphRAG entity extraction passed!")`,
    hints: [
      "For entity extraction, look for capitalized words not at sentence start.",
      "Common relationship patterns: 'X works at Y', 'X is Y of Z'.",
      "Build the graph by iterating through all texts and merging entities.",
    ],
    solution: `from typing import Dict, List, Tuple
import re

def extract_entities(text: str) -> List[str]:
    """Extract named entities using capitalization heuristics."""
    # Split into sentences
    sentences = re.split(r'[.!?]', text)
    entities = set()
    
    for sentence in sentences:
        words = sentence.strip().split()
        for i, word in enumerate(words):
            # Skip first word of sentence (always capitalized)
            if i == 0:
                continue
            # Check for capitalized words
            clean_word = re.sub(r'[^a-zA-Z]', '', word)
            if clean_word and clean_word[0].isupper():
                # Check for multi-word entities (consecutive capitals)
                if i > 0 and words[i-1][0].isupper() and i > 1:
                    # Combine with previous
                    prev = re.sub(r'[^a-zA-Z]', '', words[i-1])
                    entities.add(f"{prev} {clean_word}")
                else:
                    entities.add(clean_word)
    
    return list(entities)

def extract_relationships(text: str, entities: List[str]) -> List[Tuple[str, str, str]]:
    """Extract relationships between entities."""
    relationships = []
    patterns = [
        (r'(\\w+) works at (\\w+)', 'works_at'),
        (r'(\\w+) is CEO of (\\w+)', 'is_ceo_of'),
        (r'(\\w+) is located in (\\w+)', 'located_in'),
    ]
    
    for pattern, rel_type in patterns:
        matches = re.findall(pattern, text)
        for match in matches:
            if len(match) == 2:
                relationships.append((match[0], rel_type, match[1]))
    
    return relationships

def build_knowledge_graph(texts: List[str]) -> Dict:
    """Build knowledge graph from multiple texts."""
    all_entities = set()
    all_relationships = []
    entity_docs = {}
    
    for i, text in enumerate(texts):
        entities = extract_entities(text)
        for entity in entities:
            all_entities.add(entity)
            if entity not in entity_docs:
                entity_docs[entity] = []
            entity_docs[entity].append(i)
        
        rels = extract_relationships(text, entities)
        all_relationships.extend(rels)
    
    return {
        "entities": list(all_entities),
        "relationships": all_relationships,
        "entity_docs": entity_docs
    }
`,
    realWorld: {
      description: "Microsoft's GraphRAG uses knowledge graphs to answer complex questions that require reasoning across multiple documents.",
      companies: ["Microsoft", "Neo4j", "Amazon Neptune"],
      useCases: ["Legal Document Analysis", "Scientific Literature Review"],
    },
    relatedPlaybooks: ["rag-techniques-encyclopedia", "rag-interview-questions"],
  },
  {
    slug: "self-rag",
    title: "Self-RAG: Adaptive Retrieval",
    description: "Implement Self-RAG's decision logic to determine when retrieval is needed. Why: Not every query needs retrieval. Solves: Reduces latency and cost for simple questions.",
    group: "Phase 7 — SOTA Architectures & Agentic Memory",
    difficulty: "medium",
    xpReward: 100,
    starterCode: `from typing import Literal, Tuple

def needs_retrieval(query: str) -> Literal["yes", "no"]:
    """
    Decide if a query needs external retrieval.
    
    Return "yes" for:
    - Specific facts, dates, numbers
    - Current events
    - Domain-specific questions
    
    Return "no" for:
    - Common knowledge
    - Definitions
    - Math/logic questions
    """
    # TODO: Implement
    raise NotImplementedError

def grade_document_relevance(query: str, document: str) -> Literal["relevant", "irrelevant"]:
    """
    Grade if a retrieved document is relevant to the query.
    
    Use keyword overlap as a heuristic.
    """
    # TODO: Implement
    raise NotImplementedError

def is_response_supported(response: str, documents: list) -> Tuple[bool, float]:
    """
    Check if response is supported by documents.
    
    Returns (is_supported, confidence_score).
    """
    # TODO: Implement
    raise NotImplementedError
`,
    testCode: `# Test retrieval decision
assert needs_retrieval("What is 2 + 2?") == "no"
assert needs_retrieval("What was Apple's revenue in Q3 2024?") == "yes"
assert needs_retrieval("Define photosynthesis") == "no"
assert needs_retrieval("What does our refund policy say?") == "yes"

# Test document relevance
query = "How to reset password?"
doc1 = "To reset your password, click forgot password link."
doc2 = "Our company was founded in 2010."
assert grade_document_relevance(query, doc1) == "relevant"
assert grade_document_relevance(query, doc2) == "irrelevant"

# Test response support
docs = ["The refund period is 30 days."]
supported, conf = is_response_supported("You have 30 days for refund.", docs)
assert supported == True
assert conf > 0.5

print("Self-RAG adaptive retrieval passed!")`,
    hints: [
      "Look for temporal markers ('2024', 'latest') and specific entity names.",
      "Use word overlap ratio for document relevance scoring.",
      "Check if key terms from response appear in documents.",
    ],
    solution: `from typing import Literal, Tuple
import re

RETRIEVAL_TRIGGERS = ["revenue", "policy", "latest", "current", "2024", "2025", "our", "your"]
COMMON_KNOWLEDGE = ["define", "what is", "2 + 2", "capital of"]

def needs_retrieval(query: str) -> Literal["yes", "no"]:
    """Decide if a query needs external retrieval."""
    query_lower = query.lower()
    
    # Check for common knowledge queries
    for pattern in COMMON_KNOWLEDGE:
        if pattern in query_lower:
            return "no"
    
    # Check for retrieval triggers
    for trigger in RETRIEVAL_TRIGGERS:
        if trigger in query_lower:
            return "yes"
    
    # Default: if asking about specific entities or has numbers, retrieve
    if re.search(r'\\b(company|product|service|Q[1-4])\\b', query, re.I):
        return "yes"
    
    return "no"

def grade_document_relevance(query: str, document: str) -> Literal["relevant", "irrelevant"]:
    """Grade if a retrieved document is relevant to the query."""
    query_words = set(query.lower().split())
    doc_words = set(document.lower().split())
    
    # Remove common words
    stopwords = {"the", "a", "an", "is", "are", "to", "how", "what", "?"}
    query_words -= stopwords
    doc_words -= stopwords
    
    # Calculate overlap
    overlap = len(query_words & doc_words)
    if len(query_words) == 0:
        return "irrelevant"
    
    ratio = overlap / len(query_words)
    return "relevant" if ratio >= 0.3 else "irrelevant"

def is_response_supported(response: str, documents: list) -> Tuple[bool, float]:
    """Check if response is supported by documents."""
    response_words = set(response.lower().split())
    all_doc_words = set()
    for doc in documents:
        all_doc_words.update(doc.lower().split())
    
    # Remove common words
    stopwords = {"the", "a", "an", "is", "are", "to", "you", "have", "for"}
    response_words -= stopwords
    
    overlap = len(response_words & all_doc_words)
    if len(response_words) == 0:
        return (True, 1.0)
    
    confidence = overlap / len(response_words)
    return (confidence > 0.4, confidence)
`,
    realWorld: {
      description: "Self-RAG from CMU introduces reflection tokens that let the model decide when to retrieve, improving both efficiency and answer quality.",
      companies: ["CMU", "Microsoft Research"],
      useCases: ["Efficient RAG", "Cost Reduction"],
    },
    prerequisites: ["basic-retrieval"],
    relatedPlaybooks: ["rag-techniques-encyclopedia", "tool-comparison-matrix"],
  },
  // ============================================================
  // QUANTIZATION & COMPRESSION
  // ============================================================
  {
    slug: "quantization-deep-dive",
    title: "Scalar Quantization (INT8)",
    description: "Implement INT8 scalar quantization to reduce embedding storage by 4x. Why: Full float32 vectors are expensive. Solves: Reduces memory and storage costs significantly.",
    group: "Phase 8 — High-Scale Infrastructure & Compression",
    difficulty: "medium",
    xpReward: 100,
    starterCode: `from typing import List, Tuple
import math

def quantize_scalar(vector: List[float]) -> Tuple[List[int], float, float]:
    """
    Quantize a float32 vector to int8 values.
    
    Algorithm:
    1. Find min and max of the vector.
    2. Map [min, max] -> [0, 255].
    3. Round to nearest integer.
    
    Returns: (quantized_vector, min_val, max_val)
    """
    # TODO: Implement
    raise NotImplementedError

def dequantize_scalar(quantized: List[int], min_val: float, max_val: float) -> List[float]:
    """
    Reconstruct float32 vector from int8 quantized values.
    
    Reverse the quantization mapping.
    """
    # TODO: Implement
    raise NotImplementedError

def quantized_dot_product(q1: List[int], q2: List[int], 
                          min1: float, max1: float, 
                          min2: float, max2: float) -> float:
    """
    Compute approximate dot product from quantized vectors.
    
    This is faster than dequantizing then computing.
    """
    # TODO: Implement
    raise NotImplementedError
`,
    testCode: `def almost_equal(a, b, eps=0.1):
    return abs(a - b) <= eps

# Test quantization/dequantization
vec = [0.1, 0.5, -0.3, 0.9, -0.8]
quant, min_v, max_v = quantize_scalar(vec)

# Check quantized values are in valid range
assert all(0 <= q <= 255 for q in quant)

# Check reconstruction quality
reconstructed = dequantize_scalar(quant, min_v, max_v)
for orig, recon in zip(vec, reconstructed):
    assert almost_equal(orig, recon, eps=0.05)

# Test quantized dot product
v1 = [1.0, 0.5, 0.0]
v2 = [0.5, 1.0, 0.0]
q1, min1, max1 = quantize_scalar(v1)
q2, min2, max2 = quantize_scalar(v2)

true_dot = sum(a * b for a, b in zip(v1, v2))  # 1.0
approx_dot = quantized_dot_product(q1, q2, min1, max1, min2, max2)
assert almost_equal(true_dot, approx_dot, eps=0.2)

print("Scalar quantization passed!")`,
    hints: [
      "Linear mapping: q = round((v - min) / (max - min) * 255)",
      "Dequantize: v = q / 255 * (max - min) + min",
      "For dot product, you can work with scaled integers and adjust at the end.",
    ],
    solution: `from typing import List, Tuple
import math

def quantize_scalar(vector: List[float]) -> Tuple[List[int], float, float]:
    """Quantize a float32 vector to int8 values."""
    if not vector:
        return ([], 0.0, 0.0)
    
    min_val = min(vector)
    max_val = max(vector)
    
    # Handle edge case where all values are the same
    if max_val == min_val:
        return ([128] * len(vector), min_val, max_val)
    
    # Map to 0-255 range
    quantized = []
    for v in vector:
        q = round((v - min_val) / (max_val - min_val) * 255)
        quantized.append(int(q))
    
    return (quantized, min_val, max_val)

def dequantize_scalar(quantized: List[int], min_val: float, max_val: float) -> List[float]:
    """Reconstruct float32 vector from int8 quantized values."""
    if max_val == min_val:
        return [min_val] * len(quantized)
    
    return [q / 255 * (max_val - min_val) + min_val for q in quantized]

def quantized_dot_product(q1: List[int], q2: List[int], 
                          min1: float, max1: float, 
                          min2: float, max2: float) -> float:
    """Compute approximate dot product from quantized vectors."""
    # Dequantize and compute
    v1 = dequantize_scalar(q1, min1, max1)
    v2 = dequantize_scalar(q2, min2, max2)
    return sum(a * b for a, b in zip(v1, v2))
`,
    realWorld: {
      description: "Scalar quantization is used by Pinecone, Milvus, and Qdrant to reduce memory by 4x with <5% accuracy loss.",
      companies: ["Pinecone", "Milvus", "Qdrant"],
      useCases: ["Large-scale Vector Search", "Cost Optimization"],
    },
    relatedPlaybooks: ["tool-comparison-matrix", "production-deployment-checklist"],
  },
  // ============================================================
  // SEMANTIC CACHING
  // ============================================================
  {
    slug: "semantic-caching",
    title: "Semantic Query Cache",
    description: "Build a semantic cache that matches similar queries to cached responses. Why: Identical queries are rare, but similar queries are common. Solves: Reduces LLM costs by up to 80%.",
    group: "Phase 8 — High-Scale Infrastructure & Compression",
    difficulty: "medium",
    xpReward: 100,
    starterCode: `from typing import Dict, List, Optional, Tuple
import math

class SemanticCache:
    def __init__(self, similarity_threshold: float = 0.9):
        self.threshold = similarity_threshold
        self.cache: List[Dict] = []  # [{query, embedding, response}]
    
    def _cosine_similarity(self, a: List[float], b: List[float]) -> float:
        """Compute cosine similarity between two vectors."""
        # TODO: Implement
        raise NotImplementedError
    
    def get(self, query_embedding: List[float]) -> Optional[str]:
        """
        Find a cached response for a similar query.
        
        Returns the response if similarity > threshold, else None.
        """
        # TODO: Implement
        raise NotImplementedError
    
    def set(self, query: str, query_embedding: List[float], response: str):
        """Cache a query-response pair."""
        # TODO: Implement
        raise NotImplementedError
    
    def get_stats(self) -> Dict:
        """Return cache statistics: size, hit rate, etc."""
        # TODO: Implement
        raise NotImplementedError
`,
    testCode: `cache = SemanticCache(similarity_threshold=0.8)

# Create fake embeddings (in practice, use real embedding model)
def fake_embed(text):
    # Simple: use character counts as fake embedding
    return [len(text), text.count('a'), text.count('e'), text.count(' ')]

# Test caching
q1 = "What is the refund policy?"
e1 = fake_embed(q1)
cache.set(q1, e1, "You have 30 days to return items.")

# Exact match should hit
result = cache.get(e1)
assert result == "You have 30 days to return items."

# Similar query should also hit (in real scenario)
q2 = "What is our refund policy?"
e2 = fake_embed(q2)
# Note: With fake embeddings, this may or may not hit

# Stats
stats = cache.get_stats()
assert "size" in stats
assert stats["size"] == 1

print("Semantic cache passed!")`,
    hints: [
      "Cosine similarity: dot(a,b) / (|a| * |b|)",
      "Linear search through cache is fine for small caches; use ANN for large.",
      "Track hits and misses for stats.",
    ],
    solution: `from typing import Dict, List, Optional, Tuple
import math

class SemanticCache:
    def __init__(self, similarity_threshold: float = 0.9):
        self.threshold = similarity_threshold
        self.cache: List[Dict] = []
        self.hits = 0
        self.misses = 0
    
    def _cosine_similarity(self, a: List[float], b: List[float]) -> float:
        """Compute cosine similarity between two vectors."""
        dot = sum(x * y for x, y in zip(a, b))
        norm_a = math.sqrt(sum(x * x for x in a))
        norm_b = math.sqrt(sum(x * x for x in b))
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return dot / (norm_a * norm_b)
    
    def get(self, query_embedding: List[float]) -> Optional[str]:
        """Find a cached response for a similar query."""
        best_match = None
        best_score = 0.0
        
        for entry in self.cache:
            score = self._cosine_similarity(query_embedding, entry["embedding"])
            if score > best_score and score >= self.threshold:
                best_score = score
                best_match = entry["response"]
        
        if best_match:
            self.hits += 1
        else:
            self.misses += 1
        
        return best_match
    
    def set(self, query: str, query_embedding: List[float], response: str):
        """Cache a query-response pair."""
        self.cache.append({
            "query": query,
            "embedding": query_embedding,
            "response": response
        })
    
    def get_stats(self) -> Dict:
        """Return cache statistics."""
        total = self.hits + self.misses
        return {
            "size": len(self.cache),
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate": self.hits / total if total > 0 else 0.0
        }
`,
    realWorld: {
      description: "GPTCache and similar tools use semantic caching to reduce LLM API costs by matching semantically similar queries.",
      companies: ["GPTCache", "LangChain", "Redis"],
      useCases: ["Cost Reduction", "Latency Improvement"],
    },
    prerequisites: ["embedding-cache"],
    relatedPlaybooks: ["production-deployment-checklist", "rag-troubleshooting-guide"],
  },
  // ============================================================
  // QUERY ROUTING
  // ============================================================
  {
    slug: "query-routing",
    title: "Intelligent Query Router",
    description: "Route queries to the optimal retrieval pipeline based on query characteristics. Why: One-size-fits-all retrieval is suboptimal. Solves: Improved accuracy by matching query type to retrieval strategy.",
    group: "Phase 5 — Query Transformations",
    difficulty: "medium",
    xpReward: 100,
    starterCode: `from typing import Literal

def classify_query_type(query: str) -> Literal["factual", "analytical", "conversational", "code"]:
    """
    Classify the type of query.
    
    - factual: "What is X?", "When did Y happen?"
    - analytical: "Compare X and Y", "Why does Z happen?"
    - conversational: "Hello", "Thanks", "Can you help me?"
    - code: Contains code keywords or asking about programming
    """
    # TODO: Implement
    raise NotImplementedError

def classify_complexity(query: str) -> Literal["simple", "medium", "complex"]:
    """
    Classify query complexity.
    
    - simple: Single concept, direct question
    - medium: Multiple concepts, moderate depth
    - complex: Multi-hop reasoning, comparisons, analysis
    """
    # TODO: Implement
    raise NotImplementedError

def route_query(query: str) -> dict:
    """
    Route query to appropriate pipeline configuration.
    
    Returns:
    {
        "retrieval_k": int,  # Number of docs to retrieve
        "use_reranker": bool,
        "model": str,  # "fast" or "quality"
        "strategy": str  # "dense", "hybrid", "multi-query"
    }
    """
    # TODO: Implement
    raise NotImplementedError
`,
    testCode: `# Test query type classification
assert classify_query_type("What is machine learning?") == "factual"
assert classify_query_type("Compare Python and JavaScript") == "analytical"
assert classify_query_type("Hello, how are you?") == "conversational"
assert classify_query_type("How to implement a binary search in Python?") == "code"

# Test complexity classification
assert classify_complexity("What is RAG?") == "simple"
assert classify_complexity("Explain how RAG improves LLM accuracy") == "medium"
assert classify_complexity("Compare RAPTOR vs GraphRAG for multi-hop reasoning in legal documents") == "complex"

# Test routing
route1 = route_query("What is RAG?")
assert route1["retrieval_k"] <= 5  # Simple query, fewer docs

route2 = route_query("Compare RAPTOR and GraphRAG approaches")
assert route2["use_reranker"] == True  # Complex needs reranking
assert route2["retrieval_k"] >= 10

print("Query routing passed!")`,
    hints: [
      "Look for question words: 'what', 'when' -> factual; 'compare', 'why' -> analytical.",
      "Code queries often contain: 'implement', 'code', 'function', 'Python', 'JavaScript'.",
      "Complexity can be estimated by query length, number of concepts, or presence of comparison words.",
    ],
    solution: `from typing import Literal

def classify_query_type(query: str) -> Literal["factual", "analytical", "conversational", "code"]:
    """Classify the type of query."""
    query_lower = query.lower()
    
    # Check for code queries
    code_keywords = ["implement", "code", "function", "python", "javascript", "algorithm", "binary search"]
    if any(kw in query_lower for kw in code_keywords):
        return "code"
    
    # Check for conversational
    conversational = ["hello", "hi", "thank", "how are you", "bye"]
    if any(c in query_lower for c in conversational):
        return "conversational"
    
    # Check for analytical
    analytical = ["compare", "why", "analyze", "difference", "versus", "vs"]
    if any(a in query_lower for a in analytical):
        return "analytical"
    
    # Default to factual
    return "factual"

def classify_complexity(query: str) -> Literal["simple", "medium", "complex"]:
    """Classify query complexity."""
    words = query.split()
    num_words = len(words)
    
    # Complex indicators
    complex_words = ["compare", "versus", "multi-hop", "reasoning", "analyze"]
    has_complex = any(c in query.lower() for c in complex_words)
    
    if has_complex or num_words > 15:
        return "complex"
    elif num_words > 8:
        return "medium"
    else:
        return "simple"

def route_query(query: str) -> dict:
    """Route query to appropriate pipeline configuration."""
    query_type = classify_query_type(query)
    complexity = classify_complexity(query)
    
    # Base config
    config = {
        "retrieval_k": 5,
        "use_reranker": False,
        "model": "fast",
        "strategy": "dense"
    }
    
    # Adjust based on complexity
    if complexity == "complex":
        config["retrieval_k"] = 15
        config["use_reranker"] = True
        config["model"] = "quality"
        config["strategy"] = "hybrid"
    elif complexity == "medium":
        config["retrieval_k"] = 10
        config["use_reranker"] = True
        
    # Adjust based on type
    if query_type == "code":
        config["strategy"] = "hybrid"
    
    return config
`,
    timeEstimate: { minutes: 30, label: "30-40 min" },
    realWorld: {
      description: "Production RAG systems at companies like Notion and Notion use query routing to balance speed and quality.",
      companies: ["Notion", "Salesforce", "Databricks"],
      useCases: ["Adaptive RAG", "Cost-Quality Optimization"],
    },
  },
  // ============================================================
  // HALLUCINATION DETECTION
  // ============================================================
  {
    slug: "hallucination-detection",
    title: "Claim-Based Hallucination Detector",
    description: "Detect hallucinations by extracting and verifying claims against source documents. Why: LLMs can generate plausible but incorrect information. Solves: Ensures response fidelity to source material.",
    group: "Phase 4 — Grounding & Safety",
    difficulty: "hard",
    xpReward: 125,
    starterCode: `from typing import List, Tuple

def extract_claims(response: str) -> List[str]:
    """
    Extract factual claims from a response.
    
    A claim is a statement that can be verified as true or false.
    Split complex sentences into atomic claims.
    
    Example:
    "Paris is the capital of France and has the Eiffel Tower."
    -> ["Paris is the capital of France", "Paris has the Eiffel Tower"]
    """
    # TODO: Implement
    raise NotImplementedError

def verify_claim(claim: str, context: str) -> Tuple[bool, float]:
    """
    Verify if a claim is supported by the context.
    
    Returns (is_supported, confidence).
    Use keyword overlap as a simple heuristic.
    """
    # TODO: Implement
    raise NotImplementedError

def detect_hallucinations(response: str, sources: List[str]) -> dict:
    """
    Full hallucination detection pipeline.
    
    Returns:
    {
        "claims": [list of extracted claims],
        "verified": [list of (claim, is_supported, confidence)],
        "hallucination_rate": float (0-1),
        "flagged_claims": [claims not supported by sources]
    }
    """
    # TODO: Implement
    raise NotImplementedError
`,
    testCode: `# Test claim extraction
response = "The company was founded in 2020. It has 500 employees."
claims = extract_claims(response)
assert len(claims) >= 2
assert any("2020" in c for c in claims)
assert any("500" in c or "employees" in c for c in claims)

# Test claim verification
context = "TechCorp was founded in 2020 by John Smith. The company has grown to 500 employees."
supported, conf = verify_claim("The company was founded in 2020", context)
assert supported == True
assert conf > 0.5

not_supported, conf2 = verify_claim("The company is based in Paris", context)
assert not_supported == False

# Test full pipeline
sources = ["The refund period is 30 days. No exceptions apply."]
response2 = "You have 30 days for refunds. Extensions may be granted on request."
result = detect_hallucinations(response2, sources)
assert "hallucination_rate" in result
assert len(result["flagged_claims"]) >= 1  # "Extensions may be granted" is not supported

print("Hallucination detection passed!")`,
    hints: [
      "Split on 'and', '.', ';' to get atomic claims.",
      "For verification, check if key words from claim appear in context.",
      "Hallucination rate = unsupported claims / total claims.",
    ],
    solution: `from typing import List, Tuple
import re

def extract_claims(response: str) -> List[str]:
    """Extract factual claims from a response."""
    # Split by sentence terminators and connectors
    claims = []
    
    # First split by periods
    sentences = re.split(r'[.!?]', response)
    
    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
        
        # Split by 'and' for compound sentences
        parts = re.split(r'\\s+and\\s+', sentence, flags=re.I)
        for part in parts:
            part = part.strip()
            if len(part) > 10:  # Filter very short fragments
                claims.append(part)
    
    return claims

def verify_claim(claim: str, context: str) -> Tuple[bool, float]:
    """Verify if a claim is supported by the context."""
    claim_words = set(claim.lower().split())
    context_words = set(context.lower().split())
    
    # Remove stopwords
    stopwords = {"the", "a", "an", "is", "was", "are", "were", "to", "in", "of"}
    claim_words -= stopwords
    
    if len(claim_words) == 0:
        return (True, 1.0)
    
    # Calculate overlap
    overlap = len(claim_words & context_words)
    confidence = overlap / len(claim_words)
    
    return (confidence >= 0.4, confidence)

def detect_hallucinations(response: str, sources: List[str]) -> dict:
    """Full hallucination detection pipeline."""
    claims = extract_claims(response)
    combined_context = " ".join(sources)
    
    verified = []
    flagged = []
    
    for claim in claims:
        is_supported, conf = verify_claim(claim, combined_context)
        verified.append((claim, is_supported, conf))
        if not is_supported:
            flagged.append(claim)
    
    hallucination_rate = len(flagged) / len(claims) if claims else 0.0
    
    return {
        "claims": claims,
        "verified": verified,
        "hallucination_rate": hallucination_rate,
        "flagged_claims": flagged
    }
`,
    timeEstimate: { minutes: 35, label: "35-45 min" },
    realWorld: {
      description: "Claim-based verification is used by Anthropic's Constitutional AI and tools like TruLens to ensure LLM outputs are grounded.",
      companies: ["Anthropic", "TruLens", "Arize AI"],
      useCases: ["Response Verification", "Quality Assurance"],
    },
  },
  // ============================================================
  // CONTEXT WINDOW OPTIMIZATION
  // ============================================================
  {
    slug: "context-window-optimization",
    title: "Context Window Packer",
    description: "Optimize context window usage by intelligently packing documents within token limits. Why: Context windows are expensive. Solves: Maximize information density while staying under limits.",
    group: "Phase 3 — Post-Retrieval",
    difficulty: "medium",
    xpReward: 75,
    starterCode: `from typing import List, Tuple

def estimate_tokens(text: str) -> int:
    """Estimate token count (approx 4 chars per token)."""
    return len(text) // 4

def pack_context(documents: List[str], max_tokens: int) -> Tuple[List[str], int]:
    """
    Pack documents into context within token limit.
    
    Returns:
    - List of packed documents (may be truncated)
    - Total tokens used
    
    Strategy: Take documents in order, truncate last if needed.
    """
    # TODO: Implement
    raise NotImplementedError

def optimal_ordering(documents: List[dict], query: str) -> List[dict]:
    """
    Order documents optimally for attention.
    
    Research shows: beginning and end get most attention.
    Put most relevant at beginning, second-most at end.
    
    documents: [{text: str, score: float}]
    """
    # TODO: Implement
    raise NotImplementedError

def compress_document(document: str, target_tokens: int) -> str:
    """
    Compress a document to target token count.
    
    Strategy: Extract sentences, keep most important ones.
    Importance = sentence length (longer = more content).
    """
    # TODO: Implement
    raise NotImplementedError
`,
    testCode: `# Test token estimation
assert estimate_tokens("Hello world") == 2 or estimate_tokens("Hello world") == 3

# Test context packing
docs = ["Short doc.", "This is a medium length document with more content.", "Another short one."]
packed, tokens = pack_context(docs, max_tokens=20)
assert tokens <= 20
assert len(packed) >= 1

# Test optimal ordering
documents = [
    {"text": "Highly relevant", "score": 0.9},
    {"text": "Somewhat relevant", "score": 0.7},
    {"text": "Less relevant", "score": 0.5},
]
ordered = optimal_ordering(documents, "test query")
assert ordered[0]["score"] == 0.9  # Best at start
assert ordered[-1]["score"] == 0.7  # Second best at end

# Test compression
long_doc = "This is sentence one. This is sentence two. This is sentence three. Short."
compressed = compress_document(long_doc, target_tokens=10)
assert estimate_tokens(compressed) <= 12  # Allow some tolerance

print("Context window optimization passed!")`,
    hints: [
      "Pack greedily: add documents until limit reached, truncate last.",
      "For ordering: sort by score, then interleave (best, worst, 2nd best, 2nd worst...).",
      "For compression: split into sentences, sort by length, take top N.",
    ],
    solution: `from typing import List, Tuple
import re

def estimate_tokens(text: str) -> int:
    """Estimate token count (approx 4 chars per token)."""
    return len(text) // 4

def pack_context(documents: List[str], max_tokens: int) -> Tuple[List[str], int]:
    """Pack documents into context within token limit."""
    packed = []
    total_tokens = 0
    
    for doc in documents:
        doc_tokens = estimate_tokens(doc)
        
        if total_tokens + doc_tokens <= max_tokens:
            packed.append(doc)
            total_tokens += doc_tokens
        else:
            # Truncate if there's remaining space
            remaining = max_tokens - total_tokens
            if remaining > 0:
                chars_allowed = remaining * 4
                packed.append(doc[:chars_allowed])
                total_tokens = max_tokens
            break
    
    return (packed, total_tokens)

def optimal_ordering(documents: List[dict], query: str) -> List[dict]:
    """Order documents optimally for attention (best at start, second at end)."""
    if not documents:
        return []
    
    # Sort by score descending
    sorted_docs = sorted(documents, key=lambda x: x["score"], reverse=True)
    
    if len(sorted_docs) <= 2:
        return sorted_docs
    
    # Lost-in-the-middle ordering: best first, second-best last
    result = []
    left = 0
    right = len(sorted_docs) - 1
    add_to_front = True
    
    for i, doc in enumerate(sorted_docs):
        if i == 0:
            result.append(doc)  # Best at front
        elif i == 1:
            result.append(doc)  # Temporarily add, will move to end
        else:
            result.insert(-1, doc)  # Insert before last
    
    # Swap position 1 to end for second-best at end
    if len(result) >= 2:
        result.append(result.pop(1))
    
    return result

def compress_document(document: str, target_tokens: int) -> str:
    """Compress a document to target token count."""
    sentences = re.split(r'(?<=[.!?])\\s+', document)
    
    # Sort by length (longer = more content)
    sorted_sentences = sorted(sentences, key=len, reverse=True)
    
    compressed = []
    total_tokens = 0
    
    for sentence in sorted_sentences:
        sent_tokens = estimate_tokens(sentence)
        if total_tokens + sent_tokens <= target_tokens:
            compressed.append(sentence)
            total_tokens += sent_tokens
        else:
            break
    
    return " ".join(compressed)
`,
    timeEstimate: { minutes: 25, label: "25-35 min" },
    realWorld: {
      description: "Context packing is critical for production RAG. Companies like Anthropic use sophisticated packing for Claude's 200K context.",
      companies: ["Anthropic", "OpenAI", "Google"],
      useCases: ["Long Context RAG", "Cost Optimization"],
    },
  },
  // ============================================================
  // STREAMING RAG
  // ============================================================
  {
    slug: "streaming-rag",
    title: "Streaming Response Generator",
    description: "Implement a streaming RAG response generator with proper chunking. Why: Users expect immediate feedback. Solves: Reduces perceived latency from seconds to milliseconds.",
    group: "Phase 8 — High-Scale Infrastructure & Compression",
    difficulty: "medium",
    xpReward: 100,
    starterCode: `from typing import Generator, List

def stream_tokens(text: str, chunk_size: int = 5) -> Generator[str, None, None]:
    """
    Stream text in token-sized chunks.
    
    Simulate token-by-token streaming by yielding word chunks.
    """
    # TODO: Implement
    raise NotImplementedError

class StreamingRAG:
    def __init__(self, retriever, generator_fn):
        self.retriever = retriever
        self.generator_fn = generator_fn
        self.metrics = {"ttft": None, "total_time": None}
    
    def query_stream(self, query: str) -> Generator[dict, None, None]:
        """
        Stream RAG response with metadata events.
        
        Yield events:
        - {"type": "retrieval_start"}
        - {"type": "retrieval_done", "count": N}
        - {"type": "token", "text": "..."}
        - {"type": "done", "metrics": {...}}
        """
        # TODO: Implement
        raise NotImplementedError
`,
    testCode: `# Test token streaming
text = "Hello world this is a test sentence"
tokens = list(stream_tokens(text, chunk_size=2))
assert len(tokens) >= 3
assert "".join(tokens).strip() == text or all(t.strip() in text for t in tokens)

# Test streaming RAG (mock)
def mock_retriever(q):
    return [{"text": "Doc 1"}, {"text": "Doc 2"}]

def mock_generator(q, docs):
    return "This is the generated response."

rag = StreamingRAG(mock_retriever, mock_generator)
events = list(rag.query_stream("test query"))

# Check event sequence
event_types = [e["type"] for e in events]
assert "retrieval_start" in event_types
assert "retrieval_done" in event_types
assert "token" in event_types
assert "done" in event_types

print("Streaming RAG passed!")`,
    hints: [
      "Split text by spaces, yield N words at a time.",
      "Track time between start and first token for TTFT.",
      "Yield structured events for frontend consumption.",
    ],
    solution: `from typing import Generator, List
import time

def stream_tokens(text: str, chunk_size: int = 5) -> Generator[str, None, None]:
    """Stream text in token-sized chunks."""
    words = text.split()
    for i in range(0, len(words), chunk_size):
        chunk = words[i:i + chunk_size]
        yield " ".join(chunk) + " "

class StreamingRAG:
    def __init__(self, retriever, generator_fn):
        self.retriever = retriever
        self.generator_fn = generator_fn
        self.metrics = {"ttft": None, "total_time": None}
    
    def query_stream(self, query: str) -> Generator[dict, None, None]:
        """Stream RAG response with metadata events."""
        start_time = time.time()
        
        # Retrieval phase
        yield {"type": "retrieval_start"}
        docs = self.retriever(query)
        yield {"type": "retrieval_done", "count": len(docs)}
        
        # Generation phase
        response = self.generator_fn(query, docs)
        first_token = True
        
        for token in stream_tokens(response, chunk_size=2):
            if first_token:
                self.metrics["ttft"] = time.time() - start_time
                first_token = False
            yield {"type": "token", "text": token}
        
        self.metrics["total_time"] = time.time() - start_time
        yield {"type": "done", "metrics": self.metrics}
`,
    timeEstimate: { minutes: 25, label: "25-35 min" },
    realWorld: {
      description: "All production chat interfaces (ChatGPT, Claude, Gemini) use streaming to reduce perceived latency.",
      companies: ["OpenAI", "Anthropic", "Google"],
      useCases: ["Chat Interfaces", "User Experience"],
    },
  },
  // ============================================================
  // EVALUATION
  // ============================================================
  {
    slug: "rag-evaluation-suite",
    title: "RAG Evaluation Metrics",
    description: "Implement core RAG evaluation metrics: context precision, faithfulness, and answer relevance. Why: You can't improve what you can't measure. Solves: Systematic quality assessment.",
    group: "Phase 9 — Strategic Operations (LLM-as-a-Judge)",
    difficulty: "hard",
    xpReward: 125,
    starterCode: `from typing import List

def context_precision(query: str, contexts: List[str], ground_truth: str) -> float:
    """
    Measure what fraction of retrieved contexts are relevant.
    
    A context is relevant if it contains keywords from the ground truth.
    
    Returns: relevant_contexts / total_contexts
    """
    # TODO: Implement
    raise NotImplementedError

def context_recall(ground_truth: str, contexts: List[str]) -> float:
    """
    Measure what fraction of ground truth info is in contexts.
    
    Check if key terms from ground_truth appear in any context.
    
    Returns: found_terms / total_terms
    """
    # TODO: Implement
    raise NotImplementedError

def faithfulness_score(response: str, contexts: List[str]) -> float:
    """
    Measure if response is grounded in contexts.
    
    Check if key terms in response appear in contexts.
    
    Returns: grounded_terms / total_terms
    """
    # TODO: Implement
    raise NotImplementedError

def answer_relevance(query: str, response: str) -> float:
    """
    Measure if response actually answers the query.
    
    Check if response contains query keywords.
    
    Returns: 0-1 score
    """
    # TODO: Implement
    raise NotImplementedError
`,
    testCode: `# Test context precision
query = "What is the refund policy?"
contexts = [
    "Our refund policy allows returns within 30 days.",
    "The weather today is sunny.",
    "Refunds are processed within 5 business days."
]
ground_truth = "30 day refund policy"
precision = context_precision(query, contexts, ground_truth)
assert 0.3 < precision < 0.8  # 2/3 contexts are relevant

# Test context recall
recall = context_recall(ground_truth, contexts)
assert recall > 0.5  # Should find "30", "refund", "policy"

# Test faithfulness
response = "You can return items within 30 days and get a refund."
faith = faithfulness_score(response, contexts)
assert faith > 0.6

# Test answer relevance
relevance = answer_relevance(query, response)
assert relevance > 0.5

print("RAG evaluation metrics passed!")`,
    hints: [
      "Extract key terms by filtering out common words (the, is, a, etc.).",
      "Use set intersection to find matching terms.",
      "Normalize scores to 0-1 range.",
    ],
    solution: `from typing import List

STOPWORDS = {"the", "a", "an", "is", "are", "was", "were", "to", "of", "in", "for", "on", "with"}

def extract_keywords(text: str) -> set:
    """Extract keywords by removing stopwords."""
    words = set(text.lower().split())
    return words - STOPWORDS

def context_precision(query: str, contexts: List[str], ground_truth: str) -> float:
    """Measure what fraction of retrieved contexts are relevant."""
    if not contexts:
        return 0.0
    
    gt_keywords = extract_keywords(ground_truth)
    relevant_count = 0
    
    for context in contexts:
        context_words = extract_keywords(context)
        overlap = len(gt_keywords & context_words)
        if overlap >= 1:  # At least one keyword match
            relevant_count += 1
    
    return relevant_count / len(contexts)

def context_recall(ground_truth: str, contexts: List[str]) -> float:
    """Measure what fraction of ground truth info is in contexts."""
    gt_keywords = extract_keywords(ground_truth)
    if not gt_keywords:
        return 1.0
    
    all_context_words = set()
    for context in contexts:
        all_context_words.update(extract_keywords(context))
    
    found = len(gt_keywords & all_context_words)
    return found / len(gt_keywords)

def faithfulness_score(response: str, contexts: List[str]) -> float:
    """Measure if response is grounded in contexts."""
    response_keywords = extract_keywords(response)
    if not response_keywords:
        return 1.0
    
    all_context_words = set()
    for context in contexts:
        all_context_words.update(extract_keywords(context))
    
    grounded = len(response_keywords & all_context_words)
    return grounded / len(response_keywords)

def answer_relevance(query: str, response: str) -> float:
    """Measure if response actually answers the query."""
    query_keywords = extract_keywords(query)
    response_keywords = extract_keywords(response)
    
    if not query_keywords:
        return 1.0
    
    overlap = len(query_keywords & response_keywords)
    return overlap / len(query_keywords)
`,
    timeEstimate: { minutes: 35, label: "35-45 min" },
    realWorld: {
      description: "RAGAS and similar frameworks use these metrics to evaluate RAG quality systematically.",
      companies: ["Ragas", "Arize AI", "LangSmith"],
      useCases: ["Quality Measurement", "A/B Testing"],
    },
  },
  // ============================================================
  // DOCUMENT PARSING
  // ============================================================
  {
    slug: "document-parsing-guide",
    title: "Markdown Document Parser",
    description: "Parse markdown documents into structured sections for better chunking. Why: Structure-aware chunking outperforms naive splitting. Solves: Preserves document semantics during ingestion.",
    group: "Phase 1 — Pre-Retrieval",
    difficulty: "easy",
    xpReward: 50,
    starterCode: `from typing import Dict, List
import re

def parse_markdown_headers(content: str) -> List[Dict]:
    """
    Extract headers and their content from markdown.
    
    Returns list of: {"level": int, "title": str, "content": str}
    """
    # TODO: Implement
    raise NotImplementedError

def extract_code_blocks(content: str) -> List[Dict]:
    """
    Extract fenced code blocks from markdown.
    
    Returns list of: {"language": str, "code": str}
    """
    # TODO: Implement
    raise NotImplementedError

def chunk_by_section(content: str, max_chunk_size: int = 500) -> List[Dict]:
    """
    Chunk markdown by sections, respecting headers.
    
    Each chunk should:
    - Include the section header
    - Not exceed max_chunk_size characters
    - Not split mid-sentence
    
    Returns list of: {"header": str, "content": str, "level": int}
    """
    # TODO: Implement
    raise NotImplementedError
`,
    testCode: `md = """# Introduction
This is the intro paragraph.

## Section 1
Content for section 1.

### Subsection 1.1
More detailed content here.

## Section 2
Final section content.
"""

# Test header parsing
headers = parse_markdown_headers(md)
assert len(headers) >= 4
assert headers[0]["level"] == 1
assert headers[0]["title"] == "Introduction"

# Test code block extraction
md_with_code = """
Some text
\`\`\`python
def hello():
    print("Hi")
\`\`\`
More text
"""
blocks = extract_code_blocks(md_with_code)
assert len(blocks) == 1
assert blocks[0]["language"] == "python"
assert "hello" in blocks[0]["code"]

# Test chunking
chunks = chunk_by_section(md, max_chunk_size=200)
assert len(chunks) >= 2
assert all(len(c["content"]) <= 200 for c in chunks)

print("Markdown parser passed!")`,
    hints: [
      "Use regex: ^(#{1,6})\\s+(.+)$ to match headers.",
      "Code blocks: ```(\\w*)\\n([\\s\\S]*?)```",
      "Track current header and accumulate content until next header.",
    ],
    solution: `from typing import Dict, List
import re

def parse_markdown_headers(content: str) -> List[Dict]:
    """Extract headers and their content from markdown."""
    headers = []
    lines = content.split('\\n')
    current_header = None
    current_content = []
    
    for line in lines:
        # Check if line is a header
        match = re.match(r'^(#{1,6})\\s+(.+)$', line)
        if match:
            # Save previous header
            if current_header:
                current_header["content"] = '\\n'.join(current_content).strip()
                headers.append(current_header)
            
            # Start new header
            current_header = {
                "level": len(match.group(1)),
                "title": match.group(2),
                "content": ""
            }
            current_content = []
        else:
            current_content.append(line)
    
    # Don't forget last header
    if current_header:
        current_header["content"] = '\\n'.join(current_content).strip()
        headers.append(current_header)
    
    return headers

def extract_code_blocks(content: str) -> List[Dict]:
    """Extract fenced code blocks from markdown."""
    pattern = r'\`\`\`(\\w*)\\n([\\s\\S]*?)\`\`\`'
    blocks = []
    
    for match in re.finditer(pattern, content):
        blocks.append({
            "language": match.group(1) or "text",
            "code": match.group(2).strip()
        })
    
    return blocks

def chunk_by_section(content: str, max_chunk_size: int = 500) -> List[Dict]:
    """Chunk markdown by sections, respecting headers."""
    headers = parse_markdown_headers(content)
    chunks = []
    
    for header in headers:
        full_text = f"# {header['title']}\\n{header['content']}"
        
        if len(full_text) <= max_chunk_size:
            chunks.append({
                "header": header["title"],
                "content": full_text,
                "level": header["level"]
            })
        else:
            # Truncate to max size
            chunks.append({
                "header": header["title"],
                "content": full_text[:max_chunk_size],
                "level": header["level"]
            })
    
    return chunks
`,
    timeEstimate: { minutes: 30, label: "30-40 min" },
    realWorld: {
      description: "LlamaIndex and Unstructured.io provide sophisticated document parsers for production RAG systems.",
      companies: ["LlamaIndex", "Unstructured.io", "Docugami"],
      useCases: ["Document Ingestion", "Knowledge Base Building"],
    },
  },
  // ============================================================
  // COLBERT & LATE INTERACTION
  // ============================================================
  {
    slug: "colbert-late-interaction",
    title: "ColBERT: Late Interaction Scoring",
    description: "Implement ColBERT's MaxSim scoring for token-level matching. Why: Single-vector embeddings lose fine-grained information. Solves: Better matching for complex queries.",
    group: "Phase 2 — Retrieval",
    difficulty: "hard",
    xpReward: 150,
    starterCode: `from typing import List
import math

def maxsim_score(query_tokens: List[List[float]], doc_tokens: List[List[float]]) -> float:
    """
    Compute ColBERT-style MaxSim score.
    
    For each query token, find max similarity to any doc token.
    Sum all max similarities.
    
    query_tokens: List of query token embeddings
    doc_tokens: List of document token embeddings
    """
    # TODO: Implement
    raise NotImplementedError

def cosine_sim(a: List[float], b: List[float]) -> float:
    """Compute cosine similarity."""
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(x * x for x in b))
    if norm_a == 0 or norm_b == 0:
        return 0
    return dot / (norm_a * norm_b)

def rank_documents(query_tokens: List[List[float]], 
                   documents: List[List[List[float]]]) -> List[int]:
    """
    Rank documents by MaxSim score.
    
    documents: List of document token embeddings
    Returns: Indices sorted by score (descending)
    """
    # TODO: Implement
    raise NotImplementedError
`,
    testCode: `# Test MaxSim scoring
query = [[1.0, 0.0], [0.0, 1.0]]  # 2 query tokens
doc = [[0.9, 0.1], [0.1, 0.9], [0.5, 0.5]]  # 3 doc tokens

score = maxsim_score(query, doc)
# Query token 1 should max-match with doc token 1
# Query token 2 should max-match with doc token 2
assert score > 1.5  # Sum of two high similarities

# Test ranking
doc1 = [[1.0, 0.0], [0.0, 1.0]]  # Very similar to query
doc2 = [[0.5, 0.5], [0.5, 0.5]]  # Less similar
doc3 = [[-1.0, 0.0], [0.0, -1.0]]  # Opposite

rankings = rank_documents(query, [doc1, doc2, doc3])
assert rankings[0] == 0  # doc1 should rank first
assert rankings[-1] == 2  # doc3 should rank last

print("ColBERT MaxSim passed!")`,
    hints: [
      "For each query token, compute similarity to ALL doc tokens, take max.",
      "Sum all max similarities to get final score.",
      "Higher score = more relevant document.",
    ],
    solution: `from typing import List
import math

def cosine_sim(a: List[float], b: List[float]) -> float:
    """Compute cosine similarity."""
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(x * x for x in b))
    if norm_a == 0 or norm_b == 0:
        return 0
    return dot / (norm_a * norm_b)

def maxsim_score(query_tokens: List[List[float]], doc_tokens: List[List[float]]) -> float:
    """Compute ColBERT-style MaxSim score."""
    total_score = 0.0
    
    for q_token in query_tokens:
        # Find max similarity to any doc token
        max_sim = 0.0
        for d_token in doc_tokens:
            sim = cosine_sim(q_token, d_token)
            max_sim = max(max_sim, sim)
        total_score += max_sim
    
    return total_score

def rank_documents(query_tokens: List[List[float]], 
                   documents: List[List[List[float]]]) -> List[int]:
    """Rank documents by MaxSim score."""
    scores = []
    for i, doc_tokens in enumerate(documents):
        score = maxsim_score(query_tokens, doc_tokens)
        scores.append((i, score))
    
    # Sort by score descending
    sorted_docs = sorted(scores, key=lambda x: x[1], reverse=True)
    return [idx for idx, _ in sorted_docs]
`,
    timeEstimate: { minutes: 35, label: "35-45 min" },
    realWorld: {
      description: "ColBERT from Stanford achieves better accuracy than single-vector retrieval while remaining fast through late interaction.",
      companies: ["Stanford NLP", "Vespa", "Jina AI"],
      useCases: ["High-precision Search", "Legal/Medical RAG"],
    },
  },
  // ============================================================
  // RAPTOR TREE
  // ============================================================
  {
    slug: "raptor-tree-retrieval",
    title: "RAPTOR: Hierarchical Summarization",
    description: "Build a hierarchical tree where leaves are chunks and nodes are summaries. Why: Enables both local and global search. Solves: Long-range document reasoning.",
    group: "Phase 7 — SOTA Architectures & Agentic Memory",
    difficulty: "hard",
    xpReward: 150,
    starterCode: `from typing import List, Dict, Callable

class RAPTORNode:
    def __init__(self, text: str, children: List["RAPTORNode"] = None):
        self.text = text
        self.children = children or []
        self.is_leaf = len(self.children) == 0

def build_layer(nodes: List[RAPTORNode], summarize_fn: Callable, group_size: int = 3) -> List[RAPTORNode]:
    """
    Build one layer of RAPTOR tree.
    
    Group nodes, summarize each group, return parent nodes.
    """
    # TODO: Implement
    raise NotImplementedError

def build_raptor_tree(chunks: List[str], summarize_fn: Callable) -> RAPTORNode:
    """
    Build full RAPTOR tree from leaf chunks.
    
    Algorithm:
    1. Create leaf nodes from chunks
    2. Build layers until single root
    3. Return root
    """
    # TODO: Implement
    raise NotImplementedError

def retrieve_from_tree(root: RAPTORNode, query: str, scorer_fn: Callable, k: int = 5) -> List[str]:
    """
    Retrieve relevant nodes from RAPTOR tree.
    
    Can return both summaries and leaves.
    Use scorer_fn(query, text) to score relevance.
    """
    # TODO: Implement
    raise NotImplementedError
`,
    testCode: `def mock_summarize(texts):
    return "Summary of: " + " | ".join(t[:20] for t in texts)

def mock_scorer(query, text):
    return len(set(query.lower().split()) & set(text.lower().split()))

# Test layer building
leaves = [RAPTORNode(f"Chunk {i}") for i in range(6)]
layer1 = build_layer(leaves, mock_summarize, group_size=2)
assert len(layer1) == 3  # 6 / 2 = 3 parent nodes

# Test full tree building
chunks = ["Apple Q1 revenue", "Apple Q2 revenue", "Google Q1 revenue", "Google Q2 revenue"]
root = build_raptor_tree(chunks, mock_summarize)
assert root.is_leaf == False
assert len(root.children) >= 1

# Test retrieval
results = retrieve_from_tree(root, "Apple revenue", mock_scorer, k=2)
assert len(results) >= 1
assert any("Apple" in r for r in results)

print("RAPTOR tree passed!")`,
    hints: [
      "Group nodes: nodes[i:i+group_size] for each group.",
      "Each parent node text = summarize_fn([child.text for child in group]).",
      "Continue building layers until only 1 node remains (root).",
    ],
    realWorld: {
      description: "RAPTOR from UC Berkeley enables answering both specific and broad queries from the same document index.",
      companies: ["UC Berkeley", "Anthropic"],
      useCases: ["Book QA", "Research Synthesis"],
    },
  },
  // ============================================================
  // MULTI-TENANCY
  // ============================================================
  {
    slug: "multi-tenancy-rag",
    title: "Multi-Tenant Data Isolation",
    description: "Implement tenant isolation for multi-tenant RAG systems. Why: Enterprise RAG serves multiple customers. Solves: Prevents data leakage between tenants.",
    group: "Phase 8 — High-Scale Infrastructure & Compression",
    difficulty: "medium",
    xpReward: 100,
    starterCode: `from typing import Dict, List, Optional

class MultiTenantIndex:
    def __init__(self):
        self.data: Dict[str, List[Dict]] = {}  # tenant_id -> documents
    
    def add_document(self, tenant_id: str, doc_id: str, text: str, embedding: List[float]):
        """Add document to tenant's namespace."""
        # TODO: Implement
        raise NotImplementedError
    
    def search(self, tenant_id: str, query_embedding: List[float], k: int = 5) -> List[Dict]:
        """
        Search within a specific tenant's documents only.
        
        CRITICAL: Must NOT return documents from other tenants.
        """
        # TODO: Implement
        raise NotImplementedError
    
    def delete_tenant(self, tenant_id: str):
        """Remove all documents for a tenant (GDPR compliance)."""
        # TODO: Implement
        raise NotImplementedError
    
    def get_tenant_stats(self, tenant_id: str) -> Dict:
        """Return document count and other stats for tenant."""
        # TODO: Implement
        raise NotImplementedError
`,
    testCode: `index = MultiTenantIndex()

# Add docs for different tenants
index.add_document("tenant_a", "doc1", "Secret A data", [1.0, 0.0])
index.add_document("tenant_a", "doc2", "More A data", [0.9, 0.1])
index.add_document("tenant_b", "doc3", "Secret B data", [0.0, 1.0])

# Tenant A should only see their docs
results_a = index.search("tenant_a", [1.0, 0.0], k=5)
assert all("Secret B" not in r.get("text", "") for r in results_a)
assert any("Secret A" in r.get("text", "") or "A data" in r.get("text", "") for r in results_a)

# Tenant B should only see their docs
results_b = index.search("tenant_b", [1.0, 0.0], k=5)
assert all("Secret A" not in r.get("text", "") for r in results_b)

# Stats check
stats = index.get_tenant_stats("tenant_a")
assert stats.get("doc_count", 0) == 2

# Delete tenant
index.delete_tenant("tenant_b")
results_b_after = index.search("tenant_b", [1.0, 0.0], k=5)
assert len(results_b_after) == 0

print("Multi-tenancy passed!")`,
    hints: [
      "Store documents keyed by tenant_id.",
      "ALWAYS filter by tenant_id before returning results.",
      "Delete removes the entire tenant namespace.",
    ],
    solution: `from typing import Dict, List, Optional
import math

class MultiTenantIndex:
    def __init__(self):
        self.data: Dict[str, List[Dict]] = {}
    
    def _cosine_sim(self, a: List[float], b: List[float]) -> float:
        """Compute cosine similarity."""
        dot = sum(x * y for x, y in zip(a, b))
        norm_a = math.sqrt(sum(x * x for x in a))
        norm_b = math.sqrt(sum(x * x for x in b))
        if norm_a == 0 or norm_b == 0:
            return 0
        return dot / (norm_a * norm_b)
    
    def add_document(self, tenant_id: str, doc_id: str, text: str, embedding: List[float]):
        """Add document to tenant's namespace."""
        if tenant_id not in self.data:
            self.data[tenant_id] = []
        
        self.data[tenant_id].append({
            "doc_id": doc_id,
            "text": text,
            "embedding": embedding
        })
    
    def search(self, tenant_id: str, query_embedding: List[float], k: int = 5) -> List[Dict]:
        """Search within a specific tenant's documents only."""
        if tenant_id not in self.data:
            return []
        
        # ONLY search this tenant's documents
        tenant_docs = self.data[tenant_id]
        
        # Score and rank
        scored = []
        for doc in tenant_docs:
            score = self._cosine_sim(query_embedding, doc["embedding"])
            scored.append((score, doc))
        
        scored.sort(key=lambda x: x[0], reverse=True)
        return [doc for _, doc in scored[:k]]
    
    def delete_tenant(self, tenant_id: str):
        """Remove all documents for a tenant."""
        if tenant_id in self.data:
            del self.data[tenant_id]
    
    def get_tenant_stats(self, tenant_id: str) -> Dict:
        """Return document count and other stats for tenant."""
        if tenant_id not in self.data:
            return {"doc_count": 0}
        return {"doc_count": len(self.data[tenant_id])}
`,
    timeEstimate: { minutes: 25, label: "25-35 min" },
    realWorld: {
      description: "Every enterprise RAG system (Glean, Moveworks, Cohere) implements strict tenant isolation for data security.",
      companies: ["Glean", "Moveworks", "Cohere"],
      useCases: ["Enterprise Search", "SaaS RAG"],
    },
  },
  // ============================================================
  // RAG FOR CODE
  // ============================================================
  {
    slug: "rag-for-code",
    title: "Code-Aware Chunking",
    description: "Chunk code files by function/class boundaries. Why: Naive line chunking breaks code. Solves: Enables semantic code search.",
    group: "Phase 1 — Pre-Retrieval",
    difficulty: "medium",
    xpReward: 100,
    starterCode: `from typing import List, Dict
import re

def extract_python_functions(code: str) -> List[Dict]:
    """
    Extract function definitions from Python code.
    
    Returns list of:
    {
        "name": function name,
        "signature": "def name(args):",
        "body": full function code,
        "start_line": int,
        "end_line": int
    }
    """
    # TODO: Implement
    raise NotImplementedError

def extract_python_classes(code: str) -> List[Dict]:
    """
    Extract class definitions from Python code.
    
    Returns list of:
    {
        "name": class name,
        "body": full class code,
        "methods": [list of method names]
    }
    """
    # TODO: Implement
    raise NotImplementedError

def chunk_code_semantically(code: str, language: str = "python") -> List[Dict]:
    """
    Chunk code by semantic units (functions, classes).
    
    Returns list of:
    {
        "type": "function" | "class" | "other",
        "name": str,
        "content": str
    }
    """
    # TODO: Implement
    raise NotImplementedError
`,
    testCode: `code = '''
def hello(name):
    print(f"Hello {name}")
    return name

def goodbye():
    print("Goodbye")

class Greeter:
    def __init__(self):
        pass
    
    def greet(self, name):
        return hello(name)
'''

# Test function extraction
funcs = extract_python_functions(code)
assert len(funcs) >= 2
assert any(f["name"] == "hello" for f in funcs)
assert any(f["name"] == "goodbye" for f in funcs)

# Test class extraction
classes = extract_python_classes(code)
assert len(classes) >= 1
assert classes[0]["name"] == "Greeter"

# Test semantic chunking
chunks = chunk_code_semantically(code, "python")
assert len(chunks) >= 3
assert any(c["type"] == "function" for c in chunks)
assert any(c["type"] == "class" for c in chunks)

print("Code-aware chunking passed!")`,
    hints: [
      "Use regex: ^def\\s+(\\w+)\\s*\\( to find function starts.",
      "Track indentation to find function/class end.",
      "Classes: ^class\\s+(\\w+)",
    ],
    solution: `from typing import List, Dict
import re

def extract_python_functions(code: str) -> List[Dict]:
    """Extract function definitions from Python code."""
    functions = []
    lines = code.split('\\n')
    
    i = 0
    while i < len(lines):
        line = lines[i]
        match = re.match(r'^def\\s+(\\w+)\\s*\\(([^)]*)\\):', line)
        if match:
            func_name = match.group(1)
            signature = line.strip()
            start_line = i + 1
            
            # Find the function body by tracking indentation
            body_lines = [line]
            i += 1
            while i < len(lines):
                if lines[i].strip() and not lines[i].startswith(' ') and not lines[i].startswith('\\t'):
                    break
                body_lines.append(lines[i])
                i += 1
            
            functions.append({
                "name": func_name,
                "signature": signature,
                "body": '\\n'.join(body_lines),
                "start_line": start_line,
                "end_line": i
            })
        else:
            i += 1
    
    return functions

def extract_python_classes(code: str) -> List[Dict]:
    """Extract class definitions from Python code."""
    classes = []
    lines = code.split('\\n')
    
    i = 0
    while i < len(lines):
        line = lines[i]
        match = re.match(r'^class\\s+(\\w+)', line)
        if match:
            class_name = match.group(1)
            body_lines = [line]
            methods = []
            
            i += 1
            while i < len(lines):
                if lines[i].strip() and not lines[i].startswith(' ') and not lines[i].startswith('\\t'):
                    break
                # Check for methods
                method_match = re.match(r'^\\s+def\\s+(\\w+)', lines[i])
                if method_match:
                    methods.append(method_match.group(1))
                body_lines.append(lines[i])
                i += 1
            
            classes.append({
                "name": class_name,
                "body": '\\n'.join(body_lines),
                "methods": methods
            })
        else:
            i += 1
    
    return classes

def chunk_code_semantically(code: str, language: str = "python") -> List[Dict]:
    """Chunk code by semantic units."""
    chunks = []
    
    functions = extract_python_functions(code)
    classes = extract_python_classes(code)
    
    for func in functions:
        chunks.append({
            "type": "function",
            "name": func["name"],
            "content": func["body"]
        })
    
    for cls in classes:
        chunks.append({
            "type": "class",
            "name": cls["name"],
            "content": cls["body"]
        })
    
    return chunks
`,
    timeEstimate: { minutes: 35, label: "35-45 min" },
    realWorld: {
      description: "GitHub Copilot and Cursor use code-aware chunking to provide relevant code context for completions.",
      companies: ["GitHub", "Cursor", "Sourcegraph"],
      useCases: ["Code Search", "AI Code Assistants"],
    },
  },
  // ============================================================
  // MULTIMODAL RAG
  // ============================================================
  {
    slug: "multimodal-rag-guide",
    title: "Image Caption Generator for RAG",
    description: "Generate text descriptions of images for text-based retrieval. Why: Vector DBs work with text/vectors, not images directly. Solves: Makes images searchable in RAG systems.",
    group: "Phase 6 — Multi-Modal & Structured RAG",
    difficulty: "medium",
    xpReward: 100,
    starterCode: `from typing import List, Dict

def generate_image_caption(image_features: Dict) -> str:
    """
    Generate a text caption from image features.
    
    image_features: {
        "objects": ["person", "dog", "tree"],
        "scene": "outdoor park",
        "colors": ["green", "blue"],
        "text_detected": "Keep off grass"
    }
    
    Return a searchable text description.
    """
    # TODO: Implement
    raise NotImplementedError

def extract_table_text(table_data: List[List[str]]) -> str:
    """
    Convert table data to searchable text.
    
    table_data: 2D list where first row is headers.
    
    Return flattened, searchable representation.
    """
    # TODO: Implement
    raise NotImplementedError

def index_document_with_images(doc: Dict) -> List[Dict]:
    """
    Prepare a document with images for indexing.
    
    doc: {
        "text": "main text content",
        "images": [image_features, ...],
        "tables": [table_data, ...]
    }
    
    Returns list of chunks including image captions and table text.
    """
    # TODO: Implement
    raise NotImplementedError
`,
    testCode: `# Test image captioning
features = {
    "objects": ["person", "laptop", "coffee cup"],
    "scene": "office",
    "colors": ["white", "gray"],
    "text_detected": "Company Logo"
}
caption = generate_image_caption(features)
assert "person" in caption.lower() or "office" in caption.lower()
assert len(caption) > 10

# Test table extraction
table = [
    ["Product", "Price", "Stock"],
    ["Widget A", "$10", "100"],
    ["Widget B", "$20", "50"],
]
table_text = extract_table_text(table)
assert "Widget A" in table_text
assert "$10" in table_text or "10" in table_text

# Test full document indexing
doc = {
    "text": "Annual report summary.",
    "images": [features],
    "tables": [table]
}
chunks = index_document_with_images(doc)
assert len(chunks) >= 3  # text + image + table

print("Multimodal RAG passed!")`,
    hints: [
      "Caption: combine objects, scene, and detected text naturally.",
      "Tables: 'Column: Value' format for each cell.",
      "Create separate chunks for text, each image, each table.",
    ],
    realWorld: {
      description: "Google's Gemini and OpenAI's GPT-4V can extract searchable descriptions from images for RAG indexing.",
      companies: ["Google", "OpenAI", "Anthropic"],
      useCases: ["Document Understanding", "Visual Search"],
    },
  },
  // ============================================================
  // A/B TESTING
  // ============================================================
  {
    slug: "rag-ab-testing",
    title: "RAG A/B Testing Framework",
    description: "Implement an A/B testing framework for RAG experiments. Why: Data-driven decisions beat intuition. Solves: Systematic comparison of RAG configurations.",
    group: "Phase 9 — Strategic Operations (LLM-as-a-Judge)",
    difficulty: "medium",
    xpReward: 100,
    starterCode: `from typing import Dict, List, Literal
import random

class RAGExperiment:
    def __init__(self, name: str, variants: List[str]):
        self.name = name
        self.variants = variants
        self.results: Dict[str, List[float]] = {v: [] for v in variants}
    
    def assign_variant(self, user_id: str) -> str:
        """
        Assign user to a variant (deterministic by user_id).
        Same user always gets same variant.
        """
        # TODO: Implement
        raise NotImplementedError
    
    def record_metric(self, variant: str, value: float):
        """Record a metric value for a variant."""
        # TODO: Implement
        raise NotImplementedError
    
    def get_statistics(self) -> Dict:
        """
        Compute statistics for each variant.
        
        Returns: {
            variant: {
                "count": int,
                "mean": float,
                "std": float
            }
        }
        """
        # TODO: Implement
        raise NotImplementedError
    
    def get_winner(self, min_samples: int = 30) -> str:
        """
        Determine winning variant (highest mean, if enough samples).
        Returns "insufficient_data" if not enough samples.
        """
        # TODO: Implement
        raise NotImplementedError
`,
    testCode: `exp = RAGExperiment("chunk_size_test", ["small", "medium", "large"])

# Test deterministic assignment
variant1 = exp.assign_variant("user123")
variant2 = exp.assign_variant("user123")
assert variant1 == variant2  # Same user, same variant

# Different users might get different variants
variants = [exp.assign_variant(f"user{i}") for i in range(100)]
assert len(set(variants)) > 1  # Should have multiple variants

# Test metric recording
for i in range(50):
    exp.record_metric("small", 0.7 + random.random() * 0.1)
    exp.record_metric("medium", 0.8 + random.random() * 0.1)
    exp.record_metric("large", 0.75 + random.random() * 0.1)

stats = exp.get_statistics()
assert stats["medium"]["count"] == 50
assert stats["medium"]["mean"] > stats["small"]["mean"]

winner = exp.get_winner(min_samples=30)
assert winner == "medium"  # Should have highest mean

print("A/B testing framework passed!")`,
    hints: [
      "Use hash(user_id) % len(variants) for deterministic assignment.",
      "Store metrics as list, compute mean/std at analysis time.",
      "Require minimum samples before declaring winner.",
    ],
    realWorld: {
      description: "Companies like Notion and Glean run continuous A/B tests on their RAG systems to optimize quality.",
      companies: ["Notion", "Glean", "Perplexity"],
      useCases: ["RAG Optimization", "Config Tuning"],
    },
  },
  // ============================================================
  // FINE-TUNING EMBEDDINGS
  // ============================================================
  {
    slug: "fine-tuning-embeddings-guide",
    title: "Contrastive Loss for Embeddings",
    description: "Implement contrastive loss for fine-tuning embedding models. Why: Generic embeddings miss domain terms. Solves: Creates embeddings that understand your specific vocabulary.",
    group: "Phase 10 — Fine-Tuning & Adaptation",
    difficulty: "hard",
    xpReward: 150,
    starterCode: `from typing import List
import math

def compute_similarity(a: List[float], b: List[float]) -> float:
    """Compute cosine similarity."""
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(x * x for x in b))
    if norm_a == 0 or norm_b == 0:
        return 0
    return dot / (norm_a * norm_b)

def contrastive_loss(anchor: List[float], positive: List[float], 
                     negatives: List[List[float]], temperature: float = 0.05) -> float:
    """
    Compute InfoNCE contrastive loss.
    
    Loss = -log(exp(sim(anchor, positive)/temp) / sum(exp(sim(anchor, x)/temp)))
    
    Lower loss = anchor closer to positive, farther from negatives.
    """
    # TODO: Implement
    raise NotImplementedError

def mine_hard_negatives(query: str, documents: List[dict], 
                        k: int = 5) -> List[dict]:
    """
    Find hard negatives: docs that are similar but not relevant.
    
    Hard negatives are more informative for training than random negatives.
    
    documents: [{text, embedding, is_relevant}]
    Return top k non-relevant docs by similarity.
    """
    # TODO: Implement
    raise NotImplementedError
`,
    testCode: `# Test contrastive loss
anchor = [1.0, 0.0, 0.0]
positive = [0.95, 0.05, 0.0]  # Very similar
negative1 = [0.0, 1.0, 0.0]  # Orthogonal
negative2 = [-1.0, 0.0, 0.0]  # Opposite

loss1 = contrastive_loss(anchor, positive, [negative1, negative2])
assert loss1 < 1.0  # Should be low (good separation)

# Harder case: positive less distinct
positive_hard = [0.6, 0.4, 0.0]
loss2 = contrastive_loss(anchor, positive_hard, [negative1, negative2])
assert loss2 > loss1  # Higher loss when positive is less distinct

# Test hard negative mining
docs = [
    {"text": "Python programming guide", "embedding": [0.8, 0.2], "is_relevant": True},
    {"text": "Python snake species", "embedding": [0.7, 0.3], "is_relevant": False},  # Hard negative
    {"text": "Cooking recipes", "embedding": [0.1, 0.9], "is_relevant": False},  # Easy negative
]
query_emb = [0.9, 0.1]
hard_negs = mine_hard_negatives("Python code help", docs, k=1)
assert hard_negs[0]["text"] == "Python snake species"  # Most similar non-relevant

print("Contrastive loss passed!")`,
    hints: [
      "Similarity scaled: sim / temperature before exp().",
      "Softmax denominator includes positive AND all negatives.",
      "Hard negatives: sort non-relevant by similarity, take top k.",
    ],
    realWorld: {
      description: "OpenAI and Cohere offer embedding fine-tuning APIs that use contrastive learning to improve domain-specific retrieval.",
      companies: ["OpenAI", "Cohere", "Voyage AI"],
      useCases: ["Domain Adaptation", "Custom Embeddings"],
    },
  },
  // ============================================================
  // CONVERSATIONAL RAG
  // ============================================================
  {
    slug: "conversational-rag",
    title: "Conversation History Handler",
    description: "Manage conversation history for multi-turn RAG. Why: Follow-up questions need context. Solves: Enables natural multi-turn conversations.",
    group: "Phase 7 — SOTA Architectures & Agentic Memory",
    difficulty: "medium",
    xpReward: 100,
    starterCode: `from typing import List, Dict

class ConversationManager:
    def __init__(self, max_history: int = 10):
        self.sessions: Dict[str, List[Dict]] = {}
        self.max_history = max_history
    
    def add_message(self, session_id: str, role: str, content: str):
        """Add a message to conversation history."""
        # TODO: Implement
        raise NotImplementedError
    
    def get_history(self, session_id: str, n_turns: int = 5) -> List[Dict]:
        """Get recent conversation history."""
        # TODO: Implement
        raise NotImplementedError
    
    def contextualize_query(self, session_id: str, query: str) -> str:
        """
        Rewrite query to include conversation context.
        
        If query has pronouns (it, that, they), replace with referents from history.
        """
        # TODO: Implement
        raise NotImplementedError
    
    def is_followup(self, session_id: str, query: str) -> bool:
        """
        Detect if query is a follow-up to previous conversation.
        
        Look for pronouns, short queries, or lack of subject.
        """
        # TODO: Implement
        raise NotImplementedError
`,
    testCode: `cm = ConversationManager(max_history=5)

# Test adding messages
cm.add_message("session1", "user", "What is the refund policy?")
cm.add_message("session1", "assistant", "You have 30 days to return items.")

history = cm.get_history("session1")
assert len(history) == 2
assert history[0]["role"] == "user"

# Test follow-up detection
cm.add_message("session1", "user", "Can I extend that?")
assert cm.is_followup("session1", "Can I extend that?") == True
assert cm.is_followup("session1", "What is your shipping policy?") == False

# Test query contextualization
contextualized = cm.contextualize_query("session1", "Can I extend that?")
assert "refund" in contextualized.lower() or "30 days" in contextualized.lower()

# Test max history
for i in range(10):
    cm.add_message("session1", "user", f"Message {i}")
history = cm.get_history("session1")
assert len(history) <= 10  # Should respect max

print("Conversational RAG passed!")`,
    hints: [
      "Store messages as [{role, content, timestamp}].",
      "Pronouns to detect: it, that, they, this, those.",
      "Contextualize by finding the last noun/topic and replacing pronouns.",
    ],
    realWorld: {
      description: "ChatGPT and Claude maintain conversation history to understand follow-up questions in context.",
      companies: ["OpenAI", "Anthropic", "Google"],
      useCases: ["Chatbots", "Customer Support"],
    },
  },
];

