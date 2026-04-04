/**
 * In-memory rate limiter using token bucket algorithm.
 *
 * ⚠️  IMPORTANT: This uses an in-memory Map which does NOT persist across
 * Vercel serverless invocations. Each cold start gets a fresh map, meaning
 * rate limiting is effectively per-instance, not per-user.
 *
 * For production, replace with a distributed store:
 * - Vercel KV (Redis): https://vercel.com/docs/storage/vercel-kv
 * - Upstash Redis: https://upstash.com/docs/redis/overall/getstarted
 * - Cloudflare Workers KV (if using Cloudflare)
 */
type Bucket = { count: number; resetAtMs: number };

const buckets = new Map<string, Bucket>();

// Warn once on first use
let _rateLimitWarningShown = false;
function showWarning() {
  if (!_rateLimitWarningShown && typeof window === "undefined") {
    console.warn(
      "[rateLimit] Using in-memory rate limiter. This does NOT persist across " +
      "serverless invocations. For production, use Vercel KV or Upstash Redis."
    );
    _rateLimitWarningShown = true;
  }
}

export type RateLimitResult =
  | { ok: true; limit: number; remaining: number; resetAtMs: number }
  | { ok: false; limit: number; remaining: 0; resetAtMs: number };

export function rateLimit(
  key: string,
  { windowMs, limit }: { windowMs: number; limit: number }
): RateLimitResult {
  showWarning();
  const now = Date.now();
  const safeLimit = Math.max(1, Math.floor(limit));
  const safeWindow = Math.max(1_000, Math.floor(windowMs));

  let b = buckets.get(key);
  if (!b || now >= b.resetAtMs) {
    b = { count: 0, resetAtMs: now + safeWindow };
    buckets.set(key, b);
  }

  if (b.count >= safeLimit) {
    return { ok: false, limit: safeLimit, remaining: 0, resetAtMs: b.resetAtMs };
  }

  b.count += 1;
  return {
    ok: true,
    limit: safeLimit,
    remaining: Math.max(0, safeLimit - b.count),
    resetAtMs: b.resetAtMs,
  };
}

export function getClientIp(req: Request) {
  // Common proxy headers (best-effort; platform-dependent).
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() ?? null;
  const rip = req.headers.get("x-real-ip");
  if (rip) return rip.trim();
  return null;
}


