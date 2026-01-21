"use client";

import { useEffect, useCallback } from "react";

interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger if typing in an input or textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Allow Ctrl/Cmd + Enter in code editors
        if (!(event.ctrlKey || event.metaKey) || event.key !== "Enter") {
          return;
        }
      }

      for (const shortcut of shortcuts) {
        const ctrlMatch =
          !shortcut.ctrl || event.ctrlKey || event.metaKey;
        const shiftMatch = !shortcut.shift || event.shiftKey;
        const altMatch = !shortcut.alt || event.altKey;
        const keyMatch =
          event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

// Default shortcuts for the IDE
export function getIDEShortcuts({
  onRun,
  onSubmit,
  onReset,
  onToggleHints,
}: {
  onRun: () => void;
  onSubmit: () => void;
  onReset: () => void;
  onToggleHints: () => void;
}): Shortcut[] {
  return [
    {
      key: "Enter",
      ctrl: true,
      description: "Run code",
      action: onRun,
    },
    {
      key: "s",
      ctrl: true,
      shift: true,
      description: "Submit solution",
      action: onSubmit,
    },
    {
      key: "r",
      ctrl: true,
      shift: true,
      description: "Reset code",
      action: onReset,
    },
    {
      key: "h",
      ctrl: true,
      description: "Toggle hints",
      action: onToggleHints,
    },
  ];
}

// Keyboard shortcuts help modal
export function KeyboardShortcutsHelp({ shortcuts }: { shortcuts: Shortcut[] }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <span>⌨️</span> Keyboard Shortcuts
      </h3>
      <div className="mt-3 space-y-2">
        {shortcuts.map((shortcut) => (
          <div
            key={shortcut.description}
            className="flex items-center justify-between text-xs"
          >
            <span className="text-zinc-600 dark:text-zinc-400">
              {shortcut.description}
            </span>
            <div className="flex gap-1">
              {shortcut.ctrl && (
                <kbd className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] dark:bg-zinc-800">
                  Ctrl
                </kbd>
              )}
              {shortcut.shift && (
                <kbd className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] dark:bg-zinc-800">
                  Shift
                </kbd>
              )}
              {shortcut.alt && (
                <kbd className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] dark:bg-zinc-800">
                  Alt
                </kbd>
              )}
              <kbd className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] dark:bg-zinc-800">
                {shortcut.key === "Enter" ? "↵" : shortcut.key.toUpperCase()}
              </kbd>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Floating shortcut hint
export function ShortcutHint({
  keys,
  label,
}: {
  keys: string[];
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
      <span className="hidden sm:inline">{label}</span>
      <span className="hidden sm:flex gap-0.5">
        {keys.map((key) => (
          <kbd
            key={key}
            className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[10px] dark:bg-zinc-800"
          >
            {key}
          </kbd>
        ))}
      </span>
    </span>
  );
}
