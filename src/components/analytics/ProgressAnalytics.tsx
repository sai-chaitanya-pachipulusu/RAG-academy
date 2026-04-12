"use client";

import { useEffect, useState } from "react";
import type { LocalProgressState } from "@/lib/progress/localStore";

interface ChallengeStats {
  slug: string;
  completedAt?: number;
  attempts: number;
  timeSpent?: number;
}

interface ProgressData {
  totalCompleted: number;
  totalAttempted: number;
  totalXP: number;
  weeklyProgress: number[];
  completionRate: number;
  averageAttempts: number;
  fastestSolve?: { slug: string; time: number };
  mostAttempted?: { slug: string; attempts: number };
  recentActivity: { date: string; count: number }[];
  byDifficulty: { easy: number; medium: number; hard: number };
}

export function useProgressAnalytics(): ProgressData | null {
  const [data, setData] = useState<ProgressData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("rag-academy-progress");
    if (!stored) {
      setData(null);
      return;
    }

    try {
      const progress: LocalProgressState = JSON.parse(stored);
      const completed = Object.values(progress.challenges).filter(
        (c) => c.status === "completed"
      );
      const attempted = Object.values(progress.challenges).filter(
        (c) => c.attempts > 0
      );

      // Weekly progress (last 7 days)
      const weeklyProgress: number[] = [];
      const activityDates = JSON.parse(
        localStorage.getItem("activity_dates") || "[]"
      ) as string[];

      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split("T")[0];
        weeklyProgress.push(activityDates.includes(dateKey) ? 1 : 0);
      }

      // By difficulty (simplified - would need challenge metadata)
      const byDifficulty = { easy: 0, medium: 0, hard: 0 };
      // This would need to be joined with challenge data in real implementation

      // Recent activity
      const recentActivity = activityDates.slice(-14).map((date) => ({
        date,
        count: 1,
      }));

      setData({
        totalCompleted: completed.length,
        totalAttempted: attempted.length,
        totalXP: progress.xp,
        weeklyProgress,
        completionRate:
          attempted.length > 0
            ? Math.round((completed.length / attempted.length) * 100)
            : 0,
        averageAttempts:
          attempted.length > 0
            ? Math.round(
                attempted.reduce((sum, c) => sum + c.attempts, 0) /
                  attempted.length
              )
            : 0,
        recentActivity,
        byDifficulty,
      });
    } catch {
      setData(null);
    }
  }, []);

  return data;
}

export function ProgressAnalytics() {
  const data = useProgressAnalytics();

  if (!data) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-800 dark:bg-gray-900">
        <p className="text-sm text-gray-500">
          Complete some challenges to see your analytics
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Challenges Completed"
          value={data.totalCompleted.toString()}
          icon="✅"
          color="emerald"
        />
        <StatCard
          label="Total XP Earned"
          value={data.totalXP.toLocaleString()}
          icon="⚡"
          color="amber"
        />
        <StatCard
          label="Completion Rate"
          value={`${data.completionRate}%`}
          icon="📈"
          color="blue"
        />
        <StatCard
          label="Avg Attempts"
          value={data.averageAttempts.toString()}
          icon="🔄"
          color="purple"
        />
      </div>

      {/* Weekly Activity */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-[#2563EB]">
        <h3 className="text-sm font-semibold">Weekly Activity</h3>
        <div className="mt-4 flex justify-between gap-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
            <div key={day} className="flex flex-col items-center gap-1">
              <div
                className={`h-8 w-8 rounded-lg transition-all duration-200-all duration-200 ${
                  data.weeklyProgress[i]
                    ? "bg-emerald-500 shadow-sm shadow-emerald-500/30"
                    : "bg-gray-100 dark:bg-[#2563EB]"
                }`}
              />
              <span className="text-[10px] text-gray-500">{day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Over Time */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-[#2563EB]">
        <h3 className="text-sm font-semibold">Progress Trajectory</h3>
        <p className="mt-1 text-xs text-gray-500">
          Your learning journey over the last 30 days
        </p>
        <div className="mt-4 flex h-24 items-end gap-0.5">
          {Array.from({ length: 30 }).map((_, i) => {
            const hasActivity = data.recentActivity.some(
              (a) => new Date(a.date).getDate() === i + 1
            );
            return (
              <div
                key={i}
                className={`flex-1 rounded-t transition-all duration-200-all duration-200 ${
                  hasActivity
                    ? "bg-indigo-500"
                    : "bg-gray-100 dark:bg-[#2563EB]"
                }`}
                style={{
                  height: hasActivity ? `${30 + Math.random() * 70}%` : "10%",
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Achievements Preview */}
      <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-4 dark:border-gray-800 dark:from-amber-950/30 dark:to-yellow-950/30">
        <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
          🏆 Next Milestones
        </h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <MilestoneCard
            title="Vector Master"
            current={data.totalCompleted}
            target={4}
            icon="🗃️"
          />
          <MilestoneCard
            title="100 XP Club"
            current={data.totalXP}
            target={100}
            icon="⚡"
          />
          <MilestoneCard
            title="Perfect Week"
            current={data.weeklyProgress.filter((d) => d).length}
            target={7}
            icon="📅"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: string;
  color: "emerald" | "amber" | "blue" | "purple";
}) {
  const colorClasses = {
    emerald:
      "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20",
    amber:
      "border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20",
    blue: "border-blue-200 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-950/20",
    purple:
      "border-purple-200 bg-purple-50/50 dark:border-purple-900/50 dark:bg-purple-950/20",
  };

  return (
    <div className={`rounded-xl border p-4 ${colorClasses[color]}`}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
        {value}
      </p>
    </div>
  );
}

function MilestoneCard({
  title,
  current,
  target,
  icon,
}: {
  title: string;
  current: number;
  target: number;
  icon: string;
}) {
  const progress = Math.min((current / target) * 100, 100);
  const isComplete = current >= target;

  return (
    <div
      className={`rounded-lg border p-3 ${
        isComplete
          ? "border-emerald-300 bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/50"
          : "border-gray-200 bg-white dark:border-gray-800 dark:bg-[#2563EB]"
      }`}
    >
      <div className="flex items-center gap-2">
        <span>{icon}</span>
        <span className="text-xs font-medium">{title}</span>
        {isComplete && <span className="text-emerald-600">✓</span>}
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-[#2563EB]">
        <div
          className="h-full bg-amber-500 transition-all duration-200-all duration-200 cursor-pointer"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-1 text-[10px] text-gray-500">
        {current} / {target}
      </p>
    </div>
  );
}
