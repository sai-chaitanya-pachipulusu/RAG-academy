"use client";

import Link from "next/link";
import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";

export function HeaderAuth() {
  const { user, loading, signOut } = useSupabaseAuth();

  if (loading) {
    return <div className="h-8 w-24 animate-pulse rounded-full bg-zinc-100" />;
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <span className="hidden text-xs font-medium text-zinc-500 sm:inline">
        {user.email}
      </span>
      <button
        type="button"
        onClick={() => void signOut()}
        className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
      >
        Sign out
      </button>
    </div>
  );
}
