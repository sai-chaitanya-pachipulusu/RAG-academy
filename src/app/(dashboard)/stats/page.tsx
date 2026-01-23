'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSupabaseAuth } from '@/components/providers/SupabaseAuthProvider';
import { getAllSubmissions, getSubmissionStats, Submission, SubmissionStats } from '@/lib/supabase/submissions';
import { CHALLENGES, getChallengeBySlug } from '@/lib/challenges/catalog';
import Link from 'next/link';

// Icons
function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3h14a1 1 0 011 1v2a7 7 0 01-3 5.745V13a2 2 0 01-2 2h-2v4h2a1 1 0 110 2H9a1 1 0 110-2h2v-4H9a2 2 0 01-2-2v-1.255A7 7 0 014 6V4a1 1 0 011-1z" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function FireIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 1-4 3-4s3 2 3 4c2-1 2.657-2.657 2.657-2.657A8 8 0 0117.657 18.657z" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

// Calculate streak from submissions
function calculateStreak(submissions: Submission[]): { current: number; longest: number } {
  if (submissions.length === 0) return { current: 0, longest: 0 };
  
  // Get unique dates with accepted submissions
  const acceptedDates = [...new Set(
    submissions
      .filter(s => s.status === 'accepted')
      .map(s => new Date(s.submittedAt).toDateString())
  )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  if (acceptedDates.length === 0) return { current: 0, longest: 0 };
  
  // Calculate current streak
  let current = 0;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  
  if (acceptedDates[0] === today || acceptedDates[0] === yesterday) {
    current = 1;
    for (let i = 1; i < acceptedDates.length; i++) {
      const prevDate = new Date(acceptedDates[i - 1]);
      const currDate = new Date(acceptedDates[i]);
      const diff = (prevDate.getTime() - currDate.getTime()) / 86400000;
      if (diff <= 1) {
        current++;
      } else {
        break;
      }
    }
  }
  
  // Calculate longest streak
  let longest = 1;
  let temp = 1;
  for (let i = 1; i < acceptedDates.length; i++) {
    const prevDate = new Date(acceptedDates[i - 1]);
    const currDate = new Date(acceptedDates[i]);
    const diff = (prevDate.getTime() - currDate.getTime()) / 86400000;
    if (diff <= 1) {
      temp++;
      longest = Math.max(longest, temp);
    } else {
      temp = 1;
    }
  }
  
  return { current, longest };
}

// Get activity heatmap data (last 90 days)
function getActivityHeatmap(submissions: Submission[]): { date: string; count: number }[] {
  const days = 90;
  const heatmap: { date: string; count: number }[] = [];
  const countByDate: Record<string, number> = {};
  
  submissions.forEach(s => {
    const date = new Date(s.submittedAt).toISOString().split('T')[0];
    countByDate[date] = (countByDate[date] || 0) + 1;
  });
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
    heatmap.push({ date, count: countByDate[date] || 0 });
  }
  
  return heatmap;
}

// Get difficulty breakdown from completed challenges
function getDifficultyBreakdown(submissions: Submission[]): { easy: number; medium: number; hard: number } {
  const uniqueAccepted = [...new Set(
    submissions.filter(s => s.status === 'accepted').map(s => s.challengeSlug)
  )];
  
  return uniqueAccepted.reduce((acc, challengeId) => {
    const challenge = getChallengeBySlug(challengeId);
    if (challenge) {
      const difficulty = challenge.difficulty || 'easy';
      acc[difficulty as keyof typeof acc]++;
    }
    return acc;
  }, { easy: 0, medium: 0, hard: 0 });
}

// Stat Card Component
function StatCard({ 
  icon, 
  label, 
  value, 
  subValue, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number; 
  subValue?: string; 
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subValue && <p className="text-xs text-gray-400">{subValue}</p>}
        </div>
      </div>
    </motion.div>
  );
}

// Activity Heatmap Component
function ActivityHeatmap({ data }: { data: { date: string; count: number }[] }) {
  const weeks: { date: string; count: number }[][] = [];
  let currentWeek: { date: string; count: number }[] = [];
  
  data.forEach((day, i) => {
    const dayOfWeek = new Date(day.date).getDay();
    if (dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  });
  if (currentWeek.length > 0) weeks.push(currentWeek);
  
  const getColor = (count: number) => {
    if (count === 0) return 'bg-gray-100';
    if (count === 1) return 'bg-green-200';
    if (count <= 3) return 'bg-green-400';
    if (count <= 5) return 'bg-green-500';
    return 'bg-green-600';
  };
  
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.count} submissions`}
                className={`w-3 h-3 rounded-sm ${getColor(day.count)} cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-green-400 transition-all`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm bg-gray-100" />
        <div className="w-3 h-3 rounded-sm bg-green-200" />
        <div className="w-3 h-3 rounded-sm bg-green-400" />
        <div className="w-3 h-3 rounded-sm bg-green-500" />
        <div className="w-3 h-3 rounded-sm bg-green-600" />
        <span>More</span>
      </div>
    </div>
  );
}

// Difficulty Progress Component
function DifficultyProgress({ breakdown, total }: { breakdown: { easy: number; medium: number; hard: number }; total: { easy: number; medium: number; hard: number } }) {
  const difficulties = [
    { key: 'easy' as const, label: 'Easy', color: 'bg-green-500', bgColor: 'bg-green-100' },
    { key: 'medium' as const, label: 'Medium', color: 'bg-yellow-500', bgColor: 'bg-yellow-100' },
    { key: 'hard' as const, label: 'Hard', color: 'bg-red-500', bgColor: 'bg-red-100' },
  ];
  
  return (
    <div className="space-y-4">
      {difficulties.map(({ key, label, color, bgColor }) => {
        const completed = breakdown[key];
        const totalCount = total[key];
        const percentage = totalCount > 0 ? (completed / totalCount) * 100 : 0;
        
        return (
          <div key={key}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700">{label}</span>
              <span className="text-gray-500">{completed} / {totalCount}</span>
            </div>
            <div className={`h-2 rounded-full ${bgColor}`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full rounded-full ${color}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Recent Submissions Component
function RecentSubmissions({ submissions }: { submissions: Submission[] }) {
  const recent = submissions.slice(0, 10);
  
  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };
  
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-700';
      case 'wrong_answer':
        return 'bg-red-100 text-red-700';
      case 'runtime_error':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };
  
  return (
    <div className="space-y-3">
      {recent.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No submissions yet</p>
      ) : (
        recent.map((submission) => {
          const challenge = getChallengeBySlug(submission.challengeSlug);
          return (
            <Link 
              key={submission.id} 
              href={`/challenges/${submission.challengeSlug}`}
              className="block"
            >
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {submission.status === 'accepted' ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {challenge?.title || submission.challengeSlug}
                    </p>
                    <p className="text-xs text-gray-500">{formatTimeAgo(submission.submittedAt)}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusStyle(submission.status)}`}>
                  {submission.status.replace('_', ' ')}
                </span>
              </motion.div>
            </Link>
          );
        })
      )}
    </div>
  );
}

// Main Stats Dashboard Page
export default function StatsPage() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<SubmissionStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      Promise.all([
        getAllSubmissions(user.id),
        getSubmissionStats(user.id)
      ]).then(([subs, st]) => {
        setSubmissions(subs);
        setStats(st);
        setLoading(false);
      });
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);
  
  // Calculate all stats
  const streak = calculateStreak(submissions);
  const heatmapData = getActivityHeatmap(submissions);
  const difficultyBreakdown = getDifficultyBreakdown(submissions);
  
  // Count total challenges by difficulty
  const totalChallenges = CHALLENGES.reduce((acc, challenge) => {
    const difficulty = challenge.difficulty || 'easy';
    acc[difficulty as keyof typeof acc]++;
    return acc;
  }, { easy: 0, medium: 0, hard: 0 });
  
  const acceptanceRate = stats && stats.totalSubmissions > 0 
    ? ((stats.acceptedSubmissions / stats.totalSubmissions) * 100).toFixed(1) 
    : '0';
  
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading your stats...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md"
        >
          <ChartIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign In to View Your Stats</h1>
          <p className="text-gray-500 mb-6">
            Track your progress, see your submission history, and view your performance metrics.
          </p>
          <Link
            href="/auth/login"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Your Performance</h1>
          <p className="text-gray-500 mt-1">Track your progress and submission history</p>
        </motion.div>
        
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<ChartIcon className="w-6 h-6 text-blue-600" />}
            label="Total Submissions"
            value={stats?.totalSubmissions || 0}
            subValue={`${acceptanceRate}% acceptance rate`}
            color="bg-blue-100"
          />
          <StatCard
            icon={<TrophyIcon className="w-6 h-6 text-green-600" />}
            label="Problems Solved"
            value={stats?.challengesSolved || 0}
            subValue={`of ${CHALLENGES.length} total`}
            color="bg-green-100"
          />
          <StatCard
            icon={<FireIcon className="w-6 h-6 text-orange-600" />}
            label="Current Streak"
            value={`${streak.current} days`}
            subValue={`Longest: ${streak.longest} days`}
            color="bg-orange-100"
          />
          <StatCard
            icon={<ClockIcon className="w-6 h-6 text-purple-600" />}
            label="Avg. Time"
            value={'N/A'}
            subValue="per submission"
            color="bg-purple-100"
          />
        </div>
        
        {/* Activity Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity (Last 90 Days)</h2>
          <ActivityHeatmap data={heatmapData} />
        </motion.div>
        
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Difficulty Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Problem Difficulty</h2>
            <DifficultyProgress breakdown={difficultyBreakdown} total={totalChallenges} />
            
            {/* Summary Circle */}
            <div className="mt-6 flex justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  {/* Progress circle */}
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(stats?.challengesSolved || 0) / CHALLENGES.length * 251.2} 251.2`}
                    transform="rotate(-90 50 50)"
                    initial={{ strokeDasharray: '0 251.2' }}
                    animate={{ strokeDasharray: `${(stats?.challengesSolved || 0) / CHALLENGES.length * 251.2} 251.2` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">{stats?.challengesSolved || 0}</span>
                  <span className="text-xs text-gray-500">solved</span>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Recent Submissions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Submissions</h2>
              <Link 
                href="/challenges" 
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View all →
              </Link>
            </div>
            <RecentSubmissions submissions={submissions} />
          </motion.div>
        </div>
        
        {/* Acceptance Rate by Language */}
        {submissions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl border border-gray-200 p-6 mt-8 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Submission Breakdown</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-2xl font-bold text-green-600">{stats?.acceptedSubmissions || 0}</div>
                <div className="text-sm text-gray-600">Accepted</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-xl">
                <div className="text-2xl font-bold text-red-600">{submissions.filter(s => s.status === 'wrong_answer').length}</div>
                <div className="text-sm text-gray-600">Wrong Answer</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-xl">
                <div className="text-2xl font-bold text-orange-600">{submissions.filter(s => s.status === 'runtime_error').length}</div>
                <div className="text-sm text-gray-600">Runtime Error</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-gray-600">
                  {submissions.filter(s => !['accepted', 'wrong_answer', 'runtime_error'].includes(s.status)).length}
                </div>
                <div className="text-sm text-gray-600">Other</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
