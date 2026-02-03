"use client";

import { useEffect, useState } from "react";
import { InterviewMode } from "@/components/interview/InterviewMode";
import { getSupabase } from "@/lib/supabase/client";

export default function InterviewPage() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const supabase = getSupabase();
      if (!supabase) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    
    loadUser();
  }, []);

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Interview Mode</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Practice technical interviews with AI-powered feedback and realistic scenarios
        </p>
      </header>

      {userId ? (
        <InterviewMode userId={userId} />
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-600 dark:text-zinc-400">
            Please sign in to use Interview Mode
          </p>
        </div>
      )}
    </div>
  );
}
