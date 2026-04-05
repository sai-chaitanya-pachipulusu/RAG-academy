"use client";

import { useState } from "react";
import { LEARNING_RESOURCES, getFeaturedResources, type LearningResource } from "@/lib/resources";
import { ResourcesGrid } from "@/components/resources/LearnMore";

type FilterType = "all" | LearningResource["type"];

export default function ResourcesPage() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");

  const featured = getFeaturedResources();
  const filteredResources = LEARNING_RESOURCES.filter((r: LearningResource) => {
    const matchesFilter = filter === "all" || r.type === filter;
    const matchesSearch = search === "" || r.title.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filters: { label: string; value: FilterType }[] = [
    { label: "All", value: "all" },
    { label: "Videos", value: "video" },
    { label: "Articles", value: "article" },
    { label: "Papers", value: "paper" },
    { label: "GitHub", value: "github" },
    { label: "Courses", value: "course" },
    { label: "Docs", value: "documentation" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">Learning Resources</h1>
        <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
          Curated tutorials, papers, and documentation.
        </p>
      </header>

      {/* Featured */}
      {featured.length > 0 && (
        <section>
          <h2 className="text-base font-semibold">Featured Resources</h2>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((resource: LearningResource) => (
              <a key={resource.id} href={resource.url} target="_blank" rel="noopener noreferrer" className="group rounded-lg border border-zinc-200 bg-white p-3 transition-all hover:border-zinc-300 hover:shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-zinc-500">{resource.source}</span>
                </div>
                <h3 className="mt-1 text-sm font-semibold group-hover:text-blue-600 transition-colors">{resource.title}</h3>
                <p className="mt-0.5 text-xs text-zinc-500 line-clamp-2">{resource.description}</p>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Search & Filters */}
      <section className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <input type="text" placeholder="Search resources..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-8 rounded-lg border border-zinc-200 bg-white px-3 text-xs placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-600" />
        <div className="flex flex-wrap gap-1">
          {filters.map((f) => (
            <button key={f.value} onClick={() => setFilter(f.value)} className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${filter === f.value ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"}`}>
              {f.label}
            </button>
          ))}
        </div>
      </section>

      {/* Results */}
      <section>
        <p className="mb-2 text-xs text-zinc-500">{filteredResources.length} resources</p>
        <ResourcesGrid resources={filteredResources} title={filter === "all" ? "All Resources" : `${filter} Resources`} />
      </section>

      {/* Learning Paths */}
      <section className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-base font-semibold">Suggested Learning Paths</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-emerald-200 bg-white p-3 dark:border-emerald-900/50 dark:bg-zinc-950">
            <h3 className="text-sm font-medium text-emerald-800 dark:text-emerald-200">Beginner Path</h3>
            <ol className="mt-2 space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
              <li>1. Watch 3Blue1Brown Vectors video</li>
              <li>2. Read OpenAI Embeddings Guide</li>
              <li>3. Complete Foundations challenges</li>
              <li>4. Build your first RAG app</li>
            </ol>
          </div>
          <div className="rounded-md border border-purple-200 bg-white p-3 dark:border-purple-900/50 dark:bg-zinc-950">
            <h3 className="text-sm font-medium text-purple-800 dark:text-purple-200">Advanced Path</h3>
            <ol className="mt-2 space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
              <li>1. Read the original RAG paper</li>
              <li>2. Study FAISS internals</li>
              <li>3. Implement cross-encoder reranking</li>
              <li>4. Deploy with RAGAS evaluation</li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}
