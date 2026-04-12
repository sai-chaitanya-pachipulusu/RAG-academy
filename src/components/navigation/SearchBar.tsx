"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { RAW_CHALLENGES } from "@/lib/challenges/defs/all";

interface SearchResult {
  id: string;
  type: "challenge" | "lesson" | "playbook" | "page";
  title: string;
  subtitle?: string;
  href: string;
  icon: string;
}

const STATIC_PAGES: SearchResult[] = [
  { id: "learn", type: "page", title: "Learn", subtitle: "Curriculum & lessons", href: "/learn", icon: "📚" },
  { id: "challenges", type: "page", title: "Challenges", subtitle: "Practice & compete", href: "/challenges", icon: "🏋️" },
  { id: "compare", type: "page", title: "Compare", subtitle: "Tool comparisons", href: "/compare", icon: "⚖️" },
  { id: "playbooks", type: "page", title: "Playbooks", subtitle: "Decision guides", href: "/playbooks", icon: "📖" },
  { id: "papers", type: "page", title: "Research Papers", subtitle: "Academic references", href: "/papers", icon: "📄" },
  { id: "progress", type: "page", title: "Progress", subtitle: "Your stats", href: "/progress", icon: "📊" },
  { id: "settings", type: "page", title: "Settings", subtitle: "Preferences", href: "/settings", icon: "⚙️" },
  { id: "leaderboard", type: "page", title: "Leaderboard", subtitle: "Rankings", href: "/leaderboard", icon: "🏆" },
];

interface SearchBarProps {
  variant?: "header" | "inline" | "floating";
  placeholder?: string;
}

export function SearchBar({ variant = "header", placeholder = "Search..." }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Build search index
  const searchIndex = useMemo<SearchResult[]>(() => {
    const challenges: SearchResult[] = RAW_CHALLENGES.map((c) => ({
      id: c.slug,
      type: "challenge",
      title: c.title,
      subtitle: c.group,
      href: `/challenges/${c.slug}`,
      icon: c.difficulty === "hard" ? "🔥" : c.difficulty === "medium" ? "💪" : "🌱",
    }));

    return [...STATIC_PAGES, ...challenges];
  }, []);

  // Filter results
  const results = useMemo(() => {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    return searchIndex
      .filter(
        (item) =>
          item.title.toLowerCase().includes(lowerQuery) ||
          item.subtitle?.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 8);
  }, [query, searchIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global shortcut to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      // Escape to close
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      router.push(results[selectedIndex].href);
      setIsOpen(false);
      setQuery("");
    }
  };

  const baseInputClasses = "w-full rounded-xl border bg-white text-sm outline-none transition-all duration-200-all duration-200 dark:bg-gray-900";
  const variantClasses = {
    header: "border-gray-200 px-4 py-2 focus:border-[#8B5CF6]400 dark:border-gray-800 dark:focus:border-[#8B5CF6]600",
    inline: "border-gray-200 px-4 py-3 focus:border-[#8B5CF6]400 focus:ring-4 focus:ring-[#8B5CF6]100 dark:border-gray-800",
    floating: "border-gray-200 px-4 py-3 shadow-lg focus:border-[#8B5CF6]400 focus:ring-4 focus:ring-[#8B5CF6]100 dark:border-gray-800",
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Input */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`${baseInputClasses} ${variantClasses[variant]} pl-10 pr-16`}
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-400 dark:border-gray-700 dark:bg-[#7C3AED]">
          ⌘K
        </kbd>
      </div>

      {/* Results dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
          {results.map((result, index) => (
            <button
              key={result.id}
              onClick={() => {
                router.push(result.href);
                setIsOpen(false);
                setQuery("");
              }}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-all duration-200-all duration-200 ${
                index === selectedIndex
                  ? "bg-gray-100 dark:bg-[#7C3AED]"
                  : "hover:bg-gray-50 dark:hover:bg-[#7C3AED]/50"
              }`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm dark:bg-[#7C3AED]">
                {result.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                  {result.title}
                </p>
                {result.subtitle && (
                  <p className="truncate text-xs text-gray-500">{result.subtitle}</p>
                )}
              </div>
              <span className="shrink-0 rounded bg-gray-100 px-2 py-0.5 text-[10px] uppercase text-gray-500 dark:bg-[#7C3AED]">
                {result.type}
              </span>
            </button>
          ))}
          
          {/* Footer hint */}
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2 text-[10px] text-gray-400 dark:border-gray-800">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
        </div>
      )}

      {/* No results message */}
      {isOpen && query.trim() && results.length === 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-gray-200 bg-white p-6 text-center shadow-xl dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-500">No results for "{query}"</p>
          <p className="mt-1 text-xs text-gray-400">Try a different search term</p>
        </div>
      )}
    </div>
  );
}

// Compact search button that opens the full search
export function SearchButton() {
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <button
        onClick={() => setShowSearch(true)}
        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 transition-all duration-200-all duration-200 hover:border-gray-300 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 cursor-pointer"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] sm:inline dark:border-gray-700 dark:bg-[#7C3AED]">
          ⌘K
        </kbd>
      </button>

      {/* Modal overlay */}
      {showSearch && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSearch(false)}
          />
          <div className="relative w-full max-w-lg px-4">
            <SearchBar variant="floating" placeholder="Search challenges, lessons, playbooks..." />
          </div>
        </div>
      )}
    </>
  );
}
