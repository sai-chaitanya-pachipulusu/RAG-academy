import Parser from "rss-parser";

import type { FeedItem, FeedSource } from "./types";

type CacheEntry = {
  expiresAt: number;
  items: FeedItem[];
};

/** Parsed feed payload cache TTL (client-side; see MCP meta `feedCacheTtlMs`). */
export const CACHE_TTL_MS = 60 * 60 * 1000; // 1h
const FETCH_TIMEOUT_MS = 15_000;
const MAX_ITEMS_PER_SOURCE = 20;

declare global {
  var __ragacademy_feed_cache: Map<string, CacheEntry> | undefined;
}

function getCache() {
  if (!globalThis.__ragacademy_feed_cache) {
    globalThis.__ragacademy_feed_cache = new Map<string, CacheEntry>();
  }
  return globalThis.__ragacademy_feed_cache;
}

function normalizeText(s: unknown) {
  if (typeof s !== "string") return null;
  const trimmed = s.trim();
  return trimmed.length ? trimmed : null;
}

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function guessId(url: string, fallback: string) {
  try {
    const u = new URL(url);
    return u.toString();
  } catch {
    return fallback;
  }
}

export async function fetchSource(source: FeedSource): Promise<FeedItem[]> {
  const parser = new Parser();
  const cache = getCache();
  const cached = cache.get(source.id);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.items;
  }

  let res: Response;
  try {
    res = await fetch(source.url, {
      headers: {
        // Some feeds (e.g. Reddit) behave better with a UA.
        "user-agent": "RAGacademy/0.1 (research feed)",
        accept: "application/atom+xml, application/rss+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.1",
      },
      // IMPORTANT: do NOT use Next.js fetch cache for RSS/Atom because some feeds
      // are very large (>2MB) and Next will throw when trying to cache them.
      // We cache parsed items ourselves (see CACHE_TTL_MS).
      cache: "no-store",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch {
    return [];
  }

  if (!res.ok) {
    return [];
  }

  const xml = await res.text();
  const feed = await parser.parseString(xml);

  const items: FeedItem[] =
    feed.items?.map((it: Parser.Item, idx: number) => {
      const link = normalizeText(it.link) ?? normalizeText(it.guid) ?? "";
      const title = normalizeText(it.title) ?? "(untitled)";
      const rawSummary =
        normalizeText(it.contentSnippet) ??
        normalizeText(it.content) ??
        normalizeText(it.summary) ??
        null;
      const summary =
        rawSummary && rawSummary.includes("<") ? stripHtml(rawSummary) : rawSummary;

      const publishedAt =
        normalizeText(it.isoDate) ??
        normalizeText(it.pubDate) ??
        null;

      return {
        id: guessId(link, `${source.id}:${idx}`),
        source: source.title,
        title,
        url: link,
        publishedAt,
        summary,
        tags: source.tags,
      };
    }) ?? [];

  const normalized = items
    .filter((i) => Boolean(i.url))
    .slice(0, MAX_ITEMS_PER_SOURCE);

  cache.set(source.id, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    items: normalized,
  });

  return normalized;
}

export async function fetchFeed(sources: FeedSource[]) {
  const lists = await Promise.allSettled(sources.map(fetchSource));
  const items: FeedItem[] = [];

  for (const r of lists) {
    if (r.status === "fulfilled") items.push(...r.value);
  }

  // Sort newest first when possible.
  items.sort((a, b) => {
    const ad = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const bd = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return bd - ad;
  });

  // Deduplicate by URL.
  const seen = new Set<string>();
  const deduped: FeedItem[] = [];
  for (const it of items) {
    if (seen.has(it.id)) continue;
    seen.add(it.id);
    deduped.push(it);
  }

  return deduped;
}


