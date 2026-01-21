"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

// Map paths to human-readable labels
const PATH_LABELS: Record<string, string> = {
  learn: "Learn",
  challenges: "Challenges",
  compare: "Compare",
  playbooks: "Playbooks",
  settings: "Settings",
  dashboard: "Dashboard",
  analytics: "Analytics",
  progress: "Progress",
  papers: "Papers",
  projects: "Projects",
  events: "Events",
  leaderboard: "Leaderboard",
  pricing: "Pricing",
  contribute: "Contribute",
  resources: "Resources",
  // Phase labels
  "phase-1": "Phase 1: Foundations",
  "phase-2": "Phase 2: Retrieval",
  "phase-3": "Phase 3: Post-Retrieval",
  "phase-4": "Phase 4: Generation",
  "phase-5": "Phase 5: Evaluation",
  "phase-6": "Phase 6: Production",
  "phase-7": "Phase 7: Frontier",
  // Compare subpages
  "vector-dbs": "Vector Databases",
  embeddings: "Embeddings",
  frameworks: "Frameworks",
  reranking: "Reranking",
  retrieval: "Retrieval",
  chunking: "Chunking",
  caching: "Caching",
  security: "Security",
  evaluation: "Evaluation",
};

function formatSlug(slug: string): string {
  // Check if we have a predefined label
  if (PATH_LABELS[slug]) return PATH_LABELS[slug];
  
  // Convert slug to title case
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function Breadcrumbs() {
  const pathname = usePathname();

  const breadcrumbs = useMemo<BreadcrumbItem[]>(() => {
    // Skip if on home page
    if (pathname === "/" || pathname === "") return [];

    const segments = pathname.split("/").filter(Boolean);
    const items: BreadcrumbItem[] = [
      { label: "Home", href: "/" },
    ];

    let currentPath = "";
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;
      
      items.push({
        label: formatSlug(segment),
        href: currentPath,
        current: isLast,
      });
    });

    return items;
  }, [pathname]);

  // Don't show breadcrumbs if we're on home or only have 2 items
  if (breadcrumbs.length < 2) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        {breadcrumbs.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index > 0 && (
              <svg
                className="mx-2 h-4 w-4 text-zinc-300 dark:text-zinc-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
            {item.current ? (
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Compact version for tight spaces
export function BreadcrumbsCompact() {
  const pathname = usePathname();

  const segments = useMemo(() => {
    if (pathname === "/" || pathname === "") return [];
    return pathname.split("/").filter(Boolean);
  }, [pathname]);

  if (segments.length < 2) return null;

  const parentSegment = segments[segments.length - 2];
  const currentSegment = segments[segments.length - 1];
  const parentPath = "/" + segments.slice(0, -1).join("/");

  return (
    <div className="flex items-center gap-2 text-sm">
      <Link
        href={parentPath}
        className="flex items-center gap-1 text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        {formatSlug(parentSegment)}
      </Link>
      <span className="text-zinc-300 dark:text-zinc-700">/</span>
      <span className="font-medium text-zinc-900 dark:text-zinc-100">
        {formatSlug(currentSegment)}
      </span>
    </div>
  );
}
