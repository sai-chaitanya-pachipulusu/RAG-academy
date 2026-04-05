/**
 * Health Check API
 *
 * Checks the status of all critical dependencies:
 * - Supabase connection
 * - Redis connection
 * - Database tables
 *
 * Used by:
 * - Vercel uptime monitoring
 * - Client connectivity checks
 * - Load balancer health probes
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getRedisClient } from "@/lib/redis/client";

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: number;
  checks: {
    name: string;
    status: "pass" | "fail" | "warn";
    message: string;
  }[];
}

const startTime = Date.now();

export async function GET(request: NextRequest): Promise<NextResponse<HealthStatus>> {
  const checks: HealthStatus["checks"] = [];
  let overallStatus: HealthStatus["status"] = "healthy";

  // Check Supabase
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase.from("profiles").select("id").limit(1);

    if (error) {
      checks.push({ name: "supabase", status: "fail", message: error.message });
      overallStatus = "unhealthy";
    } else {
      checks.push({ name: "supabase", status: "pass", message: "Connected" });
    }
  } catch (error: any) {
    checks.push({ name: "supabase", status: "fail", message: error.message });
    overallStatus = "unhealthy";
  }

  // Check Redis
  try {
    const redis = await getRedisClient();
    if (redis) {
      const result = await redis.ping();
      checks.push({ name: "redis", status: result === "PONG" ? "pass" : "warn", message: result });
    } else {
      checks.push({ name: "redis", status: "warn", message: "Not configured (using in-memory fallback)" });
    }
  } catch (error: any) {
    checks.push({ name: "redis", status: "warn", message: error.message });
  }

  // Check critical tables
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const tables = ["profiles", "challenge_progress", "challenge_submissions"];
    for (const table of tables) {
      const { error } = await supabase.from(table).select("id").limit(1);
      if (error) {
        checks.push({ name: `table:${table}`, status: "warn", message: error.message });
      } else {
        checks.push({ name: `table:${table}`, status: "pass", message: "Exists" });
      }
    }
  } catch (error: any) {
    checks.push({ name: "tables", status: "fail", message: error.message });
  }

  const isDegraded = checks.some((c) => c.status === "warn") && overallStatus !== "unhealthy";
  if (isDegraded) overallStatus = "degraded";

  return NextResponse.json(
    {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - startTime) / 1000),
      checks,
    },
    {
      status: overallStatus === "unhealthy" ? 503 : 200,
    }
  );
}
