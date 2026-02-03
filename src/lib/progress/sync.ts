/**
 * Progress Sync Service
 *
 * Handles synchronization of progress data between local storage and server.
 * Features:
 * - Automatic sync with conflict resolution
 * - Offline operation queueing
 * - Data integrity with checksums
 * - Exponential backoff retry
 */

import { getSupabase } from "@/lib/supabase/client";
import type { ChallengeProgress, LessonProgress } from "./types";
import type { LocalProgressState } from "./localStore";
import { loadProgress, saveProgress, getDefaultProgress } from "./localStore";

// Environment configuration
const SYNC_INTERVAL_MS = parseInt(process.env.NEXT_PUBLIC_SYNC_INTERVAL_MS || "30000");
const SYNC_MAX_RETRIES = parseInt(process.env.NEXT_PUBLIC_SYNC_MAX_RETRIES || "5");
const SYNC_RETRY_DELAY_MS = parseInt(process.env.NEXT_PUBLIC_SYNC_RETRY_DELAY_MS || "1000");

// Sync status types
export type SyncStatus = 
  | "idle"
  | "syncing"
  | "synced"
  | "offline"
  | "error"
  | "conflict";

export type ConflictResolutionStrategy = 
  | "server-wins"
  | "client-wins"
  | "merge"
  | "manual";

export interface SyncState {
  status: SyncStatus;
  lastSyncAt: Date | null;
  lastError: string | null;
  pendingChanges: number;
  isOnline: boolean;
}

export interface Conflict {
  id: string;
  challengeSlug: string;
  conflictType: "version_mismatch" | "concurrent_edit" | "checksum_mismatch" | "timestamp_conflict";
  localState: ChallengeProgress & { version: number; updatedAt: string };
  remoteState: ChallengeProgress & { version: number; updatedAt: string };
  localVersion: number;
  remoteVersion: number;
}

export interface SyncResult {
  success: boolean;
  pushed: number;
  pulled: number;
  conflicts: Conflict[];
  errors: string[];
}

export interface ProgressSyncItem {
  challenge_slug: string;
  status: "not_started" | "in_progress" | "completed";
  attempts: number;
  best_score?: number;
  last_submitted_code?: string;
  completed_at?: string;
  version: number;
  checksum: string;
  client_timestamp: string;
  device_id?: string;
}

// Event listeners
type SyncStateListener = (state: SyncState) => void;
type ConflictListener = (conflicts: Conflict[]) => void;

const stateListeners = new Set<SyncStateListener>();
const conflictListeners = new Set<ConflictListener>();

let currentSyncState: SyncState = {
  status: "idle",
  lastSyncAt: null,
  lastError: null,
  pendingChanges: 0,
  isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
};

// Notify state listeners
function notifyStateListeners() {
  stateListeners.forEach(listener => listener({ ...currentSyncState }));
}

// Notify conflict listeners
function notifyConflictListeners(conflicts: Conflict[]) {
  conflictListeners.forEach(listener => listener(conflicts));
}

/**
 * Subscribe to sync state changes
 */
export function subscribeToSyncState(listener: SyncStateListener): () => void {
  stateListeners.add(listener);
  listener({ ...currentSyncState });
  return () => stateListeners.delete(listener);
}

/**
 * Subscribe to conflict events
 */
export function subscribeToConflicts(listener: ConflictListener): () => void {
  conflictListeners.add(listener);
  return () => conflictListeners.delete(listener);
}

/**
 * Get current sync state
 */
export function getSyncState(): SyncState {
  return { ...currentSyncState };
}

/**
 * Update sync state
 */
function updateSyncState(updates: Partial<SyncState>) {
  currentSyncState = { ...currentSyncState, ...updates };
  notifyStateListeners();
}

/**
 * Generate a simple checksum for data integrity
 */
export function generateChecksum(data: unknown): string {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

/**
 * Get device ID for multi-device tracking
 */
function getDeviceId(): string {
  if (typeof window === "undefined") return "server";
  
  let deviceId = localStorage.getItem("rag_academy_device_id");
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("rag_academy_device_id", deviceId);
  }
  return deviceId;
}

/**
 * Convert local progress to sync items
 */
function localProgressToSyncItems(progress: LocalProgressState): ProgressSyncItem[] {
  const deviceId = getDeviceId();
  const timestamp = new Date().toISOString();
  
  return Object.entries(progress.challenges).map(([slug, challengeData]) => {
    const challenge = challengeData as ChallengeProgress;
    const item: ProgressSyncItem = {
      challenge_slug: slug,
      status: challenge.status,
      attempts: challenge.attempts,
      last_submitted_code: challenge.userCode || undefined,
      completed_at: challenge.completedAt || undefined,
      version: 1,
      checksum: generateChecksum(challenge),
      client_timestamp: timestamp,
      device_id: deviceId,
    };
    return item;
  });
}

/**
 * Main sync function - pushes local changes and pulls remote changes
 */
export async function syncProgress(userId: string): Promise<SyncResult> {
  if (!userId) {
    return { success: false, pushed: 0, pulled: 0, conflicts: [], errors: ["No user ID provided"] };
  }

  // Check online status
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    updateSyncState({ status: "offline", isOnline: false });
    return { success: false, pushed: 0, pulled: 0, conflicts: [], errors: ["Device is offline"] };
  }

  updateSyncState({ status: "syncing", isOnline: true, lastError: null });

  const result: SyncResult = {
    success: true,
    pushed: 0,
    pulled: 0,
    conflicts: [],
    errors: [],
  };

  try {
    // Step 1: Push local changes
    const pushResult = await pushLocalChanges(userId);
    result.pushed = pushResult.pushed;
    result.conflicts.push(...pushResult.conflicts);
    result.errors.push(...pushResult.errors);

    // Step 2: Pull remote changes
    const pullResult = await pullRemoteChanges(userId);
    result.pulled = pullResult.pulled;
    result.conflicts.push(...pullResult.conflicts);
    result.errors.push(...pullResult.errors);

    // Step 3: Process sync queue
    const queueResult = await processSyncQueue(userId);
    result.errors.push(...queueResult.errors);

    // Update sync state
    if (result.conflicts.length > 0) {
      updateSyncState({ 
        status: "conflict", 
        lastSyncAt: new Date(),
        pendingChanges: await getPendingQueueCount(userId)
      });
      notifyConflictListeners(result.conflicts);
    } else if (result.errors.length > 0) {
      updateSyncState({ 
        status: "error", 
        lastError: result.errors[0],
        lastSyncAt: new Date(),
        pendingChanges: await getPendingQueueCount(userId)
      });
    } else {
      updateSyncState({ 
        status: "synced", 
        lastSyncAt: new Date(),
        pendingChanges: 0
      });
    }

    result.success = result.errors.length === 0;
    return result;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown sync error";
    updateSyncState({ status: "error", lastError: errorMessage });
    return { 
      success: false, 
      pushed: result.pushed, 
      pulled: result.pulled, 
      conflicts: result.conflicts, 
      errors: [...result.errors, errorMessage] 
    };
  }
}

/**
 * Push local progress changes to the server
 */
export async function pushLocalChanges(userId: string): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    pushed: 0,
    pulled: 0,
    conflicts: [],
    errors: [],
  };

  try {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error("Supabase client not available");
    }

    const localProgress = loadProgress();
    const syncItems = localProgressToSyncItems(localProgress);

    if (syncItems.length === 0) {
      return result;
    }

    // Use the batch upsert function
    const { data, error } = await supabase.rpc("batch_upsert_progress", {
      p_user_id: userId,
      p_progress_items: JSON.stringify(syncItems),
    });

    if (error) {
      throw error;
    }

    // Process results
    if (data && Array.isArray(data)) {
      for (const item of data) {
        if (item.success) {
          result.pushed++;
        } else if (item.conflict_detected) {
          // Fetch the conflicting remote state
          const { data: remoteData } = await supabase
            .from("user_progress")
            .select("*")
            .eq("user_id", userId)
            .eq("challenge_slug", item.challenge_slug)
            .single();

          if (remoteData) {
            const localChallenge = localProgress.challenges[item.challenge_slug];
            result.conflicts.push({
              id: `${userId}_${item.challenge_slug}_${Date.now()}`,
              challengeSlug: item.challenge_slug,
              conflictType: "version_mismatch",
              localState: {
                status: localChallenge.status,
                attempts: localChallenge.attempts,
                userCode: localChallenge.userCode,
                completedAt: localChallenge.completedAt,
                version: syncItems.find(s => s.challenge_slug === item.challenge_slug)?.version || 1,
                updatedAt: new Date().toISOString(),
              },
              remoteState: {
                status: remoteData.status,
                attempts: remoteData.attempts,
                userCode: remoteData.last_submitted_code,
                completedAt: remoteData.completed_at,
                version: remoteData.version,
                updatedAt: remoteData.updated_at,
              },
              localVersion: syncItems.find(s => s.challenge_slug === item.challenge_slug)?.version || 1,
              remoteVersion: remoteData.version,
            });
          }
        }
      }
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Push failed";
    result.success = false;
    result.errors.push(errorMessage);
    return result;
  }
}

/**
 * Pull remote progress changes to local storage
 */
export async function pullRemoteChanges(userId: string): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    pushed: 0,
    pulled: 0,
    conflicts: [],
    errors: [],
  };

  try {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error("Supabase client not available");
    }

    const localProgress = loadProgress();
    const lastSyncedAt = currentSyncState.lastSyncAt;

    // Fetch remote changes since last sync
    const { data, error } = await supabase.rpc("get_progress_for_sync", {
      p_user_id: userId,
      p_last_synced_at: lastSyncedAt?.toISOString(),
      p_limit: 100,
    });

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return result;
    }

    let hasChanges = false;

    for (const remote of data) {
      const localChallenge = localProgress.challenges[remote.challenge_slug];
      
      // Check for conflicts
      if (localChallenge) {
        const localChecksum = generateChecksum(localChallenge);
        const localHasChanges = localChecksum !== remote.checksum;
        const remoteIsNewer = new Date(remote.updated_at) > new Date(localChallenge.completedAt || 0);

        if (localHasChanges && !remoteIsNewer) {
          // Both have changes - conflict!
          result.conflicts.push({
            id: `${userId}_${remote.challenge_slug}_${Date.now()}`,
            challengeSlug: remote.challenge_slug,
            conflictType: "concurrent_edit",
            localState: {
              ...localChallenge,
              version: remote.version,
              updatedAt: localChallenge.completedAt || new Date().toISOString(),
            },
            remoteState: {
              status: remote.status,
              attempts: remote.attempts,
              userCode: remote.last_submitted_code,
              completedAt: remote.completed_at,
              version: remote.version,
              updatedAt: remote.updated_at,
            },
            localVersion: remote.version,
            remoteVersion: remote.version,
          });
          continue;
        }
      }

      // Apply remote changes
      localProgress.challenges[remote.challenge_slug] = {
        status: remote.status,
        attempts: remote.attempts,
        userCode: remote.last_submitted_code || null,
        completedAt: remote.completed_at || null,
      };
      
      result.pulled++;
      hasChanges = true;
    }

    if (hasChanges) {
      saveProgress(localProgress);
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Pull failed";
    result.success = false;
    result.errors.push(errorMessage);
    return result;
  }
}

/**
 * Resolve conflicts using a specified strategy
 */
export async function resolveConflicts(
  userId: string,
  conflicts: Conflict[],
  strategy: ConflictResolutionStrategy
): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    pushed: 0,
    pulled: 0,
    conflicts: [],
    errors: [],
  };

  try {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error("Supabase client not available");
    }

    const localProgress = loadProgress();

    for (const conflict of conflicts) {
      let resolvedState: ChallengeProgress;

      switch (strategy) {
        case "server-wins":
          resolvedState = {
            status: conflict.remoteState.status,
            attempts: conflict.remoteState.attempts,
            userCode: conflict.remoteState.userCode,
            completedAt: conflict.remoteState.completedAt,
          };
          break;

        case "client-wins":
          resolvedState = {
            status: conflict.localState.status,
            attempts: conflict.localState.attempts,
            userCode: conflict.localState.userCode,
            completedAt: conflict.localState.completedAt,
          };
          // Push local state to server
          await pushLocalChanges(userId);
          break;

        case "merge":
          // Merge strategy: take the most progressed state
          resolvedState = {
            status: conflict.localState.status === "completed" || conflict.remoteState.status === "completed"
              ? "completed"
              : conflict.localState.status === "in_progress" || conflict.remoteState.status === "in_progress"
                ? "in_progress"
                : "not_started",
            attempts: Math.max(conflict.localState.attempts, conflict.remoteState.attempts),
            userCode: conflict.localState.userCode || conflict.remoteState.userCode,
            completedAt: conflict.localState.completedAt || conflict.remoteState.completedAt,
          };
          break;

        case "manual":
        default:
          // Skip manual conflicts - user needs to resolve via UI
          result.conflicts.push(conflict);
          continue;
      }

      // Apply resolved state locally
      localProgress.challenges[conflict.challengeSlug] = resolvedState;

      // Mark conflict as resolved in database
      await supabase
        .from("progress_conflicts")
        .update({
          status: "resolved",
          resolution_strategy: strategy,
          resolved_state: resolvedState,
          resolved_at: new Date().toISOString(),
          resolved_by: userId,
        })
        .eq("user_id", userId)
        .eq("challenge_slug", conflict.challengeSlug)
        .eq("status", "unresolved");

      result.pushed++;
    }

    saveProgress(localProgress);

    // Sync again after resolution
    if (result.conflicts.length === 0) {
      await syncProgress(userId);
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Conflict resolution failed";
    result.success = false;
    result.errors.push(errorMessage);
    return result;
  }
}

/**
 * Queue an operation for when offline
 */
export async function queueOfflineOperation(
  userId: string,
  operationType: "create" | "update" | "delete",
  entityType: "challenge_progress" | "lesson_progress" | "streak" | "xp",
  payload: Record<string, unknown>,
  priority: number = 0
): Promise<boolean> {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      // Store in localStorage as fallback
      const queue = JSON.parse(localStorage.getItem("rag_academy_sync_queue") || "[]");
      queue.push({
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        operation_type: operationType,
        entity_type: entityType,
        payload,
        retry_count: 0,
        status: "pending",
        created_at: new Date().toISOString(),
        priority,
      });
      localStorage.setItem("rag_academy_sync_queue", JSON.stringify(queue));
      
      updateSyncState({ 
        status: "offline",
        pendingChanges: queue.length 
      });
      return true;
    }

    const { error } = await supabase.from("sync_queue").insert({
      user_id: userId,
      operation_type: operationType,
      entity_type: entityType,
      payload,
      status: "pending",
      priority,
    });

    if (error) throw error;

    const pendingCount = await getPendingQueueCount(userId);
    updateSyncState({ pendingChanges: pendingCount });
    
    return true;
  } catch (error) {
    console.error("Failed to queue operation:", error);
    return false;
  }
}

/**
 * Get count of pending queue items
 */
async function getPendingQueueCount(userId: string): Promise<number> {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      const queue = JSON.parse(localStorage.getItem("rag_academy_sync_queue") || "[]");
      return queue.filter((item: { status: string }) => item.status === "pending").length;
    }

    const { count, error } = await supabase
      .from("sync_queue")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "pending");

    if (error) throw error;
    return count || 0;
  } catch {
    return 0;
  }
}

/**
 * Process the sync queue
 */
export async function processSyncQueue(userId: string): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    pushed: 0,
    pulled: 0,
    conflicts: [],
    errors: [],
  };

  try {
    const supabase = getSupabase();
    if (!supabase) {
      // Process local queue
      const queue = JSON.parse(localStorage.getItem("rag_academy_sync_queue") || "[]");
      const pending = queue.filter((item: { status: string }) => item.status === "pending");
      
      // Can't process without connection - just return
      if (pending.length > 0) {
        updateSyncState({ status: "offline", pendingChanges: pending.length });
      }
      return result;
    }

    // Fetch pending items from server queue
    const { data: pendingItems, error } = await supabase.rpc("get_pending_sync_items", {
      p_user_id: userId,
      p_limit: 50,
    });

    if (error) throw error;
    if (!pendingItems || pendingItems.length === 0) return result;

    for (const item of pendingItems) {
      try {
        // Mark as processing
        await supabase
          .from("sync_queue")
          .update({ status: "processing" })
          .eq("id", item.id);

        // Process based on entity type
        switch (item.entity_type) {
          case "challenge_progress":
            // Apply challenge progress update
            const payload = item.payload as {
              challenge_slug: string;
              status: string;
              attempts: number;
              userCode?: string;
              completedAt?: string;
            };
            
            await supabase.rpc("batch_upsert_progress", {
              p_user_id: userId,
              p_progress_items: JSON.stringify([{
                challenge_slug: payload.challenge_slug,
                status: payload.status,
                attempts: payload.attempts,
                last_submitted_code: payload.userCode,
                completed_at: payload.completedAt,
                version: 1,
                checksum: generateChecksum(payload),
                client_timestamp: new Date().toISOString(),
                device_id: getDeviceId(),
              }]),
            });
            break;

          // Add other entity types as needed
        }

        // Mark as completed
        await supabase
          .from("sync_queue")
          .update({ 
            status: "completed", 
            processed_at: new Date().toISOString() 
          })
          .eq("id", item.id);

        result.pushed++;
      } catch (processError) {
        const retryCount = item.retry_count + 1;
        const nextRetry = retryCount < SYNC_MAX_RETRIES
          ? new Date(Date.now() + SYNC_RETRY_DELAY_MS * Math.pow(2, retryCount)).toISOString()
          : null;

        await supabase
          .from("sync_queue")
          .update({
            status: retryCount >= SYNC_MAX_RETRIES ? "failed" : "pending",
            retry_count: retryCount,
            last_error: processError instanceof Error ? processError.message : "Unknown error",
            next_retry_at: nextRetry,
          })
          .eq("id", item.id);

        result.errors.push(`Failed to process queue item ${item.id}: ${processError}`);
      }
    }

    // Clear local queue since we've processed server queue
    localStorage.removeItem("rag_academy_sync_queue");

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Queue processing failed";
    result.success = false;
    result.errors.push(errorMessage);
    return result;
  }
}

/**
 * Get sync status for display
 */
export function getSyncStatus(): {
  status: SyncStatus;
  lastSyncAt: Date | null;
  lastSyncFormatted: string;
  pendingChanges: number;
  isOnline: boolean;
} {
  const state = getSyncState();
  
  let lastSyncFormatted = "Never";
  if (state.lastSyncAt) {
    const diff = Date.now() - state.lastSyncAt.getTime();
    if (diff < 60000) {
      lastSyncFormatted = "Just now";
    } else if (diff < 3600000) {
      lastSyncFormatted = `${Math.floor(diff / 60000)}m ago`;
    } else if (diff < 86400000) {
      lastSyncFormatted = `${Math.floor(diff / 3600000)}h ago`;
    } else {
      lastSyncFormatted = state.lastSyncAt.toLocaleDateString();
    }
  }

  return {
    status: state.status,
    lastSyncAt: state.lastSyncAt,
    lastSyncFormatted,
    pendingChanges: state.pendingChanges,
    isOnline: state.isOnline,
  };
}

/**
 * Force a manual sync
 */
export async function forceSync(userId: string): Promise<SyncResult> {
  return syncProgress(userId);
}

/**
 * Create a backup of current progress
 */
export async function createBackup(userId: string, type: "automatic" | "manual" | "pre_sync" = "manual"): Promise<string | null> {
  try {
    const supabase = getSupabase();
    if (!supabase) return null;

    const { data, error } = await supabase.rpc("create_progress_backup", {
      p_user_id: userId,
      p_backup_type: type,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Failed to create backup:", error);
    return null;
  }
}

/**
 * Restore progress from a backup
 */
export async function restoreFromBackup(userId: string, backupId: string): Promise<boolean> {
  try {
    const supabase = getSupabase();
    if (!supabase) return false;

    const { data: backup, error } = await supabase
      .from("progress_backups")
      .select("backup_data, checksum")
      .eq("id", backupId)
      .eq("user_id", userId)
      .single();

    if (error || !backup) return false;

    // Verify checksum
    const currentChecksum = generateChecksum(backup.backup_data);
    if (currentChecksum !== backup.checksum) {
      throw new Error("Backup checksum mismatch - data may be corrupted");
    }

    // Restore progress
    const progress = backup.backup_data as {
      progress: Array<{
        challenge_slug: string;
        status: "not_started" | "in_progress" | "completed";
        attempts: number;
        best_score?: number;
        last_submitted_code?: string;
        completed_at?: string;
      }>;
    };

    const localProgress = loadProgress();
    
    for (const item of progress.progress) {
      localProgress.challenges[item.challenge_slug] = {
        status: item.status,
        attempts: item.attempts,
        userCode: item.last_submitted_code || null,
        completedAt: item.completed_at || null,
      };
    }

    saveProgress(localProgress);

    // Sync restored progress to server
    await syncProgress(userId);

    return true;
  } catch (error) {
    console.error("Failed to restore backup:", error);
    return false;
  }
}

// Auto-sync interval reference
let autoSyncInterval: NodeJS.Timeout | null = null;

/**
 * Start automatic periodic sync
 */
export function startAutoSync(userId: string, intervalMs: number = SYNC_INTERVAL_MS): () => void {
  // Clear existing interval
  stopAutoSync();

  // Initial sync
  syncProgress(userId);

  // Set up interval
  autoSyncInterval = setInterval(() => {
    syncProgress(userId);
  }, intervalMs);

  // Return cleanup function
  return stopAutoSync;
}

/**
 * Stop automatic sync
 */
export function stopAutoSync(): void {
  if (autoSyncInterval) {
    clearInterval(autoSyncInterval);
    autoSyncInterval = null;
  }
}

/**
 * Sync before logout
 */
export async function syncBeforeLogout(userId: string): Promise<boolean> {
  try {
    // Create pre-logout backup
    await createBackup(userId, "automatic");
    
    // Final sync
    const result = await syncProgress(userId);
    
    // Process any remaining queue items
    await processSyncQueue(userId);
    
    return result.success;
  } catch (error) {
    console.error("Pre-logout sync failed:", error);
    return false;
  }
}
