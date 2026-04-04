/**
 * AI Code Review API Route
 * 
 * POST /api/ai/code-review
 * 
 * Accepts code and challenge context, returns structured AI feedback.
 * Implements caching, rate limiting, and quota management.
 */

import { NextRequest, NextResponse } from "next/server";
import { getLLMCodeReview } from "@/lib/ai/llmReview";
import { hasQuota, consumeQuota, refundQuota, getQuotaStatus } from "@/lib/ai/quota";
import { rateLimit, getClientIp } from "@/lib/security/rateLimit";
import { verifySupabaseAccessToken } from "@/lib/supabase/serverAuth";
import type { CodeReviewRequest } from "@/lib/ai/types";

/**
 * Get user ID from request — resolves the bearer token to an actual user ID
 * via Supabase so the token itself never appears in quota/rate-limit keys.
 * Falls back to an IP-based ID for unauthenticated requests.
 */
async function getUserId(req: NextRequest): Promise<string> {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const user = await verifySupabaseAccessToken(token);
    if (user?.id) return `user:${user.id}`;
  }

  // Fall back to IP-based ID for anonymous / unauthenticated requests
  const ip = getClientIp(req);
  return `ip:${ip || "anonymous"}`;
}

/**
 * Validate the review request
 */
function validateRequest(body: unknown): { valid: boolean; error?: string; data?: CodeReviewRequest } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid request body" };
  }

  const { code, challengeSlug, language, challengeTitle, challengeDescription } = body as Record<
    string,
    unknown
  >;

  if (!code || typeof code !== "string") {
    return { valid: false, error: "Code is required and must be a string" };
  }

  if (!challengeSlug || typeof challengeSlug !== "string") {
    return { valid: false, error: "Challenge slug is required" };
  }

  if (code.length > 50000) {
    return { valid: false, error: "Code exceeds maximum length of 50000 characters" };
  }

  const validLanguage = language === "typescript" || language === "python" ? language : "python";

  return {
    valid: true,
    data: {
      code,
      challengeSlug,
      language: validLanguage,
      challengeTitle: challengeTitle ? String(challengeTitle) : undefined,
      challengeDescription: challengeDescription ? String(challengeDescription) : undefined,
    },
  };
}

/**
 * POST handler for code review
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
    }

    // Validate request
    const validation = validateRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const requestData = validation.data!;
    const userId = await getUserId(req);

    // Apply IP-based rate limiting (10 requests per minute)
    const clientIp = getClientIp(req) || "unknown";
    const rateLimitResult = rateLimit(`ai-review:${clientIp}`, {
      windowMs: 60 * 1000, // 1 minute
      limit: 10,
    });

    if (!rateLimitResult.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Please try again later.",
          rateLimit: {
            remaining: 0,
            resetAt: rateLimitResult.resetAtMs,
            limit: rateLimitResult.limit,
          },
        },
        { status: 429 }
      );
    }

    // Check user quota
    const quotaCheck = hasQuota(userId);
    if (!quotaCheck.allowed) {
      const quotaStatus = getQuotaStatus(userId);
      return NextResponse.json(
        {
          success: false,
          error: "Daily review limit reached",
          quota: {
            used: quotaStatus.used,
            limit: quotaStatus.limit,
            remaining: 0,
            resetsAt: quotaStatus.resetsAt,
          },
        },
        { status: 429 }
      );
    }

    // Consume quota
    const quotaResult = consumeQuota(userId);
    if (!quotaResult.success) {
      return NextResponse.json(
        { success: false, error: "Failed to consume quota" },
        { status: 500 }
      );
    }

    // Get AI review
    const reviewResult = await getLLMCodeReview({
      ...requestData,
      userId,
      allowFallback: true,
    });

    // Get updated quota status
    const finalQuotaStatus = getQuotaStatus(userId);

    // Return response
    if (reviewResult.success) {
      return NextResponse.json({
        success: true,
        feedback: reviewResult.feedback,
        usedFallback: reviewResult.usedFallback,
        quota: {
          used: finalQuotaStatus.used,
          limit: finalQuotaStatus.limit,
          remaining: finalQuotaStatus.remaining,
          resetsAt: finalQuotaStatus.resetsAt,
        },
        costEstimate: reviewResult.costEstimate,
        rateLimit: {
          remaining: rateLimitResult.remaining,
          resetAt: rateLimitResult.resetAtMs,
          limit: rateLimitResult.limit,
        },
      });
    } else {
      // Refund quota on failure
      const quota = getQuotaStatus(userId);
      // Note: In a real implementation, you'd want to properly refund the quota
      // For now, we just return the error

      return NextResponse.json(
        {
          success: false,
          error: reviewResult.error || "Review failed",
          quota: {
            used: quota.used,
            limit: quota.limit,
            remaining: quota.remaining,
            resetsAt: quota.resetsAt,
          },
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Code review API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET handler for quota status
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const userId = await getUserId(req);
  const quota = getQuotaStatus(userId);

  return NextResponse.json({
    success: true,
    quota: {
      used: quota.used,
      limit: quota.limit,
      remaining: quota.remaining,
      resetsAt: quota.resetsAt,
      hasUnlimited: quota.hasUnlimited,
    },
  });
}
