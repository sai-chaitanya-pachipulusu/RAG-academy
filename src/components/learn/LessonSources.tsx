import type { LessonSource } from "@/lib/lessons/fs";

type Props = {
  sources: LessonSource[];
};

function typeLabel(t: LessonSource["type"]) {
  switch (t) {
    case "paper":
      return "Paper";
    case "docs":
      return "Docs";
    case "video":
      return "Talk";
    case "repo":
      return "Repo";
    case "thread":
      return "Thread";
    case "podcast":
      return "Podcast";
    case "blog":
    default:
      return "Article";
  }
}

export function LessonSources({ sources }: Props) {
  if (sources.length === 0) return null;

  return (
    <div className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
      <h2 className="text-lg font-semibold tracking-tight">Sources</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
        {sources.map((s) => (
          <li key={s.url}>
            <a
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-500 dark:decoration-zinc-700 dark:hover:decoration-zinc-400"
            >
              {s.title}
            </a>{" "}
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              · {typeLabel(s.type)}
              {s.authors ? ` · ${s.authors}` : ""}
              {typeof s.year === "number" ? ` · ${s.year}` : ""}
              {s.note ? ` · ${s.note}` : ""}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}


