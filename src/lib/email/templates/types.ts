/**
 * Email template types and interfaces
 */

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface EmailUser {
  id: string;
  email: string;
  name?: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  daysUntilNextMilestone: number;
  nextMilestone: number;
  lastActiveDate: string;
}

export interface WeeklyStats {
  challengesCompleted: number;
  totalSubmissions: number;
  streakDays: number;
  rankChange: number;
  newAchievements: number;
  timeSpentMinutes: number;
}

export interface ChallengeInfo {
  slug: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
}

export interface SubscriptionInfo {
  tier: 'pro' | 'team' | 'lifetime';
  price: number;
  billingPeriod: 'monthly' | 'annual';
  startDate: string;
  nextBillingDate?: string;
}

export interface AchievementInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export type EmailType = 
  | 'welcome'
  | 'streak_reminder'
  | 'weekly_digest'
  | 'challenge_completed'
  | 'subscription_confirmation'
  | 'password_reset'
  | 'achievement_unlocked'
  | 'countdown_7day'
  | 'countdown_3day'
  | 'countdown_1day'
  | 'thank_you';

export interface EmailPreferences {
  userId: string;
  welcomeEmail: boolean;
  streakReminders: boolean;
  weeklyDigest: boolean;
  challengeNotifications: boolean;
  marketingEmails: boolean;
  preferredTime: string; // HH:mm format
  timezone: string;
}
