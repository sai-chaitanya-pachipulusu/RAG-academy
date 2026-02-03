"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Submission, SubmissionStatus } from "@/lib/supabase/submissions";

interface SubmissionDetailProps {
  submission: Submission;
  challengeTitle?: string;
  onClose?: () => void;
  onRevert?: (code: string) => void;
  onCompare?: () => void;
}

const STATUS_CONFIG: Record<SubmissionStatus, { label: string; color: string; icon: string; description: string }> = {
  accepted: { label: "Accepted", color: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30", icon: "✓", description: "All tests passed" },
  wrong_answer: { label: "Wrong Answer", color: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/30", icon: "✗", description: "Output did not match expected" },
  runtime_error: { label: "Runtime Error", color: "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/30", icon: "!", description: "Error during execution" },
  time_limit: { label: "Time Limit Exceeded", color: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30", icon: "⏱", description: "Execution took too long" },
  compilation_error: { label: "Compilation Error", color: "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/30", icon: "⚠", description: "Syntax or compilation error" },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function SubmissionDetail({
  submission,
  challengeTitle,
  onClose,
  onRevert,
  onCompare,
}: SubmissionDetailProps) {
  const [showConfirmRevert, setShowConfirmRevert] = useState(false);
  const [copied, setCopied] = useState(false);
  const config = STATUS_CONFIG[submission.status];

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(submission.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevert = () => {
    if (onRevert) {
      onRevert(submission.code);
    }
    setShowConfirmRevert(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold ${config.color}`}
            >
              {config.icon}
            </span>
            <div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                {config.label}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {config.description}
              </p>
            </div>
          </div>
          {challengeTitle && (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Challenge: <span className="font-medium">{challengeTitle}</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onCompare && (
            <button
              type="button"
              onClick={onCompare}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.05] dark:text-zinc-300 dark:hover:bg-white/[0.1]"
            >
              Compare
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-white/10 dark:hover:text-zinc-300"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Submitted</p>
          <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {formatDate(submission.submittedAt)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Execution Time</p>
          <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {submission.executionTimeMs ? formatDuration(submission.executionTimeMs) : "N/A"}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Memory</p>
          <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {submission.memoryKb ? `${submission.memoryKb} KB` : "N/A"}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Score</p>
          <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {submission.score != null ? `${Math.min(submission.score, 100)}/100` : "N/A"}
          </p>
        </Card>
      </div>

      {/* Test Results */}
      {submission.testsTotal > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Test Results</p>
            <Badge variant={submission.testsPassed === submission.testsTotal ? "accent" : "default"}>
              {submission.testsPassed}/{submission.testsTotal} passed
            </Badge>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className={`h-2 rounded-full transition-all ${
                submission.testsPassed === submission.testsTotal
                  ? "bg-emerald-500"
                  : "bg-amber-500"
              }`}
              style={{
                width: `${(submission.testsPassed / submission.testsTotal) * 100}%`,
              }}
            />
          </div>
        </Card>
      )}

      {/* Error Message */}
      {submission.errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20">
          <p className="text-sm font-medium text-red-800 dark:text-red-400">
            {submission.errorType || "Error"}
          </p>
          <pre className="mt-2 max-h-48 overflow-auto rounded bg-red-100 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
            {submission.errorMessage}
          </pre>
        </div>
      )}

      {/* Code Section */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Submitted Code ({submission.language})
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyCode}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.05] dark:text-zinc-300 dark:hover:bg-white/[0.1]"
            >
              {copied ? "Copied!" : "Copy Code"}
            </button>
            {onRevert && (
              <button
                type="button"
                onClick={() => setShowConfirmRevert(true)}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Revert to This Code
              </button>
            )}
          </div>
        </div>
        <div className="relative">
          <pre className="max-h-96 overflow-auto rounded-lg bg-zinc-900 p-4 text-sm text-zinc-100 dark:bg-zinc-950">
            <code>{submission.code}</code>
          </pre>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmRevert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Revert to This Submission?
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              This will replace your current code with the code from this submission. 
              Your current code will be lost unless you've saved it elsewhere.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmRevert(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRevert}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Revert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
