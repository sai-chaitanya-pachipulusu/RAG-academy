/**
 * Recommendations API Routes
 * Handles challenge recommendation requests
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { RecommendationEngine } from "@/lib/recommendations/engine";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ============================================
// GET - Fetch recommendations
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type") || "personalized";
    const limit = parseInt(searchParams.get("limit") || "5");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const engine = new RecommendationEngine();
    const context = await buildRecommendationContext(userId);

    let recommendations;
    switch (type) {
      case "personalized":
        recommendations = await engine.getRecommendations(context, limit);
        break;
      case "continue":
        const nextChallenge = await engine.getNextChallenge(context);
        recommendations = nextChallenge ? [nextChallenge] : [];
        break;
      case "review":
        recommendations = await engine.getReviewRecommendations(userId, limit);
        break;
      case "goal":
        const goal = searchParams.get("goal");
        if (!goal) {
          return NextResponse.json(
            { error: "Goal is required for goal-based recommendations" },
            { status: 400 }
          );
        }
        recommendations = await engine.getGoalBasedRecommendations(context, goal, limit);
        break;
      default:
        return NextResponse.json(
          { error: "Invalid recommendation type" },
          { status: 400 }
        );
    }

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error("Recommendations API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}

// ============================================
// Helper Functions
// ============================================

async function buildRecommendationContext(userId: string) {
  const context = {
    userId,
    completedChallenges: [] as string[],
    inProgressChallenges: [] as string[],
    skillGaps: [] as any[],
    recentActivity: [] as any[],
  };

  try {
    // Fetch user progress
    const { data: progress } = await supabase
      .from("user_progress")
      .select("challenge_slug, status")
      .eq("user_id", userId);

    if (progress) {
      context.completedChallenges = progress
        .filter((p: any) => p.status === 'completed')
        .map((p: any) => p.challenge_slug);
      
      context.inProgressChallenges = progress
        .filter((p: any) => p.status === 'in_progress')
        .map((p: any) => p.challenge_slug);
    }

    // Fetch skill gaps
    const { data: skillGaps } = await supabase
      .from("skill_gap_analysis")
      .select("skill_category, skill_name, proficiency_score, gap_severity")
      .eq("user_id", userId)
      .order("proficiency_score", { ascending: true })
      .limit(10);

    if (skillGaps) {
      context.skillGaps = skillGaps.map((g: any) => ({
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
      context.recentActivity = analytics.map((a: any) => ({
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
