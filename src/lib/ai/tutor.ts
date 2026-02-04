/**
 * AI Tutor System
 * 
 * Provides real-time coding assistance during challenges with context-aware hints,
  * explanations, and guided learning. Uses pattern matching and LLM integration
 * for intelligent tutoring.
 */

import type { Challenge } from "@/lib/challenges/types";

// ============================================
// Types
// ============================================

export type TutorMessageType = 
  | "hint"           // Suggest next step without giving answer
  | "explanation"    // Explain a concept
  | "debug"          // Help with error
  | "review"         // Review code approach
  | "encouragement"; // Positive reinforcement

export interface TutorMessage {
  id: string;
  type: TutorMessageType;
  content: string;
  codeExample?: string;
  relatedConcept?: string;
  timestamp: number;
}

export interface TutorContext {
  challenge: Challenge;
  userCode: string;
  testOutput?: string;
  errorOutput?: string;
  attemptCount: number;
  hintsRevealed: number;
  timeSpentMinutes: number;
}

export interface TutorSession {
  sessionId: string;
  challengeSlug: string;
  messages: TutorMessage[];
  context: TutorContext;
  createdAt: number;
  lastActivityAt: number;
}

export interface TutorRequest {
  type: TutorMessageType;
  context: TutorContext;
  specificQuestion?: string;
}

export interface TutorResponse {
  message: TutorMessage;
  followUpQuestions?: string[];
  suggestedActions?: string[];
}

// ============================================
// Pattern-Based Tutoring (No LLM Required)
// ============================================

const ERROR_PATTERNS: Array<{
  pattern: RegExp;
  type: string;
  getResponse: (match: RegExpMatchArray, context: TutorContext) => TutorMessage;
}> = [
  {
    pattern: /IndexError|list index out of range/i,
    type: "index_error",
    getResponse: () => ({
      id: generateMessageId(),
      type: "debug",
      content: "You're trying to access an index that doesn't exist. Check if your loop bounds are correct, or if you're handling empty lists. Remember: Python uses 0-based indexing!",
      codeExample: `# Check bounds before accessing\nif len(my_list) > index:\n    value = my_list[index]\nelse:\n    handle_empty_case()`,
      relatedConcept: "list-indexing",
      timestamp: Date.now(),
    }),
  },
  {
    pattern: /KeyError|key not found/i,
    type: "key_error",
    getResponse: () => ({
      id: generateMessageId(),
      type: "debug",
      content: "You're trying to access a dictionary key that doesn't exist. Use .get() with a default value, or check if the key exists first.",
      codeExample: `# Safe dictionary access\nvalue = my_dict.get('key', default_value)\n# OR\nif 'key' in my_dict:\n    value = my_dict['key']`,
      relatedConcept: "dictionary-access",
      timestamp: Date.now(),
    }),
  },
  {
    pattern: /TypeError.*NoneType|cannot be None/i,
    type: "none_error",
    getResponse: () => ({
      id: generateMessageId(),
      type: "debug",
      content: "A variable is None when you expected it to have a value. Check your function return values and ensure all code paths return something.",
      codeExample: `# Add null checks\nif result is not None:\n    process(result)\nelse:\n    handle_missing_result()`,
      relatedConcept: "null-safety",
      timestamp: Date.now(),
    }),
  },
  {
    pattern: /cosine.*similarity|dot.*product|vector/i,
    type: "vector_math",
    getResponse: (match, context) => {
      const isCosine = match[0].toLowerCase().includes("cosine");
      return {
        id: generateMessageId(),
        type: "explanation",
        content: isCosine 
          ? "Cosine similarity measures the angle between two vectors. It ranges from -1 (opposite) to 1 (identical). For text embeddings, we typically see 0 to 1."
          : "The dot product measures vector alignment. For unit vectors, it's equivalent to cosine similarity. For non-unit vectors, divide by magnitudes to get cosine similarity.",
        codeExample: isCosine
          ? `import numpy as np\n\ndef cosine_similarity(a, b):\n    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))`
          : `import numpy as np\n\ndef dot_product(a, b):\n    return np.dot(a, b)`,
        relatedConcept: "vector-similarity",
        timestamp: Date.now(),
      };
    },
  },
  {
    pattern: /chunk|split|tokenize/i,
    type: "chunking",
    getResponse: () => ({
      id: generateMessageId(),
      type: "explanation",
      content: "Chunking breaks documents into smaller pieces for embedding. Common strategies include: fixed-size (by characters/tokens), recursive (by structure), and semantic (by meaning). Consider overlap to preserve context across chunk boundaries.",
      codeExample: `# Fixed-size chunking with overlap\ndef chunk_text(text, chunk_size=500, overlap=50):\n    chunks = []\n    start = 0\n    while start < len(text):\n        end = start + chunk_size\n        chunks.append(text[start:end])\n        start = end - overlap\n    return chunks`,
      relatedConcept: "chunking-strategies",
      timestamp: Date.now(),
    }),
  },
  {
    pattern: /embed|embedding|vector.*representation/i,
    type: "embeddings",
    getResponse: () => ({
      id: generateMessageId(),
      type: "explanation",
      content: "Embeddings convert text into dense vectors that capture semantic meaning. Similar texts have similar vectors. Common models include OpenAI's text-embedding-ada-002 and open-source options like all-MiniLM.",
      codeExample: `# Using sentence-transformers\nfrom sentence_transformers import SentenceTransformer\n\nmodel = SentenceTransformer('all-MiniLM-L6-v2')\nembeddings = model.encode(["Hello world", "Hi there"])`,
      relatedConcept: "embeddings-fundamentals",
      timestamp: Date.now(),
    }),
  },
  {
    pattern: /retriev|search|index|query/i,
    type: "retrieval",
    getResponse: () => ({
      id: generateMessageId(),
      type: "explanation",
      content: "Retrieval finds the most relevant chunks for a query. Dense retrieval uses vector similarity (cosine/dot product). Sparse retrieval uses BM25/TF-IDF. Hybrid approaches combine both for better results.",
      codeExample: `# Simple vector retrieval\ndef retrieve(query_embedding, doc_embeddings, k=5):\n    similarities = cosine_similarity(query_embedding, doc_embeddings)\n    top_k_indices = np.argsort(similarities)[-k:][::-1]\n    return top_k_indices`,
      relatedConcept: "retrieval-methods",
      timestamp: Date.now(),
    }),
  },
];

const HINT_TEMPLATES: Record<string, string[]> = {
  "dot-product": [
    "Think about element-wise multiplication followed by summation.",
    "The dot product is the sum of the products of corresponding elements.",
    "Consider using a loop or numpy's dot function.",
  ],
  "cosine-similarity": [
    "Remember: cosine similarity = dot product / (magnitude of A × magnitude of B).",
    "You'll need to normalize the vectors first.",
    "Calculate the dot product, then divide by the product of the L2 norms.",
  ],
  "chunking": [
    "Consider where you want to split the text.",
    "Think about preserving context between chunks.",
    "What size should each chunk be? What about overlap?",
  ],
  "bm25": [
    "BM25 considers term frequency and document length.",
    "Rare terms across documents get higher weights.",
    "You'll need to calculate IDF and term frequency components.",
  ],
  "hnsw": [
    "HNSW builds a multi-layer graph for fast approximate search.",
    "Each layer is a subset of the previous layer.",
    "Search starts at the top layer and navigates down.",
  ],
  "reranking": [
    "First retrieve a larger candidate set, then re-rank.",
    "Consider using a cross-encoder for more accurate scoring.",
    "The reranker can be more expensive since it runs on fewer documents.",
  ],
  "default": [
    "Break the problem down into smaller steps.",
    "What are the inputs and expected outputs?",
    "Try writing pseudocode first.",
    "Look at the test cases to understand the expected behavior.",
  ],
};

const ENCOURAGEMENT_MESSAGES = [
  "Great progress! You're on the right track. 🎉",
  "Nice work! Keep going! 💪",
  "You're getting closer! Don't give up! 🚀",
  "Excellent thinking! That approach makes sense. ✨",
  "You're building real RAG skills here! 🔥",
  "That's a solid implementation! Well done! 👏",
  "You're thinking like a RAG engineer! 🧠",
  "Great job working through this challenge! 🌟",
];

// ============================================
// Helper Functions
// ============================================

function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getHintForChallenge(challenge: Challenge, hintIndex: number): string {
  // First use challenge-specific hints if available
  if (challenge.hints && challenge.hints[hintIndex]) {
    return challenge.hints[hintIndex];
  }
  
  // Fall back to template-based hints
  const templates = HINT_TEMPLATES[challenge.slug] || 
                   HINT_TEMPLATES[challenge.group.toLowerCase().replace(/\s+/g, "-")] ||
                   HINT_TEMPLATES["default"];
  
  return templates[hintIndex % templates.length] || templates[0];
}

function analyzeCodePatterns(code: string, errorOutput?: string): TutorMessage | null {
  const textToAnalyze = errorOutput || code;
  
  for (const pattern of ERROR_PATTERNS) {
    const match = textToAnalyze.match(pattern.pattern);
    if (match) {
      // Create a minimal context for the pattern matcher
      const context: TutorContext = {
        challenge: {} as Challenge,
        userCode: code,
        errorOutput,
        attemptCount: 0,
        hintsRevealed: 0,
        timeSpentMinutes: 0,
      };
      return pattern.getResponse(match, context);
    }
  }
  
  return null;
}

// ============================================
// Main Tutor Functions
// ============================================

/**
 * Get a contextual hint based on challenge progress
 */
export function getHint(context: TutorContext): TutorResponse {
  const hintIndex = context.hintsRevealed;
  const hintContent = getHintForChallenge(context.challenge, hintIndex);
  
  const message: TutorMessage = {
    id: generateMessageId(),
    type: "hint",
    content: hintContent,
    timestamp: Date.now(),
  };
  
  // Add follow-up questions based on challenge
  const followUpQuestions = [
    "Can you explain why this approach works?",
    "What would happen if we changed the parameters?",
    "How does this relate to the previous challenge?",
  ];
  
  return {
    message,
    followUpQuestions: followUpQuestions.slice(0, 2),
    suggestedActions: ["Show me an example", "Explain the concept", "Give me another hint"],
  };
}

/**
 * Get help with debugging errors
 */
export function getDebugHelp(context: TutorContext): TutorResponse {
  // Try pattern-based debugging first
  const patternMatch = analyzeCodePatterns(context.userCode, context.errorOutput);
  
  if (patternMatch) {
    return {
      message: patternMatch,
      suggestedActions: ["Show me the fix", "Explain more", "Try a different approach"],
    };
  }
  
  // Generic debug message
  const message: TutorMessage = {
    id: generateMessageId(),
    type: "debug",
    content: "I see there's an error. Let's break it down:\n\n1. Read the error message carefully - it usually tells you exactly what's wrong\n2. Check the line number mentioned in the error\n3. Look for common issues: typos, missing imports, wrong variable names\n\nWould you like me to look at a specific part of your code?",
    timestamp: Date.now(),
  };
  
  return {
    message,
    followUpQuestions: ["What does this error mean?", "How do I fix it?", "Why did this happen?"],
  };
}

/**
 * Get explanation for a RAG concept
 */
export function getExplanation(concept: string, context: TutorContext): TutorResponse {
  // Try to match concept to patterns
  const patternMatch = analyzeCodePatterns(concept, concept);
  
  if (patternMatch && patternMatch.type === "explanation") {
    return {
      message: patternMatch,
      suggestedActions: ["Show me an example", "How is this used in practice?", "What are alternatives?"],
    };
  }
  
  // Generic explanation
  const message: TutorMessage = {
    id: generateMessageId(),
    type: "explanation",
    content: `Let me explain ${concept} in the context of RAG systems. This concept is fundamental to building effective retrieval-augmented generation pipelines.`,
    relatedConcept: concept.toLowerCase().replace(/\s+/g, "-"),
    timestamp: Date.now(),
  };
  
  return {
    message,
    followUpQuestions: ["Why is this important?", "When should I use this?", "What are common pitfalls?"],
  };
}

/**
 * Get code review feedback
 */
export function getCodeReview(context: TutorContext): TutorResponse {
  const suggestions: string[] = [];
  
  // Basic code analysis
  if (context.userCode.length < 50) {
    suggestions.push("Your solution is quite short. Make sure you're handling all edge cases.");
  }
  
  if (!context.userCode.includes("def ") && !context.userCode.includes("class ")) {
    suggestions.push("Consider organizing your code into functions for better readability.");
  }
  
  if (!context.userCode.includes("# ") && !context.userCode.includes('"""')) {
    suggestions.push("Adding docstrings or comments would help others understand your approach.");
  }
  
  const message: TutorMessage = {
    id: generateMessageId(),
    type: "review",
    content: suggestions.length > 0 
      ? `Here are some suggestions to improve your code:\n\n${suggestions.map(s => "• " + s).join("\n")}`
      : "Your code looks good! It follows best practices and is well-structured.",
    timestamp: Date.now(),
  };
  
  return {
    message,
    suggestedActions: ["Check for edge cases", "Optimize performance", "Add tests"],
  };
}

/**
 * Get encouragement message
 */
export function getEncouragement(context: TutorContext): TutorResponse {
  const messageIndex = Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length);
  
  const message: TutorMessage = {
    id: generateMessageId(),
    type: "encouragement",
    content: ENCOURAGEMENT_MESSAGES[messageIndex],
    timestamp: Date.now(),
  };
  
  return {
    message,
    suggestedActions: ["Continue to next challenge", "Review my progress", "Take a break"],
  };
}

/**
 * Main tutor request handler
 */
export function handleTutorRequest(request: TutorRequest): TutorResponse {
  switch (request.type) {
    case "hint":
      return getHint(request.context);
    case "debug":
      return getDebugHelp(request.context);
    case "explanation":
      return getExplanation(request.specificQuestion || "this concept", request.context);
    case "review":
      return getCodeReview(request.context);
    case "encouragement":
      return getEncouragement(request.context);
    default:
      return getHint(request.context);
  }
}

/**
 * Create a new tutor session
 */
export function createTutorSession(challenge: Challenge, userCode: string): TutorSession {
  const now = Date.now();
  return {
    sessionId: `session_${now}_${Math.random().toString(36).substr(2, 9)}`,
    challengeSlug: challenge.slug,
    messages: [],
    context: {
      challenge,
      userCode,
      attemptCount: 0,
      hintsRevealed: 0,
      timeSpentMinutes: 0,
    },
    createdAt: now,
    lastActivityAt: now,
  };
}

/**
 * Update tutor session with new activity
 */
export function updateTutorSession(
  session: TutorSession, 
  updates: Partial<TutorContext>
): TutorSession {
  return {
    ...session,
    context: {
      ...session.context,
      ...updates,
    },
    lastActivityAt: Date.now(),
  };
}

/**
 * Add message to tutor session
 */
export function addMessageToSession(session: TutorSession, message: TutorMessage): TutorSession {
  return {
    ...session,
    messages: [...session.messages, message],
    lastActivityAt: Date.now(),
  };
}

// ============================================
// LLM Integration (Optional Enhancement)
// ============================================

export interface LLMTutorConfig {
  enabled: boolean;
  provider: "openai" | "anthropic" | "local";
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Generate LLM-based tutoring response
 * This is a placeholder for future LLM integration
 */
export async function generateLLMTutorResponse(
  request: TutorRequest,
  config: LLMTutorConfig
): Promise<TutorResponse | null> {
  if (!config.enabled) {
    return null;
  }
  
  // Placeholder for actual LLM integration
  // In production, this would call OpenAI/Anthropic API
  console.log("LLM tutor would generate response for:", request.type);
  
  return null;
}
