/**
 * AI Review Quota Management — Redis-backed
 *
 * Persists quota data in Redis so it survives serverless cold starts.
 * Falls back to in-memory store when Redis is not configured.
 */

import type { UserReviewQuota } from "./types";
import { getRedisClient } from "@/lib/redis/client";

const DEFAULT_DAILY_LIMIT = parseInt(process.env.AI_REVIEW_DAILY_LIMIT || "10");
const QUOTA_KEY_PREFIX = "quota:review:";

function getTomorrowReset(): number {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime();
}

function quotaKey(userId: string): string {
  return `${QUOTA_KEY_PREFIX}${userId}`;
}

function parseQuota(raw: string | null, userId: string): UserReviewQuota {
  if (!raw) {
    return {
      userId,
      usedToday: 0,
      dailyLimit: DEFAULT_DAILY_LIMIT,
      resetsAt: getTomorrowReset(),
      hasUnlimited: false,
    };
  }

  try {
    const parsed = JSON.parse(raw);
    // Reset if it's a new day
    if (Date.now() >= parsed.resetsAt) {
      return {
        userId,
        usedToday: 0,
        dailyLimit: parsed.dailyLimit ?? DEFAULT_DAILY_LIMIT,
        resetsAt: getTomorrowReset(),
        hasUnlimited: parsed.hasUnlimited ?? false,
      };
    }
    return parsed;
  } catch {
    return {
      userId,
      usedToday: 0,
      dailyLimit: DEFAULT_DAILY_LIMIT,
      resetsAt: getTomorrowReset(),
      hasUnlimited: false,
    };
  }
}

async function saveQuota(quota: UserReviewQuota): Promise<void> {
  const redis = await getRedisClient();
  const key = quotaKey(quota.userId);
  const ttl = Math.max(0, Math.ceil((quota.resetsAt - Date.now()) / 1000)) + 86400;

  if (redis) {
    await redis.setex(key, ttl, JSON.stringify(quota));
  }
}

// ── In-memory fallback ──────────────────────────────────────────────────────
const fallbackStore = new Map<string, UserReviewQuota>();

function getFallbackQuota(userId: string): UserReviewQuota {
  const now = Date.now();
  const existing = fallbackStore.get(userId);

  if (!existing || now >= existing.resetsAt) {
    const newQuota: UserReviewQuota = {
      userId,
      usedToday: 0,
      dailyLimit: DEFAULT_DAILY_LIMIT,
      resetsAt: getTomorrowReset(),
      hasUnlimited: false,
    };
    fallbackStore.set(userId, newQuota);
    return newQuota;
  }

  return existing;
}

// ── Public API (async) ──────────────────────────────────────────────────────

export async function getUserQuota(userId: string): Promise<UserReviewQuota> {
  const redis = await getRedisClient();

  if (redis) {
    const raw = await redis.get(quotaKey(userId));
    return parseQuota(raw, userId);
  }

  return getFallbackQuota(userId);
}

export async function hasQuota(userId: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetsAt: number;
}> {
  const quota = await getUserQuota(userId);

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

export async function consumeQuota(userId: string): Promise<{
  success: boolean;
  remaining: number;
}> {
  const quota = await getUserQuota(userId);

  if (quota.hasUnlimited) {
    return { success: true, remaining: Infinity };
  }

  if (quota.usedToday >= quota.dailyLimit) {
    return { success: false, remaining: 0 };
  }

  quota.usedToday += 1;
  await saveQuota(quota);

  return {
    success: true,
    remaining: quota.dailyLimit - quota.usedToday,
  };
}

export async function getQuotaStatus(userId: string): Promise<{
  used: number;
  limit: number;
  remaining: number;
  resetsAt: number;
  hasUnlimited: boolean;
}> {
  const quota = await getUserQuota(userId);
  return {
    used: quota.usedToday,
    limit: quota.dailyLimit,
    remaining: quota.hasUnlimited
      ? Infinity
      : Math.max(0, quota.dailyLimit - quota.usedToday),
    resetsAt: quota.resetsAt,
    hasUnlimited: quota.hasUnlimited,
  };
}

export async function refundQuota(userId: string): Promise<{
  success: boolean;
  remaining: number;
}> {
  const quota = await getUserQuota(userId);

  if (quota.hasUnlimited) {
    return { success: true, remaining: Infinity };
  }

  if (quota.usedToday <= 0) {
    return { success: false, remaining: quota.dailyLimit };
  }

  quota.usedToday -= 1;
  await saveQuota(quota);

  return {
    success: true,
    remaining: quota.dailyLimit - quota.usedToday,
  };
}

export async function setUnlimitedAccess(
  userId: string,
  unlimited: boolean
): Promise<void> {
  const quota = await getUserQuota(userId);
  quota.hasUnlimited = unlimited;
  await saveQuota(quota);
}

export async function resetUserQuota(userId: string): Promise<void> {
  const redis = await getRedisClient();
  if (redis) {
    await redis.del(quotaKey(userId));
  }
  fallbackStore.delete(userId);
}

export async function getAllQuotaStats(): Promise<{
  totalUsers: number;
  totalUsedToday: number;
  averageUsage: number;
}> {
  const redis = await getRedisClient();

  if (redis) {
    const keys = await redis.keys(`${QUOTA_KEY_PREFIX}*`);
    if (keys.length === 0) {
      return { totalUsers: 0, totalUsedToday: 0, averageUsage: 0 };
    }

    const values = await redis.mget(keys);
    let totalUsed = 0;

    for (const raw of values) {
      if (raw) {
        try {
          const q = JSON.parse(raw);
          totalUsed += q.usedToday ?? 0;
        } catch {
          // skip malformed
        }
      }
    }

    return {
      totalUsers: keys.length,
      totalUsedToday: totalUsed,
      averageUsage: keys.length > 0 ? totalUsed / keys.length : 0,
    };
  }

  // Fallback
  const quotas = Array.from(fallbackStore.values());
  const totalUsed = quotas.reduce((sum, q) => sum + q.usedToday, 0);

  return {
    totalUsers: quotas.length,
    totalUsedToday: totalUsed,
    averageUsage: quotas.length > 0 ? totalUsed / quotas.length : 0,
  };
}

export async function cleanupExpiredQuotas(): Promise<number> {
  const redis = await getRedisClient();

  if (redis) {
    const keys = await redis.keys(`${QUOTA_KEY_PREFIX}*`);
    let cleaned = 0;

    for (const key of keys) {
      const raw = await redis.get(key);
      if (raw) {
        try {
          const q = JSON.parse(raw);
          if (Date.now() >= q.resetsAt + 24 * 60 * 60 * 1000) {
            await redis.del(key);
            cleaned++;
          }
        } catch {
          await redis.del(key);
          cleaned++;
        }
      }
    }

    return cleaned;
  }

  // Fallback
  const now = Date.now();
  let cleaned = 0;

  for (const [userId, quota] of fallbackStore.entries()) {
    if (now >= quota.resetsAt + 24 * 60 * 60 * 1000) {
      fallbackStore.delete(userId);
      cleaned++;
    }
  }

  return cleaned;
}
