"use client";

import { useEffect, useState } from "react";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { Leaderboard } from "@/components/gamification/Leaderboard";
import { getSupabase } from "@/lib/supabase/client";

type Tab = "progress" | "leaderboard";

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("progress");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const supabase = getSupabase();
      if (!supabase) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    
    loadUser();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Analytics & Ranking
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
           Track your growth, analyze your learning patterns, and compare with the community.
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
             {userId ? (
               <AnalyticsDashboard userId={userId} />
             ) : (
               <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
                 <p className="text-zinc-600 dark:text-zinc-400">
                   Please sign in to view your analytics
                 </p>
               </div>
             )}
           </div>
        )}

        {activeTab === "leaderboard" && (
          <div className="flex flex-col gap-6">
            <Leaderboard />
          </div>
        )}
      </main>
    </div>
  );
}
