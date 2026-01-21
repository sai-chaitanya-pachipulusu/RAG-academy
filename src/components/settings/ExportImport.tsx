"use client";

import { useState } from "react";

interface ExportData {
  version: string;
  exportedAt: string;
  progress: {
    completedChallenges: string[];
    scores: Record<string, number>;
    microTasks: Record<string, boolean[]>;
    xp: number;
  };
  achievements: string[];
  streak: {
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string;
    totalDaysActive: number;
  };
  reviews: Record<string, {
    completedAt: number;
    lastReviewedAt: number;
    reviewCount: number;
  }>;
  settings: {
    theme: string;
  };
}

const EXPORT_VERSION = "1.0.0";

export function exportProgress(): ExportData {
  const data: ExportData = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    progress: {
      completedChallenges: [],
      scores: {},
      microTasks: {},
      xp: 0,
    },
    achievements: [],
    streak: {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: "",
      totalDaysActive: 0,
    },
    reviews: {},
    settings: {
      theme: "system",
    },
  };

  if (typeof window === "undefined") return data;

  // Gather all localStorage data
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;

    const value = localStorage.getItem(key);
    if (!value) continue;

    try {
      if (key === "challenge_progress") {
        data.progress.completedChallenges = JSON.parse(value);
      } else if (key.startsWith("challenge_score_")) {
        const slug = key.replace("challenge_score_", "");
        data.progress.scores[slug] = JSON.parse(value);
      } else if (key.startsWith("microtasks_")) {
        const slug = key.replace("microtasks_", "");
        data.progress.microTasks[slug] = JSON.parse(value);
      } else if (key === "xp_total") {
        data.progress.xp = JSON.parse(value);
      } else if (key === "achievements") {
        data.achievements = JSON.parse(value);
      } else if (key === "rag_academy_streak") {
        data.streak = JSON.parse(value);
      } else if (key === "rag_academy_reviews") {
        data.reviews = JSON.parse(value);
      } else if (key === "theme") {
        data.settings.theme = value;
      }
    } catch {
      // Skip malformed data
    }
  }

  return data;
}

export function importProgress(data: ExportData): { success: boolean; message: string } {
  if (typeof window === "undefined") {
    return { success: false, message: "Cannot import in server environment" };
  }

  try {
    // Validate version
    if (!data.version || !data.exportedAt) {
      return { success: false, message: "Invalid export file format" };
    }

    // Import progress
    if (data.progress.completedChallenges) {
      localStorage.setItem(
        "challenge_progress",
        JSON.stringify(data.progress.completedChallenges)
      );
    }

    // Import scores
    Object.entries(data.progress.scores || {}).forEach(([slug, score]) => {
      localStorage.setItem(`challenge_score_${slug}`, JSON.stringify(score));
    });

    // Import micro-tasks
    Object.entries(data.progress.microTasks || {}).forEach(([slug, tasks]) => {
      localStorage.setItem(`microtasks_${slug}`, JSON.stringify(tasks));
    });

    // Import XP
    if (data.progress.xp) {
      localStorage.setItem("xp_total", JSON.stringify(data.progress.xp));
    }

    // Import achievements
    if (data.achievements) {
      localStorage.setItem("achievements", JSON.stringify(data.achievements));
    }

    // Import streak
    if (data.streak) {
      localStorage.setItem("rag_academy_streak", JSON.stringify(data.streak));
    }

    // Import reviews
    if (data.reviews) {
      localStorage.setItem("rag_academy_reviews", JSON.stringify(data.reviews));
    }

    // Import settings
    if (data.settings?.theme) {
      localStorage.setItem("theme", data.settings.theme);
    }

    return {
      success: true,
      message: `Successfully imported progress from ${new Date(data.exportedAt).toLocaleString()}`,
    };
  } catch (error) {
    return { success: false, message: `Import failed: ${error}` };
  }
}

export function ExportImportUI() {
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleExport = () => {
    const data = exportProgress();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rag-academy-progress-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setMessage({ type: "success", text: "Progress exported successfully!" });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as ExportData;
        const result = importProgress(data);
        setMessage({
          type: result.success ? "success" : "error",
          text: result.message,
        });

        if (result.success) {
          // Reload to reflect changes
          setTimeout(() => window.location.reload(), 1500);
        }
      } catch {
        setMessage({ type: "error", text: "Invalid file format" });
      }
      setImporting(false);
    };

    reader.onerror = () => {
      setMessage({ type: "error", text: "Failed to read file" });
      setImporting(false);
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <h3 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
        <span>Export / Import Progress</span>
      </h3>
      
      <p className="text-sm text-zinc-500">
        Save your progress to a file or restore from a previous backup.
      </p>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleExport}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          <span>Export to File</span>
        </button>

        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800">
          <span>{importing ? "Importing..." : "Import from File"}</span>
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
            disabled={importing}
          />
        </label>
      </div>

      {message && (
        <div
          className={`rounded-lg px-3 py-2 text-sm ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
              : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-950/20">
        <p className="text-xs text-amber-700 dark:text-amber-400">
          <strong>Warning:</strong> Importing will overwrite your current
          progress. Make sure to export your current data first!
        </p>
      </div>
    </div>
  );
}

// Quick backup reminder
export function BackupReminder({ daysPlayed }: { daysPlayed: number }) {
  const [dismissed, setDismissed] = useState(false);

  // Show reminder every 7 days
  if (dismissed || daysPlayed % 7 !== 0 || daysPlayed === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-900/50 dark:bg-blue-950/20">
      <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
        <span>Consider backing up your progress!</span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => {
            const data = exportProgress();
            const blob = new Blob([JSON.stringify(data, null, 2)], {
              type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `rag-academy-backup.json`;
            a.click();
            URL.revokeObjectURL(url);
            setDismissed(true);
          }}
          className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
        >
          Export
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="text-xs text-blue-600 hover:underline dark:text-blue-400"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
