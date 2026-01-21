import { Badge } from "@/components/ui/Badge";
import { Card, CardLink } from "@/components/ui/Card";

import { listPlaybooks } from "@/lib/playbooks/fs";

export default async function PlaybooksPage() {
  const playbooks = await listPlaybooks();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Playbooks</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Production Playbooks
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Decision-first guides you can ship. Each playbook explains why, when,
          tradeoffs, metrics, and failure modes.
        </p>
      </header>

      {playbooks.length === 0 ? (
        <Card>
          <p className="text-sm font-medium">No playbooks yet</p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {playbooks.map((p) => (
            <CardLink
              key={p.slug}
              href={`/playbooks/${p.slug}`}
            >
              <p className="text-sm font-medium">{p.title}</p>
              {p.description ? (
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                  {p.description}
                </p>
              ) : null}
              {p.tags.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.tags.slice(0, 6).map((t) => (
                    <Badge key={t} variant="muted">
                      {t}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </CardLink>
          ))}
        </div>
      )}
    </div>
  );
}


