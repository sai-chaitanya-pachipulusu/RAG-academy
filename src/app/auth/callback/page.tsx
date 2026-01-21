import { Suspense } from "react";

import { AuthCallbackClient } from "./ui";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
          <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-6 py-16">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Finishing sign-in…
              </p>
            </div>
          </div>
        </div>
      }
    >
      <AuthCallbackClient />
    </Suspense>
  );
}


