import type { Challenge, RawChallenge } from "@/lib/challenges/types";
export type { Challenge, ChallengeDifficulty } from "@/lib/challenges/types";

import { RAW_CHALLENGES } from "@/lib/challenges/defs/all";
import { CHALLENGE_STAGE_BY_SLUG } from "@/lib/challenges/defs/stageBySlug";

/**
 * Total lessons count (update this when adding lessons)
 * Run: (Get-ChildItem -Path "content\lessons" -Recurse -Filter "*.mdx").Count
 */
export const TOTAL_LESSONS_COUNT = 67;

function assertUniqueSlugs(challenges: RawChallenge[]) {
  const seen = new Set<string>();
  for (const c of challenges) {
    if (seen.has(c.slug)) {
      throw new Error(`Duplicate challenge slug: ${c.slug}`);
    }
    seen.add(c.slug);
  }
}

function withStage(c: RawChallenge): Challenge {
  const stage = CHALLENGE_STAGE_BY_SLUG[c.slug];
  if (!stage) {
    throw new Error(`Missing stage for challenge slug: ${c.slug}`);
  }
  return { ...c, stage };
}

assertUniqueSlugs(RAW_CHALLENGES);

export const CHALLENGES: Challenge[] = RAW_CHALLENGES.map(withStage);

export function getAllChallenges() {
  return CHALLENGES;
}

export function getChallengeBySlug(slug: string) {
  return CHALLENGES.find((c) => c.slug === slug) ?? null;
}

export function getChallengeNeighbors(slug: string) {
  const idx = CHALLENGES.findIndex((c) => c.slug === slug);
  if (idx < 0) return { prev: null, next: null };

  const prev = idx > 0 ? CHALLENGES[idx - 1] : null;
  const next = idx < CHALLENGES.length - 1 ? CHALLENGES[idx + 1] : null;
  return { prev, next };
}

/**
 * Get dynamic platform statistics for the home page
 */
export function getPlatformStats() {
  const challenges = CHALLENGES;
  
  // Count unique groups (modules)
  const uniqueGroups = new Set(challenges.map(c => c.group));
  
  // Count challenges with solutions (portfolio-ready)
  const portfolioProjects = challenges.filter(c => 
    c.realWorld?.useCases && c.realWorld.useCases.length > 0
  ).length;
  
  // Count unique stages as a secondary metric
  const uniqueStages = new Set(challenges.map(c => c.stage));
  
  return {
    totalChallenges: challenges.length,
    totalLessons: TOTAL_LESSONS_COUNT,
    totalModules: uniqueGroups.size,
    totalStages: uniqueStages.size,
    challengesWithSolutions: challenges.filter(c => c.solution).length,
    portfolioProjects: Math.min(portfolioProjects, challenges.filter(c => c.difficulty === "hard" && c.realWorld).length),
  };
}

