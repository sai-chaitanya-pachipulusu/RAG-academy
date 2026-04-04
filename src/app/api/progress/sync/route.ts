/**
 * Progress Sync API Route
 * 
 * Handles server-side progress synchronization.
 * Endpoints:
 * - POST /api/progress/sync: Push progress to server
 * - GET /api/progress/sync: Pull progress from server
 * - PUT /api/progress/sync: Resolve conflicts
 * 
 * Features:
 * - Conflict detection
 * - Data validation
 * - Checksum verification
 * - Batch operations
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

// Get Supabase client with proper env validation
const getSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    throw new Error(
      "Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }
  
  return createClient(url, key);
};

/**
 * Safely query a table, returning null if the table doesn't exist.
 * This handles the case where optional migration tables (sync_sessions,
 * progress_conflicts) haven't been run yet.
 */
async function safeQuery<T>(
  supabase: ReturnType<typeof createClient>,
  table: string,
  queryFn: (q: any) => any
): Promise<{ data: T[] | null; error: any }> {
  try {
    const result = await queryFn(supabase.from(table));
    return result;
  } catch (err: any) {
    // Table doesn't exist error from PostgREST
    if (err.message?.includes("relation") && err.message?.includes("does not exist")) {
      console.warn(`[sync] Table "${table}" does not exist — skipping. Run migration 008_progress_sync.sql to enable full sync.`);
      return { data: null, error: null };
    }
    throw err;
  }
}

// Validation schemas
const ProgressItemSchema = z.object({
  challenge_slug: z.string(),
  status: z.enum(["not_started", "in_progress", "completed"]),
  attempts: z.number().int().min(0).default(0),
  best_score: z.number().optional(),
  last_submitted_code: z.string().optional(),
  completed_at: z.string().datetime().optional(),
  version: z.number().int().min(1).default(1),
  checksum: z.string(),
  client_timestamp: z.string().datetime(),
  device_id: z.string().optional(),
});

const PushRequestSchema = z.object({
  items: z.array(ProgressItemSchema),
  last_synced_at: z.string().datetime().optional(),
});

const ResolveRequestSchema = z.object({
  conflicts: z.array(z.object({
    challenge_slug: z.string(),
    resolution_strategy: z.enum(["server-wins", "client-wins", "merge"]),
    resolved_state: ProgressItemSchema.optional(),
  })),
});

// Type for progress items
interface ProgressItem {
  challenge_slug: string;
  status: "not_started" | "in_progress" | "completed";
  attempts: number;
  best_score?: number;
  last_submitted_code?: string;
  completed_at?: string;
  version: number;
  synced_at: string;
  checksum: string;
  updated_at: string;
}

// Generate checksum for data integrity
// Uses crypto.createHash for collision-resistant integrity verification
function generateChecksum(data: unknown): string {
  const str = JSON.stringify(data);
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const crypto = require("crypto");
    return crypto.createHash("sha256").update(str).digest("hex").slice(0, 16);
  } catch {
    // Fallback for environments without crypto (e.g., some edge runtimes)
    // This is a basic hash — not cryptographically secure but better than nothing
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }
}

function verifyChecksum(data: unknown, checksum: string): boolean {
  return generateChecksum(data) === checksum;
}

/**
 * Map user_progress status values to challenge_progress legacy values
 * user_progress: not_started, in_progress, completed
 * challenge_progress: started, attempted, completed
 */
function mapStatusToLegacy(status: string): string {
  switch (status) {
    case "not_started": return "started";
    case "in_progress": return "attempted";
    case "completed": return "completed";
    default: return "started";
  }
}

// GET handler - Pull progress from server
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    // Get auth token from request
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "") || 
                  request.cookies.get("sb-access-token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Please sign in to sync progress" },
        { status: 401 }
      );
    }

    // Verify user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Invalid session" },
        { status: 401 }
      );
    }

    const userId = user.id;
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const lastSyncedAt = searchParams.get("last_synced_at");
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    // Fetch progress from database
    // Use challenge_progress (created by schema.sql) as the canonical table.
    // If user_progress exists (from migration 008), prefer it for sync-specific fields.
    let tableName = "challenge_progress";
    try {
      const { data: testTable } = await supabase.from("user_progress").select("id").limit(1);
      if (testTable) tableName = "user_progress";
    } catch {
      // user_progress doesn't exist, fall back to challenge_progress
    }

    let query = supabase
      .from(tableName)
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: true })
      .limit(limit);

    if (lastSyncedAt) {
      query = query.gt("updated_at", lastSyncedAt);
    }

    const { data: progress, error } = await query;

    if (error) {
      console.error("Failed to fetch progress:", error);
      return NextResponse.json(
        { error: "Database error", message: "Failed to fetch progress" },
        { status: 500 }
      );
    }

    // Transform to response format
    const items = (progress || []).map((item: ProgressItem) => ({
      challenge_slug: item.challenge_slug,
      status: item.status,
      attempts: item.attempts,
      best_score: item.best_score,
      last_submitted_code: item.last_submitted_code,
      completed_at: item.completed_at,
      version: item.version,
      synced_at: item.synced_at,
      checksum: item.checksum,
      updated_at: item.updated_at,
    }));

    return NextResponse.json({
      success: true,
      items,
      count: items.length,
      server_timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Sync pull error:", error);
    return NextResponse.json(
      { error: "Internal error", message: "Failed to process sync request" },
      { status: 500 }
    );
  }
}

// POST handler - Push progress to server
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    // Get auth token from request
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "") || 
                  request.cookies.get("sb-access-token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Please sign in to sync progress" },
        { status: 401 }
      );
    }

    // Verify user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Invalid session" },
        { status: 401 }
      );
    }

    const userId = user.id;
    
    // Detect which progress table exists (challenge_progress from schema.sql,
    // or user_progress from migration 008)
    let tableName = "challenge_progress";
    try {
      const { data: testTable } = await supabase.from("user_progress").select("id").limit(1);
      if (testTable) tableName = "user_progress";
    } catch {
      // user_progress doesn't exist, fall back to challenge_progress
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validation = PushRequestSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Validation error", 
          message: "Invalid request data",
          details: validation.error.issues 
        },
        { status: 400 }
      );
    }

    const { items } = validation.data;
    
    // Process each item
    const results = [];
    const conflicts = [];

    for (const item of items) {
      try {
        // Verify checksum
        const { checksum, ...dataWithoutChecksum } = item;
        if (!verifyChecksum(dataWithoutChecksum, checksum)) {
          results.push({
            challenge_slug: item.challenge_slug,
            success: false,
            conflict_detected: true,
            error: "Checksum mismatch - data may be corrupted",
          });
          continue;
        }

        // Check for existing progress (use detected table)
        const { data: existing } = await supabase
          .from(tableName)
          .select("version, updated_at")
          .eq("user_id", userId)
          .eq("challenge_slug", item.challenge_slug)
          .single();

        // Detect conflicts
        if (existing && existing.version >= item.version) {
          conflicts.push({
            challenge_slug: item.challenge_slug,
            conflict_type: "version_mismatch",
            local_version: item.version,
            server_version: existing.version,
          });
          
          results.push({
            challenge_slug: item.challenge_slug,
            success: false,
            conflict_detected: true,
            server_version: existing.version,
          });
          continue;
        }

        // Build upsert data — adapt to table schema
        const isUserProgress = tableName === "user_progress";
        const upsertData: Record<string, unknown> = {
          user_id: userId,
          challenge_slug: item.challenge_slug,
          status: isUserProgress ? item.status : mapStatusToLegacy(item.status),
          attempts: item.attempts,
          best_score: item.best_score,
          updated_at: new Date().toISOString(),
        };

        // Add columns only if they exist in the target table
        if (isUserProgress) {
          upsertData.last_submitted_code = item.last_submitted_code;
          upsertData.completed_at = item.completed_at;
          upsertData.version = item.version;
          upsertData.checksum = item.checksum;
          upsertData.client_timestamp = item.client_timestamp;
          upsertData.device_id = item.device_id;
          upsertData.synced_at = new Date().toISOString();
        } else {
          // challenge_progress uses 'code' not 'last_submitted_code'
          upsertData.code = item.last_submitted_code;
          if (item.completed_at) upsertData.completed_at = item.completed_at;
        }

        // Upsert progress
        const { error: upsertError } = await supabase
          .from(tableName)
          .upsert(upsertData, {
            onConflict: "user_id,challenge_slug",
          });

        if (upsertError) {
          throw upsertError;
        }

        results.push({
          challenge_slug: item.challenge_slug,
          success: true,
          version: item.version,
        });

      } catch (itemError) {
        console.error(`Failed to process ${item.challenge_slug}:`, itemError);
        results.push({
          challenge_slug: item.challenge_slug,
          success: false,
          error: itemError instanceof Error ? itemError.message : "Unknown error",
        });
      }
    }

    // Record sync session
    await supabase.from("sync_sessions").insert({
      user_id: userId,
      status: conflicts.length > 0 ? "partial" : "completed",
      items_pushed: results.filter((r) => r.success).length,
      conflicts_detected: conflicts.length,
      completed_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: conflicts.length === 0,
      results,
      conflicts: conflicts.length > 0 ? conflicts : undefined,
      server_timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Sync push error:", error);
    return NextResponse.json(
      { error: "Internal error", message: "Failed to process sync request" },
      { status: 500 }
    );
  }
}

// PUT handler - Resolve conflicts
export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    // Get auth token from request
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "") || 
                  request.cookies.get("sb-access-token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Please sign in to resolve conflicts" },
        { status: 401 }
      );
    }

    // Verify user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Invalid session" },
        { status: 401 }
      );
    }

    const userId = user.id;
    
    // Parse and validate request body
    const body = await request.json();
    const validation = ResolveRequestSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Validation error", 
          message: "Invalid request data",
          details: validation.error.issues 
        },
        { status: 400 }
      );
    }

    const { conflicts } = validation.data;
    const results = [];

    for (const conflict of conflicts) {
      try {
        // Get server state
        const { data: serverState } = await supabase
          .from("user_progress")
          .select("*")
          .eq("user_id", userId)
          .eq("challenge_slug", conflict.challenge_slug)
          .single();

        let resolvedState;

        switch (conflict.resolution_strategy) {
          case "server-wins":
            // Keep server state - no change needed
            resolvedState = serverState;
            break;

          case "client-wins":
            // Use client's resolved state
            if (conflict.resolved_state) {
              const { error } = await supabase
                .from("user_progress")
                .upsert({
                  user_id: userId,
                  challenge_slug: conflict.challenge_slug,
                  status: conflict.resolved_state.status,
                  attempts: conflict.resolved_state.attempts,
                  best_score: conflict.resolved_state.best_score,
                  last_submitted_code: conflict.resolved_state.last_submitted_code,
                  completed_at: conflict.resolved_state.completed_at,
                  version: (serverState?.version || 0) + 1,
                  checksum: conflict.resolved_state.checksum,
                  synced_at: new Date().toISOString(),
                }, {
                  onConflict: "user_id,challenge_slug",
                });

              if (error) throw error;
              resolvedState = conflict.resolved_state;
            }
            break;

          case "merge":
            // Merge strategy - take best of both
            if (serverState && conflict.resolved_state) {
              const merged = {
                ...serverState,
                status: conflict.resolved_state.status === "completed" || serverState.status === "completed"
                  ? "completed"
                  : conflict.resolved_state.status === "in_progress" || serverState.status === "in_progress"
                    ? "in_progress"
                    : "not_started",
                attempts: Math.max(conflict.resolved_state.attempts, serverState.attempts),
                best_score: Math.max(
                  conflict.resolved_state.best_score || 0,
                  serverState.best_score || 0
                ) || null,
                last_submitted_code: conflict.resolved_state.last_submitted_code || serverState.last_submitted_code,
                completed_at: conflict.resolved_state.completed_at || serverState.completed_at,
                version: serverState.version + 1,
              };

              const { error } = await supabase
                .from("user_progress")
                .upsert({
                  user_id: userId,
                  challenge_slug: conflict.challenge_slug,
                  ...merged,
                  checksum: generateChecksum(merged),
                  synced_at: new Date().toISOString(),
                }, {
                  onConflict: "user_id,challenge_slug",
                });

              if (error) throw error;
              resolvedState = merged;
            }
            break;
        }

        // Mark conflict as resolved
        await supabase
          .from("progress_conflicts")
          .update({
            status: "resolved",
            resolution_strategy: conflict.resolution_strategy,
            resolved_state: resolvedState,
            resolved_at: new Date().toISOString(),
            resolved_by: userId,
          })
          .eq("user_id", userId)
          .eq("challenge_slug", conflict.challenge_slug)
          .eq("status", "unresolved");

        results.push({
          challenge_slug: conflict.challenge_slug,
          success: true,
          strategy: conflict.resolution_strategy,
        });

      } catch (error) {
        console.error(`Failed to resolve ${conflict.challenge_slug}:`, error);
        results.push({
          challenge_slug: conflict.challenge_slug,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: results.every((r) => r.success),
      results,
      server_timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Conflict resolution error:", error);
    return NextResponse.json(
      { error: "Internal error", message: "Failed to resolve conflicts" },
      { status: 500 }
    );
  }
}
