import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold tracking-tight text-zinc-900">
              RAG Academy
            </span>
            <span className="text-xs text-zinc-500">
              by practitioners, for practitioners
            </span>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <Link
              href="/learn"
              className="text-zinc-600 hover:text-zinc-900"
            >
              Learn
            </Link>
            <Link
              href="/challenges"
              className="text-zinc-600 hover:text-zinc-900"
            >
              Challenges
            </Link>
            <Link
              href="/playbooks"
              className="text-zinc-600 hover:text-zinc-900"
            >
              Playbooks
            </Link>
            <Link
              href="/papers"
              className="text-zinc-600 hover:text-zinc-900"
            >
              Papers
            </Link>
            <span className="hidden sm:inline text-zinc-300">|</span>
            <Link
              href="/terms"
              className="text-zinc-500 hover:text-zinc-700"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="text-zinc-500 hover:text-zinc-700"
            >
              Privacy Policy
            </Link>
          </nav>
        </div>

        {/* Copyright */}
        <div className="mt-6 border-t border-zinc-200 pt-6 text-center text-xs text-zinc-500">
          <p>
            &copy; {currentYear} RAG Academy. All rights reserved.
          </p>
          <p className="mt-1">
            Built with research-backed content from{" "}
            <Link href="/papers" className="underline hover:text-zinc-700">
              80+ academic papers
            </Link>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
