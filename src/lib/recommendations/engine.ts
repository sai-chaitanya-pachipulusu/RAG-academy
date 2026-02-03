/**
 * Challenge Recommendation Engine
 * Intelligent recommendations based on user progress, skill gaps, and learning patterns
 */

import { getAllChallenges, getChallengeBySlug } from "@/lib/challenges/catalog";
import type { Challenge } from "@/lib/challenges/types";
import { getSupabase } from "@/lib/supabase/client";

// ============================================
// Types
// ============================================

export interface RecommendationContext {
  userId: string;
  completedChallenges: string[];
  inProgressChallenges: string[];
  skillGaps: SkillGapInfo[];
  recentActivity: RecentActivity[];
  preferredDifficulty?: 'easy' | 'medium' | 'hard';
  learningGoal?: string;
}

export interface SkillGapInfo {
  skillCategory: string;
  skillName: string;
  proficiencyScore: number;
  gapSeverity: 'none' | 'minor' | 'moderate' | 'severe';
}

export interface RecentActivity {
  challengeSlug: string;
  action: 'started' | 'completed' | 'abandoned';
  timestamp: string;
}

export interface ChallengeRecommendation {
  challenge: Challenge;
  score: number;
  reasons: RecommendationReason[];
  matchType: 'skill_gap' | 'next_in_sequence' | 'review' | 'trending' | 'difficulty_match' | 'goal_aligned';
}

export interface RecommendationReason {
  type: 'skill_gap' | 'prerequisite' | 'progression' | 'difficulty' | 'variety' | 'goal';
  message: string;
  weight: number;
}

// ============================================
// Main Recommendation Engine
// ============================================

export class RecommendationEngine {
  private challenges: Challenge[];
  
  constructor() {
    this.challenges = getAllChallenges();
  }

  /**
   * Get personalized recommendations for a user
   */
  async getRecommendations(context: RecommendationContext, limit: number = 5): Promise<ChallengeRecommendation[]> {
    const scoredChallenges = await this.scoreChallenges(context);
    
    // Sort by score and return top recommendations
    return scoredChallenges
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Get next challenge recommendation (for "Continue Learning")
   */
  async getNextChallenge(context: RecommendationContext): Promise<ChallengeRecommendation | null> {
    const recommendations = await this.getRecommendations(context, 1);
    return recommendations[0] || null;
  }

  /**
   * Get review recommendations (spaced repetition)
   */
  async getReviewRecommendations(userId: string, limit: number = 3): Promise<ChallengeRecommendation[]> {
    const supabase = getSupabase();
    if (!supabase) return [];

    // Get challenges that need review based on completion date
    const { data: analytics } = await supabase
      .from("challenge_analytics")
      .select("challenge_slug, completed_at, attempts_count")
      .eq("user_id", userId)
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: true })
      .limit(20);

    if (!analytics || analytics.length === 0) return [];

    const now = new Date();
    interface ReviewCandidate {
      challenge: Challenge | null;
      daysSinceCompletion: number;
      attempts: number;
    }
    
    const reviewCandidates: ChallengeRecommendation[] = analytics
      .map((a: { challenge_slug: string; completed_at: string; attempts_count: number }) => ({
        challenge: getChallengeBySlug(a.challenge_slug),
        daysSinceCompletion: Math.floor(
          (now.getTime() - new Date(a.completed_at).getTime()) / (1000 * 60 * 60 * 24)
        ),
        attempts: a.attempts_count,
      }))
      .filter((c: ReviewCandidate) => c.challenge && this.shouldReview(c.daysSinceCompletion, c.attempts))
      .map((c: ReviewCandidate) => ({
        challenge: c.challenge!,
        score: this.calculateReviewScore(c.daysSinceCompletion, c.attempts),
        reasons: [{
          type: 'prerequisite' as const,
          message: `Completed ${c.daysSinceCompletion} days ago - time for a review!`,
          weight: 0.8,
        }],
        matchType: 'review' as const,
      }));

    return reviewCandidates.slice(0, limit);
  }

  /**
   * Get recommendations for a specific learning goal
   */
  async getGoalBasedRecommendations(
    context: RecommendationContext,
    goal: string,
    limit: number = 5
  ): Promise<ChallengeRecommendation[]> {
    const goalKeywords = this.extractGoalKeywords(goal);
    
    const scoredChallenges = this.challenges
      .filter((c) => !context.completedChallenges.includes(c.slug))
      .map((challenge) => {
        const score = this.calculateGoalMatchScore(challenge, goalKeywords);
        return {
          challenge,
          score,
          reasons: score > 0 ? [{
            type: 'goal' as const,
            message: `Aligns with your goal: ${goal}`,
            weight: score,
          }] : [],
          matchType: 'goal_aligned' as const,
        };
      });

    return scoredChallenges
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // ============================================
  // Scoring Methods
  // ============================================

  private async scoreChallenges(context: RecommendationContext): Promise<ChallengeRecommendation[]> {
    const recommendations: ChallengeRecommendation[] = [];

    for (const challenge of this.challenges) {
      // Skip completed challenges
      if (context.completedChallenges.includes(challenge.slug)) continue;

      const scoreResult = await this.calculateChallengeScore(challenge, context);
      
      if (scoreResult.score > 0) {
        recommendations.push({
          challenge,
          ...scoreResult,
        });
      }
    }

    return recommendations;
  }

  private async calculateChallengeScore(
    challenge: Challenge,
    context: RecommendationContext
  ): Promise<{ score: number; reasons: RecommendationReason[]; matchType: ChallengeRecommendation['matchType'] }> {
    let score = 0;
    const reasons: RecommendationReason[] = [];
    let matchType: ChallengeRecommendation['matchType'] = 'difficulty_match';

    // 1. Skill Gap Score (highest priority)
    const skillGapScore = this.calculateSkillGapScore(challenge, context.skillGaps);
    if (skillGapScore.score > 0) {
      score += skillGapScore.score;
      reasons.push(...skillGapScore.reasons);
      matchType = 'skill_gap';
    }

    // 2. Sequential Progression Score
    const progressionScore = this.calculateProgressionScore(challenge, context);
    if (progressionScore.score > 0) {
      score += progressionScore.score;
      reasons.push(...progressionScore.reasons);
      if (matchType === 'difficulty_match') matchType = 'next_in_sequence';
    }

    // 3. Difficulty Match Score
    const difficultyScore = this.calculateDifficultyScore(challenge, context);
    score += difficultyScore.score;
    if (difficultyScore.score > 0) {
      reasons.push(...difficultyScore.reasons);
    }

    // 4. Variety Score (penalize similar recent challenges)
    const varietyScore = this.calculateVarietyScore(challenge, context.recentActivity);
    score += varietyScore.score;
    if (varietyScore.score !== 0) {
      reasons.push(...varietyScore.reasons);
    }

    // 5. Goal Alignment Score
    if (context.learningGoal) {
      const goalScore = this.calculateGoalMatchScore(challenge, this.extractGoalKeywords(context.learningGoal));
      score += goalScore * 0.5; // Lower weight for goal alignment
    }

    // Normalize score to 0-100
    score = Math.min(Math.max(score, 0), 100);

    return { score, reasons, matchType };
  }

  private calculateSkillGapScore(
    challenge: Challenge,
    skillGaps: SkillGapInfo[]
  ): { score: number; reasons: RecommendationReason[] } {
    let score = 0;
    const reasons: RecommendationReason[] = [];

    // Check if challenge addresses any skill gaps
    for (const gap of skillGaps) {
      if (gap.gapSeverity === 'none') continue;

      // Check if challenge is in the gap category
      const isRelevant = 
        challenge.group.toLowerCase().includes(gap.skillCategory.toLowerCase()) ||
        challenge.title.toLowerCase().includes(gap.skillName.toLowerCase()) ||
        challenge.description.toLowerCase().includes(gap.skillName.toLowerCase());

      if (isRelevant) {
        // Higher score for more severe gaps
        const severityMultiplier = {
          minor: 15,
          moderate: 25,
          severe: 35,
        }[gap.gapSeverity];

        score += severityMultiplier;
        reasons.push({
          type: 'skill_gap',
          message: `Addresses your ${gap.gapSeverity} skill gap in ${gap.skillName}`,
          weight: severityMultiplier / 100,
        });
      }
    }

    return { score, reasons };
  }

  private calculateProgressionScore(
    challenge: Challenge,
    context: RecommendationContext
  ): { score: number; reasons: RecommendationReason[] } {
    let score = 0;
    const reasons: RecommendationReason[] = [];

    // Check if prerequisites are met
    if (challenge.prerequisites && challenge.prerequisites.length > 0) {
      const completedPrereqs = challenge.prerequisites.filter((p) =>
        context.completedChallenges.includes(p)
      );
      
      const prereqRatio = completedPrereqs.length / challenge.prerequisites.length;
      
      if (prereqRatio === 1) {
        // All prerequisites completed - high score
        score += 20;
        reasons.push({
          type: 'progression',
          message: "You've completed all prerequisites",
          weight: 0.2,
        });
      } else if (prereqRatio > 0) {
        // Some prerequisites completed - medium score
        score += 10 * prereqRatio;
        reasons.push({
          type: 'prerequisite',
          message: `${completedPrereqs.length}/${challenge.prerequisites.length} prerequisites completed`,
          weight: 0.1 * prereqRatio,
        });
      }
    } else {
      // No prerequisites - small bonus for accessibility
      score += 5;
    }

    // Check if this is a natural next step
    const recentCompleted = context.recentActivity
      .filter((a) => a.action === 'completed')
      .slice(0, 3);
    
    for (const recent of recentCompleted) {
      const recentChallenge = getChallengeBySlug(recent.challengeSlug);
      if (recentChallenge?.relatedChallenges?.includes(challenge.slug)) {
        score += 15;
        reasons.push({
          type: 'progression',
          message: "Natural next step from your recent work",
          weight: 0.15,
        });
        break;
      }
    }

    return { score, reasons };
  }

  private calculateDifficultyScore(
    challenge: Challenge,
    context: RecommendationContext
  ): { score: number; reasons: RecommendationReason[] } {
    let score = 0;
    const reasons: RecommendationReason[] = [];

    const preferredDifficulty = context.preferredDifficulty || this.inferPreferredDifficulty(context);

    if (challenge.difficulty === preferredDifficulty) {
      score += 10;
      reasons.push({
        type: 'difficulty',
        message: `Matches your preferred difficulty: ${preferredDifficulty}`,
        weight: 0.1,
      });
    } else if (
      (preferredDifficulty === 'easy' && challenge.difficulty === 'medium') ||
      (preferredDifficulty === 'medium' && challenge.difficulty === 'hard') ||
      (preferredDifficulty === 'hard' && challenge.difficulty === 'medium')
    ) {
      // Adjacent difficulty - small bonus
      score += 5;
    }

    return { score, reasons };
  }

  private calculateVarietyScore(
    challenge: Challenge,
    recentActivity: RecentActivity[]
  ): { score: number; reasons: RecommendationReason[] } {
    let score = 0;
    const reasons: RecommendationReason[] = [];

    // Check for recent similar challenges
    const recentChallenges = recentActivity
      .slice(0, 5)
      .map((a) => getChallengeBySlug(a.challengeSlug))
      .filter(Boolean) as Challenge[];

    const sameGroupCount = recentChallenges.filter(
      (c) => c.group === challenge.group
    ).length;

    if (sameGroupCount >= 3) {
      // Penalize for too much of the same
      score -= 10;
      reasons.push({
        type: 'variety',
        message: "Try a different topic for variety",
        weight: -0.1,
      });
    } else if (sameGroupCount === 0) {
      // Bonus for variety
      score += 5;
      reasons.push({
        type: 'variety',
        message: "New topic for variety",
        weight: 0.05,
      });
    }

    return { score, reasons };
  }

  private calculateGoalMatchScore(challenge: Challenge, keywords: string[]): number {
    if (keywords.length === 0) return 0;

    let matches = 0;
    const searchText = `${challenge.title} ${challenge.description} ${challenge.group}`.toLowerCase();

    for (const keyword of keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        matches++;
      }
    }

    return (matches / keywords.length) * 30; // Max 30 points for goal match
  }

  private calculateReviewScore(daysSinceCompletion: number, attempts: number): number {
    // Higher score for challenges completed longer ago and with more attempts (indicating difficulty)
    const timeFactor = Math.min(daysSinceCompletion / 30, 1); // Max at 30 days
    const attemptFactor = Math.min(attempts / 5, 1); // Max at 5 attempts
    
    return (timeFactor * 50) + (attemptFactor * 30) + 20;
  }

  // ============================================
  // Helper Methods
  // ============================================

  private inferPreferredDifficulty(context: RecommendationContext): 'easy' | 'medium' | 'hard' {
    const completedChallenges = context.completedChallenges
      .map((slug) => getChallengeBySlug(slug))
      .filter(Boolean) as Challenge[];

    if (completedChallenges.length === 0) return 'easy';

    const difficultyCounts = {
      easy: completedChallenges.filter((c) => c.difficulty === 'easy').length,
      medium: completedChallenges.filter((c) => c.difficulty === 'medium').length,
      hard: completedChallenges.filter((c) => c.difficulty === 'hard').length,
    };

    // Find most common difficulty
    const entries = Object.entries(difficultyCounts);
    entries.sort((a, b) => b[1] - a[1]);
    
    // Suggest next difficulty level if doing well
    const mostCommon = entries[0][0] as 'easy' | 'medium' | 'hard';
    const completionRate = context.completedChallenges.length / 
      (context.completedChallenges.length + context.inProgressChallenges.length || 1);

    if (completionRate > 0.8 && mostCommon === 'easy') return 'medium';
    if (completionRate > 0.8 && mostCommon === 'medium') return 'hard';
    
    return mostCommon;
  }

  private shouldReview(daysSinceCompletion: number, attempts: number): boolean {
    // Spaced repetition intervals
    if (attempts > 3) return daysSinceCompletion >= 7; // Difficult challenges: 1 week
    if (attempts > 1) return daysSinceCompletion >= 14; // Medium: 2 weeks
    return daysSinceCompletion >= 30; // Easy: 1 month
  }

  private extractGoalKeywords(goal: string): string[] {
    // Extract meaningful keywords from the goal
    const stopWords = new Set(['i', 'want', 'to', 'learn', 'about', 'how', 'the', 'a', 'an', 'and', 'or']);
    
    return goal
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.has(word))
      .slice(0, 5); // Limit to top 5 keywords
  }
}

// ============================================
// Singleton Instance
// ============================================

let engine: RecommendationEngine | null = null;

export function getRecommendationEngine(): RecommendationEngine {
  if (!engine) {
    engine = new RecommendationEngine();
  }
  return engine;
}

// ============================================
// Convenience Functions
// ============================================

export async function getPersonalizedRecommendations(
  userId: string,
  limit: number = 5
): Promise<ChallengeRecommendation[]> {
  const engine = getRecommendationEngine();
  const context = await buildRecommendationContext(userId);
  return engine.getRecommendations(context, limit);
}

export async function getContinueLearningRecommendation(
  userId: string
): Promise<ChallengeRecommendation | null> {
  const engine = getRecommendationEngine();
  const context = await buildRecommendationContext(userId);
  return engine.getNextChallenge(context);
}

export async function getReviewRecommendations(
  userId: string,
  limit: number = 3
): Promise<ChallengeRecommendation[]> {
  const engine = getRecommendationEngine();
  return engine.getReviewRecommendations(userId, limit);
}

// ============================================
// Context Builder
// ============================================

async function buildRecommendationContext(userId: string): Promise<RecommendationContext> {
  const supabase = getSupabase();
  
  const context: RecommendationContext = {
    userId,
    completedChallenges: [],
    inProgressChallenges: [],
    skillGaps: [],
    recentActivity: [],
  };

  if (!supabase) return context;

  try {
    // Fetch user progress
    const { data: progress } = await supabase
      .from("user_progress")
      .select("challenge_slug, status")
      .eq("user_id", userId);

    if (progress) {
      context.completedChallenges = progress
        .filter((p: { status: string }) => p.status === 'completed')
        .map((p: { challenge_slug: string }) => p.challenge_slug);
      
      context.inProgressChallenges = progress
        .filter((p: { status: string }) => p.status === 'in_progress')
        .map((p: { challenge_slug: string }) => p.challenge_slug);
    }

    // Fetch skill gaps
    const { data: skillGaps } = await supabase
      .from("skill_gap_analysis")
      .select("skill_category, skill_name, proficiency_score, gap_severity")
      .eq("user_id", userId)
      .order("proficiency_score", { ascending: true })
      .limit(10);

    if (skillGaps) {
      context.skillGaps = skillGaps.map((g: { 
        skill_category: string; 
        skill_name: string; 
        proficiency_score: number; 
        gap_severity: 'none' | 'minor' | 'moderate' | 'severe';
      }) => ({
        skillCategory: g.skill_category,
        skillName: g.skill_name,
        proficiencyScore: g.proficiency_score,
        gapSeverity: g.gap_severity,
      }));
    }

    // Fetch recent activity
    const { data: analytics } = await supabase
      .from("challenge_analytics")
      .select("challenge_slug, last_attempt_at, completed_at")
      .eq("user_id", userId)
      .order("last_attempt_at", { ascending: false })
      .limit(10);

    if (analytics) {
      context.recentActivity = analytics.map((a: { 
        challenge_slug: string; 
        last_attempt_at: string; 
        completed_at: string | null;
      }) => ({
        challengeSlug: a.challenge_slug,
        action: a.completed_at ? 'completed' : 'started',
        timestamp: a.last_attempt_at,
      }));
    }

    return context;
  } catch (error) {
    console.error("Error building recommendation context:", error);
    return context;
  }
}
