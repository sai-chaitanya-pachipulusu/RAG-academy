// Spaced Repetition System for Challenge Review
// Based on SM-2 algorithm principles

interface ReviewRecord {
  slug: string;
  completedAt: number;
  lastReviewedAt: number;
  reviewCount: number;
  interval: number; // days until next review
  easeFactor: number; // 1.3 - 2.5
}

const REVIEW_STORAGE_KEY = "rag_academy_reviews";

// Default intervals: 1, 3, 7, 14, 30, 60 days
const DEFAULT_INTERVALS = [1, 3, 7, 14, 30, 60];

export function getReviewRecords(): Record<string, ReviewRecord> {
  if (typeof window === "undefined") return {};
  const stored = localStorage.getItem(REVIEW_STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
}

export function saveReviewRecords(records: Record<string, ReviewRecord>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(records));
}

export function markChallengeCompleted(slug: string): ReviewRecord {
  const records = getReviewRecords();
  const now = Date.now();
  
  if (records[slug]) {
    // Challenge was already completed, treat as review
    const updated: ReviewRecord = {
      ...records[slug],
      lastReviewedAt: now,
      reviewCount: records[slug].reviewCount + 1,
      interval: getNextInterval(records[slug].reviewCount + 1),
    };
    records[slug] = updated;
    saveReviewRecords(records);
    return updated;
  }

  // First completion
  const record: ReviewRecord = {
    slug,
    completedAt: now,
    lastReviewedAt: now,
    reviewCount: 0,
    interval: DEFAULT_INTERVALS[0],
    easeFactor: 2.5,
  };
  
  records[slug] = record;
  saveReviewRecords(records);
  return record;
}

function getNextInterval(reviewCount: number): number {
  if (reviewCount >= DEFAULT_INTERVALS.length) {
    return DEFAULT_INTERVALS[DEFAULT_INTERVALS.length - 1];
  }
  return DEFAULT_INTERVALS[reviewCount];
}

export function getDueForReview(): string[] {
  const records = getReviewRecords();
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;

  return Object.values(records)
    .filter((record) => {
      const dueDate = record.lastReviewedAt + record.interval * oneDayMs;
      return now >= dueDate;
    })
    .map((record) => record.slug);
}

export function getReviewStatus(slug: string): {
  isDue: boolean;
  daysUntilDue: number;
  lastReviewedAt: number | null;
  reviewCount: number;
} {
  const records = getReviewRecords();
  const record = records[slug];

  if (!record) {
    return {
      isDue: false,
      daysUntilDue: -1,
      lastReviewedAt: null,
      reviewCount: 0,
    };
  }

  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const dueDate = record.lastReviewedAt + record.interval * oneDayMs;
  const daysUntilDue = Math.ceil((dueDate - now) / oneDayMs);

  return {
    isDue: daysUntilDue <= 0,
    daysUntilDue,
    lastReviewedAt: record.lastReviewedAt,
    reviewCount: record.reviewCount,
  };
}

export function getReviewSchedule(): {
  due: ReviewRecord[];
  upcoming: ReviewRecord[];
  mastered: ReviewRecord[];
} {
  const records = getReviewRecords();
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;

  const due: ReviewRecord[] = [];
  const upcoming: ReviewRecord[] = [];
  const mastered: ReviewRecord[] = [];

  Object.values(records).forEach((record) => {
    const dueDate = record.lastReviewedAt + record.interval * oneDayMs;
    
    if (record.reviewCount >= 5) {
      mastered.push(record);
    } else if (now >= dueDate) {
      due.push(record);
    } else {
      upcoming.push(record);
    }
  });

  // Sort by due date
  due.sort((a, b) => a.lastReviewedAt - b.lastReviewedAt);
  upcoming.sort((a, b) => {
    const aDue = a.lastReviewedAt + a.interval * oneDayMs;
    const bDue = b.lastReviewedAt + b.interval * oneDayMs;
    return aDue - bDue;
  });

  return { due, upcoming, mastered };
}

export function formatDueDate(record: ReviewRecord): string {
  const oneDayMs = 24 * 60 * 60 * 1000;
  const dueDate = record.lastReviewedAt + record.interval * oneDayMs;
  const now = Date.now();
  const daysUntilDue = Math.ceil((dueDate - now) / oneDayMs);

  if (daysUntilDue <= 0) return "Due now";
  if (daysUntilDue === 1) return "Due tomorrow";
  if (daysUntilDue <= 7) return `Due in ${daysUntilDue} days`;
  return new Date(dueDate).toLocaleDateString();
}
