"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";
import { useLocalProgress } from "@/components/providers/LocalProgressProvider";
import {
  fetchGlobalLeaderboard,
  fetchGlobalLeaderboardWithStatus,
  fetchUserRank,
  subscribeToLeaderboard,
  type LeaderboardEntry,
  type LeaderboardTimeFilter,
} from "@/lib/supabase/leaderboard";

type TimeFilterOption = {
  id: LeaderboardTimeFilter;
  label: string;
};

const TIME_FILTERS: TimeFilterOption[] = [
  { id: "daily", label: "Today" },
  { id: "weekly", label: "This Week" },
  { id: "monthly", label: "This Month" },
  { id: "all_time", label: "All Time" },
];

function getRankBadge(rank: number) {
  if (rank === 1) return { icon: "🥇", bg: "bg-gradient-to-r from-yellow-400 to-amber-500", text: "text-yellow-900" };
  if (rank === 2) return { icon: "🥈", bg: "bg-gradient-to-r from-[#8B5CF6]-300 to-[#8B5CF6]-400", text: "text-gray-800" };
  if (rank === 3) return { icon: "🥉", bg: "bg-gradient-to-r from-amber-600 to-orange-700", text: "text-amber-100" };
  return null;
}

function formatXP(xp: number): string {
  if (xp >= 10000) return `${(xp / 1000).toFixed(1)}k`;
  return xp.toLocaleString();
}

export function GlobalLeaderboard() {
  const { user } = useSupabaseAuth();
  const { state } = useLocalProgress();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<LeaderboardTimeFilter>("weekly");
  const [userRank, setUserRank] = useState<number | null>(null);
  const [isRealTime, setIsRealTime] = useState(false);
  const [isLiveData, setIsLiveData] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchGlobalLeaderboardWithStatus(50, timeFilter);
      setEntries(result.entries);
      setIsLiveData(result.isLive);
      setStatusMessage(result.error || null);
      
      if (user) {
        const rank = await fetchUserRank(user.id);
        setUserRank(rank);
      }
    } finally {
      setLoading(false);
    }
  }, [timeFilter, user]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  // Real-time subscription
  useEffect(() => {
    const cleanup = subscribeToLeaderboard((newEntries) => {
      setEntries(newEntries);
      setIsRealTime(true);
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-[#7C3AED]">
      {/* Header */}
      <div className="border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 dark:border-gray-800 dark:from-indigo-950/30 dark:to-purple-950/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Global Leaderboard</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isLiveData && isRealTime && (
                  <span className="mr-2 inline-flex items-center gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                    </span>
                    Live
                  </span>
                )}
                {isLiveData ? "Top RAG Academy performers" : "Sign in to join the leaderboard"}
              </p>
            </div>
          </div>
          
          {/* Time filter */}
          <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-[#7C3AED]">
            {TIME_FILTERS.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setTimeFilter(filter.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200-all duration-200 ${
                  timeFilter === filter.id
                    ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Your Stats (if logged in) */}
      {user && (
        <div className="border-b border-gray-100 bg-indigo-50/50 px-6 py-3 dark:border-gray-800 dark:bg-indigo-950/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                {userRank ? `#${userRank}` : "—"}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Your Rank</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {state.xp.toLocaleString()} XP • {state.streak.streakDays} day streak
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {state.xp.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Total XP</p>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
        </div>
      ) : (
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {entries.map((entry, idx) => {
            const badge = getRankBadge(entry.rank);
            const isCurrentUser = user?.id === entry.userId;

            return (
              <div
                key={entry.userId}
                className={`flex items-center gap-4 px-6 py-3 transition-all duration-200-all duration-200 ${
                  isCurrentUser
                    ? "bg-indigo-50 dark:bg-indigo-950/30"
                    : "hover:bg-gray-50 dark:hover:bg-gray-900/50"
                }`}
              >
                {/* Rank */}
                <div className="w-12 shrink-0">
                  {badge ? (
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm ${badge.bg} ${badge.text}`}
                    >
                      {badge.icon}
                    </span>
                  ) : (
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600 dark:bg-[#7C3AED] dark:text-gray-400">
                      {entry.rank}
                    </span>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium truncate ${
                      isCurrentUser
                        ? "text-indigo-700 dark:text-indigo-300"
                        : "text-gray-900 dark:text-white"
                    }`}>
                      {isCurrentUser ? "You" : entry.username}
                    </span>
                    {entry.streakDays >= 7 && (
                      <span className="shrink-0 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                        🔥 {entry.streakDays}d streak
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {entry.challengesCompleted} challenges completed
                  </p>
                </div>

                {/* XP */}
                <div className="text-right shrink-0">
                  <p className={`text-lg font-bold ${
                    badge
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-gray-700 dark:text-gray-300"
                  }`}>
                    {formatXP(entry.xp)}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400">XP</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-100 bg-gray-50 px-6 py-3 dark:border-gray-800 dark:bg-gray-900/50">
        {statusMessage && !isLiveData ? (
          <div className="text-center">
            <p className="text-xs text-amber-600 dark:text-amber-400 mb-2">
              {statusMessage}
            </p>
            {!user && (
              <Link
                href="/auth/login"
                className="inline-flex h-8 items-center justify-center rounded-full bg-indigo-600 px-4 text-xs font-medium text-white hover:bg-indigo-500 cursor-pointer"
              >
                Sign up to compete →
              </Link>
            )}
          </div>
        ) : (
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            Complete challenges to climb the leaderboard • Earn XP and maintain streaks
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Compact leaderboard widget for sidebar/dashboard.
 */
export function LeaderboardWidget() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGlobalLeaderboard(5, "weekly")
      .then(setEntries)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-[#7C3AED]">
        <div className="flex items-center justify-center py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-[#7C3AED]">
      <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          <span>🏆</span>
          <span>Top 5 This Week</span>
        </h3>
      </div>
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {entries.map((entry) => (
          <div
            key={entry.userId}
            className="flex items-center justify-between px-4 py-2.5"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm">
                {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : `#${entry.rank}`}
              </span>
              <span className="truncate text-sm text-gray-700 dark:text-gray-300">
                {entry.username}
              </span>
            </div>
            <span className="shrink-0 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
              {formatXP(entry.xp)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
