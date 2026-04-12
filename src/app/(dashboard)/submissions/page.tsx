"use client";

import { useState, useEffect, useMemo } from "react";
import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";
import { SubmissionList } from "@/components/submissions/SubmissionList";
import { SubmissionDetail } from "@/components/submissions/SubmissionDetail";
import { CodeComparison } from "@/components/submissions/CodeComparison";
import { SubmissionStats } from "@/components/submissions/SubmissionStats";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getAllSubmissions, getSubmissionStats, type Submission, type SubmissionStatus } from "@/lib/supabase/submissions";
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
  const [challengeFilter, setChallengeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [dateRange, setDateRange] = useState<"all" | "7days" | "30days" | "90days">("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [compareSubmissions, setCompareSubmissions] = useState<[Submission, Submission] | null>(null);

  const challengesMap = useMemo(() => challenges.reduce((acc, c) => { acc[c.slug] = { title: c.title, slug: c.slug }; return acc; }, {} as Record<string, { title: string; slug: string }>), [challenges]);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    Promise.all([getAllSubmissions(user.id, 100), getSubmissionStats(user.id), getAllChallenges()])
      .then(([subs, statsData, challengesData]) => { setSubmissions(subs); setStats(statsData); setChallenges(challengesData); })
      .catch((err) => { console.error("Failed to load submissions:", err); addToast("Failed to load submissions", "error"); })
      .finally(() => setLoading(false));
  }, [user, addToast]);

  const filteredSubmissions = useMemo(() => {
    let result = [...submissions];
    if (challengeFilter !== "all") result = result.filter((s) => s.challengeSlug === challengeFilter);
    if (statusFilter !== "all") result = result.filter((s) => s.status === statusFilter);
    if (dateRange !== "all") { const cutoff = new Date(Date.now() - (dateRange === "7days" ? 7 : dateRange === "30days" ? 30 : 90) * 86400000); result = result.filter((s) => new Date(s.submittedAt) >= cutoff); }
    result.sort((a, b) => sortBy === "date" ? new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime() : sortBy === "executionTime" ? (b.executionTimeMs || 0) - (a.executionTimeMs || 0) : (b.score || 0) - (a.score || 0));
    return result;
  }, [submissions, challengeFilter, statusFilter, sortBy, dateRange]);

  const challengesWithSubmissions = useMemo(() => { const slugs = new Set(submissions.map((s) => s.challengeSlug)); return challenges.filter((c) => slugs.has(c.slug)); }, [submissions, challenges]);

  if (!user) return <div className="flex items-center justify-center py-20"><p className="text-sm text-gray-500">Sign in to view submissions</p></div>;
  if (loading) return <div className="flex items-center justify-center py-20"><p className="text-sm text-gray-500">Loading submissions...</p></div>;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Submission History</h1>
        <p className="mt-0.5 text-sm text-gray-500">Track your code submissions across challenges.</p>
      </div>

      {viewMode !== "list" && (
        <button onClick={() => { setViewMode("list"); setSelectedSubmission(null); setCompareSubmissions(null); }} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 cursor-pointer">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to all submissions
        </button>
      )}

      {viewMode === "list" && <SubmissionStats stats={stats} submissions={submissions} />}

      {viewMode === "list" && (
        <Card className="p-3">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-0.5 block text-[11px] font-medium text-gray-500">Challenge</label>
              <select value={challengeFilter} onChange={(e) => setChallengeFilter(e.target.value)} className="w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs dark:border-gray-700 dark:bg-gray-900">
                <option value="all">All</option>
                {challengesWithSubmissions.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-0.5 block text-[11px] font-medium text-gray-500">Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as SubmissionStatus | "all")} className="w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs dark:border-gray-700 dark:bg-gray-900">
                <option value="all">All</option>
                <option value="accepted">Accepted</option>
                <option value="wrong_answer">Wrong Answer</option>
                <option value="runtime_error">Runtime Error</option>
                <option value="time_limit">Time Limit</option>
                <option value="compilation_error">Compile Error</option>
              </select>
            </div>
            <div>
              <label className="mb-0.5 block text-[11px] font-medium text-gray-500">Sort</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className="w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs dark:border-gray-700 dark:bg-gray-900">
                <option value="date">Date</option>
                <option value="executionTime">Execution Time</option>
                <option value="score">Score</option>
              </select>
            </div>
            <div>
              <label className="mb-0.5 block text-[11px] font-medium text-gray-500">Date Range</label>
              <select value={dateRange} onChange={(e) => setDateRange(e.target.value as typeof dateRange)} className="w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs dark:border-gray-700 dark:bg-gray-900">
                <option value="all">All Time</option>
                <option value="7days">7 Days</option>
                <option value="30days">30 Days</option>
                <option value="90days">90 Days</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-4">
        {viewMode === "list" && (
          <>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Submissions</h2>
              <Badge variant="muted">{filteredSubmissions.length}</Badge>
            </div>
            <SubmissionList submissions={filteredSubmissions} onSelect={(s) => { setSelectedSubmission(s); setViewMode("detail"); }} onCompare={(s1, s2) => { setCompareSubmissions([s1, s2]); setViewMode("compare"); }} showChallengeName challengesMap={challengesMap} />
          </>
        )}
        {viewMode === "detail" && selectedSubmission && <SubmissionDetail submission={selectedSubmission} challengeTitle={challengesMap[selectedSubmission.challengeSlug]?.title} onClose={() => { setViewMode("list"); setSelectedSubmission(null); }} onCompare={() => { setViewMode("list"); addToast("Select another submission to compare", "info"); }} />}
        {viewMode === "compare" && compareSubmissions && <CodeComparison submission1={compareSubmissions[0]} submission2={compareSubmissions[1]} challengeTitle={challengesMap[compareSubmissions[0].challengeSlug]?.title} onClose={() => { setViewMode("list"); setCompareSubmissions(null); }} />}
      </Card>
    </div>
  );
}
