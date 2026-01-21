import type { RawChallenge } from "@/lib/challenges/types";

export const AGENTIC_CHALLENGES: RawChallenge[] = [
  {
    slug: "tool-use-basics",
    title: "Tool Use (Router)",
    description:
      "Build a simple router that decides whether to use a search tool, a calculator, or answer directly.",
    group: "Phase 4 — Advanced Systems & Agents",
    difficulty: "medium",
    xpReward: 100,
    starterCode: `from typing import Literal

ToolChoice = Literal["search", "calculator", "none"]

def decide_tool(query: str) -> ToolChoice:
    """
    Analyze the query and return the appropriate tool.
    
    Rules:
    - If the query requires current events or external facts -> "search"
    - If the query requires math -> "calculator"
    - If it's a general greeting or small talk -> "none"
    """
    q = query.lower()
    # TODO: implement logic (you can use simple keyword heuristics for this exercise)
    raise NotImplementedError
`,
    testCode: `assert decide_tool("What is the capital of France?") == "search"
assert decide_tool("Who won the 2024 election?") == "search"
assert decide_tool("Calculate 25 * 47") == "calculator"
assert decide_tool("What is the square root of 144?") == "calculator"
assert decide_tool("Hello there!") == "none"
assert decide_tool("How are you?") == "none"

print("All tests passed!")`,
    hints: [
      "Check for math symbols (+, *, /, square root) for calculator.",
      "Check for question words (Who, What, When, Where) combined with specific entities for search.",
      "Default to 'none' for greetings.",
    ],
    solution: `from typing import Literal

ToolChoice = Literal["search", "calculator", "none"]

def decide_tool(query: str) -> ToolChoice:
    q = query.lower()
    
    # Check for math keywords first
    math_keywords = ["calculate", "square root", "what is", "+", "*", "/", "-"]
    math_patterns = ["how much", "multiply", "divide", "sum of", "difference"]
    
    if any(k in q for k in ["calculate", "square root"]):
        return "calculator"
    if any(p in q for p in math_patterns):
        return "calculator"
    if any(c in q for c in ["*", "/"]) or q.count("-") > 1:
        return "calculator"
        
    # Check for greetings/small talk
    greetings = ["hello", "hi", "how are you", "hey", "good morning", "good evening"]
    if any(g in q for g in greetings):
        return "none"
    
    # Default to search for informational queries
    if any(w in q for w in ["who", "what", "when", "where", "why", "capital", "won", "election"]):
        return "search"
    
    return "none"
`,
    realWorld: {
        description: "Simple routing is the first step toward Agents. Instead of running expensive retrieval for 'Hello', a router saves you money by bypassing the RAG pipeline entirely.",
        companies: ["Intercom", "LlamaIndex", "LangChain"],
        useCases: ["Cost Optimization", "Handling Out-of-Distribution Queries"],
    },
    relatedPlaybooks: ["rag-techniques-encyclopedia", "learning-paths", "prompt-templates"],
  },
  {
    slug: "react-implementation",
    title: "ReAct Loop (Reason + Act)",
    description:
      "Implement a single step of the ReAct (Reasoning + Acting) loop: parsing the LLM's raw text output.",
    group: "Phase 4 — Advanced Systems & Agents",
    difficulty: "hard",
    xpReward: 150,
    prerequisites: ["tool-use-basics"],
    starterCode: `import re
from typing import Optional, Tuple

def parse_react_output(llm_output: str) -> Tuple[Optional[str], Optional[str], Optional[str]]:
    """
    Parse the raw output string from an LLM formatted in ReAct style.
    
    Expected Format:
    Thought: [reasoning steps]
    Action: [tool name]
    Action Input: [arguments]
    
    Return a tuple: (thought, action_tool, action_input)
    If any part is missing, return None for that part.
    """
    # TODO: Use regex to extract the three components
    raise NotImplementedError
`,
    testCode: `sample1 = """
Thought: The user is asking about apple stock.
Action: stock_search
Action Input: AAPL
"""
t, a, i = parse_react_output(sample1)
assert "apple stock" in t
assert a == "stock_search"
assert i == "AAPL"

sample2 = "Thought: I know this one. The answer is 42."
t2, a2, i2 = parse_react_output(sample2)
assert "answer is 42" in t2
assert a2 is None
assert i2 is None

print("All tests passed!")`,
    hints: [
      "Use re.search with patterns like r'Thought: (.*)'",
      "Action and Action Input might not exist in all responses (final answer case).",
      "Be careful dealing with newlines.",
    ],
    solution: `import re
from typing import Optional, Tuple

def parse_react_output(llm_output: str) -> Tuple[Optional[str], Optional[str], Optional[str]]:
    thought = None
    action = None
    action_input = None
    
    # Extract Thought
    thought_match = re.search(r'Thought:\\s*(.+?)(?=\\nAction:|$)', llm_output, re.DOTALL)
    if thought_match:
        thought = thought_match.group(1).strip()
    
    # Extract Action
    action_match = re.search(r'Action:\\s*(.+?)(?=\\n|$)', llm_output)
    if action_match:
        action = action_match.group(1).strip()
    
    # Extract Action Input
    input_match = re.search(r'Action Input:\\s*(.+?)(?=\\n|$)', llm_output)
    if input_match:
        action_input = input_match.group(1).strip()
    
    return (thought, action, action_input)
`,
    realWorld: {
        description: "The ReAct pattern (Reasoning + Acting) is what gives AI 'Agency'. It was the breakthrough that enabled models like GPT-4 to solve multi-step problems by iteratively searching and evaluating results.",
        companies: ["OpenAI", "Anthropic", "AutoGPT"],
        useCases: ["Automated Research", "Complex Personal Assistants"],
    },
    relatedPlaybooks: ["rag-techniques-encyclopedia", "rag-interview-questions"],
  },
  {
    slug: "self-correction-loop",
    title: "Self-Correction Loop",
    description:
      "Implement a verification step that checks if the generated answer is supported by the retrieved context.",
    group: "Phase 4 — Advanced Systems & Agents",
    difficulty: "hard",
    xpReward: 150,
    prerequisites: ["react-implementation"],
    starterCode: `from typing import List

def verify_and_retry(answer: str, context: List[str]) -> str:
    """
    Check if the key facts in the 'answer' are present in the 'context'.
    
    For this exercise, we will use a simple keyword overlap heuristic 
    to simulate a "Hallucination Grader".
    
    - Tokenize answer and context (simple split).
    - If < 50% of the significant words (length > 3) in answer 
      appear in the context, return "RETRY".
    - Otherwise, return "PASS".
    """
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `ctx = ["Paris is the capital of France.", "It has the Eiffel Tower."]
ans_good = "Paris is the capital of France."
ans_bad = "Paris is in Germany."

assert verify_and_retry(ans_good, ctx) == "PASS"
assert verify_and_retry(ans_bad, ctx) == "RETRY"

# Edge case: short answer might pass if words match
assert verify_and_retry("Eiffel Tower", ctx) == "PASS"

print("All tests passed!")`,
    hints: [
      "Normalize text to lowercase.",
      "Collect all unique words from context into a set.",
      "Count how many answer words are in that set.",
    ],
    solution: `from typing import List

def verify_and_retry(answer: str, context: List[str]) -> str:
    # Combine all context into one set of words
    context_words = set()
    for ctx in context:
        words = ctx.lower().split()
        context_words.update(words)
    
    # Get significant words from answer (length > 3)
    answer_words = answer.lower().split()
    significant_words = [w for w in answer_words if len(w) > 3]
    
    if not significant_words:
        # If no significant words, check if any words match
        matching = sum(1 for w in answer_words if w in context_words)
        return "PASS" if matching > 0 else "RETRY"
    
    # Count how many significant words appear in context
    matching = sum(1 for w in significant_words if w in context_words)
    overlap_ratio = matching / len(significant_words)
    
    return "PASS" if overlap_ratio >= 0.5 else "RETRY"
`,
    timeEstimate: { minutes: 25, label: "25-35 min" },
    realWorld: {
        description: "Hallucination is the #1 problem in RAG. Self-correction loops (like CRAG or Self-RAG) use a separate 'Grader' model to verify if the answer is grounded in the context before showing it to the user.",
        companies: ["Google DeepMind", "Meta AI"],
        useCases: ["Medical/Financial RAG", "High-trust QA Systems"],
    },
    relatedPlaybooks: ["rag-techniques-encyclopedia", "rag-troubleshooting-guide"],
  },
];
