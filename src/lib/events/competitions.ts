/**
 * Live Events & Competitions System
 * 
 * Manages weekly challenges, coding competitions, hackathons,
 * and special events with leaderboards and rewards.
 */

import { getSupabase } from "@/lib/supabase/client";

// ============================================
// Types
// ============================================

export type CompetitionType = 
  | "weekly_challenge"
  | "hackathon"
  | "speed_run"
  | "tournament"
  | "community_event";

export type CompetitionStatus = "upcoming" | "active" | "completed" | "cancelled";

export interface Competition {
  id: string;
  type: CompetitionType;
  title: string;
  description: string;
  challengeSlugs: string[];
  
  // Timing
  startDate: string;
  endDate: string;
  registrationDeadline?: string;
  
  // Status
  status: CompetitionStatus;
  
  // Scoring
  scoringType: "completion_time" | "total_score" | "challenge_count" | "custom";
  scoringConfig?: Record<string, unknown>;
  
  // Rewards
  xpBonus: number;
  badgeId?: string;
  prizes?: CompetitionPrize[];
  
  // Display
  bannerUrl?: string;
  themeColor?: string;
  icon?: string;
  
  // Metadata
  createdAt: string;
  createdBy?: string;
  maxParticipants?: number;
  isPublic: boolean;
}

export interface CompetitionPrize {
  rank: number;
  label: string;
  xpReward: number;
  badgeId?: string;
  description?: string;
}

export interface CompetitionParticipant {
  id: string;
  competitionId: string;
  userId: string;
  registeredAt: string;
  
  // Progress
  challengesCompleted: string[];
  totalScore: number;
  bestTimeSeconds?: number;
  lastSubmissionAt?: string;
  
  // Final ranking
  finalRank?: number;
  prizesWon?: string[];
}

export interface CompetitionLeaderboardEntry {
  rank: number;
  userId: string;
  username?: string;
  avatarUrl?: string;
  
  // Stats
  score: number;
  challengesCompleted: number;
  bestTimeSeconds?: number;
  lastSubmissionAt?: string;
  
  // Tiebreaker
  tiebreakerScore?: number;
}

export interface CompetitionResult {
  competition: Competition;
  leaderboard: CompetitionLeaderboardEntry[];
  userRank?: number;
  userScore?: number;
  totalParticipants: number;
}

export interface WeeklyEvent {
  weekStart: string;
  weekEnd: string;
  featuredChallengeSlug: string;
  challengeTitle: string;
  xpBonus: number;
  badgeId?: string;
  theme: string;
  description: string;
}

// ============================================
// Competition Management
// ============================================

/**
 * Get active and upcoming competitions
 */
export async function getActiveCompetitions(): Promise<Competition[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("competitions")
    .select("*")
    .in("status", ["upcoming", "active"])
    .order("start_date", { ascending: true });

  if (error) {
    console.error("Error fetching competitions:", error);
    return [];
  }

  return (data || []).map(mapCompetition);
}

/**
 * Get competition by ID
 */
export async function getCompetition(competitionId: string): Promise<Competition | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("competitions")
    .select("*")
    .eq("id", competitionId)
    .single();

  if (error) {
    console.error("Error fetching competition:", error);
    return null;
  }

  return data ? mapCompetition(data) : null;
}

/**
 * Register for a competition
 */
export async function registerForCompetition(
  competitionId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: "Not authenticated" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  // Check if competition exists and is open
  const { data: competition } = await supabase
    .from("competitions")
    .select("status, max_participants, registration_deadline")
    .eq("id", competitionId)
    .single();

  if (!competition) {
    return { success: false, error: "Competition not found" };
  }

  if (competition.status !== "upcoming" && competition.status !== "active") {
    return { success: false, error: "Registration is closed" };
  }

  if (competition.registration_deadline && new Date(competition.registration_deadline) < new Date()) {
    return { success: false, error: "Registration deadline has passed" };
  }

  // Check participant limit
  if (competition.max_participants) {
    const { count } = await supabase
      .from("competition_participants")
      .select("*", { count: "exact" })
      .eq("competition_id", competitionId);

    if (count && count >= competition.max_participants) {
      return { success: false, error: "Competition is full" };
    }
  }

  // Register
  const { error } = await supabase
    .from("competition_participants")
    .insert({
      competition_id: competitionId,
      user_id: user.id,
    });

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "Already registered" };
    }
    console.error("Error registering for competition:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Submit competition result
 */
export async function submitCompetitionResult(
  competitionId: string,
  challengeSlug: string,
  score: number,
  timeSeconds?: number
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: "Not authenticated" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  // Get current participant record
  const { data: participant } = await supabase
    .from("competition_participants")
    .select("*")
    .eq("competition_id", competitionId)
    .eq("user_id", user.id)
    .single();

  if (!participant) {
    return { success: false, error: "Not registered for this competition" };
  }

  // Update participant record
  const challengesCompleted = [...(participant.challenges_completed || []), challengeSlug];
  const uniqueChallenges = [...new Set(challengesCompleted)];
  
  const updates: Record<string, unknown> = {
    challenges_completed: uniqueChallenges,
    total_score: (participant.total_score || 0) + score,
    last_submission_at: new Date().toISOString(),
  };

  if (timeSeconds) {
    const currentBest = participant.best_time_seconds;
    if (!currentBest || timeSeconds < currentBest) {
      updates.best_time_seconds = timeSeconds;
    }
  }

  const { error } = await supabase
    .from("competition_participants")
    .update(updates)
    .eq("id", participant.id);

  if (error) {
    console.error("Error submitting result:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Get competition leaderboard
 */
export async function getCompetitionLeaderboard(
  competitionId: string,
  limit: number = 100
): Promise<CompetitionLeaderboardEntry[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  // Get competition for scoring type
  const { data: competition } = await supabase
    .from("competitions")
    .select("scoring_type, scoring_config")
    .eq("id", competitionId)
    .single();

  if (!competition) return [];

  // Get participants with user info
  const { data, error } = await supabase
    .from("competition_participants")
    .select(`
      *,
      profiles:user_id (username, avatar_url)
    `)
    .eq("competition_id", competitionId)
    .order("total_score", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }

  // Calculate ranks based on scoring type
  const entries: CompetitionLeaderboardEntry[] = (data || []).map((p: Record<string, unknown>, index: number) => {
    const profiles = p.profiles as Record<string, unknown> | undefined;
    const challengesCompleted = p.challenges_completed as string[] | undefined;
    return {
      rank: index + 1,
      userId: p.user_id as string,
      username: profiles?.username as string | undefined,
      avatarUrl: profiles?.avatar_url as string | undefined,
      score: (p.total_score as number) || 0,
      challengesCompleted: challengesCompleted?.length || 0,
      bestTimeSeconds: p.best_time_seconds as number | undefined,
      lastSubmissionAt: p.last_submission_at as string | undefined,
    };
  });

  // Re-sort based on scoring type
  switch (competition.scoring_type) {
    case "completion_time":
      // Lower time is better
      entries.sort((a, b) => (a.bestTimeSeconds || Infinity) - (b.bestTimeSeconds || Infinity));
      break;
    case "challenge_count":
      // More challenges is better, tiebreaker by time
      entries.sort((a, b) => {
        if (b.challengesCompleted !== a.challengesCompleted) {
          return b.challengesCompleted - a.challengesCompleted;
        }
        return (a.bestTimeSeconds || Infinity) - (b.bestTimeSeconds || Infinity);
      });
      break;
    case "total_score":
    default:
      // Higher score is better (already sorted)
      break;
  }

  // Re-assign ranks after sorting
  entries.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  return entries;
}

/**
 * Get user's competition results
 */
export async function getUserCompetitionResults(
  competitionId: string
): Promise<{ rank?: number; score: number; challengesCompleted: number } | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("competition_participants")
    .select("total_score, challenges_completed, final_rank")
    .eq("competition_id", competitionId)
    .eq("user_id", user.id)
    .single();

  if (error || !data) return null;

  return {
    rank: data.final_rank,
    score: data.total_score || 0,
    challengesCompleted: (data.challenges_completed || []).length,
  };
}

// ============================================
// Weekly Events
// ============================================

/**
 * Get current weekly event
 */
export async function getCurrentWeeklyEvent(): Promise<WeeklyEvent | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from("weekly_events")
    .select("*")
    .lte("week_start", now)
    .gte("week_end", now)
    .single();

  if (error) {
    // No current event is not an error
    if (error.code === "PGRST116") return null;
    console.error("Error fetching weekly event:", error);
    return null;
  }

  return data ? mapWeeklyEvent(data) : null;
}

/**
 * Get upcoming weekly events
 */
export async function getUpcomingWeeklyEvents(limit: number = 4): Promise<WeeklyEvent[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from("weekly_events")
    .select("*")
    .gt("week_start", now)
    .order("week_start", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Error fetching upcoming events:", error);
    return [];
  }

  return (data || []).map(mapWeeklyEvent);
}

/**
 * Get past weekly events
 */
export async function getPastWeeklyEvents(limit: number = 10): Promise<WeeklyEvent[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from("weekly_events")
    .select("*")
    .lt("week_end", now)
    .order("week_end", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching past events:", error);
    return [];
  }

  return (data || []).map(mapWeeklyEvent);
}

// ============================================
// Event Notifications
// ============================================

export interface EventNotification {
  id: string;
  type: "competition_start" | "competition_end" | "weekly_event" | "prize_awarded";
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  createdAt: string;
  read: boolean;
}

/**
 * Get event notifications for user
 */
export async function getEventNotifications(): Promise<EventNotification[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("event_notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }

  return (data || []).map((n: Record<string, unknown>) => ({
    id: n.id as string,
    type: n.type as EventNotification["type"],
    title: n.title as string,
    message: n.message as string,
    actionUrl: n.action_url as string | undefined,
    actionLabel: n.action_label as string | undefined,
    createdAt: n.created_at as string,
    read: n.read as boolean,
  }));
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  await supabase
    .from("event_notifications")
    .update({ read: true })
    .eq("id", notificationId);
}

// ============================================
// Data Mappers
// ============================================

function mapCompetition(data: Record<string, unknown>): Competition {
  return {
    id: data.id as string,
    type: data.type as CompetitionType,
    title: data.title as string,
    description: data.description as string,
    challengeSlugs: data.challenge_slugs as string[],
    startDate: data.start_date as string,
    endDate: data.end_date as string,
    registrationDeadline: data.registration_deadline as string | undefined,
    status: data.status as CompetitionStatus,
    scoringType: data.scoring_type as Competition["scoringType"],
    scoringConfig: data.scoring_config as Record<string, unknown> | undefined,
    xpBonus: data.xp_bonus as number,
    badgeId: data.badge_id as string | undefined,
    prizes: data.prizes as CompetitionPrize[] | undefined,
    bannerUrl: data.banner_url as string | undefined,
    themeColor: data.theme_color as string | undefined,
    icon: data.icon as string | undefined,
    createdAt: data.created_at as string,
    createdBy: data.created_by as string | undefined,
    maxParticipants: data.max_participants as number | undefined,
    isPublic: data.is_public as boolean,
  };
}

function mapWeeklyEvent(data: Record<string, unknown>): WeeklyEvent {
  return {
    weekStart: data.week_start as string,
    weekEnd: data.week_end as string,
    featuredChallengeSlug: data.featured_challenge_slug as string,
    challengeTitle: data.challenge_title as string,
    xpBonus: data.xp_bonus as number,
    badgeId: data.badge_id as string | undefined,
    theme: data.theme as string,
    description: data.description as string,
  };
}

// ============================================
// Utility Functions
// ============================================

/**
 * Format time duration for display
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

/**
 * Get time remaining until event
 */
export function getTimeUntil(date: string): { days: number; hours: number; minutes: number } {
  const now = new Date();
  const target = new Date(date);
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0 };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes };
}

/**
 * Check if user can register for competition
 */
export function canRegister(competition: Competition): { can: boolean; reason?: string } {
  const now = new Date();
  const startDate = new Date(competition.startDate);
  const endDate = new Date(competition.endDate);

  if (competition.status === "completed") {
    return { can: false, reason: "Competition has ended" };
  }

  if (competition.status === "cancelled") {
    return { can: false, reason: "Competition was cancelled" };
  }

  if (competition.registrationDeadline && now > new Date(competition.registrationDeadline)) {
    return { can: false, reason: "Registration deadline has passed" };
  }

  if (now > endDate) {
    return { can: false, reason: "Competition has ended" };
  }

  return { can: true };
}
