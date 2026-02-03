"use client";

import Link from "next/link";
import { useLocalProgress } from "@/components/providers/LocalProgressProvider";
import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";
import { DailyStreak } from "@/components/gamification/DailyStreak";
import { TouchCard } from "@/components/ui/TouchButton";
import { TouchButton } from "@/components/ui/TouchButton";
import { CHALLENGES } from "@/lib/challenges/catalog";
import { getLevelInfo } from "@/lib/gamification/xp";

// Quick stats card component
function QuickStatCard({
  label,
  value,
  subtext,
  icon,
  color = "blue",
}: {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  color?: "blue" | "green" | "purple" | "amber";
}) {
  const colorStyles = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
  };

  return (
    <div className={`rounded-2xl border p-4 ${colorStyles[color]}`}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80">
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium opacity-80">{label}</p>
          <p className="text-xl font-bold">{value}</p>
          {subtext && <p className="text-xs opacity-70">{subtext}</p>}
        </div>
      </div>
    </div>
  );
}

// Continue learning card
function ContinueLearningCard() {
  const { state } = useLocalProgress();

  // Find first incomplete challenge
  const continueChallenge = CHALLENGES.find((c) => {
    const progress = state.challenges[c.slug];
    return !progress || progress.status !== "completed";
  });

  if (!continueChallenge) {
    return (
      <TouchCard className="p-5">
        <div className="text-center">
          <div className="mb-3 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-3xl">
              🎉
            </div>
          </div>
          <h3 className="text-lg font-semibold text-zinc-900">
            All caught up!
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            You've completed all available challenges. Check back soon for
            more!
          </p>
          <Link href="/challenges">
            <TouchButton variant="secondary" className="mt-4 w-full">
              Browse Challenges
            </TouchButton>
          </Link>
        </div>
      </TouchCard>
    );
  }

  const progress = state.challenges[continueChallenge.slug];
  const status = progress?.status ?? "not_started";

  return (
    <TouchCard href={`/challenges/${continueChallenge.slug}`} className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-500">
            Continue Learning
          </p>
          <h3 className="mt-1 text-lg font-semibold text-zinc-900">
            {continueChallenge.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-zinc-600">
            {continueChallenge.description}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                status === "completed"
                  ? "bg-emerald-100 text-emerald-700"
                  : status === "in_progress"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-zinc-100 text-zinc-600"
              }`}
            >
              {status.replace("_", " ")}
            </span>
            <span className="text-xs text-zinc-400">
              {continueChallenge.xpReward} XP
            </span>
          </div>
        </div>
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-2xl">
          {status === "completed" ? "✅" : status === "in_progress" ? "📝" : "🆕"}
        </div>
      </div>
      <div className="mt-4">
        <TouchButton className="w-full">Continue</TouchButton>
      </div>
    </TouchCard>
  );
}

// Recent activity list
function RecentActivity() {
  const { state } = useLocalProgress();

  // Get recent challenges (completed or attempted)
  const recentActivity = Object.entries(state.challenges)
    .filter(([, progress]) => progress.status !== "not_started")
    .sort(([, a], [, b]) => {
      // Sort by status (completed first) then by attempts
      if (a.status === "completed" && b.status !== "completed") return -1;
      if (a.status !== "completed" && b.status === "completed") return 1;
      return (b.attempts || 0) - (a.attempts || 0);
    })
    .slice(0, 5);

  if (recentActivity.length === 0) {
    return (
      <TouchCard className="p-5">
        <p className="text-center text-sm text-zinc-500">
          No recent activity. Start your first challenge!
        </p>
        <Link href="/challenges">
          <TouchButton className="mt-3 w-full">Start Learning</TouchButton>
        </Link>
      </TouchCard>
    );
  }

  return (
    <div className="space-y-3">
      {recentActivity.map(([slug, progress]) => (
        <Link key={slug} href={`/challenges/${slug}`}>
          <TouchCard className="p-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${
                  progress.status === "completed"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {progress.status === "completed" ? (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-zinc-900">
                  {slug}
                </p>
                <p className="text-xs text-zinc-500">
                  {progress.status === "completed"
                    ? "Completed"
                    : `${progress.attempts || 0} attempts`}
                </p>
              </div>
              <svg
                className="h-5 w-5 flex-shrink-0 text-zinc-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </TouchCard>
        </Link>
      ))}
    </div>
  );
}

// Streak widget
function StreakWidget() {
  const { state } = useLocalProgress();
  const streakDays = state.streak?.streakDays || 0;

  return (
    <TouchCard className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-500">Current Streak</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-zinc-900">
              {streakDays}
            </span>
            <span className="text-sm text-zinc-500">days</span>
          </div>

        </div>
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 text-3xl shadow-lg">
          🔥
        </div>
      </div>
      <div className="mt-4">
        <DailyStreak compact />
      </div>
    </TouchCard>
  );
}

export default function MobileDashboardPage() {
  const { state } = useLocalProgress();
  const { user } = useSupabaseAuth();

  // Calculate XP from state
  const xp = state.xp || 0;

  const level = getLevelInfo(xp);

  return (
    <div className="min-h-screen bg-zinc-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 px-4 py-4 backdrop-blur-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">
              Hi, {user?.email?.split("@")[0] || "Learner"}!
            </h1>
            <p className="text-sm text-zinc-500">
              Level {level.level} · {xp} XP
            </p>
          </div>
          <Link
            href="/settings"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100"
          >
            <svg
              className="h-5 w-5 text-zinc-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="space-y-6 p-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <QuickStatCard
            label="Challenges"
            value={Object.values(state.challenges).filter(
              (c) => c.status === "completed"
            ).length}
            subtext="completed"
            icon={
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            color="green"
          />
          <QuickStatCard
            label="XP Earned"
            value={xp}
            subtext={`Level ${level.level}`}
            icon={
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            }
            color="amber"
          />
        </div>

        {/* Continue Learning */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900">
            Continue Learning
          </h2>
          <ContinueLearningCard />
        </section>

        {/* Streak */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900">
            Your Streak
          </h2>
          <StreakWidget />
        </section>

        {/* Recent Activity */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900">
              Recent Activity
            </h2>
            <Link
              href="/submissions"
              className="text-sm font-medium text-zinc-600"
            >
              View All
            </Link>
          </div>
          <RecentActivity />
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/challenges">
              <TouchCard className="flex flex-col items-center justify-center p-5 text-center">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                  💻
                </div>
                <p className="font-medium text-zinc-900">Practice</p>
                <p className="text-xs text-zinc-500">Solve challenges</p>
              </TouchCard>
            </Link>
            <Link href="/learn">
              <TouchCard className="flex flex-col items-center justify-center p-5 text-center">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-2xl">
                  📚
                </div>
                <p className="font-medium text-zinc-900">Learn</p>
                <p className="text-xs text-zinc-500">Study concepts</p>
              </TouchCard>
            </Link>
            <Link href="/stats">
              <TouchCard className="flex flex-col items-center justify-center p-5 text-center">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-2xl">
                  📊
                </div>
                <p className="font-medium text-zinc-900">Stats</p>
                <p className="text-xs text-zinc-500">Track progress</p>
              </TouchCard>
            </Link>
            <Link href="/leaderboard">
              <TouchCard className="flex flex-col items-center justify-center p-5 text-center">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-2xl">
                  🏆
                </div>
                <p className="font-medium text-zinc-900">Leaderboard</p>
                <p className="text-xs text-zinc-500">See rankings</p>
              </TouchCard>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
