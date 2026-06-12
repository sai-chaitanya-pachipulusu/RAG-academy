const WINDOW_MS = 60_000;

/** In-process sliding window; stdio MCP is single client but limits abuse from tight agent loops. */
const hits = new Map<string, number[]>();

function isDisabled() {
  return process.env.RAG_ACADEMY_MCP_DISABLE_RATE_LIMIT === "true" || process.env.RAG_ACADEMY_MCP_DISABLE_RATE_LIMIT === "1";
}

/** @throws Error with user-facing message when over limit */
export function takeMcpRateSlot(bucket: string, maxPerWindow: number) {
  if (isDisabled()) return;
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  const arr = hits.get(bucket)?.filter((t) => t > windowStart) ?? [];
  if (arr.length >= maxPerWindow) {
    const oldest = Math.min(...arr);
    const retrySec = Math.ceil((WINDOW_MS - (now - oldest)) / 1000);
    throw new Error(`MCP rate limited (${bucket}). Retry in about ${retrySec}s or set RAG_ACADEMY_MCP_DISABLE_RATE_LIMIT=true.`);
  }
  arr.push(now);
  hits.set(bucket, arr);
}

export const MCP_RATE_LIMITS = {
  /** Full MDX reads (can be large). */
  content: 48,
  /** Outbound HTTP to third-party feeds. */
  researchFeed: 24,
  /** Authenticated calls hit your deploy. */
  authenticated: 30,
  /** LLM-backed Q&A; per-user daily quota also applies via the platform API. */
  answer: 30,
  /** LLM-backed architecture analysis; Pro tier verified server-side. */
  analyzeArch: 10,
} as const;
