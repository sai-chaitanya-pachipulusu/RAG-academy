"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";

import type { LocalProgressState } from "@/lib/progress/localStore";
import { localProgressStore } from "@/lib/progress/store";

type ProgressContextValue = {
  state: LocalProgressState;
  setState: React.Dispatch<React.SetStateAction<LocalProgressState>>;
  reset: () => void;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function LocalProgressProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const state = useSyncExternalStore(
    localProgressStore.subscribe,
    localProgressStore.getSnapshot,
    localProgressStore.getServerSnapshot
  );

  const value = useMemo<ProgressContextValue>(
    () => ({
      state,
      setState: localProgressStore.setState,
      reset: localProgressStore.reset,
    }),
    [state]
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useLocalProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error(
      "useLocalProgress must be used within <LocalProgressProvider />"
    );
  }
  return ctx;
}


