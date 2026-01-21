"use client";

import type { LocalProgressState } from "@/lib/progress/localStore";
import {
  getDefaultProgress,
  loadProgress,
  resetProgress,
  saveProgress,
} from "@/lib/progress/localStore";

type Listener = () => void;

let current: LocalProgressState = getDefaultProgress();
let initialized = false;
const listeners = new Set<Listener>();
const SERVER_SNAPSHOT: LocalProgressState = getDefaultProgress();

function ensureInit() {
  if (initialized) return;
  if (typeof window === "undefined") return;
  current = loadProgress();
  initialized = true;
}

export const localProgressStore = {
  subscribe(listener: Listener) {
    ensureInit();
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getSnapshot() {
    ensureInit();
    return current;
  },

  getServerSnapshot() {
    // Must be referentially stable across calls (React requirement).
    return SERVER_SNAPSHOT;
  },

  setState(updater: React.SetStateAction<LocalProgressState>) {
    ensureInit();
    const next =
      typeof updater === "function"
        ? (updater as (prev: LocalProgressState) => LocalProgressState)(current)
        : updater;

    current = next;
    saveProgress(current);
    for (const l of listeners) l();
  },

  reset() {
    ensureInit();
    current = resetProgress();
    for (const l of listeners) l();
  },
};


