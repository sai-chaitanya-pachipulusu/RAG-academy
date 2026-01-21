import { GlobalLeaderboard } from "@/components/gamification/GlobalLeaderboard";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

export default function LeaderboardPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Leaderboard
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          See how you rank against other RAG Academy learners. Complete challenges, maintain streaks, and climb to the top!
        </p>
      </div>

      {/* How to Earn XP */}
      <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-5 dark:border-indigo-900/30 dark:from-indigo-950/20 dark:to-purple-950/20">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-indigo-900 dark:text-indigo-100">
          <span>⚡</span>
          <span>How to Earn XP</span>
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white/60 p-3 dark:bg-white/5">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Easy Challenge</p>
            <p className="mt-1 text-lg font-bold text-indigo-600 dark:text-indigo-400">+25 XP</p>
          </div>
          <div className="rounded-lg bg-white/60 p-3 dark:bg-white/5">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Medium Challenge</p>
            <p className="mt-1 text-lg font-bold text-indigo-600 dark:text-indigo-400">+50-75 XP</p>
          </div>
          <div className="rounded-lg bg-white/60 p-3 dark:bg-white/5">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Hard Challenge</p>
            <p className="mt-1 text-lg font-bold text-indigo-600 dark:text-indigo-400">+100-150 XP</p>
          </div>
          <div className="rounded-lg bg-white/60 p-3 dark:bg-white/5">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">7-Day Streak Bonus</p>
            <p className="mt-1 text-lg font-bold text-orange-600 dark:text-orange-400">+50 XP</p>
          </div>
        </div>
      </Card>

      {/* Main Leaderboard */}
      <GlobalLeaderboard />

      {/* CTA */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-white">Want to climb the ranks?</p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Start solving challenges to earn XP and compete with other learners.
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

      {/* Milestones */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 text-center">
          <span className="text-3xl">🥉</span>
          <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-white">Bronze</p>
          <p className="text-xs text-zinc-500">500 XP</p>
        </Card>
        <Card className="p-4 text-center">
          <span className="text-3xl">🥈</span>
          <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-white">Silver</p>
          <p className="text-xs text-zinc-500">1,500 XP</p>
        </Card>
        <Card className="p-4 text-center">
          <span className="text-3xl">🥇</span>
          <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-white">Gold</p>
          <p className="text-xs text-zinc-500">3,000 XP</p>
        </Card>
        <Card className="p-4 text-center">
          <span className="text-3xl">💎</span>
          <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-white">Diamond</p>
          <p className="text-xs text-zinc-500">5,000 XP</p>
        </Card>
      </div>
    </div>
  );
}
