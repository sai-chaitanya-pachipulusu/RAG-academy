"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { preferencesStore } from "@/lib/preferences/store";
import type { Topic } from "@/lib/preferences/topics";
import type { FeedItem, FeedSource } from "@/lib/research/types";
import { Badge } from "@/components/ui/Badge";
import { Card, CardExternalLink } from "@/components/ui/Card";

type ApiResponse = {
  items: FeedItem[];
  sources: FeedSource[];
};

export function ResearchFeed() {
  const prefs = useSyncExternalStore(
    preferencesStore.subscribe,
    preferencesStore.getSnapshot,
    preferencesStore.getServerSnapshot
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [sources, setSources] = useState<FeedSource[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/research/feed");
        if (!res.ok) throw new Error(`Feed request failed (${res.status})`);
        const json = (await res.json()) as ApiResponse;
        if (cancelled) return;
        setItems(json.items ?? []);
        setSources(json.sources ?? []);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const selectedTopics = new Set<Topic>(prefs.topics);
    const hasTopicFilter = selectedTopics.size > 0;

    return items.filter((i) => {
      const matchesTopic =
        !hasTopicFilter || i.tags.some((t) => selectedTopics.has(t as Topic));

      if (!matchesTopic) return false;
      if (!q) return true;

      const hay = `${i.title} ${i.summary ?? ""} ${i.source} ${i.tags.join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, prefs.topics, query]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Research</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Live feed from papers + practitioner blogs + community posts.
          </p>
        </div>

        <div className="w-full sm:w-96">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Search</p>
            <Link
              href="/research/papers"
              className="text-xs font-medium text-gray-950 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-500 dark:text-gray-50 dark:decoration-white/25 dark:hover:decoration-white/50 cursor-pointer"
            >
              Papers reading list →
            </Link>
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="RAG evaluation, caching, reranking…"
            className="mt-1 h-10 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[#3B82F6]400 dark:border-gray-800 dark:bg-[#2563EB] dark:focus:ring-[#3B82F6]600"
          />
        </div>
      </div>

      <Card className="p-4">
        <p className="text-sm font-medium">Sources</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {sources.map((s) => (
            <Badge key={s.id} variant="muted">
              {s.title}
            </Badge>
          ))}
        </div>
      </Card>

      {loading ? (
        <Card>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Loading feed…
          </p>
        </Card>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900/50 dark:bg-red-950/30">
          <p className="text-sm text-red-900 dark:text-red-200">{error}</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.slice(0, 50).map((i) => (
            <CardExternalLink
              key={i.id}
              href={i.url}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-950 dark:text-gray-50">
                    {i.title}
                  </p>
                  {i.summary ? (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      {i.summary.slice(0, 240)}
                      {i.summary.length > 240 ? "…" : ""}
                    </p>
                  ) : null}
                </div>
                <div className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                  <p>{i.source}</p>
                  {i.publishedAt ? (
                    <p className="mt-1">
                      {new Date(i.publishedAt).toLocaleDateString()}
                    </p>
                  ) : null}
                </div>
              </div>
            </CardExternalLink>
          ))}
        </div>
      )}
    </div>
  );
}


