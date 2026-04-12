/**
 * SRS Review Widget Component
 * Interface for spaced repetition reviews
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Clock,
  Brain,
  Target,
  RotateCcw,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { getSupabase } from "@/lib/supabase/client";
import type { SRSItem, SRSStats } from "@/lib/spaced-repetition/types";
import { formatInterval, getIntervalPreview } from "@/lib/spaced-repetition/algorithm";

interface SRSReviewWidgetProps {
  userId: string;
}

interface SRSStatsLocal {
  totalItems: number;
  dueToday: number;
  newToday: number;
  reviewsToday: number;
  currentStreak: number;
  longestStreak: number;
  retentionRate: number;
  averageEaseFactor: number;
  masteredItems: number;
  learningItems: number;
}

function SRSSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-200 dark:bg-[#7C3AED]" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl bg-gray-200 dark:bg-[#7C3AED]" />
    </div>
  );
}

export function SRSReviewWidget({ userId }: SRSReviewWidgetProps) {
  const [dueItems, setDueItems] = useState<SRSItem[]>([]);
  const [stats, setStats] = useState<SRSStatsLocal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentItem, setCurrentItem] = useState<SRSItem | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const loadData = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;

    setIsLoading(true);

    // Fetch due items
    const { data: items } = await supabase
      .from("srs_items")
      .select("*")
      .eq("user_id", userId)
      .neq("status", "suspended")
      .lte("next_review_at", new Date().toISOString())
      .order("next_review_at", { ascending: true })
      .limit(20);

    // Fetch stats - cast to unknown first then to our local type
    const { data: statsData } = await supabase
      .rpc("get_srs_stats", { p_user_id: userId });

    setDueItems(items || []);
    setStats((statsData as unknown as SRSStatsLocal) || null);
    
    if (items && items.length > 0 && !currentItem) {
      setCurrentItem(items[0]);
    }
    
    setIsLoading(false);
  }, [userId, currentItem]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleReview = async (rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (!currentItem) return;

    const supabase = getSupabase();
    if (!supabase) return;

    // Process review using RPC
    await supabase.rpc("process_srs_review", {
      p_srs_item_id: currentItem.id,
      p_rating: rating,
    });

    // Move to next item
    const remaining = dueItems.filter((item) => item.id !== currentItem.id);
    setDueItems(remaining);
    setCurrentItem(remaining[0] || null);
    setShowAnswer(false);
  };

  if (isLoading) {
    return <SRSSkeleton />;
  }

  if (!currentItem) {
    return <SRSComplete stats={stats} onRefresh={loadData} />;
  }

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      {stats && (
        <div className="grid grid-cols-4 gap-2">
          <StatBadge
            label="Due"
            value={stats.dueToday}
            icon={Clock}
            color="amber"
          />
          <StatBadge
            label="Learning"
            value={stats.learningItems}
            icon={Brain}
            color="blue"
          />
          <StatBadge
            label="Review"
            value={stats.masteredItems}
            icon={RotateCcw}
            color="emerald"
          />
          <StatBadge
            label="Retention"
            value={`${stats.retentionRate}%`}
            icon={TrendingUp}
            color="purple"
          />
        </div>
      )}

      {/* Review Card */}
      <Card className="overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                currentItem.interval < 1
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              }`}>
                {currentItem.interval < 1 ? 'Learning' : 'Review'}
              </span>
              <span className="text-xs text-gray-500">
                {currentItem.repetitions} repetitions
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Target className="h-3 w-3" />
              EF: {currentItem.easeFactor.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Challenge Info */}
        <div className="p-6">
          <Link
            href={`/challenges/${currentItem.challengeSlug}`}
            className="group block"
          >
            <h3 className="text-lg font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 cursor-pointer">
              {currentItem.challengeSlug}
            </h3>
          </Link>

          {!showAnswer ? (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Can you solve this challenge from memory?
              </p>
              <button
                onClick={() => setShowAnswer(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#8B5CF6] px-6 py-2.5 text-sm font-medium text-white transition-all duration-200-all duration-200 hover:bg-[#7C3AED] dark:bg-[#8B5CF6] dark:text-white dark:hover:bg-[#7C3AED] cursor-pointer"
              >
                <CheckCircle className="h-4 w-4" />
                Show Answer
              </button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <p className="text-sm text-gray-600 dark:text-gray-400">
                How well did you remember the solution?
              </p>

              {/* Rating Buttons */}
              <div className="mt-4 grid grid-cols-4 gap-2">
                <RatingButton
                  rating="again"
                  label="Again"
                  description="Forgot"
                  color="red"
                  onClick={() => handleReview('again')}
                />
                <RatingButton
                  rating="hard"
                  label="Hard"
                  description="Difficult"
                  color="amber"
                  onClick={() => handleReview('hard')}
                />
                <RatingButton
                  rating="good"
                  label="Good"
                  description="Normal"
                  color="blue"
                  onClick={() => handleReview('good')}
                />
                <RatingButton
                  rating="easy"
                  label="Easy"
                  description="Perfect"
                  color="emerald"
                  onClick={() => handleReview('easy')}
                />
              </div>

              {/* Interval Preview */}
              <IntervalPreview item={currentItem} />
            </motion.div>
          )}
        </div>
      </Card>

      {/* Queue Info */}
      <p className="text-center text-xs text-gray-500">
        {dueItems.length} items remaining in queue
      </p>
    </div>
  );
}

// ============================================
// Sub-Components
// ============================================

function StatBadge({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: "amber" | "blue" | "emerald" | "purple";
}) {
  const colors = {
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
  };

  return (
    <div className={`flex flex-col items-center rounded-lg p-2 ${colors[color]}`}>
      <Icon className="h-4 w-4" />
      <span className="mt-1 text-lg font-bold">{value}</span>
      <span className="text-[10px] uppercase">{label}</span>
    </div>
  );
}

function RatingButton({
  rating,
  label,
  description,
  color,
  onClick,
}: {
  rating: string;
  label: string;
  description: string;
  color: "red" | "amber" | "blue" | "emerald";
  onClick: () => void;
}) {
  const colors = {
    red: "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30",
    amber: "bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/30",
    blue: "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30",
    emerald: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30",
  };

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center rounded-lg p-3 transition-all duration-200-all duration-200 ${colors[color]}`}
    >
      <span className="font-semibold">{label}</span>
      <span className="text-xs opacity-70">{description}</span>
    </button>
  );
}

function IntervalPreview({ item }: { item: SRSItem }) {
  const previews = getIntervalPreview(item);

  return (
    <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
      <div>
        <p className="text-gray-400">Again</p>
        <p className="font-medium text-red-600">{previews.again}</p>
      </div>
      <div>
        <p className="text-gray-400">Hard</p>
        <p className="font-medium text-amber-600">{previews.hard}</p>
      </div>
      <div>
        <p className="text-gray-400">Good</p>
        <p className="font-medium text-blue-600">{previews.good}</p>
      </div>
      <div>
        <p className="text-gray-400">Easy</p>
        <p className="font-medium text-emerald-600">{previews.easy}</p>
      </div>
    </div>
  );
}

function SRSComplete({
  stats,
  onRefresh,
}: {
  stats: SRSStatsLocal | null;
  onRefresh: () => void;
}) {
  return (
    <Card className="p-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
        <CheckCircle className="h-8 w-8 text-emerald-600" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">All Caught Up!</h3>
      <p className="mt-2 text-sm text-gray-500">
        You've completed all your scheduled reviews for now.
      </p>
      
      {stats && (
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50">
            <p className="text-2xl font-bold">{stats.totalItems}</p>
            <p className="text-xs text-gray-500">Total Items</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50">
            <p className="text-2xl font-bold">{stats.retentionRate}%</p>
            <p className="text-xs text-gray-500">Retention</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50">
            <p className="text-2xl font-bold">{stats.averageEaseFactor.toFixed(2)}</p>
            <p className="text-xs text-gray-500">Avg Ease</p>
          </div>
        </div>
      )}

      <button
        onClick={onRefresh}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#8B5CF6] px-4 py-2 text-sm font-medium text-white transition-all duration-200-all duration-200 hover:bg-[#7C3AED] dark:bg-[#8B5CF6] dark:text-white dark:hover:bg-[#7C3AED] cursor-pointer"
      >
        <RotateCcw className="h-4 w-4" />
        Check for New Reviews
      </button>
    </Card>
  );
}

