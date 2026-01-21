"use client";

import { getReviewStatus, getDueForReview, formatDueDate, getReviewSchedule } from "@/lib/spacedRepetition";

interface ReviewBadgeProps {
  slug: string;
}

export function ReviewBadge({ slug }: ReviewBadgeProps) {
  const status = getReviewStatus(slug);

  if (!status.lastReviewedAt) {
    return null; // Never completed
  }

  if (status.isDue) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
        <span>🔄</span>
        <span>Due for Review</span>
      </span>
    );
  }

  if (status.daysUntilDue <= 3) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
        <span>📅</span>
        <span>Review in {status.daysUntilDue}d</span>
      </span>
    );
  }

  if (status.reviewCount >= 5) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
        <span>✓</span>
        <span>Mastered</span>
      </span>
    );
  }

  return null;
}

interface ReviewDashboardProps {
  onSelectChallenge?: (slug: string) => void;
}

export function ReviewDashboard({ onSelectChallenge }: ReviewDashboardProps) {
  const { due, upcoming, mastered } = getReviewSchedule();

  if (due.length === 0 && upcoming.length === 0 && mastered.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-6 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
        <p className="text-zinc-500">No challenges completed yet.</p>
        <p className="mt-1 text-sm text-zinc-400">
          Complete challenges to start your review schedule!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Due Now */}
      {due.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
          <h3 className="flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-400">
            <span>🔄</span>
            <span>Due for Review ({due.length})</span>
          </h3>
          <p className="mt-1 text-xs text-amber-600/70 dark:text-amber-400/70">
            These challenges are ready for spaced repetition review
          </p>
          <div className="mt-3 space-y-2">
            {due.slice(0, 5).map((record) => (
              <button
                key={record.slug}
                onClick={() => onSelectChallenge?.(record.slug)}
                className="flex w-full items-center justify-between rounded-lg border border-amber-200/50 bg-white/50 px-3 py-2 text-left transition hover:bg-white dark:border-amber-800/30 dark:bg-black/20 dark:hover:bg-black/30"
              >
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {record.slug}
                </span>
                <span className="text-xs text-amber-600 dark:text-amber-400">
                  Review #{record.reviewCount + 1}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <h3 className="flex items-center gap-2 font-semibold text-zinc-700 dark:text-zinc-300">
            <span>📅</span>
            <span>Upcoming Reviews ({upcoming.length})</span>
          </h3>
          <div className="mt-3 space-y-2">
            {upcoming.slice(0, 5).map((record) => (
              <div
                key={record.slug}
                className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white/50 px-3 py-2 dark:border-zinc-800 dark:bg-black/20"
              >
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  {record.slug}
                </span>
                <span className="text-xs text-zinc-500">
                  {formatDueDate(record)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mastered */}
      {mastered.length > 0 && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
          <h3 className="flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-400">
            <span>🏆</span>
            <span>Mastered ({mastered.length})</span>
          </h3>
          <p className="mt-1 text-xs text-emerald-600/70 dark:text-emerald-400/70">
            Reviewed 5+ times - these concepts are now in long-term memory!
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {mastered.map((record) => (
              <span
                key={record.slug}
                className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              >
                {record.slug}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Stats summary
export function ReviewStats() {
  const { due, upcoming, mastered } = getReviewSchedule();
  const totalReviews = due.length + upcoming.length + mastered.length;

  return (
    <div className="grid grid-cols-4 gap-3">
      <div className="rounded-lg border border-zinc-200 bg-white p-3 text-center dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {totalReviews}
        </p>
        <p className="text-xs text-zinc-500">Total</p>
      </div>
      <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-center dark:border-amber-900/50 dark:bg-amber-950/20">
        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
          {due.length}
        </p>
        <p className="text-xs text-amber-600/70 dark:text-amber-400/70">Due</p>
      </div>
      <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3 text-center dark:border-blue-900/50 dark:bg-blue-950/20">
        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {upcoming.length}
        </p>
        <p className="text-xs text-blue-600/70 dark:text-blue-400/70">
          Upcoming
        </p>
      </div>
      <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 text-center dark:border-emerald-900/50 dark:bg-emerald-950/20">
        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
          {mastered.length}
        </p>
        <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
          Mastered
        </p>
      </div>
    </div>
  );
}
