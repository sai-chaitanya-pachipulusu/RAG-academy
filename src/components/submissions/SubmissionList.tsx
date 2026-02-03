"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Submission, SubmissionStatus } from "@/lib/supabase/submissions";

interface SubmissionListProps {
  submissions: Submission[];
  onSelect?: (submission: Submission) => void;
  onCompare?: (submission1: Submission, submission2: Submission) => void;
  selectedIds?: string[];
  showChallengeName?: boolean;
  challengesMap?: Record<string, { title: string; slug: string }>;
}

const STATUS_CONFIG: Record<SubmissionStatus, { label: string; color: string; icon: string }> = {
  accepted: { label: "Accepted", color: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30", icon: "✓" },
  wrong_answer: { label: "Wrong Answer", color: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/30", icon: "✗" },
  runtime_error: { label: "Runtime Error", color: "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/30", icon: "!" },
  time_limit: { label: "Time Limit", color: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30", icon: "⏱" },
  compilation_error: { label: "Compile Error", color: "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/30", icon: "⚠" },
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SubmissionList({
  submissions,
  onSelect,
  onCompare,
  selectedIds = [],
  showChallengeName = false,
  challengesMap = {},
}: SubmissionListProps) {
  const [compareMode, setCompareMode] = useState(false);
  const [compareSelection, setCompareSelection] = useState<string[]>([]);

  const handleCompareToggle = (submissionId: string) => {
    setCompareSelection((prev) => {
      if (prev.includes(submissionId)) {
        return prev.filter((id) => id !== submissionId);
      }
      if (prev.length >= 2) {
        return [prev[1], submissionId];
      }
      return [...prev, submissionId];
    });
  };

  const handleCompareClick = () => {
    if (compareSelection.length === 2 && onCompare) {
      const sub1 = submissions.find((s) => s.id === compareSelection[0]);
      const sub2 = submissions.find((s) => s.id === compareSelection[1]);
      if (sub1 && sub2) {
        onCompare(sub1, sub2);
      }
    }
    setCompareMode(false);
    setCompareSelection([]);
  };

  return (
    <div className="space-y-4">
      {/* Compare mode controls */}
      {onCompare && submissions.length > 1 && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setCompareMode(!compareMode);
              setCompareSelection([]);
            }}
            className={`text-sm font-medium transition-colors ${
              compareMode
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            {compareMode ? "Cancel Compare" : "Compare Submissions"}
          </button>
          {compareMode && (
            <span className="text-sm text-zinc-500">
              Select 2 submissions ({compareSelection.length}/2)
            </span>
          )}
          {compareMode && compareSelection.length === 2 && (
            <button
              type="button"
              onClick={handleCompareClick}
              className="rounded-lg bg-indigo-600 px-3 py-1 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              Compare Selected
            </button>
          )}
        </div>
      )}

      {/* Submissions list */}
      <div className="space-y-2">
        {submissions.map((submission, idx) => {
          const config = STATUS_CONFIG[submission.status];
          const isSelected = selectedIds.includes(submission.id);
          const isCompareSelected = compareSelection.includes(submission.id);
          const challenge = challengesMap[submission.challengeSlug];

          return (
            <div
              key={submission.id}
              onClick={() => {
                if (compareMode) {
                  handleCompareToggle(submission.id);
                } else if (onSelect) {
                  onSelect(submission);
                }
              }}
              className={`group rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? "border-indigo-500 bg-indigo-50/50 dark:border-indigo-400 dark:bg-indigo-950/20"
                  : isCompareSelected
                  ? "border-indigo-300 bg-indigo-50/30 dark:border-indigo-600 dark:bg-indigo-950/10"
                  : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Status icon */}
                  <span
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${config.color}`}
                  >
                    {config.icon}
                  </span>

                  {/* Challenge name & status */}
                  <div className="min-w-0">
                    {showChallengeName && challenge && (
                      <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {challenge.title}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium ${
                          submission.passed
                            ? "text-emerald-700 dark:text-emerald-400"
                            : "text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        {config.label}
                      </span>
                      {submission.testsTotal > 0 && (
                        <span className="text-xs text-zinc-500">
                          ({submission.testsPassed}/{submission.testsTotal} tests)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-4 text-sm">
                  {submission.score != null && (
                    <Badge variant={submission.score >= 80 ? "accent" : "default"}>
                      Score: {Math.min(submission.score, 100)}
                    </Badge>
                  )}
                  {submission.executionTimeMs && (
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {submission.executionTimeMs}ms
                    </span>
                  )}
                  <span className="text-zinc-400 dark:text-zinc-500" title={formatDate(submission.submittedAt)}>
                    {formatTimeAgo(submission.submittedAt)}
                  </span>
                  {compareMode && (
                    <div
                      className={`h-5 w-5 rounded border-2 flex items-center justify-center ${
                        isCompareSelected
                          ? "border-indigo-500 bg-indigo-500 text-white"
                          : "border-zinc-300 dark:border-zinc-600"
                      }`}
                    >
                      {isCompareSelected && "✓"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {submissions.length === 0 && (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-8 text-center dark:border-white/10 dark:bg-white/[0.03]">
          <p className="text-zinc-500 dark:text-zinc-400">No submissions found</p>
        </div>
      )}
    </div>
  );
}
