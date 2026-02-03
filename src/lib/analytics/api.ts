/**
 * Analytics API client for RAG Academy
 * Handles all analytics data fetching and submission
 */

import { getSupabase } from "@/lib/supabase/client";
import type {
  AnalyticsDashboardSummary,
  ChallengeAnalytics,
  DailyLearningStats,
  LearningSession,
  PeerComparison,
  SkillGap,
  SkillCategorySummary,
  TimePerChallenge,
  ActivityHeatmapData,
  StudyPattern,
  GetAnalyticsSummaryRequest,
  GetTimePerChallengeRequest,
  GetSkillGapsRequest,
  RecordSessionRequest,
  UpdateChallengeAnalyticsRequest,
} from "./types";
import { getAllChallenges, getChallengeBySlug } from "@/lib/challenges/catalog";

// ============================================
// Dashboard Summary
// ============================================

export async function getAnalyticsSummary(
  request: GetAnalyticsSummaryRequest
): Promise<AnalyticsDashboardSummary | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    // Fetch challenge analytics
    const { data: challengeAnalytics, error: analyticsError } = await supabase
      .from("challenge_analytics")
      .select("*")
      .eq("user_id", request.userId);

    if (analyticsError) throw analyticsError;

    // Fetch daily stats
    const { data: dailyStats, error: statsError } = await supabase
      .from("daily_learning_stats")
      .select("*")
      .eq("user_id", request.userId)
      .order("date", { ascending: false })
      .limit(30);

    if (statsError) throw statsError;

    // Fetch skill gaps
    const { data: skillGaps, error: gapsError } = await supabase
      .from("skill_gap_analysis")
      .select("*")
      .eq("user_id", request.userId);

    if (gapsError) throw gapsError;

    // Fetch peer comparison
    const { data: peerComp, error: peerError } = await supabase
      .from("peer_comparison")
      .select("*")
      .eq("user_id", request.userId)
      .order("calculated_at", { ascending: false })
      .limit(1)
      .single();

    // Calculate summary metrics
    const totalCompleted = challengeAnalytics?.filter(
      (c: { completed_at: string | null }) => c.completed_at !== null
    ).length || 0;
    
    const totalAttempted = challengeAnalytics?.length || 0;
    const totalTimeSpent = challengeAnalytics?.reduce(
      (sum: number, c: { total_time_spent_seconds: number }) => sum + (c.total_time_spent_seconds || 0), 0
    ) || 0;
    
    const totalXP = dailyStats?.reduce((sum: number, d: { xp_earned: number }) => sum + (d.xp_earned || 0), 0) || 0;

    // Calculate last 7 days activity
    const last7Days = dailyStats?.slice(0, 7) || [];
    const weeklyProgress = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split("T")[0];
      const dayStat = dailyStats?.find((d: { date: string }) => d.date === dateStr);
      return dayStat ? dayStat.challenges_completed : 0;
    });

    // Calculate streak
    let currentStreak = 0;
    for (const day of dailyStats || []) {
      if (day.streak_day) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Build skill categories
    const skillCategories = buildSkillCategories(skillGaps || []);

    // Find fastest and slowest challenges
    const challengesWithTime: TimePerChallenge[] = challengeAnalytics
      ?.filter((c: { completed_at: string | null; total_time_spent_seconds: number }) => 
        c.completed_at && c.total_time_spent_seconds > 0
      )
      .map((c: { 
        challenge_slug: string; 
        total_time_spent_seconds: number; 
        attempts_count: number;
        completed_at: string | null;
      }) => {
        const challenge = getChallengeBySlug(c.challenge_slug);
        return {
          challengeSlug: c.challenge_slug,
          challengeTitle: challenge?.title || c.challenge_slug,
          totalTimeSpentSeconds: c.total_time_spent_seconds,
          formattedTime: formatDuration(c.total_time_spent_seconds),
          attemptsCount: c.attempts_count,
          averageTimePerAttempt: Math.round(c.total_time_spent_seconds / (c.attempts_count || 1)),
          completed: true,
          difficulty: (challenge?.difficulty || 'medium') as 'easy' | 'medium' | 'hard',
          category: challenge?.group || 'General',
        };
      })
      .sort((a: TimePerChallenge, b: TimePerChallenge) => a.totalTimeSpentSeconds - b.totalTimeSpentSeconds) || [];

    return {
      totalChallengesAttempted: totalAttempted,
      totalChallengesCompleted: totalCompleted,
      totalTimeSpentSeconds: totalTimeSpent,
      totalXPEarned: totalXP,
      completionRate: totalAttempted > 0 ? Math.round((totalCompleted / totalAttempted) * 100) : 0,
      
      averageTimePerChallenge: totalAttempted > 0 
        ? Math.round(totalTimeSpent / totalAttempted) 
        : 0,
      fastestChallenge: challengesWithTime[0],
      slowestChallenge: challengesWithTime[challengesWithTime.length - 1],
      totalStudyHours: Math.round(totalTimeSpent / 3600 * 10) / 10,
      
      skillCategories,
      criticalGaps: (skillGaps || [])
        .filter((g: { gap_severity: string }) => 
          g.gap_severity === 'moderate' || g.gap_severity === 'severe'
        )
        .map(mapSkillGap),
      
      last7Days: (dailyStats || []).slice(0, 7).map(mapDailyStats),
      currentStreak,
      longestStreak: calculateLongestStreak(dailyStats || []),
      
      peerComparison: peerComp ? mapPeerComparison(peerComp) : undefined,
      
      weeklyProgress,
      monthlyTrend: (dailyStats || []).slice(0, 30).map((d: { 
        date: string; 
        challenges_completed: number; 
        xp_earned: number;
      }) => ({
        date: d.date,
        challengesCompleted: d.challenges_completed,
        xpEarned: d.xp_earned,
      })).reverse(),
    };
  } catch (error) {
    console.error("Error fetching analytics summary:", error);
    return null;
  }
}

// ============================================
// Time Per Challenge
// ============================================

export async function getTimePerChallenge(
  request: GetTimePerChallengeRequest
): Promise<TimePerChallenge[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("challenge_analytics")
      .select("*")
      .eq("user_id", request.userId)
      .order("total_time_spent_seconds", { ascending: false });

    if (error) throw error;

    const challenges = getAllChallenges();
    
    return (data || []).map((item: {
      challenge_slug: string;
      total_time_spent_seconds: number;
      attempts_count: number;
      completed_at: string | null;
    }) => {
      const challenge = challenges.find((c) => c.slug === item.challenge_slug);
      return {
        challengeSlug: item.challenge_slug,
        challengeTitle: challenge?.title || item.challenge_slug,
        totalTimeSpentSeconds: item.total_time_spent_seconds,
        formattedTime: formatDuration(item.total_time_spent_seconds),
        attemptsCount: item.attempts_count,
        averageTimePerAttempt: Math.round(
          item.total_time_spent_seconds / (item.attempts_count || 1)
        ),
        completed: item.completed_at !== null,
        difficulty: (challenge?.difficulty || 'medium') as 'easy' | 'medium' | 'hard',
        category: challenge?.group || 'General',
      };
    });
  } catch (error) {
    console.error("Error fetching time per challenge:", error);
    return [];
  }
}

// ============================================
// Skill Gaps
// ============================================

export async function getSkillGaps(
  request: GetSkillGapsRequest
): Promise<SkillGap[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  try {
    let query = supabase
      .from("skill_gap_analysis")
      .select("*")
      .eq("user_id", request.userId);

    if (request.severity && request.severity !== 'all') {
      query = query.eq("gap_severity", request.severity);
    }

    const { data, error } = await query.order("proficiency_score", { ascending: true });

    if (error) throw error;

    return (data || []).map(mapSkillGap);
  } catch (error) {
    console.error("Error fetching skill gaps:", error);
    return [];
  }
}

// ============================================
// Activity Heatmap
// ============================================

export async function getActivityHeatmap(
  userId: string,
  days: number = 365
): Promise<ActivityHeatmapData[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  try {
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
    const result: ActivityHeatmapData[] = [];
    const dataMap = new Map((data || []).map((d: { date: string; challenges_completed: number }) =>
      [d.date, d.challenges_completed]
    ));

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const count = (dataMap.get(dateStr) as number) || 0;
      
      result.push({
        date: dateStr,
        count: count,
        level: getActivityLevel(count),
      });
    }

    return result;
  } catch (error) {
    console.error("Error fetching activity heatmap:", error);
    return [];
  }
}

// ============================================
// Study Patterns
// ============================================

export async function getStudyPatterns(userId: string): Promise<StudyPattern | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data: sessions, error } = await supabase
      .from("learning_sessions")
      .select("*")
      .eq("user_id", userId)
      .not("ended_at", "is", null)
      .order("started_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    if (!sessions || sessions.length === 0) {
      return null;
    }

    // Calculate most productive day
    const dayCounts: Record<string, number> = {};
    sessions.forEach((s: { started_at: string; xp_earned: number }) => {
      const day = new Date(s.started_at).toLocaleDateString("en-US", { weekday: "long" });
      dayCounts[day] = (dayCounts[day] || 0) + (s.xp_earned || 0);
    });
    const mostProductiveDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Monday";

    // Calculate most productive time
    const hourCounts: Record<string, number> = {};
    sessions.forEach((s: { started_at: string; xp_earned: number }) => {
      const hour = new Date(s.started_at).getHours();
      const timeSlot = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening";
      hourCounts[timeSlot] = (hourCounts[timeSlot] || 0) + (s.xp_earned || 0);
    });
    const mostProductiveTime = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Morning";

    // Calculate average session length
    const totalDuration = sessions.reduce((sum: number, s: { duration_seconds: number }) => 
      sum + (s.duration_seconds || 0), 0
    );
    const averageSessionLength = Math.round(totalDuration / sessions.length);

    // Find preferred session type
    const typeCounts: Record<string, number> = {};
    sessions.forEach((s: { session_type: string }) => {
      typeCounts[s.session_type] = (typeCounts[s.session_type] || 0) + 1;
    });
    const preferredSessionType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "challenge";

    // Calculate consistency score (days with activity in last 30 days)
    const uniqueDays = new Set(sessions.map((s: { started_at: string }) => 
      s.started_at.split("T")[0]
    )).size;
    const consistencyScore = Math.round((uniqueDays / 30) * 100);

    return {
      mostProductiveDay,
      mostProductiveTime,
      averageSessionLength,
      preferredSessionType,
      consistencyScore: Math.min(consistencyScore, 100),
    };
  } catch (error) {
    console.error("Error fetching study patterns:", error);
    return null;
  }
}

// ============================================
// Recording Functions
// ============================================

export async function startLearningSession(
  request: RecordSessionRequest
): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("learning_sessions")
      .insert({
        user_id: request.userId,
        session_type: request.sessionType,
        challenge_slug: request.challengeSlug,
        lesson_slug: request.lessonSlug,
        device_type: request.deviceType,
      })
      .select("id")
      .single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error("Error starting learning session:", error);
    return null;
  }
}

export async function endLearningSession(
  sessionId: string,
  updates: {
    challengesCompleted?: number;
    xpEarned?: number;
    focusScore?: number;
  }
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { data: session, error: fetchError } = await supabase
      .from("learning_sessions")
      .select("started_at")
      .eq("id", sessionId)
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
        challenges_completed: updates.challengesCompleted || 0,
        xp_earned: updates.xpEarned || 0,
        focus_score: updates.focusScore,
      })
      .eq("id", sessionId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error ending learning session:", error);
    return false;
  }
}

export async function updateChallengeAnalytics(
  request: UpdateChallengeAnalyticsRequest
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    // Check if record exists
    const { data: existing, error: fetchError } = await supabase
      .from("challenge_analytics")
      .select("*")
      .eq("user_id", request.userId)
      .eq("challenge_slug", request.challengeSlug)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") throw fetchError;

    if (existing) {
      // Update existing record
      const { error } = await supabase
        .from("challenge_analytics")
        .update({
          last_attempt_at: new Date().toISOString(),
          total_time_spent_seconds: existing.total_time_spent_seconds + request.timeSpentSeconds,
          attempts_count: existing.attempts_count + 1,
          successful_attempts: existing.successful_attempts + (request.attemptSuccess ? 1 : 0),
          failed_attempts: existing.failed_attempts + (request.attemptSuccess ? 0 : 1),
          best_score: request.score ? Math.max(existing.best_score || 0, request.score) : existing.best_score,
          code_versions: existing.code_versions + 1,
          lines_of_code_final: request.codeLines || existing.lines_of_code_final,
          hints_used: existing.hints_used + (request.hintsUsed || 0),
          solution_viewed: existing.solution_viewed || request.viewedSolution || false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (error) throw error;
    } else {
      // Insert new record
      const { error } = await supabase
        .from("challenge_analytics")
        .insert({
          user_id: request.userId,
          challenge_slug: request.challengeSlug,
          first_attempt_at: new Date().toISOString(),
          last_attempt_at: new Date().toISOString(),
          total_time_spent_seconds: request.timeSpentSeconds,
          attempts_count: 1,
          successful_attempts: request.attemptSuccess ? 1 : 0,
          failed_attempts: request.attemptSuccess ? 0 : 1,
          best_score: request.score,
          first_attempt_score: request.score,
          code_versions: 1,
          lines_of_code_final: request.codeLines,
          hints_used: request.hintsUsed || 0,
          solution_viewed: request.viewedSolution || false,
        });

      if (error) throw error;
    }

    return true;
  } catch (error) {
    console.error("Error updating challenge analytics:", error);
    return false;
  }
}

// ============================================
// Helper Functions
// ============================================

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

function getActivityLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
}

function calculateLongestStreak(dailyStats: any[]): number {
  let longest = 0;
  let current = 0;
  
  for (const day of dailyStats) {
    if (day.streak_day) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }
  
  return longest;
}

function buildSkillCategories(skillGaps: any[]): SkillCategorySummary[] {
  const categories: Record<string, SkillCategorySummary> = {};
  
  const categoryInfo: Record<string, { displayName: string; icon: string }> = {
    vector_math: { displayName: "Vector Math", icon: "📐" },
    chunking: { displayName: "Chunking", icon: "✂️" },
    retrieval: { displayName: "Retrieval", icon: "🔍" },
    reranking: { displayName: "Reranking", icon: "📊" },
    evaluation: { displayName: "Evaluation", icon: "✅" },
    generation: { displayName: "Generation", icon: "📝" },
    agentic: { displayName: "Agentic RAG", icon: "🤖" },
    security: { displayName: "Security", icon: "🔒" },
    optimization: { displayName: "Optimization", icon: "⚡" },
    general: { displayName: "General", icon: "📚" },
  };

  for (const gap of skillGaps) {
    const cat = gap.skill_category;
    if (!categories[cat]) {
      const info = categoryInfo[cat] || { displayName: cat, icon: "📚" };
      categories[cat] = {
        category: cat,
        displayName: info.displayName,
        icon: info.icon,
        proficiencyScore: 0,
        totalChallenges: 0,
        completedChallenges: 0,
        gapSeverity: 'none',
        recommendedFocus: [],
      };
    }
    
    categories[cat].proficiencyScore += gap.proficiency_score;
    categories[cat].totalChallenges += gap.challenges_attempted;
    categories[cat].completedChallenges += gap.challenges_completed;
    
    if (gap.gap_severity !== 'none') {
      categories[cat].recommendedFocus.push(gap.skill_name);
    }
  }

  // Calculate averages and severity
  for (const cat of Object.values(categories)) {
    const count = skillGaps.filter((g) => g.skill_category === cat.category).length;
    if (count > 0) {
      cat.proficiencyScore = Math.round(cat.proficiencyScore / count);
    }
    
    if (cat.proficiencyScore >= 80) cat.gapSeverity = 'none';
    else if (cat.proficiencyScore >= 60) cat.gapSeverity = 'minor';
    else if (cat.proficiencyScore >= 40) cat.gapSeverity = 'moderate';
    else cat.gapSeverity = 'severe';
  }

  return Object.values(categories);
}

function mapSkillGap(data: any): SkillGap {
  return {
    id: data.id,
    userId: data.user_id,
    skillCategory: data.skill_category,
    skillName: data.skill_name,
    proficiencyScore: data.proficiency_score,
    challengesAttempted: data.challenges_attempted,
    challengesCompleted: data.challenges_completed,
    averageAttemptsPerChallenge: data.average_attempts_per_challenge,
    averageTimePerChallenge: data.average_time_per_challenge,
    gapSeverity: data.gap_severity,
    recommendedChallenges: data.recommended_challenges || [],
    peerPercentile: data.peer_percentile,
    calculatedAt: data.calculated_at,
  };
}

function mapDailyStats(data: any): DailyLearningStats {
  return {
    id: data.id,
    userId: data.user_id,
    date: data.date,
    challengesAttempted: data.challenges_attempted,
    challengesCompleted: data.challenges_completed,
    lessonsCompleted: data.lessons_completed,
    totalStudyTimeSeconds: data.total_study_time_seconds,
    longestSessionSeconds: data.longest_session_seconds,
    xpEarned: data.xp_earned,
    streakDay: data.streak_day,
    averageScore: data.average_score,
    skillsPracticed: data.skills_practiced || [],
  };
}

function mapPeerComparison(data: any): PeerComparison {
  return {
    id: data.id,
    userId: data.user_id,
    periodStart: data.period_start,
    periodEnd: data.period_end,
    userChallengesCompleted: data.user_challenges_completed,
    userTotalTimeSeconds: data.user_total_time_seconds,
    userAverageScore: data.user_average_score,
    peerGroupSize: data.peer_group_size,
    peerMedianChallenges: data.peer_median_challenges,
    peerMedianTimeSeconds: data.peer_median_time_seconds,
    peerMedianScore: data.peer_median_score,
    challengesPercentile: data.challenges_percentile,
    timePercentile: data.time_percentile,
    scorePercentile: data.score_percentile,
  };
}
