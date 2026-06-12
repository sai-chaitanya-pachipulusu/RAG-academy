import { getAllChallenges } from "@/lib/challenges/catalog";
import type { Challenge } from "@/lib/challenges/types";
import {
  CURRICULUM_STAGE_IDS,
  CURRICULUM_STAGE_LABELS,
  type CurriculumStage,
} from "@/lib/curriculum/stages";
import { getContentIndex } from "@/lib/search/search";
import { searchContentFused } from "@/lib/search/multiSearch";
import { buildMcpMeta } from "@/lib/mcp/mcpMeta";
import { getPublicSiteOrigin, toAbsoluteSiteUrl } from "@/lib/mcp/siteUrl";

export type LearningPathInput = {
  goal: string;
  /** Sustainable weekly study hours; enables the week estimate. */
  hoursPerWeek?: number;
  /** Stages before this one are skipped (the learner already covered them). */
  currentStage?: CurriculumStage;
  maxLessonsPerStage?: number;
  maxChallengesPerStage?: number;
};

type PathLesson = { title: string; path: string; url: string };
type PathChallenge = {
  slug: string;
  title: string;
  difficulty: Challenge["difficulty"];
  xpReward: number;
  estimatedMinutes: number;
  path: string;
  url: string;
};

export type LearningPathStep = {
  order: number;
  stage: CurriculumStage;
  stageLabel: string;
  lessons: PathLesson[];
  challenges: PathChallenge[];
};

/** Reading + note-taking budget per lesson when no better signal exists. */
const LESSON_MINUTES = 45;
const DEFAULT_CHALLENGE_MINUTES = 40;

function clampPerStage(value: number | undefined, fallback: number) {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(1, Math.min(5, Math.trunc(value ?? fallback)));
}

/**
 * Deterministic goal → ordered study path. Retrieval (multi-query + RRF)
 * selects relevant lessons/challenges; the official curriculum stage order
 * sequences them. No LLM involved, so output is reproducible and free.
 */
export async function buildLearningPath(input: LearningPathInput) {
  const goal = input.goal.trim();
  const origin = getPublicSiteOrigin();
  const maxLessons = clampPerStage(input.maxLessonsPerStage, 3);
  const maxChallenges = clampPerStage(input.maxChallengesPerStage, 2);

  const { results, queriesUsed } = await searchContentFused(goal, { limit: 40, perQueryLimit: 30 });

  const stageRank = new Map<CurriculumStage, number>(
    CURRICULUM_STAGE_IDS.map((stage, index) => [stage, index])
  );
  const minRank = input.currentStage ? (stageRank.get(input.currentStage) ?? 0) : 0;

  const lessonStageById = new Map<string, CurriculumStage | undefined>(
    getContentIndex()
      .filter((doc) => doc.type === "lesson")
      .map((doc) => [doc.id, doc.stage])
  );
  const challengeBySlug = new Map(getAllChallenges().map((c) => [c.slug, c]));

  const lessonsByStage = new Map<CurriculumStage, PathLesson[]>();
  const challengesByStage = new Map<CurriculumStage, PathChallenge[]>();
  const supportingPlaybooks: PathLesson[] = [];
  let totalChallengeMinutes = 0;
  let totalLessons = 0;
  let totalChallenges = 0;

  // Results arrive fusion-ranked (best first), so per-stage caps keep the top hits.
  for (const result of results) {
    if (result.type === "lesson") {
      const stage = lessonStageById.get(result.contentId ?? "");
      if (!stage) continue;
      const rank = stageRank.get(stage);
      if (rank === undefined || rank < minRank) continue;
      const bucket = lessonsByStage.get(stage) ?? [];
      if (bucket.length >= maxLessons) continue;
      bucket.push({ title: result.title, path: result.url, url: toAbsoluteSiteUrl(result.url, origin) });
      lessonsByStage.set(stage, bucket);
      totalLessons += 1;
    } else if (result.type === "challenge") {
      const slug = (result.contentId ?? "").replace(/^challenge:/, "");
      const challenge = challengeBySlug.get(slug);
      if (!challenge) continue;
      const rank = stageRank.get(challenge.stage);
      if (rank === undefined || rank < minRank) continue;
      const bucket = challengesByStage.get(challenge.stage) ?? [];
      if (bucket.length >= maxChallenges) continue;
      const minutes = challenge.timeEstimate?.minutes ?? DEFAULT_CHALLENGE_MINUTES;
      bucket.push({
        slug: challenge.slug,
        title: challenge.title,
        difficulty: challenge.difficulty,
        xpReward: challenge.xpReward,
        estimatedMinutes: minutes,
        path: `/challenges/${challenge.slug}`,
        url: toAbsoluteSiteUrl(`/challenges/${challenge.slug}`, origin),
      });
      challengesByStage.set(challenge.stage, bucket);
      totalChallengeMinutes += minutes;
      totalChallenges += 1;
    } else if (result.type === "playbook" && supportingPlaybooks.length < 3) {
      supportingPlaybooks.push({
        title: result.title,
        path: result.url,
        url: toAbsoluteSiteUrl(result.url, origin),
      });
    }
  }

  const steps: LearningPathStep[] = [];
  for (const stage of CURRICULUM_STAGE_IDS) {
    const lessons = lessonsByStage.get(stage) ?? [];
    const challenges = challengesByStage.get(stage) ?? [];
    if (lessons.length === 0 && challenges.length === 0) continue;
    steps.push({
      order: steps.length + 1,
      stage,
      stageLabel: CURRICULUM_STAGE_LABELS[stage],
      lessons,
      challenges,
    });
  }

  const totalMinutes = totalLessons * LESSON_MINUTES + totalChallengeMinutes;
  const estimatedHours = Math.round((totalMinutes / 60) * 10) / 10;
  const hoursPerWeek =
    Number.isFinite(input.hoursPerWeek) && (input.hoursPerWeek ?? 0) > 0 ? input.hoursPerWeek : undefined;

  const notes = [
    "Steps follow the official curriculum stage order; items within a step are ranked by multi-query RRF retrieval relevance.",
  ];
  if (input.currentStage) {
    notes.push(`Stages before '${input.currentStage}' were skipped as already covered.`);
  }
  if (steps.length === 0) {
    notes.push("No curriculum matches for this goal — try broader RAG terminology (e.g. 'hybrid retrieval', 'evaluation', 'chunking').");
  }

  return {
    meta: buildMcpMeta(),
    goal,
    queriesUsed,
    currentStage: input.currentStage ?? null,
    estimate: {
      totalLessons,
      totalChallenges,
      estimatedHours,
      ...(hoursPerWeek
        ? { hoursPerWeek, estimatedWeeks: Math.max(1, Math.ceil(estimatedHours / hoursPerWeek)) }
        : {}),
    },
    steps,
    supportingPlaybooks,
    notes,
  };
}
