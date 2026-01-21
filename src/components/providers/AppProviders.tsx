"use client";

import { LocalProgressProvider } from "@/components/providers/LocalProgressProvider";
import { ProgressSync } from "@/components/providers/ProgressSync";
import { SupabaseAuthProvider } from "@/components/providers/SupabaseAuthProvider";

export function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <SupabaseAuthProvider>
      <LocalProgressProvider>
        <ProgressSync />
        {children}
      </LocalProgressProvider>
    </SupabaseAuthProvider>
  );
}


