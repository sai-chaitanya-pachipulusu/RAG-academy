import { getRedisClient } from "@/lib/redis/client";

const QUOTA_PREFIX = "quota:rag:";
const DEFAULT_DAILY_LIMIT = parseInt(process.env.RAG_ASK_DAILY_LIMIT || "10");

function getResetAt(): number {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  t.setHours(0, 0, 0, 0);
  return t.getTime();
}

function parseUsed(raw: string | null): { used: number; resetsAt: number } {
  if (!raw) return { used: 0, resetsAt: getResetAt() };
  try {
    const parsed = JSON.parse(raw);
    if (Date.now() >= parsed.resetsAt) {
      return { used: 0, resetsAt: getResetAt() };
    }
    return { used: parsed.used ?? 0, resetsAt: parsed.resetsAt };
  } catch {
    return { used: 0, resetsAt: getResetAt() };
  }
}

const fallback = new Map<string, { used: number; resetsAt: number }>();

export async function checkRagQuota(userId: string): Promise<{
  allowed: boolean;
  remaining: number;
}> {
  const redis = await getRedisClient();
  const key = `${QUOTA_PREFIX}${userId}`;

  let state: { used: number; resetsAt: number };

  if (redis) {
    const raw = await redis.get(key);
    state = parseUsed(raw);
  } else {
    const now = Date.now();
    const existing = fallback.get(userId);
    if (!existing || now >= existing.resetsAt) {
      state = { used: 0, resetsAt: getResetAt() };
      fallback.set(userId, state);
    } else {
      state = existing;
    }
  }

  const remaining = Math.max(0, DEFAULT_DAILY_LIMIT - state.used);
  return { allowed: remaining > 0, remaining };
}

export async function consumeRagQuota(userId: string): Promise<{
  success: boolean;
  remaining: number;
}> {
  const redis = await getRedisClient();
  const key = `${QUOTA_PREFIX}${userId}`;
  const now = Date.now();

  // Unlimited if env says so
  if (DEFAULT_DAILY_LIMIT < 0) {
    return { success: true, remaining: Infinity };
  }

  if (redis) {
    const raw = await redis.get(key);
    const state = parseUsed(raw);
    if (state.used >= DEFAULT_DAILY_LIMIT) {
      return { success: false, remaining: 0 };
    }
    state.used += 1;
    const ttl = Math.max(0, Math.ceil((state.resetsAt - now) / 1000)) + 86400;
    await redis.setex(key, ttl, JSON.stringify(state));
    return { success: true, remaining: DEFAULT_DAILY_LIMIT - state.used };
  }

  // In-memory fallback
  const existing = fallback.get(userId);
  const state = existing && now < existing.resetsAt ? existing : { used: 0, resetsAt: getResetAt() };
  if (state.used >= DEFAULT_DAILY_LIMIT) {
    return { success: false, remaining: 0 };
  }
  state.used += 1;
  fallback.set(userId, state);
  return { success: true, remaining: DEFAULT_DAILY_LIMIT - state.used };
}
