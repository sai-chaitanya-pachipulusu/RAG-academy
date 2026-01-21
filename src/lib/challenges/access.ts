/**
 * Challenge Access Control
 * 
 * Determines which challenges are free vs paid based on:
 * 1. Difficulty level (easy challenges are free)
 * 2. Stage (foundational stages are free)
 * 3. Explicit free list
 */

import type { Challenge } from "./types";
import type { CurriculumStage } from "@/lib/curriculum/stages";

// Stages that are completely free
const FREE_STAGES: CurriculumStage[] = [
  "foundations",
  "pre-retrieval",
];

// Additional free challenges by slug (beyond stage-based rules)
const FREE_CHALLENGE_SLUGS = new Set<string>([
  // Vector math basics
  "dot-product",
  "cosine-similarity", 
  "euclidean-distance",
  "tokenizer-basics",
  
  // Basic chunking
  "simple-chunking",
  "overlap-chunking",
  
  // Basic retrieval
  "basic-retrieval",
  "embed-and-search",
  
  // Query basics
  "query-normalization",
  
  // Basic evaluation
  "retrieval-metrics",
  
  // Grounding basics
  "prompt-template",
  
  // TypeScript basics (first few)
  "ts-dot-product",
  "ts-cosine-similarity",
  "ts-fixed-size-chunker",
  "ts-sentence-chunker",
  "ts-top-k-search",
]);

/**
 * Check if a challenge is free (accessible without payment)
 */
export function isChallengeFree(challenge: Challenge): boolean {
  // Easy difficulty in free stages = free
  if (FREE_STAGES.includes(challenge.stage)) {
    return true;
  }
  
  // Explicitly marked free challenges
  if (FREE_CHALLENGE_SLUGS.has(challenge.slug)) {
    return true;
  }
  
  // Easy challenges in any stage are free (up to a limit)
  // This gives users a taste of each module
  if (challenge.difficulty === "easy") {
    return true;
  }
  
  return false;
}

/**
 * Get count of free challenges
 */
export function countFreeChallenges(challenges: Challenge[]): number {
  return challenges.filter(isChallengeFree).length;
}

/**
 * Get count of paid-only challenges  
 */
export function countPaidChallenges(challenges: Challenge[]): number {
  return challenges.filter(c => !isChallengeFree(c)).length;
}

/**
 * Access levels for challenges
 */
export type AccessLevel = "free" | "requires_login" | "requires_payment";

/**
 * Get access level for a challenge based on user state
 */
export function getChallengeAccessLevel(
  challenge: Challenge,
  options: {
    isLoggedIn: boolean;
    hasPaidAccess: boolean;
  }
): AccessLevel {
  // Free challenges are always accessible
  if (isChallengeFree(challenge)) {
    return "free";
  }
  
  // Paid challenges require payment
  if (options.hasPaidAccess) {
    return "free"; // They have access
  }
  
  // Not paid = requires payment
  return "requires_payment";
}

/**
 * Check if user can access a challenge
 */
export function canAccessChallenge(
  challenge: Challenge,
  options: {
    isLoggedIn: boolean;
    hasPaidAccess: boolean;
  }
): boolean {
  const level = getChallengeAccessLevel(challenge, options);
  return level === "free";
}
