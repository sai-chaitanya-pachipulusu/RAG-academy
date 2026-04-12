"use client";

import { useState, useEffect } from "react";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  freezeDaysRemaining: number;
  totalDaysActive: number;
}

const STREAK_KEY = "rag_academy_streak";

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

function getYesterdayString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split("T")[0];
}

export function useStreak() {
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: "",
    freezeDaysRemaining: 1,
    totalDaysActive: 0,
  });

  useEffect(() => {
    const stored = localStorage.getItem(STREAK_KEY);
    if (stored) {
      const data = JSON.parse(stored) as StreakData;
      
      // Check if streak is still valid
      const today = getTodayString();
      const yesterday = getYesterdayString();
      
      if (data.lastActiveDate === today) {
        // Already active today
        setStreak(data);
      } else if (data.lastActiveDate === yesterday) {
        // Still valid, but not yet active today
        setStreak(data);
      } else if (data.freezeDaysRemaining > 0) {
        // Use freeze day
        setStreak({
          ...data,
          freezeDaysRemaining: data.freezeDaysRemaining - 1,
        });
      } else {
        // Streak broken
        setStreak({
          ...data,
          currentStreak: 0,
        });
      }
    }
  }, []);

  const recordActivity = () => {
    const today = getTodayString();
    
    setStreak((prev) => {
      if (prev.lastActiveDate === today) {
        return prev; // Already recorded today
      }

      const isConsecutive = prev.lastActiveDate === getYesterdayString();
      const newStreak = isConsecutive ? prev.currentStreak + 1 : 1;
      const newLongest = Math.max(prev.longestStreak, newStreak);

      const updated: StreakData = {
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastActiveDate: today,
        freezeDaysRemaining: prev.freezeDaysRemaining,
        totalDaysActive: prev.totalDaysActive + 1,
      };

      localStorage.setItem(STREAK_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const useFreeze = () => {
    if (streak.freezeDaysRemaining > 0) {
      const updated = {
        ...streak,
        freezeDaysRemaining: streak.freezeDaysRemaining - 1,
        lastActiveDate: getYesterdayString(), // Pretend yesterday was active
      };
      setStreak(updated);
      localStorage.setItem(STREAK_KEY, JSON.stringify(updated));
    }
  };

  return { streak, recordActivity, useFreeze };
}

interface StreakWidgetProps {
  compact?: boolean;
}

export function DailyStreak({ compact = false }: StreakWidgetProps) {
  const { streak } = useStreak();
  const today = getTodayString();
  const isActiveToday = streak.lastActiveDate === today;

  // Generate last 7 days for visualization
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split("T")[0];
  });

  if (compact) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 px-3 py-2 dark:border-orange-900/50 dark:from-orange-950/30 dark:to-amber-950/30">
        <span className="text-2xl">🔥</span>
        <div>
          <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
            {streak.currentStreak}
          </p>
          <p className="text-[10px] text-orange-700/70 dark:text-orange-300/70">
            day streak
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-4 dark:border-orange-900/50 dark:from-orange-950/20 dark:to-amber-950/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-2xl shadow-lg shadow-orange-200 dark:shadow-orange-900/30">
            🔥
          </div>
          <div>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {streak.currentStreak}
            </p>
            <p className="text-xs text-orange-700/70 dark:text-orange-300/70">
              day streak
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Best: <span className="font-bold">{streak.longestStreak}</span>
          </p>
          <p className="text-xs text-gray-500">
            Total: {streak.totalDaysActive} days
          </p>
        </div>
      </div>

      {/* Week visualization */}
      <div className="mt-4 flex justify-between gap-1">
        {last7Days.map((day, i) => {
          const isToday = day === today;
          const isActive = day <= streak.lastActiveDate && streak.currentStreak > (6 - i);
          
          return (
            <div key={day} className="flex flex-col items-center">
              <div
                className={`h-6 w-6 rounded-md transition-all ${
                  isActive
                    ? "bg-gradient-to-br from-orange-400 to-red-500 shadow-sm"
                    : isToday
                    ? "border-2 border-dashed border-orange-300 dark:border-orange-700"
                    : "bg-gray-200 dark:bg-[#7C3AED]"
                }`}
              />
              <span className="mt-1 text-[9px] text-gray-500">
                {["S", "M", "T", "W", "T", "F", "S"][new Date(day).getDay()]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Freeze days */}
      {streak.freezeDaysRemaining > 0 && (
        <div className="mt-3 flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
          <span>❄️</span>
          <span>{streak.freezeDaysRemaining} freeze day available</span>
        </div>
      )}

      {/* Status message */}
      <div className="mt-3 rounded-lg bg-white/50 px-3 py-2 text-center dark:bg-black/20">
        {isActiveToday ? (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            ✓ You're on fire today! Keep it up! 🎉
          </p>
        ) : (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Complete a challenge to continue your streak!
          </p>
        )}
      </div>
    </div>
  );
}

// Milestone badges
export function StreakMilestones() {
  const { streak } = useStreak();

  const milestones = [
    { days: 3, icon: "🔥", title: "Getting Warm" },
    { days: 7, icon: "⚡", title: "On Fire" },
    { days: 14, icon: "💪", title: "Dedicated" },
    { days: 30, icon: "🏆", title: "Champion" },
    { days: 60, icon: "👑", title: "Legend" },
    { days: 100, icon: "💎", title: "Diamond" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {milestones.map((m) => {
        const achieved = streak.longestStreak >= m.days;
        return (
          <div
            key={m.days}
            className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
              achieved
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                : "bg-gray-100 text-gray-400 dark:bg-[#7C3AED] dark:text-gray-600"
            }`}
          >
            <span>{m.icon}</span>
            <span>{m.days}d</span>
          </div>
        );
      })}
    </div>
  );
}
