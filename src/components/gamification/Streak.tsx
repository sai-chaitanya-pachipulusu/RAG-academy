"use client";

import { useEffect, useState } from "react";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string; // YYYY-MM-DD
  weeklyActivity: boolean[]; // Last 7 days
}

function getDateKey(date: Date = new Date()): string {
  return date.toISOString().split("T")[0];
}

function getDaysAgo(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return getDateKey(d);
}

export function useStreak() {
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: "",
    weeklyActivity: [false, false, false, false, false, false, false],
  });

  useEffect(() => {
    const stored = localStorage.getItem("streak_data");
    if (stored) {
      const data = JSON.parse(stored) as StreakData;
      
      // Check if streak is still valid (activity yesterday or today)
      const today = getDateKey();
      const yesterday = getDaysAgo(1);
      
      if (data.lastActivityDate !== today && data.lastActivityDate !== yesterday) {
        // Streak broken!
        data.currentStreak = 0;
      }
      
      // Update weekly activity
      const weekly: boolean[] = [];
      const activityDates = new Set(
        JSON.parse(localStorage.getItem("activity_dates") || "[]")
      );
      for (let i = 6; i >= 0; i--) {
        weekly.push(activityDates.has(getDaysAgo(i)));
      }
      data.weeklyActivity = weekly;
      
      setStreak(data);
    }
  }, []);

  const recordActivity = () => {
    const today = getDateKey();
    
    // Get stored activity dates
    const storedDates = JSON.parse(
      localStorage.getItem("activity_dates") || "[]"
    ) as string[];
    
    if (!storedDates.includes(today)) {
      storedDates.push(today);
      // Keep only last 30 days
      const cutoff = getDaysAgo(30);
      const filtered = storedDates.filter((d) => d >= cutoff);
      localStorage.setItem("activity_dates", JSON.stringify(filtered));
    }

    // Calculate streak
    let newStreak = streak.currentStreak;
    const yesterday = getDaysAgo(1);
    
    if (streak.lastActivityDate === today) {
      // Already recorded today
    } else if (streak.lastActivityDate === yesterday) {
      // Continuing streak
      newStreak += 1;
    } else {
      // Starting new streak
      newStreak = 1;
    }

    const updated: StreakData = {
      currentStreak: newStreak,
      longestStreak: Math.max(streak.longestStreak, newStreak),
      lastActivityDate: today,
      weeklyActivity: streak.weeklyActivity,
    };
    
    // Update today in weekly
    updated.weeklyActivity[6] = true;

    setStreak(updated);
    localStorage.setItem("streak_data", JSON.stringify(updated));
    
    return newStreak;
  };

  return { streak, recordActivity };
}

export function StreakDisplay() {
  const { streak } = useStreak();
  const days = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-orange-50 to-amber-50 p-4 dark:border-gray-800 dark:from-orange-950/30 dark:to-amber-950/30">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Current Streak
          </p>
          <p className="mt-1 text-3xl font-bold text-amber-700 dark:text-amber-300">
            {streak.currentStreak}
            <span className="ml-1 text-lg">🔥</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Best: {streak.longestStreak} days</p>
        </div>
      </div>

      {/* Weekly activity graph */}
      <div className="mt-4">
        <div className="flex justify-between">
          {days.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className={`h-6 w-6 rounded-md transition-all ${
                  streak.weeklyActivity[i]
                    ? "bg-emerald-500 shadow-sm shadow-emerald-500/30"
                    : "bg-gray-200 dark:bg-[#7C3AED]"
                }`}
              />
              <span className="text-[10px] text-gray-500">{day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Compact version for header
export function StreakBadge() {
  const { streak } = useStreak();

  if (streak.currentStreak === 0) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-100 to-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:from-orange-950/50 dark:to-amber-950/50 dark:text-amber-300">
      {streak.currentStreak}🔥
    </span>
  );
}
