/**
 * Achievement Display Components
 * 
 * UI components for displaying achievements, unlock notifications,
 * and achievement galleries.
 */

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  Lock, 
  Check, 
  X,
  Sparkles,
  Target,
  Flame,
  Award,
  Star,
  Zap
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { TouchButton } from "@/components/ui/TouchButton";
import type { 
  Achievement, 
  UserAchievement, 
  AchievementProgress,
  AchievementCategory,
  AchievementRarity 
} from "@/lib/gamification/achievements";
import {
  ACHIEVEMENTS,
  getRarityColor,
  getRarityBgColor,
  getRarityBorderColor,
  getRarityLabel,
  getCategoryLabel,
  calculateAchievementProgress,
} from "@/lib/gamification/achievements";

// ============================================
// Achievement Unlock Notification
// ============================================

interface AchievementUnlockProps {
  achievement: Achievement;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export function AchievementUnlock({
  achievement,
  onClose,
  autoClose = true,
  autoCloseDelay = 8000,
}: AchievementUnlockProps) {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onClose, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, onClose]);

  const rarityColors = {
    common: "from-[#8B5CF6]-500 to-[#8B5CF6]-600",
    rare: "from-blue-500 to-blue-600",
    epic: "from-purple-500 to-purple-600",
    legendary: "from-amber-400 to-amber-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className="fixed inset-x-0 top-4 z-50 mx-auto max-w-md px-4"
    >
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${rarityColors[achievement.rarity]} p-1 shadow-2xl`}>
        <div className="rounded-xl bg-white p-6 dark:bg-gray-900">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-[#7C3AED] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Content */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition-all duration-200={{ delay: 0.2, type: "spring" }}
              className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-amber-200 text-4xl dark:from-amber-900/50 dark:to-amber-800/50"
            >
              {achievement.icon}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition-all duration-200={{ delay: 0.3 }}
            >
              <p className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                Achievement Unlocked!
              </p>
              <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
                {achievement.name}
              </h3>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                {achievement.description}
              </p>

              <div className="flex items-center justify-center gap-4">
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${getRarityBgColor(achievement.rarity)} ${getRarityColor(achievement.rarity)}`}>
                  <Trophy className="h-3 w-3" />
                  {getRarityLabel(achievement.rarity)}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-200">
                  <Sparkles className="h-3 w-3" />
                  +{achievement.xpReward} XP
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Shine effect */}
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition-all duration-200={{ duration: 1.5, delay: 0.5 }}
          className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />
      </div>
    </motion.div>
  );
}

// ============================================
// Achievement Card
// ============================================

interface AchievementCardProps {
  achievement: Achievement;
  userAchievement?: UserAchievement;
  showProgress?: boolean;
}

export function AchievementCard({
  achievement,
  userAchievement,
  showProgress = true,
}: AchievementCardProps) {
  const isUnlocked = userAchievement?.completed;
  const progress = userAchievement?.progress || 0;

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-200-all duration-200 ${
        isUnlocked
          ? "opacity-100"
          : "opacity-60 grayscale"
      } ${getRarityBorderColor(achievement.rarity)}`}
    >
      {/* Rarity indicator */}
      <div
        className={`absolute left-0 top-0 h-full w-1 ${
          achievement.rarity === "common"
            ? "bg-gray-400"
            : achievement.rarity === "rare"
            ? "bg-blue-500"
            : achievement.rarity === "epic"
            ? "bg-purple-500"
            : "bg-amber-500"
        }`}
      />

      <div className="p-4 pl-5">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${
              isUnlocked ? getRarityBgColor(achievement.rarity) : "bg-gray-100 dark:bg-[#7C3AED]"
            }`}
          >
            {isUnlocked ? achievement.icon : <Lock className="h-5 w-5 text-gray-400" />}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="truncate font-semibold text-gray-900 dark:text-gray-100">
                {achievement.name}
              </h4>
              {isUnlocked && (
                <Check className="h-4 w-4 shrink-0 text-green-500" />
              )}
            </div>
            <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
              {achievement.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${getRarityBgColor(
                  achievement.rarity
                )} ${getRarityColor(achievement.rarity)}`}
              >
                {getRarityLabel(achievement.rarity)}
              </span>
              <span className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-[#7C3AED] dark:text-gray-400">
                {getCategoryLabel(achievement.category)}
              </span>
              {isUnlocked && (
                <span className="inline-flex items-center gap-0.5 rounded bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <Sparkles className="h-3 w-3" />
                  +{achievement.xpReward} XP
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {showProgress && !isUnlocked && progress > 0 && (
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs text-gray-500">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full rounded-full bg-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Unlock date */}
        {isUnlocked && userAchievement?.unlockedAt && (
          <p className="mt-2 text-xs text-gray-400">
            Unlocked {new Date(userAchievement.unlockedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </Card>
  );
}

// ============================================
// Achievement Gallery
// ============================================

interface AchievementGalleryProps {
  userAchievements: UserAchievement[];
  selectedCategory?: AchievementCategory | "all";
  onCategoryChange?: (category: AchievementCategory | "all") => void;
}

const CATEGORY_ICONS: Record<AchievementCategory | "all", React.ReactNode> = {
  all: <Trophy className="h-4 w-4" />,
  progress: <Target className="h-4 w-4" />,
  streak: <Flame className="h-4 w-4" />,
  skill: <Zap className="h-4 w-4" />,
  social: <Award className="h-4 w-4" />,
  special: <Star className="h-4 w-4" />,
  mastery: <Sparkles className="h-4 w-4" />,
};

export function AchievementGallery({
  userAchievements,
  selectedCategory = "all",
  onCategoryChange,
}: AchievementGalleryProps) {
  const progress = calculateAchievementProgress(userAchievements);
  const unlockedIds = new Set(userAchievements.filter((ua) => ua.completed).map((ua) => ua.achievementId));

  const filteredAchievements = ACHIEVEMENTS.filter((a) => {
    if (a.secret && !unlockedIds.has(a.id)) return false;
    if (selectedCategory === "all") return true;
    return a.category === selectedCategory;
  });

  const categories: (AchievementCategory | "all")[] = [
    "all",
    "progress",
    "streak",
    "skill",
    "mastery",
    "social",
    "special",
  ];

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
              <Trophy className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {progress.unlockedCount}/{progress.totalAchievements}
              </p>
              <p className="text-xs text-gray-500">Achievements</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {progress.totalXPEarned.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">XP Earned</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Star className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {progress.byRarity.legendary.unlocked}
              </p>
              <p className="text-xs text-gray-500">Legendary</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Target className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {Math.round((progress.unlockedCount / progress.totalAchievements) * 100)}%
              </p>
              <p className="text-xs text-gray-500">Complete</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange?.(category)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200-all duration-200 ${
              selectedCategory === category
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-[#7C3AED] dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            {CATEGORY_ICONS[category]}
            {category === "all" ? "All" : getCategoryLabel(category as AchievementCategory)}
          </button>
        ))}
      </div>

      {/* Achievement Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredAchievements.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            userAchievement={userAchievements.find((ua) => ua.achievementId === achievement.id)}
          />
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="py-12 text-center">
          <Trophy className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-700" />
          <p className="text-gray-500 dark:text-gray-400">
            No achievements found in this category.
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================
// Achievement Progress Bar
// ============================================

interface AchievementProgressBarProps {
  progress: AchievementProgress;
  compact?: boolean;
}

export function AchievementProgressBar({ progress, compact = false }: AchievementProgressBarProps) {
  const percentage = Math.round((progress.unlockedCount / progress.totalAchievements) * 100);

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">Achievements</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {progress.unlockedCount}/{progress.totalAchievements}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
            />
          </div>
        </div>
        <Trophy className="h-5 w-5 text-amber-500" />
      </div>
    );
  }

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Achievement Progress</h3>
        <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
          {percentage}%
        </span>
      </div>

      <div className="mb-4 h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
        />
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        {(["common", "rare", "epic", "legendary"] as AchievementRarity[]).map((rarity) => (
          <div key={rarity} className="rounded-lg bg-gray-50 p-2 dark:bg-gray-900">
            <p className={`text-lg font-bold ${getRarityColor(rarity)}`}>
              {progress.byRarity[rarity].unlocked}
            </p>
            <p className="text-[10px] uppercase tracking-wide text-gray-500">
              {getRarityLabel(rarity)}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ============================================
// Recent Achievements Widget
// ============================================

interface RecentAchievementsProps {
  userAchievements: UserAchievement[];
  maxDisplay?: number;
}

export function RecentAchievements({ userAchievements, maxDisplay = 3 }: RecentAchievementsProps) {
  const recentUnlocked = userAchievements
    .filter((ua) => ua.completed)
    .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
    .slice(0, maxDisplay);

  if (recentUnlocked.length === 0) {
    return (
      <Card className="p-4">
        <h3 className="mb-3 font-semibold text-gray-900 dark:text-gray-100">Recent Achievements</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Complete challenges to unlock achievements!
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="mb-3 font-semibold text-gray-900 dark:text-gray-100">Recent Achievements</h3>
      <div className="space-y-3">
        {recentUnlocked.map((ua) => {
          const achievement = ACHIEVEMENTS.find((a) => a.id === ua.achievementId);
          if (!achievement) return null;

          return (
            <div key={ua.achievementId} className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg ${getRarityBgColor(achievement.rarity)}`}>
                {achievement.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-900 dark:text-gray-100">
                  {achievement.name}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(ua.unlockedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <span className="text-xs font-medium text-green-600 dark:text-green-400">
                +{achievement.xpReward} XP
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
