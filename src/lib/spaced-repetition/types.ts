/**
 * Spaced Repetition System Types
 * Based on SuperMemo-2 algorithm with adaptations for coding challenges
 */

// ============================================
// Core Types
// ============================================

export interface SRSItem {
  id: string;
  userId: string;
  challengeSlug: string;
  
  // SuperMemo-2 parameters
  easeFactor: number; // EF: starts at 2.5, min 1.3
  interval: number; // Days until next review
  repetitions: number; // Number of successful reviews
  
  // Timing
  lastReviewedAt: string | null;
  nextReviewAt: string;
  
  // Challenge-specific
  difficultyRating: 'again' | 'hard' | 'good' | 'easy';
  
  // Stats
  totalReviews: number;
  correctReviews: number;
  streak: number; // Consecutive correct reviews
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface SRSReview {
  id: string;
  srsItemId: string;
  userId: string;
  challengeSlug: string;
  
  // Review data
  rating: 'again' | 'hard' | 'good' | 'easy';
  previousEaseFactor: number;
  newEaseFactor: number;
  previousInterval: number;
  newInterval: number;
  
  // Timing
  reviewedAt: string;
  timeSpentSeconds: number;
  
  // Performance
  codeSubmitted: boolean;
  testsPassed: boolean;
  
  // Context
  deviceType?: string;
}

export interface SRSQueue {
  dueToday: SRSItem[];
  newItems: SRSItem[];
  learning: SRSItem[]; // Items in learning phase (< 1 day interval)
  review: SRSItem[]; // Items ready for review
}

export interface SRSStats {
  totalItems: number;
  dueToday: number;
  newToday: number;
  reviewsToday: number;
  
  // Streaks
  currentStreak: number;
  longestStreak: number;
  
  // Retention
  retentionRate: number; // Percentage of correct reviews
  averageEaseFactor: number;
  
  // Progress
  masteredItems: number; // Items with interval > 21 days
  learningItems: number; // Items with interval <= 21 days
}

export interface SRSReviewResult {
  item: SRSItem;
  nextReview: string;
  isGraduated: boolean; // Moved from learning to review phase
}

// ============================================
// Review Scheduling
// ============================================

export interface ReviewSchedule {
  itemId: string;
  challengeSlug: string;
  challengeTitle: string;
  scheduledFor: string;
  priority: number; // Higher = review sooner
  isOverdue: boolean;
  daysOverdue: number;
}

export interface DailyReviewPlan {
  date: string;
  reviews: ReviewSchedule[];
  newItems: string[]; // Challenge slugs for new items
  estimatedTimeMinutes: number;
}

// ============================================
// User Preferences
// ============================================

export interface SRSPreferences {
  userId: string;
  
  // Daily limits
  maxNewPerDay: number;
  maxReviewsPerDay: number;
  
  // Learning phase settings
  learningSteps: number[]; // Minutes between learning steps [1, 10] = 1min, 10min
  graduatingInterval: number; // Days when item graduates from learning
  
  // Review settings
  easyBonus: number; // Multiplier for "easy" rating (default 1.3)
  intervalModifier: number; // Global interval modifier (default 1.0)
  
  // Lapse settings
  lapseSteps: number[]; // Minutes after "again" rating
  leechThreshold: number; // Number of lapses before marking as leech
  leechAction: 'tag' | 'suspend' | 'reset';
  
  // Timing
  newDayStartsAt: number; // Hour of day (0-23)
  timezone: string;
}

// ============================================
// Leech Detection
// ============================================

export interface LeechItem {
  srsItemId: string;
  challengeSlug: string;
  challengeTitle: string;
  lapseCount: number;
  lastLapseAt: string;
  recommendedAction: 'review_basics' | 'take_break' | 'seek_help';
}

// ============================================
// API Types
// ============================================

export interface AddToSRSRequest {
  userId: string;
  challengeSlug: string;
  initialDifficulty?: 'again' | 'hard' | 'good' | 'easy';
}

export interface ReviewSRSRequest {
  userId: string;
  srsItemId: string;
  rating: 'again' | 'hard' | 'good' | 'easy';
  timeSpentSeconds: number;
  codeSubmitted: boolean;
  testsPassed: boolean;
}

export interface GetSRSQueueRequest {
  userId: string;
  date?: string;
}

export interface UpdateSRSPreferencesRequest {
  userId: string;
  preferences: Partial<SRSPreferences>;
}
