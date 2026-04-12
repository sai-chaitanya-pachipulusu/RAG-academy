"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { requireSupabase } from "@/lib/supabase/client";
import { AuthError } from "@supabase/supabase-js";

export function AuthCallbackClient() {
  const router = useRouter();
  const params = useSearchParams();
  const code = params.get("code");
  const errorDescription = params.get("error_description");

  const [message, setMessage] = useState("Finishing sign-in…");

  useEffect(() => {
    if (errorDescription) return;
    if (!code) return;

    requireSupabase()
      .auth.exchangeCodeForSession(code)
      .then(({ error }: { error: AuthError | null }) => {
        if (error) {
          setMessage(error.message);
          return;
        }
        router.replace("/learn");
      })
      .catch((err: unknown) => {
        setMessage(err instanceof Error ? err.message : String(err));
      });
  }, [code, errorDescription, router]);

  const renderedMessage = errorDescription
    ? errorDescription
    : !code
      ? "Missing OAuth code."
      : message;

  return (
    <div className="min-h-screen bg-white text-gray-950">
      <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-6 py-16">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 animate-pulse rounded-full bg-gray-900" />
            <p className="text-sm font-medium text-gray-600">
              {renderedMessage}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
