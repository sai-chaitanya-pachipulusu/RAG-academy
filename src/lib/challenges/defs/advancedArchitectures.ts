
import type { RawChallenge } from "@/lib/challenges/types";

export const ADVANCED_ARCHITECTURES_CHALLENGES: RawChallenge[] = [
  {
    slug: "table-parsing",
    title: "Table-to-Markdown Parser",
    description: "Convert semi-structured textual tables into clean Markdown for better indexing. Why: LLMs struggle with raw, unformatted table rows. Solves: Increases retrieval accuracy for financial and technical data.",
    group: "Phase 6 — Multi-Modal & Structured RAG",
    difficulty: "medium",
    xpReward: 75,
    starterCode: `from typing import List

def table_to_markdown(raw_rows: List[str]) -> str:
    """
    Assume raw_rows is a list of strings where columns are separated by multiple spaces.
    Example:
    ["Revenue    2023    2024", "Apple      $10B    $12B"]
    
    Convert to:
    | Revenue | 2023 | 2024 |
    | --- | --- | --- |
    | Apple | $10B | $12B |
    """
    # TODO: Implement
    raise NotImplementedError
`,
    testCode: `data = ["Name    Age    Dept", "Alice   30     Eng", "Bob     25     HR"]
md = table_to_markdown(data)
assert "| Name | Age | Dept |" in md
assert "| --- |" in md
assert "| Alice | 30 | Eng |" in md
print("Table parsing passed!")`,
    hints: [
        "Split each string by regex ' +'.",
        "Build the header and separator bars first.",
        "Join with newlines.",
    ],
    solution: `from typing import List
import re

def table_to_markdown(raw_rows: List[str]) -> str:
    if not raw_rows:
        return ""
    
    # Parse all rows
    parsed = [re.split(r'\\s{2,}', row.strip()) for row in raw_rows]
    
    # Build markdown table
    result = []
    
    # Header row
    header = "| " + " | ".join(parsed[0]) + " |"
    result.append(header)
    
    # Separator row
    separator = "| " + " | ".join(["---"] * len(parsed[0])) + " |"
    result.append(separator)
    
    # Data rows
    for row in parsed[1:]:
        data_row = "| " + " | ".join(row) + " |"
        result.append(data_row)
    
    return "\\n".join(result)
`,
    timeEstimate: { minutes: 20, label: "20-25 min" },
    realWorld: {
        description: "Table parsing is the 'frontline' of Financial RAG. Standard PDF parsers turn sheets into a mess; converting them back to MD or JSON is required for GPT-4 to understand the relationships.",
        companies: ["BlackRock", "Goldman Sachs", "Unstructured.io"],
        useCases: ["Financial Report Analysis", "Technical Specification QA"],
    },
  },
  {
    slug: "entity-extraction",
    title: "GraphRAG: Entity Extraction",
    description: "Extract knowledge triples (Subject, Predicate, Object) to build a foundation for GraphRAG.",
    group: "Phase 6 — Multi-Modal & Structured RAG",
    difficulty: "hard",
    xpReward: 125,
    starterCode: `from typing import List, Tuple

def extract_triples(text: str) -> List[Tuple[str, str, str]]:
    """
    Simple heuristic-based triple extraction.
    In a real system, you'd use a dependency parser or LLM.
    
    Rules for this lab:
    - Split by '.' to get sentences.
    - If a sentence contains ' works at ', extract (Person, 'works at', Company).
    - If a sentence contains ' is a ', extract (Object, 'is a', Type).
    """
    # TODO: Implement
    raise NotImplementedError
`,
    testCode: `text = "Alice works at Apple. Apple is a company."
triples = extract_triples(text)
assert ("Alice", "works at", "Apple") in triples
assert ("Apple", "is a", "company") in triples
print("Entity extraction passed!")`,
    hints: [
        "Use `re.split` for sentences.",
        "Look for the keywords ' works at ' and ' is a '.",
    ],
    solution: `from typing import List, Tuple
import re

def extract_triples(text: str) -> List[Tuple[str, str, str]]:
    triples = []
    sentences = re.split(r'[.!?]\\s*', text.strip())
    
    for sent in sentences:
        if not sent:
            continue
        
        # Pattern: "X works at Y"
        if ' works at ' in sent:
            parts = sent.split(' works at ')
            if len(parts) == 2:
                subject = parts[0].strip()
                obj = parts[1].strip().rstrip('.')
                triples.append((subject, 'works at', obj))
        
        # Pattern: "X is a Y"
        if ' is a ' in sent:
            parts = sent.split(' is a ')
            if len(parts) == 2:
                subject = parts[0].strip()
                obj = parts[1].strip().rstrip('.')
                triples.append((subject, 'is a', obj))
    
    return triples
`,
    timeEstimate: { minutes: 25, label: "25-35 min" },
    realWorld: {
        description: "GraphRAG (coined by Microsoft) uses knowledge graphs to answer global questions that vector similarity misses, such as 'How are the board members of company X connected?'",
        companies: ["Microsoft", "LinkedIn", "GraphAware"],
        useCases: ["Fraud Detection", "Supply Chain Intelligence"],
    },
  },
  {
    slug: "colbert-maxsim",
    title: "ColBERT MaxSim (Late Interaction)",
    description: "Implement the core 'MaxSim' operation that powers ColBERT's late interaction model.",
    group: "Phase 7 — SOTA Architectures & Agentic Memory",
    difficulty: "hard",
    xpReward: 150,
    starterCode: `from typing import List

def colbert_maxsim(query_token_embeddings: List[List[float]], doc_token_embeddings: List[List[float]]) -> float:
    """
    Calculate MaxSim score.
    
    For each token in the query:
    1. Find its highest dot product with ANY token in the document.
    2. Sum these maximum scores across all query tokens.
    """
    # TODO: Implement
    raise NotImplementedError
`,
    testCode: `q = [[1.0, 0.0], [0.0, 1.0]] # 2 query tokens
d = [[0.8, 0.2], [0.1, 0.9], [0.5, 0.5]] # 3 doc tokens
# MaxSim(q[0], d) = max(0.8, 0.1, 0.5) = 0.8
# MaxSim(q[1], d) = max(0.2, 0.9, 0.5) = 0.9
# Total = 1.7
score = colbert_maxsim(q, d)
assert abs(score - 1.7) < 1e-9
print("ColBERT MaxSim passed!")`,
    hints: [
        "Nested loops: query tokens -> document tokens.",
        "Use the dot product function you built in Phase 0.",
    ],
    solution: `from typing import List

def dot_product(a: List[float], b: List[float]) -> float:
    return sum(x * y for x, y in zip(a, b))

def colbert_maxsim(query_token_embeddings: List[List[float]], doc_token_embeddings: List[List[float]]) -> float:
    total_score = 0.0
    
    for query_token in query_token_embeddings:
        max_sim = float('-inf')
        for doc_token in doc_token_embeddings:
            sim = dot_product(query_token, doc_token)
            max_sim = max(max_sim, sim)
        total_score += max_sim
    
    return total_score
`,
    timeEstimate: { minutes: 20, label: "20-30 min" },
    realWorld: {
        description: "ColBERT is the leading 'Late Interaction' model. It's significantly more precise than single-vector embeddings because it compares every token in the query with every token in the document.",
        companies: ["Stanford NLP", "Weights & Biases", "Jina AI"],
        useCases: ["High-Precision Enterprise Search", "Legal Document Review"],
    },
  },
  {
    slug: "speculative-rag",
    title: "Speculative RAG (Draft & Verify)",
    description: "Implement a speculative generation flow: tiny model drafts, large model verifies.",
    group: "Phase 7 — SOTA Architectures & Agentic Memory",
    difficulty: "medium",
    xpReward: 100,
    starterCode: `from typing import Dict

def speculative_rag_step(draft: str, context: str) -> Dict[str, str]:
    """
    Simulate a verification step.
    
    Rules:
    - If the 'draft' contains a fact NOT in the 'context', it's a hallucination.
    - Return a dict: {"status": "accepted" | "rejected", "correction": str}
    """
    # TODO: Implement
    raise NotImplementedError
`,
    testCode: `ctx = "Capital of France is Paris."
res1 = speculative_rag_step("Paris is the capital.", ctx)
assert res1["status"] == "accepted"

res2 = speculative_rag_step("Lyon is the capital.", ctx)
assert res2["status"] == "rejected"
print("Speculative RAG passed!")`,
    hints: [
        "Check if keywords in the draft (excluding stopwords) exist in the context.",
    ],
    solution: `from typing import Dict
import re

STOPWORDS = {"the", "a", "an", "is", "are", "was", "were", "of", "in", "to", "for"}

def speculative_rag_step(draft: str, context: str) -> Dict[str, str]:
    def get_keywords(text):
        words = re.findall(r"[a-z]+", text.lower())
        return set(w for w in words if w not in STOPWORDS and len(w) > 2)
    
    draft_keywords = get_keywords(draft)
    context_keywords = get_keywords(context)
    
    # Check if significant keywords in draft exist in context
    if not draft_keywords:
        return {"status": "accepted", "correction": ""}
    
    overlap = draft_keywords & context_keywords
    coverage = len(overlap) / len(draft_keywords)
    
    if coverage >= 0.5:
        return {"status": "accepted", "correction": ""}
    else:
        return {"status": "rejected", "correction": "Hallucination detected"}
`,
    timeEstimate: { minutes: 25, label: "25-35 min" },
    realWorld: {
        description: "Speculative RAG is how companies serve low-latency AI responses at scale. A 1B parameter model drafts the answer in milliseconds, and a 70B model checks its work, giving you GPT-4 quality at 10x the speed.",
        companies: ["Mistral", "Groq", "Together AI"],
        useCases: ["Real-time Assistants", "High-Throughput Chatbots"],
    },
  },
  {
    slug: "multimodal-retrieval",
    title: "Multi-Modal Retrieval (CLIP)",
    description: "Retrieve relevant images for a text query using a shared embedding space.",
    group: "Phase 6 — Multi-Modal & Structured RAG",
    difficulty: "hard",
    xpReward: 125,
    starterCode: `from typing import List, Tuple

def find_best_image(query_vec: List[float], image_vecs: List[List[float]]) -> int:
    """
    Given a text query vector and a list of image vectors (in the same CLIP space):
    Return the index of the most similar image.
    """
    # TODO: Implement using cosine similarity
    raise NotImplementedError
`,
    testCode: `qv = [0.1, 0.9]
ivs = [[0.9, 0.1], [0.1, 0.9], [0.5, 0.5]]
idx = find_best_image(qv, ivs)
assert idx == 1
print("Multimodal retrieval passed!")`,
    hints: [
        "Reuse your cosine similarity logic.",
        "CLIP ensures that 'A photo of a dog' (text) and an actual dog photo (image) have high similarity.",
    ],
    solution: `from typing import List, Tuple
import math

def cosine_similarity(a: List[float], b: List[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(x * x for x in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)

def find_best_image(query_vec: List[float], image_vecs: List[List[float]]) -> int:
    best_idx = 0
    best_score = float('-inf')
    
    for i, img_vec in enumerate(image_vecs):
        score = cosine_similarity(query_vec, img_vec)
        if score > best_score:
            best_score = score
            best_idx = i
    
    return best_idx
`,
    timeEstimate: { minutes: 20, label: "20-25 min" },
    realWorld: {
        description: "Multi-modal RAG is essential for retail and social media. When you search for 'blue summer dress' on Pinterest, it uses CLIP-like models to retrieve images that match your text description.",
        companies: ["Pinterest", "Instagram", "OpenAI"],
        useCases: ["Visual Search", "Automated Image Captioning"],
    },
  },
  {
    slug: "product-quantization",
    title: "Product Quantization (PQ)",
    description: "Implement simple vector quantization to reduce memory footprint by 4x. Why: High-dim vectors are RAM-expensive. Solves: Increases index capacity for massive datasets.",
    group: "Phase 8 — High-Scale Infrastructure & Compression",
    difficulty: "hard",
    xpReward: 150,
    starterCode: `from typing import List

def quantize_vector(vec: List[float], centroids: List[List[float]]) -> int:
    """
    Given a vector and a list of centroids:
    1. Find the nearest centroid.
    2. Return the index of that centroid (the 'code').
    """
    # TODO: Implement
    raise NotImplementedError
`,
    testCode: `v = [0.1, 0.9]
c = [[0.0, 1.0], [1.0, 0.0]] # 2 centroids
code = quantize_vector(v, c)
assert code == 0
print("Quantization passed!")`,
    hints: [
        "Use your dot product or Euclidean distance function.",
    ],
    solution: `from typing import List
import math

def euclidean_distance(a: List[float], b: List[float]) -> float:
    return math.sqrt(sum((x - y) ** 2 for x, y in zip(a, b)))

def quantize_vector(vec: List[float], centroids: List[List[float]]) -> int:
    best_idx = 0
    best_dist = float('inf')
    
    for i, centroid in enumerate(centroids):
        dist = euclidean_distance(vec, centroid)
        if dist < best_dist:
            best_dist = dist
            best_idx = i
    
    return best_idx
`,
    timeEstimate: { minutes: 20, label: "20-25 min" },
    realWorld: {
        description: "Product Quantization is how Meta (FAISS) and Microsoft (Bing) search billions of documents. By compressing vectors into 8-bit codes, they can fit the entire world's index into a single server's RAM.",
        companies: ["Meta (FAISS)", "Microsoft (DiskANN)", "Pinecone"],
        useCases: ["Billion-scale Search", "Low-RAM Edge Devices"],
    },
  },
  {
    slug: "faithfulness-judge",
    title: "LLM-as-a-Judge: Faithfulness",
    description: "Automate hallucination detection by using a 'Judge LLM' to verify groundedness. Why: Manual evaluation doesn't scale. Solves: Ensures the generated answer is strictly derived from the context.",
    group: "Phase 9 — Strategic Operations (LLM-as-a-Judge)",
    difficulty: "medium",
    xpReward: 100,
    starterCode: `from typing import List

def judge_faithfulness(answer: str, context: str) -> float:
    """
    Simulate an NLI (Natural Language Inference) check.
    
    Score 1.0 if every major noun/verb in the answer is present in the context.
    Score 0.0 if there is a flat contradiction.
    """
    # TODO: Implement
    raise NotImplementedError
`,
    testCode: `ans = "Apple revenue is $10B."
ctx = "In 2023, Apple reported revenue of $10B."
assert judge_faithfulness(ans, ctx) == 1.0

ans2 = "Apple revenue is $50B."
assert judge_faithfulness(ans2, ctx) < 0.5
print("Faithfulness judge passed!")`,
    hints: [
        "Extract entities and numbers. Check if they 'align' with the context.",
    ],
    solution: `from typing import List
import re

def judge_faithfulness(answer: str, context: str) -> float:
    def extract_entities(text):
        # Extract significant words and numbers
        words = re.findall(r"[a-zA-Z]+|\\$?\\d+[BMK]?", text)
        return set(w.lower() for w in words if len(w) > 2)
    
    answer_entities = extract_entities(answer)
    context_entities = extract_entities(context)
    
    if not answer_entities:
        return 1.0
    
    # Check how many answer entities appear in context
    found = answer_entities & context_entities
    coverage = len(found) / len(answer_entities)
    
    # Numbers must match exactly
    answer_numbers = set(re.findall(r"\\$?\\d+[BMK]?", answer))
    context_numbers = set(re.findall(r"\\$?\\d+[BMK]?", context))
    
    if answer_numbers and not (answer_numbers & context_numbers):
        return 0.0  # Numerical contradiction
    
    return coverage
`,
    timeEstimate: { minutes: 25, label: "25-35 min" },
    realWorld: {
        description: "Companies now use 'Critic' models to grade their main 'Generator' models. This creates a closed-loop system where the LLM learns to be more factual by being called out on its own hallucinations.",
        companies: ["Patronus AI", "Arize AI", "Weights & Biases (W&B)"],
        useCases: ["Automated CI/CD for RAG", "A/B Testing Prompts"],
    },
  },
  {
    slug: "cost-aware-router",
    title: "Cost-Aware Query Router",
    description: "Build a router that directs queries based on predicted complexity and budget. Why: GPT-4 is 50x more expensive than GPT-4o-mini. Solves: Reduces operation costs by 80% without sacrificing quality.",
    group: "Phase 9 — Strategic Operations (LLM-as-a-Judge)",
    difficulty: "medium",
    xpReward: 75,
    starterCode: `from typing import Literal

def route_query_by_cost(query: str) -> Literal["cheap", "expensive"]:
    """
    Rules:
    - If query asks for 'summary' or 'sentiment': use cheap.
    - If query asks for 'reasoning', 'math', or 'policy logic': use expensive.
    - If query is < 5 words: use cheap.
    """
    # TODO: Implement
    raise NotImplementedError
`,
    testCode: `assert route_query_by_cost("Summarize this.") == "cheap"
assert route_query_by_cost("Calculate the ROI based on section 4.") == "expensive"
print("Cost router passed!")`,
    hints: [
        "Check for keywords and token counts.",
    ],
    solution: `from typing import Literal

def route_query_by_cost(query: str) -> Literal["cheap", "expensive"]:
    lower = query.lower()
    words = lower.split()
    
    # Short queries are cheap
    if len(words) < 5:
        return "cheap"
    
    # Check for simple task keywords
    cheap_keywords = ["summary", "summarize", "sentiment", "list", "what is"]
    if any(kw in lower for kw in cheap_keywords):
        return "cheap"
    
    # Check for complex task keywords
    expensive_keywords = ["reasoning", "math", "calculate", "policy", "logic", "analyze", "compare"]
    if any(kw in lower for kw in expensive_keywords):
        return "expensive"
    
    # Default to cheap
    return "cheap"
`,
    timeEstimate: { minutes: 15, label: "15-20 min" },
    realWorld: {
        description: "Production RAG is an exercise in unit economics. Strategic routers ensure that easy tasks (summarization) are handled by cheap models, saving the 'big brain' models for hard reasoning.",
        companies: ["Martian", "Unify", "OpenPipe"],
        useCases: ["SaaS Profitability", "Load Balancing"],
    },
  },
  {
    slug: "agent-long-term-memory",
    title: "Long-term Conversational Memory",
    description: "Implement a memory manager that summarizes and prunes conversational history to stay within context limits. Why: LLMs 'forget' if they see too much history. Solves: Enables long, coherent agents without exploding token costs.",
    group: "Phase 7 — SOTA Architectures & Agentic Memory",
    difficulty: "medium",
    xpReward: 100,
    starterCode: `from typing import List, Dict

class MemoryManager:
    def __init__(self, max_tokens: int = 1000):
        self.history: List[Dict[str, str]] = []
        self.max_tokens = max_tokens

    def add_message(self, role: str, content: str):
        self.history.append({"role": role, "content": content})

    def get_context(self) -> str:
        """
        Return the history as a single string.
        Logic:
        1. If history is under max_tokens, return everything.
        2. If over, summarize the OLDER part and keep the RECENT part as-is.
        (For this lab, simulate summary by just trimming).
        """
        # TODO: Implement truncation/summarization logic
        return ""
`,
    testCode: `mem = MemoryManager(max_tokens=50)
mem.add_message("user", "Hello " * 10)
mem.add_message("assistant", "Hi " * 10)
mem.add_message("user", "What is RAG?")
ctx = mem.get_context()
assert "What is RAG?" in ctx
# Ensure history doesn't grow infinitely
print("Memory management passed!")`,
    hints: [
        "Use a simple character count as a proxy for tokens.",
        "Keep the most recent messages fully intact.",
    ],
    solution: `from typing import List, Dict

class MemoryManager:
    def __init__(self, max_tokens: int = 1000):
        self.history: List[Dict[str, str]] = []
        self.max_tokens = max_tokens
    
    def add_message(self, role: str, content: str):
        self.history.append({"role": role, "content": content})
    
    def _estimate_tokens(self, text: str) -> int:
        # Simple approximation: ~4 chars per token
        return len(text) // 4
    
    def get_context(self) -> str:
        # Build full history string
        messages = []
        for msg in self.history:
            messages.append(f"{msg['role']}: {msg['content']}")
        
        full_context = "\\n".join(messages)
        
        # If under limit, return everything
        if self._estimate_tokens(full_context) <= self.max_tokens:
            return full_context
        
        # Otherwise, keep most recent messages that fit
        result_messages = []
        current_tokens = 0
        
        for msg in reversed(self.history):
            msg_text = f"{msg['role']}: {msg['content']}"
            msg_tokens = self._estimate_tokens(msg_text)
            
            if current_tokens + msg_tokens <= self.max_tokens:
                result_messages.insert(0, msg_text)
                current_tokens += msg_tokens
            else:
                break
        
        return "\\n".join(result_messages)
`,
    timeEstimate: { minutes: 30, label: "30-40 min" },
    realWorld: {
        description: "Modern agents like ChatGPT and Claude use 'sliding window' memory with recursive summarization. This allows them to remember your core request even after 40 turns of technical troubleshooting.",
        companies: ["OpenAI", "Anthropic", "Character.AI"],
        useCases: ["Personal Assistants", "Customer Support Agents"],
    },
  },
  {
    slug: "bitmap-indexing",
    title: "Metadata Bitmap Indexing",
    description: "Implement a bitmap index for ultra-fast boolean filtering on document metadata. Why: Scanning 1M dicts for 'dept=HR' is slow. Solves: Subset filtering becomes a single CPU bitwise operation.",
    group: "Phase 8 — High-Scale Infrastructure & Compression",
    difficulty: "hard",
    xpReward: 125,
    starterCode: `from typing import List, Dict

def create_bitmap(docs_meta: List[str], target_value: str) -> int:
    """
    Return an integer where the i-th bit is 1 if docs_meta[i] == target_value.
    Example: 
    docs_meta = ["HR", "Eng", "HR", "Sales"]
    target = "HR"
    Bitmap = 0b1010  (which is 10 in decimal)
    """
    # TODO: Implement
    raise NotImplementedError

def filter_with_bitmap(bitmap: int, indices: List[int]) -> List[int]:
    """
    Given a bitmap, return the subset of 'indices' that match the bits.
    """
    # TODO: Implement
    return []
`,
    testCode: `meta = ["HR", "Eng", "HR", "Sales"]
bm = create_bitmap(meta, "HR")
assert bm == 5 # (0b0101 if bit 0 is first doc, or 0b1010 if bit 3 is first)
# For this lab, let's say bit i = index i
assert bm == (1 << 0) | (1 << 2) 
filtered = filter_with_bitmap(bm, [0, 1, 2, 3])
assert filtered == [0, 2]
print("Bitmap indexing passed!")`,
    hints: [
        "Python integers handle arbitrary precision bits natively.",
        "Use `(1 << i)` to set/check the i-th bit.",
    ],
    realWorld: {
        description: "High-performance engines like Apache Druid and Clickhouse use bitmaps to filter billions of rows in milliseconds. In RAG, this is how you handle 'Multi-Tenancy' at the infra level.",
        companies: ["Snowflake", "Clickhouse", "Elasticsearch"],
        useCases: ["High-Speed Analytics", "Enterprise Permission Filtering"],
    },
  },
  {
    slug: "partitioned-storage",
    title: "Partitioned Vector Tables",
    description: "Design a multi-tenant storage layer with hard data isolation. Why: A bug in filters shouldn't reveal User B's data to User A.",
    group: "Phase 8 — High-Scale Infrastructure & Compression",
    difficulty: "medium",
    xpReward: 100,
    starterCode: `from typing import Dict, List

class DividedVectorDB:
    def __init__(self):
        # tenant_id -> list of vectors
        self.partitions: Dict[str, List[List[float]]] = {}

    def insert(self, tenant_id: str, vector: List[float]):
        """Ensure data is stored in the correct bucket."""
        # TODO: Implement
        pass

    def search(self, tenant_id: str, query_vec: List[float]) -> List[List[float]]:
        """Search ONLY the relevant partition. Zero cross-leakage."""
        # TODO: Implement
        return []
`,
    testCode: `db = DividedVectorDB()
db.insert("user1", [1.0, 0.0])
db.insert("user2", [0.0, 1.0])
res = db.search("user1", [1.0, 0.0])
assert len(res) == 1
assert res[0] == [1.0, 0.0]
# Ensure user1 cannot see user2's data
print("Partitioned storage passed!")`,
    hints: [
        "This is 'Physical Isolation' vs 'Logical Filtering'.",
        "It's the most secure way to handle sensitive enterprise data.",
    ],
    realWorld: {
        description: "Banks and healthcare providers require 'hard' data isolation. They often refuse to use shared vector indexes, insisting on separate database instances or strictly partitioned storage layers.",
        companies: ["Pinecone (Namespaces)", "MongoDB (Collections)", "AWS"],
        useCases: ["SaaS Multi-Tenancy", "HIPAA Compliance"],
    },
  },
  {
    slug: "relevance-judge",
    title: "Answer Relevance Evaluator",
    description: "Grade how well an answer directly addresses the user's question. Why: A factual answer is useless if it doesn't answer the prompt.",
    group: "Phase 9 — Strategic Operations (LLM-as-a-Judge)",
    difficulty: "hard",
    xpReward: 125,
    starterCode: `from typing import List

def grade_relevance(query: str, answer: str) -> float:
    """
    Score from 0.0 to 1.0.
    1.0: Answer directly and fully addresses the query.
    0.0: Answer is completely off-topic.
    """
    # TODO: Implement simple keyword-overlap heuristic
    # (In prod, use a Cross-Encoder or LLM).
    raise NotImplementedError
`,
    testCode: `q = "How do I reset my password?"
a_good = "Go to settings and click 'Reset Password'."
a_bad = "The sun is 93 million miles away."
assert grade_relevance(q, a_good) > 0.5
assert grade_relevance(q, a_bad) < 0.2
print("Relevance judge passed!")`,
    hints: [
        "Calculate token overlap between the query and the answer.",
        "Normalize by the number of meaningful words (nouns/verbs).",
    ],
    realWorld: {
        description: "A core part of the 'RAG Triad' (Faithfulness, Relevance, Context Recall). Measuring relevance helps identify if your system is 'answer-fishing' or providing genuinely helpful responses.",
        companies: ["Ragas.io", "ZenML", "Superb AI"],
        useCases: ["Model Comparison", "Prompt Optimization"],
    },
  },
];
