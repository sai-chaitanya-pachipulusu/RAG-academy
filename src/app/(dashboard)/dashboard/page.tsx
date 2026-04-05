"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { ContinueCard } from "@/components/dashboard/ContinueCard";
import { Card } from "@/components/ui/Card";
import { EventBanner } from "@/components/events/WeeklyEventsCard";
import { LeaderboardWidget } from "@/components/gamification/GlobalLeaderboard";
import { DailyStreak } from "@/components/gamification/DailyStreak";
import { PersonalizedRecommendations } from "@/components/recommendations/PersonalizedRecommendations";
import { DailyQuizWidget } from "@/components/mobile/QuickQuiz";

function OnboardingCheck() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const onboarding = localStorage.getItem("rag_academy_onboarding");
    if (!onboarding) {
      setShowOnboarding(true);
    }
  }, []);

  if (!showOnboarding) return null;

  return (
    <div className="rounded-lg border-2 border-dashed border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900 dark:bg-blue-950/20">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
          <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
            Welcome! Let's personalize your experience
          </h3>
          <p className="text-xs text-blue-700/70 dark:text-blue-300/70">
            Take 30 seconds to set up your learning preferences
          </p>
        </div>
        <Link
          href="/onboarding"
          className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-500"
        >
          Get Started
        </Link>
        <button
          onClick={() => {
            localStorage.setItem("rag_academy_onboarding", JSON.stringify({ skipped: true }));
            setShowOnboarding(false);
          }}
          className="text-xs text-blue-600/70 hover:text-blue-800 dark:text-blue-400/70 dark:hover:text-blue-300"
        >
          Skip
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
          Your progress and quick links
        </p>
      </div>

      <OnboardingCheck />
      <EventBanner />
      <DashboardStats />

      {/* Continue + Streak + Quiz */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ContinueCard />
        </div>
        <div className="space-y-3">
          <DailyStreak compact />
          <DailyQuizWidget />
        </div>
      </div>

      {/* Recommendations + Leaderboard */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PersonalizedRecommendations limit={4} />
        </div>
        <div>
          <LeaderboardWidget />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm font-medium">Start learning</p>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            Jump into the foundations track.
          </p>
          <Link
            href="/learn"
            className="mt-2 inline-flex h-8 items-center justify-center rounded-full bg-zinc-900 px-4 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Go to Learn
          </Link>
        </Card>

        <Card className="p-4">
          <p className="text-sm font-medium">Production Templates</p>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            Download Python or Node.js baselines.
          </p>
          <Link
            href="/projects"
            className="mt-2 inline-flex h-8 items-center justify-center rounded-full bg-zinc-900 px-4 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Open Projects
          </Link>
        </Card>

        <Card className="p-4 border-indigo-200 bg-indigo-50/50 dark:border-indigo-900/50 dark:bg-indigo-950/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
              </span>
              <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-100">The Arena</p>
            </div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-indigo-500">Daily</span>
          </div>
          <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
            <strong>TF-IDF Log Search</strong>: Optimize retrieval for tech support logs.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Link
              href="/challenges/arena-tfidf-log-search"
              className="inline-flex h-7 items-center justify-center rounded-full bg-indigo-600 px-3 text-xs font-medium text-white hover:bg-indigo-500"
            >
              Compete
            </Link>
            <Link
              href="/challenges"
              className="text-[11px] font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-300"
            >
              View all
            </Link>
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-sm font-medium">Compare tools</p>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            Decision-first comparisons.
          </p>
          <Link
            href="/compare"
            className="mt-2 inline-flex h-8 items-center justify-center rounded-full border border-zinc-200 bg-white px-4 text-xs font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            Open Compare
          </Link>
        </Card>

        <Card className="p-4">
          <p className="text-sm font-medium">View Progress</p>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            Track your skill tree and analytics.
          </p>
          <Link
            href="/progress"
            className="mt-2 inline-flex h-8 items-center justify-center rounded-full border border-zinc-200 bg-white px-4 text-xs font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            Open Progress
          </Link>
        </Card>

        <Card className="p-4 border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-white dark:border-emerald-900/30 dark:from-emerald-950/20 dark:to-zinc-950">
          <div className="flex items-center gap-1.5">
            <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
            </svg>
            <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-100">Skill Tree</p>
          </div>
          <p className="mt-1.5 text-[11px] text-zinc-600 dark:text-zinc-400">
            Visualize your RAG mastery journey.
          </p>
          <Link
            href="/progress"
            className="mt-2 inline-flex text-[11px] font-medium text-emerald-700 hover:text-emerald-500 dark:text-emerald-400"
          >
            View Skill Tree
          </Link>
        </Card>
      </div>

      {/* Build Tracks */}
      <div>
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Build from Scratch</h2>
        <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
          Multi-part projects. Complete them in order.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {[
            { title: "Build a Vector DB", desc: "DenseVector to IVF Index. Build FAISS from zero.", href: "/challenges/dense-vector-class", color: "emerald" },
            { title: "Build a RAG Pipeline", desc: "Chunker to Generator. End-to-end system.", href: "/challenges/rag-pipeline-chunker", color: "blue" },
            { title: "Build a Reranker", desc: "Cross-Encoder and Cascade. Boost precision.", href: "/challenges/reranker-score-function", color: "amber" },
            { title: "Build an Evaluator", desc: "Recall@K to nDCG. Measure your system.", href: "/challenges/evaluator-recall-at-k", color: "purple" },
          ].map((track) => (
            <Card key={track.title} className={`p-4 border-${track.color}-200/50 bg-gradient-to-br from-${track.color}-50 to-white dark:border-${track.color}-900/30 dark:from-${track.color}-950/20 dark:to-zinc-950`}>
              <p className={`text-sm font-semibold text-${track.color}-900 dark:text-${track.color}-100`}>{track.title}</p>
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{track.desc}</p>
              <Link
                href={track.href}
                className={`mt-2 inline-flex text-[11px] font-medium text-${track.color}-700 hover:text-${track.color}-500 dark:text-${track.color}-400`}
              >
                Start Track
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
