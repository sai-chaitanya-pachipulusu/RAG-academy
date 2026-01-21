"use client";

import { useState } from "react";

interface CodeReviewResult {
  score: number; // 0-100
  feedback: ReviewFeedback[];
  summary: string;
  improvements: string[];
  strengths: string[];
}

interface ReviewFeedback {
  type: "error" | "warning" | "suggestion" | "praise";
  line?: number;
  message: string;
  category: string;
}

// Pattern-based code analysis (works without LLM)
function analyzeCode(code: string, challengeSlug: string): CodeReviewResult {
  const feedback: ReviewFeedback[] = [];
  const improvements: string[] = [];
  const strengths: string[] = [];
  let score = 70; // Base score

  // Check for common patterns
  const lines = code.split("\n");

  // 1. Check for type hints
  const hasTypeHints = code.includes("->") || code.includes(": List") || code.includes(": float");
  if (hasTypeHints) {
    strengths.push("Good use of type hints for better code clarity");
    score += 5;
  } else {
    improvements.push("Consider adding type hints for function parameters and return values");
    feedback.push({
      type: "suggestion",
      message: "Add type hints to improve code readability",
      category: "Code Quality",
    });
  }

  // 2. Check for docstrings
  const hasDocstring = code.includes('"""') || code.includes("'''");
  if (hasDocstring) {
    strengths.push("Documentation with docstrings helps maintainability");
    score += 5;
  } else {
    improvements.push("Add docstrings to document function behavior");
    feedback.push({
      type: "suggestion",
      message: "Consider adding docstrings to explain function purpose",
      category: "Documentation",
    });
  }

  // 3. Check for error handling
  const hasErrorHandling = code.includes("raise") || code.includes("try:") || code.includes("except");
  if (hasErrorHandling) {
    strengths.push("Error handling makes the code more robust");
    score += 5;
  } else {
    improvements.push("Consider adding input validation and error handling");
    feedback.push({
      type: "warning",
      message: "No error handling detected - consider edge cases",
      category: "Robustness",
    });
  }

  // 4. Check for efficient patterns
  const hasListComprehension = /\[.*for.*in.*\]/.test(code);
  const hasSum = code.includes("sum(");
  const hasZip = code.includes("zip(");
  const hasEnumerate = code.includes("enumerate(");

  if (hasListComprehension || hasSum || hasZip || hasEnumerate) {
    strengths.push("Pythonic patterns (list comprehension, sum, zip) improve readability");
    score += 5;
  }

  // 5. Check for magic numbers
  const hasMagicNumbers = /[^0-9.][0-9]{2,}[^0-9.]/.test(code.replace(/range\(\d+\)/g, ""));
  if (hasMagicNumbers) {
    improvements.push("Consider naming magic numbers as constants");
    feedback.push({
      type: "suggestion",
      message: "Avoid magic numbers - use named constants instead",
      category: "Code Quality",
    });
  }

  // 6. Check code length (conciseness)
  const nonEmptyLines = lines.filter((l) => l.trim().length > 0).length;
  if (nonEmptyLines <= 10) {
    strengths.push("Concise solution - good job keeping it simple!");
    score += 5;
  } else if (nonEmptyLines > 30) {
    improvements.push("Consider breaking down into smaller functions");
    feedback.push({
      type: "suggestion",
      message: "Long function - consider decomposition",
      category: "Structure",
    });
  }

  // 7. Check for common pitfalls
  if (code.includes("== None")) {
    feedback.push({
      type: "warning",
      message: "Use 'is None' instead of '== None'",
      category: "Python Best Practices",
    });
    improvements.push("Replace '== None' with 'is None'");
  }

  if (code.includes("except:")) {
    feedback.push({
      type: "error",
      message: "Bare except catches all exceptions - be specific",
      category: "Error Handling",
    });
    improvements.push("Use specific exception types instead of bare 'except:'");
    score -= 5;
  }

  // Challenge-specific checks
  if (challengeSlug.includes("cosine") && !code.includes("sqrt")) {
    feedback.push({
      type: "warning",
      message: "Cosine similarity typically requires sqrt for magnitude calculation",
      category: "Algorithm",
    });
  }

  if (challengeSlug.includes("chunker") && !code.includes("overlap")) {
    feedback.push({
      type: "warning",
      message: "Make sure you're handling chunk overlap correctly",
      category: "Algorithm",
    });
  }

  // Generate summary
  const summary = score >= 85
    ? "Excellent work! Your code demonstrates strong Python skills and good practices."
    : score >= 70
      ? "Good solution! Consider the suggestions below to make it even better."
      : "Your code works, but there's room for improvement. Review the feedback below.";

  return {
    score: Math.min(100, Math.max(0, score)),
    feedback,
    summary,
    improvements,
    strengths,
  };
}

interface Props {
  code: string;
  challengeSlug: string;
  isVisible: boolean;
  onClose: () => void;
}

export function AICodeReview({ code, challengeSlug, isVisible, onClose }: Props) {
  const [review, setReview] = useState<CodeReviewResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleReview = async () => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const result = analyzeCode(code, challengeSlug);
    setReview(result);
    setIsLoading(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="m-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <span>🤖</span> AI Code Review
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            ✕
          </button>
        </div>

        {!review && !isLoading && (
          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Get AI-powered feedback on your code quality, style, and potential improvements.
            </p>
            <button
              onClick={handleReview}
              className="mt-4 rounded-full bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Analyze My Code
            </button>
          </div>
        )}

        {isLoading && (
          <div className="mt-6 flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            <p className="text-sm text-zinc-500">Analyzing your code...</p>
          </div>
        )}

        {review && (
          <div className="mt-6 space-y-6">
            {/* Score */}
            <div className="text-center">
              <div
                className={`inline-flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold ${
                  review.score >= 85
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                    : review.score >= 70
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
                      : "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300"
                }`}
              >
                {review.score}
              </div>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {review.summary}
              </p>
            </div>

            {/* Strengths */}
            {review.strengths.length > 0 && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                  <span>✅</span> Strengths
                </h3>
                <ul className="mt-2 space-y-1 text-sm text-emerald-700 dark:text-emerald-300">
                  {review.strengths.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improvements */}
            {review.improvements.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-800 dark:text-amber-200">
                  <span>💡</span> Suggested Improvements
                </h3>
                <ul className="mt-2 space-y-1 text-sm text-amber-700 dark:text-amber-300">
                  {review.improvements.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Detailed Feedback */}
            {review.feedback.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold">Detailed Feedback</h3>
                <div className="mt-2 space-y-2">
                  {review.feedback.map((f, i) => (
                    <div
                      key={i}
                      className={`rounded-lg border p-3 text-sm ${
                        f.type === "error"
                          ? "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20"
                          : f.type === "warning"
                            ? "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20"
                            : f.type === "praise"
                              ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                              : "border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/20"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>
                          {f.type === "error"
                            ? "🔴"
                            : f.type === "warning"
                              ? "🟡"
                              : f.type === "praise"
                                ? "🟢"
                                : "🔵"}
                        </span>
                        <span className="font-medium">{f.category}</span>
                      </div>
                      <p className="mt-1 text-zinc-700 dark:text-zinc-300">
                        {f.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setReview(null)}
              className="w-full rounded-full bg-zinc-100 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Analyze Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Button to trigger review
export function CodeReviewButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100 dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-indigo-300 dark:hover:bg-indigo-950/50"
    >
      <span>🤖</span>
      AI Review
    </button>
  );
}
