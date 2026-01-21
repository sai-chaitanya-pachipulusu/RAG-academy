import { createClient } from "@supabase/supabase-js";

type VerifiedUser = { id: string; email?: string | null };

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export async function verifySupabaseAccessToken(accessToken: string): Promise<VerifiedUser | null> {
  const token = accessToken.trim();
  if (!token) return null;

  const supabase = getServerSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser(token);
  if (error) return null;
  const u = data?.user;
  if (!u?.id) return null;

  return { id: u.id, email: u.email };
}


