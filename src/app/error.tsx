/**
 * Global Error Boundary
 * Catches unhandled errors in the app and displays a friendly error page.
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Log error to monitoring service
    console.error("Application error:", error);
  }, [error]);

  const copyError = () => {
    navigator.clipboard.writeText(`${error.message}\n${error.stack ?? ""}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Something went wrong
        </h2>

        <p className="text-gray-600 mb-6">
          An unexpected error occurred. Please try refreshing the page.
        </p>

        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full px-4 py-2 bg-[#8B5CF6] text-white rounded-md hover:bg-[#7C3AED] transition-all duration-200-all duration-200 cursor-pointer"
          >
            Try again
          </button>

          <Link
            href="/"
            className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-all duration-200-all duration-200 cursor-pointer"
          >
            Go to homepage
          </Link>

          <button
            onClick={copyError}
            className="w-full px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-all duration-200-all duration-200 cursor-pointer"
          >
            {copied ? "✓ Error copied!" : "Copy error details"}
          </button>
        </div>

        {error.digest && (
          <p className="mt-4 text-xs text-gray-400">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
