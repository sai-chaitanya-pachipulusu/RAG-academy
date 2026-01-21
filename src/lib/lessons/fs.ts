import fs from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";
import { z } from "zod";

import { CURRICULUM_STAGE_IDS } from "@/lib/curriculum/stages";
import type { CurriculumStage } from "@/lib/curriculum/stages";
import type { Lesson, LessonMeta, LessonRef, LessonSource } from "@/lib/lessons/types";

export type { Lesson, LessonMeta, LessonRef, LessonSource };

const LESSONS_DIR = path.join(process.cwd(), "content", "lessons");

const LessonSourceSchema: z.ZodType<LessonSource> = z.object({
  title: z.string().min(1),
  url: z.string().url(),
  type: z.enum(["paper", "docs", "blog", "video", "repo", "thread", "podcast"]),
  authors: z.string().optional(),
  year: z.number().int().optional(),
  note: z.string().optional(),
});

const LessonFrontmatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(""),
  order: z.number().int().min(0).default(0),
  estimatedMinutes: z.number().int().min(1).default(15),
  stage: z.enum(CURRICULUM_STAGE_IDS).default("foundations"),
  prereqs: z
    .array(
      z.object({
        phase: z.string().min(1),
        slug: z.string().min(1),
      })
    )
    .default([]),
  next: z
    .object({
      phase: z.string().min(1),
      slug: z.string().min(1),
    })
    .nullable()
    .default(null),
  outcomes: z.array(z.string().min(1)).default([]),
  tags: z.array(z.string()).default([]),
  sources: z.array(LessonSourceSchema).default([]),
});

async function fileExists(p: string) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

export async function listPhases() {
  const exists = await fileExists(LESSONS_DIR);
  if (!exists) return [];

  const entries = await fs.readdir(LESSONS_DIR, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

export async function listLessonsByPhase(phase: string): Promise<LessonMeta[]> {
  const phaseDir = path.join(LESSONS_DIR, phase);
  const exists = await fileExists(phaseDir);
  if (!exists) return [];

  const entries = await fs.readdir(phaseDir, { withFileTypes: true });
  const mdxFiles = entries.filter(
    (e) => e.isFile() && e.name.toLowerCase().endsWith(".mdx")
  );

  const metas = await Promise.all(
    mdxFiles.map(async (f) => {
      const slug = f.name.replace(/\.mdx$/i, "");
      const fullPath = path.join(phaseDir, f.name);
      const raw = await fs.readFile(fullPath, "utf8");
      const { data } = matter(raw);
      const fm = LessonFrontmatterSchema.parse(data ?? {});

      const meta: LessonMeta = {
        phase,
        slug,
        title: fm.title,
        description: fm.description,
        order: fm.order,
        estimatedMinutes: fm.estimatedMinutes,
        stage: fm.stage,
        prereqs: fm.prereqs,
        next: fm.next,
        outcomes: fm.outcomes,
        tags: fm.tags,
      };

      return meta;
    })
  );

  return metas.sort((a, b) => (a.order !== b.order ? a.order - b.order : a.slug.localeCompare(b.slug)));
}

export async function getLesson(phase: string, slug: string): Promise<Lesson | null> {
  const filePath = path.join(LESSONS_DIR, phase, `${slug}.mdx`);
  const exists = await fileExists(filePath);
  if (!exists) return null;

  const raw = await fs.readFile(filePath, "utf8");
  const { data, content } = matter(raw);
  const fm = LessonFrontmatterSchema.parse(data ?? {});

  return {
    phase,
    slug,
    title: fm.title,
    description: fm.description,
    order: fm.order,
    estimatedMinutes: fm.estimatedMinutes,
    stage: fm.stage,
    prereqs: fm.prereqs,
    next: fm.next,
    outcomes: fm.outcomes,
    tags: fm.tags,
    body: content,
    sources: fm.sources,
  };
}


