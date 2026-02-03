/**
 * Offline Support Module
 * 
 * Handles online/offline detection, operation queueing, and auto-retry logic.
 * Features:
 * - Network status detection
 * - Exponential backoff retry
 * - Background sync when coming back online
 * - Local queue persistence
 */

import { getSupabase } from "@/lib/supabase/client";

// Retry configuration
const MAX_RETRY_ATTEMPTS = parseInt(process.env.NEXT_PUBLIC_SYNC_MAX_RETRIES || "5");
const BASE_RETRY_DELAY_MS = parseInt(process.env.NEXT_PUBLIC_SYNC_RETRY_DELAY_MS || "1000");
const MAX_RETRY_DELAY_MS = 60000; // Max 1 minute delay

// Network status
let isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
let wasOffline = false;

// Event listeners
 type NetworkStatusListener = (online: boolean) => void;
 type SyncListener = () => void;

const networkListeners = new Set<NetworkStatusListener>();
const syncListeners = new Set<SyncListener>();

// Retry tracking
interface RetryState {
  attempt: number;
  nextRetryAt: number;
  operation: () => Promise<boolean>;
}

const retryQueue = new Map<string, RetryState>();
let retryTimeout: NodeJS.Timeout | null = null;

/**
 * Check if currently online
 */
export function getIsOnline(): boolean {
  return isOnline;
}

/**
 * Check if we were previously offline (for detecting reconnection)
 */
export function getWasOffline(): boolean {
  return wasOffline;
}

/**
 * Subscribe to network status changes
 */
export function subscribeToNetworkStatus(listener: NetworkStatusListener): () => void {
  networkListeners.add(listener);
  listener(isOnline);
  return () => networkListeners.delete(listener);
}

/**
 * Subscribe to sync events (triggered when coming back online)
 */
export function subscribeToSyncEvents(listener: SyncListener): () => void {
  syncListeners.add(listener);
  return () => syncListeners.delete(listener);
}

/**
 * Notify network status listeners
 */
function notifyNetworkListeners(online: boolean) {
  networkListeners.forEach(listener => {
    try {
      listener(online);
    } catch (error) {
      console.error("Network listener error:", error);
    }
  });
}

/**
 * Notify sync listeners
 */
function notifySyncListeners() {
  syncListeners.forEach(listener => {
    try {
      listener();
    } catch (error) {
      console.error("Sync listener error:", error);
    }
  });
}

/**
 * Calculate exponential backoff delay
 */
export function calculateBackoffDelay(attempt: number): number {
  const delay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt);
  return Math.min(delay, MAX_RETRY_DELAY_MS);
}

/**
 * Format retry delay for display
 */
export function formatRetryDelay(delayMs: number): string {
  if (delayMs < 1000) return `${delayMs}ms`;
  if (delayMs < 60000) return `${Math.round(delayMs / 1000)}s`;
  return `${Math.round(delayMs / 60000)}m`;
}

/**
 * Initialize offline support
 * Call this once when the app starts
 */
export function initOfflineSupport(): () => void {
  if (typeof window === "undefined") return () => {};

  const handleOnline = () => {
    console.log("[Offline] Connection restored");
    wasOffline = !isOnline;
    isOnline = true;
    notifyNetworkListeners(true);
    
    // Trigger background sync
    setTimeout(() => {
      notifySyncListeners();
      processRetryQueue();
    }, 1000);
  };

  const handleOffline = () => {
    console.log("[Offline] Connection lost");
    wasOffline = true;
    isOnline = false;
    notifyNetworkListeners(false);
  };

  // Listen for online/offline events
  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  // Also listen for visibility changes (app coming to foreground)
  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible" && isOnline) {
      // Check if we need to sync
      notifySyncListeners();
    }
  };
  document.addEventListener("visibilitychange", handleVisibilityChange);

  // Load persisted queue from localStorage
  loadPersistedQueue();

  // Cleanup function
  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    if (retryTimeout) {
      clearTimeout(retryTimeout);
    }
  };
}

/**
 * Queue an operation with retry logic
 */
export function queueWithRetry(
  id: string,
  operation: () => Promise<boolean>,
  immediate: boolean = false
): Promise<boolean> {
  return new Promise((resolve) => {
    const executeOperation = async () => {
      try {
        const success = await operation();
        if (success) {
          retryQueue.delete(id);
          persistQueue();
          resolve(true);
          return true;
        }
        throw new Error("Operation returned false");
      } catch (error) {
        const currentState = retryQueue.get(id);
        const attempt = (currentState?.attempt || 0) + 1;
        
        if (attempt >= MAX_RETRY_ATTEMPTS) {
          console.error(`[Offline] Max retries reached for operation ${id}`);
          retryQueue.delete(id);
          persistQueue();
          resolve(false);
          return false;
        }

        // Schedule retry
        const delay = calculateBackoffDelay(attempt);
        retryQueue.set(id, {
          attempt,
          nextRetryAt: Date.now() + delay,
          operation,
        });
        persistQueue();

        console.log(`[Offline] Scheduling retry ${attempt}/${MAX_RETRY_ATTEMPTS} for ${id} in ${formatRetryDelay(delay)}`);
        
        scheduleRetryProcessing();
        resolve(false);
        return false;
      }
    };

    if (immediate && isOnline) {
      executeOperation();
    } else {
      // Queue for later
      retryQueue.set(id, {
        attempt: 0,
        nextRetryAt: Date.now(),
        operation,
      });
      persistQueue();
      
      if (isOnline) {
        scheduleRetryProcessing();
      }
      
      // Resolve immediately for queued items
      resolve(false);
    }
  });
}

/**
 * Schedule retry queue processing
 */
function scheduleRetryProcessing() {
  if (retryTimeout) {
    clearTimeout(retryTimeout);
  }

  if (!isOnline || retryQueue.size === 0) return;

  // Find the next item to retry
  let nextRetryTime = Infinity;
  for (const state of retryQueue.values()) {
    if (state.nextRetryAt < nextRetryTime) {
      nextRetryTime = state.nextRetryAt;
    }
  }

  const delay = Math.max(0, nextRetryTime - Date.now());
  
  retryTimeout = setTimeout(() => {
    processRetryQueue();
  }, Math.min(delay, 5000)); // Check at least every 5 seconds
}

/**
 * Process the retry queue
 */
async function processRetryQueue() {
  if (!isOnline || retryQueue.size === 0) return;

  const now = Date.now();
  const pendingRetries: Array<{ id: string; state: RetryState }> = [];

  for (const [id, state] of retryQueue.entries()) {
    if (state.nextRetryAt <= now) {
      pendingRetries.push({ id, state });
    }
  }

  if (pendingRetries.length === 0) {
    scheduleRetryProcessing();
    return;
  }

  console.log(`[Offline] Processing ${pendingRetries.length} queued operations`);

  // Process in parallel with a limit
  const batchSize = 5;
  for (let i = 0; i < pendingRetries.length; i += batchSize) {
    const batch = pendingRetries.slice(i, i + batchSize);
    
    await Promise.all(
      batch.map(async ({ id, state }) => {
        try {
          const success = await state.operation();
          if (success) {
            retryQueue.delete(id);
          } else {
            // Increment attempt and reschedule
            const attempt = state.attempt + 1;
            if (attempt >= MAX_RETRY_ATTEMPTS) {
              console.error(`[Offline] Max retries reached for ${id}`);
              retryQueue.delete(id);
            } else {
              const delay = calculateBackoffDelay(attempt);
              retryQueue.set(id, {
                ...state,
                attempt,
                nextRetryAt: Date.now() + delay,
              });
            }
          }
        } catch (error) {
          console.error(`[Offline] Retry failed for ${id}:`, error);
          const attempt = state.attempt + 1;
          if (attempt >= MAX_RETRY_ATTEMPTS) {
            retryQueue.delete(id);
          } else {
            const delay = calculateBackoffDelay(attempt);
            retryQueue.set(id, {
              ...state,
              attempt,
              nextRetryAt: Date.now() + delay,
            });
          }
        }
      })
    );
  }

  persistQueue();
  scheduleRetryProcessing();
}

/**
 * Persist queue to localStorage
 */
function persistQueue() {
  if (typeof window === "undefined") return;
  
  try {
    // We can't serialize functions, so we just persist the IDs and retry counts
    const persistData = Array.from(retryQueue.entries()).map(([id, state]) => ({
      id,
      attempt: state.attempt,
      nextRetryAt: state.nextRetryAt,
    }));
    
    localStorage.setItem("rag_academy_retry_queue", JSON.stringify(persistData));
  } catch (error) {
    console.error("[Offline] Failed to persist queue:", error);
  }
}

/**
 * Load persisted queue from localStorage
 * Note: Operations themselves can't be restored, but their IDs can be used
to re-queue them from the sync_queue table
 */
function loadPersistedQueue() {
  if (typeof window === "undefined") return;
  
  try {
    const persisted = localStorage.getItem("rag_academy_retry_queue");
    if (persisted) {
      const data = JSON.parse(persisted) as Array<{
        id: string;
        attempt: number;
        nextRetryAt: number;
      }>;
      
      // The actual operations will be restored from the sync_queue table
      // when the app initializes sync
      console.log(`[Offline] Loaded ${data.length} persisted retry items`);
    }
  } catch (error) {
    console.error("[Offline] Failed to load persisted queue:", error);
  }
}

/**
 * Clear the retry queue
 */
export function clearRetryQueue(): void {
  retryQueue.clear();
  if (retryTimeout) {
    clearTimeout(retryTimeout);
    retryTimeout = null;
  }
  persistQueue();
}

/**
 * Get retry queue statistics
 */
export function getRetryQueueStats(): {
  total: number;
  maxAttempts: number;
  nextRetryIn: number | null;
} {
  if (retryQueue.size === 0) {
    return { total: 0, maxAttempts: MAX_RETRY_ATTEMPTS, nextRetryIn: null };
  }

  let nextRetryTime = Infinity;
  for (const state of retryQueue.values()) {
    if (state.nextRetryAt < nextRetryTime) {
      nextRetryTime = state.nextRetryAt;
    }
  }

  return {
    total: retryQueue.size,
    maxAttempts: MAX_RETRY_ATTEMPTS,
    nextRetryIn: Math.max(0, nextRetryTime - Date.now()),
  };
}

/**
 * Force a connection check
 * Useful for testing or manual refresh
 */
export async function checkConnection(): Promise<boolean> {
  if (typeof navigator === "undefined") return true;

  // First check navigator.onLine
  if (!navigator.onLine) {
    isOnline = false;
    notifyNetworkListeners(false);
    return false;
  }

  // Then try to actually reach the server
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch("/api/health", {
      method: "HEAD",
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    const wasOfflineBefore = !isOnline;
    isOnline = response.ok;
    
    if (isOnline && wasOfflineBefore) {
      notifyNetworkListeners(true);
      notifySyncListeners();
    }
    
    return isOnline;
  } catch {
    isOnline = false;
    notifyNetworkListeners(false);
    return false;
  }
}

/**
 * Debounce function for network events
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Wait for online status
 */
export function waitForOnline(timeoutMs: number = 30000): Promise<boolean> {
  return new Promise((resolve) => {
    if (isOnline) {
      resolve(true);
      return;
    }

    const unsubscribe = subscribeToNetworkStatus((online) => {
      if (online) {
        unsubscribe();
        resolve(true);
      }
    });

    setTimeout(() => {
      unsubscribe();
      resolve(false);
    }, timeoutMs);
  });
}

// Type for Background Sync API
interface SyncManager {
  register(tag: string): Promise<void>;
}

interface ExtendedServiceWorkerRegistration extends ServiceWorkerRegistration {
  sync?: SyncManager;
}

/**
 * Background sync handler
 * Call this when the app comes back online
 */
export async function triggerBackgroundSync(
  syncFunction: () => Promise<boolean>
): Promise<boolean> {
  if (!isOnline) return false;

  // Use the Background Sync API if available
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready as ExtendedServiceWorkerRegistration;
      if (registration.sync) {
        await registration.sync.register("progress-sync");
        return true;
      }
    } catch (error) {
      console.log("[Offline] Background sync registration failed, using fallback");
    }
  }

  // Fallback: immediate sync
  return syncFunction();
}
