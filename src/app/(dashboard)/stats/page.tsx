'use client';

import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/components/providers/SupabaseAuthProvider';
import { getAllSubmissions, getSubmissionStats, Submission, SubmissionStats } from '@/lib/supabase/submissions';
import { CHALLENGES, getChallengeBySlug } from '@/lib/challenges/catalog';
import Link from 'next/link';

function calculateStreak(submissions: Submission[]): { current: number; longest: number } {
  if (submissions.length === 0) return { current: 0, longest: 0 };
  const acceptedDates = [...new Set(
    submissions.filter(s => s.status === 'accepted').map(s => new Date(s.submittedAt).toDateString())
  )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  if (acceptedDates.length === 0) return { current: 0, longest: 0 };
  let current = 0;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (acceptedDates[0] === today || acceptedDates[0] === yesterday) {
    current = 1;
    for (let i = 1; i < acceptedDates.length; i++) {
      const diff = (new Date(acceptedDates[i - 1]).getTime() - new Date(acceptedDates[i]).getTime()) / 86400000;
      if (diff <= 1) current++; else break;
    }
  }
  let longest = 1, temp = 1;
  for (let i = 1; i < acceptedDates.length; i++) {
    const diff = (new Date(acceptedDates[i - 1]).getTime() - new Date(acceptedDates[i]).getTime()) / 86400000;
    if (diff <= 1) { temp++; longest = Math.max(longest, temp); } else temp = 1;
  }
  return { current, longest };
}

function getActivityHeatmap(submissions: Submission[]): { date: string; count: number }[] {
  const countByDate: Record<string, number> = {};
  submissions.forEach(s => { const d = new Date(s.submittedAt).toISOString().split('T')[0]; countByDate[d] = (countByDate[d] || 0) + 1; });
  return Array.from({ length: 90 }, (_, i) => { const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0]; return { date: d, count: countByDate[d] || 0 }; }).reverse();
}

function getDifficultyBreakdown(submissions: Submission[]): { easy: number; medium: number; hard: number } {
  const unique = [...new Set(submissions.filter(s => s.status === 'accepted').map(s => s.challengeSlug))];
  return unique.reduce((acc, id) => { const c = getChallengeBySlug(id); if (c) acc[c.difficulty as keyof typeof acc]++; return acc; }, { easy: 0, medium: 0, hard: 0 });
}

export default function StatsPage() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<SubmissionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      Promise.all([getAllSubmissions(user.id), getSubmissionStats(user.id)]).then(([subs, st]) => {
        setSubmissions(subs); setStats(st); setLoading(false);
      });
    } else if (!authLoading) setLoading(false);
  }, [user, authLoading]);

  const streak = calculateStreak(submissions);
  const heatmapData = getActivityHeatmap(submissions);
  const difficultyBreakdown = getDifficultyBreakdown(submissions);
  const totalChallenges = CHALLENGES.reduce((acc, c) => { acc[c.difficulty as keyof typeof acc]++; return acc; }, { easy: 0, medium: 0, hard: 0 });
  const acceptanceRate = stats && stats.totalSubmissions > 0 ? ((stats.acceptedSubmissions / stats.totalSubmissions) * 100).toFixed(1) : '0';

  if (authLoading || loading) return <div className="flex items-center justify-center py-20"><p className="text-sm text-zinc-500">Loading stats...</p></div>;
  if (!user) return <div className="flex items-center justify-center py-20"><p className="text-sm text-zinc-500">Sign in to view stats</p></div>;

  const getColor = (count: number) => count === 0 ? 'bg-zinc-100' : count === 1 ? 'bg-green-200' : count <= 3 ? 'bg-green-400' : count <= 5 ? 'bg-green-500' : 'bg-green-600';

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Your Performance</h1>
        <p className="mt-0.5 text-sm text-zinc-500">Track your progress and submissions.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Submissions', value: stats?.totalSubmissions || 0, sub: `${acceptanceRate}% accepted` },
          { label: 'Solved', value: stats?.challengesSolved || 0, sub: `of ${CHALLENGES.length}` },
          { label: 'Streak', value: `${streak.current}d`, sub: `Best: ${streak.longest}d` },
          { label: 'Accepted', value: stats?.acceptedSubmissions || 0, sub: `${submissions.length - (stats?.acceptedSubmissions || 0)} failed` },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-zinc-200 bg-white p-3">
            <p className="text-xs text-zinc-500">{s.label}</p>
            <p className="text-lg font-bold">{s.value}</p>
            <p className="text-[10px] text-zinc-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Activity Heatmap */}
      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-semibold mb-3">Activity (Last 90 Days)</h2>
        <div className="flex gap-0.5 overflow-x-auto pb-2">
          {heatmapData.map((day) => (
            <div key={day.date} title={`${day.date}: ${day.count}`} className={`w-2.5 h-2.5 rounded-sm ${getColor(day.count)}`} />
          ))}
        </div>
      </div>

      {/* Two Column */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Difficulty */}
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="text-sm font-semibold mb-3">Difficulty Progress</h2>
          {(['easy', 'medium', 'hard'] as const).map((key) => {
            const pct = totalChallenges[key] > 0 ? (difficultyBreakdown[key] / totalChallenges[key]) * 100 : 0;
            const colors = { easy: 'bg-green-500', medium: 'bg-yellow-500', hard: 'bg-red-500' };
            const bgColors = { easy: 'bg-green-100', medium: 'bg-yellow-100', hard: 'bg-red-100' };
            return (
              <div key={key} className="mb-2">
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="font-medium capitalize">{key}</span>
                  <span className="text-zinc-500">{difficultyBreakdown[key]}/{totalChallenges[key]}</span>
                </div>
                <div className={`h-1.5 rounded-full ${bgColors[key]}`}>
                  <div className={`h-full rounded-full ${colors[key]}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Submissions */}
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Recent Submissions</h2>
            <Link href="/challenges" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-1.5">
            {submissions.slice(0, 8).map((s) => {
              const challenge = getChallengeBySlug(s.challengeSlug);
              const ago = (() => { const d = new Date(s.submittedAt); const m = Math.floor((Date.now() - d.getTime()) / 60000); return m < 60 ? `${m}m` : m < 1440 ? `${Math.floor(m / 60)}h` : `${Math.floor(m / 1440)}d`; })();
              return (
                <Link key={s.id} href={`/challenges/${s.challengeSlug}`} className="flex items-center justify-between p-2 rounded-md bg-zinc-50 hover:bg-zinc-100 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${s.status === 'accepted' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div>
                      <p className="text-xs font-medium">{challenge?.title || s.challengeSlug}</p>
                      <p className="text-[10px] text-zinc-400">{ago} ago</p>
                    </div>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${s.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {s.status.replace('_', ' ')}
                  </span>
                </Link>
              );
            })}
            {submissions.length === 0 && <p className="text-xs text-zinc-500 text-center py-4">No submissions yet</p>}
          </div>
        </div>
      </div>

      {/* Submission Breakdown */}
      {submissions.length > 0 && (
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="text-sm font-semibold mb-3">Submission Breakdown</h2>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Accepted', count: stats?.acceptedSubmissions || 0, color: 'text-green-600' },
              { label: 'Wrong', count: submissions.filter(s => s.status === 'wrong_answer').length, color: 'text-red-600' },
              { label: 'Error', count: submissions.filter(s => s.status === 'runtime_error').length, color: 'text-orange-600' },
              { label: 'Other', count: submissions.filter(s => !['accepted', 'wrong_answer', 'runtime_error'].includes(s.status)).length, color: 'text-zinc-600' },
            ].map((b) => (
              <div key={b.label} className="text-center p-2 rounded-md bg-zinc-50">
                <div className={`text-lg font-bold ${b.color}`}>{b.count}</div>
                <div className="text-[10px] text-zinc-500">{b.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
