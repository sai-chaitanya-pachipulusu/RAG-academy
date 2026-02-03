import type { CurriculumStage } from "@/lib/curriculum/stages";

export type LessonRef = {
  phase: string;
  slug: string;
};

export type LessonMeta = {
  phase: string; // e.g. "phase-0"
  slug: string; // e.g. "why-rag-exists"
  title: string;
  description: string;
  order: number;
  estimatedMinutes: number;
  stage: CurriculumStage;
  prereqs: LessonRef[];
  next: LessonRef | null;
  outcomes: string[];
  tags: string[];
};

export type LessonSource = {
  title: string;
  url: string;
  type: "paper" | "docs" | "blog" | "video" | "repo" | "thread" | "podcast" | "code" | "course";
  authors?: string;
  year?: number;
  note?: string;
};

export type Lesson = LessonMeta & {
  body: string;
  sources: LessonSource[];
};
