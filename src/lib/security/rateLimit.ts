type Bucket = { count: number; resetAtMs: number };

const buckets = new Map<string, Bucket>();

export type RateLimitResult =
  | { ok: true; limit: number; remaining: number; resetAtMs: number }
  | { ok: false; limit: number; remaining: 0; resetAtMs: number };

export function rateLimit(
  key: string,
  { windowMs, limit }: { windowMs: number; limit: number }
): RateLimitResult {
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


