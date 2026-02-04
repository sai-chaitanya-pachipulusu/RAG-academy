/**
 * Team Management System
 * 
 * Client-side utilities for managing team subscriptions, invites,
 * and team-specific features.
 */

import { getSupabase } from "@/lib/supabase/client";

// ============================================
// Types
// ============================================

export type TeamRole = "owner" | "admin" | "member";
export type TeamMemberStatus = "active" | "suspended" | "removed";
export type InviteStatus = "pending" | "accepted" | "declined" | "expired" | "revoked";

export interface TeamMember {
  id: string;
  subscriptionId: string;
  userId: string;
  email: string;
  role: TeamRole;
  status: TeamMemberStatus;
  joinedAt: string;
  lastActiveAt?: string;
  // Joined fields
  username?: string;
  avatarUrl?: string;
  xp?: number;
}

export interface TeamInvite {
  id: string;
  subscriptionId: string;
  email: string;
  invitedBy: string;
  status: InviteStatus;
  inviteToken: string;
  expiresAt: string;
  createdAt: string;
  acceptedAt?: string;
}

export interface TeamSettings {
  id: string;
  subscriptionId: string;
  teamName?: string;
  teamLogoUrl?: string;
  allowMemberInvites: boolean;
  requireApprovalForJoins: boolean;
  sharedProgressVisible: boolean;
  enableTeamLeaderboard: boolean;
  enableTeamChallenges: boolean;
}

export interface TeamOverview {
  subscriptionId: string;
  tier: string;
  subscriptionStatus: string;
  maxSeats: number;
  availableSeats: number;
  activeMembers: number;
  pendingInvites: number;
  teamName?: string;
  enableTeamLeaderboard: boolean;
  enableTeamChallenges: boolean;
}

export interface TeamActivity {
  id: string;
  subscriptionId: string;
  userId?: string;
  action: string;
  details: Record<string, unknown>;
  createdAt: string;
}

export interface TeamChallenge {
  id: string;
  subscriptionId: string;
  challengeSlug: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "active" | "completed" | "cancelled";
  scoringType: "completion_count" | "total_score" | "average_score" | "fastest_time";
  createdAt: string;
  createdBy: string;
}

export interface TeamChallengeResult {
  id: string;
  teamChallengeId: string;
  userId: string;
  score: number;
  completedAt?: string;
  attempts: number;
}

// ============================================
// Team Management Functions
// ============================================

/**
 * Get team overview for the current user
 */
export async function getTeamOverview(): Promise<TeamOverview | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("team_overview")
    .select("*")
    .single();

  if (error) {
    console.error("Error fetching team overview:", error);
    return null;
  }

  return data ? mapTeamOverview(data) : null;
}

/**
 * Get team members
 */
export async function getTeamMembers(subscriptionId: string): Promise<TeamMember[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("team_member_details")
    .select("*")
    .eq("subscription_id", subscriptionId)
    .eq("status", "active")
    .order("joined_at", { ascending: true });

  if (error) {
    console.error("Error fetching team members:", error);
    return [];
  }

  return (data || []).map(mapTeamMember);
}

/**
 * Get pending invites for a team
 */
export async function getTeamInvites(subscriptionId: string): Promise<TeamInvite[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("team_invites")
    .select("*")
    .eq("subscription_id", subscriptionId)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching team invites:", error);
    return [];
  }

  return (data || []).map(mapTeamInvite);
}

/**
 * Send a team invite
 */
export async function sendTeamInvite(
  subscriptionId: string,
  email: string
): Promise<{ success: boolean; error?: string; invite?: TeamInvite }> {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: "Not authenticated" };

  // Check available seats
  const { data: overview } = await supabase
    .from("team_overview")
    .select("available_seats")
    .eq("subscription_id", subscriptionId)
    .single();

  if (!overview || overview.available_seats <= 0) {
    return { success: false, error: "No available seats" };
  }

  const { data, error } = await supabase
    .from("team_invites")
    .insert({
      subscription_id: subscriptionId,
      email: email.toLowerCase().trim(),
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "Invite already sent to this email" };
    }
    console.error("Error sending invite:", error);
    return { success: false, error: error.message };
  }

  return { success: true, invite: mapTeamInvite(data) };
}

/**
 * Cancel/revoke a team invite
 */
export async function revokeTeamInvite(
  inviteId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("team_invites")
    .update({ status: "revoked" })
    .eq("id", inviteId);

  if (error) {
    console.error("Error revoking invite:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Accept a team invite
 */
export async function acceptTeamInvite(
  token: string
): Promise<{ success: boolean; error?: string; subscriptionId?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: "Not authenticated" };

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  // Find the invite
  const { data: invite, error: inviteError } = await supabase
    .from("team_invites")
    .select("*")
    .eq("invite_token", token)
    .eq("status", "pending")
    .single();

  if (inviteError || !invite) {
    return { success: false, error: "Invalid or expired invite" };
  }

  if (new Date(invite.expires_at) < new Date()) {
    await supabase
      .from("team_invites")
      .update({ status: "expired" })
      .eq("id", invite.id);
    return { success: false, error: "Invite has expired" };
  }

  // Check if user is already in a team
  const { data: existingMember } = await supabase
    .from("team_members")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  if (existingMember) {
    return { success: false, error: "You are already a member of a team" };
  }

  // Add user to team
  const { error: memberError } = await supabase
    .from("team_members")
    .insert({
      subscription_id: invite.subscription_id,
      user_id: user.id,
      email: user.email || invite.email,
      role: "member",
    });

  if (memberError) {
    console.error("Error adding team member:", memberError);
    return { success: false, error: memberError.message };
  }

  // Update invite status
  await supabase
    .from("team_invites")
    .update({ 
      status: "accepted",
      accepted_at: new Date().toISOString()
    })
    .eq("id", invite.id);

  return { success: true, subscriptionId: invite.subscription_id };
}

/**
 * Remove a team member
 */
export async function removeTeamMember(
  memberId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("team_members")
    .update({ status: "removed" })
    .eq("id", memberId);

  if (error) {
    console.error("Error removing team member:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Update team member role
 */
export async function updateMemberRole(
  memberId: string,
  newRole: TeamRole
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("team_members")
    .update({ role: newRole })
    .eq("id", memberId);

  if (error) {
    console.error("Error updating member role:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Get team settings
 */
export async function getTeamSettings(subscriptionId: string): Promise<TeamSettings | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("team_settings")
    .select("*")
    .eq("subscription_id", subscriptionId)
    .single();

  if (error) {
    // If not found, create default settings
    if (error.code === "PGRST116") {
      const { data: newSettings, error: createError } = await supabase
        .from("team_settings")
        .insert({ subscription_id: subscriptionId })
        .select()
        .single();

      if (createError) {
        console.error("Error creating team settings:", createError);
        return null;
      }

      return mapTeamSettings(newSettings);
    }

    console.error("Error fetching team settings:", error);
    return null;
  }

  return mapTeamSettings(data);
}

/**
 * Update team settings
 */
export async function updateTeamSettings(
  subscriptionId: string,
  updates: Partial<Omit<TeamSettings, "id" | "subscriptionId">>
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: "Not authenticated" };

  const dbUpdates: Record<string, unknown> = {};
  if (updates.teamName !== undefined) dbUpdates.team_name = updates.teamName;
  if (updates.teamLogoUrl !== undefined) dbUpdates.team_logo_url = updates.teamLogoUrl;
  if (updates.allowMemberInvites !== undefined) dbUpdates.allow_member_invites = updates.allowMemberInvites;
  if (updates.requireApprovalForJoins !== undefined) dbUpdates.require_approval_for_joins = updates.requireApprovalForJoins;
  if (updates.sharedProgressVisible !== undefined) dbUpdates.shared_progress_visible = updates.sharedProgressVisible;
  if (updates.enableTeamLeaderboard !== undefined) dbUpdates.enable_team_leaderboard = updates.enableTeamLeaderboard;
  if (updates.enableTeamChallenges !== undefined) dbUpdates.enable_team_challenges = updates.enableTeamChallenges;

  const { error } = await supabase
    .from("team_settings")
    .update(dbUpdates)
    .eq("subscription_id", subscriptionId);

  if (error) {
    console.error("Error updating team settings:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Get team activity log
 */
export async function getTeamActivity(
  subscriptionId: string,
  limit: number = 50
): Promise<TeamActivity[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("team_activity_log")
    .select("*")
    .eq("subscription_id", subscriptionId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching team activity:", error);
    return [];
  }

  return (data || []).map(mapTeamActivity);
}

/**
 * Leave team (for non-owners)
 */
export async function leaveTeam(): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: "Not authenticated" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  // Check if user is owner
  const { data: member } = await supabase
    .from("team_members")
    .select("role, subscription_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  if (!member) {
    return { success: false, error: "Not a team member" };
  }

  if (member.role === "owner") {
    return { success: false, error: "Owner cannot leave team. Transfer ownership first." };
  }

  const { error } = await supabase
    .from("team_members")
    .update({ status: "removed" })
    .eq("user_id", user.id);

  if (error) {
    console.error("Error leaving team:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ============================================
// Data Mappers
// ============================================

function mapTeamOverview(data: Record<string, unknown>): TeamOverview {
  return {
    subscriptionId: data.subscription_id as string,
    tier: data.tier as string,
    subscriptionStatus: data.subscription_status as string,
    maxSeats: data.max_seats as number,
    availableSeats: data.available_seats as number,
    activeMembers: data.active_members as number,
    pendingInvites: data.pending_invites as number,
    teamName: data.team_name as string | undefined,
    enableTeamLeaderboard: data.enable_team_leaderboard as boolean,
    enableTeamChallenges: data.enable_team_challenges as boolean,
  };
}

function mapTeamMember(data: Record<string, unknown>): TeamMember {
  return {
    id: data.id as string,
    subscriptionId: data.subscription_id as string,
    userId: data.user_id as string,
    email: data.email as string,
    role: data.role as TeamRole,
    status: data.status as TeamMemberStatus,
    joinedAt: data.joined_at as string,
    lastActiveAt: data.last_active_at as string | undefined,
    username: data.username as string | undefined,
    avatarUrl: data.avatar_url as string | undefined,
    xp: data.xp as number | undefined,
  };
}

function mapTeamInvite(data: Record<string, unknown>): TeamInvite {
  return {
    id: data.id as string,
    subscriptionId: data.subscription_id as string,
    email: data.email as string,
    invitedBy: data.invited_by as string,
    status: data.status as InviteStatus,
    inviteToken: data.invite_token as string,
    expiresAt: data.expires_at as string,
    createdAt: data.created_at as string,
    acceptedAt: data.accepted_at as string | undefined,
  };
}

function mapTeamSettings(data: Record<string, unknown>): TeamSettings {
  return {
    id: data.id as string,
    subscriptionId: data.subscription_id as string,
    teamName: data.team_name as string | undefined,
    teamLogoUrl: data.team_logo_url as string | undefined,
    allowMemberInvites: data.allow_member_invites as boolean,
    requireApprovalForJoins: data.require_approval_for_joins as boolean,
    sharedProgressVisible: data.shared_progress_visible as boolean,
    enableTeamLeaderboard: data.enable_team_leaderboard as boolean,
    enableTeamChallenges: data.enable_team_challenges as boolean,
  };
}

function mapTeamActivity(data: Record<string, unknown>): TeamActivity {
  return {
    id: data.id as string,
    subscriptionId: data.subscription_id as string,
    userId: data.user_id as string | undefined,
    action: data.action as string,
    details: (data.details as Record<string, unknown>) || {},
    createdAt: data.created_at as string,
  };
}
