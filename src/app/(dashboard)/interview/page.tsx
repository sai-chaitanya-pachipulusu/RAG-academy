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
      <header className="mb-4">
        <h1 className="text-xl font-semibold tracking-tight">Interview Mode</h1>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          Practice technical interviews with AI-powered feedback.
        </p>
      </header>

      {userId ? (
        <InterviewMode userId={userId} />
      ) : (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Please sign in to use Interview Mode
          </p>
        </div>
      )}
    </div>
  );
}
