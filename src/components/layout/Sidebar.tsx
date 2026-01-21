"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/learn", label: "Learn", desc: "43 lessons & 19 playbooks" },
  { href: "/challenges", label: "Practice", desc: "250+ challenges" },
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
    <aside className="hidden w-52 shrink-0 lg:block">
      <nav className="sticky top-20 space-y-1">
        {NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
                active
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
              }`}
            >
              <div>
                <span className="text-sm font-medium">{item.label}</span>
                <p className={`text-xs ${active ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-400"}`}>
                  {item.desc}
                </p>
              </div>
            </Link>
          );
        })}

        <div className="my-4 border-t border-zinc-200 dark:border-zinc-800" />

        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        >
          <span>⚙️</span>
          <span>Settings</span>
        </Link>
      </nav>
    </aside>
  );
}
