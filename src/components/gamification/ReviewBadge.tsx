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
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
        <p className="text-gray-500">No challenges completed yet.</p>
        <p className="mt-1 text-sm text-gray-400">
          Complete challenges to start your review schedule!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Due Now */}
      {due.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="flex items-center gap-2 font-semibold text-amber-700">
            <span>🔄</span>
            <span>Due for Review ({due.length})</span>
          </h3>
          <p className="mt-1 text-xs text-amber-600">
            These challenges are ready for spaced repetition review
          </p>
          <div className="mt-3 space-y-2">
            {due.slice(0, 5).map((record) => (
              <button
                key={record.slug}
                onClick={() => onSelectChallenge?.(record.slug)}
                className="flex w-full items-center justify-between rounded-lg border border-amber-200 bg-white px-3 py-2 text-left transition hover:bg-amber-50 cursor-pointer"
              >
                <span className="text-sm font-medium text-gray-800">
                  {record.slug}
                </span>
                <span className="text-xs text-amber-600">
                  Review #{record.reviewCount + 1}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="flex items-center gap-2 font-semibold text-gray-700">
            <span>📅</span>
            <span>Upcoming Reviews ({upcoming.length})</span>
          </h3>
          <div className="mt-3 space-y-2">
            {upcoming.slice(0, 5).map((record) => (
              <div
                key={record.slug}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2"
              >
                <span className="text-sm text-gray-700">
                  {record.slug}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDueDate(record)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mastered */}
      {mastered.length > 0 && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <h3 className="flex items-center gap-2 font-semibold text-emerald-700">
            <span>🏆</span>
            <span>Mastered ({mastered.length})</span>
          </h3>
          <p className="mt-1 text-xs text-emerald-600">
            Reviewed 5+ times - these concepts are now in long-term memory!
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {mastered.map((record) => (
              <span
                key={record.slug}
                className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700"
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
      <div className="rounded-lg border border-gray-200 bg-white p-3 text-center">
        <p className="text-2xl font-bold text-gray-900">
          {totalReviews}
        </p>
        <p className="text-xs text-gray-500">Total</p>
      </div>
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-center">
        <p className="text-2xl font-bold text-amber-600">
          {due.length}
        </p>
        <p className="text-xs text-amber-600">Due</p>
      </div>
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-center">
        <p className="text-2xl font-bold text-blue-600">
          {upcoming.length}
        </p>
        <p className="text-xs text-blue-600">
          Upcoming
        </p>
      </div>
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-center">
        <p className="text-2xl font-bold text-emerald-600">
          {mastered.length}
        </p>
        <p className="text-xs text-emerald-600">
          Mastered
        </p>
      </div>
    </div>
  );
}
