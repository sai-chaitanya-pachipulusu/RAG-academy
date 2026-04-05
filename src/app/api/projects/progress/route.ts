/**
 * Project Progress API
 * 
 * GET /api/projects/progress?trackId=<id>
 * Returns progress for a specific project track
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const PROJECT_TRACKS: Record<string, string[]> = {
  "vector-db": [
    "dense-vector-class",
    "cosine-similarity",
    "naive-flat-index",
    "ivf-flat-index",
    "hnsw-index",
    "product-quantization",
  ],
  "rag-pipeline": [
    "end-to-end-rag-pipeline",
    "chunking-strategies",
    "embedding-model-selection",
    "basic-retrieval",
    "hybrid-search",
  ],
  "reranker": [
    "reranker-score-function",
    "reranker-cascade",
    "mmr-diversity",
    "reranker-selection",
  ],
  "evaluator": [
    "evaluator-recall-at-k",
    "evaluator-mrr",
    "evaluator-ndcg",
    "evaluator-f1-score",
    "faithfulness-judge",
    "llm-as-judge",
  ],
  "agent": [
    "tool-use-basics",
    "react-implementation",
    "self-correction-loop",
    "corrective-rag",
    "agentic-rag-workflows",
  ],
  "graph-rag": [
    "entity-extraction",
    "knowledge-graph-extraction",
    "graphrag-knowledge-graph",
    "graph-traversal-rag",
    "multi-hop-qa",
  ],
};

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackId = searchParams.get("trackId");
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "") || request.cookies.get("sb-access-token")?.value;

    if (!trackId) {
      return NextResponse.json({ error: "trackId is required" }, { status: 400 });
    }

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    // Verify user
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const challengeSlugs = PROJECT_TRACKS[trackId];
    if (!challengeSlugs) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    // Get completion status
    const { data: progress } = await supabase
      .from("challenge_progress")
      .select("challenge_slug, status, completed_at")
      .eq("user_id", user.id)
      .in("challenge_slug", challengeSlugs);

    const completedSlugs = progress
      ?.filter((p) => p.status === "completed")
      .map((p) => p.challenge_slug) ?? [];

    const completedChallenges = completedSlugs.length;
    const totalChallenges = challengeSlugs.length;
    const progressPercent = totalChallenges > 0
      ? Math.round((completedChallenges / totalChallenges) * 100)
      : 0;

    const completedAtItems = progress
      ?.filter((p) => p.status === "completed")
      .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
    const completedAt = completedAtItems && completedAtItems.length > 0 ? completedAtItems[0].completed_at : undefined;

    return NextResponse.json({
      trackId,
      trackTitle: "",
      totalChallenges,
      completedChallenges,
      progressPercent,
      completedSlugs,
      isComplete: completedChallenges === totalChallenges,
      completedAt,
    });
  } catch (error: any) {
    console.error("Progress API error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
