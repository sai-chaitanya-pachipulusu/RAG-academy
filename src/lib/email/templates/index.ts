/**
 * Email templates for RAG Academy
 * Central export for all email templates
 */

export * from './types';
export * from './welcome';
export * from './streakReminder';
export * from './weeklyDigest';
export * from './challengeCompleted';
export * from './subscriptionConfirmation';
export * from './passwordReset';
export * from './achievementUnlocked';

// Re-export legacy templates for backward compatibility
export {
  getWelcomeEmail,
  getCountdown7DaysEmail,
  getCountdown3DaysEmail,
  getCountdown1DayEmail,
  getThankYouEmail,
} from '../templates';

// Re-export new template functions with their original names
export { getWelcomeEmailNew as getWelcomeEmailV2 } from './welcome';
export { getStreakReminderEmail } from './streakReminder';
export { getWeeklyDigestEmail } from './weeklyDigest';
export { getChallengeCompletedEmail } from './challengeCompleted';
export { getSubscriptionConfirmationEmail } from './subscriptionConfirmation';
export { getPasswordResetEmail } from './passwordReset';
export { getAchievementUnlockedEmail } from './achievementUnlocked';
