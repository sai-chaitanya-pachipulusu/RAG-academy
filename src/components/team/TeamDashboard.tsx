/**
 * Team Dashboard Component
 * 
 * Comprehensive team management interface for team subscriptions.
 * Includes member management, invites, settings, and team challenges.
 */

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  Settings,
  Trophy,
  Activity,
  Mail,
  X,
  Check,
  Crown,
  Shield,
  User,
  MoreVertical,
  LogOut,
  Copy,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { TouchButton } from "@/components/ui/TouchButton";
import { useToast } from "@/components/ui/Toast";
import type {
  TeamOverview,
  TeamMember,
  TeamInvite,
  TeamSettings,
  TeamActivity,
  TeamRole,
} from "@/lib/team/teamManagement";
import {
  getTeamOverview,
  getTeamMembers,
  getTeamInvites,
  sendTeamInvite,
  revokeTeamInvite,
  removeTeamMember,
  updateMemberRole,
  getTeamSettings,
  updateTeamSettings,
  getTeamActivity,
  leaveTeam,
} from "@/lib/team/teamManagement";

interface TeamDashboardProps {
  subscriptionId: string;
}

type Tab = "members" | "invites" | "settings" | "activity";

const ROLE_ICONS: Record<TeamRole, React.ReactNode> = {
  owner: <Crown className="h-4 w-4 text-amber-500" />,
  admin: <Shield className="h-4 w-4 text-blue-500" />,
  member: <User className="h-4 w-4 text-zinc-400" />,
};

const ROLE_LABELS: Record<TeamRole, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
};

export function TeamDashboard({ subscriptionId }: TeamDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("members");
  const [overview, setOverview] = useState<TeamOverview | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [settings, setSettings] = useState<TeamSettings | null>(null);
  const [activity, setActivity] = useState<TeamActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const { addToast } = useToast();

  // Load initial data
  useEffect(() => {
    loadData();
  }, [subscriptionId]);

  const loadData = async () => {
    setIsLoading(true);
    const [overviewData, membersData, invitesData, settingsData, activityData] = await Promise.all([
      getTeamOverview(),
      getTeamMembers(subscriptionId),
      getTeamInvites(subscriptionId),
      getTeamSettings(subscriptionId),
      getTeamActivity(subscriptionId),
    ]);

    setOverview(overviewData);
    setMembers(membersData);
    setInvites(invitesData);
    setSettings(settingsData);
    setActivity(activityData);
    setIsLoading(false);
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsSendingInvite(true);
    const result = await sendTeamInvite(subscriptionId, inviteEmail);
    setIsSendingInvite(false);

    if (result.success) {
      addToast("Invite sent successfully!", "success");
      setInviteEmail("");
      // Refresh invites
      const newInvites = await getTeamInvites(subscriptionId);
      setInvites(newInvites);
    } else {
      addToast(result.error || "Failed to send invite", "error");
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    const result = await revokeTeamInvite(inviteId);
    if (result.success) {
      addToast("Invite revoked", "success");
      setInvites(invites.filter((i) => i.id !== inviteId));
    } else {
      addToast(result.error || "Failed to revoke invite", "error");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    const result = await removeTeamMember(memberId);
    if (result.success) {
      addToast("Member removed", "success");
      setMembers(members.filter((m) => m.id !== memberId));
    } else {
      addToast(result.error || "Failed to remove member", "error");
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: TeamRole) => {
    const result = await updateMemberRole(memberId, newRole);
    if (result.success) {
      addToast("Role updated", "success");
      setMembers(
        members.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      );
    } else {
      addToast(result.error || "Failed to update role", "error");
    }
  };

  const handleLeaveTeam = async () => {
    if (!confirm("Are you sure you want to leave this team?")) return;

    const result = await leaveTeam();
    if (result.success) {
      addToast("You have left the team", "success");
      window.location.reload();
    } else {
      addToast(result.error || "Failed to leave team", "error");
    }
  };

  const handleUpdateSettings = async (updates: Partial<TeamSettings>) => {
    const result = await updateTeamSettings(subscriptionId, updates);
    if (result.success) {
      addToast("Settings updated", "success");
      setSettings((s) => (s ? { ...s, ...updates } : null));
    } else {
      addToast(result.error || "Failed to update settings", "error");
    }
  };

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        </div>
      </Card>
    );
  }

  if (!overview) {
    return (
      <Card className="p-8 text-center">
        <Users className="mx-auto mb-4 h-12 w-12 text-zinc-300" />
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          No Team Found
        </h3>
        <p className="text-zinc-500">
          You are not currently a member of any team.
        </p>
      </Card>
    );
  }

  const currentUserMember = members.find((m) => m.userId === "current-user-id"); // Would get from auth context
  const isAdmin = currentUserMember?.role === "owner" || currentUserMember?.role === "admin";

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {overview.teamName || "Team Dashboard"}
            </h2>
            <p className="text-zinc-500">
              {overview.activeMembers} of {overview.maxSeats} seats used
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-zinc-500">Available Seats</p>
              <p className="text-2xl font-bold text-green-600">{overview.availableSeats}</p>
            </div>
            {!isAdmin && (
              <TouchButton
                variant="ghost"
                onClick={handleLeaveTeam}
                className="text-red-600 hover:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Leave Team
              </TouchButton>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all"
              style={{
                width: `${(overview.activeMembers / overview.maxSeats) * 100}%`,
              }}
            />
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-zinc-200 dark:border-zinc-800">
        <nav className="flex gap-6">
          {[
            { id: "members" as Tab, label: "Members", icon: Users },
            { id: "invites" as Tab, label: "Invites", icon: Mail, badge: invites.length },
            { id: "activity" as Tab, label: "Activity", icon: Activity },
            { id: "settings" as Tab, label: "Settings", icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.badge ? (
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "members" && (
          <motion.div
            key="members"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card>
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                        {member.avatarUrl ? (
                          <img
                            src={member.avatarUrl}
                            alt={member.username || member.email}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5 text-zinc-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">
                          {member.username || member.email}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-zinc-500">
                          {ROLE_ICONS[member.role]}
                          <span>{ROLE_LABELS[member.role]}</span>
                          {member.xp !== undefined && (
                            <>
                              <span>•</span>
                              <span>{member.xp.toLocaleString()} XP</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {isAdmin && member.role !== "owner" && (
                      <div className="flex items-center gap-2">
                        <select
                          value={member.role}
                          onChange={(e) =>
                            handleUpdateRole(member.id, e.target.value as TeamRole)
                          }
                          className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                        <TouchButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </TouchButton>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === "invites" && (
          <motion.div
            key="invites"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Send Invite Form */}
            {isAdmin && overview.availableSeats > 0 && (
              <Card className="p-4">
                <form onSubmit={handleSendInvite} className="flex gap-2">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                    required
                  />
                  <TouchButton
                    type="submit"
                    disabled={isSendingInvite}
                    className="bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    {isSendingInvite ? "Sending..." : "Send Invite"}
                  </TouchButton>
                </form>
              </Card>
            )}

            {/* Pending Invites */}
            <Card>
              {invites.length === 0 ? (
                <div className="p-8 text-center">
                  <Mail className="mx-auto mb-4 h-12 w-12 text-zinc-300" />
                  <p className="text-zinc-500">No pending invites</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {invites.map((invite) => (
                    <div
                      key={invite.id}
                      className="flex items-center justify-between p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                          <Mail className="h-5 w-5 text-zinc-400" />
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-zinc-100">
                            {invite.email}
                          </p>
                          <p className="flex items-center gap-1 text-sm text-zinc-500">
                            <Clock className="h-3 w-3" />
                            Expires {new Date(invite.expiresAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {isAdmin && (
                        <TouchButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeInvite(invite.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Revoke
                        </TouchButton>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {activeTab === "activity" && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card>
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {activity.length === 0 ? (
                  <div className="p-8 text-center">
                    <Activity className="mx-auto mb-4 h-12 w-12 text-zinc-300" />
                    <p className="text-zinc-500">No activity yet</p>
                  </div>
                ) : (
                  activity.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <Activity className="h-4 w-4 text-zinc-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-zinc-900 dark:text-zinc-100">
                          {item.action.replace(/_/g, " ")}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === "settings" && settings && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="p-6 space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Team Name
                </label>
                <input
                  type="text"
                  value={settings.teamName || ""}
                  onChange={(e) =>
                    handleUpdateSettings({ teamName: e.target.value })
                  }
                  disabled={!isAdmin}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                  placeholder="Enter team name"
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-zinc-900 dark:text-zinc-100">
                  Team Features
                </h4>

                {[
                  {
                    key: "allowMemberInvites" as const,
                    label: "Allow members to send invites",
                    description: "Team members can invite new people to join",
                  },
                  {
                    key: "sharedProgressVisible" as const,
                    label: "Shared progress visible",
                    description: "Team members can see each other's progress",
                  },
                  {
                    key: "enableTeamLeaderboard" as const,
                    label: "Team leaderboard",
                    description: "Show internal team rankings",
                  },
                  {
                    key: "enableTeamChallenges" as const,
                    label: "Team challenges",
                    description: "Enable internal team competitions",
                  },
                ].map((setting) => (
                  <label
                    key={setting.key}
                    className="flex items-start gap-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={settings[setting.key]}
                      onChange={(e) =>
                        handleUpdateSettings({ [setting.key]: e.target.checked })
                      }
                      disabled={!isAdmin}
                      className="mt-1 h-4 w-4 rounded border-zinc-300 text-indigo-600"
                    />
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">
                        {setting.label}
                      </p>
                      <p className="text-sm text-zinc-500">{setting.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
