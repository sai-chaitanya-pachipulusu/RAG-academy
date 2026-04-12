/**
 * Not Found Page
 * Displayed when a route doesn't match any defined path.
 */

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="text-6xl font-bold text-gray-200 mb-4">404</div>

        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Page not found
        </h2>

        <p className="text-gray-600 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full px-4 py-2 bg-[#3B82F6] text-white rounded-md hover:bg-[#2563EB] transition-all duration-200-all duration-200 cursor-pointer"
          >
            Go to homepage
          </Link>

          <Link
            href="/challenges"
            className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-all duration-200-all duration-200 cursor-pointer"
          >
            Browse challenges
          </Link>
        </div>
      </div>
    </div>
  );
}
