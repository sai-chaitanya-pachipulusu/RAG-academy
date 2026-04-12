"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDevice } from "@/hooks/useDevice";

const MOBILE_NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Home",
    icon: (active: boolean) => (
      <svg
        className={`h-6 w-6 transition-all duration-200-all duration-200 ${active ? "text-gray-900" : "text-gray-400"}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    href: "/challenges",
    label: "Practice",
    icon: (active: boolean) => (
      <svg
        className={`h-6 w-6 transition-all duration-200-all duration-200 ${active ? "text-gray-900" : "text-gray-400"}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
        />
      </svg>
    ),
  },
  {
    href: "/learn",
    label: "Learn",
    icon: (active: boolean) => (
      <svg
        className={`h-6 w-6 transition-all duration-200-all duration-200 ${active ? "text-gray-900" : "text-gray-400"}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
  },
  {
    href: "/stats",
    label: "Progress",
    icon: (active: boolean) => (
      <svg
        className={`h-6 w-6 transition-all duration-200-all duration-200 ${active ? "text-gray-900" : "text-gray-400"}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Profile",
    icon: (active: boolean) => (
      <svg
        className={`h-6 w-6 transition-all duration-200-all duration-200 ${active ? "text-gray-900" : "text-gray-400"}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
];

export function MobileNav() {
  const pathname = usePathname() ?? "/";
  const { isMobile } = useDevice();

  // Only show on mobile devices
  if (!isMobile) return null;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-lg safe-area-pb md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {MOBILE_NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex flex-1 flex-col items-center justify-center gap-1 py-2"
            >
              <div
                className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200-all duration-200 ${
                  active
                    ? "bg-gray-100"
                    : "group-active:bg-[#1D4ED8]50"
                }`}
              >
                {item.icon(active)}
                {active && (
                  <span className="absolute -top-1 h-1 w-1 rounded-full bg-gray-900" />
                )}
              </div>
              <span
                className={`text-[10px] font-medium transition-all duration-200-all duration-200 ${
                  active ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// Mobile hamburger menu for header
export function MobileMenuButton({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition-all duration-200-all duration-200 hover:bg-gray-50 active:bg-[#1D4ED8]100 md:hidden cursor-pointer"
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
    >
      <div className="relative h-5 w-5">
        <span
          className={`absolute left-0 top-1 h-0.5 w-5 rounded-full bg-current transition-all duration-200-all duration-200 ${
            isOpen ? "top-2.5 rotate-45" : ""
          }`}
        />
        <span
          className={`absolute left-0 top-2.5 h-0.5 w-5 rounded-full bg-current transition-all duration-200-all duration-200 ${
            isOpen ? "opacity-0" : ""
          }`}
        />
        <span
          className={`absolute left-0 top-4 h-0.5 w-5 rounded-full bg-current transition-all duration-200-all duration-200 ${
            isOpen ? "top-2.5 -rotate-45" : ""
          }`}
        />
      </div>
    </button>
  );
}

// Mobile menu overlay
export function MobileMenu({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-fade-in md:hidden"
        onClick={onClose}
      />

      {/* Menu panel */}
      <div className="fixed left-4 right-4 top-20 z-50 rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl animate-slide-down md:hidden">
        {children}
      </div>
    </>
  );
}
