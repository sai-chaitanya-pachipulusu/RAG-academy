import { notFound } from "next/navigation";

import { MDXRenderer } from "@/components/learn/MDXRenderer";
import { LessonSources } from "@/components/learn/LessonSources";
import { getPlaybook } from "@/lib/playbooks/fs";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PlaybookPage({ params }: Props) {
  const { slug } = await params;
  const playbook = await getPlaybook(slug);
  if (!playbook) notFound();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Playbooks / {playbook.slug}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          {playbook.title}
        </h1>
        {playbook.description ? (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {playbook.description}
          </p>
        ) : null}
      </header>

      <MDXRenderer source={playbook.body} />

      {playbook.sources && playbook.sources.length > 0 ? (
        // Reuse the lesson sources component (shape is compatible)
        <LessonSources sources={playbook.sources} />
      ) : null}
    </div>
  );
}


