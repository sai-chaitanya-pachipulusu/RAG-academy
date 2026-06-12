/**
 * Optional authenticated calls to the deployed RAG Academy Next.js API.
 *
 * Set:
 * - RAG_ACADEMY_API_BASE_URL (e.g. https://rag.academy or http://localhost:3000)
 * - RAG_ACADEMY_SUPABASE_ACCESS_TOKEN (Supabase JWT from a signed-in session)
 */

const DEFAULT_HTTP_TIMEOUT_MS = 20_000;
/** LLM-backed routes (/api/rag/*) can take 15-30s server-side. */
const LLM_HTTP_TIMEOUT_MS = 60_000;

export type ApiConfig = { baseUrl: string; token: string };

export function getApiConfig(): ApiConfig | null {
  const base =
    process.env.RAG_ACADEMY_API_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.RAG_ACADEMY_SITE_URL?.trim() ||
    "";
  const token = process.env.RAG_ACADEMY_SUPABASE_ACCESS_TOKEN?.trim() || "";
  if (!base || !token) return null;
  const baseUrl = base.replace(/\/+$/, "");
  return { baseUrl, token };
}

/** Decode JWT payload without verifying signature; used only to read `sub`. */
export function getJwtSub(jwt: string): string | null {
  const parts = jwt.split(".");
  if (parts.length < 2) return null;
  try {
    const payloadSegment = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payloadSegment.padEnd(payloadSegment.length + ((4 - (payloadSegment.length % 4)) % 4), "=");
    const json = Buffer.from(padded, "base64").toString("utf8");
    const payload = JSON.parse(json) as { sub?: unknown };
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export type RagApiCallResult =
  | { ok: true; status: number; json: Record<string, unknown> }
  | { ok: false; status: number; error: string };

/**
 * POST to a deployed /api/rag/* route with the user's Supabase JWT.
 * The server verifies the JWT, subscription tier, and per-user quota —
 * the MCP process never decides paywall outcomes itself.
 */
export async function postRagApi(
  path: "/api/rag/ask" | "/api/rag/analyze",
  body: Record<string, unknown>,
  config?: ApiConfig
): Promise<RagApiCallResult> {
  const cfg = config ?? getApiConfig();
  if (!cfg) {
    throw new Error(
      "Configure RAG_ACADEMY_API_BASE_URL (or NEXT_PUBLIC_APP_URL / NEXT_PUBLIC_SITE_URL) and RAG_ACADEMY_SUPABASE_ACCESS_TOKEN."
    );
  }

  const res = await fetch(`${cfg.baseUrl}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-supabase-access-token": cfg.token,
      accept: "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(LLM_HTTP_TIMEOUT_MS),
  });

  const text = await res.text();
  let json: Record<string, unknown>;
  try {
    json = JSON.parse(text) as Record<string, unknown>;
  } catch {
    json = { raw: text.slice(0, 500) };
  }

  if (!res.ok) {
    const error =
      typeof json.error === "string" ? json.error : `RAG API failed (${res.status}): ${text.slice(0, 400)}`;
    return { ok: false, status: res.status, error };
  }

  return { ok: true, status: res.status, json };
}

export async function fetchMyProgress(config?: ApiConfig): Promise<unknown> {
  const cfg = config ?? getApiConfig();
  if (!cfg) {
    throw new Error(
      "Configure RAG_ACADEMY_API_BASE_URL (or NEXT_PUBLIC_APP_URL / NEXT_PUBLIC_SITE_URL) and RAG_ACADEMY_SUPABASE_ACCESS_TOKEN to pull progress."
    );
  }

  const res = await fetch(`${cfg.baseUrl}/api/progress/sync`, {
    method: "GET",
    headers: {
      authorization: `Bearer ${cfg.token}`,
      accept: "application/json",
    },
    signal: AbortSignal.timeout(DEFAULT_HTTP_TIMEOUT_MS),
  });

  const text = await res.text();
  let json: unknown;
  try {
    json = JSON.parse(text) as unknown;
  } catch {
    json = { raw: text.slice(0, 500) };
  }

  if (!res.ok) {
    throw new Error(`Progress API failed (${res.status}): ${text.slice(0, 400)}`);
  }

  return json;
}

export type RecommendationType = "personalized" | "continue" | "review" | "goal";

export async function fetchMyRecommendations(
  options: {
    type: RecommendationType;
    limit: number;
    goal?: string;
  },
  config?: ApiConfig
): Promise<unknown> {
  const cfg = config ?? getApiConfig();
  if (!cfg) {
    throw new Error(
      "Configure RAG_ACADEMY_API_BASE_URL (or NEXT_PUBLIC_APP_URL / NEXT_PUBLIC_SITE_URL) and RAG_ACADEMY_SUPABASE_ACCESS_TOKEN."
    );
  }

  const sub = getJwtSub(cfg.token);
  if (!sub) {
    throw new Error("Could not read user id (sub) from RAG_ACADEMY_SUPABASE_ACCESS_TOKEN.");
  }

  const q = new URLSearchParams({
    userId: sub,
    type: options.type,
    limit: String(options.limit),
  });
  if (options.type === "goal" && options.goal) {
    q.set("goal", options.goal);
  }

  const res = await fetch(`${cfg.baseUrl}/api/recommendations?${q.toString()}`, {
    method: "GET",
    headers: {
      accept: "application/json",
    },
    signal: AbortSignal.timeout(DEFAULT_HTTP_TIMEOUT_MS),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Recommendations API failed (${res.status}): ${text.slice(0, 400)}`);
  }

  return JSON.parse(text) as unknown;
}
