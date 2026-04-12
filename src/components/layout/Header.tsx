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
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border-subtle)] bg-white/80 backdrop-blur-xl safe-area-top">
      <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 transition-all duration-200-opacity hover:opacity-80 cursor-pointer"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--foreground)] text-white shadow-sm transition-all duration-200-transform duration-200 group-hover:scale-105 cursor-pointer">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" />
              <path d="M2 17L12 22L22 17" />
              <path d="M2 12L12 17L22 12" />
            </svg>
          </div>
          <span className="text-[17px] font-semibold tracking-tight text-[var(--foreground)] hidden sm:inline">RAG Academy</span>
        </Link>

        {/* Center Nav - Desktop */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-0.5 rounded-full bg-[var(--gray-50)] p-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative rounded-full px-4 py-1.5 text-[15px] font-medium transition-all duration-200-all duration-200 ${
                isActive(link.href)
                  ? "bg-white text-[var(--foreground)] shadow-sm"
                  : "text-[var(--gray-400)] hover:text-[var(--foreground)]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-2 sm:gap-3">
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
        <nav className="flex flex-col gap-0.5">
          {MOBILE_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-lg px-4 py-3 text-[17px] font-medium transition-all duration-200-all duration-200 ${
                isActive(link.href)
                  ? "bg-[var(--gray-100)] text-[var(--foreground)]"
                  : "text-[var(--gray-500)] hover:bg-[var(--gray-50)]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-4 border-t border-gray-100 pt-4 sm:hidden">
          <HeaderAuth />
        </div>
      </MobileMenu>
    </header>
  );
}
