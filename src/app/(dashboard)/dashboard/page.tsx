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
    <div className="rounded-2xl border-2 border-dashed border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 dark:border-blue-900 dark:from-blue-950/30 dark:to-indigo-950/30">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl dark:bg-blue-900/30">
          👋
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">
            Welcome! Let's personalize your experience
          </h3>
          <p className="mt-1 text-sm text-blue-700/70 dark:text-blue-300/70">
            Take 30 seconds to set up your learning preferences
          </p>
        </div>
        <Link
          href="/onboarding"
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-500"
        >
          Get Started
        </Link>
        <button
          onClick={() => {
            localStorage.setItem("rag_academy_onboarding", JSON.stringify({ skipped: true }));
            setShowOnboarding(false);
          }}
          className="text-sm text-blue-600/70 hover:text-blue-800 dark:text-blue-400/70 dark:hover:text-blue-300"
        >
          Skip
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Your progress + quick links. If you're new, start with the Study Plan.
        </p>
      </div>

      {/* Onboarding prompt for new users */}
      <OnboardingCheck />

      {/* Event Banner */}
      <EventBanner />

      {/* Main Stats */}
      <DashboardStats />

      {/* Continue + Streak + Quiz Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ContinueCard />
        </div>
        <div className="space-y-4">
          <DailyStreak compact />
          <DailyQuizWidget />
        </div>
      </div>

      {/* Recommendations + Leaderboard */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PersonalizedRecommendations limit={4} />
        </div>
        <div>
          <LeaderboardWidget />
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <p className="text-sm font-medium">Start learning</p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Jump into the foundations track.
          </p>
          <Link
            href="/learn"
            className="mt-3 inline-flex h-9 items-center justify-center rounded-full bg-zinc-950 px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Go to Learn
          </Link>
        </Card>

        <Card>
          <p className="text-sm font-medium">Production Templates</p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Download Python or Node.js baselines with hybrid retrieval + reranking.
          </p>
          <Link
            href="/projects"
            className="mt-3 inline-flex h-9 items-center justify-center rounded-full bg-zinc-950 px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Open Projects
          </Link>
        </Card>

        <Card className="border-indigo-200 bg-indigo-50/50 dark:border-indigo-900/50 dark:bg-indigo-950/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
              </span>
              <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">The Arena</p>
            </div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-indigo-500">Daily</span>
          </div>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            <strong>TF-IDF Log Search</strong>: Optimize retrieval for tech support logs. Beat the 100ms benchmark.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Link
              href="/challenges/arena-tfidf-log-search"
              className="inline-flex h-9 items-center justify-center rounded-full bg-indigo-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-500"
            >
              Compete
            </Link>
            <Link
              href="/challenges"
              className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-300"
            >
              View all &rarr;
            </Link>
          </div>
        </Card>

        <Card>
          <p className="text-sm font-medium">Compare tools & techniques</p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Decision-first comparisons: vector DBs, rerankers, frameworks.
          </p>
          <Link
            href="/compare"
            className="mt-3 inline-flex h-9 items-center justify-center rounded-full border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-950 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            Open Compare
          </Link>
        </Card>

        <Card>
          <p className="text-sm font-medium">View Progress</p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Track your skill tree, achievements, and analytics.
          </p>
          <Link
            href="/progress"
            className="mt-3 inline-flex h-9 items-center justify-center rounded-full border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-950 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            Open Progress
          </Link>
        </Card>

        <Card className="border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-white dark:border-emerald-900/30 dark:from-emerald-950/20 dark:to-zinc-950">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌳</span>
            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Skill Tree</p>
          </div>
          <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
            Visualize your RAG mastery journey and unlock new skills.
          </p>
          <Link
            href="/progress"
            className="mt-3 inline-flex text-xs font-medium text-emerald-700 hover:text-emerald-500 dark:text-emerald-400"
          >
            View Skill Tree →
          </Link>
        </Card>
      </div>

      {/* Build Tracks */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Build from Scratch</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Multi-part projects that build on each other. Complete them in order.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Card className="border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-white dark:border-emerald-900/30 dark:from-emerald-950/20 dark:to-zinc-950">
            <div className="flex items-center gap-2">
              <span className="text-xl">🗃️</span>
              <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Build a Vector DB</p>
            </div>
            <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
              DenseVector → Flat Index → IVF Index. Build the core of FAISS from zero.
            </p>
            <Link
              href="/challenges/dense-vector-class"
              className="mt-3 inline-flex text-xs font-medium text-emerald-700 hover:text-emerald-500 dark:text-emerald-400"
            >
              Start Track →
            </Link>
          </Card>

          <Card className="border-blue-200/50 bg-gradient-to-br from-blue-50 to-white dark:border-blue-900/30 dark:from-blue-950/20 dark:to-zinc-950">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔗</span>
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Build a RAG Pipeline</p>
            </div>
            <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
              Chunker → Embedder → Retriever → Generator.
            </p>
            <Link
              href="/challenges/rag-pipeline-chunker"
              className="mt-3 inline-flex text-xs font-medium text-blue-700 hover:text-blue-500 dark:text-blue-400"
            >
              Start Track →
            </Link>
          </Card>

          <Card className="border-amber-200/50 bg-gradient-to-br from-amber-50 to-white dark:border-amber-900/30 dark:from-amber-950/20 dark:to-zinc-950">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚡</span>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">Build a Reranker</p>
            </div>
            <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
              Cross-Encoder → Cascade Reranker. Boost precision.
            </p>
            <Link
              href="/challenges/reranker-score-function"
              className="mt-3 inline-flex text-xs font-medium text-amber-700 hover:text-amber-500 dark:text-amber-400"
            >
              Start Track →
            </Link>
          </Card>

          <Card className="border-purple-200/50 bg-gradient-to-br from-purple-50 to-white dark:border-purple-900/30 dark:from-purple-950/20 dark:to-zinc-950">
            <div className="flex items-center gap-2">
              <span className="text-xl">📊</span>
              <p className="text-sm font-semibold text-purple-900 dark:text-purple-100">Build an Evaluator</p>
            </div>
            <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
              Recall@K → MRR → nDCG. Measure your system.
            </p>
            <Link
              href="/challenges/evaluator-recall-at-k"
              className="mt-3 inline-flex text-xs font-medium text-purple-700 hover:text-purple-500 dark:text-purple-400"
            >
              Start Track →
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
