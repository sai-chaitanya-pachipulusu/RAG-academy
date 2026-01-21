import { NextResponse } from "next/server";

import { searchContent } from "@/lib/search/search";
import type { SearchResult } from "@/lib/search/types";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  if (!q) {
    return NextResponse.json({ results: [] satisfies SearchResult[] });
  }

  const results = await searchContent(q, { limit: 8 });
  return NextResponse.json({ results });
}


