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
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-t-xl border-b border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-900">
      {/* Left side: Editor label + Settings */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Editor
          <span className="ml-2 rounded bg-gray-200 px-1.5 py-0.5 text-xs text-gray-600 dark:bg-[#2563EB] dark:text-gray-400">
            Python
          </span>
        </span>

        {/* Settings Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 transition-all duration-200-all duration-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-[#2563EB] dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-700 cursor-pointer"
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
              <div className="absolute left-0 top-full z-20 mt-1 w-64 rounded-xl border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-[#2563EB]">
                {/* Font Size */}
                <div className="mb-3">
                  <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                    Font Size
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onFontSizeChange(Math.max(12, fontSize - 1))
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 cursor-pointer"
                    >
                      −
                    </button>
                    <select
                      value={fontSize}
                      onChange={(e) =>
                        onFontSizeChange(parseInt(e.target.value))
                      }
                      className="flex-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-center text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
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
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Layout Toggle */}
                <div className="mb-3">
                  <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                    Layout
                  </label>
                  <div className="flex rounded-lg border border-gray-200 p-0.5 dark:border-gray-600">
                    <button
                      type="button"
                      onClick={() => onLayoutChange("split")}
                      className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200-all duration-200 ${
                        layout === "split"
                          ? "bg-[#3B82F6] text-white dark:bg-[#3B82F6] dark:text-white"
                          : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                      }`}
                    >
                      ⬛⬜ Split
                    </button>
                    <button
                      type="button"
                      onClick={() => onLayoutChange("stacked")}
                      className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200-all duration-200 ${
                        layout === "stacked"
                          ? "bg-[#3B82F6] text-white dark:bg-[#3B82F6] dark:text-white"
                          : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                      }`}
                    >
                      ⬛ Stacked
                    </button>
                  </div>
                </div>

                {/* Theme Toggle */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                    Theme
                  </label>
                  <div className="flex rounded-lg border border-gray-200 p-0.5 dark:border-gray-600">
                    <button
                      type="button"
                      onClick={() => onThemeChange("light")}
                      className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200-all duration-200 ${
                        theme === "light"
                          ? "bg-[#3B82F6] text-white dark:bg-[#3B82F6] dark:text-white"
                          : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                      }`}
                    >
                      ☀️ Light
                    </button>
                    <button
                      type="button"
                      onClick={() => onThemeChange("dark")}
                      className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200-all duration-200 ${
                        theme === "dark"
                          ? "bg-[#3B82F6] text-white dark:bg-[#3B82F6] dark:text-white"
                          : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                      }`}
                    >
                      🌙 Dark
                    </button>
                  </div>
                </div>

                {/* Keyboard Shortcuts */}
                {showKeyboardShortcuts && (
                  <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-600">
                    <p className="mb-1.5 text-xs font-medium text-gray-600 dark:text-gray-400">
                      Shortcuts
                    </p>
                    <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex justify-between">
                        <span>Run Code</span>
                        <kbd className="rounded bg-gray-200 px-1.5 py-0.5 font-mono dark:bg-gray-700">
                          Ctrl+Enter
                        </kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>Submit</span>
                        <kbd className="rounded bg-gray-200 px-1.5 py-0.5 font-mono dark:bg-gray-700">
                          Ctrl+Shift+S
                        </kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>Format</span>
                        <kbd className="rounded bg-gray-200 px-1.5 py-0.5 font-mono dark:bg-gray-700">
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
            className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-xs transition-all duration-200-all duration-200 ${
              microTaskMode
                ? "border-indigo-300 bg-indigo-100 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-[#2563EB] dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-700"
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
            className="flex items-center gap-1 rounded-lg border border-purple-200 bg-purple-50 px-2 py-1 text-xs text-purple-700 transition-all duration-200-all duration-200 hover:border-purple-300 hover:bg-purple-100 cursor-pointer"
          >
            🤖 AI Review
          </button>
        )}

        {/* Diff view button */}
        {onShowDiff && (
          <button
            type="button"
            onClick={onShowDiff}
            className="flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-emerald-700 transition-all duration-200-all duration-200 hover:border-emerald-300 hover:bg-emerald-100 cursor-pointer"
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
          className="inline-flex h-8 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 transition-all duration-200-all duration-200 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-60 dark:border-gray-700 dark:bg-[#2563EB] dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-700 cursor-pointer"
        >
          ↺ Reset
        </button>

        {/* Run Button */}
        <button
          type="button"
          onClick={onRun}
          disabled={isRunning}
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-[#3B82F6] px-4 text-xs font-medium text-white shadow-sm transition-all duration-200-all duration-200 hover:bg-[#2563EB] disabled:opacity-60 dark:bg-[#3B82F6] dark:text-white dark:hover:bg-[#2563EB] cursor-pointer"
        >
          {isRunning ? (
            <>
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-[#3B82F6]/30 dark:border-t-zinc-900" />
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
          className="inline-flex h-8 items-center justify-center rounded-lg bg-emerald-600 px-4 text-xs font-medium text-white shadow-sm transition-all duration-200-all duration-200 hover:bg-emerald-500 disabled:opacity-60 cursor-pointer"
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
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200-all duration-200 hover:bg-emerald-500 cursor-pointer"
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
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      {/* Tab Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("output")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200-all duration-200 ${
              activeTab === "output"
                ? "bg-white text-gray-900 shadow-sm dark:bg-[#2563EB] dark:text-gray-100"
                : "text-gray-500 hover:bg-white/50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-[#2563EB]/50"
            }`}
          >
            Output
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("errors")}
            className={`relative rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200-all duration-200 ${
              activeTab === "errors"
                ? "bg-white text-gray-900 shadow-sm dark:bg-[#2563EB] dark:text-gray-100"
                : "text-gray-500 hover:bg-white/50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-[#2563EB]/50"
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
          <span className="text-xs text-gray-500 dark:text-gray-400">
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
            <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-6 text-gray-950 dark:text-gray-100">
              {stdout}
            </pre>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
              <p className="text-sm">Run your code to see output here.</p>
              <p className="mt-1 text-xs">
                Use <code className="rounded bg-gray-100 px-1 py-0.5 dark:bg-[#2563EB]">print()</code> to display values.
              </p>
            </div>
          )
        ) : stderr ? (
          <div className="space-y-3">
            {/* Compact error summary */}
            <ErrorSummary stderr={stderr} onJumpToLine={onJumpToLine} />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">
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
            className="text-xs text-blue-600 hover:underline dark:text-blue-400 cursor-pointer"
          >
            Line {lineNumber}
          </button>
        )}
      </div>

      {codeSnippet && (
        <pre className="rounded bg-gray-900 p-2 text-xs text-red-400">
          {codeSnippet}
        </pre>
      )}

      <details className="text-xs text-gray-500">
        <summary className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
          Full traceback
        </summary>
        <pre className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap rounded bg-gray-100 p-2 dark:bg-[#2563EB]">
          {stderr}
        </pre>
      </details>
    </div>
  );
}
