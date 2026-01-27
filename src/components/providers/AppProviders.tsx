"use client";

import { LocalProgressProvider } from "@/components/providers/LocalProgressProvider";
import { ProgressSync } from "@/components/providers/ProgressSync";
import { SupabaseAuthProvider } from "@/components/providers/SupabaseAuthProvider";
import { ToastProvider } from "@/components/ui/Toast";

export function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <SupabaseAuthProvider>
      <LocalProgressProvider>
        <ToastProvider>
          <ProgressSync />
          {children}
        </ToastProvider>
      </LocalProgressProvider>
    </SupabaseAuthProvider>
  );
}


