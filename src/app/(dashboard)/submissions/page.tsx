"use client";

import { useState, useEffect, useMemo } from "react";
import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";
import { SubmissionList } from "@/components/submissions/SubmissionList";
import { SubmissionDetail } from "@/components/submissions/SubmissionDetail";
import { CodeComparison } from "@/components/submissions/CodeComparison";
import { SubmissionStats } from "@/components/submissions/SubmissionStats";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  getAllSubmissions,
  getSubmissionStats,
  type Submission,
  type SubmissionStatus,
} from "@/lib/supabase/submissions";
import { getAllChallenges } from "@/lib/challenges/catalog";
import type { Challenge } from "@/lib/challenges/types";
import { useToast } from "@/components/ui/Toast";

type SortOption = "date" | "executionTime" | "score";
type ViewMode = "list" | "detail" | "compare";

export default function SubmissionsPage() {
  const { user } = useSupabaseAuth();
  const { addToast } = useToast();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getSubmissionStats>>>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [challengeFilter, setChallengeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [dateRange, setDateRange] = useState<"all" | "7days" | "30days" | "90days">("all");

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [compareSubmissions, setCompareSubmissions] = useState<[Submission, Submission] | null>(null);

  // Build challenges map for lookup
  const challengesMap = useMemo(() => {
    return challenges.reduce((acc, challenge) => {
      acc[challenge.slug] = { title: challenge.title, slug: challenge.slug };
      return acc;
    }, {} as Record<string, { title: string; slug: string }>);
  }, [challenges]);

  // Load data
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([
      getAllSubmissions(user.id, 100),
      getSubmissionStats(user.id),
      getAllChallenges(),
    ])
      .then(([subs, statsData, challengesData]) => {
        setSubmissions(subs);
        setStats(statsData);
        setChallenges(challengesData);
      })
      .catch((err) => {
        console.error("Failed to load submissions:", err);
        addToast("Failed to load submissions", "error");
      })
      .finally(() => setLoading(false));
  }, [user, addToast]);

  // Filter and sort submissions
  const filteredSubmissions = useMemo(() => {
    let result = [...submissions];

    // Filter by challenge
    if (challengeFilter !== "all") {
      result = result.filter((s) => s.challengeSlug === challengeFilter);
    }

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter((s) => s.status === statusFilter);
    }

    // Filter by date range
    if (dateRange !== "all") {
      const now = new Date();
      const days = dateRange === "7days" ? 7 : dateRange === "30days" ? 30 : 90;
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      result = result.filter((s) => new Date(s.submittedAt) >= cutoff);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
        case "executionTime":
          return (b.executionTimeMs || 0) - (a.executionTimeMs || 0);
        case "score":
          return (b.score || 0) - (a.score || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [submissions, challengeFilter, statusFilter, sortBy, dateRange]);

  // Get unique challenges that have submissions
  const challengesWithSubmissions = useMemo(() => {
    const slugs = new Set(submissions.map((s) => s.challengeSlug));
    return challenges.filter((c) => slugs.has(c.slug));
  }, [submissions, challenges]);

  const handleSelectSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setViewMode("detail");
  };

  const handleCompare = (sub1: Submission, sub2: Submission) => {
    setCompareSubmissions([sub1, sub2]);
    setViewMode("compare");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedSubmission(null);
    setCompareSubmissions(null);
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Submission History
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Track all your code submissions across challenges
          </p>
        </div>
        <Card className="p-8 text-center">
          <p className="text-zinc-600 dark:text-zinc-400">
            Please sign in to view your submission history
          </p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Submission History
          </h1>
        </div>
        <div className="space-y-4">
          <div className="h-32 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-64 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Submission History
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Track all your code submissions across challenges
        </p>
      </div>

      {/* Stats */}
      {viewMode === "list" && (
        <div className="mb-8">
          <SubmissionStats stats={stats} submissions={submissions} showDetailed />
        </div>
      )}

      {/* Navigation */}
      {viewMode !== "list" && (
        <button
          type="button"
          onClick={handleBackToList}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to all submissions
        </button>
      )}

      {/* Filters (only in list view) */}
      {viewMode === "list" && (
        <Card className="mb-6 p-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Challenge filter */}
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Challenge
              </label>
              <select
                value={challengeFilter}
                onChange={(e) => setChallengeFilter(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                <option value="all">All Challenges</option>
                {challengesWithSubmissions.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Status filter */}
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as SubmissionStatus | "all")}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                <option value="all">All Statuses</option>
                <option value="accepted">Accepted</option>
                <option value="wrong_answer">Wrong Answer</option>
                <option value="runtime_error">Runtime Error</option>
                <option value="time_limit">Time Limit</option>
                <option value="compilation_error">Compile Error</option>
              </select>
            </div>

            {/* Sort by */}
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                <option value="date">Date (newest)</option>
                <option value="executionTime">Execution Time</option>
                <option value="score">Score (highest)</option>
              </select>
            </div>

            {/* Date range */}
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                <option value="all">All Time</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Content */}
      <Card className="p-6">
        {viewMode === "list" && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Submissions
              </h2>
              <Badge variant="muted">
                {filteredSubmissions.length} result{filteredSubmissions.length !== 1 ? "s" : ""}
              </Badge>
            </div>
            <SubmissionList
              submissions={filteredSubmissions}
              onSelect={handleSelectSubmission}
              onCompare={handleCompare}
              showChallengeName
              challengesMap={challengesMap}
            />
          </>
        )}

        {viewMode === "detail" && selectedSubmission && (
          <SubmissionDetail
            submission={selectedSubmission}
            challengeTitle={challengesMap[selectedSubmission.challengeSlug]?.title}
            onClose={handleBackToList}
            onCompare={() => {
              setViewMode("list");
              addToast("Select another submission to compare", "info");
            }}
          />
        )}

        {viewMode === "compare" && compareSubmissions && (
          <CodeComparison
            submission1={compareSubmissions[0]}
            submission2={compareSubmissions[1]}
            challengeTitle={challengesMap[compareSubmissions[0].challengeSlug]?.title}
            onClose={handleBackToList}
          />
        )}
      </Card>
    </div>
  );
}
