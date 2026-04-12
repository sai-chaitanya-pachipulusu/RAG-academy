import { Suspense } from "react";

import { AuthCallbackClient } from "./ui";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 text-gray-950 dark:bg-black dark:text-gray-50">
          <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-6 py-16">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#2563EB]">
              <p className="text-sm text-gray-600 dark:text-gray-400">
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


