import { NextRequest, NextResponse } from "next/server";

import { searchContent } from "@/lib/search/search";
import { rateLimit, getClientIp } from "@/lib/security/rateLimit";
import type { SearchResult } from "@/lib/search/types";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  if (!q) {
    return NextResponse.json({ results: [] satisfies SearchResult[] });
  }

  // Rate limit search to prevent abuse (20 requests per minute per IP)
  const ip = getClientIp(req) || "unknown";
  const limit = rateLimit(`search:${ip}`, { windowMs: 60_000, limit: 20 });

  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests", retryAfter: Math.ceil((limit.resetAtMs - Date.now()) / 1000) },
      { status: 429, headers: { "Retry-After": String(Math.ceil((limit.resetAtMs - Date.now()) / 1000)) } }
    );
  }

  const results = await searchContent(q, { limit: 8 });
  return NextResponse.json({ results });
}


