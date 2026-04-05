/**
 * Redis client singleton for server-side use.
 *
 * Uses dynamic import so ioredis is not loaded during build.
 * Falls back to null if Redis is not configured or import fails.
 */

let _redis: any = null;
let _importing = false;

export async function getRedisClient(): Promise<any> {
  if (_redis) return _redis;
  if (_importing) return null;

  const url = process.env.REDIS_URL;
  if (!url) {
    return null;
  }

  _importing = true;
  try {
    const { default: Redis } = await import("ioredis");
    _redis = new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        if (times > 3) return null;
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
    });

    _redis.on("error", (err: Error) => {
      console.error("[redis] Connection error:", err.message);
    });

    return _redis;
  } catch (err) {
    console.warn("[redis] Failed to load ioredis:", err);
    return null;
  } finally {
    _importing = false;
  }
}
