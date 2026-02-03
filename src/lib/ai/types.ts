/**
 * AI Code Review Types
 * 
 * Type definitions for LLM-powered code review system.
 */

export type ReviewSeverity = "critical" | "warning" | "suggestion";

export type ReviewCategory =
  | "correctness"
  | "efficiency"
  | "readability"
  | "bestPractices"
  | "ragSpecific";

export type CodeReviewIssue = {
  /** Severity level of the issue */
  severity: ReviewSeverity;
  /** Line number where issue occurs (1-indexed) */
  line?: number;
  /** Human-readable issue description */
  message: string;
  /** Suggested fix or improvement */
  suggestion: string;
  /** Code example showing the fix */
  codeExample?: string;
  /** Category for grouping */
  category: string;
};

export type CodeReviewCategoryScores = {
  /** Code correctness (0-100) */
  correctness: number;
  /** Algorithm efficiency (0-100) */
  efficiency: number;
  /** Code readability (0-100) */
  readability: number;
  /** Best practices adherence (0-100) */
  bestPractices: number;
};

export type ComplexityAnalysis = {
  /** Time complexity (e.g., "O(n log n)") */
  time: string;
  /** Space complexity (e.g., "O(n)") */
  space: string;
  /** Explanation of complexity */
  explanation?: string;
};

export type CodeReviewFeedback = {
  /** Brief summary of the review */
  summary: string;
  /** Overall score (0-100) */
  score: number;
  /** Category breakdown scores */
  categories: CodeReviewCategoryScores;
  /** List of issues found */
  issues: CodeReviewIssue[];
  /** General improvement suggestions */
  improvements: string[];
  /** Positive feedback on what's done well */
  positiveFeedback: string[];
  /** Complexity analysis */
  complexity: ComplexityAnalysis;
  /** RAG-specific insights */
  ragInsights?: string[];
  /** Educational context - why things matter */
  educationalNotes?: string[];
};

export type CodeReviewRequest = {
  /** Code to review */
  code: string;
  /** Challenge slug for context */
  challengeSlug: string;
  /** Challenge title */
  challengeTitle?: string;
  /** Challenge description */
  challengeDescription?: string;
  /** Programming language */
  language: "python" | "typescript";
  /** User ID for rate limiting */
  userId?: string;
  /** Whether to use pattern-based fallback */
  allowFallback?: boolean;
};

export type CodeReviewResponse = {
  /** Whether the review was successful */
  success: boolean;
  /** Review feedback (if successful) */
  feedback?: CodeReviewFeedback;
  /** Error message (if failed) */
  error?: string;
  /** Whether pattern-based fallback was used */
  usedFallback?: boolean;
  /** Rate limit info */
  rateLimit?: {
    remaining: number;
    resetAt: number;
    limit: number;
  };
  /** Cost estimate in tokens */
  costEstimate?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
};

export type LLMProvider = "openai" | "anthropic";

export type LLMConfig = {
  provider: LLMProvider;
  model: string;
  apiKey: string;
  maxTokens?: number;
  temperature?: number;
};

export type ReviewCacheEntry = {
  /** Cached feedback */
  feedback: CodeReviewFeedback;
  /** Timestamp when cached */
  cachedAt: number;
  /** Cache TTL in seconds */
  ttl: number;
  /** Code hash for invalidation */
  codeHash: string;
};

export type UserReviewQuota = {
  /** User ID */
  userId: string;
  /** Reviews used today */
  usedToday: number;
  /** Daily limit */
  dailyLimit: number;
  /** When the quota resets */
  resetsAt: number;
  /** Whether user has unlimited access */
  hasUnlimited: boolean;
};

export type ReviewMode = "pattern" | "ai" | "hybrid";

export type AICodeReviewProps = {
  /** Code to review */
  code: string;
  /** Challenge identifier */
  challengeSlug: string;
  /** Challenge title for context */
  challengeTitle?: string;
  /** Whether the review panel is visible */
  isVisible: boolean;
  /** Callback when panel is closed */
  onClose: () => void;
  /** Initial review mode */
  defaultMode?: ReviewMode;
  /** Whether to show cost estimate */
  showCostEstimate?: boolean;
  /** Callback when review is received */
  onReviewReceived?: (feedback: CodeReviewFeedback) => void;
};
