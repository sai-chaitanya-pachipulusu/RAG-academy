/**
 * Data Integrity Module
 * 
 * Provides data validation, checksum generation, migration utilities,
 * and backup/restore functionality for progress data.
 */

import type { LocalProgressState } from "./localStore";
import { getDefaultProgress, loadProgress, saveProgress } from "./localStore";
import type { ChallengeProgress, LessonProgress } from "./types";

// Data integrity error types
export class DataIntegrityError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "DataIntegrityError";
  }
}

// Validation result type
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  fixed?: boolean;
}

// Migration function type
type Migration = (data: unknown) => LocalProgressState;

// Migration registry
const migrations: Map<number, Migration> = new Map();

/**
 * Generate a checksum for data integrity verification
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
 * Verify data integrity using checksum
 */
export function verifyChecksum(data: unknown, checksum: string): boolean {
  return generateChecksum(data) === checksum;
}

/**
 * Validate progress data structure
 */
export function validateProgressData(data: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data || typeof data !== "object") {
    return { valid: false, errors: ["Data is not an object"], warnings };
  }

  const progress = data as Record<string, unknown>;

  // Check version
  if (!("version" in progress)) {
    errors.push("Missing version field");
  } else if (typeof progress.version !== "number") {
    errors.push("Version must be a number");
  }

  // Check XP
  if (!("xp" in progress)) {
    errors.push("Missing xp field");
  } else if (typeof progress.xp !== "number" || progress.xp < 0) {
    errors.push("XP must be a non-negative number");
  }

  // Check streak
  if (!("streak" in progress)) {
    errors.push("Missing streak field");
  } else if (!progress.streak || typeof progress.streak !== "object") {
    errors.push("Streak must be an object");
  } else {
    const streak = progress.streak as Record<string, unknown>;
    if (!("streakDays" in streak)) {
      errors.push("Missing streak.streakDays");
    }
    if (!("lastActivityDate" in streak)) {
      warnings.push("Missing streak.lastActivityDate");
    }
  }

  // Check challenges
  if (!("challenges" in progress)) {
    errors.push("Missing challenges field");
  } else if (!progress.challenges || typeof progress.challenges !== "object") {
    errors.push("Challenges must be an object");
  } else {
    const challenges = progress.challenges as Record<string, unknown>;
    for (const [slug, challenge] of Object.entries(challenges)) {
      const challengeValidation = validateChallengeProgress(challenge);
      if (!challengeValidation.valid) {
        errors.push(`Challenge "${slug}": ${challengeValidation.errors.join(", ")}`);
      }
      warnings.push(...challengeValidation.warnings.map(w => `Challenge "${slug}": ${w}`));
    }
  }

  // Check lessons
  if (!("lessons" in progress)) {
    errors.push("Missing lessons field");
  } else if (!progress.lessons || typeof progress.lessons !== "object") {
    errors.push("Lessons must be an object");
  } else {
    const lessons = progress.lessons as Record<string, unknown>;
    for (const [id, lesson] of Object.entries(lessons)) {
      const lessonValidation = validateLessonProgress(lesson);
      if (!lessonValidation.valid) {
        errors.push(`Lesson "${id}": ${lessonValidation.errors.join(", ")}`);
      }
      warnings.push(...lessonValidation.warnings.map(w => `Lesson "${id}": ${w}`));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate challenge progress
 */
function validateChallengeProgress(data: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data || typeof data !== "object") {
    return { valid: false, errors: ["Challenge progress must be an object"], warnings };
  }

  const challenge = data as Record<string, unknown>;

  // Check status
  if (!("status" in challenge)) {
    errors.push("Missing status");
  } else if (!["not_started", "in_progress", "completed"].includes(challenge.status as string)) {
    errors.push(`Invalid status: ${challenge.status}`);
  }

  // Check attempts
  if (!("attempts" in challenge)) {
    errors.push("Missing attempts");
  } else if (typeof challenge.attempts !== "number" || challenge.attempts < 0) {
    errors.push("Attempts must be a non-negative number");
  }

  // Check completedAt consistency
  if (challenge.status === "completed" && !challenge.completedAt) {
    warnings.push("Completed challenge missing completedAt timestamp");
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate lesson progress
 */
function validateLessonProgress(data: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data || typeof data !== "object") {
    return { valid: false, errors: ["Lesson progress must be an object"], warnings };
  }

  const lesson = data as Record<string, unknown>;

  // Check status
  if (!("status" in lesson)) {
    errors.push("Missing status");
  } else if (!["not_started", "in_progress", "completed"].includes(lesson.status as string)) {
    errors.push(`Invalid status: ${lesson.status}`);
  }

  // Check completedAt consistency
  if (lesson.status === "completed" && !lesson.completedAt) {
    warnings.push("Completed lesson missing completedAt timestamp");
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Auto-fix common data issues
 */
export function autoFixProgressData(data: unknown): {
  data: LocalProgressState;
  fixed: boolean;
  fixes: string[];
} {
  const fixes: string[] = [];
  
  if (!data || typeof data !== "object") {
    fixes.push("Data was corrupted, reset to default");
    return { data: getDefaultProgress(), fixed: true, fixes };
  }

  const progress = { ...(data as Record<string, unknown>) };
  const defaultProgress = getDefaultProgress();

  // Fix missing version
  if (!("version" in progress) || typeof progress.version !== "number") {
    progress.version = 1;
    fixes.push("Added missing version field");
  }

  // Fix missing XP
  if (!("xp" in progress) || typeof progress.xp !== "number" || progress.xp < 0) {
    progress.xp = 0;
    fixes.push("Reset invalid XP to 0");
  }

  // Fix missing streak
  if (!progress.streak || typeof progress.streak !== "object") {
    progress.streak = { ...defaultProgress.streak };
    fixes.push("Reset invalid streak data");
  } else {
    const streak = progress.streak as Record<string, unknown>;
    if (!("streakDays" in streak) || typeof streak.streakDays !== "number") {
      streak.streakDays = 0;
      fixes.push("Reset invalid streakDays");
    }
    if (!("lastActivityDate" in streak)) {
      streak.lastActivityDate = null;
      fixes.push("Added missing lastActivityDate");
    }
  }

  // Fix missing challenges
  if (!progress.challenges || typeof progress.challenges !== "object") {
    progress.challenges = {};
    fixes.push("Reset invalid challenges data");
  }

  // Fix missing lessons
  if (!progress.lessons || typeof progress.lessons !== "object") {
    progress.lessons = {};
    fixes.push("Reset invalid lessons data");
  }

  // Validate and fix individual challenges
  const challenges = progress.challenges as Record<string, unknown>;
  for (const [slug, challenge] of Object.entries(challenges)) {
    const validation = validateChallengeProgress(challenge);
    if (!validation.valid) {
      challenges[slug] = {
        status: "not_started",
        attempts: 0,
        userCode: null,
        completedAt: null,
      };
      fixes.push(`Reset invalid challenge "${slug}"`);
    }
  }

  // Validate and fix individual lessons
  const lessons = progress.lessons as Record<string, unknown>;
  for (const [id, lesson] of Object.entries(lessons)) {
    const validation = validateLessonProgress(lesson);
    if (!validation.valid) {
      lessons[id] = {
        status: "not_started",
        completedAt: null,
      };
      fixes.push(`Reset invalid lesson "${id}"`);
    }
  }

  return {
    data: progress as LocalProgressState,
    fixed: fixes.length > 0,
    fixes,
  };
}

/**
 * Register a migration function for a specific version
 */
export function registerMigration(fromVersion: number, migrateFn: Migration): void {
  migrations.set(fromVersion, migrateFn);
}

/**
 * Migrate data to the latest version
 */
export function migrateData(data: unknown): LocalProgressState {
  if (!data || typeof data !== "object") {
    return getDefaultProgress();
  }

  const progress = data as Record<string, unknown>;
  const currentVersion = (progress.version as number) || 0;

  // Already at latest version
  if (currentVersion >= 1) {
    return progress as LocalProgressState;
  }

  // Apply migrations in order
  let migratedData = data;
  for (let version = currentVersion; version < 1; version++) {
    const migration = migrations.get(version);
    if (migration) {
      migratedData = migration(migratedData);
    }
  }

  return migratedData as LocalProgressState;
}

/**
 * Create a backup of current progress
 */
export function createLocalBackup(): {
  success: boolean;
  backupId?: string;
  error?: string;
} {
  try {
    if (typeof window === "undefined") {
      return { success: false, error: "Cannot create backup on server" };
    }

    const progress = loadProgress();
    const backupId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const backup = {
      id: backupId,
      timestamp: new Date().toISOString(),
      data: progress,
      checksum: generateChecksum(progress),
    };

    // Get existing backups
    const backupsJson = localStorage.getItem("rag_academy_progress_backups") || "[]";
    const backups = JSON.parse(backupsJson);
    
    // Add new backup
    backups.push(backup);
    
    // Keep only last 10 backups
    if (backups.length > 10) {
      backups.shift();
    }

    localStorage.setItem("rag_academy_progress_backups", JSON.stringify(backups));

    return { success: true, backupId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Restore progress from a local backup
 */
export function restoreFromLocalBackup(backupId: string): {
  success: boolean;
  error?: string;
  fixes?: string[];
} {
  try {
    if (typeof window === "undefined") {
      return { success: false, error: "Cannot restore backup on server" };
    }

    const backupsJson = localStorage.getItem("rag_academy_progress_backups") || "[]";
    const backups = JSON.parse(backupsJson);
    
    const backup = backups.find((b: { id: string }) => b.id === backupId);
    if (!backup) {
      return { success: false, error: "Backup not found" };
    }

    // Verify checksum
    if (!verifyChecksum(backup.data, backup.checksum)) {
      return { success: false, error: "Backup checksum mismatch - data may be corrupted" };
    }

    // Validate and fix data
    const { data, fixed, fixes } = autoFixProgressData(backup.data);
    
    // Save restored data
    saveProgress(data);

    return {
      success: true,
      fixes: fixed ? fixes : undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get list of local backups
 */
export function getLocalBackups(): Array<{
  id: string;
  timestamp: string;
  size: number;
}> {
  try {
    if (typeof window === "undefined") {
      return [];
    }

    const backupsJson = localStorage.getItem("rag_academy_progress_backups") || "[]";
    const backups = JSON.parse(backupsJson);
    
    return backups.map((backup: { id: string; timestamp: string; data: unknown }) => ({
      id: backup.id,
      timestamp: backup.timestamp,
      size: JSON.stringify(backup.data).length,
    }));
  } catch {
    return [];
  }
}

/**
 * Delete a local backup
 */
export function deleteLocalBackup(backupId: string): boolean {
  try {
    if (typeof window === "undefined") {
      return false;
    }

    const backupsJson = localStorage.getItem("rag_academy_progress_backups") || "[]";
    const backups = JSON.parse(backupsJson);
    
    const filtered = backups.filter((b: { id: string }) => b.id !== backupId);
    
    if (filtered.length === backups.length) {
      return false;
    }

    localStorage.setItem("rag_academy_progress_backups", JSON.stringify(filtered));
    return true;
  } catch {
    return false;
  }
}

/**
 * Export progress data to JSON file
 */
export function exportProgressToFile(): void {
  if (typeof window === "undefined") return;

  const progress = loadProgress();
  const exportData = {
    version: progress.version,
    exported_at: new Date().toISOString(),
    checksum: generateChecksum(progress),
    data: progress,
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `rag-academy-progress-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Import progress data from JSON file
 */
export async function importProgressFromFile(file: File): Promise<{
  success: boolean;
  error?: string;
  fixes?: string[];
}> {
  try {
    const text = await file.text();
    const importData = JSON.parse(text);

    // Verify checksum if present
    if (importData.checksum && !verifyChecksum(importData.data, importData.checksum)) {
      return { success: false, error: "Import file checksum mismatch" };
    }

    // Validate data
    const validation = validateProgressData(importData.data);
    if (!validation.valid) {
      // Try to auto-fix
      const { data, fixed, fixes } = autoFixProgressData(importData.data);
      
      if (fixed) {
        saveProgress(data);
        return { success: true, fixes };
      }
      
      return {
        success: false,
        error: `Invalid data: ${validation.errors.join(", ")}`,
      };
    }

    // Migrate to latest version
    const migratedData = migrateData(importData.data);
    
    // Save imported data
    saveProgress(migratedData);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to parse import file",
    };
  }
}

/**
 * Sanitize progress data for export (remove sensitive info)
 */
export function sanitizeProgressForExport(progress: LocalProgressState): LocalProgressState {
  // Create a clean copy without any sensitive data
  return {
    version: progress.version,
    xp: progress.xp,
    streak: { ...progress.streak },
    challenges: { ...progress.challenges },
    lessons: { ...progress.lessons },
  };
}

/**
 * Compare two progress states and return differences
 */
export function compareProgressStates(
  local: LocalProgressState,
  remote: LocalProgressState
): {
  added: string[];
  removed: string[];
  modified: Array<{
    slug: string;
    local: ChallengeProgress;
    remote: ChallengeProgress;
  }>;
} {
  const added: string[] = [];
  const removed: string[] = [];
  const modified: Array<{
    slug: string;
    local: ChallengeProgress;
    remote: ChallengeProgress;
  }> = [];

  const localSlugs = Object.keys(local.challenges);
  const remoteSlugs = Object.keys(remote.challenges);

  // Find added (in local but not in remote)
  for (const slug of localSlugs) {
    if (!remote.challenges[slug]) {
      added.push(slug);
    }
  }

  // Find removed (in remote but not in local)
  for (const slug of remoteSlugs) {
    if (!local.challenges[slug]) {
      removed.push(slug);
    }
  }

  // Find modified
  for (const slug of localSlugs) {
    if (remote.challenges[slug]) {
      const localChallenge = local.challenges[slug];
      const remoteChallenge = remote.challenges[slug];
      
      if (
        localChallenge.status !== remoteChallenge.status ||
        localChallenge.attempts !== remoteChallenge.attempts ||
        localChallenge.completedAt !== remoteChallenge.completedAt ||
        localChallenge.userCode !== remoteChallenge.userCode
      ) {
        modified.push({ slug, local: localChallenge, remote: remoteChallenge });
      }
    }
  }

  return { added, removed, modified };
}

/**
 * Initialize data integrity checks
 * Call this when the app starts
 */
export function initDataIntegrity(): void {
  if (typeof window === "undefined") return;

  // Validate current data
  const progress = loadProgress();
  const validation = validateProgressData(progress);

  if (!validation.valid) {
    console.warn("[DataIntegrity] Progress data validation failed:", validation.errors);
    
    // Try to auto-fix
    const { data, fixed, fixes } = autoFixProgressData(progress);
    
    if (fixed) {
      console.log("[DataIntegrity] Auto-fixed issues:", fixes);
      saveProgress(data);
    }
  }

  // Create automatic backup on startup (once per day)
  const lastAutoBackup = localStorage.getItem("rag_academy_last_auto_backup");
  const today = new Date().toISOString().split("T")[0];
  
  if (lastAutoBackup !== today) {
    const result = createLocalBackup();
    if (result.success) {
      localStorage.setItem("rag_academy_last_auto_backup", today);
      console.log("[DataIntegrity] Created automatic backup:", result.backupId);
    }
  }
}
