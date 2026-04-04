/**
 * Not Found Page
 * Displayed when a route doesn't match any defined path.
 */

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="text-6xl font-bold text-zinc-200 mb-4">404</div>

        <h2 className="text-xl font-semibold text-zinc-900 mb-2">
          Page not found
        </h2>

        <p className="text-zinc-600 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full px-4 py-2 bg-zinc-900 text-white rounded-md hover:bg-zinc-800 transition-colors"
          >
            Go to homepage
          </Link>

          <Link
            href="/challenges"
            className="block w-full px-4 py-2 border border-zinc-300 text-zinc-700 rounded-md hover:bg-zinc-50 transition-colors"
          >
            Browse challenges
          </Link>
        </div>
      </div>
    </div>
  );
}
