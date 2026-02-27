import type { RawChallenge } from "@/lib/challenges/types";

export const LIVE_DATA_CHALLENGES: RawChallenge[] = [
  {
    slug: "news-search-tool",
    title: "Project: The News Agent",
    description:
      "Build a 'Live RAG' agent that queries a search API to answer questions about recent events not in its training data. Implement keyword extraction, search, and synthesis.",
    group: "Phase 4 — Capstone: Live Projects",
    difficulty: "hard",
    xpReward: 150,
    starterCode: `from typing import Dict, List, Tuple
import re

# Mock Search API Index
MOCK_WEB_INDEX = {
    "weather san francisco": "The weather in San Francisco is currently 65F and sunny.",
    "stock price apple aapl": "Apple (AAPL) is trading at $150.25, up 1.2% today.",
    "latest rag techniques 2025": "New techniques in 2025 involve Agentic flows, MiA-RAG, and GraphRAG for better reasoning.",
    "election results": "The incumbent won the election with 52% of the vote.",
}

def extract_keywords(query: str) -> List[str]:
    """
    Extract meaningful keywords from a natural language query.
    Remove stop words like 'what', 'is', 'the', 'in', 'of'.
    """
    # TODO: implement keyword extraction
    raise NotImplementedError

def search_tool(keywords: List[str]) -> Tuple[bool, str]:
    """
    Mock search tool. In production, this would call Tavily, SerpApi, or Google.
    Returns: (found_success, content)
    """
    # TODO: implement search logic that matches keywords against MOCK_WEB_INDEX
    # Try to find the best matching key in MOCK_WEB_INDEX based on keyword overlap
    raise NotImplementedError

def news_agent_solve(user_query: str) -> str:
    """
    1. Analyze the user query & extract keywords.
    2. Call search_tool().
    3. Synthesize an answer based ONLY on the tool output.
    """
    # TODO: implement the agent loop
    raise NotImplementedError
`,
    testCode: `ans1 = news_agent_solve("What is the weather in san francisco?")
assert "65F" in ans1 or "sunny" in ans1.lower()

ans2 = news_agent_solve("Tell me the stock price for apple")
assert "150.25" in ans2

# Ensure it uses current context provided by tool, not old hallucinations
ans3 = news_agent_solve("What are the latest rag techniques?")
assert "Agentic" in ans3 or "GraphRAG" in ans3 or "MiA-RAG" in ans3

# Handle unanswerable
ans4 = news_agent_solve("Who won the superbowl in 2029?")
assert "couldn't find" in ans4.lower() or "no relevant" in ans4.lower() or "not find" in ans4.lower()

print("All tests passed!")`,
    hints: [
      "This is 'Retrieval' where the Retriever is an API call.",
      "For keyword extraction, remove common words and keep nouns/verbs.",
      "For search_tool, score each key in MOCK_WEB_INDEX by how many keywords it contains, and return the best match if score > 0.",
    ],
    solution: `from typing import Dict, List, Tuple
import re

MOCK_WEB_INDEX = {
    "weather san francisco": "The weather in San Francisco is currently 65F and sunny.",
    "stock price apple aapl": "Apple (AAPL) is trading at $150.25, up 1.2% today.",
    "latest rag techniques 2025": "New techniques in 2025 involve Agentic flows, MiA-RAG, and GraphRAG for better reasoning.",
    "election results": "The incumbent won the election with 52% of the vote.",
}

STOP_WORDS = {"what", "is", "the", "in", "of", "for", "tell", "me", "who", "won", "are"}

def extract_keywords(query: str) -> List[str]:
    words = re.findall(r"[a-z0-9]+", query.lower())
    return [w for w in words if w not in STOP_WORDS]

def search_tool(keywords: List[str]) -> Tuple[bool, str]:
    best_match = None
    max_overlap = 0
    
    for key, content in MOCK_WEB_INDEX.items():
        key_words = set(key.split())
        overlap = sum(1 for kw in keywords if kw in key_words)
        if overlap > max_overlap:
            max_overlap = overlap
            best_match = content
            
    if best_match and max_overlap > 0:
        return True, best_match
    return False, "No relevant results found."

def news_agent_solve(user_query: str) -> str:
    keywords = extract_keywords(user_query)
    found, result = search_tool(keywords)
    
    if not found:
        return "I couldn't find relevant information for your query."
    
    return f"Based on current search results: {result}"`,
    timeEstimate: { minutes: 35, label: "35-45 min" },
    prerequisites: ["tool-use-basics", "react-implementation"],
    realWorld: {
        description: "Standard pattern for 'Freshness-aware RAG'. By connecting your model to a live search API, you solve the 'Knowledge Cutoff' problem, allowing your bot to talk about today's news.",
        companies: ["Perplexity", "You.com", "Brave Search"],
        useCases: ["Market Intelligence", "Current Events QA"],
    },
    relatedPlaybooks: ["rag-techniques-encyclopedia", "learning-paths"],
  },
  {
    slug: "enterprise-support-router",
    title: "Project: Enterprise Support Router",
    description:
      "Build a multi-stage routing system that categorizes a user query and directs it to the appropriate data source (SQL database for orders, Vector DB for policies, or API for shipping).",
    group: "Phase 4 — Capstone: Live Projects",
    difficulty: "hard",
    xpReward: 200,
    starterCode: `from typing import Any, Dict, List

# 1. Vector DB (Policies)
POLICY_DOCS = {
    "return": "Returns are allowed within 30 days if the item is unused.",
    "warranty": "All electronics include a 1-year limited warranty.",
}

# 2. SQL DB (Orders)
USER_DB = {
    "u1": {"orders": [{"id": "o101", "item": "Laptop", "date": "2023-10-01", "status": "delivered"}]},
    "u2": {"orders": [{"id": "o102", "item": "Shirt", "date": "2024-01-01", "status": "shipped"}]}
}

def router_agent(query: str) -> str:
    """
    Determine the category of the query: 'POLICY', 'ORDER_STATUS', or 'UNKNOWN'
    """
    # TODO: Implement intent routing
    raise NotImplementedError

def retrieve_policy(query: str) -> str:
    """Search policy documents"""
    # TODO: Implement
    raise NotImplementedError

def get_order_status(user_id: str) -> str:
    """Query SQL database for user orders"""
    # TODO: Implement
    raise NotImplementedError

def enterprise_support_bot(user_id: str, query: str) -> str:
    """
    1. Route the query to understand intent.
    2. Fetch data from the appropriate system.
    3. Synthesize the final response.
    """
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `ans1 = enterprise_support_bot("u1", "What is your return policy?")
assert "30 days" in ans1

ans2 = enterprise_support_bot("u2", "Where is my order?")
assert "shipped" in ans2 or "Shirt" in ans2

ans3 = enterprise_support_bot("u1", "How long is the warranty on my laptop?")
assert "1-year" in ans3

ans4 = enterprise_support_bot("u2", "Tell me a joke")
assert "help" in ans4.lower() or "cannot" in ans4.lower() or "unknown" in ans4.lower()

print("All tests passed!")`,
    hints: [
      "Use simple keyword matching or a simulated LLM call for the `router_agent`.",
      "Based on the routing output, decide whether to call `retrieve_policy` or `get_order_status`.",
      "If UNKNOWN, return a graceful fallback message.",
    ],
    solution: `from typing import Any, Dict, List

POLICY_DOCS = {
    "return": "Returns are allowed within 30 days if the item is unused.",
    "warranty": "All electronics include a 1-year limited warranty.",
}

USER_DB = {
    "u1": {"orders": [{"id": "o101", "item": "Laptop", "date": "2023-10-01", "status": "delivered"}]},
    "u2": {"orders": [{"id": "o102", "item": "Shirt", "date": "2024-01-01", "status": "shipped"}]}
}

def router_agent(query: str) -> str:
    q = query.lower()
    if "return" in q or "policy" in q or "warranty" in q:
        return "POLICY"
    elif "order" in q or "where is" in q or "status" in q:
        return "ORDER_STATUS"
    return "UNKNOWN"

def retrieve_policy(query: str) -> str:
    q = query.lower()
    if "return" in q:
        return POLICY_DOCS["return"]
    if "warranty" in q:
        return POLICY_DOCS["warranty"]
    return "I couldn't find a specific policy for that."

def get_order_status(user_id: str) -> str:
    user_data = USER_DB.get(user_id)
    if not user_data or not user_data["orders"]:
        return "You have no recent orders."
    
    order = user_data["orders"][-1]
    return f"Your {order['item']} (Order #{order['id']}) is currently: {order['status']}."

def enterprise_support_bot(user_id: str, query: str) -> str:
    intent = router_agent(query)
    
    if intent == "POLICY":
        policy = retrieve_policy(query)
        return f"According to our guidelines: {policy}"
        
    elif intent == "ORDER_STATUS":
        status = get_order_status(user_id)
        return f"Checking your account... {status}"
        
    else:
        return "I can only help with policies and order tracking. How can I help you today?"
`,
    timeEstimate: { minutes: 40, label: "40-50 min" },
    prerequisites: ["tool-use-basics", "route-by-difficulty"],
    realWorld: {
        description: "The most common Enterprise RAG use case. It uses Semantic Routing to direct queries to specialized sub-systems (Vector DB vs SQL DB) rather than stuffing everything into a single context window.",
        companies: ["Klarna", "Zendesk", "Salesforce"],
        useCases: ["Automated Customer Support", "Multi-Agent Architectures"],
    },
    relatedPlaybooks: ["rag-techniques-encyclopedia", "prompt-templates"],
  },
  {
    slug: "financial-analyst-agent",
    title: "Project: The Crypto Analyst",
    description:
      "A multi-step agent that fetches live prices from an API and retrieves unstructured 'analyst notes' from a Vector DB to form a synthesized buy/sell thesis.",
    group: "Phase 4 — Capstone: Live Projects",
    difficulty: "hard",
    xpReward: 200,
    starterCode: `from typing import Dict, List

# 1. Live Data Tool (Structured Data)
PRICES = {"BTC": 50000, "ETH": 3000, "DOGE": 0.20}

def get_live_price(ticker: str) -> float:
    """Mock API call to get live price"""
    return PRICES.get(ticker.upper(), 0.0)

# 2. Vector DB (Unstructured Data)
NOTES = [
    "BTC is facing resistance at 52k. Downside risk if it breaks 48k. Recommend HOLD.",
    "ETH upgrading to 2.0. Long term bullish above 2500. Recommend BUY.",
    "DOGE is purely meme-driven. High volatility expected. Recommend SELL.",
]

def retrieve_analyst_notes(ticker: str) -> str:
    """Mock Vector search"""
    # TODO: Implement retrieval
    raise NotImplementedError

def extract_recommendation(notes: str) -> str:
    """Extract just the BUY/SELL/HOLD recommendation from text"""
    # TODO: Implement extraction
    raise NotImplementedError

def crypto_analysis(ticker: str) -> str:
    """
    1. Fetch current price.
    2. Retrieve relevant notes.
    3. Extract the core recommendation.
    4. Synthesize a short analysis: "BTC is currently $50000. Analyst consensus is HOLD because..."
    """
    # TODO: implement the pipeline
    raise NotImplementedError
`,
    testCode: `ans_btc = crypto_analysis("BTC")
assert "50000" in ans_btc
assert "HOLD" in ans_btc

ans_eth = crypto_analysis("ETH")
assert "3000" in ans_eth
assert "BUY" in ans_eth
assert "bullish" in ans_eth.lower() or "upgrading" in ans_eth.lower()

ans_unknown = crypto_analysis("SHIB")
assert "not found" in ans_unknown.lower() or "0" in ans_unknown or "no notes" in ans_unknown.lower()

print("All tests passed!")`,
    hints: [
      "This is a standard 'Data Enrichment' pattern.",
      "Step 1: Get structured data (Price).",
      "Step 2: Get unstructured data (Docs).",
      "Step 3: Combine both into a final templated string.",
    ],
    solution: `from typing import Dict, List

PRICES = {"BTC": 50000, "ETH": 3000, "DOGE": 0.20}

def get_live_price(ticker: str) -> float:
    return PRICES.get(ticker.upper(), 0.0)

def retrieve_analyst_notes(ticker: str) -> str:
    matches = [n for n in NOTES if ticker.upper() in n]
    return matches[0] if matches else ""

def extract_recommendation(notes: str) -> str:
    if "BUY" in notes: return "BUY"
    if "SELL" in notes: return "SELL"
    if "HOLD" in notes: return "HOLD"
    return "UNKNOWN"

def crypto_analysis(ticker: str) -> str:
    # 1. Fetch current price
    price = get_live_price(ticker)
    
    if price == 0.0:
        return f"Ticker {ticker} not found in live pricing."
        
    # 2. Retrieve relevant notes
    notes = retrieve_analyst_notes(ticker)
    
    if not notes:
        return ticker + " is currently $" + str(price) + ". No analyst notes available."
        
    # 3. Extract recommendation
    rec = extract_recommendation(notes)
    
    # 4. Synthesize
    reason = notes.replace(" Recommend " + rec + ".", "")
    return ticker + " is currently $" + str(price) + ". Analyst consensus is " + rec + " because: " + reason
`,
    timeEstimate: { minutes: 45, label: "45-60 min" },
    prerequisites: ["react-implementation", "tool-use-basics"],
    realWorld: {
        description: "Standard workflow for algorithmic trading and financial research. Multi-step agents gather hard data (prices) and qualitative data (notes) to provide a synthesized recommendation.",
        companies: ["Bloomberg", "Goldman Sachs", "BlackRock"],
        useCases: ["Investment Thesis Generation", "Sentiment Analysis", "Financial Enrichment"],
    },
    relatedPlaybooks: ["rag-techniques-encyclopedia", "learning-paths"],
  },
  {
    slug: "end-to-end-rag-pipeline",
    title: "Project: End-to-End RAG Pipeline",
    description:
      "Build a complete, miniature RAG pipeline from scratch: Document ingestion → Chunking → Mock Embedding → Indexing → Retrieval → Generation.",
    group: "Phase 4 — Capstone: Live Projects",
    difficulty: "hard",
    xpReward: 250,
    starterCode: `from typing import List, Dict, Tuple
import math

# 1. Raw Documents
CORPUS = [
    "Retrieval-Augmented Generation (RAG) improves LLM responses.",
    "RAG fetches factual context from a vector database.",
    "Embeddings represent text as high-dimensional vectors.",
    "Cosine similarity measures the angle between two vectors.",
]

class MiniRAGPipeline:
    def __init__(self):
        self.vector_store: List[Dict] = []
        # Mock embedding mapping for determinism
        self.vocab = {"rag": [1, 0, 0], "llm": [0, 1, 0], "vector": [0, 0, 1], "similarity": [1, 1, 0]}

    def _mock_embed(self, text: str) -> List[float]:
        """Convert text to a mock vector by checking for keywords."""
        vec = [0.0, 0.0, 0.0]
        words = text.lower().split()
        for w in words:
            if w in self.vocab:
                vec = [v1 + v2 for v1, v2 in zip(vec, self.vocab[w])]
        
        # Normalize
        mag = math.sqrt(sum(v**2 for v in vec))
        if mag == 0: return [0.0, 0.0, 0.0]
        return [v/mag for v in vec]

    def ingest(self, documents: List[str]):
        """
        1. Iterate through documents.
        2. Embed each document.
        3. Store in self.vector_store as {"text": doc, "vector": vec}
        """
        # TODO: Implement ingestion
        pass

    def retrieve(self, query: str, top_k: int = 2) -> List[str]:
        """
        1. Embed the query.
        2. Calculate cosine similarity against all stored vectors.
        3. Return top_k document texts.
        """
        # TODO: Implement retrieval
        pass

    def generate(self, query: str) -> str:
        """
        1. Retrieve context for the query.
        2. Format a response: "Based on [context], the answer is..."
        """
        # TODO: Implement generation
        pass
`,
    testCode: `pipeline = MiniRAGPipeline()

# Test Ingestion
pipeline.ingest(CORPUS)
assert len(pipeline.vector_store) == 4

# Test Retrieval
results = pipeline.retrieve("What is a vector database?", top_k=1)
assert len(results) == 1
assert "vector" in results[0].lower()

# Test Full Generation Pipeline
response = pipeline.generate("Tell me about RAG.")
assert "Based on" in response
assert "RAG" in response

response2 = pipeline.generate("How does similarity work?")
assert "Cosine similarity" in response2

print("All tests passed! Full pipeline operational.")`,
    hints: [
      "For `ingest`, loop over CORPUS, call `_mock_embed`, and append to `vector_store`.",
      "For `retrieve`, compute dot product since vectors are normalized (cosine similarity = dot product for unit vectors). Sort descending.",
      "For `generate`, combine the retrieved strings into a single context string.",
    ],
    solution: `from typing import List, Dict, Tuple
import math

CORPUS = [
    "Retrieval-Augmented Generation (RAG) improves LLM responses.",
    "RAG fetches factual context from a vector database.",
    "Embeddings represent text as high-dimensional vectors.",
    "Cosine similarity measures the angle between two vectors.",
]

class MiniRAGPipeline:
    def __init__(self):
        self.vector_store: List[Dict] = []
        self.vocab = {"rag": [1, 0, 0], "llm": [0, 1, 0], "vector": [0, 0, 1], "similarity": [1, 1, 0]}

    def _mock_embed(self, text: str) -> List[float]:
        vec = [0.0, 0.0, 0.0]
        # Very simple tokenization
        words = text.lower().replace("(", "").replace(")", "").replace(".", "").split()
        for w in words:
            if w in self.vocab:
                vec = [v1 + v2 for v1, v2 in zip(vec, self.vocab[w])]
        
        mag = math.sqrt(sum(v**2 for v in vec))
        if mag == 0: return [0.0, 0.0, 0.0]
        return [v/mag for v in vec]

    def ingest(self, documents: List[str]):
        for doc in documents:
            vec = self._mock_embed(doc)
            self.vector_store.append({"text": doc, "vector": vec})

    def retrieve(self, query: str, top_k: int = 2) -> List[str]:
        query_vec = self._mock_embed(query)
        
        scores = []
        for item in self.vector_store:
            # Dot product (since already normalized, this is cosine similarity)
            sim = sum(q * v for q, v in zip(query_vec, item["vector"]))
            scores.append((sim, item["text"]))
            
        scores.sort(key=lambda x: x[0], reverse=True)
        return [text for score, text in scores[:top_k]]

    def generate(self, query: str) -> str:
        context_docs = self.retrieve(query)
        context_str = " | ".join(context_docs)
        
        return f"Based on: {context_str} | I can answer your query: {query}"
`,
    timeEstimate: { minutes: 50, label: "50-65 min" },
    prerequisites: ["cosine-similarity", "basic-retrieval"],
    realWorld: {
        description: "This is the fundamental architecture of every RAG application (LangChain, LlamaIndex, Haystack). Understanding how data flows from raw text to embedded vector to retrieved context is critical for debugging production systems.",
        companies: ["All companies using RAG"],
        useCases: ["Core RAG Architecture", "System Design"],
    },
    relatedPlaybooks: ["production-rag-blueprint", "rag-evaluation-suite"],
  },
];
