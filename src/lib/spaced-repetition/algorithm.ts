/**
 * Spaced Repetition Algorithm
 * Implementation of SuperMemo-2 (SM-2) algorithm adapted for coding challenges
 */

import type { SRSItem, SRSReview, SRSReviewResult, SRSPreferences } from "./types";

// ============================================
// Default Configuration
// ============================================

export const DEFAULT_SRS_PREFS: SRSPreferences = {
  userId: "",
  maxNewPerDay: 10,
  maxReviewsPerDay: 50,
  learningSteps: [1, 10], // 1 minute, 10 minutes
  graduatingInterval: 1, // 1 day
  easyBonus: 1.3,
  intervalModifier: 1.0,
  lapseSteps: [1, 10],
  leechThreshold: 8,
  leechAction: "tag",
  newDayStartsAt: 4, // 4 AM
  timezone: "America/New_York",
};

// ============================================
// Core Algorithm
// ============================================

/**
 * Calculate the next review date based on the SM-2 algorithm
 */
export function calculateNextReview(
  item: SRSItem,
  rating: 'again' | 'hard' | 'good' | 'easy',
  preferences: SRSPreferences = DEFAULT_SRS_PREFS
): SRSReviewResult {
  const now = new Date();
  let newEaseFactor = item.easeFactor;
  let newInterval: number;
  let newRepetitions = item.repetitions;
  let isGraduated = false;

  switch (rating) {
    case 'again':
      // Failed review - reset repetitions
      newRepetitions = 0;
      newInterval = 0; // Back to learning phase
      newEaseFactor = Math.max(1.3, item.easeFactor - 0.2);
      break;

    case 'hard':
      newRepetitions += 1;
      if (item.repetitions === 0) {
        // First successful review
        newInterval = preferences.graduatingInterval;
      } else {
        // Increase interval but penalize
        newInterval = item.interval * 1.2;
      }
      newEaseFactor = Math.max(1.3, item.easeFactor - 0.15);
      break;

    case 'good':
      newRepetitions += 1;
      if (item.repetitions === 0) {
        newInterval = preferences.graduatingInterval;
      } else if (item.repetitions === 1) {
        newInterval = 6; // 6 days
      } else {
        // Standard SM-2 formula
        newInterval = Math.round(item.interval * item.easeFactor);
      }
      // Ease factor unchanged for "good"
      break;

    case 'easy':
      newRepetitions += 1;
      if (item.repetitions === 0) {
        newInterval = Math.round(preferences.graduatingInterval * preferences.easyBonus);
      } else if (item.repetitions === 1) {
        newInterval = Math.round(6 * preferences.easyBonus);
      } else {
        // Apply easy bonus
        newInterval = Math.round(item.interval * item.easeFactor * preferences.easyBonus);
      }
      newEaseFactor = item.easeFactor + 0.15;
      break;
  }

  // Apply interval modifier
  newInterval = Math.round(newInterval * preferences.intervalModifier);

  // Ensure minimum intervals
  if (newInterval < 1 && newRepetitions > 0) {
    newInterval = 1;
  }

  // Check if graduated from learning phase
  if (newInterval >= 1 && item.interval < 1) {
    isGraduated = true;
  }

  // Calculate next review date
  const nextReview = new Date(now);
  if (newInterval === 0) {
    // Learning phase - review in minutes
    nextReview.setMinutes(nextReview.getMinutes() + preferences.learningSteps[0]);
  } else {
    nextReview.setDate(nextReview.getDate() + newInterval);
  }

  const updatedItem: SRSItem = {
    ...item,
    easeFactor: Math.round(newEaseFactor * 100) / 100,
    interval: newInterval,
    repetitions: newRepetitions,
    lastReviewedAt: now.toISOString(),
    nextReviewAt: nextReview.toISOString(),
    difficultyRating: rating,
    totalReviews: item.totalReviews + 1,
    correctReviews: rating === 'again' ? item.correctReviews : item.correctReviews + 1,
    streak: rating === 'again' ? 0 : item.streak + 1,
    updatedAt: now.toISOString(),
  };

  return {
    item: updatedItem,
    nextReview: nextReview.toISOString(),
    isGraduated,
  };
}

/**
 * Create a new SRS item for a challenge
 */
export function createSRSItem(
  userId: string,
  challengeSlug: string,
  initialRating: 'again' | 'hard' | 'good' | 'easy' = 'good',
  preferences: SRSPreferences = DEFAULT_SRS_PREFS
): SRSItem {
  const now = new Date();
  const nextReview = new Date(now);
  
  // Set initial interval based on rating
  let initialInterval = 0;
  let initialEaseFactor = 2.5;
  
  switch (initialRating) {
    case 'again':
      initialInterval = 0;
      initialEaseFactor = 2.3;
      break;
    case 'hard':
      initialInterval = 0;
      initialEaseFactor = 2.4;
      break;
    case 'good':
      initialInterval = 0; // Will be set to graduating interval on first successful review
      initialEaseFactor = 2.5;
      break;
    case 'easy':
      initialInterval = preferences.graduatingInterval;
      initialEaseFactor = 2.65;
      break;
  }

  if (initialInterval === 0) {
    nextReview.setMinutes(nextReview.getMinutes() + preferences.learningSteps[0]);
  } else {
    nextReview.setDate(nextReview.getDate() + initialInterval);
  }

  return {
    id: generateId(),
    userId,
    challengeSlug,
    easeFactor: initialEaseFactor,
    interval: initialInterval,
    repetitions: initialRating === 'again' ? 0 : 1,
    lastReviewedAt: null,
    nextReviewAt: nextReview.toISOString(),
    difficultyRating: initialRating,
    totalReviews: 0,
    correctReviews: 0,
    streak: 0,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

/**
 * Check if an item is due for review
 */
export function isDueForReview(item: SRSItem, now: Date = new Date()): boolean {
  const nextReview = new Date(item.nextReviewAt);
  return nextReview <= now;
}

/**
 * Calculate how overdue an item is
 */
export function getDaysOverdue(item: SRSItem, now: Date = new Date()): number {
  const nextReview = new Date(item.nextReviewAt);
  const diffTime = now.getTime() - nextReview.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate priority score for review queue ordering
 * Higher score = higher priority
 */
export function calculatePriority(item: SRSItem, now: Date = new Date()): number {
  let priority = 0;
  
  // Base priority from days overdue
  const daysOverdue = getDaysOverdue(item, now);
  if (daysOverdue > 0) {
    priority += daysOverdue * 10;
  }
  
  // Learning phase items get higher priority
  if (item.interval < 1) {
    priority += 50;
  }
  
  // Items with low ease factor need more attention
  priority += (2.5 - item.easeFactor) * 20;
  
  // Long streak items get slight priority boost
  priority += item.streak * 2;
  
  return priority;
}

/**
 * Determine if an item is a "leech" (too many failures)
 */
export function isLeech(item: SRSItem, threshold: number = 8): boolean {
  // Count lapses (when interval resets due to "again" rating)
  const lapseCount = item.totalReviews - item.correctReviews;
  return lapseCount >= threshold;
}

/**
 * Get recommended action for a leech item
 */
export function getLeechAction(item: SRSItem): 'review_basics' | 'take_break' | 'seek_help' {
  const lapseCount = item.totalReviews - item.correctReviews;
  
  if (lapseCount >= 12) {
    return 'seek_help';
  } else if (lapseCount >= 10) {
    return 'take_break';
  }
  return 'review_basics';
}

/**
 * Estimate time to complete reviews
 */
export function estimateReviewTime(itemCount: number, averageTimePerReview: number = 5): number {
  // Average 5 minutes per challenge review
  return itemCount * averageTimePerReview;
}

/**
 * Calculate retention rate
 */
export function calculateRetentionRate(correctReviews: number, totalReviews: number): number {
  if (totalReviews === 0) return 0;
  return Math.round((correctReviews / totalReviews) * 100);
}

/**
 * Get the next interval preview for each rating
 * Useful for showing users what will happen
 */
export function getIntervalPreview(
  item: SRSItem,
  preferences: SRSPreferences = DEFAULT_SRS_PREFS
): Record<'again' | 'hard' | 'good' | 'easy', string> {
  const results: Record<'again' | 'hard' | 'good' | 'easy', string> = {
    again: '',
    hard: '',
    good: '',
    easy: '',
  };

  for (const rating of ['again', 'hard', 'good', 'easy'] as const) {
    const result = calculateNextReview(item, rating, preferences);
    const days = result.item.interval;
    
    if (days === 0) {
      results[rating] = '< 1 day';
    } else if (days === 1) {
      results[rating] = '1 day';
    } else if (days < 30) {
      results[rating] = `${days} days`;
    } else if (days < 365) {
      results[rating] = `${Math.round(days / 30)} months`;
    } else {
      results[rating] = `${Math.round(days / 365)} years`;
    }
  }

  return results;
}

/**
 * Format interval for display
 */
export function formatInterval(days: number): string {
  if (days === 0) return 'Learning';
  if (days === 1) return '1 day';
  if (days < 30) return `${days} days`;
  if (days < 365) return `${Math.round(days / 30)} months`;
  return `${Math.round(days / 365)} years`;
}

/**
 * Get the appropriate color for an ease factor
 */
export function getEaseFactorColor(easeFactor: number): string {
  if (easeFactor >= 2.5) return 'text-emerald-600';
  if (easeFactor >= 2.0) return 'text-blue-600';
  if (easeFactor >= 1.5) return 'text-amber-600';
  return 'text-red-600';
}

// ============================================
// Helper Functions
// ============================================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get the start of the SRS day (accounts for newDayStartsAt preference)
 */
export function getSRSDayStart(preferences: SRSPreferences = DEFAULT_SRS_PREFS, date: Date = new Date()): Date {
  const start = new Date(date);
  start.setHours(preferences.newDayStartsAt, 0, 0, 0);
  
  // If current time is before the start hour, use previous day
  if (date.getHours() < preferences.newDayStartsAt) {
    start.setDate(start.getDate() - 1);
  }
  
  return start;
}

/**
 * Check if two dates are on the same SRS day
 */
export function isSameSRSDay(
  date1: Date,
  date2: Date,
  preferences: SRSPreferences = DEFAULT_SRS_PREFS
): boolean {
  const start1 = getSRSDayStart(preferences, date1);
  const start2 = getSRSDayStart(preferences, date2);
  return start1.getTime() === start2.getTime();
}
