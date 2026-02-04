"use client";

import { useState } from "react";

// ============================================
// IDE Toolbar Component (Font Size, Layout, Theme)
// ============================================

interface IDEToolbarProps {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  layout: "split" | "stacked";
  onLayoutChange: (layout: "split" | "stacked") => void;
  theme: "light" | "dark";
  onThemeChange: (theme: "light" | "dark") => void;
  onRun: () => void;
  onSubmit: () => void;
  onReset: () => void;
  isRunning: boolean;
  isCompleted: boolean;
  // Optional extras
  onShowDiff?: () => void;
  onShowAIReview?: () => void;
  hasMicroTasks?: boolean;
  microTaskMode?: boolean;
  onToggleMicroTask?: () => void;
  showKeyboardShortcuts?: boolean;
}

const FONT_SIZES = [12, 13, 14, 15, 16, 18, 20];

export function IDEToolbar({
  fontSize,
  onFontSizeChange,
  layout,
  onLayoutChange,
  theme,
  onThemeChange,
  onRun,
  onSubmit,
  onReset,
  isRunning,
  isCompleted,
  onShowDiff,
  onShowAIReview,
  hasMicroTasks,
  microTaskMode,
  onToggleMicroTask,
  showKeyboardShortcuts = true,
}: IDEToolbarProps) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-t-xl border-b border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Left side: Editor label + Settings */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Editor
          <span className="ml-2 rounded bg-zinc-200 px-1.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            Python
          </span>
        </span>

        {/* Settings Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
            title="Editor Settings"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Settings
          </button>

          {showSettings && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowSettings(false)}
              />
              {/* Dropdown */}
              <div className="absolute left-0 top-full z-20 mt-1 w-64 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                {/* Font Size */}
                <div className="mb-3">
                  <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Font Size
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onFontSizeChange(Math.max(12, fontSize - 1))
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
                    >
                      −
                    </button>
                    <select
                      value={fontSize}
                      onChange={(e) =>
                        onFontSizeChange(parseInt(e.target.value))
                      }
                      className="flex-1 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-center text-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-200"
                    >
                      {FONT_SIZES.map((size) => (
                        <option key={size} value={size}>
                          {size}px
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() =>
                        onFontSizeChange(Math.min(20, fontSize + 1))
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Layout Toggle */}
                <div className="mb-3">
                  <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Layout
                  </label>
                  <div className="flex rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-600">
                    <button
                      type="button"
                      onClick={() => onLayoutChange("split")}
                      className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                        layout === "split"
                          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
                      }`}
                    >
                      ⬛⬜ Split
                    </button>
                    <button
                      type="button"
                      onClick={() => onLayoutChange("stacked")}
                      className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                        layout === "stacked"
                          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
                      }`}
                    >
                      ⬛ Stacked
                    </button>
                  </div>
                </div>

                {/* Theme Toggle */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Theme
                  </label>
                  <div className="flex rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-600">
                    <button
                      type="button"
                      onClick={() => onThemeChange("light")}
                      className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                        theme === "light"
                          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
                      }`}
                    >
                      ☀️ Light
                    </button>
                    <button
                      type="button"
                      onClick={() => onThemeChange("dark")}
                      className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                        theme === "dark"
                          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
                      }`}
                    >
                      🌙 Dark
                    </button>
                  </div>
                </div>

                {/* Keyboard Shortcuts */}
                {showKeyboardShortcuts && (
                  <div className="mt-3 border-t border-zinc-200 pt-3 dark:border-zinc-600">
                    <p className="mb-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      Shortcuts
                    </p>
                    <div className="space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                      <div className="flex justify-between">
                        <span>Run Code</span>
                        <kbd className="rounded bg-zinc-200 px-1.5 py-0.5 font-mono dark:bg-zinc-700">
                          Ctrl+Enter
                        </kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>Submit</span>
                        <kbd className="rounded bg-zinc-200 px-1.5 py-0.5 font-mono dark:bg-zinc-700">
                          Ctrl+Shift+S
                        </kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>Format</span>
                        <kbd className="rounded bg-zinc-200 px-1.5 py-0.5 font-mono dark:bg-zinc-700">
                          Shift+Alt+F
                        </kbd>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Micro-task toggle */}
        {hasMicroTasks && onToggleMicroTask && (
          <button
            type="button"
            onClick={onToggleMicroTask}
            className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-xs transition-colors ${
              microTaskMode
                ? "border-indigo-300 bg-indigo-100 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300"
                : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
            }`}
          >
            📚 Step-by-Step
          </button>
        )}

        {/* AI Review button */}
        {onShowAIReview && (
          <button
            type="button"
            onClick={onShowAIReview}
            className="flex items-center gap-1 rounded-lg border border-purple-200 bg-purple-50 px-2 py-1 text-xs text-purple-700 transition-colors hover:border-purple-300 hover:bg-purple-100"
          >
            🤖 AI Review
          </button>
        )}

        {/* Diff view button */}
        {onShowDiff && (
          <button
            type="button"
            onClick={onShowDiff}
            className="flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-emerald-700 transition-colors hover:border-emerald-300 hover:bg-emerald-100"
          >
            📊 Compare Solution
          </button>
        )}
      </div>

      {/* Right side: Action buttons */}
      <div className="flex items-center gap-2">
        {/* Reset Button */}
        <button
          type="button"
          onClick={onReset}
          disabled={isRunning}
          className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
        >
          ↺ Reset
        </button>

        {/* Run Button */}
        <button
          type="button"
          onClick={onRun}
          disabled={isRunning}
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-zinc-900 px-4 text-xs font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isRunning ? (
            <>
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-zinc-900/30 dark:border-t-zinc-900" />
              Running...
            </>
          ) : (
            <>
              <span>▶</span>
              Run Code
            </>
          )}
        </button>

        {/* Submit Button */}
        <button
          type="button"
          onClick={onSubmit}
          disabled={isRunning || isCompleted}
          className="inline-flex h-8 items-center justify-center rounded-lg bg-emerald-600 px-4 text-xs font-medium text-white shadow-sm transition-colors hover:bg-emerald-500 disabled:opacity-60"
        >
          {isRunning ? "Submitting..." : isCompleted ? "✓ Completed" : "Submit"}
        </button>
      </div>
    </div>
  );
}

// ============================================
// Success Banner Component
// ============================================

interface SuccessBannerProps {
  xpEarned: number;
  executionTime?: number;
  onContinue?: () => void;
  nextChallenge?: { slug: string; title: string } | null;
}

export function SuccessBanner({
  xpEarned,
  executionTime,
  onContinue,
  nextChallenge,
}: SuccessBannerProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 dark:border-emerald-900 dark:from-emerald-950/30 dark:to-green-950/30">
      <div className="flex flex-col items-center justify-center gap-4 p-6 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-3xl dark:bg-emerald-900/50">
            🎉
          </div>
          <div>
            <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-200">
              Challenge Completed!
            </h3>
            <div className="mt-1 flex items-center gap-3 text-sm text-emerald-700 dark:text-emerald-300">
              <span className="font-semibold">+{xpEarned} XP</span>
              {executionTime !== undefined && (
                <>
                  <span className="text-emerald-400">•</span>
                  <span>{executionTime}ms</span>
                </>
              )}
            </div>
          </div>
        </div>

        {nextChallenge && (
          <a
            href={`/challenges/${nextChallenge.slug}`}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-500"
          >
            Next: {nextChallenge.title}
            <span>→</span>
          </a>
        )}
      </div>
    </div>
  );
}

// ============================================
// Output Panel Component
// ============================================

interface OutputPanelProps {
  stdout: string;
  stderr: string;
  durationMs?: number;
  score?: number | null;
  metrics?: Record<string, number | string> | null;
  onJumpToLine?: (lineNumber: number) => void;
}

export function OutputPanel({
  stdout,
  stderr,
  durationMs,
  score,
  metrics,
  onJumpToLine,
}: OutputPanelProps) {
  const [activeTab, setActiveTab] = useState<"output" | "errors">(
    stderr ? "errors" : "output"
  );

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* Tab Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("output")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === "output"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
                : "text-zinc-500 hover:bg-white/50 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
            }`}
          >
            Output
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("errors")}
            className={`relative rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === "errors"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
                : "text-zinc-500 hover:bg-white/50 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
            }`}
          >
            Errors
            {stderr && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                !
              </span>
            )}
          </button>
        </div>

        {durationMs !== undefined && (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            ⏱️ {durationMs}ms
          </span>
        )}
      </div>

      {/* Score Display */}
      {score != null && (
        <div className="border-b border-indigo-100 bg-indigo-50 px-4 py-2.5 dark:border-indigo-900/50 dark:bg-indigo-950/30">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-indigo-900 dark:text-indigo-100">
              Efficiency Score: {Math.min(score, 100)}
            </span>
            {metrics && (
              <div className="flex gap-3 text-xs text-indigo-700 dark:text-indigo-300">
                {Object.entries(metrics).map(([k, v]) => (
                  <span key={k} className="font-mono">
                    {k}: {v}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === "output" ? (
          stdout ? (
            <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-6 text-zinc-950 dark:text-zinc-100">
              {stdout}
            </pre>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center text-zinc-500 dark:text-zinc-400">
              <p className="text-sm">Run your code to see output here.</p>
              <p className="mt-1 text-xs">
                Use <code className="rounded bg-zinc-100 px-1 py-0.5 dark:bg-zinc-800">print()</code> to display values.
              </p>
            </div>
          )
        ) : stderr ? (
          <div className="space-y-3">
            {/* Compact error summary */}
            <ErrorSummary stderr={stderr} onJumpToLine={onJumpToLine} />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
            ✓ No errors
          </div>
        )}
      </div>
    </div>
  );
}

// Compact error summary for output panel
function ErrorSummary({
  stderr,
  onJumpToLine,
}: {
  stderr: string;
  onJumpToLine?: (lineNumber: number) => void;
}) {
  // Inline parse error logic
  const lines = stderr.split("\n");
  let title = "Error";
  let message = "";
  let lineNumber: number | null = null;
  let codeSnippet: string | null = null;
  let suggestion: string | null = null;
  let type: "error" | "runtime_error" | "syntax_error" | "test_failure" = "error";

  // Detect error type
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
    stderr.includes("IndexError")
  ) {
    type = "runtime_error";
    title = "Runtime Error";
  }

  // Extract line number
  const lineMatch = stderr.match(/line\s+(\d+)/i);
  if (lineMatch) {
    lineNumber = parseInt(lineMatch[1], 10);
  }

  // Extract error message
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    const errorMatch = line.match(/^(\w*Error|\w*Exception|AssertionError)(?::\s*(.*))?$/);
    if (errorMatch) {
      title = errorMatch[1];
      message = errorMatch[2] || "";
      break;
    }
  }

  // Extract code snippet
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.match(/^\s{4}[^\s]/) && !line.includes("File ") && !line.includes("Traceback")) {
      codeSnippet = line.trim();
      break;
    }
  }

  const style = {
    error: "text-red-700 dark:text-red-300",
    runtime_error: "text-orange-700 dark:text-orange-300",
    syntax_error: "text-red-700 dark:text-red-300",
    test_failure: "text-red-700 dark:text-red-300",
  }[type];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className={`font-mono text-sm font-semibold ${style}`}>
          {title}
          {message && `: ${message}`}
        </span>
        {lineNumber && onJumpToLine && (
          <button
            onClick={() => onJumpToLine(lineNumber!)}
            className="text-xs text-blue-600 hover:underline dark:text-blue-400"
          >
            Line {lineNumber}
          </button>
        )}
      </div>

      {codeSnippet && (
        <pre className="rounded bg-zinc-900 p-2 text-xs text-red-400">
          {codeSnippet}
        </pre>
      )}

      <details className="text-xs text-zinc-500">
        <summary className="cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300">
          Full traceback
        </summary>
        <pre className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap rounded bg-zinc-100 p-2 dark:bg-zinc-800">
          {stderr}
        </pre>
      </details>
    </div>
  );
}
