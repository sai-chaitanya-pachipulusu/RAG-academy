"use client";

import { createBrowserClient } from "@supabase/ssr";

let cached: any = null;

export function getSupabase() {
  if (cached) return cached;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return null;

  cached = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return cached;
}

export function requireSupabase() {
  const client = getSupabase();
  if (!client) {
    throw new Error(
      "Supabase env vars are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
    );
  }
  return client;
}
