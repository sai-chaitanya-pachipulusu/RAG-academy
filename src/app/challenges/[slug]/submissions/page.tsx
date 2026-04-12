"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";
import { SubmissionList } from "@/components/submissions/SubmissionList";
import { SubmissionDetail } from "@/components/submissions/SubmissionDetail";
import { CodeComparison } from "@/components/submissions/CodeComparison";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  getSubmissionHistory,
  getBestSubmission,
  type Submission,
} from "@/lib/supabase/submissions";
import { getChallengeBySlug } from "@/lib/challenges/catalog";
import type { Challenge } from "@/lib/challenges/types";
import { useToast } from "@/components/ui/Toast";

type ViewMode = "list" | "detail" | "compare";

export default function ChallengeSubmissionsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useSupabaseAuth();
  const { addToast } = useToast();
  const slug = params.slug as string;

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [bestSubmission, setBestSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [compareSubmissions, setCompareSubmissions] = useState<[Submission, Submission] | null>(null);

  // Load challenge and submissions
  useEffect(() => {
    const challengeData = getChallengeBySlug(slug);
    if (!challengeData) {
      router.push("/challenges");
      return;
    }
    setChallenge(challengeData);

    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([
      getSubmissionHistory(user.id, slug, 50),
      getBestSubmission(user.id, slug),
    ])
      .then(([subs, best]) => {
        setSubmissions(subs);
        setBestSubmission(best);
      })
      .catch((err) => {
        console.error("Failed to load submissions:", err);
        addToast("Failed to load submissions", "error");
      })
      .finally(() => setLoading(false));
  }, [user, slug, router, addToast]);

  // Calculate progression data for chart
  const progressionData = useMemo(() => {
    if (submissions.length === 0) return [];
    
    // Sort by date ascending for progression
    const sorted = [...submissions].sort(
      (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
    );

    return sorted.map((sub, idx) => ({
      attempt: idx + 1,
      score: sub.score || 0,
      passed: sub.passed,
      date: sub.submittedAt,
    }));
  }, [submissions]);

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

  const handleRevert = (code: string) => {
    // Store the code in localStorage for the IDE to pick up
    localStorage.setItem(`challenge_${slug}_revert_code`, code);
    addToast("Code loaded! Redirecting to challenge...", "success");
    setTimeout(() => {
      router.push(`/challenges/${slug}`);
    }, 1500);
  };

  if (!challenge) {
    return (
      <div className="mx-auto max-w-4xl py-12">
        <div className="h-32 animate-pulse rounded-xl bg-gray-100 dark:bg-[#7C3AED]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl py-12">
        <div className="mb-8">
          <Link
            href={`/challenges/${slug}`}
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
          >
            ← Back to Challenge
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-gray-100">
            {challenge.title}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Submission History</p>
        </div>
        <Card className="p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Please sign in to view your submission history
          </p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl py-12">
        <div className="mb-8">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-[#7C3AED]" />
          <div className="mt-4 h-8 w-64 animate-pulse rounded bg-gray-200 dark:bg-[#7C3AED]" />
        </div>
        <div className="space-y-4">
          <div className="h-48 animate-pulse rounded-xl bg-gray-100 dark:bg-[#7C3AED]" />
          <div className="h-64 animate-pulse rounded-xl bg-gray-100 dark:bg-[#7C3AED]" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl py-12">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/challenges/${slug}`}
          className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
        >
          ← Back to Challenge
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-gray-100">
          {challenge.title}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Submission History & Progress
        </p>
      </div>

      {/* Best Submission Banner */}
      {bestSubmission && viewMode === "list" && (
        <Card className="mb-6 border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-800 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-lg text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400">
                🏆
              </span>
              <div>
                <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                  Best Submission
                </p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                  {bestSubmission.score != null
                    ? `Score: ${Math.min(bestSubmission.score, 100)}/100`
                    : "Accepted"}
                  {bestSubmission.executionTimeMs &&
                    ` • ${bestSubmission.executionTimeMs}ms`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleSelectSubmission(bestSubmission)}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 cursor-pointer"
            >
              View Details
            </button>
          </div>
        </Card>
      )}

      {/* Progress Chart */}
      {viewMode === "list" && progressionData.length > 1 && (
        <Card className="mb-6 p-4">
          <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Progress Over Time
          </h3>
          <div className="h-32">
            <svg viewBox="0 0 100 40" className="h-full w-full" preserveAspectRatio="none">
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={40 - (y / 100) * 40}
                  x2="100"
                  y2={40 - (y / 100) * 40}
                  stroke="currentColor"
                  strokeOpacity="0.1"
                  className="text-gray-500"
                />
              ))}
              
              {/* Progress line */}
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-indigo-500"
                points={progressionData
                  .map((d, i) => {
                    const x = (i / (progressionData.length - 1)) * 100;
                    const y = 40 - (d.score / 100) * 40;
                    return `${x},${y}`;
                  })
                  .join(" ")}
              />
              
              {/* Data points */}
              {progressionData.map((d, i) => {
                const x = (i / (progressionData.length - 1)) * 100;
                const y = 40 - (d.score / 100) * 40;
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="1.5"
                    fill={d.passed ? "#10b981" : "#f59e0b"}
                    stroke="white"
                    strokeWidth="0.5"
                  />
                );
              })}
            </svg>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>Attempt 1</span>
            <span>Latest Attempt</span>
          </div>
        </Card>
      )}

      {/* Navigation */}
      {viewMode !== "list" && (
        <button
          type="button"
          onClick={handleBackToList}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to submissions
        </button>
      )}

      {/* Submissions List */}
      <Card className="p-6">
        {viewMode === "list" && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  All Attempts
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {submissions.length} submission{submissions.length !== 1 ? "s" : ""} total
                </p>
              </div>
              <Badge
                variant={
                  submissions.some((s) => s.passed)
                    ? "accent"
                    : submissions.length > 0
                    ? "default"
                    : "muted"
                }
              >
                {submissions.some((s) => s.passed)
                  ? "Solved"
                  : submissions.length > 0
                  ? "In Progress"
                  : "Not Started"}
              </Badge>
            </div>
            <SubmissionList
              submissions={submissions}
              onSelect={handleSelectSubmission}
              onCompare={handleCompare}
            />
          </>
        )}

        {viewMode === "detail" && selectedSubmission && (
          <SubmissionDetail
            submission={selectedSubmission}
            onClose={handleBackToList}
            onRevert={handleRevert}
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
            challengeTitle={challenge.title}
            onClose={handleBackToList}
          />
        )}
      </Card>
    </div>
  );
}
