/**
 * Project Progress Service
 * 
 * Tracks and calculates progress for project tracks.
 * Each track consists of multiple challenges. Progress is calculated
 * by checking user_progress for each challenge's completion status.
 */

import { createClient } from "@supabase/supabase-js";

export interface TrackProgress {
  trackId: string;
  trackTitle: string;
  totalChallenges: number;
  completedChallenges: number;
  progressPercent: number;
  completedSlugs: string[];
  isComplete: boolean;
  startedAt?: string;
  completedAt?: string;
}

export interface ProjectCertificate {
  id: string;
  userId: string;
  trackId: string;
  trackTitle: string;
  completedAt: string;
  certificateUrl: string;
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key);
}

/**
 * Get progress for a single track
 */
export async function getTrackProgress(
  userId: string,
  trackId: string,
  challengeSlugs: string[]
): Promise<TrackProgress> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return {
      trackId,
      trackTitle: "",
      totalChallenges: challengeSlugs.length,
      completedChallenges: 0,
      progressPercent: 0,
      completedSlugs: [],
      isComplete: false,
    };
  }

  // Get completion status for all challenges in this track
  const { data: progress } = await supabase
    .from("challenge_progress")
    .select("challenge_slug, status, completed_at")
    .eq("user_id", userId)
    .in("challenge_slug", challengeSlugs);

  const completedSlugs = progress
    ?.filter((p) => p.status === "completed")
    .map((p) => p.challenge_slug) ?? [];

  const completedChallenges = completedSlugs.length;
  const totalChallenges = challengeSlugs.length;
  const progressPercent = totalChallenges > 0 
    ? Math.round((completedChallenges / totalChallenges) * 100) 
    : 0;

  // Find earliest started and latest completed
  const startedAt = progress?.[0]?.completed_at;
  const completedItems = progress
    ?.filter((p) => p.status === "completed")
    .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
  const completedAt = completedItems && completedItems.length > 0 ? completedItems[0].completed_at : undefined;

  return {
    trackId,
    trackTitle: "",
    totalChallenges,
    completedChallenges,
    progressPercent,
    completedSlugs,
    isComplete: completedChallenges === totalChallenges,
    startedAt,
    completedAt,
  };
}

/**
 * Get progress for all tracks
 */
export async function getAllTrackProgress(
  userId: string,
  tracks: Array<{ id: string; title: string; challenges: Array<{ slug: string }> }>
): Promise<TrackProgress[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  // Get all challenge slugs across all tracks
  const allSlugs = tracks.flatMap((t) => t.challenges.map((c) => c.slug));

  // Single query for all challenges
  const { data: progress } = await supabase
    .from("challenge_progress")
    .select("challenge_slug, status, completed_at")
    .eq("user_id", userId)
    .in("challenge_slug", allSlugs);

  return tracks.map((track) => {
    const trackSlugs = track.challenges.map((c) => c.slug);
    const trackProgress = progress?.filter((p) => trackSlugs.includes(p.challenge_slug)) ?? [];
    
    const completedSlugs = trackProgress
      .filter((p) => p.status === "completed")
      .map((p) => p.challenge_slug);

    const completedChallenges = completedSlugs.length;
    const totalChallenges = trackSlugs.length;
    const progressPercent = totalChallenges > 0 
      ? Math.round((completedChallenges / totalChallenges) * 100) 
      : 0;

    const completedAtItems = trackProgress
      ?.filter((p) => p.status === "completed")
      .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
    const completedAt = completedAtItems && completedAtItems.length > 0 ? completedAtItems[0].completed_at : undefined;

    return {
      trackId: track.id,
      trackTitle: track.title,
      totalChallenges,
      completedChallenges,
      progressPercent,
      completedSlugs,
      isComplete: completedChallenges === totalChallenges,
      startedAt: trackProgress?.[0]?.completed_at,
      completedAt,
    };
  });
}

/**
 * Generate a certificate for a completed track
 */
export async function generateCertificate(
  userId: string,
  trackId: string,
  trackTitle: string
): Promise<ProjectCertificate | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const certificateId = `cert_${userId}_${trackId}_${Date.now()}`;
  const certificateUrl = `/certificates/${certificateId}`;

  // Store certificate in database
  const { error } = await supabase.from("project_certificates").insert({
    id: certificateId,
    user_id: userId,
    track_id: trackId,
    track_title: trackTitle,
    completed_at: new Date().toISOString(),
    certificate_url: certificateUrl,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Failed to generate certificate:", error);
    return null;
  }

  return {
    id: certificateId,
    userId,
    trackId,
    trackTitle,
    completedAt: new Date().toISOString(),
    certificateUrl,
  };
}

/**
 * Get user's certificates
 */
export async function getUserCertificates(userId: string): Promise<ProjectCertificate[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data } = await supabase
    .from("project_certificates")
    .select("*")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false });

  return data ?? [];
}
