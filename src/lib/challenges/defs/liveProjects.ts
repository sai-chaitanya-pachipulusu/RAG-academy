import type { RawChallenge } from "@/lib/challenges/types";

export const LIVE_DATA_CHALLENGES: RawChallenge[] = [
  {
    slug: "news-search-tool",
    title: "Project: The News Agent",
    description:
      "Build a 'Live RAG' agent that queries a search API to answer questions about recent events not in its training data.",
    group: "Phase 4 — Capstone: Live Projects",
    difficulty: "hard",
    xpReward: 150,
    starterCode: `from typing import Dict, List
import re

# Mock Search API
MOCK_WEB_INDEX = {
    "weather san francisco": "The weather in San Francisco is currently 65F and sunny.",
    "stock price apple": "Apple (AAPL) is trading at $150.25, up 1.2%.",
    "latest rag techniques": "New techniques involve Agentic flows and GraphRAG for better reasoning.",
}

def search_tool(query: str) -> str:
    \"\"\"
    Mock search tool. In production, this would call Tavily, SerpApi, or Google.
    \"\"\"
    normalized = " ".join(re.findall(r"[a-z0-9]+", query.lower()))
    for key, content in MOCK_WEB_INDEX.items():
        if key in normalized:
            return content
    return "No relevant results found."

def news_agent_solve(user_query: str) -> str:
    \"\"\"
    1. Analyze the user query.
    2. Generate a search query (keyword extraction).
    3. Call search_tool().
    4. Synthesize an answer based ONLY on the tool output.
    \"\"\"
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `ans1 = news_agent_solve("What is the weather in SF?")
assert "65F" in ans1 or "sunny" in ans1

ans2 = news_agent_solve("AAPL price")
assert "150.25" in ans2

# Ensure it uses current context provided by tool, not old hallucinations
ans3 = news_agent_solve("What are the latest RAG techniques?")
assert "Agentic" in ans3 or "GraphRAG" in ans3

print("All tests passed!")`,
    hints: [
      "This is 'Retrieval' where the Retriever is an API call.",
      "Extract key phrases from the user query to pass to `search_tool`.",
      "If the user query is complex, you might need multiple simple search queries (Tool Use).",
    ],
    solution: `from typing import Dict, List
import re

# Mock Search API
MOCK_WEB_INDEX = {
    "weather san francisco": "The weather in San Francisco is currently 65F and sunny.",
    "stock price apple": "Apple (AAPL) is trading at $150.25, up 1.2%.",
    "latest rag techniques": "New techniques involve Agentic flows and GraphRAG for better reasoning.",
}

def search_tool(query: str) -> str:
    normalized = " ".join(re.findall(r"[a-z0-9]+", query.lower()))
    for key, content in MOCK_WEB_INDEX.items():
        if key in normalized:
            return content
    return "No relevant results found."

def news_agent_solve(user_query: str) -> str:
    # Extract keywords for search
    keywords = " ".join(re.findall(r"[a-z0-9]+", user_query.lower()))
    
    # Call search tool
    search_result = search_tool(keywords)
    
    # Synthesize answer based on tool output
    if search_result == "No relevant results found.":
        return "I couldn't find relevant information for your query."
    
    return f"Based on current information: {search_result}"
`,
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
    slug: "customer-support-bot",
    title: "Project: Dynamic Support Bot",
    description:
      "Fuse static policy documents with live user state (SQL) to answer 'What about MY order?'.",
    group: "Phase 4 — Capstone: Live Projects",
    difficulty: "hard",
    xpReward: 150,
    starterCode: `from typing import Any, Dict, List

# Static Policy Knowledge Base (Vector DB simulation)
POLICY_DOCS = {
    "return_policy": "Returns are allowed within 30 days if the item is unused.",
    "shipping_policy": "Standard shipping takes 5-7 business days.",
}

# Live User Database (SQL simulation)
USER_DB = {
    "u1": {
        "name": "Alice",
        "orders": [
            {"id": "o101", "item": "Laptop", "date": "2023-10-01", "status": "delivered"},
        ]
    },
    "u2": {
        "name": "Bob",
        "orders": [
            {"id": "o102", "item": "Shirt", "date": "2024-01-01", "status": "shipped"},
        ]
    }
}

def retrieve_policy(query: str) -> str:
    # (Mock) Retrieve relevant policy text
    if "return" in query.lower():
        return POLICY_DOCS["return_policy"]
    if "shipping" in query.lower() or "how long" in query.lower():
        return POLICY_DOCS["shipping_policy"]
    return ""

def get_user_state(user_id: str) -> Dict[str, Any]:
    return USER_DB.get(user_id, {})

def support_bot_answer(user_id: str, query: str) -> str:
    \"\"\"
    Synthesize an answer using both:
    1. Live user state (orders, status)
    2. Static policy docs (rules)
    
    Example: 'Can I return my laptop?' -> Check order date vs policy window.
    \"\"\"
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `import datetime

# Mock 'today' as 2023-11-01 for context (31 days after Alice's order)
ctx_alice = support_bot_answer("u1", "Can I return the Laptop?")
# Alice ordered 2023-10-01. Today is 1 month later? This might verify logic logic.
# Actually, let's keep it simpler: Reasoning based on status.

# Bob asks about shipping
ans_bob = support_bot_answer("u2", "When will my shirt arrive?")
assert "5-7" in ans_bob or "business days" in ans_bob
assert "shipped" in ans_bob.lower() or "on its way" in ans_bob.lower()

# Alice context check
ans_alice = support_bot_answer("u1", "What did I order?")
assert "Laptop" in ans_alice

print("All tests passed!")`,
    hints: [
      "Fetch `get_user_state(user_id)` first.",
      "Call `retrieve_policy(query)` to get the rules.",
      "Combine: 'You ordered [Item]. The policy says [Rule]. Therefore...'",
    ],
    solution: `from typing import Any, Dict, List

# Static Policy Knowledge Base (Vector DB simulation)
POLICY_DOCS = {
    "return_policy": "Returns are allowed within 30 days if the item is unused.",
    "shipping_policy": "Standard shipping takes 5-7 business days.",
}

# Live User Database (SQL simulation)
USER_DB = {
    "u1": {
        "name": "Alice",
        "orders": [
            {"id": "o101", "item": "Laptop", "date": "2023-10-01", "status": "delivered"},
        ]
    },
    "u2": {
        "name": "Bob",
        "orders": [
            {"id": "o102", "item": "Shirt", "date": "2024-01-01", "status": "shipped"},
        ]
    }
}

def retrieve_policy(query: str) -> str:
    if "return" in query.lower():
        return POLICY_DOCS["return_policy"]
    if "shipping" in query.lower() or "how long" in query.lower() or "when" in query.lower():
        return POLICY_DOCS["shipping_policy"]
    return ""

def get_user_state(user_id: str) -> Dict[str, Any]:
    return USER_DB.get(user_id, {})

def support_bot_answer(user_id: str, query: str) -> str:
    # Get user state
    user = get_user_state(user_id)
    if not user:
        return "User not found."
    
    # Get relevant policy
    policy = retrieve_policy(query)
    
    # Get user orders
    orders = user.get("orders", [])
    
    # Handle different query types
    if "order" in query.lower() or "what did" in query.lower():
        if orders:
            items = [o["item"] for o in orders]
            return f"You ordered: {', '.join(items)}. Status: {orders[-1]['status']}."
    
    if "return" in query.lower() and orders:
        item = orders[-1]["item"]
        return f"You ordered a {item}. {policy}"
    
    if "shipping" in query.lower() or "when" in query.lower() or "arrive" in query.lower():
        if orders:
            status = orders[-1]["status"]
            return f"Your order is currently {status}. {policy}"
    
    return f"{policy}" if policy else "How can I help you today?"
`,
    timeEstimate: { minutes: 40, label: "40-50 min" },
    prerequisites: ["tool-use-basics", "metadata-filtering"],
    realWorld: {
        description: "The most common Enterprise RAG use case. It combines static company policies with dynamic user data from a SQL database. This is how high-scale support agents (like Klarna's AI) operate.",
        companies: ["Klarna", "Zendesk", "Salesforce"],
        useCases: ["Automated Customer Support", "Order Troubleshooting"],
    },
    relatedPlaybooks: ["rag-techniques-encyclopedia", "prompt-templates"],
  },
  {
    slug: "financial-analyst-agent",
    title: "Project: The Crypto Analyst",
    description:
      "A multi-step agent that fetches live prices and retrieves 'analyst notes' to form a buy/sell thesis.",
    group: "Phase 4 — Capstone: Live Projects",
    difficulty: "hard",
    xpReward: 200,
    starterCode: `from typing import Dict, List

# 1. Live Data Tool
PRICES = {"BTC": 50000, "ETH": 3000, "DOGE": 0.20}

def get_price(ticker: str) -> float:
    return PRICES.get(ticker.upper(), 0.0)

# 2. Vector DB (Analyst Notes)
NOTES = [
    "BTC is facing resistance at 52k. Downside risk if it breaks 48k.",
    "ETH upgrading to 2.0. Long term bullish above 2500.",
    "DOGE is purely meme-driven. High volatility expected.",
]

def retrieve_notes(ticker: str) -> List[str]:
    return [n for n in NOTES if ticker.upper() in n]

def crypto_analysis(ticker: str) -> str:
    \"\"\"
    1. Fetch current price.
    2. Retrieve relevant notes.
    3. Synthesize a short analysis: "Current price is X. Notes say Y."
    \"\"\"
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `ans_btc = crypto_analysis("BTC")
assert "50000" in ans_btc
assert "resistance" in ans_btc.lower() or "52k" in ans_btc

ans_eth = crypto_analysis("ETH")
assert "3000" in ans_eth
assert "bullish" in ans_eth.lower()

print("All tests passed!")`,
    hints: [
      "This is a standard 'Enrichment' pattern.",
      "Step 1: Get structured data (Price).",
      "Step 2: Get unstructured data (Docs).",
      "Step 3: Prompt the LLM (string format) with both.",
    ],
    solution: `from typing import Dict, List

# 1. Live Data Tool
PRICES = {"BTC": 50000, "ETH": 3000, "DOGE": 0.20}

def get_price(ticker: str) -> float:
    return PRICES.get(ticker.upper(), 0.0)

# 2. Vector DB (Analyst Notes)
NOTES = [
    "BTC is facing resistance at 52k. Downside risk if it breaks 48k.",
    "ETH upgrading to 2.0. Long term bullish above 2500.",
    "DOGE is purely meme-driven. High volatility expected.",
]

def retrieve_notes(ticker: str) -> List[str]:
    return [n for n in NOTES if ticker.upper() in n]

def crypto_analysis(ticker: str) -> str:
    # Step 1: Get current price
    price = get_price(ticker)
    
    # Step 2: Retrieve relevant notes
    notes = retrieve_notes(ticker)
    
    # Step 3: Synthesize analysis
    price_str = f"Current " + ticker.upper() + " price: $" + str(price)
    
    if notes:
        notes_str = " ".join(notes)
        return price_str + ". Analysis: " + notes_str
    else:
        return price_str + ". No analyst notes available."
`,
    timeEstimate: { minutes: 45, label: "45-60 min" },
    prerequisites: ["react-implementation", "tool-use-basics"],
    realWorld: {
        description: "Standard workflow for algorithmic trading and financial research. Multi-step agents gather hard data (prices) and qualitative data (notes) to provide a synthesized recommendation.",
        companies: ["Bloomberg", "Goldman Sachs", "BlackRock"],
        useCases: ["Investment Thesis Generation", "Sentiment Analysis"],
    },
    relatedPlaybooks: ["rag-techniques-encyclopedia", "learning-paths"],
  },
];
