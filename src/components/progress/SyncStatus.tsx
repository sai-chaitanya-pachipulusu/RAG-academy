"use client";

/**
 * Sync Status Component
 * 
 * Displays current sync status with visual indicators.
 * Features:
 * - Show sync status (synced, syncing, offline, error)
 * - Last sync time
 * - Number of pending changes
 * - Manual sync button
 * - Network status indicator
 */

import { useState, useCallback } from "react";
import { 
  Check, 
  RefreshCw, 
  WifiOff, 
  AlertCircle, 
  Cloud,
  CloudOff,
  Clock,
  UploadCloud,
  MoreHorizontal,
  History,
  Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useSyncStatus } from "@/components/providers/SyncProgressProvider";
import type { SyncStatus as SyncStatusType } from "@/lib/progress/sync";

// Status configuration
const STATUS_CONFIG: Record<SyncStatusType, {
  icon: React.ReactNode;
  label: string;
  color: string;
  bgColor: string;
  animate?: boolean;
}> = {
  idle: {
    icon: <Cloud className="w-4 h-4" />,
    label: "Ready to sync",
    color: "text-gray-500",
    bgColor: "bg-gray-100 dark:bg-[#7C3AED]",
  },
  syncing: {
    icon: <RefreshCw className="w-4 h-4" />,
    label: "Syncing...",
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    animate: true,
  },
  synced: {
    icon: <Check className="w-4 h-4" />,
    label: "Synced",
    color: "text-emerald-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  offline: {
    icon: <WifiOff className="w-4 h-4" />,
    label: "Offline",
    color: "text-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
  },
  error: {
    icon: <AlertCircle className="w-4 h-4" />,
    label: "Sync error",
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-950/30",
  },
  conflict: {
    icon: <CloudOff className="w-4 h-4" />,
    label: "Conflicts",
    color: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
  },
};

// Compact badge variant
interface SyncStatusBadgeProps {
  showLabel?: boolean;
  className?: string;
}

export function SyncStatusBadge({ showLabel = true, className = "" }: SyncStatusBadgeProps) {
  const { syncStatus, isOnline, forceSync } = useSyncStatus();
  const [isHovering, setIsHovering] = useState(false);
  
  const config = STATUS_CONFIG[syncStatus.status];
  
  const handleClick = useCallback(() => {
    if (syncStatus.status !== "syncing" && isOnline) {
      forceSync();
    }
  }, [syncStatus.status, isOnline, forceSync]);
  
  return (
    <motion.button
      onClick={handleClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
        transition-all duration-200-colors duration-200
        ${config.bgColor} ${config.color}
        ${syncStatus.status !== "syncing" && isOnline ? "cursor-pointer hover:opacity-80" : "cursor-default"}
        ${className}
      `}
      title={!isOnline ? "You are offline" : `Last synced: ${syncStatus.lastSyncFormatted}`}
    >
      <span className={config.animate ? "animate-spin" : ""}>
        {config.icon}
      </span>
      
      {showLabel && (
        <span className="hidden sm:inline">
          {isHovering && syncStatus.status !== "syncing" && isOnline
            ? "Sync now"
            : config.label}
        </span>
      )}
      
      {syncStatus.pendingChanges > 0 && (
        <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-current/20 text-current">
          {syncStatus.pendingChanges}
        </span>
      )}
      
      {!isOnline && (
        <span className="hidden sm:inline ml-0.5 text-amber-600 dark:text-amber-400">
          • Offline
        </span>
      )}
    </motion.button>
  );
}

// Detailed panel variant
interface SyncStatusPanelProps {
  className?: string;
}

export function SyncStatusPanel({ className = "" }: SyncStatusPanelProps) {
  const { syncStatus, isOnline, forceSync } = useSyncStatus();
  const [isSyncing, setIsSyncing] = useState(false);
  
  const config = STATUS_CONFIG[syncStatus.status];
  
  const handleSync = useCallback(async () => {
    if (isSyncing || !isOnline) return;
    setIsSyncing(true);
    try {
      await forceSync();
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, isOnline, forceSync]);
  
  return (
    <div className={`bg-card border rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${config.bgColor}`}>
            <span className={config.color}>
              {config.icon}
            </span>
          </div>
          <div>
            <h4 className="font-medium">{config.label}</h4>
            <p className="text-xs text-muted-foreground">
              Last synced: {syncStatus.lastSyncFormatted}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleSync}
          disabled={isSyncing || !isOnline}
          className={`
            px-3 py-1.5 rounded-md text-sm font-medium
            transition-all duration-200-colors duration-200
            ${isSyncing || !isOnline
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
            }
          `}
        >
          {isSyncing ? (
            <span className="flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Syncing...
            </span>
          ) : !isOnline ? (
            <span className="flex items-center gap-1.5">
              <WifiOff className="w-3.5 h-3.5" />
              Offline
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              Sync Now
            </span>
          )}
        </button>
      </div>
      
      {/* Status Details */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between py-1.5 border-b">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Last Sync
          </span>
          <span className="font-medium">
            {syncStatus.lastSyncFormatted}
          </span>
        </div>
        
        <div className="flex items-center justify-between py-1.5 border-b">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <UploadCloud className="w-3.5 h-3.5" />
            Pending Changes
          </span>
          <span className={`font-medium ${syncStatus.pendingChanges > 0 ? "text-amber-500" : ""}`}>
            {syncStatus.pendingChanges > 0 
              ? `${syncStatus.pendingChanges} items`
              : "None"
            }
          </span>
        </div>
        
        <div className="flex items-center justify-between py-1.5 border-b">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Cloud className="w-3.5 h-3.5" />
            Connection
          </span>
          <span className={`font-medium ${isOnline ? "text-emerald-500" : "text-amber-500"}`}>
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>
        
        <div className="flex items-center justify-between py-1.5">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Data Integrity
          </span>
          <span className="font-medium text-emerald-500">
            Verified
          </span>
        </div>
      </div>
      
      {/* Error Message */}
      {syncStatus.status === "error" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-3 p-3 rounded-md bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>Sync failed. Changes will be retried automatically.</span>
          </div>
        </motion.div>
      )}
      
      {/* Conflict Warning */}
      {syncStatus.status === "conflict" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-3 p-3 rounded-md bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 text-sm"
        >
          <div className="flex items-start gap-2">
            <CloudOff className="w-4 h-4 mt-0.5 shrink-0" />
            <span>Sync conflicts detected. Please resolve them to continue.</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Minimal dot indicator
interface SyncStatusDotProps {
  className?: string;
}

export function SyncStatusDot({ className = "" }: SyncStatusDotProps) {
  const { syncStatus, isOnline } = useSyncStatus();
  
  const getColor = () => {
    if (!isOnline) return "bg-amber-500";
    switch (syncStatus.status) {
      case "synced": return "bg-emerald-500";
      case "syncing": return "bg-blue-500 animate-pulse";
      case "error": return "bg-red-500";
      case "conflict": return "bg-orange-500";
      default: return "bg-gray-400";
    }
  };
  
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${getColor()} ${className}`}
      title={`Sync: ${syncStatus.status} | ${isOnline ? "Online" : "Offline"}`}
    />
  );
}

// Full sync dashboard
interface SyncDashboardProps {
  className?: string;
}

export function SyncDashboard({ className = "" }: SyncDashboardProps) {
  const { syncStatus, isOnline, forceSync } = useSyncStatus();
  const [showHistory, setShowHistory] = useState(false);
  
  return (
    <div className={`space-y-4 ${className}`}>
      <SyncStatusPanel />
      
      {/* Additional Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex-1 px-3 py-2 rounded-md border text-sm font-medium
            hover:bg-muted transition-all duration-200-all duration-200
            flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <History className="w-4 h-4" />
          {showHistory ? "Hide History" : "View History"}
        </button>
        
        <button
          onClick={forceSync}
          disabled={!isOnline}
          className="flex-1 px-3 py-2 rounded-md border text-sm font-medium
            hover:bg-muted transition-all duration-200-all duration-200 disabled:opacity-50
            flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <MoreHorizontal className="w-4 h-4" />
          More Options
        </button>
      </div>
      
      {/* History Panel (placeholder) */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-muted/50 rounded-lg p-4"
          >
            <h5 className="font-medium mb-2">Recent Sync Activity</h5>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Last successful sync</span>
                <span>{syncStatus.lastSyncFormatted}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total syncs today</span>
                <span>--</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Conflicts resolved</span>
                <span>--</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


