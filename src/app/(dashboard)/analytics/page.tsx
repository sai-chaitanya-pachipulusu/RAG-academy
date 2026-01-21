"use client";

import { useState } from "react";
import { ProgressAnalytics } from "@/components/analytics/ProgressAnalytics";
import { Leaderboard } from "@/components/gamification/Leaderboard";

type Tab = "progress" | "leaderboard";

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("progress");

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Analytics & Ranking
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
           Track your growth and compare with the community.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex gap-6 px-1">
          <button
            onClick={() => setActiveTab("progress")}
            className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors ${
              activeTab === "progress"
                ? "border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <span>📊</span>
             My Progress
          </button>
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors ${
              activeTab === "leaderboard"
                ? "border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <span>🏆</span>
             Leaderboard
          </button>
        </div>
      </div>

      <main>
        {activeTab === "progress" && (
           <div className="flex flex-col gap-8">
             <ProgressAnalytics />
             
             {/* Tips Section */}
             <section className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
               <h2 className="text-lg font-semibold">💡 Pro Tips</h2>
               <ul className="mt-4 space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                 <li className="flex gap-2">
                   <span>🎯</span>
                   <span>
                     <strong>Consistency beats intensity.</strong> Solve 1 challenge
                     daily rather than 10 on weekends.
                   </span>
                 </li>
                 <li className="flex gap-2">
                   <span>📖</span>
                   <span>
                     <strong>Read solutions even when you pass.</strong> There's often
                     a more elegant approach.
                   </span>
                 </li>
                 <li className="flex gap-2">
                   <span>🔄</span>
                   <span>
                     <strong>Retry challenges after a week.</strong> Spaced repetition
                     builds long-term memory.
                   </span>
                 </li>
               </ul>
             </section>
           </div>
        )}

        {activeTab === "leaderboard" && (
          <div className="flex flex-col gap-6">
            {/* Stats cards restored from Leaderboard page */}
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-zinc-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-4 dark:border-zinc-800 dark:from-amber-950/20 dark:to-yellow-950/20">
                <p className="text-xs font-medium uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Your Rank
                </p>
                <p className="mt-1 text-3xl font-bold text-amber-700 dark:text-amber-300">
                  #42
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-4 dark:border-zinc-800 dark:from-indigo-950/20 dark:to-blue-950/20">
                <p className="text-xs font-medium uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Total XP
                </p>
                <p className="mt-1 text-3xl font-bold text-indigo-700 dark:text-indigo-300">
                  1,250
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 dark:border-zinc-800 dark:from-emerald-950/20 dark:to-teal-950/20">
                <p className="text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Challenges
                </p>
                <p className="mt-1 text-3xl font-bold text-emerald-700 dark:text-emerald-300">
                  15
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-gradient-to-br from-orange-50 to-red-50 p-4 dark:border-zinc-800 dark:from-orange-950/20 dark:to-red-950/20">
                <p className="text-xs font-medium uppercase tracking-wider text-orange-600 dark:text-orange-400">
                  Current Streak
                </p>
                <p className="mt-1 text-3xl font-bold text-orange-700 dark:text-orange-300">
                  🔥 5
                </p>
              </div>
            </div>
            
            <Leaderboard />
          </div>
        )}
      </main>
    </div>
  );
}
