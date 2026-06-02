import { NextResponse } from "next/server";
import { z } from "zod";

import { verifySupabaseAccessToken } from "@/lib/supabase/serverAuth";
import { getChallengeBySlug } from "@/lib/challenges/catalog";
import { isChallengeFree } from "@/lib/challenges/access";
import { createClient } from "@supabase/supabase-js";
import { getClientIp, rateLimit } from "@/lib/security/rateLimit";

export const runtime = "nodejs";

const BodySchema = z.object({
  challengeSlug: z.string().min(1).max(200),
  code: z.string().min(1).max(100_000),
  language: z.string().min(1).max(40).default("python"),
  passed: z.boolean(),
  executionTimeMs: z.number().nullable().optional(),
  score: z.number().nullable().optional(),
  testsPassed: z.number().int().min(0).default(0),
  testsTotal: z.number().int().min(0).default(0),
  errorMessage: z.string().nullable().optional(),
  errorType: z.string().nullable().optional(),
  metrics: z.record(z.string(), z.unknown()).default({}),
});

function deriveStatus(input: z.infer<typeof BodySchema>) {
  if (input.passed) return "accepted" as const;
  if (input.errorType?.includes("Timeout")) return "time_limit" as const;
  if (input.errorType?.includes("SyntaxError")) return "compilation_error" as const;
  if (input.errorType) return "runtime_error" as const;
  return "wrong_answer" as const;
}

export async function POST(req: Request) {
  // Auth
  const accessToken = req.headers.get("x-supabase-access-token")?.trim();
  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await verifySupabaseAccessToken(accessToken);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit
  const rl = rateLimit(`submissions:user:${user.id}`, {
    windowMs: 60_000,
    limit: 30,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Submission rate limit exceeded. Slow down." },
      { status: 429 }
    );
  }

  // Body
  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Server-side paywall check
  const challenge = getChallengeBySlug(body.challengeSlug);
  if (!challenge) {
    return NextResponse.json({ error: "Unknown challenge" }, { status: 404 });
  }

  if (!isChallengeFree(challenge)) {
    // Need to check paid access via Supabase service role
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 500 }
      );
    }

    const sb = createClient(url, key);
    const { data: sub } = await sb
      .from("subscriptions")
      .select("tier, status")
      .eq("user_id", user.id)
      .single();

    const tier = (sub?.tier ?? "free") as string;
    const status = (sub?.status ?? "inactive") as string;
    const hasPaid =
      tier !== "free" &&
      (status === "active" || status === "trialing" || status === "lifetime");

    if (!hasPaid) {
      return NextResponse.json(
        {
          error: "Paid subscription required",
          reason: "paywall",
          challengeSlug: body.challengeSlug,
        },
        { status: 402 }
      );
    }
  }

  // Insert via service role (RLS would also allow this, but service role is simpler)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const sb = createClient(url, key);
  const status = deriveStatus(body);

  // XP-on-first-pass: only award XP if this is the user's first PASS for this challenge
  // (handled here server-side so it can't be gamed client-side)
  let xpAwarded = 0;
  if (body.passed) {
    const { count: priorPasses } = await sb
      .from("submission_history")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("challenge_slug", body.challengeSlug)
      .eq("passed", true);

    if ((priorPasses ?? 0) === 0) {
      xpAwarded = challenge.xpReward ?? 0;
    }
  }

  const { data, error } = await sb
    .from("submission_history")
    .insert({
      user_id: user.id,
      challenge_slug: body.challengeSlug,
      code: body.code,
      language: body.language,
      status,
      passed: body.passed,
      execution_time_ms: body.executionTimeMs ?? null,
      score: body.score ?? null,
      tests_passed: body.testsPassed,
      tests_total: body.testsTotal,
      error_message: body.errorMessage ?? null,
      error_type: body.errorType ?? null,
      metrics: body.metrics,
      xp_awarded: xpAwarded,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to save submission", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ id: data.id, xpAwarded, status });
}
