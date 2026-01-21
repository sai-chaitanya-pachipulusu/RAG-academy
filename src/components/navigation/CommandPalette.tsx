"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { RAW_CHALLENGES } from "@/lib/challenges/defs/all";

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: "challenge" | "page" | "action";
  href?: string;
  action?: () => void;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  // Build search items from challenges and pages
  const searchItems = useMemo<CommandItem[]>(() => {
    const challenges: CommandItem[] = RAW_CHALLENGES.map((c) => ({
      id: c.slug,
      title: c.title,
      subtitle: c.group,
      category: "challenge" as const,
      href: `/challenges/${c.slug}`,
    }));

    const pages: CommandItem[] = [
      { id: "learn", title: "Learn", subtitle: "10 phases, 103 challenges", category: "page", href: "/learn" },
      { id: "challenges", title: "Practice", subtitle: "Daily challenge & drills", category: "page", href: "/challenges" },
      { id: "resources", title: "Resources", subtitle: "Playbooks & references", category: "page", href: "/resources" },
      { id: "progress", title: "Progress", subtitle: "Stats & achievements", category: "page", href: "/progress" },
      { id: "settings", title: "Settings", subtitle: "Preferences", category: "page", href: "/settings" },
    ];

    return [...pages, ...challenges];
  }, []);

  // Filter items based on query
  const filteredItems = useMemo(() => {
    if (!query) return searchItems.slice(0, 10);
    
    const lowerQuery = query.toLowerCase();
    return searchItems
      .filter((item) => 
        item.title.toLowerCase().includes(lowerQuery) ||
        item.subtitle?.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 10);
  }, [query, searchItems]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems]);

  // Keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Navigate selection with arrow keys
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredItems.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selected = filteredItems[selectedIndex];
        if (selected?.href) {
          router.push(selected.href);
          setIsOpen(false);
          setQuery("");
        } else if (selected?.action) {
          selected.action();
          setIsOpen(false);
          setQuery("");
        }
      }
    },
    [filteredItems, selectedIndex, router]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-white/10 dark:bg-zinc-900">
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-zinc-200 px-4 py-3 dark:border-white/10">
          <svg className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search challenges, pages..."
            className="flex-1 bg-transparent text-sm text-zinc-900 placeholder-zinc-400 outline-none dark:text-zinc-100"
            autoFocus
          />
          <kbd className="rounded border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-500 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-400">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-zinc-500">
              No results found for "{query}"
            </div>
          ) : (
            <div className="space-y-1">
              {filteredItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.href) router.push(item.href);
                    else if (item.action) item.action();
                    setIsOpen(false);
                    setQuery("");
                  }}
                  className={[
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                    index === selectedIndex
                      ? "bg-zinc-100 dark:bg-white/10"
                      : "hover:bg-zinc-50 dark:hover:bg-white/5",
                  ].join(" ")}
                >
                  {/* Category Icon */}
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-sm dark:bg-white/10">
                    {item.category === "challenge" ? "📝" : item.category === "page" ? "📄" : "⚡"}
                  </span>
                  
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {item.title}
                    </p>
                    {item.subtitle && (
                      <p className="truncate text-xs text-zinc-500">
                        {item.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Category Badge */}
                  <span className="flex-shrink-0 rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:bg-white/10 dark:text-zinc-400">
                    {item.category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-2 text-[11px] text-zinc-400 dark:border-white/10">
          <div className="flex items-center gap-2">
            <kbd className="rounded border border-zinc-200 bg-zinc-100 px-1 py-0.5 dark:border-white/10 dark:bg-zinc-800">↑↓</kbd>
            <span>Navigate</span>
            <kbd className="ml-2 rounded border border-zinc-200 bg-zinc-100 px-1 py-0.5 dark:border-white/10 dark:bg-zinc-800">↵</kbd>
            <span>Select</span>
          </div>
          <span>⌘K to toggle</span>
        </div>
      </div>
    </div>
  );
}
