"use client";

import { useEffect, useRef } from "react";

import { useLocalProgress } from "@/components/providers/LocalProgressProvider";
import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";
import { mergeRemoteIntoLocal } from "@/lib/progress/merge";
import { loadProgress } from "@/lib/progress/localStore";
import { fetchRemoteProgress, upsertProfileFromLocal } from "@/lib/supabase/progress";

export function ProgressSync() {
  const { user, loading } = useSupabaseAuth();
  const { setState } = useLocalProgress();
  const lastUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      lastUserIdRef.current = null;
      return;
    }

    if (lastUserIdRef.current === user.id) return;
    lastUserIdRef.current = user.id;

    let cancelled = false;

    (async () => {
      try {
        const remote = await fetchRemoteProgress(user.id);
        if (cancelled) return;

        setState((prev) => mergeRemoteIntoLocal(prev, remote));

        // If profile doesn't exist yet, create it from local.
        if (!remote.profile) {
          await upsertProfileFromLocal(user.id, loadProgress());
        }
      } catch (e) {
        console.warn("ProgressSync failed:", e);
      }
    })();

    return () => {
      cancelled = true;
    };
    // Intentionally not depending on `state` (avoid resync loops). We sync on login only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user?.id, setState]);

  return null;
}


