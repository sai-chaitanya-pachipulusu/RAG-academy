/**
 * Email trigger service
 * Handles sending emails based on user actions and events
 */

import { sendEmail } from './sender';
import { getWelcomeEmailNew } from './templates/welcome';
import { getStreakReminderEmail } from './templates/streakReminder';
import { getWeeklyDigestEmail } from './templates/weeklyDigest';
import { getChallengeCompletedEmail } from './templates/challengeCompleted';
import { getSubscriptionConfirmationEmail } from './templates/subscriptionConfirmation';
import { getPasswordResetEmail } from './templates/passwordReset';
import { getAchievementUnlockedEmail } from './templates/achievementUnlocked';
import type {
  EmailUser,
  StreakData,
  WeeklyStats,
  ChallengeInfo,
  SubscriptionInfo,
  AchievementInfo,
} from './templates/types';

// Re-export types
export type {
  EmailUser,
  StreakData,
  WeeklyStats,
  ChallengeInfo,
  SubscriptionInfo,
  AchievementInfo,
};

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(
  user: EmailUser,
  freeChallengeCount: number
): Promise<{ success: boolean; id?: string; error?: string }> {
  const template = getWelcomeEmailNew({
    userName: user.name || user.email.split('@')[0],
    freeChallengeCount,
  });

  return sendEmail(user.email, template);
}

/**
 * Send streak reminder email
 */
export async function sendStreakReminder(
  user: EmailUser,
  streakData: StreakData,
  suggestedChallenge?: {
    slug: string;
    title: string;
    difficulty: string;
  }
): Promise<{ success: boolean; id?: string; error?: string }> {
  const template = getStreakReminderEmail({
    userName: user.name || user.email.split('@')[0],
    streakData,
    suggestedChallenge,
  });

  return sendEmail(user.email, template);
}

/**
 * Send weekly digest email
 */
export async function sendWeeklyDigest(
  user: EmailUser,
  weekStart: string,
  weekEnd: string,
  stats: WeeklyStats,
  completedChallenges: Array<{
    slug: string;
    title: string;
    completedAt: string;
  }>,
  recommendedChallenges: Array<{
    slug: string;
    title: string;
    difficulty: string;
    category: string;
  }>,
  leaderboardPosition?: number,
  totalLearners: number = 0
): Promise<{ success: boolean; id?: string; error?: string }> {
  const template = getWeeklyDigestEmail({
    userName: user.name || user.email.split('@')[0],
    weekStart,
    weekEnd,
    stats,
    completedChallenges,
    recommendedChallenges,
    leaderboardPosition,
    totalLearners,
  });

  return sendEmail(user.email, template);
}

/**
 * Send challenge completed email
 */
export async function sendChallengeCompleted(
  user: EmailUser,
  challenge: ChallengeInfo,
  options?: {
    score?: number;
    rank?: number;
    totalParticipants?: number;
    nextChallenge?: {
      slug: string;
      title: string;
      difficulty: string;
    };
    achievementsUnlocked?: Array<{
      name: string;
      icon: string;
    }>;
  }
): Promise<{ success: boolean; id?: string; error?: string }> {
  const template = getChallengeCompletedEmail({
    userName: user.name || user.email.split('@')[0],
    challenge,
    score: options?.score,
    rank: options?.rank,
    totalParticipants: options?.totalParticipants || 0,
    nextChallenge: options?.nextChallenge,
    achievementsUnlocked: options?.achievementsUnlocked,
  });

  return sendEmail(user.email, template);
}

/**
 * Send subscription confirmation email
 */
export async function sendSubscriptionConfirmation(
  user: EmailUser,
  subscription: SubscriptionInfo,
  orderId: string,
  receiptUrl?: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  const template = getSubscriptionConfirmationEmail({
    userName: user.name || user.email.split('@')[0],
    subscription,
    orderId,
    receiptUrl,
  });

  return sendEmail(user.email, template);
}

/**
 * Send password reset email
 */
export async function sendPasswordReset(
  user: EmailUser,
  resetToken: string,
  expiresIn: string = '1 hour'
): Promise<{ success: boolean; id?: string; error?: string }> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://rag-academy.com'}/reset-password?token=${resetToken}`;
  
  const template = getPasswordResetEmail({
    userName: user.name || user.email.split('@')[0],
    resetToken,
    resetUrl,
    expiresIn,
  });

  return sendEmail(user.email, template);
}

/**
 * Send achievement unlocked email
 */
export async function sendAchievementUnlocked(
  user: EmailUser,
  achievement: AchievementInfo,
  totalAchievements: number,
  nextAchievement?: {
    name: string;
    description: string;
    progress: number;
    total: number;
  }
): Promise<{ success: boolean; id?: string; error?: string }> {
  const template = getAchievementUnlockedEmail({
    userName: user.name || user.email.split('@')[0],
    achievement,
    totalAchievements,
    nextAchievement,
  });

  return sendEmail(user.email, template);
}

/**
 * Batch send emails with rate limiting
 */
export async function sendBatchEmails(
  emails: Array<{
    to: string;
    template: Parameters<typeof sendEmail>[1];
  }>,
  options?: {
    batchSize?: number;
    delayMs?: number;
  }
): Promise<Array<{ to: string; success: boolean; id?: string; error?: string }>> {
  const { batchSize = 10, delayMs = 1000 } = options || {};
  const results: Array<{ to: string; success: boolean; id?: string; error?: string }> = [];

  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    
    const batchResults = await Promise.allSettled(
      batch.map(({ to, template }) => sendEmail(to, template))
    );

    batchResults.forEach((result, index) => {
      const to = batch[index].to;
      if (result.status === 'fulfilled') {
        results.push({ to, ...result.value });
      } else {
        results.push({ to, success: false, error: result.reason?.message || 'Unknown error' });
      }
    });

    // Delay between batches
    if (i + batchSize < emails.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return results;
}

/**
 * Check if user has enabled email preference for a specific type
 */
export async function shouldSendEmail(
  userId: string,
  emailType: 'welcome' | 'streak_reminder' | 'weekly_digest' | 'challenge_completed' | 'subscription_confirmation' | 'password_reset' | 'achievement_unlocked' | 'marketing'
): Promise<boolean> {
  // This will be implemented with the email preferences service
  // For now, return true as default
  return true;
}
