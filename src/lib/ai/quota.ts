/**
 * AI Review Quota Management
 * 
 * Manages daily review limits per user with persistence.
 */

import type { UserReviewQuota } from "./types";

// In-memory store (use Redis/DB in production)
const quotaStore = new Map<string, UserReviewQuota>();

const DEFAULT_DAILY_LIMIT = parseInt(process.env.AI_REVIEW_DAILY_LIMIT || "10");

/**
 * Get the start of today (midnight) as timestamp
 */
/**
 * Get tomorrow's reset time
 */
function getTomorrowReset(): number {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime();
}

/**
 * Get or create quota for a user
 */
export function getUserQuota(userId: string): UserReviewQuota {
  const now = Date.now();
  const existing = quotaStore.get(userId);

  // If no existing quota or it's a new day, create/reset
  if (!existing || now >= existing.resetsAt) {
    const newQuota: UserReviewQuota = {
      userId,
      usedToday: 0,
      dailyLimit: DEFAULT_DAILY_LIMIT,
      resetsAt: getTomorrowReset(),
      hasUnlimited: false, // Could be set based on subscription tier
    };
    quotaStore.set(userId, newQuota);
    return newQuota;
  }

  return existing;
}

/**
 * Check if user has remaining quota
 */
export function hasQuota(userId: string): { allowed: boolean; remaining: number; resetsAt: number } {
  const quota = getUserQuota(userId);

  if (quota.hasUnlimited) {
    return { allowed: true, remaining: Infinity, resetsAt: quota.resetsAt };
  }

  const remaining = Math.max(0, quota.dailyLimit - quota.usedToday);
  return {
    allowed: remaining > 0,
    remaining,
    resetsAt: quota.resetsAt,
  };
}

/**
 * Consume one review from user's quota
 */
export function consumeQuota(userId: string): { success: boolean; remaining: number } {
  const quota = getUserQuota(userId);

  if (quota.hasUnlimited) {
    return { success: true, remaining: Infinity };
  }

  if (quota.usedToday >= quota.dailyLimit) {
    return { success: false, remaining: 0 };
  }

  quota.usedToday += 1;
  quotaStore.set(userId, quota);

  return {
    success: true,
    remaining: quota.dailyLimit - quota.usedToday,
  };
}

/**
 * Get quota status for a user
 */
export function getQuotaStatus(userId: string): {
  used: number;
  limit: number;
  remaining: number;
  resetsAt: number;
  hasUnlimited: boolean;
} {
  const quota = getUserQuota(userId);
  return {
    used: quota.usedToday,
    limit: quota.dailyLimit,
    remaining: quota.hasUnlimited ? Infinity : Math.max(0, quota.dailyLimit - quota.usedToday),
    resetsAt: quota.resetsAt,
    hasUnlimited: quota.hasUnlimited,
  };
}

/**
 * Set unlimited access for a user (e.g., for premium subscribers)
 */
export function setUnlimitedAccess(userId: string, unlimited: boolean): void {
  const quota = getUserQuota(userId);
  quota.hasUnlimited = unlimited;
  quotaStore.set(userId, quota);
}

/**
 * Reset quota for a user (admin function)
 */
export function resetUserQuota(userId: string): void {
  quotaStore.delete(userId);
}

/**
 * Get all quota stats (for monitoring)
 */
export function getAllQuotaStats(): {
  totalUsers: number;
  totalUsedToday: number;
  averageUsage: number;
} {
  const quotas = Array.from(quotaStore.values());
  const totalUsed = quotas.reduce((sum, q) => sum + q.usedToday, 0);

  return {
    totalUsers: quotas.length,
    totalUsedToday: totalUsed,
    averageUsage: quotas.length > 0 ? totalUsed / quotas.length : 0,
  };
}

/**
 * Clean up expired quota entries
 */
export function cleanupExpiredQuotas(): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [userId, quota] of quotaStore.entries()) {
    if (now >= quota.resetsAt + 24 * 60 * 60 * 1000) {
      // Remove if expired more than a day ago
      quotaStore.delete(userId);
      cleaned++;
    }
  }

  return cleaned;
}
