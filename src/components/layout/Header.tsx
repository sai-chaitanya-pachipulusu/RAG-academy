"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeaderAuth } from "./HeaderAuth";

const NAV_LINKS = [
  { href: "/learn", label: "Learn", icon: "book" },
  { href: "/challenges", label: "Practice", icon: "code" },
  { href: "/settings", label: "Settings", icon: "cog" },
];

export function Header() {
  const pathname = usePathname() ?? "/";

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-100 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-lg shadow-zinc-200 transition-transform group-hover:scale-105">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" />
              <path d="M2 17L12 22L22 17" />
              <path d="M2 12L12 17L22 12" />
            </svg>
          </div>
          <span className="text-sm font-bold tracking-tight text-zinc-900">RAG Academy</span>
        </Link>

        {/* Center Nav */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-2xl border border-zinc-100 bg-zinc-50/80 p-1.5 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative rounded-xl px-5 py-2 text-sm font-medium transition-all ${
                isActive(link.href)
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          <HeaderAuth />
        </div>
      </div>
    </header>
  );
}
