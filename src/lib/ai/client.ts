/**
 * AI Code Review Client
 * 
 * Client-side utilities for calling the AI code review API.
 */

import type {
  CodeReviewRequest,
  CodeReviewResponse,
  CodeReviewFeedback,
  ReviewMode,
} from "./types";

const API_ENDPOINT = "/api/ai/code-review";

/**
 * Request AI code review from the API
 */
export async function requestCodeReview(
  request: CodeReviewRequest
): Promise<CodeReviewResponse> {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}`,
        rateLimit: data.rateLimit,
      };
    }

    return data as CodeReviewResponse;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

/**
 * Get user's quota status
 */
export async function getQuotaStatus(): Promise<{
  success: boolean;
  quota?: {
    used: number;
    limit: number;
    remaining: number;
    resetsAt: number;
    hasUnlimited: boolean;
  };
  error?: string;
}> {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: "GET",
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}`,
      };
    }

    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

/**
 * Format quota reset time as human-readable string
 */
export function formatQuotaReset(resetsAt: number): string {
  const now = Date.now();
  const diff = resetsAt - now;

  if (diff <= 0) return "soon";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Get score color based on value
 */
export function getScoreColor(score: number): string {
  if (score >= 85) return "emerald";
  if (score >= 70) return "amber";
  if (score >= 50) return "orange";
  return "red";
}

/**
 * Get score label based on value
 */
export function getScoreLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Very Good";
  if (score >= 70) return "Good";
  if (score >= 60) return "Fair";
  if (score >= 50) return "Needs Improvement";
  return "Requires Work";
}

/**
 * Get severity icon
 */
export function getSeverityIcon(severity: string): string {
  switch (severity) {
    case "critical":
      return "🔴";
    case "warning":
      return "🟡";
    case "suggestion":
      return "🔵";
    default:
      return "⚪";
  }
}

/**
 * Get severity label
 */
export function getSeverityLabel(severity: string): string {
  switch (severity) {
    case "critical":
      return "Critical";
    case "warning":
      return "Warning";
    case "suggestion":
      return "Suggestion";
    default:
      return "Note";
  }
}

/**
 * Sort issues by severity
 */
export function sortIssuesBySeverity(
  issues: CodeReviewFeedback["issues"]
): CodeReviewFeedback["issues"] {
  const severityOrder = { critical: 0, warning: 1, suggestion: 2 };
  return [...issues].sort((a, b) => {
    const aOrder = severityOrder[a.severity] ?? 3;
    const bOrder = severityOrder[b.severity] ?? 3;
    if (aOrder !== bOrder) return aOrder - bOrder;
    // Sort by line number within same severity
    if (a.line && b.line) return a.line - b.line;
    if (a.line) return -1;
    if (b.line) return 1;
    return 0;
  });
}

/**
 * Group issues by category
 */
export function groupIssuesByCategory(
  issues: CodeReviewFeedback["issues"]
): Map<string, CodeReviewFeedback["issues"]> {
  const groups = new Map<string, CodeReviewFeedback["issues"]>();

  for (const issue of issues) {
    const category = issue.category || "General";
    if (!groups.has(category)) {
      groups.set(category, []);
    }
    groups.get(category)!.push(issue);
  }

  return groups;
}

/**
 * Estimate cost in dollars (rough estimate)
 */
export function estimateCostInDollars(tokens: number, model: string = "gpt-4o-mini"): string {
  // Rough pricing (per 1M tokens)
  const pricing: Record<string, number> = {
    "gpt-4o-mini": 0.15,
    "gpt-4o": 2.5,
    "claude-3-haiku": 0.25,
    "claude-3-sonnet": 3.0,
  };

  const rate = pricing[model] || pricing["gpt-4o-mini"];
  const cost = (tokens / 1_000_000) * rate;

  if (cost < 0.01) {
    return "< $0.01";
  }
  return `~ $${cost.toFixed(2)}`;
}

/**
 * Local storage key for review preferences
 */
const REVIEW_PREFS_KEY = "ragacademy_ai_review_prefs";

/**
 * User preferences for AI review
 */
export type ReviewPreferences = {
  defaultMode: ReviewMode;
  autoReviewOnSubmit: boolean;
  showCostEstimate: boolean;
  dismissedWelcome: boolean;
};

/**
 * Load review preferences
 */
export function loadReviewPreferences(): ReviewPreferences {
  const defaults: ReviewPreferences = {
    defaultMode: "hybrid",
    autoReviewOnSubmit: false,
    showCostEstimate: true,
    dismissedWelcome: false,
  };

  if (typeof window === "undefined") return defaults;

  try {
    const raw = window.localStorage.getItem(REVIEW_PREFS_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

/**
 * Save review preferences
 */
export function saveReviewPreferences(prefs: Partial<ReviewPreferences>): void {
  if (typeof window === "undefined") return;

  const current = loadReviewPreferences();
  const updated = { ...current, ...prefs };
  window.localStorage.setItem(REVIEW_PREFS_KEY, JSON.stringify(updated));
}
