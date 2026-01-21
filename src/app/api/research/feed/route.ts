import { NextResponse } from "next/server";

import { fetchFeed } from "@/lib/research/fetchFeed";
import { DEFAULT_FEED_SOURCES } from "@/lib/research/sources";

export const runtime = "nodejs";

export async function GET() {
  const items = await fetchFeed(DEFAULT_FEED_SOURCES);
  return NextResponse.json({ items, sources: DEFAULT_FEED_SOURCES });
}


