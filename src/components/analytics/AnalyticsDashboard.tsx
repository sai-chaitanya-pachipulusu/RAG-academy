/**
 * Enhanced Analytics Dashboard Component
 * Comprehensive analytics with time-per-challenge, skill gaps, and learning insights
 */

"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Clock,
  Target,
  TrendingUp,
  Award,
  BookOpen,
  Zap,
  AlertCircle,
  ChevronRight,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Brain,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { getSupabase } from "@/lib/supabase/client";
import type {
  AnalyticsDashboardSummary,
  TimePerChallenge,
  SkillGap,
  ActivityHeatmapData,
  StudyPattern,
} from "@/lib/analytics/types";
import {
  getAnalyticsSummary,
  getTimePerChallenge,
  getSkillGaps,
  getActivityHeatmap,
  getStudyPatterns,
} from "@/lib/analytics/api";
import { getChallengeBySlug } from "@/lib/challenges/catalog";

// ============================================
// Types
// ============================================

type Tab = "overview" | "time" | "skills" | "patterns";

interface AnalyticsDashboardProps {
  userId: string;
}

// ============================================
// Main Component
// ============================================

export function AnalyticsDashboard({ userId }: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [summary, setSummary] = useState<AnalyticsDashboardSummary | null>(null);
  const [timeData, setTimeData] = useState<TimePerChallenge[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [heatmapData, setHeatmapData] = useState<ActivityHeatmapData[]>([]);
  const [studyPattern, setStudyPattern] = useState<StudyPattern | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [userId]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    const [summaryData, timePerChallenge, gaps, heatmap, patterns] = await Promise.all([
      getAnalyticsSummary({ userId }),
      getTimePerChallenge({ userId }),
      getSkillGaps({ userId }),
      getActivityHeatmap(userId, 365),
      getStudyPatterns(userId),
    ]);

    setSummary(summaryData);
    setTimeData(timePerChallenge);
    setSkillGaps(gaps);
    setHeatmapData(heatmap);
    setStudyPattern(patterns);
    setIsLoading(false);
  };

  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  if (!summary || summary.totalChallengesAttempted === 0) {
    return <EmptyAnalytics />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Learning Analytics</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Track your progress, identify skill gaps, and optimize your learning
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-800">
        <div className="flex gap-1">
          {[
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "time", label: "Time Analysis", icon: Clock },
            { id: "skills", label: "Skill Gaps", icon: Target },
            { id: "patterns", label: "Study Patterns", icon: Activity },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-all duration-200-all duration-200 ${
                activeTab === tab.id
                  ? "border-[#3B82F6] text-gray-900 dark:border-gray-100 dark:text-gray-100"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "overview" && (
          <OverviewTab
            summary={summary}
            heatmapData={heatmapData}
            skillGaps={skillGaps}
          />
        )}
        {activeTab === "time" && (
          <TimeAnalysisTab
            timeData={timeData}
            summary={summary}
          />
        )}
        {activeTab === "skills" && (
          <SkillsTab
            skillGaps={skillGaps}
            skillCategories={summary.skillCategories}
          />
        )}
        {activeTab === "patterns" && (
          <PatternsTab
            studyPattern={studyPattern}
            summary={summary}
          />
        )}
      </div>
    </div>
  );
}

// ============================================
// Overview Tab
// ============================================

function OverviewTab({
  summary,
  heatmapData,
  skillGaps,
}: {
  summary: AnalyticsDashboardSummary;
  heatmapData: ActivityHeatmapData[];
  skillGaps: SkillGap[];
}) {
  return (
    <div className="space-y-6">
      {/* Key Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Challenges Completed"
          value={summary.totalChallengesCompleted.toString()}
          change={`${summary.completionRate}% completion rate`}
          icon={BookOpen}
          color="emerald"
        />
        <StatCard
          label="Study Time"
          value={`${summary.totalStudyHours}h`}
          change={`${Math.round(summary.averageTimePerChallenge / 60)}m avg per challenge`}
          icon={Clock}
          color="blue"
        />
        <StatCard
          label="XP Earned"
          value={summary.totalXPEarned.toLocaleString()}
          change={`${summary.currentStreak} day streak`}
          icon={Zap}
          color="amber"
        />
        <StatCard
          label="Current Streak"
          value={summary.currentStreak.toString()}
          change={`Best: ${summary.longestStreak} days`}
          icon={Award}
          color="purple"
        />
      </div>

      {/* Activity Heatmap */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Activity Heatmap</h3>
            <p className="text-sm text-gray-500">Your learning activity over the past year</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`h-3 w-3 rounded-sm ${getHeatmapColor(level)}`}
              />
            ))}
            <span>More</span>
          </div>
        </div>
        <ActivityHeatmap data={heatmapData} />
      </Card>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Skill Gaps */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Critical Skill Gaps</h3>
              <p className="text-sm text-gray-500">Areas that need attention</p>
            </div>
            <AlertCircle className="h-5 w-5 text-amber-500" />
          </div>
          <div className="space-y-3">
            {skillGaps.slice(0, 5).map((gap) => (
              <SkillGapRow key={gap.id} gap={gap} />
            ))}
            {skillGaps.length === 0 && (
              <p className="text-center text-sm text-gray-500 py-4">
                No critical skill gaps identified. Keep up the great work!
              </p>
            )}
          </div>
        </Card>

        {/* Monthly Trend */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Monthly Progress</h3>
              <p className="text-sm text-gray-500">Challenges completed over time</p>
            </div>
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </div>
          <MonthlyTrendChart data={summary.monthlyTrend} />
        </Card>
      </div>

      {/* Peer Comparison */}
      {summary.peerComparison && (
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="font-semibold">How You Compare</h3>
            <p className="text-sm text-gray-500">
              Your performance compared to {summary.peerComparison.peerGroupSize} peers
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <ComparisonMetric
              label="Challenges Completed"
              userValue={summary.peerComparison.userChallengesCompleted}
              peerValue={summary.peerComparison.peerMedianChallenges}
              percentile={summary.peerComparison.challengesPercentile}
            />
            <ComparisonMetric
              label="Study Time"
              userValue={Math.round(summary.peerComparison.userTotalTimeSeconds / 3600)}
              peerValue={Math.round(summary.peerComparison.peerMedianTimeSeconds / 3600)}
              percentile={summary.peerComparison.timePercentile}
              unit="h"
            />
            <ComparisonMetric
              label="Average Score"
              userValue={Math.round((summary.peerComparison.userAverageScore || 0) * 100)}
              peerValue={Math.round((summary.peerComparison.peerMedianScore || 0) * 100)}
              percentile={summary.peerComparison.scorePercentile}
              unit="%"
            />
          </div>
        </Card>
      )}
    </div>
  );
}

// ============================================
// Time Analysis Tab
// ============================================

function TimeAnalysisTab({
  timeData,
  summary,
}: {
  timeData: TimePerChallenge[];
  summary: AnalyticsDashboardSummary;
}) {
  const [sortBy, setSortBy] = useState<"time" | "attempts" | "recent">("time");

  const sortedData = useMemo(() => {
    const data = [...timeData];
    switch (sortBy) {
      case "time":
        return data.sort((a, b) => b.totalTimeSpentSeconds - a.totalTimeSpentSeconds);
      case "attempts":
        return data.sort((a, b) => b.attemptsCount - a.attemptsCount);
      case "recent":
        return data;
      default:
        return data;
    }
  }, [timeData, sortBy]);

  return (
    <div className="space-y-6">
      {/* Time Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <Zap className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Fastest Challenge</p>
              <p className="font-semibold">
                {summary.fastestChallenge?.formattedTime || "N/A"}
              </p>
              <p className="text-xs text-gray-400">
                {summary.fastestChallenge?.challengeTitle || "No data"}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Slowest Challenge</p>
              <p className="font-semibold">
                {summary.slowestChallenge?.formattedTime || "N/A"}
              </p>
              <p className="text-xs text-gray-400">
                {summary.slowestChallenge?.challengeTitle || "No data"}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Average Time</p>
              <p className="font-semibold">
                {formatDuration(summary.averageTimePerChallenge)}
              </p>
              <p className="text-xs text-gray-400">Per challenge</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Time Per Challenge List */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Time Per Challenge</h3>
            <p className="text-sm text-gray-500">Detailed breakdown of time spent</p>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm dark:border-gray-800 dark:bg-gray-900"
          >
            <option value="time">Sort by Time</option>
            <option value="attempts">Sort by Attempts</option>
            <option value="recent">Most Recent</option>
          </select>
        </div>
        <div className="space-y-2">
          {sortedData.map((item) => (
            <TimePerChallengeRow key={item.challengeSlug} data={item} />
          ))}
          {sortedData.length === 0 && (
            <p className="text-center text-sm text-gray-500 py-8">
              No time data available yet. Complete some challenges to see your stats!
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

// ============================================
// Skills Tab
// ============================================

function SkillsTab({
  skillGaps,
  skillCategories,
}: {
  skillGaps: SkillGap[];
  skillCategories: any[];
}) {
  const [filter, setFilter] = useState<"all" | "minor" | "moderate" | "severe">("all");

  const filteredGaps = skillGaps.filter(
    (gap) => filter === "all" || gap.gapSeverity === filter
  );

  return (
    <div className="space-y-6">
      {/* Skill Categories */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skillCategories.map((category) => (
          <SkillCategoryCard key={category.category} category={category} />
        ))}
      </div>

      {/* Detailed Skill Gaps */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Detailed Skill Analysis</h3>
            <p className="text-sm text-gray-500">Individual skill gaps and recommendations</p>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm dark:border-gray-800 dark:bg-gray-900"
          >
            <option value="all">All Gaps</option>
            <option value="minor">Minor</option>
            <option value="moderate">Moderate</option>
            <option value="severe">Severe</option>
          </select>
        </div>
        <div className="space-y-3">
          {filteredGaps.map((gap) => (
            <DetailedSkillGapRow key={gap.id} gap={gap} />
          ))}
          {filteredGaps.length === 0 && (
            <p className="text-center text-sm text-gray-500 py-8">
              No skill gaps found with the selected filter.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

// ============================================
// Patterns Tab
// ============================================

function PatternsTab({
  studyPattern,
  summary,
}: {
  studyPattern: StudyPattern | null;
  summary: AnalyticsDashboardSummary;
}) {
  return (
    <div className="space-y-6">
      {studyPattern ? (
        <>
          {/* Pattern Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <PatternCard
              label="Most Productive Day"
              value={studyPattern.mostProductiveDay}
              icon={Calendar}
              color="blue"
            />
            <PatternCard
              label="Best Time to Study"
              value={studyPattern.mostProductiveTime}
              icon={Clock}
              color="amber"
            />
            <PatternCard
              label="Avg Session Length"
              value={formatDuration(studyPattern.averageSessionLength)}
              icon={Activity}
              color="emerald"
            />
            <PatternCard
              label="Consistency Score"
              value={`${studyPattern.consistencyScore}%`}
              icon={Target}
              color="purple"
            />
          </div>

          {/* Insights */}
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              <h3 className="font-semibold">Personalized Insights</h3>
            </div>
            <div className="space-y-3">
              <InsightRow
                icon={Brain}
                title="Learning Style"
                description={`You prefer ${studyPattern.preferredSessionType} sessions. This suggests you learn best through ${getLearningStyleDescription(studyPattern.preferredSessionType)}.`}
              />
              <InsightRow
                icon={TrendingUp}
                title="Progress Trend"
                description={`Your completion rate is ${summary.completionRate}%. ${getProgressAdvice(summary.completionRate)}`}
              />
              <InsightRow
                icon={Zap}
                title="Optimization Tip"
                description={`Try studying on ${studyPattern.mostProductiveDay}s during the ${studyPattern.mostProductiveTime.toLowerCase()} for maximum efficiency.`}
              />
            </div>
          </Card>
        </>
      ) : (
        <Card className="p-8 text-center">
          <Activity className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 font-semibold">Not Enough Data</h3>
          <p className="mt-2 text-sm text-gray-500">
            Complete more challenges to see your study patterns and personalized insights.
          </p>
        </Card>
      )}

      {/* Weekly Progress */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="font-semibold">Weekly Progress</h3>
          <p className="text-sm text-gray-500">Challenges completed in the last 7 days</p>
        </div>
        <WeeklyProgressChart data={summary.weeklyProgress} />
      </Card>
    </div>
  );
}

// ============================================
// Sub-Components
// ============================================

function StatCard({
  label,
  value,
  change,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  change: string;
  icon: React.ElementType;
  color: "emerald" | "blue" | "amber" | "purple";
}) {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
          <p className="mt-1 text-xs text-gray-400">{change}</p>
        </div>
        <div className={`rounded-lg p-2 ${colors[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

function ActivityHeatmap({ data }: { data: ActivityHeatmapData[] }) {
  // Group by weeks
  const weeks: ActivityHeatmapData[][] = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  return (
    <div className="flex gap-1 overflow-x-auto pb-2">
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="flex flex-col gap-1">
          {week.map((day, dayIndex) => (
            <div
              key={dayIndex}
              className={`h-3 w-3 rounded-sm ${getHeatmapColor(day.level)}`}
              title={`${day.date}: ${day.count} challenges`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function getHeatmapColor(level: number): string {
  const colors = [
    "bg-gray-100 dark:bg-[#2563EB]",
    "bg-emerald-200 dark:bg-emerald-900/40",
    "bg-emerald-300 dark:bg-emerald-800/60",
    "bg-emerald-400 dark:bg-emerald-700/80",
    "bg-emerald-500 dark:bg-emerald-600",
  ];
  return colors[level] || colors[0];
}

function SkillGapRow({ gap }: { gap: SkillGap }) {
  const severityColors = {
    none: "text-emerald-600 bg-emerald-50",
    minor: "text-blue-600 bg-blue-50",
    moderate: "text-amber-600 bg-amber-50",
    severe: "text-red-600 bg-red-50",
  };

  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-800">
      <div className="flex items-center gap-3">
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${severityColors[gap.gapSeverity]}`}>
          {gap.gapSeverity}
        </span>
        <span className="font-medium">{gap.skillName}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium">{gap.proficiencyScore}%</p>
          <p className="text-xs text-gray-400">proficiency</p>
        </div>
        <div className="h-8 w-24 overflow-hidden rounded-full bg-gray-100 dark:bg-[#2563EB]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
            style={{ width: `${gap.proficiencyScore}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function MonthlyTrendChart({ data }: { data: { date: string; challengesCompleted: number; xpEarned: number }[] }) {
  const maxValue = Math.max(...data.map((d) => d.challengesCompleted), 1);

  return (
    <div className="flex h-40 items-end gap-1">
      {data.slice(-14).map((day, index) => (
        <div key={index} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t bg-emerald-500 transition-all duration-200-all duration-200 hover:bg-emerald-400 cursor-pointer"
            style={{ height: `${(day.challengesCompleted / maxValue) * 100}%` }}
            title={`${day.date}: ${day.challengesCompleted} challenges, ${day.xpEarned} XP`}
          />
          <span className="text-[10px] text-gray-400">
            {new Date(day.date).getDate()}
          </span>
        </div>
      ))}
    </div>
  );
}

function ComparisonMetric({
  label,
  userValue,
  peerValue,
  percentile,
  unit = "",
}: {
  label: string;
  userValue: number;
  peerValue: number;
  percentile?: number;
  unit?: string;
}) {
  const diff = userValue - peerValue;
  const Icon = diff > 0 ? ArrowUpRight : diff < 0 ? ArrowDownRight : Minus;
  const color = diff > 0 ? "text-emerald-600" : diff < 0 ? "text-red-600" : "text-gray-400";

  return (
    <div className="rounded-lg border border-gray-100 p-4 dark:border-gray-800">
      <p className="text-sm text-gray-500">{label}</p>
      <div className="mt-2 flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold">
            {userValue}{unit}
          </p>
          <p className="text-xs text-gray-400">Median: {peerValue}{unit}</p>
        </div>
        <div className={`flex items-center gap-1 ${color}`}>
          <Icon className="h-4 w-4" />
          <span className="text-sm font-medium">{percentile || 50}th %ile</span>
        </div>
      </div>
    </div>
  );
}

function TimePerChallengeRow({ data }: { data: TimePerChallenge }) {
  return (
    <Link
      href={`/challenges/${data.challengeSlug}`}
      className="flex items-center justify-between rounded-lg border border-gray-100 p-3 transition-all duration-200-all duration-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900/50 cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
          data.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700' :
          data.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
          'bg-red-100 text-red-700'
        }`}>
          {data.difficulty}
        </span>
        <div>
          <p className="font-medium">{data.challengeTitle}</p>
          <p className="text-xs text-gray-400">{data.category}</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="font-medium">{data.formattedTime}</p>
          <p className="text-xs text-gray-400">Total time</p>
        </div>
        <div className="text-right">
          <p className="font-medium">{data.attemptsCount}</p>
          <p className="text-xs text-gray-400">Attempts</p>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-300" />
      </div>
    </Link>
  );
}

function SkillCategoryCard({ category }: { category: any }) {
  const severityColors = {
    none: "border-emerald-200 bg-emerald-50/50",
    minor: "border-blue-200 bg-blue-50/50",
    moderate: "border-amber-200 bg-amber-50/50",
    severe: "border-red-200 bg-red-50/50",
  };

  return (
    <div className={`rounded-xl border p-4 ${severityColors[category.gapSeverity as keyof typeof severityColors]}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{category.icon}</span>
          <div>
            <h4 className="font-semibold">{category.displayName}</h4>
            <p className="text-xs text-gray-500">
              {category.completedChallenges}/{category.totalChallenges} completed
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">{category.proficiencyScore}%</p>
        </div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/50">
        <div
          className="h-full rounded-full bg-[#2563EB] transition-all duration-200-all duration-200 cursor-pointer"
          style={{ width: `${category.proficiencyScore}%` }}
        />
      </div>
    </div>
  );
}

function DetailedSkillGapRow({ gap }: { gap: SkillGap }) {
  const severityColors = {
    none: "text-emerald-600",
    minor: "text-blue-600",
    moderate: "text-amber-600",
    severe: "text-red-600",
  };

  return (
    <div className="rounded-lg border border-gray-100 p-4 dark:border-gray-800">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-medium">{gap.skillName}</h4>
            <span className={`text-xs font-medium ${severityColors[gap.gapSeverity]}`}>
              {gap.gapSeverity} gap
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {gap.challengesCompleted} of {gap.challengesAttempted} challenges completed
            {gap.averageAttemptsPerChallenge && (
              <span> • {gap.averageAttemptsPerChallenge.toFixed(1)} avg attempts</span>
            )}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">{gap.proficiencyScore}%</p>
          <p className="text-xs text-gray-400">proficiency</p>
        </div>
      </div>
      {gap.recommendedChallenges.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-gray-500">Recommended practice:</p>
          <div className="mt-1 flex flex-wrap gap-2">
            {gap.recommendedChallenges.slice(0, 3).map((slug) => (
              <Link
                key={slug}
                href={`/challenges/${slug}`}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs hover:bg-gray-200 dark:bg-[#2563EB] dark:hover:bg-gray-700 cursor-pointer"
              >
                {slug}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PatternCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: "emerald" | "blue" | "amber" | "purple";
}) {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
  };

  return (
    <Card className="p-4">
      <div className={`mb-3 inline-flex rounded-lg p-2 ${colors[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </Card>
  );
}

function InsightRow({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-[#2563EB]">
        <Icon className="h-4 w-4 text-gray-600" />
      </div>
      <div>
        <h4 className="font-medium">{title}</h4>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}

function WeeklyProgressChart({ data }: { data: number[] }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const maxValue = Math.max(...data, 1);

  return (
    <div className="flex items-end justify-between gap-2">
      {data.map((count, index) => (
        <div key={index} className="flex flex-1 flex-col items-center gap-2">
          <div className="relative w-full">
            <div
              className={`rounded-t transition-all duration-200-all duration-200 ${
                count > 0 ? "bg-emerald-500" : "bg-gray-100 dark:bg-[#2563EB]"
              }`}
              style={{ height: `${(count / maxValue) * 120}px` }}
            />
            {count > 0 && (
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-medium text-emerald-600">
                {count}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400">{days[index]}</span>
        </div>
      ))}
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200 dark:bg-[#2563EB]" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-200 dark:bg-[#2563EB]" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl bg-gray-200 dark:bg-[#2563EB]" />
    </div>
  );
}

function EmptyAnalytics() {
  return (
    <Card className="p-8 text-center">
      <BarChart3 className="mx-auto h-12 w-12 text-gray-300" />
      <h3 className="mt-4 font-semibold">No Analytics Yet</h3>
      <p className="mt-2 text-sm text-gray-500">
        Complete some challenges to see your learning analytics, time tracking, and skill gaps.
      </p>
      <Link
        href="/challenges"
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-medium text-white hover:bg-[#2563EB] cursor-pointer"
      >
        Start Learning
        <ChevronRight className="h-4 w-4" />
      </Link>
    </Card>
  );
}

// ============================================
// Helper Functions
// ============================================

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

function getLearningStyleDescription(type: string): string {
  const descriptions: Record<string, string> = {
    challenge: "hands-on problem solving and practical application",
    lesson: "structured reading and conceptual understanding",
    review: "reinforcing previously learned material",
    interview: "simulated practice and real-world scenarios",
    practice: "repetition and skill refinement",
  };
  return descriptions[type] || "varied learning approaches";
}

function getProgressAdvice(rate: number): string {
  if (rate >= 80) return "Excellent completion rate! You're mastering the material.";
  if (rate >= 60) return "Good progress. Consider reviewing incomplete challenges.";
  if (rate >= 40) return "You're making steady progress. Try to complete challenges before moving on.";
  return "Focus on completing challenges to build a solid foundation.";
}
