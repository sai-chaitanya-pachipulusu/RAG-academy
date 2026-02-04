/**
 * Achievement System
 * 
 * Comprehensive gamification with badges, achievements, and rewards.
 * Tracks user progress across multiple dimensions and unlocks recognition.
 */

import type { ChallengeDifficulty } from "@/lib/challenges/types";

// ============================================
// Types
// ============================================

export type AchievementRarity = "common" | "rare" | "epic" | "legendary";

export type AchievementCategory = 
  | "progress"      // Challenge completion milestones
  | "streak"        // Daily streak achievements
  | "skill"         // Skill-specific achievements
  | "social"        // Community/social achievements
  | "special"       // Limited-time or special achievements
  | "mastery";      // Deep mastery achievements

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  category: AchievementCategory;
  xpReward: number;
  
  // Unlock conditions
  condition: {
    type: string;
    value: number;
    metadata?: Record<string, unknown>;
  };
  
  // Display
  hidden?: boolean;           // Hidden until unlocked
  secret?: boolean;           // Secret achievement (not shown in list)
  prerequisites?: string[];   // Other achievement IDs required first
}

export interface UserAchievement {
  achievementId: string;
  unlockedAt: string;
  progress: number;           // Current progress toward achievement
  completed: boolean;
}

export interface AchievementProgress {
  totalAchievements: number;
  unlockedCount: number;
  totalXPEarned: number;
  byCategory: Record<AchievementCategory, { total: number; unlocked: number }>;
  byRarity: Record<AchievementRarity, { total: number; unlocked: number }>;
  recentUnlocks: UserAchievement[];
}

// ============================================
// Achievement Definitions
// ============================================

export const ACHIEVEMENTS: Achievement[] = [
  // ============================================
  // PROGRESS ACHIEVEMENTS
  // ============================================
  {
    id: "first-steps",
    name: "First Steps",
    description: "Complete your first challenge",
    icon: "👣",
    rarity: "common",
    category: "progress",
    xpReward: 50,
    condition: { type: "challenges_completed", value: 1 },
  },
  {
    id: "getting-started",
    name: "Getting Started",
    description: "Complete 5 challenges",
    icon: "🚀",
    rarity: "common",
    category: "progress",
    xpReward: 100,
    condition: { type: "challenges_completed", value: 5 },
  },
  {
    id: "rising-star",
    name: "Rising Star",
    description: "Complete 25 challenges",
    icon: "⭐",
    rarity: "rare",
    category: "progress",
    xpReward: 250,
    condition: { type: "challenges_completed", value: 25 },
  },
  {
    id: "challenge-champion",
    name: "Challenge Champion",
    description: "Complete 50 challenges",
    icon: "🏆",
    rarity: "epic",
    category: "progress",
    xpReward: 500,
    condition: { type: "challenges_completed", value: 50 },
  },
  {
    id: "rag-master",
    name: "RAG Master",
    description: "Complete 100 challenges",
    icon: "👑",
    rarity: "legendary",
    category: "progress",
    xpReward: 1000,
    condition: { type: "challenges_completed", value: 100 },
  },
  {
    id: "completionist",
    name: "The Completionist",
    description: "Complete all available challenges",
    icon: "🎯",
    rarity: "legendary",
    category: "progress",
    xpReward: 2000,
    condition: { type: "challenges_completed_percentage", value: 100 },
    hidden: true,
  },

  // ============================================
  // STREAK ACHIEVEMENTS
  // ============================================
  {
    id: "consistent-learner",
    name: "Consistent Learner",
    description: "Maintain a 3-day streak",
    icon: "📅",
    rarity: "common",
    category: "streak",
    xpReward: 75,
    condition: { type: "streak_days", value: 3 },
  },
  {
    id: "week-warrior",
    name: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "🔥",
    rarity: "rare",
    category: "streak",
    xpReward: 150,
    condition: { type: "streak_days", value: 7 },
  },
  {
    id: "month-master",
    name: "Month Master",
    description: "Maintain a 30-day streak",
    icon: "📆",
    rarity: "epic",
    category: "streak",
    xpReward: 500,
    condition: { type: "streak_days", value: 30 },
  },
  {
    id: "unstoppable",
    name: "Unstoppable",
    description: "Maintain a 100-day streak",
    icon: "💯",
    rarity: "legendary",
    category: "streak",
    xpReward: 1500,
    condition: { type: "streak_days", value: 100 },
    hidden: true,
  },

  // ============================================
  // SKILL ACHIEVEMENTS
  // ============================================
  {
    id: "vector-novice",
    name: "Vector Novice",
    description: "Complete 5 vector math challenges",
    icon: "📐",
    rarity: "common",
    category: "skill",
    xpReward: 100,
    condition: { type: "category_completed", value: 5, metadata: { category: "vector-math" } },
  },
  {
    id: "chunking-specialist",
    name: "Chunking Specialist",
    description: "Complete all chunking challenges",
    icon: "✂️",
    rarity: "rare",
    category: "skill",
    xpReward: 200,
    condition: { type: "category_completed", value: 10, metadata: { category: "chunking" } },
  },
  {
    id: "retrieval-expert",
    name: "Retrieval Expert",
    description: "Complete 15 retrieval challenges",
    icon: "🔍",
    rarity: "epic",
    category: "skill",
    xpReward: 350,
    condition: { type: "category_completed", value: 15, metadata: { category: "retrieval" } },
  },
  {
    id: "evaluation-guru",
    name: "Evaluation Guru",
    description: "Complete all evaluation challenges with perfect scores",
    icon: "📊",
    rarity: "epic",
    category: "skill",
    xpReward: 400,
    condition: { type: "category_perfect", value: 100, metadata: { category: "evaluation" } },
  },
  {
    id: "security-sentinel",
    name: "Security Sentinel",
    description: "Complete all security challenges",
    icon: "🛡️",
    rarity: "rare",
    category: "skill",
    xpReward: 300,
    condition: { type: "category_completed", value: 5, metadata: { category: "security" } },
  },
  {
    id: "index-architect",
    name: "Index Architect",
    description: "Master all indexing challenges",
    icon: "🏗️",
    rarity: "epic",
    category: "skill",
    xpReward: 450,
    condition: { type: "category_completed", value: 10, metadata: { category: "indexing" } },
  },
  {
    id: "reranking-pro",
    name: "Reranking Pro",
    description: "Complete all reranking challenges",
    icon: "🔄",
    rarity: "rare",
    category: "skill",
    xpReward: 250,
    condition: { type: "category_completed", value: 8, metadata: { category: "reranking" } },
  },

  // ============================================
  // DIFFICULTY ACHIEVEMENTS
  // ============================================
  {
    id: "easy-rider",
    name: "Easy Rider",
    description: "Complete 10 easy challenges",
    icon: "🟢",
    rarity: "common",
    category: "progress",
    xpReward: 100,
    condition: { type: "difficulty_completed", value: 10, metadata: { difficulty: "easy" } },
  },
  {
    id: "medium-mastery",
    name: "Medium Mastery",
    description: "Complete 20 medium challenges",
    icon: "🟡",
    rarity: "rare",
    category: "progress",
    xpReward: 200,
    condition: { type: "difficulty_completed", value: 20, metadata: { difficulty: "medium" } },
  },
  {
    id: "hard-hero",
    name: "Hard Hero",
    description: "Complete 15 hard challenges",
    icon: "🔴",
    rarity: "epic",
    category: "progress",
    xpReward: 400,
    condition: { type: "difficulty_completed", value: 15, metadata: { difficulty: "hard" } },
  },
  {
    id: "no-hints-needed",
    name: "No Hints Needed",
    description: "Complete 10 hard challenges without using hints",
    icon: "🧠",
    rarity: "legendary",
    category: "mastery",
    xpReward: 600,
    condition: { type: "hard_no_hints", value: 10 },
    hidden: true,
  },

  // ============================================
  // SOCIAL ACHIEVEMENTS
  // ============================================
  {
    id: "team-player",
    name: "Team Player",
    description: "Join a team subscription",
    icon: "👥",
    rarity: "rare",
    category: "social",
    xpReward: 200,
    condition: { type: "team_joined", value: 1 },
  },
  {
    id: "early-adopter",
    name: "Early Adopter",
    description: "Join during the beta phase",
    icon: "🚀",
    rarity: "epic",
    category: "special",
    xpReward: 300,
    condition: { type: "joined_before", value: 1, metadata: { date: "2025-06-01" } },
    hidden: true,
  },
  {
    id: "founding-member",
    name: "Founding Member",
    description: "Subscribe during Phase 1 pricing",
    icon: "💎",
    rarity: "legendary",
    category: "special",
    xpReward: 500,
    condition: { type: "subscribed_phase", value: 1, metadata: { phase: "phase1" } },
  },

  // ============================================
  // MASTERY ACHIEVEMENTS
  // ============================================
  {
    id: "speed-demon",
    name: "Speed Demon",
    description: "Complete a challenge in under 5 minutes",
    icon: "⚡",
    rarity: "rare",
    category: "mastery",
    xpReward: 150,
    condition: { type: "fast_completion", value: 5 },
  },
  {
    id: "perfect-score",
    name: "Perfect Score",
    description: "Get 100% on any challenge",
    icon: "💯",
    rarity: "rare",
    category: "mastery",
    xpReward: 200,
    condition: { type: "perfect_score", value: 1 },
  },
  {
    id: "persistent",
    name: "Persistent",
    description: "Complete a challenge after 10+ attempts",
    icon: "🎯",
    rarity: "epic",
    category: "mastery",
    xpReward: 300,
    condition: { type: "many_attempts", value: 10 },
    hidden: true,
  },
  {
    id: "first-try",
    name: "First Try",
    description: "Complete a hard challenge on your first attempt",
    icon: "🥇",
    rarity: "legendary",
    category: "mastery",
    xpReward: 500,
    condition: { type: "first_try_hard", value: 1 },
    hidden: true,
  },
  {
    id: "polyglot",
    name: "Polyglot",
    description: "Complete challenges in both Python and TypeScript",
    icon: "🌐",
    rarity: "rare",
    category: "mastery",
    xpReward: 250,
    condition: { type: "both_languages", value: 1 },
  },
  {
    id: "srs-master",
    name: "SRS Master",
    description: "Complete 50 spaced repetition reviews",
    icon: "🧠",
    rarity: "epic",
    category: "mastery",
    xpReward: 400,
    condition: { type: "srs_reviews", value: 50 },
  },
  {
    id: "arena-champion",
    name: "Arena Champion",
    description: "Reach top 10 on any challenge leaderboard",
    icon: "🏅",
    rarity: "epic",
    category: "mastery",
    xpReward: 500,
    condition: { type: "leaderboard_top", value: 10 },
  },
  {
    id: "arena-legend",
    name: "Arena Legend",
    description: "Reach #1 on any challenge leaderboard",
    icon: "🥇",
    rarity: "legendary",
    category: "mastery",
    xpReward: 1000,
    condition: { type: "leaderboard_first", value: 1 },
    hidden: true,
  },

  // ============================================
  // SPECIAL EVENT ACHIEVEMENTS
  // ============================================
  {
    id: "weekly-warrior",
    name: "Weekly Warrior",
    description: "Complete a weekly featured challenge",
    icon: "📅",
    rarity: "rare",
    category: "special",
    xpReward: 150,
    condition: { type: "weekly_challenge", value: 1 },
  },
  {
    id: "event-participant",
    name: "Event Participant",
    description: "Participate in a live coding event",
    icon: "🎪",
    rarity: "epic",
    category: "special",
    xpReward: 300,
    condition: { type: "live_event", value: 1 },
  },
  {
    id: "night-owl",
    name: "Night Owl",
    description: "Complete a challenge between midnight and 5 AM",
    icon: "🦉",
    rarity: "rare",
    category: "special",
    xpReward: 100,
    condition: { type: "late_night", value: 1 },
    hidden: true,
  },
  {
    id: "weekend-warrior",
    name: "Weekend Warrior",
    description: "Complete challenges on both Saturday and Sunday",
    icon: "🎉",
    rarity: "common",
    category: "special",
    xpReward: 75,
    condition: { type: "weekend_complete", value: 1 },
  },
];

// ============================================
// Helper Functions
// ============================================

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.category === category);
}

export function getAchievementsByRarity(rarity: AchievementRarity): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.rarity === rarity);
}

export function getRarityColor(rarity: AchievementRarity): string {
  switch (rarity) {
    case "common":
      return "text-zinc-600 dark:text-zinc-400";
    case "rare":
      return "text-blue-600 dark:text-blue-400";
    case "epic":
      return "text-purple-600 dark:text-purple-400";
    case "legendary":
      return "text-amber-500 dark:text-amber-400";
    default:
      return "text-zinc-600";
  }
}

export function getRarityBgColor(rarity: AchievementRarity): string {
  switch (rarity) {
    case "common":
      return "bg-zinc-100 dark:bg-zinc-800";
    case "rare":
      return "bg-blue-100 dark:bg-blue-900/30";
    case "epic":
      return "bg-purple-100 dark:bg-purple-900/30";
    case "legendary":
      return "bg-amber-100 dark:bg-amber-900/30";
    default:
      return "bg-zinc-100";
  }
}

export function getRarityBorderColor(rarity: AchievementRarity): string {
  switch (rarity) {
    case "common":
      return "border-zinc-200 dark:border-zinc-700";
    case "rare":
      return "border-blue-200 dark:border-blue-800";
    case "epic":
      return "border-purple-200 dark:border-purple-800";
    case "legendary":
      return "border-amber-200 dark:border-amber-800";
    default:
      return "border-zinc-200";
  }
}

export function getRarityLabel(rarity: AchievementRarity): string {
  return rarity.charAt(0).toUpperCase() + rarity.slice(1);
}

export function getCategoryLabel(category: AchievementCategory): string {
  switch (category) {
    case "progress":
      return "Progress";
    case "streak":
      return "Streaks";
    case "skill":
      return "Skills";
    case "social":
      return "Social";
    case "special":
      return "Special";
    case "mastery":
      return "Mastery";
    default:
      return category;
  }
}

// ============================================
// Progress Calculation
// ============================================

export function calculateAchievementProgress(
  userAchievements: UserAchievement[]
): AchievementProgress {
  const unlockedIds = new Set(userAchievements.filter((ua) => ua.completed).map((ua) => ua.achievementId));
  
  const byCategory: Record<AchievementCategory, { total: number; unlocked: number }> = {
    progress: { total: 0, unlocked: 0 },
    streak: { total: 0, unlocked: 0 },
    skill: { total: 0, unlocked: 0 },
    social: { total: 0, unlocked: 0 },
    special: { total: 0, unlocked: 0 },
    mastery: { total: 0, unlocked: 0 },
  };

  const byRarity: Record<AchievementRarity, { total: number; unlocked: number }> = {
    common: { total: 0, unlocked: 0 },
    rare: { total: 0, unlocked: 0 },
    epic: { total: 0, unlocked: 0 },
    legendary: { total: 0, unlocked: 0 },
  };

  let totalXPEarned = 0;

  for (const achievement of ACHIEVEMENTS) {
    // Skip secret achievements from totals
    if (achievement.secret) continue;

    byCategory[achievement.category].total++;
    byRarity[achievement.rarity].total++;

    if (unlockedIds.has(achievement.id)) {
      byCategory[achievement.category].unlocked++;
      byRarity[achievement.rarity].unlocked++;
      totalXPEarned += achievement.xpReward;
    }
  }

  const recentUnlocks = userAchievements
    .filter((ua) => ua.completed)
    .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
    .slice(0, 5);

  return {
    totalAchievements: ACHIEVEMENTS.filter((a) => !a.secret).length,
    unlockedCount: unlockedIds.size,
    totalXPEarned,
    byCategory,
    byRarity,
    recentUnlocks,
  };
}

// ============================================
// Achievement Checking
// ============================================

export interface AchievementCheckContext {
  challengesCompleted: number;
  streakDays: number;
  totalChallenges: number;
  categoriesCompleted: Record<string, number>;
  difficultiesCompleted: Record<string, number>;
  perfectScores: number;
  hintsUsed: number;
  hardChallengesNoHints: number;
  fastestCompletionMinutes: number;
  attemptsOnCurrentChallenge: number;
  srsReviewsCompleted: number;
  joinedAt: string;
  subscriptionPhase?: string;
  hasTeamSubscription: boolean;
  languagesUsed: string[];
  leaderboardPositions: Record<string, number>;
}

export function checkAchievements(
  context: AchievementCheckContext,
  alreadyUnlocked: string[]
): Achievement[] {
  const newlyUnlocked: Achievement[] = [];
  const unlockedSet = new Set(alreadyUnlocked);

  for (const achievement of ACHIEVEMENTS) {
    if (unlockedSet.has(achievement.id)) continue;
    if (achievement.prerequisites?.some((p) => !unlockedSet.has(p))) continue;

    if (checkAchievementCondition(achievement, context)) {
      newlyUnlocked.push(achievement);
    }
  }

  return newlyUnlocked;
}

function checkAchievementCondition(
  achievement: Achievement,
  context: AchievementCheckContext
): boolean {
  const { condition } = achievement;

  switch (condition.type) {
    case "challenges_completed":
      return context.challengesCompleted >= condition.value;

    case "challenges_completed_percentage":
      return context.totalChallenges > 0 &&
        (context.challengesCompleted / context.totalChallenges) * 100 >= condition.value;

    case "streak_days":
      return context.streakDays >= condition.value;

    case "category_completed":
      const category = condition.metadata?.category as string;
      return (context.categoriesCompleted[category] || 0) >= condition.value;

    case "category_perfect":
      // Would need additional tracking for perfect scores per category
      return false;

    case "difficulty_completed":
      const difficulty = condition.metadata?.difficulty as string;
      return (context.difficultiesCompleted[difficulty] || 0) >= condition.value;

    case "hard_no_hints":
      return context.hardChallengesNoHints >= condition.value;

    case "perfect_score":
      return context.perfectScores >= condition.value;

    case "fast_completion":
      return context.fastestCompletionMinutes <= condition.value;

    case "many_attempts":
      return context.attemptsOnCurrentChallenge >= condition.value;

    case "first_try_hard":
      // Would need tracking for first-try completions
      return false;

    case "both_languages":
      return context.languagesUsed.includes("python") && 
             context.languagesUsed.includes("typescript");

    case "srs_reviews":
      return context.srsReviewsCompleted >= condition.value;

    case "leaderboard_top":
      return Object.values(context.leaderboardPositions).some((pos) => pos <= condition.value);

    case "leaderboard_first":
      return Object.values(context.leaderboardPositions).some((pos) => pos === 1);

    case "team_joined":
      return context.hasTeamSubscription;

    case "subscribed_phase":
      return context.subscriptionPhase === condition.metadata?.phase;

    case "joined_before":
      const cutoffDate = new Date(condition.metadata?.date as string);
      return new Date(context.joinedAt) < cutoffDate;

    default:
      return false;
  }
}

// ============================================
// Local Storage Helpers
// ============================================

const ACHIEVEMENTS_STORAGE_KEY = "rag_academy_achievements";

export function loadUserAchievements(): UserAchievement[] {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveUserAchievements(achievements: UserAchievement[]): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(achievements));
  } catch {
    // Ignore storage errors
  }
}

export function unlockAchievement(
  achievementId: string,
  currentAchievements: UserAchievement[] = []
): UserAchievement[] {
  const existing = currentAchievements.find((a) => a.achievementId === achievementId);
  
  if (existing) {
    if (!existing.completed) {
      return currentAchievements.map((a) =>
        a.achievementId === achievementId
          ? { ...a, completed: true, unlockedAt: new Date().toISOString() }
          : a
      );
    }
    return currentAchievements;
  }

  return [
    ...currentAchievements,
    {
      achievementId,
      unlockedAt: new Date().toISOString(),
      progress: 100,
      completed: true,
    },
  ];
}

export function updateAchievementProgress(
  achievementId: string,
  progress: number,
  currentAchievements: UserAchievement[] = []
): UserAchievement[] {
  const existing = currentAchievements.find((a) => a.achievementId === achievementId);
  
  if (existing) {
    return currentAchievements.map((a) =>
      a.achievementId === achievementId
        ? { ...a, progress: Math.min(100, progress) }
        : a
    );
  }

  return [
    ...currentAchievements,
    {
      achievementId,
      unlockedAt: new Date().toISOString(),
      progress: Math.min(100, progress),
      completed: false,
    },
  ];
}
