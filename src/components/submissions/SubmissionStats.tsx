"use client";

import { Card } from "@/components/ui/Card";
import type { Submission, SubmissionStats as SubmissionStatsType } from "@/lib/supabase/submissions";

interface SubmissionStatsProps {
  stats: SubmissionStatsType | null;
  submissions?: Submission[];
  showDetailed?: boolean;
}

export function SubmissionStats({ stats, submissions = [], showDetailed = false }: SubmissionStatsProps) {
  // Calculate additional stats from submissions if provided
  const statusCounts = submissions.reduce((acc, sub) => {
    acc[sub.status] = (acc[sub.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalSubmissions = submissions.length || stats?.totalSubmissions || 0;
  const acceptedCount = statusCounts["accepted"] || stats?.acceptedSubmissions || 0;
  const acceptanceRate = totalSubmissions > 0 
    ? Math.round((acceptedCount / totalSubmissions) * 100) 
    : 0;

  // Calculate average execution time
  const avgExecutionTime = submissions.length > 0
    ? submissions
        .filter((s) => s.executionTimeMs)
        .reduce((sum, s) => sum + (s.executionTimeMs || 0), 0) / 
      submissions.filter((s) => s.executionTimeMs).length
    : 0;

  // Calculate average score
  const avgScore = submissions.length > 0
    ? submissions
        .filter((s) => s.score != null)
        .reduce((sum, s) => sum + (s.score || 0), 0) / 
      submissions.filter((s) => s.score != null).length
    : 0;

  // Get best score
  const bestScore = submissions.length > 0
    ? Math.max(...submissions.map((s) => s.score || 0))
    : 0;

  return (
    <div className="space-y-4">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Total Submissions</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            {totalSubmissions}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Accepted</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
            {acceptedCount}
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            {acceptanceRate}% rate
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Challenges Attempted</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            {stats?.challengesAttempted || 0}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Challenges Solved</p>
          <p className="mt-1 text-2xl font-semibold text-indigo-600 dark:text-indigo-400">
            {stats?.challengesSolved || 0}
          </p>
        </Card>
      </div>

      {/* Detailed Stats */}
      {showDetailed && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card className="p-4">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Avg Execution Time</p>
            <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {avgExecutionTime > 0 ? `${Math.round(avgExecutionTime)}ms` : "N/A"}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Avg Score</p>
            <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {avgScore > 0 ? `${Math.round(avgScore)}/100` : "N/A"}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Best Score</p>
            <p className="mt-1 text-lg font-semibold text-emerald-600 dark:text-emerald-400">
              {bestScore > 0 ? `${Math.min(Math.round(bestScore), 100)}/100` : "N/A"}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Wrong Answers</p>
            <p className="mt-1 text-lg font-semibold text-red-600 dark:text-red-400">
              {statusCounts["wrong_answer"] || 0}
            </p>
          </Card>
        </div>
      )}

      {/* Status Breakdown */}
      {showDetailed && totalSubmissions > 0 && (
        <Card className="p-4">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">
            Submission Status Breakdown
          </p>
          <div className="space-y-2">
            {[
              { key: "accepted", label: "Accepted", color: "bg-emerald-500" },
              { key: "wrong_answer", label: "Wrong Answer", color: "bg-red-500" },
              { key: "runtime_error", label: "Runtime Error", color: "bg-orange-500" },
              { key: "time_limit", label: "Time Limit", color: "bg-amber-500" },
              { key: "compilation_error", label: "Compilation Error", color: "bg-purple-500" },
            ].map(({ key, label, color }) => {
              const count = statusCounts[key] || 0;
              const percentage = totalSubmissions > 0 ? (count / totalSubmissions) * 100 : 0;
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="w-32 text-sm text-zinc-600 dark:text-zinc-400">{label}</span>
                  <div className="flex-1 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className={`h-2 rounded-full ${color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-sm text-zinc-600 dark:text-zinc-400">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
