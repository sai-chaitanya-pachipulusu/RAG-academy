"use client";

import { useState, useMemo } from "react";
import type { ErrorMarker } from "./editorTypes";

// ============================================
// Enhanced Error Display (LeetCode/HackerRank Style)
// ============================================

export interface ParsedError {
  type: "error" | "warning" | "info" | "test_failure" | "runtime_error" | "syntax_error";
  title: string;
  message: string;
  lineNumber: number | null;
  column: number | null;
  codeSnippet: string | null;
  suggestion: string | null;
  expected?: string;
  actual?: string;
  testCase?: number;
  fullTraceback: string;
}

interface ErrorDisplayProps {
  stderr: string;
  onJumpToLine?: (lineNumber: number) => void;
}

// Error type icons and colors
const ERROR_STYLES = {
  syntax_error: {
    icon: "🔴",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-900/50",
    title: "text-red-700 dark:text-red-300",
    label: "Syntax Error",
  },
  runtime_error: {
    icon: "💥",
    bg: "bg-orange-50 dark:bg-orange-950/30",
    border: "border-orange-200 dark:border-orange-900/50",
    title: "text-orange-700 dark:text-orange-300",
    label: "Runtime Error",
  },
  test_failure: {
    icon: "❌",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-900/50",
    title: "text-red-700 dark:text-red-300",
    label: "Test Failed",
  },
  error: {
    icon: "⚠️",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-900/50",
    title: "text-red-700 dark:text-red-300",
    label: "Error",
  },
  warning: {
    icon: "⚡",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-900/50",
    title: "text-amber-700 dark:text-amber-300",
    label: "Warning",
  },
  info: {
    icon: "ℹ️",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-900/50",
    title: "text-blue-700 dark:text-blue-300",
    label: "Info",
  },
};

// Enhanced Python error suggestions
const ERROR_SUGGESTIONS: Record<string, { suggestion: string; example?: string }> = {
  NameError: {
    suggestion: "The variable or function name is not defined. Check for typos or make sure you've defined it before using it.",
    example: "x = 5  # Define x before using it\nprint(x)",
  },
  TypeError: {
    suggestion: "You're using the wrong type of value. Check that function arguments match expected types.",
    example: "# Wrong: len(123)\n# Right: len('123') or len([1,2,3])",
  },
  SyntaxError: {
    suggestion: "There's a syntax error in your code. Check for missing colons, parentheses, or quotation marks.",
    example: "# Wrong: if x == 5\n# Right: if x == 5:",
  },
  IndentationError: {
    suggestion: "Python requires consistent indentation. Use 4 spaces for each level.",
    example: "def foo():\n    print('indented')  # 4 spaces",
  },
  ValueError: {
    suggestion: "The value you provided is not valid for this operation.",
    example: "# Wrong: int('abc')\n# Right: int('123')",
  },
  KeyError: {
    suggestion: "The key doesn't exist in the dictionary. Use .get() to avoid this error.",
    example: "# Safer: d.get('key', default_value)",
  },
  IndexError: {
    suggestion: "The index is out of range. Remember that Python lists are 0-indexed and the last index is len-1.",
    example: "# For list of length 3, valid indices are 0, 1, 2",
  },
  AttributeError: {
    suggestion: "The object doesn't have this attribute or method. Check the object type.",
    example: "# Use type(obj) to check what methods are available",
  },
  ZeroDivisionError: {
    suggestion: "You're dividing by zero. Add a check to prevent this.",
    example: "result = a / b if b != 0 else 0",
  },
  AssertionError: {
    suggestion: "Your assertion or test case failed. Check your implementation logic.",
  },
  RecursionError: {
    suggestion: "Your function is calling itself too many times. Add a proper base case.",
    example: "def factorial(n):\n    if n <= 1:  # Base case\n        return 1\n    return n * factorial(n-1)",
  },
};

/**
 * Parse Python traceback into structured format
 */
export function parseError(stderr: string): ParsedError {
  if (!stderr || !stderr.trim()) {
    return {
      type: "error",
      title: "Unknown Error",
      message: "An unknown error occurred",
      lineNumber: null,
      column: null,
      codeSnippet: null,
      suggestion: null,
      fullTraceback: "",
    };
  }

  let type: ParsedError["type"] = "error";
  let title = "Error";
  let message = "";
  let lineNumber: number | null = null;
  let column: number | null = null;
  let codeSnippet: string | null = null;
  let suggestion: string | null = null;
  let expected: string | undefined;
  let actual: string | undefined;
  let testCase: number | undefined;

  const lines = stderr.split("\n");

  // Detect error type from the traceback
  if (stderr.includes("SyntaxError")) {
    type = "syntax_error";
    title = "Syntax Error";
  } else if (stderr.includes("AssertionError")) {
    type = "test_failure";
    title = "Test Failed";
  } else if (
    stderr.includes("TypeError") ||
    stderr.includes("ValueError") ||
    stderr.includes("NameError") ||
    stderr.includes("KeyError") ||
    stderr.includes("IndexError") ||
    stderr.includes("AttributeError") ||
    stderr.includes("ZeroDivisionError") ||
    stderr.includes("RuntimeError") ||
    stderr.includes("RecursionError")
  ) {
    type = "runtime_error";
    title = "Runtime Error";
  }

  // Extract line number
  const lineMatch = stderr.match(/line\s+(\d+)/i);
  if (lineMatch) {
    lineNumber = parseInt(lineMatch[1], 10);
  }

  // Extract column for syntax errors
  const columnMatch = stderr.match(/column\s+(\d+)/i);
  if (columnMatch) {
    column = parseInt(columnMatch[1], 10);
  }

  // Extract error message (last line with error type)
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    const errorMatch = line.match(/^(\w*Error|\w*Exception|AssertionError)(?::\s*(.*))?$/);
    if (errorMatch) {
      title = errorMatch[1];
      message = errorMatch[2] || "";
      break;
    }
  }

  // Extract code snippet (indented line after file reference)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.match(/^\s{4}[^\s]/) && !line.includes("File ") && !line.includes("Traceback")) {
      codeSnippet = line.trim();
      break;
    }
  }

  // Get suggestion
  const errorKey = title.replace(/Error|Exception/, "") + "Error";
  const suggestionInfo = ERROR_SUGGESTIONS[title] || ERROR_SUGGESTIONS[errorKey];
  if (suggestionInfo) {
    suggestion = suggestionInfo.suggestion;
  }

  // Parse test failure details (expected vs actual)
  if (type === "test_failure") {
    const expectedMatch = stderr.match(/Expected\s*[:=]?\s*['"]*([^'"]+)['"]*,?\s*(?:got|but got|actual)\s*[:=]?\s*['"]*([^'"]+)['"']*/i);
    if (expectedMatch) {
      expected = expectedMatch[1].trim();
      actual = expectedMatch[2].trim();
    }

    // Look for test case number
    const testMatch = stderr.match(/Test\s*(?:case)?\s*#?(\d+)/i);
    if (testMatch) {
      testCase = parseInt(testMatch[1], 10);
    }
  }

  return {
    type,
    title,
    message,
    lineNumber,
    column,
    codeSnippet,
    suggestion,
    expected,
    actual,
    testCase,
    fullTraceback: stderr,
  };
}

/**
 * Convert ParsedError to ErrorMarker for editor highlighting
 */
export function errorToMarker(error: ParsedError): ErrorMarker | null {
  if (!error.lineNumber) return null;

  return {
    lineNumber: error.lineNumber,
    column: error.column || undefined,
    message: error.message || error.title,
    severity: error.type === "warning" ? "warning" : error.type === "info" ? "info" : "error",
  };
}

/**
 * LeetCode-style Error Display Component
 */
export function ErrorDisplay({ stderr, onJumpToLine }: ErrorDisplayProps) {
  const [showFullTrace, setShowFullTrace] = useState(false);
  const parsedError = useMemo(() => parseError(stderr), [stderr]);
  const style = ERROR_STYLES[parsedError.type];

  return (
    <div className={`rounded-2xl border ${style.border} ${style.bg} overflow-hidden`}>
      {/* Error Header */}
      <div className="flex items-center justify-between border-b border-inherit bg-white/50 px-4 py-2.5 dark:bg-black/20">
        <div className="flex items-center gap-2">
          <span className="text-lg">{style.icon}</span>
          <span className={`font-semibold ${style.title}`}>{style.label}</span>
          {parsedError.testCase && (
            <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-[#2563EB] dark:text-gray-300">
              Test Case #{parsedError.testCase}
            </span>
          )}
        </div>
        {parsedError.lineNumber && (
          <button
            onClick={() => onJumpToLine?.(parsedError.lineNumber!)}
            className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm transition-all duration-200-all duration-200 hover:bg-gray-100 dark:bg-[#2563EB] dark:text-gray-300 dark:hover:bg-gray-700 cursor-pointer"
          >
            <span>📍</span>
            <span>Line {parsedError.lineNumber}</span>
          </button>
        )}
      </div>

      {/* Error Content */}
      <div className="space-y-3 p-4">
        {/* Error Title & Message */}
        <div>
          <p className={`font-mono text-sm font-semibold ${style.title}`}>
            {parsedError.title}
            {parsedError.message && `: ${parsedError.message}`}
          </p>
        </div>

        {/* Code Snippet */}
        {parsedError.codeSnippet && (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-900 dark:border-gray-700">
            <div className="flex items-center justify-between bg-[#2563EB] px-3 py-1.5">
              <span className="text-xs text-gray-400">Problematic Code</span>
              {parsedError.lineNumber && (
                <span className="text-xs text-gray-500">Line {parsedError.lineNumber}</span>
              )}
            </div>
            <pre className="overflow-x-auto p-3 text-sm">
              <code className="text-red-400">{parsedError.codeSnippet}</code>
            </pre>
          </div>
        )}

        {/* Expected vs Actual (for test failures) */}
        {parsedError.expected && parsedError.actual && (
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30">
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Expected</p>
              <pre className="mt-1 overflow-x-auto font-mono text-sm text-emerald-900 dark:text-emerald-100">
                {parsedError.expected}
              </pre>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/30">
              <p className="text-xs font-medium text-red-700 dark:text-red-400">Your Output</p>
              <pre className="mt-1 overflow-x-auto font-mono text-sm text-red-900 dark:text-red-100">
                {parsedError.actual}
              </pre>
            </div>
          </div>
        )}

        {/* Suggestion */}
        {parsedError.suggestion && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/30">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-sm">💡</span>
              <div>
                <p className="text-xs font-medium text-blue-700 dark:text-blue-400">Tip</p>
                <p className="mt-0.5 text-sm text-blue-800 dark:text-blue-200">
                  {parsedError.suggestion}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Full Traceback Toggle */}
        <details
          className="group"
          open={showFullTrace}
          onToggle={(e) => setShowFullTrace((e.target as HTMLDetailsElement).open)}
        >
          <summary className="cursor-pointer text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            {showFullTrace ? "Hide" : "Show"} full traceback
          </summary>
          <pre className="mt-2 max-h-48 overflow-auto rounded-lg bg-gray-900 p-3 text-xs leading-relaxed text-gray-300">
            {parsedError.fullTraceback}
          </pre>
        </details>
      </div>
    </div>
  );
}

// ============================================
// Test Results Display (LeetCode Style)
// ============================================

interface TestResult {
  index: number;
  passed: boolean;
  input?: string;
  expected?: string;
  actual?: string;
  executionTime?: number;
}

interface TestResultsProps {
  results: TestResult[];
  totalTime?: number;
}

export function TestResultsDisplay({ results, totalTime }: TestResultsProps) {
  const passedCount = results.filter((r) => r.passed).length;
  const allPassed = passedCount === results.length;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      {/* Header */}
      <div
        className={`flex items-center justify-between border-b px-4 py-3 ${
          allPassed
            ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30"
            : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">{allPassed ? "✅" : "❌"}</span>
          <span
            className={`font-semibold ${
              allPassed
                ? "text-emerald-700 dark:text-emerald-300"
                : "text-red-700 dark:text-red-300"
            }`}
          >
            {allPassed ? "All Tests Passed" : `${passedCount}/${results.length} Tests Passed`}
          </span>
        </div>
        {totalTime !== undefined && (
          <span className="text-sm text-gray-500 dark:text-gray-400">{totalTime}ms</span>
        )}
      </div>

      {/* Test Cases */}
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {results.map((result) => (
          <div
            key={result.index}
            className={`px-4 py-3 ${
              result.passed
                ? "hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20"
                : "bg-red-50/30 hover:bg-red-50/50 dark:bg-red-950/10 dark:hover:bg-red-950/20"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>{result.passed ? "✓" : "✗"}</span>
                <span
                  className={`font-medium ${
                    result.passed
                      ? "text-emerald-700 dark:text-emerald-300"
                      : "text-red-700 dark:text-red-300"
                  }`}
                >
                  Test Case {result.index + 1}
                </span>
              </div>
              {result.executionTime !== undefined && (
                <span className="text-xs text-gray-500">{result.executionTime}ms</span>
              )}
            </div>

            {!result.passed && result.expected && result.actual && (
              <div className="mt-2 grid gap-2 pl-6 sm:grid-cols-2">
                <div className="rounded bg-gray-100 p-2 dark:bg-[#2563EB]">
                  <p className="text-xs text-gray-500">Expected</p>
                  <code className="text-xs text-emerald-700 dark:text-emerald-400">
                    {result.expected}
                  </code>
                </div>
                <div className="rounded bg-gray-100 p-2 dark:bg-[#2563EB]">
                  <p className="text-xs text-gray-500">Got</p>
                  <code className="text-xs text-red-700 dark:text-red-400">{result.actual}</code>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
