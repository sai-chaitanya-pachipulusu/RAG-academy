/**
 * Analytics API Routes
 * Handles analytics data fetching and updates
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifySupabaseAccessToken } from "@/lib/supabase/serverAuth";

/** Lazy factory — never throws at module load time. */
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase environment variables");
  return createClient(url, key);
}

/** Resolve the bearer token from the request to a verified user ID. */
async function authenticate(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get("authorization");
  const token =
    authHeader?.replace("Bearer ", "") ??
    request.cookies.get("sb-access-token")?.value;
  if (!token) return null;
  const user = await verifySupabaseAccessToken(token);
  return user?.id ?? null;
}

// ============================================
// GET - Fetch analytics data
// ============================================

export async function GET(request: NextRequest) {
  try {
    const userId = await authenticate(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "summary";

    // userId is always derived from the verified session — never from the query string.
    switch (type) {
      case "summary":
        return await getAnalyticsSummary(userId);
      case "time":
        return await getTimePerChallenge(userId);
      case "skills":
        return await getSkillGaps(userId);
      case "heatmap": {
        const days = parseInt(searchParams.get("days") || "365");
        return await getActivityHeatmap(userId, days);
      }
      case "patterns":
        return await getStudyPatterns(userId);
      default:
        return NextResponse.json(
          { error: "Invalid analytics type" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Analytics GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

// ============================================
// POST - Record analytics events
// ============================================

export async function POST(request: NextRequest) {
  try {
    const userId = await authenticate(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, data } = body;

    if (!type) {
      return NextResponse.json(
        { error: "Event type is required" },
        { status: 400 }
      );
    }

    // userId is always the authenticated user — ignore any userId in the request body.
    switch (type) {
      case "session_start":
        return await startLearningSession(userId, data);
      case "session_end":
        return await endLearningSession(userId, data);
      case "challenge_analytics":
        return await updateChallengeAnalytics(userId, data);
      default:
        return NextResponse.json(
          { error: "Invalid event type" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Analytics POST error:", error);
    return NextResponse.json(
      { error: "Failed to record analytics" },
      { status: 500 }
    );
  }
}

// ============================================
// Helper Functions
// ============================================

async function getAnalyticsSummary(userId: string) {
  const supabase = getSupabaseAdmin();
  // Fetch all analytics data in parallel
  const [
    { data: challengeAnalytics },
    { data: dailyStats },
    { data: skillGaps },
    { data: peerComparison },
  ] = await Promise.all([
    supabase
      .from("challenge_analytics")
      .select("*")
      .eq("user_id", userId),
    supabase
      .from("daily_learning_stats")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(30),
    supabase
      .from("skill_gap_analysis")
      .select("*")
      .eq("user_id", userId),
    supabase
      .from("peer_comparison")
      .select("*")
      .eq("user_id", userId)
      .order("calculated_at", { ascending: false })
      .limit(1)
      .single(),
  ]);

  // Calculate summary metrics
  const totalCompleted = challengeAnalytics?.filter(
    (c) => c.completed_at !== null
  ).length || 0;
  
  const totalAttempted = challengeAnalytics?.length || 0;
  const totalTimeSpent = challengeAnalytics?.reduce(
    (sum, c) => sum + (c.total_time_spent_seconds || 0), 0
  ) || 0;
  
  const totalXP = dailyStats?.reduce((sum, d) => sum + (d.xp_earned || 0), 0) || 0;

  return NextResponse.json({
    totalChallengesAttempted: totalAttempted,
    totalChallengesCompleted: totalCompleted,
    totalTimeSpentSeconds: totalTimeSpent,
    totalXPEarned: totalXP,
    completionRate: totalAttempted > 0 ? Math.round((totalCompleted / totalAttempted) * 100) : 0,
    skillGaps: skillGaps || [],
    dailyStats: dailyStats || [],
    peerComparison: peerComparison || null,
  });
}

async function getTimePerChallenge(userId: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("challenge_analytics")
    .select("*")
    .eq("user_id", userId)
    .order("total_time_spent_seconds", { ascending: false });

  if (error) throw error;

  return NextResponse.json(data || []);
}

async function getSkillGaps(userId: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("skill_gap_analysis")
    .select("*")
    .eq("user_id", userId)
    .order("proficiency_score", { ascending: true });

  if (error) throw error;

  return NextResponse.json(data || []);
}

async function getActivityHeatmap(userId: string, days: number) {
  const supabase = getSupabaseAdmin();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from("daily_learning_stats")
    .select("date, challenges_completed")
    .eq("user_id", userId)
    .gte("date", startDate.toISOString().split("T")[0])
    .order("date", { ascending: true });

  if (error) throw error;

  // Fill in missing dates
  const result = [];
  const dataMap = new Map(data?.map((d) => [d.date, d.challenges_completed]) || []);

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const count = dataMap.get(dateStr) || 0;
    
    result.push({
      date: dateStr,
      count,
      level: getActivityLevel(count),
    });
  }

  return NextResponse.json(result);
}

async function getStudyPatterns(userId: string) {
  const supabase = getSupabaseAdmin();
  const { data: sessions, error } = await supabase
    .from("learning_sessions")
    .select("*")
    .eq("user_id", userId)
    .not("ended_at", "is", null)
    .order("started_at", { ascending: false })
    .limit(100);

  if (error) throw error;

  if (!sessions || sessions.length === 0) {
    return NextResponse.json(null);
  }

  // Calculate patterns
  const dayCounts: Record<string, number> = {};
  const hourCounts: Record<string, number> = {};
  const typeCounts: Record<string, number> = {};
  let totalDuration = 0;

  sessions.forEach((s) => {
    const day = new Date(s.started_at).toLocaleDateString("en-US", { weekday: "long" });
    const hour = new Date(s.started_at).getHours();
    const timeSlot = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening";
    
    dayCounts[day] = (dayCounts[day] || 0) + (s.xp_earned || 0);
    hourCounts[timeSlot] = (hourCounts[timeSlot] || 0) + (s.xp_earned || 0);
    typeCounts[s.session_type] = (typeCounts[s.session_type] || 0) + 1;
    totalDuration += s.duration_seconds || 0;
  });

  const mostProductiveDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Monday";
  const mostProductiveTime = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Morning";
  const preferredSessionType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "challenge";
  const averageSessionLength = Math.round(totalDuration / sessions.length);
  const uniqueDays = new Set(sessions.map((s) => s.started_at.split("T")[0])).size;
  const consistencyScore = Math.min(Math.round((uniqueDays / 30) * 100), 100);

  return NextResponse.json({
    mostProductiveDay,
    mostProductiveTime,
    averageSessionLength,
    preferredSessionType,
    consistencyScore,
  });
}

async function startLearningSession(userId: string, data: any) {
  const supabase = getSupabaseAdmin();
  const { data: session, error } = await supabase
    .from("learning_sessions")
    .insert({
      user_id: userId,
      session_type: data.sessionType,
      challenge_slug: data.challengeSlug,
      lesson_slug: data.lessonSlug,
      device_type: data.deviceType,
    })
    .select("id")
    .single();

  if (error) throw error;

  return NextResponse.json({ sessionId: session.id });
}

async function endLearningSession(userId: string, data: any) {
  const { sessionId, challengesCompleted, xpEarned, focusScore } = data;
  const supabase = getSupabaseAdmin();

  // Filter by both id AND user_id to prevent one user from closing another's session.
  const { data: session, error: fetchError } = await supabase
    .from("learning_sessions")
    .select("started_at")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .single();

  if (fetchError) throw fetchError;

  const endedAt = new Date().toISOString();
  const durationSeconds = Math.round(
    (new Date(endedAt).getTime() - new Date(session.started_at).getTime()) / 1000
  );

  const { error } = await supabase
    .from("learning_sessions")
    .update({
      ended_at: endedAt,
      duration_seconds: durationSeconds,
      challenges_completed: challengesCompleted || 0,
      xp_earned: xpEarned || 0,
      focus_score: focusScore,
    })
    .eq("id", sessionId);

  if (error) throw error;

  return NextResponse.json({ success: true });
}

async function updateChallengeAnalytics(userId: string, data: any) {
  const supabase = getSupabaseAdmin();
  const {
    challengeSlug,
    timeSpentSeconds,
    attemptSuccess,
    score,
    codeLines,
    hintsUsed,
    viewedSolution,
  } = data;

  // Check if record exists
  const { data: existing, error: fetchError } = await supabase
    .from("challenge_analytics")
    .select("*")
    .eq("user_id", userId)
    .eq("challenge_slug", challengeSlug)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") throw fetchError;

  if (existing) {
    // Update existing record
    const { error } = await supabase
      .from("challenge_analytics")
      .update({
        last_attempt_at: new Date().toISOString(),
        total_time_spent_seconds: existing.total_time_spent_seconds + timeSpentSeconds,
        attempts_count: existing.attempts_count + 1,
        successful_attempts: existing.successful_attempts + (attemptSuccess ? 1 : 0),
        failed_attempts: existing.failed_attempts + (attemptSuccess ? 0 : 1),
        best_score: score ? Math.max(existing.best_score || 0, score) : existing.best_score,
        code_versions: existing.code_versions + 1,
        lines_of_code_final: codeLines || existing.lines_of_code_final,
        hints_used: existing.hints_used + (hintsUsed || 0),
        solution_viewed: existing.solution_viewed || viewedSolution || false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (error) throw error;
  } else {
    // Insert new record
    const { error } = await supabase
      .from("challenge_analytics")
      .insert({
        user_id: userId,
        challenge_slug: challengeSlug,
        first_attempt_at: new Date().toISOString(),
        last_attempt_at: new Date().toISOString(),
        total_time_spent_seconds: timeSpentSeconds,
        attempts_count: 1,
        successful_attempts: attemptSuccess ? 1 : 0,
        failed_attempts: attemptSuccess ? 0 : 1,
        best_score: score,
        first_attempt_score: score,
        code_versions: 1,
        lines_of_code_final: codeLines,
        hints_used: hintsUsed || 0,
        solution_viewed: viewedSolution || false,
      });

    if (error) throw error;
  }

  return NextResponse.json({ success: true });
}

function getActivityLevel(count: number): number {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
}
