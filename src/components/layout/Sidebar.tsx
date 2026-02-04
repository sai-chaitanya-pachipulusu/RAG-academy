"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getPlatformStats } from "@/lib/challenges/catalog";

// Get dynamic stats at module level
const platformStats = getPlatformStats();

const NAV = [
  { href: "/learn", label: "Learn", desc: "Lessons & playbooks" },
  { href: "/challenges", label: "Practice", desc: `${platformStats.totalChallenges}+ challenges` },
  { href: "/stats", label: "My Stats", desc: "Performance analytics" },
  { href: "/leaderboard", label: "Leaderboard", desc: "Top performers" },
  { href: "/compare", label: "Compare", desc: "Tools & techniques" },
  { href: "/projects", label: "Projects", desc: "Templates & tracks" },
  { href: "/events", label: "Events", desc: "Weekly challenges" },
  { href: "/contribute", label: "Contribute", desc: "Help build RAG Academy" },
];


export function Sidebar() {
  const pathname = usePathname() ?? "/";

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside className="hidden w-56 shrink-0 lg:block">
      <nav className="sticky top-20 space-y-0.5">
        {NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 ${
                active
                  ? "bg-[var(--gray-100)] text-[var(--foreground)]"
                  : "text-[var(--gray-400)] hover:bg-[var(--gray-50)] hover:text-[var(--foreground)]"
              }`}
            >
              <div className="flex-1 min-w-0">
                <span className="block text-[15px] font-medium leading-tight">{item.label}</span>
                <p className={`mt-0.5 text-[13px] leading-tight ${active ? "text-[var(--gray-400)]" : "text-[var(--gray-300)]"}`}>
                  {item.desc}
                </p>
              </div>
            </Link>
          );
        })}

        <div className="my-3 border-t border-[var(--border-subtle)]" />

        <Link
          href="/settings"
          className="group flex items-center gap-3 rounded-lg px-3 py-2 text-[15px] text-[var(--gray-400)] transition-all duration-200 hover:bg-[var(--gray-50)] hover:text-[var(--foreground)]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Settings</span>
        </Link>
      </nav>
    </aside>
  );
}
