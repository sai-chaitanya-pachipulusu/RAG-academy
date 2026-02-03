"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { HeaderAuth } from "./HeaderAuth";
import { MobileMenuButton, MobileMenu } from "@/components/navigation/MobileNav";

const NAV_LINKS = [
  { href: "/learn", label: "Learn", icon: "book" },
  { href: "/challenges", label: "Practice", icon: "code" },
  { href: "/stats", label: "Stats", icon: "chart" },
  { href: "/settings", label: "Settings", icon: "cog" },
];

const MOBILE_NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/learn", label: "Learn" },
  { href: "/challenges", label: "Practice" },
  { href: "/stats", label: "Stats" },
  { href: "/progress", label: "Progress" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/settings", label: "Settings" },
];

export function Header() {
  const pathname = usePathname() ?? "/";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-100 bg-white/90 backdrop-blur-xl safe-area-top">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2 sm:gap-3 transition-opacity hover:opacity-80"
        >
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-lg shadow-zinc-200 transition-transform group-hover:scale-105">
            <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" />
              <path d="M2 17L12 22L22 17" />
              <path d="M2 12L12 17L22 12" />
            </svg>
          </div>
          <span className="text-sm font-bold tracking-tight text-zinc-900 hidden sm:inline">RAG Academy</span>
          <span className="text-sm font-bold tracking-tight text-zinc-900 sm:hidden">RAG</span>
        </Link>

        {/* Center Nav - Desktop */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-2xl border border-zinc-100 bg-zinc-50/80 p-1.5 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative rounded-xl px-4 lg:px-5 py-2 text-sm font-medium transition-all ${
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
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:block">
            <HeaderAuth />
          </div>
          <MobileMenuButton 
            isOpen={mobileMenuOpen} 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          />
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
        <nav className="flex flex-col gap-1">
          {MOBILE_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-xl px-4 py-3 text-base font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-zinc-100 text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-4 border-t border-zinc-100 pt-4 sm:hidden">
          <HeaderAuth />
        </div>
      </MobileMenu>
    </header>
  );
}
