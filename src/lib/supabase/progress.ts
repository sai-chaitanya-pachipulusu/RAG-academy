"use client";

import type { LocalProgressState } from "@/lib/progress/localStore";

import { requireSupabase } from "./client";

export async function upsertProfileFromLocal(userId: string, state: LocalProgressState) {
  const supabase = requireSupabase();
  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      xp: state.xp,
      streak_days: state.streak.streakDays,
      last_activity_date: state.streak.lastActivityDate,
    },
    { onConflict: "id" }
  );

  if (error) throw error;
}

export async function upsertChallengeProgressFromLocal(
  userId: string,
  slug: string,
  state: LocalProgressState
) {
  const supabase = requireSupabase();
  const p = state.challenges[slug];
  if (!p) return;

  const { error } = await supabase.from("challenge_progress").upsert(
    {
      user_id: userId,
      challenge_slug: slug,
      status: p.status,
      attempts: p.attempts,
      user_code: p.userCode,
      completed_at: p.completedAt,
    },
    { onConflict: "user_id,challenge_slug" }
  );

  if (error) throw error;
}

export async function fetchRemoteProgress(userId: string) {
  const supabase = requireSupabase();
  const [{ data: profile, error: profileError }, { data: challenges, error: challengesError }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("xp, streak_days, last_activity_date")
        .eq("id", userId)
        .maybeSingle(),
      supabase
        .from("challenge_progress")
        .select("challenge_slug, status, attempts, user_code, completed_at")
        .eq("user_id", userId),
    ]);

  if (profileError) throw profileError;
  if (challengesError) throw challengesError;

  return { profile, challenges: challenges ?? [] };
}


