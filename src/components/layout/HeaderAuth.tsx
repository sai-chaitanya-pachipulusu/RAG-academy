"use client";

import Link from "next/link";
import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";

export function HeaderAuth() {
  const { user, loading, signOut } = useSupabaseAuth();

  if (loading) {
    return <div className="h-8 w-24 animate-pulse rounded-full bg-gray-100" />;
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-full bg-[#3B82F6] px-4 py-1.5 text-sm font-medium text-white transition-all duration-200-opacity hover:opacity-90 cursor-pointer"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <span className="hidden text-xs font-medium text-gray-500 sm:inline">
        {user.email}
      </span>
      <button
        type="button"
        onClick={() => void signOut()}
        className="text-sm font-medium text-gray-500 transition-all duration-200-all duration-200 hover:text-gray-900 cursor-pointer"
      >
        Sign out
      </button>
    </div>
  );
}
