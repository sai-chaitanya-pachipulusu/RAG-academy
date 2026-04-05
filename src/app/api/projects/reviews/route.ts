/**
 * Peer Reviews API
 *
 * GET /api/projects/reviews?projectId=<id>
 * POST /api/projects/reviews
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ reviews: [] });
    }

    const { data: reviews } = await supabase
      .from("peer_reviews")
      .select("*, profiles(username)")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    const formattedReviews = (reviews ?? []).map((r: any) => ({
      id: r.id,
      reviewerId: r.reviewer_id,
      reviewerName: r.profiles?.username ?? "Anonymous",
      projectId: r.project_id,
      projectTitle: r.project_title,
      criteria: r.criteria,
      overallScore: r.overall_score,
      feedback: r.feedback,
      createdAt: r.created_at,
    }));

    return NextResponse.json({ reviews: formattedReviews });
  } catch (error: any) {
    console.error("Reviews API error:", error);
    return NextResponse.json({ reviews: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, projectTitle, criteria, overallScore, feedback } = body;

    if (!projectId || !projectTitle || overallScore === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "") || request.cookies.get("sb-access-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const { data: review, error } = await supabase
      .from("peer_reviews")
      .insert({
        reviewer_id: user.id,
        project_id: projectId,
        project_title: projectTitle,
        criteria,
        overall_score: overallScore,
        feedback: feedback || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create review:", error);
      return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
    }

    return NextResponse.json({
      review: {
        id: review.id,
        reviewerId: review.reviewer_id,
        reviewerName: "You",
        projectId: review.project_id,
        projectTitle: review.project_title,
        criteria: review.criteria,
        overallScore: review.overall_score,
        feedback: review.feedback,
        createdAt: review.created_at,
      },
    });
  } catch (error: any) {
    console.error("Reviews API error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
