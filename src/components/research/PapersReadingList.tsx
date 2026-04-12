"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Card, CardExternalLink } from "@/components/ui/Card";
import type { Paper, PaperTag } from "@/lib/research/readingList";
import { PAPER_TAG_LABELS } from "@/lib/research/readingList";

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export function PapersReadingList({ papers }: { papers: Paper[] }) {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<PaperTag | "all">("all");

  const startHere = useMemo(() => {
    return papers.slice(0, 6);
  }, [papers]);

  const availableTags = useMemo(() => {
    const tags = uniq(papers.flatMap((p) => p.tags));
    return tags.sort((a, b) => PAPER_TAG_LABELS[a].localeCompare(PAPER_TAG_LABELS[b]));
  }, [papers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return papers.filter((p) => {
      if (tag !== "all" && !p.tags.includes(tag)) return false;
      if (!q) return true;
      const hay = `${p.title} ${p.authors} ${p.year} ${p.tags.join(" ")} ${p.links
        .map((l) => l.href)
        .join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [papers, query, tag]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Papers</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            A curated, implementation-oriented reading list. Each paper maps to a
            pipeline stage and a practical engineering takeaway.
          </p>
        </div>

        <div className="w-full sm:w-80">
          <label className="text-xs text-gray-500 dark:text-gray-400">Search</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="HyDE, reranking, eval, GraphRAG…"
            className="mt-1 h-10 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[#8B5CF6]400 dark:border-gray-800 dark:bg-[#7C3AED] dark:focus:ring-[#8B5CF6]600"
          />
        </div>
      </div>

      <Card className="p-5">
        <p className="text-sm font-medium">Start here (recommended)</p>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          If you want a tight, non-overwhelming reading path, read these first.
        </p>
        <ol className="mt-3 list-decimal space-y-2 pl-6 text-sm text-gray-700 dark:text-gray-300">
          {startHere.map((p) => (
            <li key={p.id}>
              <a
                href={p.links[0]?.href ?? "#"}
                className="font-medium text-gray-950 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-500 dark:text-gray-50 dark:decoration-white/25 dark:hover:decoration-white/50 cursor-pointer"
              >
                {p.title}
              </a>
              <span className="text-gray-500 dark:text-gray-400"> · {p.authors}</span>
            </li>
          ))}
        </ol>
      </Card>

      <Card className="p-5">
        <p className="text-sm font-medium">Filter by stage</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTag("all")}
            className={[
              "rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200-all duration-200",
              tag === "all"
                ? "border-gray-950 bg-[#7C3AED] text-white dark:border-white/25 dark:bg-white/10"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.06]",
            ].join(" ")}
          >
            All
          </button>
          {availableTags.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTag(t)}
              className={[
                "rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200-all duration-200",
                tag === t
                  ? "border-gray-950 bg-[#7C3AED] text-white dark:border-white/25 dark:bg-white/10"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.06]",
              ].join(" ")}
            >
              {PAPER_TAG_LABELS[t]}
            </button>
          ))}
        </div>
      </Card>

      <div className="grid gap-3">
        {filtered.map((p) => (
          <Card key={p.id} className="p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold tracking-tight text-gray-950 dark:text-gray-50">
                  {p.title}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {p.authors} · {p.year}
                  {p.venue ? ` · ${p.venue}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {p.tags.slice(0, 4).map((t) => (
                  <Badge key={`${p.id}-${t}`} variant="muted">
                    {PAPER_TAG_LABELS[t]}
                  </Badge>
                ))}
              </div>
            </div>

            <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">
              {p.why}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {p.links.map((l) => (
                <CardExternalLink key={l.href} href={l.href} className="p-3">
                  <p className="text-xs font-medium">{l.label}</p>
                </CardExternalLink>
              ))}
            </div>

            {p.implement && p.implement.length > 0 ? (
              <div className="mt-4">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Implement in RAG Academy
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {p.implement.map((x) => (
                    <a
                      key={x.href}
                      href={x.href}
                      className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.06] cursor-pointer"
                    >
                      {x.label}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </Card>
        ))}

        {filtered.length === 0 ? (
          <Card>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              No matches. Try a different keyword or clear the stage filter.
            </p>
          </Card>
        ) : null}
      </div>
    </div>
  );
}


