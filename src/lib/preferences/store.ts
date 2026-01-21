"use client";

import type { Topic } from "./topics";

type PreferencesStateV1 = {
  version: 1;
  topics: Topic[];
};

type Listener = () => void;

const STORAGE_KEY = "rag_academy_preferences_v1";
const DEFAULT: PreferencesStateV1 = { version: 1, topics: ["rag", "retrieval"] };

let current: PreferencesStateV1 = DEFAULT;
let initialized = false;
const listeners = new Set<Listener>();

function ensureInit() {
  if (initialized) return;
  if (typeof window === "undefined") return;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      initialized = true;
      return;
    }
    const parsed = JSON.parse(raw) as Partial<PreferencesStateV1>;
    if (parsed && parsed.version === 1 && Array.isArray(parsed.topics)) {
      current = { version: 1, topics: parsed.topics as Topic[] };
    }
  } catch {
    // ignore
  } finally {
    initialized = true;
  }
}

function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
}

export const preferencesStore = {
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
    return DEFAULT;
  },
  setTopics(topics: Topic[]) {
    ensureInit();
    current = { version: 1, topics };
    persist();
    for (const l of listeners) l();
  },
};

export type PreferencesState = PreferencesStateV1;


