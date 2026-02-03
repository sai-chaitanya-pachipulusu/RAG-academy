/**
 * Analytics types for RAG Academy Dashboard
 * Comprehensive analytics for time-per-challenge, skill gaps, and learning insights
 */

// ============================================
// Challenge Analytics
// ============================================

export interface ChallengeAnalytics {
  id: string;
  userId: string;
  challengeSlug: string;
  
  // Time tracking
  firstAttemptAt?: string;
  lastAttemptAt?: string;
  completedAt?: string;
  totalTimeSpentSeconds: number;
  
  // Attempt tracking
  attemptsCount: number;
  successfulAttempts: number;
  failedAttempts: number;
  
  // Performance metrics
  bestScore?: number;
  averageScore?: number;
  firstAttemptScore?: number;
  
  // Code evolution
  codeVersions: number;
  linesOfCodeFinal?: number;
  
  // User feedback
  userDifficultyRating?: number; // 1-5
  
  // Help usage
  hintsUsed: number;
  solutionViewed: boolean;
  
  createdAt: string;
  updatedAt: string;
}

export interface TimePerChallenge {
  challengeSlug: string;
  challengeTitle: string;
  totalTimeSpentSeconds: number;
  formattedTime: string;
  attemptsCount: number;
  averageTimePerAttempt: number;
  completed: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

// ============================================
// Skill Gap Analysis
// ============================================

export interface SkillGap {
  id: string;
  userId: string;
  skillCategory: string;
  skillName: string;
  
  // Gap metrics
  proficiencyScore: number; // 0-100
  challengesAttempted: number;
  challengesCompleted: number;
  averageAttemptsPerChallenge?: number;
  averageTimePerChallenge?: number;
  
  // Gap identification
  gapSeverity: 'none' | 'minor' | 'moderate' | 'severe';
  recommendedChallenges: string[];
  
  // Comparison
  peerPercentile?: number;
  
  calculatedAt: string;
}

export interface SkillCategorySummary {
  category: string;
  displayName: string;
  icon: string;
  proficiencyScore: number;
  totalChallenges: number;
  completedChallenges: number;
  gapSeverity: 'none' | 'minor' | 'moderate' | 'severe';
  recommendedFocus: string[];
}

// ============================================
// Learning Sessions
// ============================================

export interface LearningSession {
  id: string;
  userId: string;
  sessionType: 'challenge' | 'lesson' | 'review' | 'interview' | 'practice';
  startedAt: string;
  endedAt?: string;
  durationSeconds?: number;
  
  // Content
  challengeSlug?: string;
  lessonSlug?: string;
  
  // Metrics
  challengesCompleted: number;
  xpEarned: number;
  focusScore?: number; // 0-100
  
  // Context
  deviceType?: string;
}

// ============================================
// Daily Stats
// ============================================

export interface DailyLearningStats {
  id: string;
  userId: string;
  date: string;
  
  // Activity
  challengesAttempted: number;
  challengesCompleted: number;
  lessonsCompleted: number;
  
  // Time
  totalStudyTimeSeconds: number;
  longestSessionSeconds?: number;
  
  // Progress
  xpEarned: number;
  streakDay: boolean;
  
  // Performance
  averageScore?: number;
  
  // Skills
  skillsPracticed: string[];
}

// ============================================
// Peer Comparison
// ============================================

export interface PeerComparison {
  id: string;
  userId: string;
  periodStart: string;
  periodEnd: string;
  
  // User stats
  userChallengesCompleted: number;
  userTotalTimeSeconds: number;
  userAverageScore?: number;
  
  // Peer stats
  peerGroupSize: number;
  peerMedianChallenges: number;
  peerMedianTimeSeconds: number;
  peerMedianScore?: number;
  
  // Percentiles
  challengesPercentile?: number;
  timePercentile?: number;
  scorePercentile?: number;
}

// ============================================
// Dashboard Summary
// ============================================

export interface AnalyticsDashboardSummary {
  // Overall stats
  totalChallengesAttempted: number;
  totalChallengesCompleted: number;
  totalTimeSpentSeconds: number;
  totalXPEarned: number;
  completionRate: number;
  
  // Time analytics
  averageTimePerChallenge: number;
  fastestChallenge?: TimePerChallenge;
  slowestChallenge?: TimePerChallenge;
  totalStudyHours: number;
  
  // Skill gaps
  skillCategories: SkillCategorySummary[];
  criticalGaps: SkillGap[];
  
  // Recent activity
  last7Days: DailyLearningStats[];
  currentStreak: number;
  longestStreak: number;
  
  // Peer comparison
  peerComparison?: PeerComparison;
  
  // Trends
  weeklyProgress: number[]; // Last 7 days activity
  monthlyTrend: { date: string; challengesCompleted: number; xpEarned: number }[];
}

// ============================================
// Heatmap Data
// ============================================

export interface ActivityHeatmapData {
  date: string;
  count: number; // Challenges completed
  level: 0 | 1 | 2 | 3 | 4; // Activity level for coloring
}

// ============================================
// Study Patterns
// ============================================

export interface StudyPattern {
  mostProductiveDay: string;
  mostProductiveTime: string;
  averageSessionLength: number;
  preferredSessionType: string;
  consistencyScore: number; // 0-100
}

// ============================================
// API Request/Response Types
// ============================================

export interface GetAnalyticsSummaryRequest {
  userId: string;
  timeRange?: '7d' | '30d' | '90d' | 'all';
}

export interface GetTimePerChallengeRequest {
  userId: string;
  sortBy?: 'time' | 'attempts' | 'recent';
  limit?: number;
}

export interface GetSkillGapsRequest {
  userId: string;
  severity?: 'all' | 'minor' | 'moderate' | 'severe';
}

export interface RecordSessionRequest {
  userId: string;
  sessionType: LearningSession['sessionType'];
  challengeSlug?: string;
  lessonSlug?: string;
  deviceType?: string;
}

export interface UpdateChallengeAnalyticsRequest {
  userId: string;
  challengeSlug: string;
  timeSpentSeconds: number;
  attemptSuccess: boolean;
  score?: number;
  codeLines?: number;
  hintsUsed?: number;
  viewedSolution?: boolean;
}
