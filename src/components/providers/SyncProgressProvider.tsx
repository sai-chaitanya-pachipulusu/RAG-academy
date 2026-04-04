"use client";

/**
 * Sync Progress Provider
 * 
 * Enhanced progress provider with automatic synchronization.
 * Features:
 * - Automatic sync on login
 * - Periodic background sync (every 30 seconds)
 * - Sync before logout
 * - Conflict resolution UI
 * - Offline mode support
 * - Sync status indicator
 */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";

import type { LocalProgressState } from "@/lib/progress/localStore";
import { localProgressStore } from "@/lib/progress/store";
import type { SyncState, Conflict } from "@/lib/progress/sync";
import {
  syncProgress,
  subscribeToSyncState,
  subscribeToConflicts,
  getSyncState,
  getSyncStatus,
  startAutoSync,
  stopAutoSync,
  syncBeforeLogout,
  resolveConflicts,
  createBackup,
  type ConflictResolutionStrategy,
} from "@/lib/progress/sync";
import {
  initOfflineSupport,
  subscribeToNetworkStatus,
  getIsOnline,
} from "@/lib/progress/offline";
import { useSupabaseAuth } from "./SupabaseAuthProvider";

// Sync context value type
interface SyncProgressContextValue {
  // Progress state (from LocalProgressProvider)
  state: LocalProgressState;
  setState: React.Dispatch<React.SetStateAction<LocalProgressState>>;
  reset: () => void;
  
  // Sync state
  syncState: SyncState;
  syncStatus: {
    status: SyncState["status"];
    lastSyncAt: Date | null;
    lastSyncFormatted: string;
    pendingChanges: number;
    isOnline: boolean;
  };
  
  // Conflicts
  conflicts: Conflict[];
  resolveConflict: (conflictId: string, strategy: ConflictResolutionStrategy) => Promise<void>;
  resolveAllConflicts: (strategy: ConflictResolutionStrategy) => Promise<void>;
  dismissConflict: (conflictId: string) => void;
  
  // Manual sync
  forceSync: () => Promise<void>;
  
  // Online status
  isOnline: boolean;
  
  // Backup
  createBackup: (type?: "manual" | "automatic") => Promise<void>;
}

const SyncProgressContext = createContext<SyncProgressContextValue | null>(null);

// Sync interval (30 seconds)
const SYNC_INTERVAL_MS = 30000;

export function SyncProgressProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user, session } = useSupabaseAuth();
  const isAuthenticated = !!session;
  
  // Progress state from local store
  const [progressState, setProgressState] = useState<LocalProgressState>(() => {
    if (typeof window === "undefined") {
      return {
        version: 1,
        xp: 0,
        streak: { streakDays: 0, lastActivityDate: null },
        challenges: {},
        lessons: {},
      };
    }
    return localProgressStore.getSnapshot();
  });
  
  // Sync state
  const [syncState, setSyncState] = useState<SyncState>(getSyncState);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [isOnline, setIsOnline] = useState(getIsOnline);
  
  // Refs for managing intervals and cleanup
  const autoSyncCleanupRef = useRef<(() => void) | null>(null);
  const offlineCleanupRef = useRef<(() => void) | null>(null);
  const isSyncingRef = useRef(false);
  
  // Subscribe to local progress store
  useEffect(() => {
    const unsubscribe = localProgressStore.subscribe(() => {
      setProgressState(localProgressStore.getSnapshot());
    });
    return () => { unsubscribe(); };
  }, []);
  
  // Initialize offline support and network monitoring
  useEffect(() => {
    offlineCleanupRef.current = initOfflineSupport();
    
    const unsubscribeNetwork = subscribeToNetworkStatus((online) => {
      setIsOnline(online);
    });
    
    return () => {
      unsubscribeNetwork();
      if (offlineCleanupRef.current) {
        offlineCleanupRef.current();
      }
    };
  }, []);
  
  // Subscribe to sync state changes
  useEffect(() => {
    const unsubscribe = subscribeToSyncState((state) => {
      setSyncState(state);
    });
    return unsubscribe;
  }, []);
  
  // Subscribe to conflicts
  useEffect(() => {
    const unsubscribe = subscribeToConflicts((newConflicts) => {
      setConflicts((prev) => {
        // Merge new conflicts with existing, avoiding duplicates
        const existingIds = new Set(prev.map((c) => c.id));
        const uniqueNew = newConflicts.filter((c) => !existingIds.has(c.id));
        return [...prev, ...uniqueNew];
      });
    });
    return unsubscribe;
  }, []);
  
  // Handle authentication changes - sync on login
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      // Initial sync when user logs in
      const performInitialSync = async () => {
        if (isSyncingRef.current) return;
        isSyncingRef.current = true;
        
        try {
          await syncProgress(user.id);
        } catch (error) {
          console.error("Initial sync failed:", error);
        } finally {
          isSyncingRef.current = false;
        }
      };
      
      performInitialSync();
      
      // Start auto-sync
      autoSyncCleanupRef.current = startAutoSync(user.id, SYNC_INTERVAL_MS);
      
      // Create backup on login
      createBackup(user.id, "automatic").catch(console.error);
    } else {
      // Stop auto-sync when logged out
      stopAutoSync();
      if (autoSyncCleanupRef.current) {
        autoSyncCleanupRef.current();
        autoSyncCleanupRef.current = null;
      }
    }
    
    return () => {
      stopAutoSync();
    };
  }, [isAuthenticated, user?.id]);
  
  // Handle beforeunload/pagehide - sync before logout/close
  // Note: beforeunload cannot await async operations, so we use
  // sendBeacon for a best-effort sync on page unload.
  useEffect(() => {
    const handlePageHide = () => {
      if (isAuthenticated && user?.id) {
        // sendBeacon is fire-and-forget but survives page unload
        const payload = JSON.stringify({ userId: user.id, action: "beforeunload" });
        navigator.sendBeacon("/api/progress/sync", new Blob([payload], { type: "application/json" }));
      }
    };
    
    window.addEventListener("pagehide", handlePageHide);
    return () => {
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [isAuthenticated, user?.id]);
  
  // Memoized sync status
  const syncStatus = useMemo(() => {
    return getSyncStatus();
  }, [syncState]);
  
  // Force sync function
  const forceSync = useCallback(async () => {
    if (!user?.id || isSyncingRef.current) return;
    
    isSyncingRef.current = true;
    try {
      await syncProgress(user.id);
    } catch (error) {
      console.error("Manual sync failed:", error);
    } finally {
      isSyncingRef.current = false;
    }
  }, [user?.id]);
  
  // Resolve a single conflict
  const resolveConflict = useCallback(async (
    conflictId: string,
    strategy: ConflictResolutionStrategy
  ) => {
    if (!user?.id) return;
    
    const conflict = conflicts.find((c) => c.id === conflictId);
    if (!conflict) return;
    
    await resolveConflicts(user.id, [conflict], strategy);
    
    setConflicts((prev) => prev.filter((c) => c.id !== conflictId));
  }, [conflicts, user?.id]);
  
  // Resolve all conflicts
  const resolveAllConflicts = useCallback(async (
    strategy: ConflictResolutionStrategy
  ) => {
    if (!user?.id || conflicts.length === 0) return;
    
    await resolveConflicts(user.id, conflicts, strategy);
    setConflicts([]);
  }, [conflicts, user?.id]);
  
  // Dismiss a conflict (mark as ignored)
  const dismissConflict = useCallback((conflictId: string) => {
    setConflicts((prev) => prev.filter((c) => c.id !== conflictId));
  }, []);
  
  // Create backup
  const handleCreateBackup = useCallback(async (
    type: "manual" | "automatic" = "manual"
  ) => {
    if (!user?.id) return;
    await createBackup(user.id, type);
  }, [user?.id]);
  
  // Context value
  const value = useMemo<SyncProgressContextValue>(
    () => ({
      // Progress state
      state: progressState,
      setState: localProgressStore.setState,
      reset: localProgressStore.reset,
      
      // Sync state
      syncState,
      syncStatus,
      
      // Conflicts
      conflicts,
      resolveConflict,
      resolveAllConflicts,
      dismissConflict,
      
      // Manual sync
      forceSync,
      
      // Online status
      isOnline,
      
      // Backup
      createBackup: handleCreateBackup,
    }),
    [
      progressState,
      syncState,
      syncStatus,
      conflicts,
      resolveConflict,
      resolveAllConflicts,
      dismissConflict,
      forceSync,
      isOnline,
      handleCreateBackup,
    ]
  );
  
  return (
    <SyncProgressContext.Provider value={value}>
      {children}
    </SyncProgressContext.Provider>
  );
}

export function useSyncProgress() {
  const ctx = useContext(SyncProgressContext);
  if (!ctx) {
    throw new Error(
      "useSyncProgress must be used within <SyncProgressProvider />"
    );
  }
  return ctx;
}

// Hook for just the sync status (lighter weight)
export function useSyncStatus() {
  const ctx = useContext(SyncProgressContext);
  if (!ctx) {
    throw new Error(
      "useSyncStatus must be used within <SyncProgressProvider />"
    );
  }
  return {
    syncState: ctx.syncState,
    syncStatus: ctx.syncStatus,
    isOnline: ctx.isOnline,
    forceSync: ctx.forceSync,
  };
}

// Hook for conflicts only
export function useSyncConflicts() {
  const ctx = useContext(SyncProgressContext);
  if (!ctx) {
    throw new Error(
      "useSyncConflicts must be used within <SyncProgressProvider />"
    );
  }
  return {
    conflicts: ctx.conflicts,
    resolveConflict: ctx.resolveConflict,
    resolveAllConflicts: ctx.resolveAllConflicts,
    dismissConflict: ctx.dismissConflict,
  };
}
