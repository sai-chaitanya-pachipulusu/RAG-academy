
import { requireSupabase } from "./client";

export async function submitChallengeResult(
  userId: string,
  slug: string,
  score: number,
  metrics: Record<string, number | string>,
  code: string
) {
  const supabase = requireSupabase();
  
  const { error } = await supabase.from("challenge_submissions").insert({
    user_id: userId,
    challenge_slug: slug,
    score,
    latency_ms: typeof metrics.latency_ms === "number" ? metrics.latency_ms : null,
    metrics,
    code_snapshot: code,
  });

  if (error) {
    console.error("Failed to submit challenge result:", error);
    // Don't throw, just log. This is best-effort.
  }
}

export async function fetchLeaderboard(slug: string, limit = 10) {
  const supabase = requireSupabase();
  
  // Fetch top scores for this challenge
  // Note: We want unique users, max score per user.
  // In a real generic SQL we'd use DISTINCT ON, but supabase-js is limited.
  // For now, simple descending sort.
  
  const { data, error } = await supabase
    .from("challenge_submissions")
    .select("user_id, score, latency_ms, created_at, profiles(xp)") // joining profiles if possible
    .eq("challenge_slug", slug)
    .order("score", { ascending: false })
    .order("latency_ms", { ascending: true }) // Tie-breaker
    .limit(limit);

  if (error) throw error;
  return data;
}
