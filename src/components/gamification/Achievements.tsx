"use client";

import { useEffect, useState } from "react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_blood",
    title: "First Blood",
    description: "Complete your first challenge",
    icon: "🎯",
  },
  {
    id: "vector_master",
    title: "Vector Master",
    description: "Complete all Vector DB challenges",
    icon: "🗃️",
  },
  {
    id: "pipeline_builder",
    title: "Pipeline Builder",
    description: "Complete the RAG Pipeline track",
    icon: "🔗",
  },
  {
    id: "speed_demon",
    title: "Speed Demon",
    description: "Solve a challenge in under 2 minutes",
    icon: "⚡",
  },
  {
    id: "perfectionist",
    title: "Perfectionist",
    description: "Get 100% score on a benchmark challenge",
    icon: "💯",
  },
  {
    id: "streak_3",
    title: "On Fire",
    description: "Complete 3 challenges in a row",
    icon: "🔥",
  },
  {
    id: "streak_7",
    title: "Unstoppable",
    description: "7-day streak",
    icon: "🚀",
  },
  {
    id: "evaluator",
    title: "Quality Engineer",
    description: "Complete all Evaluator challenges",
    icon: "📊",
  },
];

export function useAchievements() {
  const [unlocked, setUnlocked] = useState<Achievement[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("achievements");
    if (stored) {
      const ids = JSON.parse(stored) as string[];
      setUnlocked(
        ACHIEVEMENTS.filter((a) => ids.includes(a.id)).map((a) => ({
          ...a,
          unlockedAt: Date.now(),
        }))
      );
    }
  }, []);

  const unlock = (achievementId: string) => {
    if (unlocked.some((a) => a.id === achievementId)) return;

    const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
    if (!achievement) return;

    const updated = [...unlocked, { ...achievement, unlockedAt: Date.now() }];
    setUnlocked(updated);
    localStorage.setItem(
      "achievements",
      JSON.stringify(updated.map((a) => a.id))
    );

    return achievement;
  };

  return { unlocked, unlock, allAchievements: ACHIEVEMENTS };
}

interface Props {
  compact?: boolean;
}

export function AchievementBadges({ compact = false }: Props) {
  const { unlocked, allAchievements } = useAchievements();

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1">
        {unlocked.slice(0, 5).map((a) => (
          <span
            key={a.id}
            title={a.title}
            className="text-lg transition-all duration-200-transform hover:scale-110 cursor-pointer"
          >
            {a.icon}
          </span>
        ))}
        {unlocked.length > 5 && (
          <span className="rounded-full bg-gray-200 px-1.5 text-xs text-gray-600 dark:bg-[#2563EB] dark:text-gray-400">
            +{unlocked.length - 5}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-[#2563EB]">
      <h3 className="text-sm font-semibold">Achievements</h3>
      <p className="mt-1 text-xs text-gray-500">
        {unlocked.length} / {allAchievements.length} unlocked
      </p>

      <div className="mt-4 grid gap-2">
        {allAchievements.map((achievement) => {
          const isUnlocked = unlocked.some((u) => u.id === achievement.id);
          return (
            <div
              key={achievement.id}
              className={`flex items-center gap-3 rounded-lg border p-2 transition-all duration-200-all duration-200 ${
                isUnlocked
                  ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                  : "border-gray-200 bg-gray-50/50 opacity-50 dark:border-gray-800 dark:bg-gray-900/50"
              }`}
            >
              <span className="text-2xl">{achievement.icon}</span>
              <div>
                <p className="text-xs font-medium">{achievement.title}</p>
                <p className="text-[10px] text-gray-500">
                  {achievement.description}
                </p>
              </div>
              {isUnlocked && (
                <span className="ml-auto text-emerald-600 dark:text-emerald-400">
                  ✓
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Toast notification for achievement unlock
export function AchievementToast({
  achievement,
  onClose,
}: {
  achievement: Achievement;
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-4 shadow-2xl dark:border-amber-900/50 dark:from-amber-950/80 dark:to-yellow-950/80">
      <div className="flex items-center gap-3">
        <span className="text-4xl">{achievement.icon}</span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Achievement Unlocked!
          </p>
          <p className="text-sm font-bold text-amber-900 dark:text-amber-100">
            {achievement.title}
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-300">
            {achievement.description}
          </p>
        </div>
      </div>
    </div>
  );
}
