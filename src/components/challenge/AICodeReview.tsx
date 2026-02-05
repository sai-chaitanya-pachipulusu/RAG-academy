/**
 * Enhanced AI Code Review Component
 *
 * Provides intelligent code review with LLM integration.
 * Features: pattern-based and AI-powered review modes, score breakdown,
 * issue highlighting, and educational feedback.
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import type {
  CodeReviewFeedback,
  ReviewMode,
  ReviewSeverity,
} from "@/lib/ai/types";
import {
  requestCodeReview,
  getQuotaStatus,
  formatQuotaReset,
  getScoreColor,
  getScoreLabel,
  getSeverityIcon,
  getSeverityLabel,
  sortIssuesBySeverity,
  groupIssuesByCategory,
  estimateCostInDollars,
  loadReviewPreferences,
  saveReviewPreferences,
} from "@/lib/ai/client";

interface AICodeReviewProps {
  code: string;
  challengeSlug: string;
  challengeTitle?: string;
  isVisible: boolean;
  onClose: () => void;
  onReviewReceived?: (feedback: CodeReviewFeedback) => void;
}

// Pattern-based code analysis (works without LLM)
function analyzeCodePattern(
  code: string,
  challengeSlug: string
): CodeReviewFeedback {
  const issues: CodeReviewFeedback["issues"] = [];
  const improvements: string[] = [];
  const positiveFeedback: string[] = [];
  let score = 70;

  const lines = code.split("\n");

  // Check for type hints
  const hasTypeHints =
    code.includes("->") ||
    /:\s*(List|Dict|Optional|Union|int|str|float|bool)/.test(code);
  if (hasTypeHints) {
    positiveFeedback.push("Good use of type hints for better code clarity");
    score += 5;
  } else {
    improvements.push(
      "Consider adding type hints for function parameters and return values"
    );
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
      suggestion:
        'Add a docstring: """Brief description of what this function does."""',
      category: "Documentation",
    });
  }

  // Check for error handling
  const hasErrorHandling =
    code.includes("raise") || code.includes("try:") || code.includes("except");
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
    const lineIndex = lines.findIndex((l) => l.includes("except:"));
    issues.push({
      severity: "warning",
      line: lineIndex + 1,
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
      message:
        "Cosine similarity typically requires sqrt for magnitude calculation",
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
      time: "Analysis requires AI",
      space: "Analysis requires AI",
    },
    educationalNotes: [
      "Pattern-based review provides basic feedback. Enable AI review for deeper analysis.",
    ],
  };
}

// Score ring component
function ScoreRing({
  score,
  size = 80,
  strokeWidth = 8,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
}) {
  const color = getScoreColor(score);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const colorClasses: Record<string, string> = {
    emerald: "text-emerald-500",
    amber: "text-amber-500",
    orange: "text-orange-500",
    red: "text-red-500",
  };

  const bgClasses: Record<string, string> = {
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    orange: "bg-orange-100 text-orange-700",
    red: "bg-red-100 text-red-700",
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90 transform">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-zinc-200 dark:text-zinc-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`transition-all duration-1000 ${colorClasses[color]}`}
        />
      </svg>
      <div
        className={`absolute flex h-${size === 80 ? "16" : "12"} w-${size === 80 ? "16" : "12"} items-center justify-center rounded-full text-lg font-bold ${bgClasses[color]}`}
        style={{ width: size - strokeWidth * 3, height: size - strokeWidth * 3 }}
      >
        {score}
      </div>
    </div>
  );
}

// Category score bar
function CategoryScore({
  label,
  score,
  icon,
}: {
  label: string;
  score: number;
  icon: string;
}) {
  const color = getScoreColor(score);
  const colorClasses: Record<string, string> = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    orange: "bg-orange-500",
    red: "bg-red-500",
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-lg">{icon}</span>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            {label}
          </span>
          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            {score}
          </span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${colorClasses[color]}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// Issue card component
function IssueCard({
  issue,
  onLineClick,
}: {
  issue: CodeReviewFeedback["issues"][0];
  onLineClick?: (line: number) => void;
}) {
  const severityColors: Record<ReviewSeverity, string> = {
    critical:
      "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20",
    warning:
      "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20",
    suggestion:
      "border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/20",
  };

  return (
    <div
      className={`rounded-lg border p-3 text-sm ${severityColors[issue.severity]}`}
    >
      <div className="flex items-start gap-2">
        <span className="text-lg">{getSeverityIcon(issue.severity)}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {issue.category}
            </span>
            {issue.line && (
              <button
                onClick={() => onLineClick?.(issue.line!)}
                className="rounded bg-white/50 px-1.5 py-0.5 text-xs font-mono text-zinc-600 hover:bg-white dark:bg-zinc-900/50 dark:text-zinc-400"
              >
                Line {issue.line}
              </button>
            )}
          </div>
          <p className="mt-1 text-zinc-700 dark:text-zinc-300">
            {issue.message}
          </p>
          {issue.suggestion && (
            <div className="mt-2 rounded bg-white/70 p-2 dark:bg-zinc-900/50">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Suggestion:
              </p>
              <p className="text-zinc-700 dark:text-zinc-300">
                {issue.suggestion}
              </p>
            </div>
          )}
          {issue.codeExample && (
            <pre className="mt-2 overflow-x-auto rounded bg-zinc-900 p-2 text-xs text-zinc-100">
              <code>{issue.codeExample}</code>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

// Quota indicator
function QuotaIndicator({
  used,
  limit,
  remaining,
}: {
  used: number;
  limit: number;
  remaining: number;
}) {
  const percentage = Math.min(100, (used / limit) * 100);

  return (
    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
      <div className="h-2 w-16 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div
          className={`h-full rounded-full transition-all ${percentage >= 90 ? "bg-red-500" : percentage >= 70 ? "bg-amber-500" : "bg-emerald-500"}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span>
        {used}/{limit} reviews today
      </span>
      {remaining === 0 && (
        <span className="text-red-500">(Limit reached)</span>
      )}
    </div>
  );
}

export function AICodeReview({
  code,
  challengeSlug,
  challengeTitle,
  isVisible,
  onClose,
  onReviewReceived,
}: AICodeReviewProps) {
  const [review, setReview] = useState<CodeReviewFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<ReviewMode>("hybrid");
  const [error, setError] = useState<string | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);
  const [quota, setQuota] = useState<{
    used: number;
    limit: number;
    remaining: number;
    resetsAt: number;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "issues" | "improvements" | "education"
  >("overview");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  // Load preferences and quota on mount
  useEffect(() => {
    if (isVisible) {
      const prefs = loadReviewPreferences();
      setMode(prefs.defaultMode);
      loadQuota();
    }
  }, [isVisible]);

  const loadQuota = async () => {
    const result = await getQuotaStatus();
    if (result.success && result.quota) {
      setQuota(result.quota);
    }
  };

  const handleReview = async () => {
    setIsLoading(true);
    setError(null);
    setUsedFallback(false);

    try {
      // Check if we should use pattern-based only
      if (mode === "pattern") {
        const result = analyzeCodePattern(code, challengeSlug);
        setReview(result);
        onReviewReceived?.(result);
        setIsLoading(false);
        return;
      }

      // Call AI API
      const response = await requestCodeReview({
        code,
        challengeSlug,
        challengeTitle,
        language: code.includes(":") || code.includes("function") ? "typescript" : "python",
      });

      if (response.success && response.feedback) {
        setReview(response.feedback);
        setUsedFallback(response.usedFallback || false);
        onReviewReceived?.(response.feedback);

        // Update quota from response
        if (response.rateLimit) {
          setQuota((prev) =>
            prev
              ? {
                  ...prev,
                  remaining: response.rateLimit!.remaining,
                }
              : null
          );
        }
      } else {
        // Fallback to pattern-based on error
        if (mode === "hybrid") {
          const fallback = analyzeCodePattern(code, challengeSlug);
          setReview(fallback);
          setUsedFallback(true);
          onReviewReceived?.(fallback);
        } else {
          setError(response.error || "Review failed");
        }
      }
    } catch (err) {
      if (mode === "hybrid") {
        const fallback = analyzeCodePattern(code, challengeSlug);
        setReview(fallback);
        setUsedFallback(true);
        onReviewReceived?.(fallback);
      } else {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handleModeChange = (newMode: ReviewMode) => {
    setMode(newMode);
    saveReviewPreferences({ defaultMode: newMode });
    setReview(null);
  };

  if (!isVisible) return null;

  const sortedIssues = review ? sortIssuesBySeverity(review.issues) : [];
  const groupedIssues = review ? groupIssuesByCategory(sortedIssues) : new Map();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="m-4 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <span>🤖</span> AI Code Review
            </h2>
            {usedFallback && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                Pattern Mode
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {quota && <QuotaIndicator {...quota} />}
            <button
              onClick={onClose}
              className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Mode selector */}
        <div className="border-b border-zinc-200 bg-zinc-50 px-6 py-3">
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-zinc-500">
              Review Mode:
            </span>
            <div className="flex gap-2">
              {(["pattern", "hybrid", "ai"] as ReviewMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => handleModeChange(m)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    mode === m
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  {m === "pattern" && "Pattern Only"}
                  {m === "hybrid" && "Hybrid"}
                  {m === "ai" && "AI Only"}
                </button>
              ))}
            </div>
            <span className="text-xs text-zinc-400">
              {mode === "pattern" && "Fast, no API call"}
              {mode === "hybrid" && "AI with pattern fallback"}
              {mode === "ai" && "Full AI analysis"}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!review && !isLoading && !error && (
            <div className="text-center">
              <div className="mb-4 text-4xl">🤖</div>
              <h3 className="text-lg font-medium text-zinc-900">
                Get AI-Powered Code Review
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600">
                Receive intelligent feedback on your code quality, performance,
                and RAG-specific best practices.
              </p>

              {mode !== "pattern" && quota && quota.remaining === 0 && (
                <div className="mx-auto mt-4 max-w-md rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                  <p>
                    You've reached your daily limit. Resets in{" "}
                    {formatQuotaReset(quota.resetsAt)}.
                  </p>
                  <p className="mt-1">
                    Switch to "Pattern Only" mode for instant feedback.
                  </p>
                </div>
              )}

              <button
                onClick={handleReview}
                disabled={mode !== "pattern" && quota?.remaining === 0}
                className="mt-6 rounded-full bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mode === "pattern" ? "Analyze with Patterns" : "Get AI Review"}
              </button>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
              <p className="mt-4 text-sm text-zinc-500">
                {mode === "pattern"
                  ? "Analyzing patterns..."
                  : "AI is reviewing your code..."}
              </p>
              {mode !== "pattern" && (
                <p className="mt-1 text-xs text-zinc-400">
                  This may take 10-30 seconds
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
              <p className="text-red-700">{error}</p>
              <button
                onClick={handleReview}
                className="mt-3 rounded-full bg-red-100 px-4 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200"
              >
                Try Again
              </button>
            </div>
          )}

          {review && (
            <div className="space-y-6">
              {/* Score Overview */}
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                <div className="text-center">
                  <ScoreRing score={review.score} />
                  <p className="mt-2 text-sm font-medium text-zinc-600">
                    {getScoreLabel(review.score)}
                  </p>
                </div>
                <div className="flex-1 space-y-3">
                  <p className="text-sm text-zinc-700">
                    {review.summary}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <CategoryScore
                      label="Correctness"
                      score={review.categories.correctness}
                      icon="✓"
                    />
                    <CategoryScore
                      label="Efficiency"
                      score={review.categories.efficiency}
                      icon="⚡"
                    />
                    <CategoryScore
                      label="Readability"
                      score={review.categories.readability}
                      icon="👁"
                    />
                    <CategoryScore
                      label="Best Practices"
                      score={review.categories.bestPractices}
                      icon="⭐"
                    />
                  </div>
                </div>
              </div>

              {/* Complexity Analysis */}
              {review.complexity &&
                review.complexity.time !== "Analysis requires AI" && (
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/30">
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Complexity Analysis
                    </h4>
                    <div className="mt-2 flex gap-4">
                      <div className="rounded-lg bg-white px-3 py-2 dark:bg-zinc-800">
                        <span className="text-xs text-zinc-500">Time</span>
                        <p className="font-mono text-sm font-medium">
                          {review.complexity.time}
                        </p>
                      </div>
                      <div className="rounded-lg bg-white px-3 py-2 dark:bg-zinc-800">
                        <span className="text-xs text-zinc-500">Space</span>
                        <p className="font-mono text-sm font-medium">
                          {review.complexity.space}
                        </p>
                      </div>
                    </div>
                    {review.complexity.explanation && (
                      <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                        {review.complexity.explanation}
                      </p>
                    )}
                  </div>
                )}

              {/* Tabs */}
              <div className="border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex gap-1">
                  {[
                    { id: "overview", label: "Overview", count: null },
                    { id: "issues", label: "Issues", count: review.issues.length },
                    {
                      id: "improvements",
                      label: "Improvements",
                      count: review.improvements.length,
                    },
                    ...(review.educationalNotes
                      ? [{ id: "education", label: "Learn", count: null }]
                      : []),
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                      }`}
                    >
                      {tab.label}
                      {tab.count !== null && tab.count > 0 && (
                        <span className="ml-1.5 rounded-full bg-zinc-200 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
                          {tab.count}
                        </span>
                      )}
                      {activeTab === tab.id && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="min-h-[200px]">
                {activeTab === "overview" && (
                  <div className="space-y-4">
                    {/* Positive Feedback */}
                    {review.positiveFeedback.length > 0 && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                          <span>✅</span> What's Done Well
                        </h4>
                        <ul className="mt-2 space-y-1">
                          {review.positiveFeedback.map((item, i) => (
                            <li
                              key={i}
                              className="text-sm text-emerald-700 dark:text-emerald-300"
                            >
                              • {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* RAG Insights */}
                    {review.ragInsights && review.ragInsights.length > 0 && (
                      <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/20">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-indigo-800 dark:text-indigo-200">
                          <span>🧠</span> RAG-Specific Insights
                        </h4>
                        <ul className="mt-2 space-y-1">
                          {review.ragInsights.map((item, i) => (
                            <li
                              key={i}
                              className="text-sm text-indigo-700 dark:text-indigo-300"
                            >
                              • {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Quick Issue Preview */}
                    {sortedIssues.length > 0 && (
                      <div>
                        <h4 className="mb-2 text-sm font-semibold">
                          Top Issues
                        </h4>
                        <div className="space-y-2">
                          {sortedIssues.slice(0, 3).map((issue, i) => (
                            <IssueCard key={i} issue={issue} />
                          ))}
                          {sortedIssues.length > 3 && (
                            <button
                              onClick={() => setActiveTab("issues")}
                              className="w-full rounded-lg border border-dashed border-zinc-300 py-2 text-sm text-zinc-500 hover:border-zinc-400 hover:text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
                            >
                              + {sortedIssues.length - 3} more issues
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "issues" && (
                  <div className="space-y-4">
                    {sortedIssues.length === 0 ? (
                      <p className="text-center text-sm text-zinc-500">
                        No issues found! Great job! 🎉
                      </p>
                    ) : (
                      <>
                        {/* Severity filter summary */}
                        <div className="flex flex-wrap gap-2">
                          {["critical", "warning", "suggestion"].map((sev) => {
                            const count = sortedIssues.filter(
                              (i) => i.severity === sev
                            ).length;
                            if (count === 0) return null;
                            return (
                              <span
                                key={sev}
                                className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-800"
                              >
                                {getSeverityIcon(sev as ReviewSeverity)}
                                {getSeverityLabel(sev as ReviewSeverity)}: {count}
                              </span>
                            );
                          })}
                        </div>

                        {/* Grouped by category */}
                        <div className="space-y-4">
                          {Array.from(groupedIssues.entries()).map(
                            ([category, issues]) => (
                              <div key={category}>
                                <button
                                  onClick={() => toggleCategory(category)}
                                  className="flex w-full items-center justify-between rounded-lg bg-zinc-100 px-3 py-2 text-left text-sm font-medium dark:bg-zinc-800"
                                >
                                  <span>{category}</span>
                                  <span className="flex items-center gap-2">
                                    <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs dark:bg-zinc-700">
                                      {issues.length}
                                    </span>
                                    <span>
                                      {expandedCategories.has(category)
                                        ? "▼"
                                        : "▶"}
                                    </span>
                                  </span>
                                </button>
                                {(expandedCategories.has(category) ||
                                  groupedIssues.size <= 3) && (
                                  <div className="mt-2 space-y-2">
                                    {issues.map((issue: CodeReviewFeedback["issues"][0], i: number) => (
                                      <IssueCard key={i} issue={issue} />
                                    ))}
                                  </div>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {activeTab === "improvements" && (
                  <div className="space-y-4">
                    {review.improvements.length === 0 ? (
                      <p className="text-center text-sm text-zinc-500">
                        No improvements suggested. Your code looks great! 🎉
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {review.improvements.map((item, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200"
                          >
                            <span>💡</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {activeTab === "education" && review.educationalNotes && (
                  <div className="space-y-4">
                    {review.educationalNotes.map((note, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900/50 dark:bg-blue-950/20"
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-lg">📚</span>
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            {note}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {review && (
          <div className="border-t border-zinc-200 bg-zinc-50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setReview(null);
                  setError(null);
                }}
                className="rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                Review Again
              </button>
              <div className="flex items-center gap-3">
                {usedFallback && (
                  <span className="text-xs text-zinc-500">
                    Pattern-based review
                  </span>
                )}
                <button
                  onClick={onClose}
                  className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Button to trigger review
export function CodeReviewButton({
  onClickAction,
  compact = false,
}: {
  onClickAction: () => void;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <button
        onClick={onClickAction}
        className="flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100"
      >
        <span>🤖</span>
        AI
      </button>
    );
  }

  return (
    <button
      onClick={onClickAction}
      className="flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100"
      title="Get AI feedback on your code"
    >
      <span>🤖</span>
      <span className="hidden sm:inline">AI Review</span>
      <span className="sm:hidden">AI</span>
    </button>
  );
}

// Inline review panel for side-by-side display
export function InlineCodeReview({
  feedback,
  onDismissAction,
}: {
  feedback: CodeReviewFeedback;
  onDismissAction?: () => void;
}) {
  const [expanded, setExpanded] = useState(true);

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-indigo-300"
      >
        <span>🤖</span>
        <span>AI Review: {feedback.score}/100</span>
        <span className="text-xs">(click to expand)</span>
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ScoreRing score={feedback.score} size={48} strokeWidth={4} />
          <div>
            <h4 className="font-medium text-zinc-900 dark:text-zinc-100">
              AI Review
            </h4>
            <p className="text-xs text-zinc-500">{getScoreLabel(feedback.score)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setExpanded(false)}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
            title="Minimize"
          >
            −
          </button>
          {onDismissAction && (
            <button
              onClick={onDismissAction}
              className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
              title="Dismiss"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
        {feedback.summary}
      </p>

      {feedback.issues.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-zinc-500">
            {feedback.issues.length} issue
            {feedback.issues.length !== 1 ? "s" : ""} found
          </p>
          <div className="mt-2 space-y-2">
            {sortIssuesBySeverity(feedback.issues)
              .slice(0, 2)
              .map((issue, i) => (
                <div
                  key={i}
                  className={`rounded-lg border p-2 text-xs ${
                    issue.severity === "critical"
                      ? "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20"
                      : issue.severity === "warning"
                        ? "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20"
                        : "border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/20"
                  }`}
                >
                  <span className="font-medium">{issue.category}:</span>{" "}
                  {issue.message}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
