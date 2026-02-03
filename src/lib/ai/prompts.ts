/**
 * AI Code Review Prompts
 * 
 * Carefully crafted prompts for LLM-powered code review.
 * Focus on educational, constructive feedback for RAG Academy.
 */

import type { CodeReviewRequest } from "./types";

/**
 * System prompt that establishes the AI's role as a code reviewer
 */
export const CODE_REVIEW_SYSTEM_PROMPT = `You are an expert code reviewer and educator specializing in RAG (Retrieval-Augmented Generation) systems, vector databases, and information retrieval. Your role is to provide constructive, educational feedback on code submissions.

## Your Approach

1. **Educational Focus**: Explain WHY something is wrong, not just WHAT is wrong. Help the learner understand the underlying concepts.

2. **RAG-Specific Knowledge**: You understand:
   - Vector embeddings and similarity metrics (cosine, dot product, euclidean)
   - Chunking strategies (fixed-size, semantic, recursive, etc.)
   - Retrieval algorithms (BM25, dense retrieval, hybrid search)
   - Indexing structures (HNSW, IVF, flat)
   - RAG pipelines and architectures
   - Evaluation metrics (MRR, NDCG, precision@k, recall@k)
   - Query transformation and expansion techniques

3. **Constructive Tone**: Be encouraging while being honest about issues. Highlight what's done well.

4. **Actionable Suggestions**: Provide specific code examples when suggesting improvements.

## Output Format

You MUST respond with valid JSON in the following structure:

{
  "summary": "Brief overall assessment (2-3 sentences)",
  "score": 85,
  "categories": {
    "correctness": 90,
    "efficiency": 80,
    "readability": 85,
    "bestPractices": 85
  },
  "issues": [
    {
      "severity": "warning",
      "line": 15,
      "message": "Description of the issue",
      "suggestion": "How to fix it",
      "codeExample": "if (condition) {\\n  // fixed code\\n}",
      "category": "Performance"
    }
  ],
  "improvements": ["General improvement suggestions"],
  "positiveFeedback": ["What's done well"],
  "complexity": {
    "time": "O(n log n)",
    "space": "O(n)",
    "explanation": "Brief explanation"
  },
  "ragInsights": ["RAG-specific observations"],
  "educationalNotes": ["Conceptual explanations"]
}

## Scoring Guidelines

- **Correctness (0-100)**: Does the code work? Are there bugs or edge cases?
- **Efficiency (0-100)**: Time/space complexity, algorithmic choices
- **Readability (0-100)**: Naming, comments, structure, Pythonic/idiomatic code
- **Best Practices (0-100)**: Error handling, type hints, documentation, testing

Overall score is a weighted average with slight emphasis on correctness.

## Severity Levels

- **critical**: Bugs, incorrect logic, security issues
- **warning**: Performance issues, missing edge cases
- **suggestion**: Style improvements, better practices

Remember: Your goal is to help the learner improve, not just criticize their code.`;

/**
 * Generate the user prompt for code review
 */
export function generateCodeReviewPrompt(request: CodeReviewRequest): string {
  const { code, challengeSlug, challengeTitle, challengeDescription, language } = request;

  return `Please review the following ${language} code submission.

## Challenge Context

**Challenge**: ${challengeTitle || challengeSlug}
${challengeDescription ? `**Description**: ${challengeDescription}` : ""}

## Code to Review

\`\`\`${language}
${code}
\`\`\`

## Your Task

1. Analyze the code for correctness, efficiency, readability, and best practices
2. Consider RAG-specific patterns and best practices relevant to this challenge
3. Provide specific, actionable feedback with code examples where helpful
4. Explain the "why" behind your suggestions for educational value
5. Highlight what the learner did well

Respond ONLY with the JSON structure specified in your instructions.`;
}

/**
 * Prompt for complexity analysis only (lightweight review)
 */
export function generateComplexityAnalysisPrompt(code: string, language: string): string {
  return `Analyze the time and space complexity of this ${language} code:

\`\`\`${language}
${code}
\`\`\`

Respond with JSON:
{
  "time": "O(?)",
  "space": "O(?)",
  "explanation": "Brief explanation of the complexity analysis"
}`;
}

/**
 * Prompt for quick pattern-based review (fallback)
 */
export const QUICK_REVIEW_PROMPT = `Provide a quick code review focusing on:
1. Obvious bugs or issues
2. Major performance concerns
3. Critical best practice violations

Keep the review concise but actionable.`;

/**
 * Challenge-specific context for common RAG challenges
 */
export const CHALLENGE_CONTEXT: Record<string, { focus: string; hints: string[] }> = {
  "cosine-similarity": {
    focus: "Vector similarity calculation",
    hints: [
      "Check for proper normalization",
      "Verify handling of zero vectors",
      "Ensure numerical stability",
    ],
  },
  "dot-product": {
    focus: "Vector dot product implementation",
    hints: [
      "Verify dimension matching",
      "Check for efficient computation",
      "Consider numerical precision",
    ],
  },
  "chunking": {
    focus: "Text chunking strategies",
    hints: [
      "Check overlap handling",
      "Verify boundary preservation",
      "Consider token/character balance",
    ],
  },
  "bm25": {
    focus: "BM25 scoring implementation",
    hints: [
      "Verify IDF calculation",
      "Check parameter tuning (k1, b)",
      "Ensure document length normalization",
    ],
  },
  "hnsw": {
    focus: "HNSW index implementation",
    hints: [
      "Check layer construction",
      "Verify neighbor selection",
      "Consider memory efficiency",
    ],
  },
  "embedding": {
    focus: "Embedding generation/caching",
    hints: [
      "Check batching efficiency",
      "Verify cache key generation",
      "Consider memory management",
    ],
  },
  "reranker": {
    focus: "Reranking implementation",
    hints: [
      "Check cross-encoder usage",
      "Verify score normalization",
      "Consider latency impact",
    ],
  },
  "evaluation": {
    focus: "RAG evaluation metrics",
    hints: [
      "Verify metric calculation",
      "Check statistical significance",
      "Consider multiple test cases",
    ],
  },
};

/**
 * Get challenge-specific context for better reviews
 */
export function getChallengeContext(challengeSlug: string): { focus: string; hints: string[] } | null {
  // Try exact match first
  if (CHALLENGE_CONTEXT[challengeSlug]) {
    return CHALLENGE_CONTEXT[challengeSlug];
  }

  // Try partial match
  for (const [key, value] of Object.entries(CHALLENGE_CONTEXT)) {
    if (challengeSlug.includes(key) || key.includes(challengeSlug)) {
      return value;
    }
  }

  return null;
}

/**
 * Enhance the prompt with challenge-specific context
 */
export function enhancePromptWithContext(
  basePrompt: string,
  challengeSlug: string
): string {
  const context = getChallengeContext(challengeSlug);
  if (!context) return basePrompt;

  return `${basePrompt}

## Challenge-Specific Focus

This challenge focuses on: ${context.focus}

Key aspects to consider:
${context.hints.map((h) => `- ${h}`).join("\n")}`;
}
