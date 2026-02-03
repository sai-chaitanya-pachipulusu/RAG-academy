/**
 * LLM Code Review Service
 * 
 * Integration with OpenAI and Anthropic APIs for intelligent code review.
 * Includes caching, rate limiting, and fallback to pattern-based review.
 */

import type {
  CodeReviewRequest,
  CodeReviewResponse,
  CodeReviewFeedback,
  LLMConfig,
  ReviewCacheEntry,
} from "./types";
import {
  CODE_REVIEW_SYSTEM_PROMPT,
  generateCodeReviewPrompt,
  enhancePromptWithContext,
} from "./prompts";

// Simple in-memory cache (use Redis in production)
const reviewCache = new Map<string, ReviewCacheEntry>();

/**
 * Generate a cache key from code and challenge
 */
function generateCacheKey(code: string, challengeSlug: string): string {
  // Simple hash function for cache key
  const str = `${challengeSlug}:${code}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `review:${hash.toString(16)}`;
}

/**
 * Hash code for cache invalidation check
 */
function hashCode(code: string): string {
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    const char = code.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

/**
 * Get cached review if available and valid
 */
function getCachedReview(
  code: string,
  challengeSlug: string,
  ttlSeconds: number = 3600
): CodeReviewFeedback | null {
  const key = generateCacheKey(code, challengeSlug);
  const cached = reviewCache.get(key);

  if (!cached) return null;

  const now = Date.now();
  const isExpired = now - cached.cachedAt > ttlSeconds * 1000;
  const codeChanged = cached.codeHash !== hashCode(code);

  if (isExpired || codeChanged) {
    reviewCache.delete(key);
    return null;
  }

  return cached.feedback;
}

/**
 * Cache a review result
 */
function cacheReview(
  code: string,
  challengeSlug: string,
  feedback: CodeReviewFeedback,
  ttlSeconds: number = 3600
): void {
  const key = generateCacheKey(code, challengeSlug);
  const entry: ReviewCacheEntry = {
    feedback,
    cachedAt: Date.now(),
    ttl: ttlSeconds,
    codeHash: hashCode(code),
  };
  reviewCache.set(key, entry);

  // Clean up old entries periodically (simple LRU)
  if (reviewCache.size > 1000) {
    const oldestKey = reviewCache.keys().next().value;
    if (oldestKey) {
      reviewCache.delete(oldestKey);
    }
  }
}

/**
 * Parse LLM response into structured feedback
 */
function parseLLMResponse(responseText: string): CodeReviewFeedback | null {
  try {
    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in LLM response");
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (
      typeof parsed.summary !== "string" ||
      typeof parsed.score !== "number" ||
      !parsed.categories ||
      !Array.isArray(parsed.issues) ||
      !Array.isArray(parsed.improvements) ||
      !Array.isArray(parsed.positiveFeedback) ||
      !parsed.complexity
    ) {
      console.error("Invalid response structure from LLM");
      return null;
    }

    // Ensure score is within bounds
    const clampedScore = Math.max(0, Math.min(100, Math.round(parsed.score)));

    // Normalize category scores
    const categories = {
      correctness: Math.max(0, Math.min(100, Math.round(parsed.categories.correctness || 70))),
      efficiency: Math.max(0, Math.min(100, Math.round(parsed.categories.efficiency || 70))),
      readability: Math.max(0, Math.min(100, Math.round(parsed.categories.readability || 70))),
      bestPractices: Math.max(0, Math.min(100, Math.round(parsed.categories.bestPractices || 70))),
    };

    return {
      summary: parsed.summary,
      score: clampedScore,
      categories,
      issues: parsed.issues.map((issue: { severity: string; line?: number; message?: string; suggestion?: string; codeExample?: string; category?: string }) => ({
        severity: ["critical", "warning", "suggestion"].includes(issue.severity)
          ? issue.severity
          : "suggestion",
        line: issue.line ? Math.max(1, Math.round(issue.line)) : undefined,
        message: String(issue.message || ""),
        suggestion: String(issue.suggestion || ""),
        codeExample: issue.codeExample ? String(issue.codeExample) : undefined,
        category: String(issue.category || "General"),
      })),
      improvements: parsed.improvements.map(String),
      positiveFeedback: parsed.positiveFeedback.map(String),
      complexity: {
        time: String(parsed.complexity.time || "Unknown"),
        space: String(parsed.complexity.space || "Unknown"),
        explanation: parsed.complexity.explanation
          ? String(parsed.complexity.explanation)
          : undefined,
      },
      ragInsights: parsed.ragInsights?.map(String),
      educationalNotes: parsed.educationalNotes?.map(String),
    };
  } catch (error) {
    console.error("Failed to parse LLM response:", error);
    return null;
  }
}

/**
 * Call OpenAI API for code review
 */
async function callOpenAI(
  prompt: string,
  config: LLMConfig
): Promise<{ text: string; tokens: { prompt: number; completion: number } } | null> {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model || "gpt-4o-mini",
        messages: [
          { role: "system", content: CODE_REVIEW_SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        max_tokens: config.maxTokens || 2000,
        temperature: config.temperature ?? 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI API error:", error);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("Empty response from OpenAI");
      return null;
    }

    return {
      text: content,
      tokens: {
        prompt: data.usage?.prompt_tokens || 0,
        completion: data.usage?.completion_tokens || 0,
      },
    };
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    return null;
  }
}

/**
 * Call Anthropic API for code review
 */
async function callAnthropic(
  prompt: string,
  config: LLMConfig
): Promise<{ text: string; tokens: { prompt: number; completion: number } } | null> {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: config.model || "claude-3-haiku-20240307",
        max_tokens: config.maxTokens || 2000,
        temperature: config.temperature ?? 0.3,
        system: CODE_REVIEW_SYSTEM_PROMPT,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Anthropic API error:", error);
      return null;
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;

    if (!content) {
      console.error("Empty response from Anthropic");
      return null;
    }

    return {
      text: content,
      tokens: {
        prompt: data.usage?.input_tokens || 0,
        completion: data.usage?.output_tokens || 0,
      },
    };
  } catch (error) {
    console.error("Error calling Anthropic:", error);
    return null;
  }
}

/**
 * Get LLM configuration from environment
 */
function getLLMConfig(): LLMConfig | null {
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (openaiKey) {
    return {
      provider: "openai",
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      apiKey: openaiKey,
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || "2000"),
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || "0.3"),
    };
  }

  if (anthropicKey) {
    return {
      provider: "anthropic",
      model: process.env.ANTHROPIC_MODEL || "claude-3-haiku-20240307",
      apiKey: anthropicKey,
      maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS || "2000"),
      temperature: parseFloat(process.env.ANTHROPIC_TEMPERATURE || "0.3"),
    };
  }

  return null;
}

/**
 * Pattern-based fallback review (when LLM is unavailable)
 */
function patternBasedReview(
  code: string,
  challengeSlug: string
): CodeReviewFeedback {
  const issues: CodeReviewFeedback["issues"] = [];
  const improvements: string[] = [];
  const positiveFeedback: string[] = [];
  let score = 70;

  const lines = code.split("\n");

  // Check for type hints
  const hasTypeHints = code.includes("->") || /:\s*(List|Dict|Optional|Union|int|str|float|bool)/.test(code);
  if (hasTypeHints) {
    positiveFeedback.push("Good use of type hints for better code clarity");
    score += 5;
  } else {
    improvements.push("Consider adding type hints for function parameters and return values");
    issues.push({
      severity: "suggestion",
      message: "Add type hints to improve code readability",
      suggestion: "Add type annotations like `def func(x: int) -> str:`",
      category: "Code Quality",
    });
  }

  // Check for docstrings
  const hasDocstring = code.includes('"""') || code.includes("'''");
  if (hasDocstring) {
    positiveFeedback.push("Documentation with docstrings helps maintainability");
    score += 5;
  } else {
    improvements.push("Add docstrings to document function behavior");
    issues.push({
      severity: "suggestion",
      message: "Consider adding docstrings to explain function purpose",
      suggestion: 'Add a docstring: """Brief description of what this function does."""',
      category: "Documentation",
    });
  }

  // Check for error handling
  const hasErrorHandling = code.includes("raise") || code.includes("try:") || code.includes("except");
  if (hasErrorHandling) {
    positiveFeedback.push("Error handling makes the code more robust");
    score += 5;
  } else {
    improvements.push("Consider adding input validation and error handling");
    issues.push({
      severity: "warning",
      message: "No error handling detected - consider edge cases",
      suggestion: "Add try/except blocks or input validation",
      category: "Robustness",
    });
  }

  // Check for Pythonic patterns
  const hasListComprehension = /\[.*for.*in.*\]/.test(code);
  const hasGenerator = /\(.*for.*in.*\)/.test(code);
  const hasEnumerate = code.includes("enumerate(");

  if (hasListComprehension || hasGenerator || hasEnumerate) {
    positiveFeedback.push("Pythonic patterns improve readability and performance");
    score += 5;
  }

  // Check for bare except
  if (code.includes("except:")) {
    issues.push({
      severity: "warning",
      line: lines.findIndex((l) => l.includes("except:")) + 1,
      message: "Bare except catches all exceptions - be specific",
      suggestion: "Use specific exception types like `except ValueError:`",
      category: "Error Handling",
    });
    improvements.push("Use specific exception types instead of bare 'except:'");
    score -= 5;
  }

  // Check for == None vs is None
  if (code.includes("== None")) {
    issues.push({
      severity: "suggestion",
      message: "Use 'is None' instead of '== None'",
      suggestion: "Replace `== None` with `is None` for identity comparison",
      category: "Python Best Practices",
    });
    improvements.push("Replace '== None' with 'is None'");
  }

  // Challenge-specific checks
  if (challengeSlug.includes("cosine") && !code.includes("sqrt")) {
    issues.push({
      severity: "warning",
      message: "Cosine similarity typically requires sqrt for magnitude calculation",
      suggestion: "Import sqrt from math module for magnitude calculation",
      category: "Algorithm",
    });
  }

  if (challengeSlug.includes("chunk") && !code.includes("overlap")) {
    issues.push({
      severity: "warning",
      message: "Make sure you're handling chunk overlap correctly",
      suggestion: "Consider how chunks overlap to preserve context",
      category: "Algorithm",
    });
  }

  // Code length analysis
  const nonEmptyLines = lines.filter((l) => l.trim().length > 0).length;
  if (nonEmptyLines <= 10) {
    positiveFeedback.push("Concise solution - good job keeping it simple!");
    score += 5;
  } else if (nonEmptyLines > 50) {
    improvements.push("Consider breaking down into smaller functions");
    issues.push({
      severity: "suggestion",
      message: "Long function - consider decomposition",
      suggestion: "Break into smaller, focused functions",
      category: "Structure",
    });
  }

  const summary =
    score >= 85
      ? "Good solution! Your code demonstrates solid understanding and follows many best practices."
      : score >= 70
        ? "Decent solution! Consider the suggestions below to make it even better."
        : "Your code works, but there's room for improvement. Review the feedback below.";

  return {
    summary,
    score: Math.min(100, Math.max(0, score)),
    categories: {
      correctness: Math.min(100, score + 10),
      efficiency: Math.min(100, score),
      readability: Math.min(100, score + 5),
      bestPractices: Math.min(100, score - 5),
    },
    issues,
    improvements,
    positiveFeedback,
    complexity: {
      time: "Analysis requires LLM",
      space: "Analysis requires LLM",
    },
    educationalNotes: [
      "Pattern-based review provides basic feedback. Enable AI review for deeper analysis.",
    ],
  };
}

/**
 * Main function to get LLM code review
 */
export async function getLLMCodeReview(
  request: CodeReviewRequest
): Promise<CodeReviewResponse> {
  const { code, challengeSlug, allowFallback = true } = request;
  const cacheTtl = parseInt(process.env.AI_REVIEW_CACHE_TTL || "3600");

  // Check cache first
  const cached = getCachedReview(code, challengeSlug, cacheTtl);
  if (cached) {
    return {
      success: true,
      feedback: cached,
      usedFallback: false,
    };
  }

  // Get LLM configuration
  const config = getLLMConfig();
  if (!config) {
    if (allowFallback) {
      const fallback = patternBasedReview(code, challengeSlug);
      return {
        success: true,
        feedback: fallback,
        usedFallback: true,
      };
    }
    return {
      success: false,
      error: "LLM not configured and fallback is disabled",
    };
  }

  // Generate and enhance prompt
  let prompt = generateCodeReviewPrompt(request);
  prompt = enhancePromptWithContext(prompt, challengeSlug);

  // Call appropriate provider
  let result: { text: string; tokens: { prompt: number; completion: number } } | null = null;

  if (config.provider === "openai") {
    result = await callOpenAI(prompt, config);
  } else if (config.provider === "anthropic") {
    result = await callAnthropic(prompt, config);
  }

  // Handle LLM failure
  if (!result) {
    if (allowFallback) {
      const fallback = patternBasedReview(code, challengeSlug);
      return {
        success: true,
        feedback: fallback,
        usedFallback: true,
        error: "LLM request failed, using pattern-based fallback",
      };
    }
    return {
      success: false,
      error: "LLM request failed and fallback is disabled",
    };
  }

  // Parse response
  const feedback = parseLLMResponse(result.text);
  if (!feedback) {
    if (allowFallback) {
      const fallback = patternBasedReview(code, challengeSlug);
      return {
        success: true,
        feedback: fallback,
        usedFallback: true,
        error: "Failed to parse LLM response, using pattern-based fallback",
      };
    }
    return {
      success: false,
      error: "Failed to parse LLM response",
    };
  }

  // Cache the result
  cacheReview(code, challengeSlug, feedback, cacheTtl);

  return {
    success: true,
    feedback,
    usedFallback: false,
    costEstimate: {
      promptTokens: result.tokens.prompt,
      completionTokens: result.tokens.completion,
      totalTokens: result.tokens.prompt + result.tokens.completion,
    },
  };
}

/**
 * Clear review cache (useful for testing)
 */
export function clearReviewCache(): void {
  reviewCache.clear();
}

/**
 * Get cache stats
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: reviewCache.size,
    keys: Array.from(reviewCache.keys()),
  };
}

// Re-export types for convenience
export type { CodeReviewRequest, CodeReviewResponse, CodeReviewFeedback, LLMConfig };
