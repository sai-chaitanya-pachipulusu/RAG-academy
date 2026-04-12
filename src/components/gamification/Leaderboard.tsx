"use client";

import { useState, useEffect } from "react";

interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string;
  xp: number;
  challengesCompleted: number;
  streak: number;
  country?: string;
}

// Mock data - in production, this would come from an API
const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, username: "rag_master_alice", avatar: "👩‍💻", xp: 4250, challengesCompleted: 42, streak: 28, country: "🇺🇸" },
  { rank: 2, username: "vector_pro_bob", avatar: "👨‍💻", xp: 3890, challengesCompleted: 38, streak: 21, country: "🇬🇧" },
  { rank: 3, username: "embedding_queen", avatar: "👸", xp: 3650, challengesCompleted: 35, streak: 14, country: "🇨🇦" },
  { rank: 4, username: "retrieval_ninja", avatar: "🥷", xp: 3420, challengesCompleted: 33, streak: 19, country: "🇯🇵" },
  { rank: 5, username: "ml_engineer_42", avatar: "🤖", xp: 3100, challengesCompleted: 30, streak: 12, country: "🇩🇪" },
  { rank: 6, username: "deep_learner", avatar: "🧠", xp: 2850, challengesCompleted: 28, streak: 8, country: "🇫🇷" },
  { rank: 7, username: "ai_researcher", avatar: "📚", xp: 2600, challengesCompleted: 25, streak: 15, country: "🇰🇷" },
  { rank: 8, username: "data_scientist", avatar: "📊", xp: 2400, challengesCompleted: 23, streak: 5, country: "🇮🇳" },
  { rank: 9, username: "code_wizard", avatar: "🧙", xp: 2200, challengesCompleted: 21, streak: 7, country: "🇧🇷" },
  { rank: 10, username: "python_dev", avatar: "🐍", xp: 2000, challengesCompleted: 19, streak: 3, country: "🇦🇺" },
];

type TimeFilter = "daily" | "weekly" | "monthly" | "all_time";

interface LeaderboardProps {
  currentUserXP?: number;
  currentUserChallenges?: number;
}

export function Leaderboard({ currentUserXP = 1200, currentUserChallenges = 12 }: LeaderboardProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("weekly");
  const [entries, setEntries] = useState<LeaderboardEntry[]>(MOCK_LEADERBOARD);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    // Simulate different data for different time periods
    const multipliers: Record<TimeFilter, number> = {
      daily: 0.1,
      weekly: 0.3,
      monthly: 0.7,
      all_time: 1,
    };

    const adjustedEntries = MOCK_LEADERBOARD.map((entry) => ({
      ...entry,
      xp: Math.round(entry.xp * multipliers[timeFilter]),
    })).sort((a, b) => b.xp - a.xp);

    // Re-rank
    adjustedEntries.forEach((entry, i) => {
      entry.rank = i + 1;
    });

    setEntries(adjustedEntries);

    // Calculate user's rank
    const adjustedUserXP = Math.round(currentUserXP * multipliers[timeFilter]);
    const rank = adjustedEntries.filter((e) => e.xp > adjustedUserXP).length + 1;
    setUserRank(rank);
  }, [timeFilter, currentUserXP]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { icon: "🥇", color: "from-yellow-400 to-amber-500" };
    if (rank === 2) return { icon: "🥈", color: "from-[#8B5CF6]-300 to-[#8B5CF6]-400" };
    if (rank === 3) return { icon: "🥉", color: "from-amber-600 to-orange-700" };
    return null;
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-[#7C3AED]">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            <span>🏆</span>
            <span>Leaderboard</span>
          </h2>
          
          {/* Time filter */}
          <div className="flex rounded-lg border border-gray-200 p-1 dark:border-gray-800">
            {(["daily", "weekly", "monthly", "all_time"] as TimeFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                  timeFilter === filter
                    ? "bg-[#8B5CF6] text-white dark:bg-white dark:text-gray-900"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                {filter.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        {/* User's rank */}
        {userRank && (
          <div className="mt-3 flex items-center justify-between rounded-lg bg-indigo-50 px-3 py-2 dark:bg-indigo-950/30">
            <div className="flex items-center gap-2">
              <span className="text-lg">👤</span>
              <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                Your Rank
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                #{userRank}
              </span>
              <span className="text-sm text-indigo-500">
                {Math.round(currentUserXP * (timeFilter === "daily" ? 0.1 : timeFilter === "weekly" ? 0.3 : timeFilter === "monthly" ? 0.7 : 1))} XP
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard entries */}
      <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
        {entries.map((entry) => {
          const badge = getRankBadge(entry.rank);
          return (
            <div
              key={entry.username}
              className={`flex items-center gap-3 p-3 transition ${
                entry.rank <= 3
                  ? "bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-950/10"
                  : "hover:bg-gray-50 dark:hover:bg-gray-900/50"
              }`}
            >
              {/* Rank */}
              <div className="flex w-10 items-center justify-center">
                {badge ? (
                  <span className="text-2xl">{badge.icon}</span>
                ) : (
                  <span className="text-sm font-bold text-gray-400">
                    #{entry.rank}
                  </span>
                )}
              </div>

              {/* Avatar & Name */}
              <div className="flex flex-1 items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#8B5CF6]-100 to-[#8B5CF6]-200 text-xl dark:from-[#8B5CF6]-800 dark:to-[#8B5CF6]-900">
                  {entry.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {entry.username}
                    </p>
                    {entry.country && (
                      <span className="text-sm">{entry.country}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {entry.challengesCompleted} challenges
                    {entry.streak > 7 && (
                      <span className="ml-2 text-orange-500">
                        🔥 {entry.streak}d
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* XP */}
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {entry.xp.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">XP</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load more */}
      <div className="border-t border-gray-200 p-3 dark:border-gray-800">
        <button className="w-full rounded-lg border border-gray-200 py-2 text-sm text-gray-600 transition hover:bg-gray-50 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-900 cursor-pointer">
          View Full Leaderboard
        </button>
      </div>
    </div>
  );
}

// Compact leaderboard widget for sidebar
export function LeaderboardWidget() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-[#7C3AED]">
      <h3 className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">
        <span>🏆</span>
        <span>Top 3 This Week</span>
      </h3>
      <div className="mt-2 space-y-1.5">
        {MOCK_LEADERBOARD.slice(0, 3).map((entry) => (
          <div
            key={entry.username}
            className="flex items-center gap-2 text-xs"
          >
            <span>{entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉"}</span>
            <span className="flex-1 truncate text-gray-700 dark:text-gray-300">
              {entry.username}
            </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {entry.xp.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
