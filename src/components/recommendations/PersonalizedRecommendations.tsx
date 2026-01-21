"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useLocalProgress } from "@/components/providers/LocalProgressProvider";
import { CHALLENGES, type Challenge } from "@/lib/challenges/catalog";

interface Recommendation {
  challenge: Challenge;
  reason: string;
  priority: number;
}

// Get user preferences from localStorage
function getUserPreferences() {
  if (typeof window === "undefined") return null;
  
  const stored = localStorage.getItem("rag_academy_onboarding");
  if (!stored) return null;
  
  try {
    const data = JSON.parse(stored);
    if (data.completed) {
      return {
        experience: data.experience as "beginner" | "intermediate" | "advanced",
        goals: data.goals as string[],
        timePerWeek: data.timePerWeek as "casual" | "moderate" | "intensive",
      };
    }
  } catch {
    return null;
  }
  return null;
}

// Map goals to relevant challenge tags
const GOAL_TO_TAGS: Record<string, string[]> = {
  job: ["interview", "foundations", "evaluation"],
  product: ["production", "retrieval", "generation"],
  research: ["research", "advanced", "frontier"],
  optimize: ["production", "evaluation", "performance"],
  interview: ["interview", "foundations", "evaluation"],
  curiosity: ["foundations", "retrieval", "generation"],
};

// Map experience to difficulty
const EXPERIENCE_TO_DIFFICULTY: Record<string, string[]> = {
  beginner: ["easy", "medium"],
  intermediate: ["medium", "hard"],
  advanced: ["hard"],
};

export function usePersonalizedRecommendations(limit = 5): Recommendation[] {
  const { state } = useLocalProgress();
  const preferences = getUserPreferences();

  return useMemo(() => {
    // Get incomplete challenges
    const incompleteChallenges = CHALLENGES.filter((c) => {
      const progress = state.challenges[c.slug];
      return !progress || progress.status !== "completed";
    });

    // Score each challenge based on preferences
    const scored: Recommendation[] = incompleteChallenges.map((challenge) => {
      let priority = 50; // Base score
      let reasons: string[] = [];

      // Factor 1: Experience level match
      if (preferences?.experience) {
        const preferredDifficulties = EXPERIENCE_TO_DIFFICULTY[preferences.experience];
        if (preferredDifficulties.includes(challenge.difficulty)) {
          priority += 20;
          reasons.push(`Matches your ${preferences.experience} level`);
        }
      }

      // Factor 2: Goal alignment
      if (preferences?.goals) {
        const relevantTags = preferences.goals.flatMap((g) => GOAL_TO_TAGS[g] || []);
        const groupLower = challenge.group.toLowerCase();
        const hasMatchingTag = relevantTags.some((tag) => groupLower.includes(tag));
        if (hasMatchingTag) {
          priority += 15;
          reasons.push("Aligned with your goals");
        }
      }

      // Factor 3: In-progress challenges (continue what you started)
      const progress = state.challenges[challenge.slug];
      if (progress?.status === "in_progress") {
        priority += 30;
        reasons.push("Continue where you left off");
      }

      // Factor 4: Attempted but not completed (retry)
      if (progress?.attempts && progress.attempts > 0 && progress.status !== "completed") {
        priority += 10;
        reasons.push("Ready to retry");
      }

      // Factor 5: Sequential learning (prefer foundational first)
      if (challenge.group.toLowerCase().includes("foundation")) {
        const foundationsComplete = Object.entries(state.challenges)
          .filter(([slug]) => {
            const c = CHALLENGES.find((r) => r.slug === slug);
            return c?.group.toLowerCase().includes("foundation");
          })
          .filter(([, p]) => p.status === "completed").length;
        
        if (foundationsComplete < 3) {
          priority += 25;
          reasons.push("Build your foundation first");
        }
      }

      // Factor 6: Recent activity in same group (momentum)
      const lastCompletedInGroup = Object.entries(state.challenges)
        .filter(([slug, p]) => {
          const c = CHALLENGES.find((r) => r.slug === slug);
          return c?.group === challenge.group && p.status === "completed";
        }).length;
      
      if (lastCompletedInGroup > 0 && lastCompletedInGroup < 5) {
        priority += 10;
        reasons.push("Continue this track");
      }

      return {
        challenge,
        reason: reasons[0] || "Recommended for you",
        priority,
      };
    });

    // Sort by priority and return top N
    return scored
      .sort((a, b) => b.priority - a.priority)
      .slice(0, limit);
  }, [state.challenges, preferences, limit]);
}

interface PersonalizedRecommendationsProps {
  showTitle?: boolean;
  limit?: number;
  compact?: boolean;
}

export function PersonalizedRecommendations({
  showTitle = true,
  limit = 5,
  compact = false,
}: PersonalizedRecommendationsProps) {
  const recommendations = usePersonalizedRecommendations(limit);

  if (recommendations.length === 0) {
    return null;
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "medium":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "hard":
        return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400";
      default:
        return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400";
    }
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {showTitle && (
          <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Recommended for you
          </h3>
        )}
        {recommendations.slice(0, 3).map(({ challenge, reason }) => (
          <Link
            key={challenge.slug}
            href={`/challenges/${challenge.slug}`}
            className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3 transition-all hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-medium uppercase ${getDifficultyColor(
                challenge.difficulty
              )}`}
            >
              {challenge.difficulty}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {challenge.title}
              </p>
              <p className="truncate text-xs text-zinc-500">{reason}</p>
            </div>
            <svg
              className="h-4 w-4 text-zinc-400"
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
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      {showTitle && (
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              <span>🎯</span>
              Recommended for You
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Based on your goals and progress
            </p>
          </div>
          <Link
            href="/challenges"
            className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            View all →
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {recommendations.map(({ challenge, reason }, index) => (
          <Link
            key={challenge.slug}
            href={`/challenges/${challenge.slug}`}
            className="group flex items-center gap-4 rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 transition-all hover:border-zinc-200 hover:bg-zinc-50 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-800/50 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
          >
            {/* Rank indicator */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-sm font-bold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              {index + 1}
            </div>

            {/* Challenge info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-medium uppercase ${getDifficultyColor(
                    challenge.difficulty
                  )}`}
                >
                  {challenge.difficulty}
                </span>
                <span className="text-xs text-zinc-400">{challenge.group}</span>
              </div>
              <p className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">
                {challenge.title}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
                <span className="text-amber-500">★</span>
                {reason}
              </p>
            </div>

            {/* XP badge */}
            <div className="flex shrink-0 items-center gap-2">
              <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                +{challenge.xpReward || 50} XP
              </span>
              <svg
                className="h-5 w-5 text-zinc-300 transition-transform group-hover:translate-x-1 dark:text-zinc-600"
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
          </Link>
        ))}
      </div>
    </div>
  );
}
