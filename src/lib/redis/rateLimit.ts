/**
 * Redis-backed rate limiter.
 *
 * Falls back to the in-memory limiter when Redis is not configured.
 * Uses a sliding window counter algorithm for accuracy across serverless invocations.
 */
import type { NextRequest } from "next/server";
import { getRedisClient } from "@/lib/redis/client";
import { rateLimit as inMemoryRateLimit, getClientIp } from "@/lib/security/rateLimit";

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  limit: number;
  resetAtMs: number;
}

const FALLBACK_WINDOW_MS = 60_000;
const FALLBACK_LIMIT = 60;

export async function redisRateLimit(
  key: string,
  { windowMs, limit }: { windowMs: number; limit: number }
): Promise<RateLimitResult> {
  const redis = getRedisClient();

  // Fall back to in-memory if Redis is unavailable
  if (!redis) {
    const result = inMemoryRateLimit(key, { windowMs, limit });
    return {
      ok: result.ok,
      remaining: result.remaining,
      limit: result.limit,
      resetAtMs: result.resetAtMs,
    };
  }

  const now = Date.now();
  const windowStart = now - windowMs;
  const redisKey = `ratelimit:${key}`;

  try {
    const pipe = redis.pipeline();
    // Remove expired entries
    pipe.zremrangebyscore(redisKey, 0, windowStart);
    // Count current entries
    pipe.zcard(redisKey);
    // Add current request
    pipe.zadd(redisKey, now, `${now}-${Math.random()}`);
    // Set expiry on the key
    pipe.expire(redisKey, Math.ceil(windowMs / 1000));

    const results = await pipe.exec();
    const count = (results?.[1]?.[1] as number) ?? 0;

    const remaining = Math.max(0, limit - count);
    const resetAtMs = now + windowMs;

    return {
      ok: count < limit,
      remaining,
      limit,
      resetAtMs,
    };
  } catch (error) {
    console.error("[redis] Rate limit error:", error);
    // Fail open on Redis errors
    return {
      ok: true,
      remaining: limit,
      limit,
      resetAtMs: now + windowMs,
    };
  }
}

export { getClientIp };
