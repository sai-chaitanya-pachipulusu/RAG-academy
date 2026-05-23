import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET() {
  const results: { check: string; status: string; message: string }[] = [];
  let healthy = true;

  // 1) Ping Supabase (keeps project from auto-pausing)
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      results.push({ check: "supabase", status: "skip", message: "Not configured" });
    } else {
      const supabase = createClient(url, key);
      const { error } = await supabase.from("profiles").select("id").limit(1);
      if (error) {
        results.push({ check: "supabase", status: "fail", message: error.message });
        healthy = false;
      } else {
        results.push({ check: "supabase", status: "pass", message: "Connected" });
      }
    }
  } catch (err: any) {
    results.push({ check: "supabase", status: "fail", message: err.message });
    healthy = false;
  }

  // 2) Ping auth endpoint
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && anonKey) {
      const authRes = await fetch(`${url}/auth/v1/user`, {
        headers: { apikey: anonKey },
      });
      results.push({
        check: "auth-endpoint",
        status: authRes.ok ? "pass" : "warn",
        message: `HTTP ${authRes.status}`,
      });
    }
  } catch (err: any) {
    results.push({ check: "auth-endpoint", status: "warn", message: err.message });
  }

  return NextResponse.json({
    healthy,
    timestamp: new Date().toISOString(),
    results,
  });
}