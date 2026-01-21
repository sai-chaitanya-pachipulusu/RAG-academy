import fs from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";
import { z } from "zod";

export type PlaybookSource = {
  title: string;
  url: string;
  type: "paper" | "docs" | "blog" | "video" | "repo" | "thread" | "podcast";
  authors?: string;
  year?: number;
  note?: string;
};

export type PlaybookMeta = {
  slug: string;
  title: string;
  description: string;
  order: number;
  tags: string[];
};

export type Playbook = PlaybookMeta & {
  body: string;
  sources: PlaybookSource[];
};

const PLAYBOOKS_DIR = path.join(process.cwd(), "content", "playbooks");

const PlaybookSourceSchema: z.ZodType<PlaybookSource> = z.object({
  title: z.string().min(1),
  url: z.string().url(),
  type: z.enum(["paper", "docs", "blog", "video", "repo", "thread", "podcast"]),
  authors: z.string().optional(),
  year: z.number().int().optional(),
  note: z.string().optional(),
});

const PlaybookFrontmatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(""),
  order: z.number().int().min(0).default(0),
  tags: z.array(z.string()).default([]),
  sources: z.array(PlaybookSourceSchema).default([]),
});

async function fileExists(p: string) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

export async function listPlaybooks(): Promise<PlaybookMeta[]> {
  const exists = await fileExists(PLAYBOOKS_DIR);
  if (!exists) return [];

  const entries = await fs.readdir(PLAYBOOKS_DIR, { withFileTypes: true });
  const mdxFiles = entries.filter(
    (e) => e.isFile() && e.name.toLowerCase().endsWith(".mdx")
  );

  const metas = await Promise.all(
    mdxFiles.map(async (f) => {
      const slug = f.name.replace(/\.mdx$/i, "");
      const fullPath = path.join(PLAYBOOKS_DIR, f.name);
      const raw = await fs.readFile(fullPath, "utf8");
      const { data } = matter(raw);
      const fm = PlaybookFrontmatterSchema.parse(data ?? {});

      return {
        slug,
        title: fm.title,
        description: fm.description,
        order: fm.order,
        tags: fm.tags,
      } satisfies PlaybookMeta;
    })
  );

  return metas.sort((a, b) =>
    a.order !== b.order ? a.order - b.order : a.slug.localeCompare(b.slug)
  );
}

export async function getPlaybook(slug: string): Promise<Playbook | null> {
  const filePath = path.join(PLAYBOOKS_DIR, `${slug}.mdx`);
  const exists = await fileExists(filePath);
  if (!exists) return null;

  const raw = await fs.readFile(filePath, "utf8");
  const { data, content } = matter(raw);
  const fm = PlaybookFrontmatterSchema.parse(data ?? {});

  return {
    slug,
    title: fm.title,
    description: fm.description,
    order: fm.order,
    tags: fm.tags,
    sources: fm.sources,
    body: content,
  };
}


