"use client";

import { useState, useEffect } from "react";
import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";
import { getSubmissionHistory, type Submission, type SubmissionStatus } from "@/lib/supabase/submissions";

interface Props {
  challengeSlug: string;
  onLoadCode?: (code: string) => void;
}

const STATUS_CONFIG: Record<SubmissionStatus, { label: string; color: string; icon: string }> = {
  accepted: { label: "Accepted", color: "text-emerald-600 bg-emerald-50", icon: "✓" },
  wrong_answer: { label: "Wrong Answer", color: "text-red-600 bg-red-50", icon: "✗" },
  runtime_error: { label: "Runtime Error", color: "text-orange-600 bg-orange-50", icon: "!" },
  time_limit: { label: "Time Limit", color: "text-amber-600 bg-amber-50", icon: "⏱" },
  compilation_error: { label: "Compile Error", color: "text-purple-600 bg-purple-50", icon: "⚠" },
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

export function SubmissionHistory({ challengeSlug, onLoadCode }: Props) {
  const { user } = useSupabaseAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setSubmissions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    getSubmissionHistory(user.id, challengeSlug, 10)
      .then(setSubmissions)
      .finally(() => setLoading(false));
  }, [user, challengeSlug]);

  if (!user) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-500">
        Sign in to see your submission history
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-zinc-600"></span>
          <span className="text-sm text-gray-500">Loading submissions...</span>
        </div>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-500">
        No submissions yet. Submit your code to see history here.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span>📋</span>
          Submission History
        </h3>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
          {submissions.length} submissions
        </span>
      </div>

      <div className="max-h-80 overflow-auto">
        {submissions.map((sub, idx) => {
          const config = STATUS_CONFIG[sub.status];
          const isExpanded = expanded === sub.id;

          return (
            <div
              key={sub.id}
              className={`border-b border-gray-100 last:border-b-0 ${
                idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
              }`}
            >
              {/* Summary row */}
              <button
                type="button"
                onClick={() => setExpanded(isExpanded ? null : sub.id)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-all duration-200-all duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${config.color}`}
                  >
                    {config.icon}
                  </span>
                  <div>
                    <span className={`text-sm font-medium ${sub.passed ? "text-emerald-700" : "text-gray-700"}`}>
                      {config.label}
                    </span>
                    {sub.executionTimeMs && (
                      <span className="ml-2 text-xs text-gray-400">
                        {sub.executionTimeMs}ms
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {sub.score != null && (
                    <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                      Score: {sub.score > 100 ? 100 : sub.score}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">{formatTimeAgo(sub.submittedAt)}</span>
                  <span className="text-gray-400">{isExpanded ? "▲" : "▼"}</span>
                </div>
              </button>

              {/* Expanded code view */}
              {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-900 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs text-gray-400">Code ({sub.language})</span>
                    {onLoadCode && (
                      <button
                        type="button"
                        onClick={() => onLoadCode(sub.code)}
                        className="rounded bg-gray-700 px-2 py-1 text-xs text-gray-200 hover:bg-gray-600 transition-all duration-200-all duration-200 cursor-pointer"
                      >
                        Load this code
                      </button>
                    )}
                  </div>
                  <pre className="max-h-48 overflow-auto rounded bg-[#7C3AED] p-2 text-xs text-gray-100">
                    {sub.code}
                  </pre>
                  {sub.errorMessage && (
                    <div className="mt-2 rounded bg-red-950/50 p-2">
                      <span className="text-xs font-medium text-red-400">Error:</span>
                      <pre className="mt-1 max-h-24 overflow-auto text-xs text-red-300">
                        {sub.errorMessage}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
