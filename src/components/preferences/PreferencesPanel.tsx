"use client";

import { useMemo, useSyncExternalStore } from "react";

import { TOPICS, type Topic } from "@/lib/preferences/topics";
import { preferencesStore } from "@/lib/preferences/store";

export function PreferencesPanel() {
  const prefs = useSyncExternalStore(
    preferencesStore.subscribe,
    preferencesStore.getSnapshot,
    preferencesStore.getServerSnapshot
  );

  const selected = useMemo(() => new Set<Topic>(prefs.topics), [prefs.topics]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="text-lg font-semibold tracking-tight text-gray-900">Interests</h2>
      <p className="mt-1 text-sm text-gray-600">
        Used to personalize the Research feed and (next) recommend lessons/challenges.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {TOPICS.map((t) => {
          const on = selected.has(t);
          return (
            <button
              key={t}
              type="button"
              onClick={() => {
                const next = new Set(selected);
                if (on) next.delete(t);
                else next.add(t);
                const arr = Array.from(next);
                preferencesStore.setTopics(arr.length ? arr : ["rag"]);
              }}
              className={[
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                on
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300",
              ].join(" ")}
            >
              {t}
            </button>
          );
        })}
      </div>
    </div>
  );
}


