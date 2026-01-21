"use client";

import { useLocalProgress } from "@/components/providers/LocalProgressProvider";
import { getLevelInfo } from "@/lib/gamification/xp";

export function HeaderStats() {
  const { state } = useLocalProgress();
  const level = getLevelInfo(state.xp);

  return (
    <div className="flex items-center gap-2">
      {/* Level Badge */}
      <div className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-800">
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
          Lv. {level.level}
        </span>
      </div>

      {/* XP */}
      <div className="hidden items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 sm:flex dark:bg-zinc-800">
        <svg className="h-3.5 w-3.5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
        </svg>
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
          {state.xp.toLocaleString()}
        </span>
      </div>

      {/* Streak */}
      {state.streak.streakDays > 0 && (
        <div className="hidden items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-1 md:flex dark:bg-orange-900/30">
          <span className="text-sm">🔥</span>
          <span className="text-xs font-medium text-orange-700 dark:text-orange-300">
            {state.streak.streakDays}
          </span>
        </div>
      )}
    </div>
  );
}
