import { GlobalLeaderboard } from "@/components/gamification/GlobalLeaderboard";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

const MILESTONES = [
  { label: "Bronze", xp: "500 XP", color: "text-amber-700 dark:text-amber-400" },
  { label: "Silver", xp: "1,500 XP", color: "text-zinc-600 dark:text-zinc-300" },
  { label: "Gold", xp: "3,000 XP", color: "text-yellow-600 dark:text-yellow-400" },
  { label: "Diamond", xp: "5,000 XP", color: "text-blue-600 dark:text-blue-400" },
];

const XP_RULES = [
  { label: "Easy Challenge", xp: "+25 XP" },
  { label: "Medium Challenge", xp: "+50-75 XP" },
  { label: "Hard Challenge", xp: "+100-150 XP" },
  { label: "7-Day Streak", xp: "+50 XP" },
];

export default function LeaderboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Leaderboard</h1>
        <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
          See how you rank against other learners.
        </p>
      </div>

      <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 dark:border-indigo-900/30 dark:from-indigo-950/20 dark:to-purple-950/20">
        <h2 className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">How to Earn XP</h2>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {XP_RULES.map((rule) => (
            <div key={rule.label} className="rounded-md bg-white/60 p-2.5 dark:bg-white/5">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{rule.label}</p>
              <p className="mt-0.5 text-sm font-bold text-indigo-600 dark:text-indigo-400">{rule.xp}</p>
            </div>
          ))}
        </div>
      </Card>

      <GlobalLeaderboard />

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-white">Want to climb the ranks?</p>
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
              Start solving challenges to earn XP.
            </p>
          </div>
          <Link
            href="/challenges"
            className="shrink-0 rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Start Challenges
          </Link>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {MILESTONES.map((m) => (
          <Card key={m.label} className="p-3 text-center">
            <p className={`text-sm font-semibold ${m.color}`}>{m.label}</p>
            <p className="text-xs text-zinc-500">{m.xp}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
