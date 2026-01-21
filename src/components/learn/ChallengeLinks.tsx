import Link from "next/link";

import { getChallengeBySlug } from "@/lib/challenges/catalog";

type Props = Readonly<{
  slugs: string[];
  title?: string;
}>;

export function ChallengeLinks({ slugs, title = "Try these challenges" }: Props) {
  const challenges = slugs
    .map((slug) => getChallengeBySlug(slug))
    .filter((c): c is NonNullable<ReturnType<typeof getChallengeBySlug>> => Boolean(c));

  if (challenges.length === 0) return null;

  return (
    <div className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
      <p className="text-sm font-medium">{title}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {challenges.map((c) => (
          <Link
            key={c.slug}
            href={`/challenges/${c.slug}`}
            className="rounded-2xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/40"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">{c.title}</p>
              <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
                {c.difficulty} · {c.xpReward} XP
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {c.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}


