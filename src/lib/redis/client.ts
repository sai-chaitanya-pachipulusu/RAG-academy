/**
 * Redis client singleton for server-side use.
 *
 * Uses a module-level cache so that Next.js hot-reload / serverless
 * invocations reuse the same connection instead of leaking clients.
 */
import Redis from "ioredis";

let _redis: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (_redis) return _redis;

  const url = process.env.REDIS_URL;
  if (!url) {
    console.warn("[redis] REDIS_URL not configured — falling back to in-memory store");
    return null;
  }

  _redis = new Redis(url, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) return null; // give up
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
  });

  _redis.on("error", (err) => {
    console.error("[redis] Connection error:", err.message);
  });

  return _redis;
}
