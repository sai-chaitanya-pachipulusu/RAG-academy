/**
 * Mentorship & Peer Matching System
 * 
 * Connects learners with mentors and peers for collaborative learning.
 * Includes skill-based matching, mentorship requests, and session tracking.
 */

import { getSupabase } from "@/lib/supabase/client";

// ============================================
// Types
// ============================================

export type MentorshipStatus = "pending" | "accepted" | "declined" | "completed" | "cancelled";
export type SessionType = "one_on_one" | "group" | "code_review" | "pair_programming";
export type SkillLevel = "beginner" | "intermediate" | "advanced" | "expert";

export interface MentorProfile {
  userId: string;
  username?: string;
  avatarUrl?: string;
  bio?: string;
  
  // Expertise
  skills: string[];
  skillLevel: SkillLevel;
  yearsOfExperience?: number;
  
  // Availability
  isAvailable: boolean;
  maxMentees: number;
  currentMentees: number;
  
  // Stats
  totalSessions: number;
  totalMentees: number;
  rating: number;
  reviewCount: number;
  
  // Preferences
  preferredSessionTypes: SessionType[];
  timezone?: string;
  languages?: string[];
  
  createdAt: string;
}

export interface MentorshipRequest {
  id: string;
  mentorId: string;
  menteeId: string;
  
  // Request details
  message: string;
  goals: string[];
  preferredSessionType: SessionType;
  
  // Status
  status: MentorshipStatus;
  
  // Timestamps
  createdAt: string;
  respondedAt?: string;
  completedAt?: string;
}

export interface MentorshipSession {
  id: string;
  mentorshipId: string;
  
  // Session details
  type: SessionType;
  topic?: string;
  notes?: string;
  
  // Scheduling
  scheduledAt: string;
  durationMinutes?: number;
  
  // Status
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  
  // Feedback
  mentorFeedback?: string;
  menteeFeedback?: string;
  menteeRating?: number;
  
  createdAt: string;
  completedAt?: string;
}

export interface PeerMatch {
  userId: string;
  username?: string;
  avatarUrl?: string;
  
  // Matching criteria
  skillOverlap: string[];
  complementarySkills: string[];
  
  // Compatibility score (0-100)
  compatibilityScore: number;
  
  // Activity
  lastActiveAt?: string;
  challengesCompleted: number;
}

export interface MentorshipReview {
  id: string;
  mentorshipId: string;
  reviewerId: string;
  revieweeId: string;
  
  rating: number;
  feedback: string;
  wouldRecommend: boolean;
  
  createdAt: string;
}

// ============================================
// Mentor Discovery
// ============================================

/**
 * Find available mentors
 */
export async function findMentors(
  skills?: string[],
  limit: number = 20
): Promise<MentorProfile[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  let query = supabase
    .from("mentor_profiles")
    .select(`
      *,
      profiles:user_id (username, avatar_url)
    `)
    .eq("is_available", true)
    .order("rating", { ascending: false });

  if (skills && skills.length > 0) {
    // Filter by skills overlap
    query = query.overlaps("skills", skills);
  }

  const { data, error } = await query.limit(limit);

  if (error) {
    console.error("Error finding mentors:", error);
    return [];
  }

  return (data || []).map(mapMentorProfile);
}

/**
 * Get mentor profile
 */
export async function getMentorProfile(userId: string): Promise<MentorProfile | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("mentor_profiles")
    .select(`
      *,
      profiles:user_id (username, avatar_url)
    `)
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching mentor profile:", error);
    return null;
  }

  return data ? mapMentorProfile(data) : null;
}

/**
 * Register as a mentor
 */
export async function registerAsMentor(
  profile: Omit<MentorProfile, "userId" | "createdAt" | "totalSessions" | "totalMentees" | "rating" | "reviewCount" | "currentMentees">
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: "Not authenticated" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("mentor_profiles")
    .insert({
      user_id: user.id,
      skills: profile.skills,
      skill_level: profile.skillLevel,
      years_of_experience: profile.yearsOfExperience,
      bio: profile.bio,
      max_mentees: profile.maxMentees,
      preferred_session_types: profile.preferredSessionTypes,
      timezone: profile.timezone,
      languages: profile.languages,
    });

  if (error) {
    console.error("Error registering as mentor:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ============================================
// Mentorship Requests
// ============================================

/**
 * Request mentorship
 */
export async function requestMentorship(
  mentorId: string,
  message: string,
  goals: string[],
  preferredSessionType: SessionType
): Promise<{ success: boolean; error?: string; requestId?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: "Not authenticated" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  // Check if mentor is available
  const { data: mentor } = await supabase
    .from("mentor_profiles")
    .select("is_available, current_mentees, max_mentees")
    .eq("user_id", mentorId)
    .single();

  if (!mentor) {
    return { success: false, error: "Mentor not found" };
  }

  if (!mentor.is_available || mentor.current_mentees >= mentor.max_mentees) {
    return { success: false, error: "Mentor is not currently accepting new mentees" };
  }

  // Check for existing pending request
  const { data: existing } = await supabase
    .from("mentorship_requests")
    .select("id")
    .eq("mentor_id", mentorId)
    .eq("mentee_id", user.id)
    .eq("status", "pending")
    .single();

  if (existing) {
    return { success: false, error: "You already have a pending request with this mentor" };
  }

  const { data, error } = await supabase
    .from("mentorship_requests")
    .insert({
      mentor_id: mentorId,
      mentee_id: user.id,
      message,
      goals,
      preferred_session_type: preferredSessionType,
    })
    .select()
    .single();

  if (error) {
    console.error("Error requesting mentorship:", error);
    return { success: false, error: error.message };
  }

  return { success: true, requestId: data.id };
}

/**
 * Respond to mentorship request
 */
export async function respondToMentorshipRequest(
  requestId: string,
  accept: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: "Not authenticated" };

  const status = accept ? "accepted" : "declined";

  const { error } = await supabase
    .from("mentorship_requests")
    .update({
      status,
      responded_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  if (error) {
    console.error("Error responding to request:", error);
    return { success: false, error: error.message };
  }

  // If accepted, increment mentor's current mentees count
  if (accept) {
    await supabase.rpc("increment_mentor_mentees", { mentor_request_id: requestId });
  }

  return { success: true };
}

/**
 * Get my mentorships (as mentor or mentee)
 */
export async function getMyMentorships(): Promise<{
  asMentor: MentorshipRequest[];
  asMentee: MentorshipRequest[];
}> {
  const supabase = getSupabase();
  if (!supabase) return { asMentor: [], asMentee: [] };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { asMentor: [], asMentee: [] };

  const [mentorResult, menteeResult] = await Promise.all([
    supabase
      .from("mentorship_requests")
      .select(`
        *,
        mentee:mentee_id (username, avatar_url)
      `)
      .eq("mentor_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("mentorship_requests")
      .select(`
        *,
        mentor:mentor_id (username, avatar_url)
      `)
      .eq("mentee_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  return {
    asMentor: (mentorResult.data || []).map(mapMentorshipRequest),
    asMentee: (menteeResult.data || []).map(mapMentorshipRequest),
  };
}

// ============================================
// Peer Matching
// ============================================

/**
 * Find peer matches based on skills and activity
 */
export async function findPeerMatches(limit: number = 10): Promise<PeerMatch[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Get user's skills from completed challenges
  const { data: userSkills } = await supabase
    .from("skill_gap_analysis")
    .select("skill_category, skill_name, proficiency_score")
    .eq("user_id", user.id)
    .gte("proficiency_score", 40);

  const skills = userSkills?.map((s: { skill_name: string }) => s.skill_name) || [];

  // Find peers with similar or complementary skills
  const { data, error } = await supabase.rpc("find_peer_matches", {
    p_user_id: user.id,
    p_user_skills: skills,
    p_limit: limit,
  });

  if (error) {
    console.error("Error finding peer matches:", error);
    return [];
  }

  return (data || []).map((match: Record<string, unknown>) => ({
    userId: match.user_id as string,
    username: match.username as string | undefined,
    avatarUrl: match.avatar_url as string | undefined,
    skillOverlap: match.skill_overlap as string[],
    complementarySkills: match.complementary_skills as string[],
    compatibilityScore: match.compatibility_score as number,
    lastActiveAt: match.last_active_at as string | undefined,
    challengesCompleted: match.challenges_completed as number,
  }));
}

// ============================================
// Sessions
// ============================================

/**
 * Schedule a mentorship session
 */
export async function scheduleSession(
  mentorshipId: string,
  type: SessionType,
  scheduledAt: string,
  topic?: string
): Promise<{ success: boolean; error?: string; sessionId?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("mentorship_sessions")
    .insert({
      mentorship_id: mentorshipId,
      type,
      scheduled_at: scheduledAt,
      topic,
    })
    .select()
    .single();

  if (error) {
    console.error("Error scheduling session:", error);
    return { success: false, error: error.message };
  }

  return { success: true, sessionId: data.id };
}

/**
 * Get sessions for a mentorship
 */
export async function getMentorshipSessions(mentorshipId: string): Promise<MentorshipSession[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("mentorship_sessions")
    .select("*")
    .eq("mentorship_id", mentorshipId)
    .order("scheduled_at", { ascending: false });

  if (error) {
    console.error("Error fetching sessions:", error);
    return [];
  }

  return (data || []).map(mapMentorshipSession);
}

/**
 * Complete a session and add feedback
 */
export async function completeSession(
  sessionId: string,
  feedback: {
    notes?: string;
    mentorFeedback?: string;
    menteeFeedback?: string;
    menteeRating?: number;
    durationMinutes?: number;
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("mentorship_sessions")
    .update({
      status: "completed",
      notes: feedback.notes,
      mentor_feedback: feedback.mentorFeedback,
      mentee_feedback: feedback.menteeFeedback,
      mentee_rating: feedback.menteeRating,
      duration_minutes: feedback.durationMinutes,
      completed_at: new Date().toISOString(),
    })
    .eq("id", sessionId);

  if (error) {
    console.error("Error completing session:", error);
    return { success: false, error: error.message };
  }

  // Update mentor stats
  await supabase.rpc("update_mentor_stats", { p_session_id: sessionId });

  return { success: true };
}

// ============================================
// Reviews
// ============================================

/**
 * Submit a review for mentorship
 */
export async function submitReview(
  mentorshipId: string,
  rating: number,
  feedback: string,
  wouldRecommend: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: "Not authenticated" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  // Get mentorship details to determine reviewer/reviewee
  const { data: mentorship } = await supabase
    .from("mentorship_requests")
    .select("mentor_id, mentee_id")
    .eq("id", mentorshipId)
    .single();

  if (!mentorship) {
    return { success: false, error: "Mentorship not found" };
  }

  const revieweeId = user.id === mentorship.mentor_id 
    ? mentorship.mentee_id 
    : mentorship.mentor_id;

  const { error } = await supabase
    .from("mentorship_reviews")
    .insert({
      mentorship_id: mentorshipId,
      reviewer_id: user.id,
      reviewee_id: revieweeId,
      rating,
      feedback,
      would_recommend: wouldRecommend,
    });

  if (error) {
    console.error("Error submitting review:", error);
    return { success: false, error: error.message };
  }

  // Update mentor rating
  if (revieweeId === mentorship.mentor_id) {
    await supabase.rpc("update_mentor_rating", { p_mentor_id: revieweeId });
  }

  return { success: true };
}

// ============================================
// Data Mappers
// ============================================

function mapMentorProfile(data: Record<string, unknown>): MentorProfile {
  return {
    userId: data.user_id as string,
    username: (data.profiles as Record<string, unknown>)?.username as string | undefined,
    avatarUrl: (data.profiles as Record<string, unknown>)?.avatar_url as string | undefined,
    bio: data.bio as string | undefined,
    skills: data.skills as string[],
    skillLevel: data.skill_level as SkillLevel,
    yearsOfExperience: data.years_of_experience as number | undefined,
    isAvailable: data.is_available as boolean,
    maxMentees: data.max_mentees as number,
    currentMentees: data.current_mentees as number,
    totalSessions: data.total_sessions as number,
    totalMentees: data.total_mentees as number,
    rating: data.rating as number,
    reviewCount: data.review_count as number,
    preferredSessionTypes: data.preferred_session_types as SessionType[],
    timezone: data.timezone as string | undefined,
    languages: data.languages as string[] | undefined,
    createdAt: data.created_at as string,
  };
}

function mapMentorshipRequest(data: Record<string, unknown>): MentorshipRequest {
  const otherUser = (data.mentee || data.mentor) as Record<string, unknown> | undefined;
  
  return {
    id: data.id as string,
    mentorId: data.mentor_id as string,
    menteeId: data.mentee_id as string,
    message: data.message as string,
    goals: data.goals as string[],
    preferredSessionType: data.preferred_session_type as SessionType,
    status: data.status as MentorshipStatus,
    createdAt: data.created_at as string,
    respondedAt: data.responded_at as string | undefined,
    completedAt: data.completed_at as string | undefined,
  };
}

function mapMentorshipSession(data: Record<string, unknown>): MentorshipSession {
  return {
    id: data.id as string,
    mentorshipId: data.mentorship_id as string,
    type: data.type as SessionType,
    topic: data.topic as string | undefined,
    notes: data.notes as string | undefined,
    scheduledAt: data.scheduled_at as string,
    durationMinutes: data.duration_minutes as number | undefined,
    status: data.status as MentorshipSession["status"],
    mentorFeedback: data.mentor_feedback as string | undefined,
    menteeFeedback: data.mentee_feedback as string | undefined,
    menteeRating: data.mentee_rating as number | undefined,
    createdAt: data.created_at as string,
    completedAt: data.completed_at as string | undefined,
  };
}

// ============================================
// Utility Functions
// ============================================

/**
 * Get skill level label
 */
export function getSkillLevelLabel(level: SkillLevel): string {
  const labels: Record<SkillLevel, string> = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    expert: "Expert",
  };
  return labels[level];
}

/**
 * Get session type label
 */
export function getSessionTypeLabel(type: SessionType): string {
  const labels: Record<SessionType, string> = {
    one_on_one: "1-on-1 Mentorship",
    group: "Group Session",
    code_review: "Code Review",
    pair_programming: "Pair Programming",
  };
  return labels[type];
}

/**
 * Format rating with stars
 */
export function formatRating(rating: number): string {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return "★".repeat(fullStars) + (hasHalfStar ? "½" : "") + "☆".repeat(emptyStars);
}

/**
 * Check if user can request mentorship
 */
export function canRequestMentorship(mentor: MentorProfile): { can: boolean; reason?: string } {
  if (!mentor.isAvailable) {
    return { can: false, reason: "Mentor is not currently available" };
  }
  
  if (mentor.currentMentees >= mentor.maxMentees) {
    return { can: false, reason: "Mentor has reached their maximum number of mentees" };
  }
  
  return { can: true };
}
