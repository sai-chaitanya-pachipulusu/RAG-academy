/**
 * Project Certificate API
 * 
 * POST /api/projects/certificate
 * Generates a certificate for a completed track
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

export async function POST(request: NextRequest) {
  try {
    const { trackId, trackTitle } = await request.json();
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "") || request.cookies.get("sb-access-token")?.value;

    if (!trackId || !trackTitle) {
      return NextResponse.json({ error: "trackId and trackTitle are required" }, { status: 400 });
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

    // Verify all challenges are completed
    const challengeSlugs = PROJECT_TRACKS[trackId];
    if (!challengeSlugs) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    const { data: progress } = await supabase
      .from("challenge_progress")
      .select("challenge_slug, status")
      .eq("user_id", user.id)
      .in("challenge_slug", challengeSlugs);

    const completedCount = progress?.filter((p) => p.status === "completed").length ?? 0;
    if (completedCount < challengeSlugs.length) {
      return NextResponse.json({
        error: "Track not complete",
        completed: completedCount,
        required: challengeSlugs.length,
      }, { status: 400 });
    }

    // Check if certificate already exists
    const { data: existing } = await supabase
      .from("project_certificates")
      .select("id, certificate_url")
      .eq("user_id", user.id)
      .eq("track_id", trackId)
      .single();

    if (existing) {
      return NextResponse.json({
        certificateUrl: existing.certificate_url,
        certificateId: existing.id,
        existing: true,
      });
    }

    // Generate certificate
    const certificateId = `cert_${user.id}_${trackId}_${Date.now()}`;
    const certificateUrl = `/certificates/${certificateId}`;

    await supabase.from("project_certificates").insert({
      id: certificateId,
      user_id: user.id,
      track_id: trackId,
      track_title: trackTitle,
      completed_at: new Date().toISOString(),
      certificate_url: certificateUrl,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      certificateUrl,
      certificateId,
      existing: false,
    });
  } catch (error: any) {
    console.error("Certificate API error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
