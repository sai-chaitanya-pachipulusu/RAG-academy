/**
 * Recommendation Widget Component
 * Displays personalized challenge recommendations
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Target,
  BookOpen,
  RotateCcw,
  ChevronRight,
  TrendingUp,
  Lightbulb,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { ChallengeRecommendation } from "@/lib/recommendations/engine";
import {
  getPersonalizedRecommendations,
  getContinueLearningRecommendation,
  getReviewRecommendations,
} from "@/lib/recommendations/engine";
import { getSupabase } from "@/lib/supabase/client";

interface RecommendationWidgetProps {
  variant?: "compact" | "full" | "continue";
  limit?: number;
  className?: string;
}

export function RecommendationWidget({
  variant = "full",
  limit = 3,
  className = "",
}: RecommendationWidgetProps) {
  const [recommendations, setRecommendations] = useState<ChallengeRecommendation[]>([]);
  const [continueLearning, setContinueLearning] = useState<ChallengeRecommendation | null>(null);
  const [reviewRecommendations, setReviewRecommendations] = useState<ChallengeRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    if (userId) {
      loadRecommendations();
    }
  }, [userId]);

  const loadRecommendations = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    
    const [personalized, continueRec, reviewRecs] = await Promise.all([
      getPersonalizedRecommendations(userId, limit),
      getContinueLearningRecommendation(userId),
      getReviewRecommendations(userId, 2),
    ]);

    setRecommendations(personalized);
    setContinueLearning(continueRec);
    setReviewRecommendations(reviewRecs);
    setIsLoading(false);
  };

  if (isLoading) {
    return <RecommendationSkeleton variant={variant} />;
  }

  if (variant === "continue" && continueLearning) {
    return (
      <ContinueCard
        recommendation={continueLearning}
        onRefresh={loadRecommendations}
      />
    );
  }

  if (variant === "compact") {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <h3 className="font-semibold">Recommended</h3>
        </div>
        <div className="space-y-2">
          {recommendations.slice(0, 2).map((rec) => (
            <CompactRecommendationItem key={rec.challenge.slug} recommendation={rec} />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Continue Learning Section */}
      {continueLearning && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold">Continue Learning</h3>
          </div>
          <ContinueCard
            recommendation={continueLearning}
            onRefresh={loadRecommendations}
          />
        </section>
      )}

      {/* Personalized Recommendations */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h3 className="font-semibold">Recommended For You</h3>
          </div>
          <button
            onClick={loadRecommendations}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-[#7C3AED] cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {recommendations.map((rec, index) => (
              <motion.div
                key={rec.challenge.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition-all duration-200={{ delay: index * 0.1 }}
              >
                <RecommendationCard recommendation={rec} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Review Recommendations */}
      {reviewRecommendations.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-500" />
            <h3 className="font-semibold">Time to Review</h3>
          </div>
          <div className="space-y-2">
            {reviewRecommendations.map((rec) => (
              <ReviewCard key={rec.challenge.slug} recommendation={rec} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ============================================
// Sub-Components
// ============================================

function RecommendationCard({ recommendation }: { recommendation: ChallengeRecommendation }) {
  const { challenge, score, reasons, matchType } = recommendation;

  const matchTypeIcons = {
    skill_gap: { icon: Target, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" },
    next_in_sequence: { icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
    review: { icon: RotateCcw, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    trending: { icon: Zap, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
    difficulty_match: { icon: Lightbulb, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
    goal_aligned: { icon: Sparkles, color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-900/20" },
  };

  const matchInfo = matchTypeIcons[matchType];
  const Icon = matchInfo.icon;

  return (
    <Link href={`/challenges/${challenge.slug}`}>
      <Card className="group relative overflow-hidden p-4 transition-all duration-200-all duration-200 hover:shadow-md cursor-pointer">
        {/* Match Type Badge */}
        <div className={`absolute right-3 top-3 rounded-full p-1.5 ${matchInfo.bg}`}>
          <Icon className={`h-4 w-4 ${matchInfo.color}`} />
        </div>

        <div className="pr-10">
          {/* Difficulty & Group */}
          <div className="mb-2 flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              challenge.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700' :
              challenge.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
              'bg-red-100 text-red-700'
            }`}>
              {challenge.difficulty}
            </span>
            <span className="text-xs text-gray-500">{challenge.group}</span>
          </div>

          {/* Title & Description */}
          <h4 className="font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 cursor-pointer">
            {challenge.title}
          </h4>
          <p className="mt-1 line-clamp-2 text-sm text-gray-500">
            {challenge.description}
          </p>

          {/* Reasons */}
          {reasons.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {reasons.slice(0, 2).map((reason, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-[#7C3AED] dark:text-gray-400"
                >
                  <Lightbulb className="h-3 w-3" />
                  {reason.message}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Hover Arrow */}
        <div className="absolute bottom-3 right-3 opacity-0 transition-all duration-200-opacity group-hover:opacity-100 cursor-pointer">
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      </Card>
    </Link>
  );
}

function ContinueCard({
  recommendation,
  onRefresh,
}: {
  recommendation: ChallengeRecommendation;
  onRefresh: () => void;
}) {
  const { challenge, reasons } = recommendation;

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 p-5 dark:from-blue-950/30 dark:to-indigo-950/30">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-2xl dark:bg-blue-900/30">
          🎯
        </div>
        <div className="flex-1">
          <p className="text-sm text-blue-600 dark:text-blue-400">Continue where you left off</p>
          <h4 className="mt-1 font-semibold text-blue-900 dark:text-blue-100">
            {challenge.title}
          </h4>
          {reasons.length > 0 && (
            <p className="mt-1 text-sm text-blue-700/70 dark:text-blue-300/70">
              {reasons[0].message}
            </p>
          )}
          <div className="mt-3 flex items-center gap-3">
            <Link
              href={`/challenges/${challenge.slug}`}
              className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200-all duration-200 hover:bg-blue-500 cursor-pointer"
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </Link>
            <button
              onClick={onRefresh}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
            >
              Show alternatives
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function ReviewCard({ recommendation }: { recommendation: ChallengeRecommendation }) {
  const { challenge } = recommendation;

  return (
    <Link href={`/challenges/${challenge.slug}`}>
      <Card className="group flex items-center gap-4 p-3 transition-all duration-200-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
          <RotateCcw className="h-5 w-5 text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="truncate font-medium group-hover:text-emerald-600 dark:group-hover:text-emerald-400 cursor-pointer">
            {challenge.title}
          </h4>
          <p className="text-xs text-gray-500">
            Spaced repetition review recommended
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-300" />
      </Card>
    </Link>
  );
}

function CompactRecommendationItem({ recommendation }: { recommendation: ChallengeRecommendation }) {
  const { challenge } = recommendation;

  return (
    <Link
      href={`/challenges/${challenge.slug}`}
      className="flex items-center gap-3 rounded-lg p-2 transition-all duration-200-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer"
    >
      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
        challenge.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700' :
        challenge.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
        'bg-red-100 text-red-700'
      }`}>
        {challenge.difficulty[0].toUpperCase()}
      </span>
      <span className="flex-1 truncate text-sm">{challenge.title}</span>
      <ChevronRight className="h-3 w-3 text-gray-300" />
    </Link>
  );
}

function RecommendationSkeleton({ variant }: { variant: string }) {
  if (variant === "compact") {
    return (
      <Card className="p-4">
        <div className="mb-3 h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-[#7C3AED]" />
        <div className="space-y-2">
          <div className="h-8 animate-pulse rounded bg-gray-200 dark:bg-[#7C3AED]" />
          <div className="h-8 animate-pulse rounded bg-gray-200 dark:bg-[#7C3AED]" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="h-32 animate-pulse rounded-xl bg-gray-200 dark:bg-[#7C3AED]" />
      <div className="space-y-3">
        <div className="h-24 animate-pulse rounded-xl bg-gray-200 dark:bg-[#7C3AED]" />
        <div className="h-24 animate-pulse rounded-xl bg-gray-200 dark:bg-[#7C3AED]" />
        <div className="h-24 animate-pulse rounded-xl bg-gray-200 dark:bg-[#7C3AED]" />
      </div>
    </div>
  );
}
