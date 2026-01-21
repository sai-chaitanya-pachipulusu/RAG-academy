"use client";

import { getSupabase } from "./client";

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  username: string | null;
  xp: number;
  challengesCompleted: number;
  streakDays: number;
  lastActivity: string | null;
  isMockData?: boolean; // Flag to indicate if this is placeholder data
};

export type LeaderboardTimeFilter = "daily" | "weekly" | "monthly" | "all_time";

export type LeaderboardResult = {
  entries: LeaderboardEntry[];
  isLive: boolean; // true if data is from Supabase, false if mock
  error?: string;
};

/**
 * Fetch global leaderboard sorted by XP.
 * Returns top users with their stats.
 * 
 * IMPORTANT: This returns REAL user data from Supabase.
 * Mock data is only shown when Supabase is not configured or has no users.
 */
export async function fetchGlobalLeaderboard(
  limit = 50,
  timeFilter: LeaderboardTimeFilter = "all_time"
): Promise<LeaderboardEntry[]> {
  const result = await fetchGlobalLeaderboardWithStatus(limit, timeFilter);
  return result.entries;
}

/**
 * Fetch leaderboard with status information.
 * Use this to know if data is live or mock.
 */
export async function fetchGlobalLeaderboardWithStatus(
  limit = 50,
  timeFilter: LeaderboardTimeFilter = "all_time"
): Promise<LeaderboardResult> {
  const supabase = getSupabase();
  if (!supabase) {
    console.warn("Supabase not configured - showing placeholder data");
    return {
      entries: getEmptyStateData(limit),
      isLive: false,
      error: "Supabase not configured. Sign up to appear on the leaderboard!",
    };
  }

  try {
    // Calculate date filter based on time period
    const dateFilter = getDateFilter(timeFilter);

    // Query profiles with optional time filter
    let query = supabase
      .from("profiles")
      .select("id, xp, streak_days, last_activity_date, username")
      .order("xp", { ascending: false })
      .limit(limit);

    if (dateFilter) {
      query = query.gte("last_activity_date", dateFilter);
    }

    const { data: profiles, error } = await query;

    if (error) {
      console.error("Failed to fetch leaderboard:", error);
      return {
        entries: getEmptyStateData(limit),
        isLive: false,
        error: `Database error: ${error.message}`,
      };
    }

    if (!profiles || profiles.length === 0) {
      // No users yet - show encouraging empty state
      return {
        entries: getEmptyStateData(limit),
        isLive: true, // Connected, just no data
        error: "Be the first on the leaderboard! Complete challenges to earn XP.",
      };
    }

    // Type for profile data
    type ProfileRow = {
      id: string;
      xp: number | null;
      streak_days: number | null;
      last_activity_date: string | null;
      username: string | null;
    };

    // Get challenge completion counts
    const userIds = (profiles as ProfileRow[]).map((p) => p.id);
    const { data: completions } = await supabase
      .from("challenge_progress")
      .select("user_id")
      .in("user_id", userIds)
      .eq("status", "completed");

    // Count completions per user
    const completionCounts = (completions || []).reduce(
      (acc: Record<string, number>, c: { user_id: string }) => {
        acc[c.user_id] = (acc[c.user_id] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Build leaderboard entries
    const entries = (profiles as ProfileRow[]).map((profile, idx) => ({
      rank: idx + 1,
      userId: profile.id,
      username: profile.username || `User ${profile.id.slice(0, 6)}`,
      xp: profile.xp || 0,
      challengesCompleted: completionCounts[profile.id] || 0,
      streakDays: profile.streak_days || 0,
      lastActivity: profile.last_activity_date,
      isMockData: false,
    }));

    return {
      entries,
      isLive: true,
    };
  } catch (err) {
    console.error("Leaderboard fetch error:", err);
    return {
      entries: getEmptyStateData(limit),
      isLive: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Fetch a user's rank in the global leaderboard.
 */
export async function fetchUserRank(userId: string): Promise<number | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    // Get user's XP
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("xp")
      .eq("id", userId)
      .maybeSingle();

    if (userError || !user) return null;

    // Count users with more XP
    const { count, error: countError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gt("xp", user.xp || 0);

    if (countError) return null;

    return (count || 0) + 1;
  } catch {
    return null;
  }
}

/**
 * Subscribe to real-time leaderboard updates.
 */
export function subscribeToLeaderboard(
  callback: (entries: LeaderboardEntry[]) => void
): (() => void) | null {
  const supabase = getSupabase();
  if (!supabase) return null;

  const channel = supabase
    .channel("leaderboard-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "profiles" },
      async () => {
        // Refetch leaderboard on any profile change
        const entries = await fetchGlobalLeaderboard();
        callback(entries);
      }
    )
    .subscribe();

  // Return cleanup function
  return () => {
    supabase.removeChannel(channel);
  };
}

function getDateFilter(timeFilter: LeaderboardTimeFilter): string | null {
  const now = new Date();
  switch (timeFilter) {
    case "daily":
      now.setHours(0, 0, 0, 0);
      return now.toISOString();
    case "weekly":
      now.setDate(now.getDate() - 7);
      return now.toISOString();
    case "monthly":
      now.setMonth(now.getMonth() - 1);
      return now.toISOString();
    case "all_time":
    default:
      return null;
  }
}

/**
 * Empty state placeholder data.
 * Shows encouraging messages when no real users exist yet.
 */
function getEmptyStateData(limit: number): LeaderboardEntry[] {
  // Return placeholder entries that clearly indicate "be the first"
  const placeholders = [
    { username: "🏆 Your name here!", xp: 0, challenges: 0, streak: 0 },
    { username: "Complete challenges to rank", xp: 0, challenges: 0, streak: 0 },
    { username: "Earn XP and climb up", xp: 0, challenges: 0, streak: 0 },
  ];

  return placeholders.slice(0, Math.min(limit, 3)).map((user, idx) => ({
    rank: idx + 1,
    userId: `placeholder_${idx}`,
    username: user.username,
    xp: user.xp,
    challengesCompleted: user.challenges,
    streakDays: user.streak,
    lastActivity: null,
    isMockData: true,
  }));
}
