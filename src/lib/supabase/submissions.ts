/**
 * Submission History
 *
 * Track all code submission attempts for challenges (like LeetCode/HackerRank).
 * Stores: code, result, execution time, errors, and more.
 */

import { requireSupabase, getSupabase } from "./client";

export type SubmissionStatus =
  | "accepted"
  | "wrong_answer"
  | "runtime_error"
  | "time_limit"
  | "compilation_error";

export interface Submission {
  id: string;
  challengeSlug: string;
  code: string;
  language: string;
  status: SubmissionStatus;
  passed: boolean;
  executionTimeMs: number | null;
  memoryKb: number | null;
  score: number | null;
  testsPassed: number;
  testsTotal: number;
  errorMessage: string | null;
  errorType: string | null;
  metrics: Record<string, unknown>;
  submittedAt: string;
}

export interface SubmissionStats {
  totalSubmissions: number;
  acceptedSubmissions: number;
  challengesAttempted: number;
  challengesSolved: number;
  acceptanceRate: number;
}

export interface SaveSubmissionResult {
  id: string;
  xpAwarded?: number;
  paywall?: boolean;
  reason?: string;
}

/**
 * Save a new submission to history.
 * Routes through /api/submissions for server-side paywall + rate limiting.
 */
export async function saveSubmission(
  userId: string,
  challengeSlug: string,
  submission: {
    code: string;
    language?: string;
    passed: boolean;
    executionTimeMs?: number;
    score?: number;
    testsPassed?: number;
    testsTotal?: number;
    errorMessage?: string;
    errorType?: string;
    metrics?: Record<string, unknown>;
  }
): Promise<SaveSubmissionResult | null> {
  // Get access token from current Supabase session
  const supabase = getSupabase();
  const session = supabase ? (await supabase.auth.getSession()).data.session : null;
  const token = session?.access_token;
  if (!token) return null;

  // Hit the server-side endpoint (handles paywall + rate limit + XP rules)
  const res = await fetch("/api/submissions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-supabase-access-token": token,
    },
    body: JSON.stringify({
      challengeSlug,
      code: submission.code,
      language: submission.language || "python",
      passed: submission.passed,
      executionTimeMs: submission.executionTimeMs ?? null,
      score: submission.score ?? null,
      testsPassed: submission.testsPassed ?? 0,
      testsTotal: submission.testsTotal ?? 0,
      errorMessage: submission.errorMessage ?? null,
      errorType: submission.errorType ?? null,
      metrics: submission.metrics ?? {},
    }),
  });

  if (res.status === 402) {
    // Paywall — paid challenge, no subscription
    const body = await res.json().catch(() => ({}));
    return { id: "", paywall: true, reason: body.reason };
  }

  if (!res.ok) {
    console.warn("Failed to save submission:", res.status);
    return null;
  }

  const json = (await res.json()) as { id: string; xpAwarded?: number };
  return { id: json.id, xpAwarded: json.xpAwarded };
}

/**
 * Get submission history for a specific challenge
 */
export async function getSubmissionHistory(
  userId: string,
  challengeSlug: string,
  limit: number = 20
): Promise<Submission[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("submission_history")
    .select("*")
    .eq("user_id", userId)
    .eq("challenge_slug", challengeSlug)
    .order("submitted_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("Failed to fetch submission history:", error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    challengeSlug: row.challenge_slug,
    code: row.code,
    language: row.language,
    status: row.status as SubmissionStatus,
    passed: row.passed,
    executionTimeMs: row.execution_time_ms,
    memoryKb: row.memory_kb,
    score: row.score,
    testsPassed: row.tests_passed,
    testsTotal: row.tests_total,
    errorMessage: row.error_message,
    errorType: row.error_type,
    metrics: row.metrics || {},
    submittedAt: row.submitted_at,
  }));
}

/**
 * Get all submissions for a user (across all challenges)
 */
export async function getAllSubmissions(
  userId: string,
  limit: number = 50
): Promise<Submission[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("submission_history")
    .select("*")
    .eq("user_id", userId)
    .order("submitted_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("Failed to fetch all submissions:", error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    challengeSlug: row.challenge_slug,
    code: row.code,
    language: row.language,
    status: row.status as SubmissionStatus,
    passed: row.passed,
    executionTimeMs: row.execution_time_ms,
    memoryKb: row.memory_kb,
    score: row.score,
    testsPassed: row.tests_passed,
    testsTotal: row.tests_total,
    errorMessage: row.error_message,
    errorType: row.error_type,
    metrics: row.metrics || {},
    submittedAt: row.submitted_at,
  }));
}

/**
 * Get submission statistics for a user
 */
export async function getSubmissionStats(userId: string): Promise<SubmissionStats | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .rpc("get_submission_stats", { p_user_id: userId });

  if (error) {
    console.warn("Failed to fetch submission stats:", error);
    return null;
  }

  if (!data || data.length === 0) {
    return {
      totalSubmissions: 0,
      acceptedSubmissions: 0,
      challengesAttempted: 0,
      challengesSolved: 0,
      acceptanceRate: 0,
    };
  }

  const row = data[0];
  return {
    totalSubmissions: row.total_submissions || 0,
    acceptedSubmissions: row.accepted_submissions || 0,
    challengesAttempted: row.challenges_attempted || 0,
    challengesSolved: row.challenges_solved || 0,
    acceptanceRate: row.acceptance_rate || 0,
  };
}

/**
 * Get the best submission for a challenge (highest score or first accepted)
 */
export async function getBestSubmission(
  userId: string,
  challengeSlug: string
): Promise<Submission | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  // First try to get highest scored submission
  const { data: scoredData } = await supabase
    .from("submission_history")
    .select("*")
    .eq("user_id", userId)
    .eq("challenge_slug", challengeSlug)
    .eq("passed", true)
    .not("score", "is", null)
    .order("score", { ascending: false })
    .limit(1);

  if (scoredData && scoredData.length > 0) {
    const row = scoredData[0];
    return {
      id: row.id,
      challengeSlug: row.challenge_slug,
      code: row.code,
      language: row.language,
      status: row.status as SubmissionStatus,
      passed: row.passed,
      executionTimeMs: row.execution_time_ms,
      memoryKb: row.memory_kb,
      score: row.score,
      testsPassed: row.tests_passed,
      testsTotal: row.tests_total,
      errorMessage: row.error_message,
      errorType: row.error_type,
      metrics: row.metrics || {},
      submittedAt: row.submitted_at,
    };
  }

  // Fallback to first accepted submission
  const { data: acceptedData } = await supabase
    .from("submission_history")
    .select("*")
    .eq("user_id", userId)
    .eq("challenge_slug", challengeSlug)
    .eq("passed", true)
    .order("submitted_at", { ascending: true })
    .limit(1);

  if (acceptedData && acceptedData.length > 0) {
    const row = acceptedData[0];
    return {
      id: row.id,
      challengeSlug: row.challenge_slug,
      code: row.code,
      language: row.language,
      status: row.status as SubmissionStatus,
      passed: row.passed,
      executionTimeMs: row.execution_time_ms,
      memoryKb: row.memory_kb,
      score: row.score,
      testsPassed: row.tests_passed,
      testsTotal: row.tests_total,
      errorMessage: row.error_message,
      errorType: row.error_type,
      metrics: row.metrics || {},
      submittedAt: row.submitted_at,
    };
  }

  return null;
}
