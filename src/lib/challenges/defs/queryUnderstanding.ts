import type { RawChallenge } from "@/lib/challenges/types";

/**
 * QUERY UNDERSTANDING SAGA
 * 
 * The often-overlooked "pre-retrieval" step that can dramatically improve RAG quality.
 * These challenges teach how to process, enhance, and understand user queries
 * before sending them to the retriever.
 */

export const QUERY_UNDERSTANDING_CHALLENGES: RawChallenge[] = [
  // ============================================================================
  // INTENT CLASSIFICATION
  // ============================================================================
  {
    slug: "intent-classification",
    title: "Query Intent Classification",
    description:
      "Classify user queries by intent type (factual, procedural, opinion, comparison). Why: Different intents need different retrieval strategies. Solves: Route queries to optimal handlers.",
    group: "Query Understanding — Intent & Classification",
    difficulty: "medium",
    xpReward: 75,
    starterCode: `from typing import Literal

QueryIntent = Literal["factual", "procedural", "opinion", "comparison", "unknown"]

def classify_intent(query: str) -> QueryIntent:
    """
    Classify the intent of a user query.
    
    Intent Types:
    - factual: "What is...", "Who is...", "When did..."
    - procedural: "How do I...", "How to...", "Steps to..."
    - opinion: "What do you think...", "Should I...", "Is it good..."
    - comparison: "Which is better...", "Difference between...", "Compare..."
    - unknown: Cannot determine
    
    Returns the classified intent.
    """
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `# Factual queries
assert classify_intent("What is machine learning?") == "factual"
assert classify_intent("Who founded OpenAI?") == "factual"
assert classify_intent("When was Python created?") == "factual"

# Procedural queries
assert classify_intent("How do I reset my password?") == "procedural"
assert classify_intent("Steps to deploy a model") == "procedural"

# Opinion queries
assert classify_intent("Should I use PyTorch or TensorFlow?") == "opinion"
assert classify_intent("Is RAG better than fine-tuning?") == "opinion"

# Comparison queries
assert classify_intent("Compare Python and JavaScript") == "comparison"
assert classify_intent("Difference between SQL and NoSQL") == "comparison"

print("Intent classification passed!")`,
    hints: [
      "Use keyword patterns: 'what is', 'who is' → factual",
      "Check for 'how to', 'how do' → procedural",
      "Look for 'should', 'better', 'recommend' → opinion",
      "Detect 'compare', 'difference', 'vs' → comparison",
    ],
    solution: `from typing import Literal

QueryIntent = Literal["factual", "procedural", "opinion", "comparison", "unknown"]

def classify_intent(query: str) -> QueryIntent:
    lower = query.lower()
    
    # Factual patterns
    factual_patterns = ["what is", "who is", "when did", "when was", "where is", "how many", "how much"]
    if any(p in lower for p in factual_patterns):
        return "factual"
    
    # Procedural patterns
    procedural_patterns = ["how do i", "how to", "steps to", "how can i", "how should i"]
    if any(p in lower for p in procedural_patterns):
        return "procedural"
    
    # Comparison patterns
    comparison_patterns = ["compare", "difference between", " vs ", " versus ", "which is better"]
    if any(p in lower for p in comparison_patterns):
        return "comparison"
    
    # Opinion patterns
    opinion_patterns = ["should i", "is it good", "what do you think", "recommend", "is it worth"]
    if any(p in lower for p in opinion_patterns):
        return "opinion"
    
    return "unknown"
`,
    timeEstimate: { minutes: 20, label: "20-25 min" },
    realWorld: {
      description: "Production RAG systems route different intents differently. Factual queries go to the vector store, procedural queries may trigger step-by-step generation, and opinions may need additional context.",
      companies: ["Google Search", "Alexa", "Siri"],
      useCases: ["Query routing", "Intent-based retrieval", "Chatbot design"],
    },
    relatedPlaybooks: ["rag-techniques-encyclopedia", "learning-paths"],
  },

  // ============================================================================
  // ENTITY EXTRACTION FROM QUERIES
  // ============================================================================
  {
    slug: "query-entity-extraction",
    title: "Query Entity Extraction",
    description:
      "Extract named entities from queries to enable metadata filtering. Why: Knowing 'Apple' is a company helps filter to company-related documents. Solves: Improves retrieval precision with structured metadata.",
    group: "Query Understanding — Intent & Classification",
    difficulty: "medium",
    xpReward: 75,
    starterCode: `from typing import Dict, List

def extract_query_entities(query: str) -> Dict[str, List[str]]:
    """
    Extract named entities from a query.
    
    Entity Types to extract:
    - person: Names of people
    - organization: Company/org names
    - date: Date references
    - location: Place names
    - product: Product names
    
    Returns dict of entity_type -> list of entities
    
    For this exercise, use simple heuristics:
    - Capitalized words (not at start) are likely entities
    - Known company suffixes: Inc, Corp, LLC
    - Date patterns: 2024, January, Q1
    """
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `# Test company extraction
result = extract_query_entities("What is Apple's revenue in 2024?")
assert "Apple" in result.get("organization", []) or "Apple" in result.get("entity", [])
assert "2024" in result.get("date", [])

# Test person extraction
result2 = extract_query_entities("When did Elon Musk found SpaceX?")
assert any("Elon" in e or "Musk" in e for e in result2.get("person", result2.get("entity", [])))
assert "SpaceX" in result2.get("organization", result2.get("entity", []))

# Test location
result3 = extract_query_entities("What is the weather in New York?")
assert any("York" in e or "New York" in e for e in result3.get("location", result3.get("entity", [])))

print("Query entity extraction passed!")`,
    hints: [
      "Split the query into words",
      "Check for capitalization patterns",
      "Use regex for dates: r'\\b(19|20)\\d{2}\\b'",
      "Known company patterns: ends with Inc, Corp, LLC",
    ],
    solution: `from typing import Dict, List
import re

COMPANY_SUFFIXES = ["Inc", "Corp", "LLC", "Ltd", "Co"]
MONTHS = ["January", "February", "March", "April", "May", "June", 
          "July", "August", "September", "October", "November", "December"]
QUARTERS = ["Q1", "Q2", "Q3", "Q4"]

def extract_query_entities(query: str) -> Dict[str, List[str]]:
    entities = {
        "organization": [],
        "person": [],
        "date": [],
        "location": [],
        "entity": []  # Generic entities
    }
    
    words = query.split()
    
    # Date extraction
    years = re.findall(r'\\b(19|20)\\d{2}\\b', query)
    entities["date"].extend(years)
    
    for month in MONTHS:
        if month in query:
            entities["date"].append(month)
    
    for q in QUARTERS:
        if q in query:
            entities["date"].append(q)
    
    # Entity extraction from capitalized words
    for i, word in enumerate(words):
        clean_word = re.sub(r'[^a-zA-Z]', '', word)
        if not clean_word:
            continue
            
        # Skip first word (always capitalized)
        if i == 0:
            continue
        
        # Check if capitalized
        if clean_word[0].isupper():
            # Check for company suffix
            if any(clean_word.endswith(suffix) for suffix in COMPANY_SUFFIXES):
                entities["organization"].append(clean_word)
            else:
                # Add as generic entity
                entities["entity"].append(clean_word)
    
    # Combine consecutive capitalized words
    combined = []
    current = []
    for i, word in enumerate(words):
        clean = re.sub(r'[^a-zA-Z]', '', word)
        if clean and clean[0].isupper() and i > 0:
            current.append(clean)
        else:
            if len(current) > 1:
                combined.append(" ".join(current))
            current = []
    
    if len(current) > 1:
        combined.append(" ".join(current))
    
    entities["entity"].extend(combined)
    
    return entities
`,
    timeEstimate: { minutes: 25, label: "25-35 min" },
    realWorld: {
      description: "NER on queries enables powerful metadata filtering. 'What did Apple announce in 2024?' can filter to Apple-related docs from 2024 before vector search.",
      companies: ["Google", "Amazon (Alexa)", "Microsoft (Cortana)"],
      useCases: ["Metadata filtering", "Query understanding", "Named entity linking"],
    },
    relatedPlaybooks: ["rag-techniques-encyclopedia", "document-parsing-guide"],
  },

  // ============================================================================
  // QUERY EXPANSION
  // ============================================================================
  {
    slug: "query-expansion",
    title: "Query Expansion with Synonyms",
    description:
      "Expand user queries with synonyms and related terms to improve recall. Why: Users say 'laptop' but docs say 'notebook computer'. Solves: Vocabulary mismatch between queries and documents.",
    group: "Query Understanding — Expansion & Augmentation",
    difficulty: "medium",
    xpReward: 75,
    starterCode: `from typing import List

SYNONYMS = {
    "laptop": ["notebook", "portable computer", "MacBook", "ThinkPad"],
    "error": ["bug", "issue", "problem", "fault", "exception"],
    "fast": ["quick", "rapid", "speedy", "high-performance"],
    "cheap": ["affordable", "budget", "low-cost", "economical"],
    "big": ["large", "huge", "massive", "substantial"],
}

def expand_query(query: str, max_expansions: int = 2) -> List[str]:
    """
    Expand a query with synonyms for key terms.
    
    Strategy:
    1. Identify terms in the query that have synonyms
    2. Generate alternative queries with substituted synonyms
    3. Return original + expanded queries (up to max_expansions)
    
    Args:
        query: Original user query
        max_expansions: Maximum number of expanded queries to return
        
    Returns:
        List of queries (original first, then expansions)
    """
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `# Test basic expansion
expansions = expand_query("My laptop has an error", max_expansions=3)
assert "My laptop has an error" in expansions  # Original preserved
assert len(expansions) >= 2  # At least one expansion
assert any("notebook" in e or "bug" in e or "issue" in e for e in expansions)

# Test no expansion needed
no_expand = expand_query("Hello world", max_expansions=2)
assert "Hello world" in no_expand
assert len(no_expand) == 1  # Only original if no synonyms

# Test max limit
limited = expand_query("fast cheap laptop", max_expansions=2)
assert len(limited) <= 3  # original + max 2

print("Query expansion passed!")`,
    hints: [
      "Tokenize the query and check each word against SYNONYMS dict",
      "Create new queries by substituting one synonym at a time",
      "Keep the original query as the first result",
    ],
    solution: `from typing import List

SYNONYMS = {
    "laptop": ["notebook", "portable computer", "MacBook", "ThinkPad"],
    "error": ["bug", "issue", "problem", "fault", "exception"],
    "fast": ["quick", "rapid", "speedy", "high-performance"],
    "cheap": ["affordable", "budget", "low-cost", "economical"],
    "big": ["large", "huge", "massive", "substantial"],
}

def expand_query(query: str, max_expansions: int = 2) -> List[str]:
    queries = [query]  # Original first
    words = query.lower().split()
    
    expansions_added = 0
    for i, word in enumerate(words):
        # Clean the word
        clean_word = ''.join(c for c in word if c.isalpha())
        
        if clean_word in SYNONYMS and expansions_added < max_expansions:
            # Create query with synonym substitution
            for synonym in SYNONYMS[clean_word][:1]:  # Take first synonym
                new_words = words.copy()
                new_words[i] = synonym
                new_query = ' '.join(new_words)
                
                # Preserve original capitalization style
                if query[0].isupper():
                    new_query = new_query.capitalize()
                
                if new_query not in queries:
                    queries.append(new_query)
                    expansions_added += 1
                    
                    if expansions_added >= max_expansions:
                        break
        
        if expansions_added >= max_expansions:
            break
    
    return queries
`,
    timeEstimate: { minutes: 25, label: "25-30 min" },
    realWorld: {
      description: "Query expansion addresses the vocabulary mismatch problem. Elasticsearch uses it natively, and modern RAG systems combine it with dense retrieval for better recall.",
      companies: ["Elasticsearch", "Algolia", "Coveo"],
      useCases: ["Search recall improvement", "E-commerce search", "Medical query expansion"],
    },
    relatedPlaybooks: ["rag-techniques-encyclopedia", "chunking-strategies"],
  },

  // ============================================================================
  // HYPOTHETICAL DOCUMENT EMBEDDING (HyDE)
  // ============================================================================
  {
    slug: "hyde-implementation",
    title: "HyDE: Hypothetical Document Embedding",
    description:
      "Generate a hypothetical answer to embed instead of the raw query. Why: The query 'What is RAG?' is short and vague, but a hypothetical answer contains the vocabulary of actual documents. Solves: Query-document vocabulary mismatch.",
    group: "Query Understanding — Expansion & Augmentation",
    difficulty: "hard",
    xpReward: 100,
    starterCode: `from typing import List

def generate_hypothetical_answer(query: str) -> str:
    """
    Generate a hypothetical answer that WOULD answer the query.
    
    For this exercise, we simulate LLM generation with templates.
    
    Strategy:
    - If query starts with "What is", generate "X is a..."
    - If query starts with "How to", generate "To X, you need to..."
    - Otherwise, generate a relevant passage
    
    The hypothetical answer should contain vocabulary that
    would appear in actual documents about this topic.
    """
    # TODO: implement
    raise NotImplementedError

def hyde_retrieve(query: str, documents: List[str]) -> List[str]:
    """
    1. Generate hypothetical answer
    2. Calculate similarity between hypothetical answer and documents
    3. Return documents sorted by similarity
    
    For similarity, use word overlap (Jaccard) as a simple proxy.
    """
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `# Test hypothetical generation
hyp = generate_hypothetical_answer("What is machine learning?")
assert "machine learning" in hyp.lower() or "ml" in hyp.lower()
assert len(hyp) > len("What is machine learning?")  # Should be longer

# Test HyDE retrieval
docs = [
    "Machine learning is a subset of AI that enables systems to learn from data.",
    "The weather today is sunny with a high of 75 degrees.",
    "Deep learning uses neural networks for pattern recognition.",
]
results = hyde_retrieve("What is ML?", docs)
assert "Machine learning" in results[0] or "Deep learning" in results[0]

print("HyDE implementation passed!")`,
    hints: [
      "For hypothetical answers, expand the query topic with relevant terms",
      "Use templates based on question type",
      "Jaccard similarity: |A ∩ B| / |A ∪ B|",
    ],
    solution: `from typing import List

def generate_hypothetical_answer(query: str) -> str:
    lower = query.lower()
    
    # Extract the subject from the query
    subject = query
    for prefix in ["what is ", "what are ", "how to ", "how do i "]:
        if lower.startswith(prefix):
            subject = query[len(prefix):].rstrip("?")
            break
    
    # Generate hypothetical based on query type
    if lower.startswith("what is") or lower.startswith("what are"):
        return f"{subject.capitalize()} is a technology/concept that enables specific capabilities. It is widely used in industry for various applications including data processing, automation, and analysis. Key components include algorithms, data structures, and computational methods."
    
    elif lower.startswith("how to") or lower.startswith("how do"):
        return f"To {subject}, you need to follow these steps: First, understand the requirements and prerequisites. Then, implement the core functionality using appropriate tools and methods. Finally, test and validate the results to ensure correctness."
    
    else:
        return f"Information about {subject}: This topic relates to important concepts in the field. It involves understanding core principles and applying them to practical situations. Experts recommend following best practices for optimal results."

def jaccard_similarity(text1: str, text2: str) -> float:
    words1 = set(text1.lower().split())
    words2 = set(text2.lower().split())
    intersection = len(words1 & words2)
    union = len(words1 | words2)
    return intersection / union if union > 0 else 0.0

def hyde_retrieve(query: str, documents: List[str]) -> List[str]:
    # Generate hypothetical answer
    hypothetical = generate_hypothetical_answer(query)
    
    # Score documents by similarity to hypothetical
    scored = []
    for doc in documents:
        score = jaccard_similarity(hypothetical, doc)
        scored.append((doc, score))
    
    # Sort by score descending
    scored.sort(key=lambda x: x[1], reverse=True)
    
    return [doc for doc, _ in scored]
`,
    timeEstimate: { minutes: 35, label: "35-45 min" },
    realWorld: {
      description: "HyDE (Gao et al., 2022) showed that embedding a hypothetical answer often retrieves better documents than embedding the query directly. Now used in many production RAG systems.",
      companies: ["Microsoft Research", "Anthropic", "LlamaIndex"],
      useCases: ["Zero-shot retrieval", "Query enhancement", "Knowledge-intensive NLP"],
    },
    relatedPlaybooks: ["rag-techniques-encyclopedia", "learning-paths"],
  },

  // ============================================================================
  // QUERY DECOMPOSITION
  // ============================================================================
  {
    slug: "query-decomposition",
    title: "Multi-Step Query Decomposition",
    description:
      "Break complex queries into simpler sub-queries for better retrieval. Why: 'Compare X and Y' requires retrieving info about BOTH X and Y. Solves: Complex queries that need multiple retrievals.",
    group: "Query Understanding — Expansion & Augmentation",
    difficulty: "hard",
    xpReward: 100,
    starterCode: `from typing import List

def decompose_query(query: str) -> List[str]:
    """
    Decompose a complex query into simpler sub-queries.
    
    Decomposition patterns:
    - "Compare X and Y" → ["What is X?", "What is Y?"]
    - "How does X affect Y?" → ["What is X?", "What is Y?", "Relationship between X and Y"]
    - "What are the pros and cons of X?" → ["Advantages of X", "Disadvantages of X"]
    - Simple queries → Return unchanged
    
    Returns list of sub-queries to retrieve separately.
    """
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `# Test comparison decomposition
subs = decompose_query("Compare Python and JavaScript")
assert len(subs) >= 2
assert any("Python" in s for s in subs)
assert any("JavaScript" in s for s in subs)

# Test pros/cons decomposition
subs2 = decompose_query("What are the pros and cons of microservices?")
assert len(subs2) >= 2
assert any("advantage" in s.lower() or "pro" in s.lower() or "benefit" in s.lower() for s in subs2)

# Test simple query (no decomposition)
simple = decompose_query("What is Python?")
assert len(simple) == 1

print("Query decomposition passed!")`,
    hints: [
      "Detect comparison patterns: 'compare', 'versus', ' vs '",
      "Detect pros/cons patterns: 'pros and cons', 'advantages and disadvantages'",
      "Parse entity pairs from comparison queries",
    ],
    solution: `from typing import List
import re

def decompose_query(query: str) -> List[str]:
    lower = query.lower()
    
    # Comparison pattern
    if "compare" in lower or " vs " in lower or "versus" in lower:
        # Extract the two entities
        pattern = r"compare\\s+(.+?)\\s+(?:and|vs\\.?|versus)\\s+(.+?)(?:\\?|$)"
        match = re.search(pattern, lower)
        if match:
            entity1 = match.group(1).strip()
            entity2 = match.group(2).strip()
            return [
                f"What is {entity1}?",
                f"What is {entity2}?",
                f"Comparison between {entity1} and {entity2}"
            ]
    
    # Pros and cons pattern
    if "pros and cons" in lower or "advantages and disadvantages" in lower:
        # Extract the subject
        subject = re.sub(r"what are the (pros and cons|advantages and disadvantages) of\\s*", "", lower)
        subject = subject.rstrip("?").strip()
        return [
            f"Advantages of {subject}",
            f"Disadvantages of {subject}"
        ]
    
    # How does X affect Y pattern
    affect_match = re.search(r"how does\\s+(.+?)\\s+affect\\s+(.+?)\\??$", lower)
    if affect_match:
        x = affect_match.group(1).strip()
        y = affect_match.group(2).strip()
        return [
            f"What is {x}?",
            f"What is {y}?",
            f"How {x} affects {y}"
        ]
    
    # Difference pattern
    diff_match = re.search(r"(?:what is the )?difference between\\s+(.+?)\\s+and\\s+(.+?)\\??$", lower)
    if diff_match:
        entity1 = diff_match.group(1).strip()
        entity2 = diff_match.group(2).strip()
        return [
            f"What is {entity1}?",
            f"What is {entity2}?"
        ]
    
    # No decomposition needed
    return [query]
`,
    timeEstimate: { minutes: 35, label: "35-45 min" },
    realWorld: {
      description: "Query decomposition is essential for multi-hop reasoning. LangChain's MultiQueryRetriever and LlamaIndex's SubQuestionQueryEngine implement this pattern.",
      companies: ["LangChain", "LlamaIndex", "Google (Search)"],
      useCases: ["Complex question answering", "Research assistants", "Comparison queries"],
    },
    relatedPlaybooks: ["rag-techniques-encyclopedia", "learning-paths"],
  },

  // ============================================================================
  // QUERY REWRITING
  // ============================================================================
  {
    slug: "conversational-query-rewrite",
    title: "Conversational Query Rewriting",
    description:
      "Rewrite follow-up questions to include context from conversation history. Why: 'What about its pricing?' needs context from 'Tell me about Pinecone'. Solves: Standalone retrieval from ambiguous follow-ups.",
    group: "Query Understanding — Conversation Context",
    difficulty: "hard",
    xpReward: 100,
    prerequisites: ["query-expansion"],
    starterCode: `from typing import List, Dict

def rewrite_query(
    current_query: str,
    conversation_history: List[Dict[str, str]]
) -> str:
    """
    Rewrite a follow-up query to be standalone.
    
    Conversation history format:
    [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]
    
    Examples:
    - History: "Tell me about Pinecone" -> "Pinecone is a vector database..."
    - Follow-up: "What about its pricing?"
    - Rewritten: "What is Pinecone's pricing?"
    
    Strategy:
    1. Identify pronouns and references (it, its, they, this, that)
    2. Find the referenced entity from history
    3. Replace pronoun with entity
    """
    # TODO: implement
    raise NotImplementedError
`,
    testCode: `# Test pronoun resolution
history = [
    {"role": "user", "content": "Tell me about Pinecone"},
    {"role": "assistant", "content": "Pinecone is a vector database for ML applications."}
]
rewritten = rewrite_query("What about its pricing?", history)
assert "Pinecone" in rewritten
assert "its" not in rewritten.lower()

# Test 'it' resolution
history2 = [
    {"role": "user", "content": "Explain the attention mechanism"},
    {"role": "assistant", "content": "Attention allows models to focus on relevant parts."}
]
rewritten2 = rewrite_query("How does it work in transformers?", history2)
assert "attention" in rewritten2.lower()

# Test no rewrite needed
standalone = rewrite_query("What is machine learning?", [])
assert standalone == "What is machine learning?"

print("Conversational query rewriting passed!")`,
    hints: [
      "Detect pronouns: 'it', 'its', 'they', 'them', 'this', 'that'",
      "Extract key entities from the most recent user message",
      "Replace pronouns with extracted entities",
    ],
    solution: `from typing import List, Dict
import re

PRONOUNS = ["it", "its", "this", "that", "they", "them", "their"]

def extract_main_entity(text: str) -> str:
    \"\"\"Extract the main subject from text.\"\"\"
    # Look for capitalized words that might be entities
    words = text.split()
    entities = []
    
    for i, word in enumerate(words):
        clean = re.sub(r'[^a-zA-Z]', '', word)
        if clean and clean[0].isupper() and i > 0:
            entities.append(clean)
    
    if entities:
        return entities[0]
    
    # Fallback: look for "about X" or "explain X" patterns
    patterns = [
        r"(?:about|explain|describe|tell me about)\\s+(?:the\\s+)?([a-zA-Z]+)",
        r"^(?:what is|what are)\\s+(?:a\\s+|an\\s+|the\\s+)?([a-zA-Z]+)"
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1)
    
    return ""

def rewrite_query(
    current_query: str,
    conversation_history: List[Dict[str, str]]
) -> str:
    if not conversation_history:
        return current_query
    
    # Check if query has pronouns that need resolution
    lower = current_query.lower()
    has_pronoun = any(f" {p} " in f" {lower} " or lower.startswith(f"{p} ") or lower.endswith(f" {p}") for p in PRONOUNS)
    
    if not has_pronoun:
        return current_query
    
    # Find the main entity from recent history
    main_entity = ""
    for msg in reversed(conversation_history):
        if msg["role"] == "user":
            main_entity = extract_main_entity(msg["content"])
            if main_entity:
                break
    
    if not main_entity:
        return current_query
    
    # Replace pronouns with entity
    result = current_query
    for pronoun in PRONOUNS:
        # Handle "its" -> "X's"
        if pronoun == "its":
            result = re.sub(r"\\bits\\b", f"{main_entity}'s", result, flags=re.IGNORECASE)
        else:
            result = re.sub(f"\\\\b{pronoun}\\\\b", main_entity, result, flags=re.IGNORECASE)
    
    return result
`,
    timeEstimate: { minutes: 40, label: "40-50 min" },
    realWorld: {
      description: "Conversational query rewriting is essential for multi-turn RAG. ChatGPT and Claude do this internally to maintain context across conversation turns.",
      companies: ["OpenAI", "Anthropic", "Google (Bard)"],
      useCases: ["Conversational AI", "Multi-turn retrieval", "Chatbots"],
    },
    relatedPlaybooks: ["rag-techniques-encyclopedia", "prompt-templates"],
  },
];
