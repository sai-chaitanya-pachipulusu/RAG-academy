import { NextResponse } from "next/server";
import { z } from "zod";

import { searchContent } from "@/lib/search/search";
import { askLLM } from "@/lib/ai/llmClient";
import { verifySupabaseAccessToken } from "@/lib/supabase/serverAuth";
import { getClientIp, rateLimit } from "@/lib/security/rateLimit";

export const runtime = "nodejs";

const BodySchema = z.object({
  description: z.string().min(20).max(10000).describe("Description of the user's RAG architecture or problem"),
});

export async function POST(req: Request) {
  const accessToken = req.headers.get("x-supabase-access-token")?.trim();
  let userId: string | null = null;
  let isPro = false;

  if (accessToken) {
    const user = await verifySupabaseAccessToken(accessToken);
    userId = user?.id ?? null;
  }

  // Pro check
  if (userId) {
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && key) {
      const sb = createClient(url, key);
      const { data: sub } = await sb
        .from("subscriptions")
        .select("tier, status")
        .eq("user_id", userId)
        .single();
      isPro = sub ? sub.tier !== "free" : false;
    }
  }

  if (!isPro) {
    return NextResponse.json(
      { error: "Architecture analysis requires a Pro subscription." },
      { status: 402 }
    );
  }

  // Rate limit
  const rlKey = userId ? `rag-arch:${userId}` : `rag-arch:ip:${getClientIp(req) ?? "unknown"}`;
  const rl = rateLimit(rlKey, { windowMs: 60_000, limit: 5 });
  if (!rl.ok) {
    return NextResponse.json({ error: "Rate limited." }, { status: 429 });
  }

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const description = body.description.trim();

  // Search for relevant best practices
  const results = await searchContent(description, { limit: 8 });
  const sources = results.map((r, i) =>
    `[${i + 1}] ${r.title} (${r.type}) ${r.url}\n${(r.excerpt ?? r.snippet ?? "").slice(0, 1000)}`
  ).join("\n\n");

  const system = [
    "You are a senior RAG engineering architect. Analyze the user's RAG architecture and provide actionable feedback.",
    "Use the provided Sources (curriculum best practices) to ground your analysis.",
    "",
    "Structure your response as:",
    "1. **Architecture Summary** — restate what you understand about their setup",
    "2. **Strengths** — what they're doing right (with citations)",
    "3. **Risks & Gaps** — potential failure modes, bottlenecks, anti-patterns",
    "4. **Recommendations** — concrete next steps (ordered by impact)",
    "5. **Related Curriculum** — links to relevant lessons/challenges",
    "",
    "Be honest if their description is too vague. Ask clarifying questions.",
  ].join("\n");

  const userPrompt = [
    `User's architecture description:\n${description}`,
    "",
    "Sources from RAG Academy curriculum:",
    sources || "No relevant curriculum sources found.",
  ].join("\n\n");

  try {
    const response = await askLLM(system, userPrompt, { temperature: 0.3, maxTokens: 3000 });

    return NextResponse.json({
      analysis: response.text,
      tokens: response.tokens,
      note: "This analysis is based on the curriculum and general best practices. Always test changes in your specific context.",
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Analysis failed" },
      { status: 502 }
    );
  }
}
