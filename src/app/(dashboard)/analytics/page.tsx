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
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">Analytics & Ranking</h1>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          Track your growth and compare with the community.
        </p>
      </header>

      {/* Tabs */}
      <div className="inline-flex gap-1 rounded-full border border-gray-200 bg-gray-50 p-1">
        {(["progress", "leaderboard"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
              activeTab === tab
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            {tab === "progress" ? "My Progress" : "Leaderboard"}
          </button>
        ))}
      </div>

      <main>
        {activeTab === "progress" && (
          <div className="flex flex-col gap-4">
            {userId ? (
              <AnalyticsDashboard userId={userId} />
            ) : (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-800 dark:bg-gray-900">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Please sign in to view your analytics
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "leaderboard" && (
          <div className="flex flex-col gap-4">
            <Leaderboard />
          </div>
        )}
      </main>
    </div>
  );
}
