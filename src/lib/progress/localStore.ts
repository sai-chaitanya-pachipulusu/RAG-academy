"use client";

import { z } from "zod";

import type {
  ChallengeProgress,
  LessonProgress,
  LocalProgressStateV1,
  ProgressStatus,
} from "./types";
import { diffDaysLocal, todayLocalYmd } from "@/lib/gamification/streak";

const STORAGE_KEY = "rag_academy_progress_v1";

const ChallengeProgressSchema = z.object({
  status: z
    .union([
      z.literal("not_started"),
      z.literal("in_progress"),
      z.literal("completed"),
    ])
    .default("not_started"),
  attempts: z.number().int().min(0).default(0),
  userCode: z.string().nullable().default(null),
  completedAt: z.string().nullable().default(null),
});

const LessonProgressSchema = z.object({
  status: z
    .union([
      z.literal("not_started"),
      z.literal("in_progress"),
      z.literal("completed"),
    ])
    .default("not_started"),
  completedAt: z.string().nullable().default(null),
});

const LocalProgressSchemaV1 = z.object({
  version: z.literal(1),
  xp: z.number().int().min(0).default(0),
  streak: z.object({
    streakDays: z.number().int().min(0).default(0),
    lastActivityDate: z.string().nullable().default(null),
  }),
  challenges: z.record(z.string(), ChallengeProgressSchema).default({}),
  lessons: z.record(z.string(), LessonProgressSchema).default({}),
});

export type LocalProgressState = LocalProgressStateV1;

export function getDefaultProgress(): LocalProgressState {
  return {
    version: 1,
    xp: 0,
    streak: { streakDays: 0, lastActivityDate: null },
    challenges: {},
    lessons: {},
  };
}

export function loadProgress(): LocalProgressState {
  if (typeof window === "undefined") return getDefaultProgress();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return getDefaultProgress();

  try {
    const parsedJson = JSON.parse(raw);
    const parsed = LocalProgressSchemaV1.safeParse(parsedJson);
    if (!parsed.success) return getDefaultProgress();
    return parsed.data;
  } catch {
    return getDefaultProgress();
  }
}

export function saveProgress(state: LocalProgressState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function ensureChallenge(
  state: LocalProgressState,
  slug: string
): ChallengeProgress {
  const existing = state.challenges[slug];
  if (existing) return existing;
  const fresh: ChallengeProgress = {
    status: "not_started",
    attempts: 0,
    userCode: null,
    completedAt: null,
  };
  state.challenges[slug] = fresh;
  return fresh;
}

export function lessonId(phase: string, slug: string) {
  return `${phase}/${slug}`;
}

function ensureLesson(state: LocalProgressState, id: string): LessonProgress {
  const existing = state.lessons[id];
  if (existing) return existing;
  const fresh: LessonProgress = {
    status: "not_started",
    completedAt: null,
  };
  state.lessons[id] = fresh;
  return fresh;
}

export function upsertChallengeCode(
  state: LocalProgressState,
  slug: string,
  userCode: string,
  starterCode: string
) {
  const c = ensureChallenge(state, slug);
  c.userCode = userCode;
  if (c.status !== "completed") {
    const next: ProgressStatus =
      userCode.trim() && userCode.trim() !== starterCode.trim()
        ? "in_progress"
        : "not_started";
    c.status = next;
  }
}

export function markChallengeAttempt(state: LocalProgressState, slug: string) {
  const c = ensureChallenge(state, slug);
  c.attempts += 1;
  if (c.status === "not_started") c.status = "in_progress";
}

export function markChallengeCompleted(
  state: LocalProgressState,
  slug: string,
  xpReward: number
) {
  const c = ensureChallenge(state, slug);
  if (c.status !== "completed") {
    c.status = "completed";
    c.completedAt = new Date().toISOString();
    state.xp += Math.max(0, Math.floor(xpReward));
  }
  bumpStreak(state);
}

export function markLessonViewed(state: LocalProgressState, id: string) {
  const l = ensureLesson(state, id);
  if (l.status === "not_started") l.status = "in_progress";
}

export function markLessonCompleted(state: LocalProgressState, id: string) {
  const l = ensureLesson(state, id);
  if (l.status !== "completed") {
    l.status = "completed";
    l.completedAt = new Date().toISOString();
  }
  bumpStreak(state);
}

export function resetChallenge(state: LocalProgressState, slug: string) {
  const c = ensureChallenge(state, slug);
  if (c.status !== "completed") c.status = "not_started";
  c.userCode = null;
  c.completedAt = null;
  c.attempts = 0;
}

export function resetLesson(state: LocalProgressState, id: string) {
  const l = ensureLesson(state, id);
  if (l.status === "completed") return;
  l.status = "not_started";
  l.completedAt = null;
}

export function bumpStreak(state: LocalProgressState) {
  const today = todayLocalYmd();
  const last = state.streak.lastActivityDate;

  if (!last) {
    state.streak = { lastActivityDate: today, streakDays: 1 };
    return;
  }

  if (last === today) {
    // already counted today
    return;
  }

  const diff = diffDaysLocal(last, today);
  if (diff === 1) {
    state.streak = {
      lastActivityDate: today,
      streakDays: state.streak.streakDays + 1,
    };
    return;
  }

  state.streak = { lastActivityDate: today, streakDays: 1 };
}

export function resetProgress(): LocalProgressState {
  const fresh = getDefaultProgress();
  saveProgress(fresh);
  return fresh;
}


