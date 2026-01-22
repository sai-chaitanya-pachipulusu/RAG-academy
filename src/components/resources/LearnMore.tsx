"use client";

import {
  LEARNING_RESOURCES,
  CHALLENGE_RESOURCES,
  type LearningResource,
} from "@/lib/resources";

interface Props {
  challengeSlug?: string;
  topics?: string[];
  limit?: number;
}

const TYPE_ICONS: Record<LearningResource["type"], string> = {
  video: "🎬",
  article: "📝",
  paper: "📄",
  github: "💻",
  course: "🎓",
  documentation: "📚",
};

const TYPE_COLORS: Record<LearningResource["type"], string> = {
  video: "bg-red-100 text-red-700",
  article: "bg-blue-100 text-blue-700",
  paper: "bg-purple-100 text-purple-700",
  github: "bg-zinc-100 text-zinc-700",
  course: "bg-emerald-100 text-emerald-700",
  documentation: "bg-amber-100 text-amber-700",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "text-emerald-600",
  intermediate: "text-amber-600",
  advanced: "text-red-600",
};

export function LearnMoreSection({ challengeSlug, topics, limit = 3 }: Props) {
  let resources: LearningResource[] = [];

  // Get resources for this challenge
  if (challengeSlug && CHALLENGE_RESOURCES[challengeSlug]) {
    const ids = CHALLENGE_RESOURCES[challengeSlug];
    resources = LEARNING_RESOURCES.filter((r) => ids.includes(r.id));
  }
  // Or get by topics
  else if (topics && topics.length > 0) {
    resources = LEARNING_RESOURCES.filter((r) =>
      r.topics.some((t) => topics.includes(t))
    ).slice(0, limit);
  }

  if (resources.length === 0) return null;

  return (
    <div className="rounded-xl border border-zinc-200 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 p-4">
      <div className="flex items-center gap-2">
        <span className="text-lg">📖</span>
        <h3 className="text-sm font-semibold text-zinc-900">
          Learn More
        </h3>
      </div>
      <p className="mt-1 text-xs text-zinc-500">
        Curated resources to deepen your understanding
      </p>

      <div className="mt-4 space-y-3">
        {resources.map((resource) => (
          <a
            key={resource.id}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-lg border border-zinc-200 bg-white p-3 transition-all hover:border-indigo-300 hover:shadow-sm"
          >
            <div className="flex items-start gap-3">
              <span className="text-xl">{TYPE_ICONS[resource.type]}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-zinc-900 group-hover:text-indigo-600 truncate">
                    {resource.title}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${TYPE_COLORS[resource.type]}`}
                  >
                    {resource.type}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-500 line-clamp-2">
                  {resource.description}
                </p>
                <div className="mt-2 flex items-center gap-3 text-[10px]">
                  <span className="text-zinc-400">{resource.source}</span>
                  {resource.duration && (
                    <span className="text-zinc-400">⏱ {resource.duration}</span>
                  )}
                  <span className={DIFFICULTY_COLORS[resource.difficulty]}>
                    {resource.difficulty}
                  </span>
                </div>
              </div>
              <span className="text-zinc-400 group-hover:text-indigo-500">→</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

// Full resources grid for dedicated page
export function ResourcesGrid({
  resources,
  title,
}: {
  resources: LearningResource[];
  title: string;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {title}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {resources.map((resource) => (
          <a
            key={resource.id}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:border-indigo-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-indigo-800"
          >
            {resource.featured && (
              <span className="absolute right-2 top-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                ⭐ Featured
              </span>
            )}

            <div className="flex items-center gap-2">
              <span className="text-2xl">{TYPE_ICONS[resource.type]}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${TYPE_COLORS[resource.type]}`}
              >
                {resource.type}
              </span>
            </div>

            <h3 className="mt-3 text-sm font-semibold text-zinc-900 group-hover:text-indigo-600 dark:text-zinc-100 dark:group-hover:text-indigo-400">
              {resource.title}
            </h3>

            <p className="mt-2 text-xs text-zinc-500 line-clamp-2">
              {resource.description}
            </p>

            <div className="mt-3 flex flex-wrap gap-1">
              {resource.topics.slice(0, 3).map((topic) => (
                <span
                  key={topic}
                  className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                >
                  {topic}
                </span>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between text-[10px]">
              <span className="text-zinc-400">{resource.source}</span>
              <span className={DIFFICULTY_COLORS[resource.difficulty]}>
                {resource.difficulty}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

// Compact inline resource link
export function ResourceLink({ resourceId }: { resourceId: string }) {
  const resource = LEARNING_RESOURCES.find((r) => r.id === resourceId);
  if (!resource) return null;

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-xs font-medium text-zinc-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-indigo-800"
    >
      {TYPE_ICONS[resource.type]} {resource.source}
    </a>
  );
}
