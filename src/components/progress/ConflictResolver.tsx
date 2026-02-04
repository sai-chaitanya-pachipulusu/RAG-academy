"use client";

/**
 * Conflict Resolver Component
 * 
 * Displays conflicts between local and server progress data.
 * Allows users to choose resolution strategies:
 * - Use Local: Keep client-side changes
 * - Use Server: Accept server-side changes
 * - Merge: Combine both versions intelligently
 * 
 * Features:
 * - Show conflicts when they occur
 * - Preview both versions side-by-side
 * - Bulk conflict resolution
 * - Code comparison for submitted code
 */

import { useState, useCallback } from "react";
import { 
  AlertTriangle, 
  Server, 
  Laptop, 
  GitMerge, 
  Check, 
  X,
  ChevronDown,
  ChevronUp,
  Code2,
  Trophy,
  Clock,
  RotateCcw,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useSyncConflicts } from "@/components/providers/SyncProgressProvider";
import type { Conflict, ConflictResolutionStrategy } from "@/lib/progress/sync";
import { TouchButton as Button } from "@/components/ui/TouchButton";
import { Badge } from "@/components/ui/Badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/Dialog";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Separator } from "@/components/ui/Separator";
import { cn } from "@/lib/utils";

// Format date for display
function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Not set";
  const date = new Date(dateStr);
  return date.toLocaleString();
}

// Get status color
function getStatusColor(status: string): string {
  switch (status) {
    case "completed":
      return "bg-green-500/10 text-green-600 border-green-500/20";
    case "in_progress":
      return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
    case "not_started":
    default:
      return "bg-gray-500/10 text-gray-600 border-gray-500/20";
  }
}

// Get status label
function getStatusLabel(status: string): string {
  switch (status) {
    case "completed":
      return "Completed";
    case "in_progress":
      return "In Progress";
    case "not_started":
      return "Not Started";
    default:
      return status;
  }
}

// Individual conflict card
function ConflictCard({
  conflict,
  onResolve,
  isResolving,
}: {
  conflict: Conflict;
  onResolve: (strategy: ConflictResolutionStrategy) => void;
  isResolving: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<ConflictResolutionStrategy | null>(null);
  const [showCodeComparison, setShowCodeComparison] = useState(false);

  const hasCodeDifference = 
    conflict.localState.userCode !== conflict.remoteState.userCode &&
    (conflict.localState.userCode || conflict.remoteState.userCode);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="border rounded-lg overflow-hidden bg-card"
    >
      {/* Header */}
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          <div>
            <h4 className="font-semibold">{conflict.challengeSlug}</h4>
            <p className="text-sm text-muted-foreground">
              {conflict.conflictType === "version_mismatch" && "Version mismatch detected"}
              {conflict.conflictType === "concurrent_edit" && "Concurrent edits detected"}
              {conflict.conflictType === "checksum_mismatch" && "Data integrity issue"}
              {conflict.conflictType === "timestamp_conflict" && "Timestamp conflict"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            v{conflict.localVersion} → v{conflict.remoteVersion}
          </Badge>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <Separator />
            
            <div className="p-4 space-y-4">
              {/* Comparison */}
              <div className="grid grid-cols-2 gap-4">
                {/* Local Version */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Laptop className="w-4 h-4" />
                    <span>Local (Your Device)</span>
                  </div>
                  <div className="p-3 rounded-md bg-muted/50 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs", getStatusColor(conflict.localState.status))}
                      >
                        {getStatusLabel(conflict.localState.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Attempts:</span>
                      <span className="font-medium">{conflict.localState.attempts}</span>
                    </div>
                    {conflict.localState.completedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Completed:</span>
                        <span className="font-medium text-xs">
                          {formatDate(conflict.localState.completedAt)}
                        </span>
                      </div>
                    )}
                    {conflict.localState.userCode && (
                      <div className="pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full h-auto py-2 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowCodeComparison(!showCodeComparison);
                          }}
                        >
                          <Code2 className="w-3 h-3 mr-1" />
                          {showCodeComparison ? "Hide Code" : "View Code"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Remote Version */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Server className="w-4 h-4" />
                    <span>Server (Cloud)</span>
                  </div>
                  <div className="p-3 rounded-md bg-muted/50 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs", getStatusColor(conflict.remoteState.status))}
                      >
                        {getStatusLabel(conflict.remoteState.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Attempts:</span>
                      <span className="font-medium">{conflict.remoteState.attempts}</span>
                    </div>
                    {conflict.remoteState.completedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Completed:</span>
                        <span className="font-medium text-xs">
                          {formatDate(conflict.remoteState.completedAt)}
                        </span>
                      </div>
                    )}
                    {conflict.remoteState.userCode && (
                      <div className="pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full h-auto py-2 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowCodeComparison(!showCodeComparison);
                          }}
                        >
                          <Code2 className="w-3 h-3 mr-1" />
                          {showCodeComparison ? "Hide Code" : "View Code"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Code Comparison */}
              {showCodeComparison && hasCodeDifference && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <Separator />
                  <p className="text-sm font-medium">Code Comparison</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-md bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-2">Local Code:</p>
                      <pre className="text-xs overflow-x-auto">
                        <code>{conflict.localState.userCode || "No code saved"}</code>
                      </pre>
                    </div>
                    <div className="p-3 rounded-md bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-2">Server Code:</p>
                      <pre className="text-xs overflow-x-auto">
                        <code>{conflict.remoteState.userCode || "No code saved"}</code>
                      </pre>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Resolution Options */}
              <Separator />
              <div className="space-y-3">
                <p className="text-sm font-medium">Choose Resolution:</p>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={selectedStrategy === "client-wins" ? "default" : "outline"}
                    size="sm"
                    className="h-auto py-2 flex flex-col items-center gap-1"
                    onClick={() => setSelectedStrategy("client-wins")}
                    disabled={isResolving}
                  >
                    <Laptop className="w-4 h-4" />
                    <span className="text-xs">Use Local</span>
                  </Button>
                  <Button
                    variant={selectedStrategy === "server-wins" ? "default" : "outline"}
                    size="sm"
                    className="h-auto py-2 flex flex-col items-center gap-1"
                    onClick={() => setSelectedStrategy("server-wins")}
                    disabled={isResolving}
                  >
                    <Server className="w-4 h-4" />
                    <span className="text-xs">Use Server</span>
                  </Button>
                  <Button
                    variant={selectedStrategy === "merge" ? "default" : "outline"}
                    size="sm"
                    className="h-auto py-2 flex flex-col items-center gap-1"
                    onClick={() => setSelectedStrategy("merge")}
                    disabled={isResolving}
                  >
                    <GitMerge className="w-4 h-4" />
                    <span className="text-xs">Merge</span>
                  </Button>
                </div>

                {selectedStrategy && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pt-2"
                  >
                    <Button
                      className="w-full"
                      onClick={() => onResolve(selectedStrategy)}
                      disabled={isResolving}
                    >
                      {isResolving ? (
                        <>
                          <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                          Resolving...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Confirm Resolution
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Main Conflict Resolver Component
export function ConflictResolver() {
  const { conflicts, resolveConflict, resolveAllConflicts, dismissConflict } = useSyncConflicts();
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkStrategy, setBulkStrategy] = useState<ConflictResolutionStrategy>("merge");
  const [isBulkResolving, setIsBulkResolving] = useState(false);

  const handleResolve = useCallback(async (
    conflictId: string,
    strategy: ConflictResolutionStrategy
  ) => {
    setResolvingId(conflictId);
    try {
      await resolveConflict(conflictId, strategy);
    } finally {
      setResolvingId(null);
    }
  }, [resolveConflict]);

  const handleBulkResolve = useCallback(async () => {
    setIsBulkResolving(true);
    try {
      await resolveAllConflicts(bulkStrategy);
      setShowBulkDialog(false);
    } finally {
      setIsBulkResolving(false);
    }
  }, [resolveAllConflicts, bulkStrategy]);

  if (conflicts.length === 0) {
    return null;
  }

  return (
    <>
      {/* Floating notification for single conflict */}
      {conflicts.length === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="fixed bottom-4 right-4 z-50 w-full max-w-md"
        >
          <div className="bg-card border rounded-lg shadow-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold">Sync Conflict Detected</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Your progress for "{conflicts[0].challengeSlug}" differs from the server.
                </p>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={() => handleResolve(conflicts[0].id, "client-wins")}
                    disabled={resolvingId === conflicts[0].id}
                  >
                    Keep Local
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResolve(conflicts[0].id, "server-wins")}
                    disabled={resolvingId === conflicts[0].id}
                  >
                    Use Server
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => dismissConflict(conflicts[0].id)}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Full dialog for multiple conflicts */}
      {conflicts.length > 1 && (
        <Dialog open={conflicts.length > 0} onOpenChange={() => {}}>
          <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                Sync Conflicts Detected
              </DialogTitle>
              <DialogDescription>
                {conflicts.length} conflict{conflicts.length !== 1 ? "s" : ""} need{conflicts.length === 1 ? "s" : ""} resolution. 
                Review and choose how to resolve each one.
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="flex-1 my-4">
              <div className="space-y-3 pr-4">
                {conflicts.map((conflict) => (
                  <ConflictCard
                    key={conflict.id}
                    conflict={conflict}
                    onResolve={(strategy) => handleResolve(conflict.id, strategy)}
                    isResolving={resolvingId === conflict.id}
                  />
                ))}
              </div>
            </ScrollArea>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setShowBulkDialog(true)}
                className="w-full sm:w-auto"
              >
                Resolve All...
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Bulk Resolution Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Resolve All Conflicts</DialogTitle>
            <DialogDescription>
              Choose a strategy to resolve all {conflicts.length} conflicts at once.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <Button
              variant={bulkStrategy === "client-wins" ? "default" : "outline"}
              className="w-full justify-start h-auto py-3"
              onClick={() => setBulkStrategy("client-wins")}
            >
              <Laptop className="w-5 h-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Keep All Local</p>
                <p className="text-xs text-muted-foreground">
                  Use your device's version for all conflicts
                </p>
              </div>
            </Button>

            <Button
              variant={bulkStrategy === "server-wins" ? "default" : "outline"}
              className="w-full justify-start h-auto py-3"
              onClick={() => setBulkStrategy("server-wins")}
            >
              <Server className="w-5 h-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Use All Server</p>
                <p className="text-xs text-muted-foreground">
                  Accept the server's version for all conflicts
                </p>
              </div>
            </Button>

            <Button
              variant={bulkStrategy === "merge" ? "default" : "outline"}
              className="w-full justify-start h-auto py-3"
              onClick={() => setBulkStrategy("merge")}
            >
              <GitMerge className="w-5 h-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Smart Merge All</p>
                <p className="text-xs text-muted-foreground">
                  Automatically merge the best of both versions
                </p>
              </div>
            </Button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkResolve}
              disabled={isBulkResolving}
            >
              {isBulkResolving ? (
                <>
                  <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                  Resolving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Resolve All
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Export individual components for custom layouts
export { ConflictCard };
export type { Conflict };
