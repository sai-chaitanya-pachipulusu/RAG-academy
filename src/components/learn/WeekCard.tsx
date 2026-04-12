import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { PlanWeek } from "@/lib/curriculum/plan";

function parseLessonHref(href: string) {
  const m = href.match(/^\/learn\/([^/]+)\/([^/]+)$/);
  if (!m) return null;
  return { phase: m[1], slug: m[2], id: `${m[1]}/${m[2]}` };
}

function parseChallengeHref(href: string) {
  const m = href.match(/^\/challenges\/([^/]+)$/);
  if (!m) return null;
  return { slug: m[1] };
}

export function WeekCard({
  w,
  getStageLabel,
}: {
  w: PlanWeek;
  getStageLabel: (href: string) => string | null;
}) {
  return (
    <Card className="p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs text-gray-500 dark:text-gray-400">{w.week}</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">{w.title}</h2>
          <p className="mt-2 text-sm leading-7 text-gray-600 dark:text-gray-300">
            {w.outcome}
          </p>
        </div>
        <Badge variant="muted">ship</Badge>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Learn</p>
          <ul className="mt-2 space-y-1 text-sm">
            {w.learn.map((l) => (
              <li key={l.href} className="flex flex-wrap items-center gap-2">
                <Link
                  href={l.href}
                  className="text-gray-950 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-500 dark:text-gray-50 dark:decoration-white/25 dark:hover:decoration-white/50 cursor-pointer"
                >
                  {l.label}
                </Link>
                {getStageLabel(l.href) ? (
                  <Badge variant="muted">{getStageLabel(l.href)}</Badge>
                ) : null}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Labs</p>
          <ul className="mt-2 space-y-1 text-sm">
            {w.labs.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-gray-950 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-500 dark:text-gray-50 dark:decoration-white/25 dark:hover:decoration-white/50 cursor-pointer"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Challenges</p>
          <ul className="mt-2 space-y-1 text-sm">
            {w.challenges.map((c) => (
              <li key={c.href} className="flex flex-wrap items-center gap-2">
                <Link
                  href={c.href}
                  className="text-gray-950 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-500 dark:text-gray-50 dark:decoration-white/25 dark:hover:decoration-white/50 cursor-pointer"
                >
                  {c.label}
                </Link>
                {getStageLabel(c.href) ? (
                  <Badge variant="muted">{getStageLabel(c.href)}</Badge>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-gray-200 bg-white/60 p-4 text-sm text-gray-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300">
        <span className="font-medium text-gray-950 dark:text-gray-50">Ship:</span>{" "}
        {w.ship}
      </div>
    </Card>
  );
}
