/**
 * Hosted MCP endpoint (Streamable HTTP, stateless JSON mode).
 *
 * Connect without cloning the repo:
 *   claude mcp add --transport http curriculum-compass https://ragacademy.space/api/mcp
 *
 * Each POST creates a fresh server + transport (serverless-safe; no session
 * state). Authenticated tools (answer, analyze_arch, progress,
 * recommendations) read 'Authorization: Bearer <Supabase access token>' and
 * route through the same /api/rag/* and /api/* routes as the web app, so
 * per-user quotas and the Pro paywall hold. Platform LLM keys are never used
 * for anonymous MCP callers, and MCP sampling is stdio-only (stateless HTTP
 * cannot carry server-initiated requests across instances).
 */
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";

import { createRagAcademyMcpServer } from "@/lib/mcp/createServer";
import { getClientIp, rateLimit } from "@/lib/security/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_LIMIT = { windowMs: 60_000, limit: 60 };

function jsonRpcError(status: number, code: number, message: string): Response {
  return new Response(
    JSON.stringify({ jsonrpc: "2.0", error: { code, message }, id: null }),
    { status, headers: { "content-type": "application/json" } }
  );
}

/** Self-origin for routing authenticated tool calls back through the app's API. */
function apiBaseUrl(req: Request): string {
  const fromEnv =
    process.env.RAG_ACADEMY_API_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "";
  if (fromEnv) return fromEnv.replace(/\/+$/, "");
  return new URL(req.url).origin;
}

export async function POST(req: Request): Promise<Response> {
  const rl = rateLimit(`mcp:ip:${getClientIp(req) ?? "unknown"}`, RATE_LIMIT);
  if (!rl.ok) {
    return jsonRpcError(429, -32000, "Rate limited. Slow down.");
  }

  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();

  const server = createRagAcademyMcpServer({
    apiConfig: bearer ? { baseUrl: apiBaseUrl(req), token: bearer } : null,
    allowLocalLlm: false,
    allowSampling: false,
  });

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless
    enableJsonResponse: true,
  });

  try {
    await server.connect(transport);
    return await transport.handleRequest(req);
  } finally {
    // JSON mode: the response body is complete once handleRequest resolves.
    void transport.close().catch(() => {});
  }
}

/** Stateless mode has no standalone SSE stream or sessions to terminate. */
export async function GET(): Promise<Response> {
  return jsonRpcError(405, -32000, "Method not allowed. POST JSON-RPC messages to this endpoint.");
}

export async function DELETE(): Promise<Response> {
  return jsonRpcError(405, -32000, "Method not allowed. This endpoint is stateless; there is no session to delete.");
}
