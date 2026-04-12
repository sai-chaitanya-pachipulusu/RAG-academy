
import { useEffect, useState } from "react";
import { fetchLeaderboard } from "@/lib/supabase/arena";
import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";

type LeaderboardEntry = {
  user_id: string;
  score: number;
  latency_ms: number | null;
  created_at: string;
  profiles: { xp: number } | null;
};

export function Leaderboard({ slug }: { slug: string }) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSupabaseAuth();

  useEffect(() => {
    fetchLeaderboard(slug)
      .then((data) => setEntries((data as any) || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="text-xs text-gray-500">Loading ranks...</div>;
  if (entries.length === 0) return <div className="text-xs text-gray-500">Be the first to submit a score!</div>;

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-[#2563EB]">
      <div className="border-b border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Top Performers</h3>
      </div>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-gray-500 dark:text-gray-400">
            <th className="px-4 py-2 font-medium">Rank</th>
            <th className="px-4 py-2 font-medium">User</th>
            <th className="px-4 py-2 font-medium">Score</th>
            <th className="px-4 py-2 font-medium">Latency</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => {
            const isMe = user?.id === entry.user_id;
            return (
              <tr
                key={i}
                className={`border-b border-gray-50 last:border-0 dark:border-gray-800/50 ${
                  isMe ? "bg-indigo-50/50 dark:bg-indigo-900/10" : ""
                }`}
              >
                <td className="px-4 py-2 text-gray-500">#{i + 1}</td>
                <td className="px-4 py-2">
                  <span className={isMe ? "font-semibold text-indigo-700 dark:text-indigo-300" : "text-gray-700 dark:text-gray-300"}>
                    {isMe ? "You" : `User ${entry.user_id.slice(0, 4)}`}
                  </span>
                  {entry.profiles?.xp ? (
                    <span className="ml-2 text-[10px] text-gray-400">({entry.profiles.xp} XP)</span>
                  ) : null}
                </td>
                <td className="px-4 py-2 font-mono font-bold text-gray-900 dark:text-gray-100">{entry.score.toFixed(0)}</td>
                <td className="px-4 py-2 font-mono text-gray-500">{entry.latency_ms?.toFixed(1)}ms</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
