"use client";

import { useState } from "react";
import {
  LEARNING_RESOURCES,
  getFeaturedResources,
  type LearningResource,
} from "@/lib/resources";
import { ResourcesGrid } from "@/components/resources/LearnMore";

type FilterType = "all" | LearningResource["type"];

export function ResourcesView() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");

  const featured = getFeaturedResources();

  const filteredResources = LEARNING_RESOURCES.filter((r) => {
    const matchesFilter = filter === "all" || r.type === filter;
    const matchesSearch =
      search === "" ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      r.topics.some((t) => t.includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const filters: { label: string; value: FilterType; icon: string }[] = [
    { label: "All", value: "all", icon: "📚" },
    { label: "Videos", value: "video", icon: "🎬" },
    { label: "Articles", value: "article", icon: "📝" },
    { label: "Papers", value: "paper", icon: "📄" },
    { label: "GitHub", value: "github", icon: "💻" },
    { label: "Courses", value: "course", icon: "🎓" },
    { label: "Docs", value: "documentation", icon: "📖" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h2 className="text-xl font-semibold tracking-tight">Library</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Curated tutorials, papers, and documentation.
        </p>
      </header>

      {/* Featured Section */}
      <section>
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <span>⭐</span> Featured Resources
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((resource) => (
            <a
              key={resource.id}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-4 transition-all hover:border-amber-400 hover:shadow-lg dark:border-amber-900/50 dark:from-amber-950/30 dark:to-yellow-950/30 dark:hover:border-amber-700"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {resource.type === "video"
                    ? "🎬"
                    : resource.type === "paper"
                      ? "📄"
                      : resource.type === "github"
                        ? "💻"
                        : "📚"}
                </span>
                <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                  {resource.source}
                </span>
              </div>
              <h3 className="mt-2 text-sm font-semibold text-zinc-900 group-hover:text-amber-700 dark:text-zinc-100 dark:group-hover:text-amber-400">
                {resource.title}
              </h3>
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                {resource.description}
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* Search & Filters */}
      <section className="bg-white/80 py-3 backdrop-blur dark:bg-zinc-950/80">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 rounded-xl border border-zinc-200 bg-white px-4 text-sm placeholder:text-zinc-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-indigo-800 dark:focus:ring-indigo-900/50"
          />
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === f.value
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                }`}
              >
                <span>{f.icon}</span>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section>
        <p className="mb-4 text-sm text-zinc-500">
          {filteredResources.length} resources found
        </p>
        <ResourcesGrid
          resources={filteredResources}
          title={filter === "all" ? "All Resources" : `${filter} Resources`}
        />
      </section>
    </div>
  );
}
