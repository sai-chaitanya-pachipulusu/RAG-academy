"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";
import { getPlatformStats } from "@/lib/challenges/catalog";

// Get platform stats at module level for consistent display
const platformStats = getPlatformStats();

function LoginContent() {
  const { signIn, signUp, user, loading: authLoading } = useSupabaseAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectTo = searchParams.get("redirect") || "/learn";

  useEffect(() => {
    if (user && !authLoading) {
      router.push(redirectTo);
    }
  }, [user, authLoading, redirectTo, router]);

if (authLoading || (user && !authLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-black/10 border-t-black" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const result = await signUp(email, password);
        if (result.error) {
          setError(result.error);
        } else {
          setSuccess("Check your email to confirm your account, then sign in.");
          setIsSignUp(false);
        }
      } else {
        const result = await signIn(email, password);
        if (result.error) {
          setError(result.error);
        } else {
          window.location.href = redirectTo;
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

return (
    <div className="flex min-h-screen bg-white">
      {/* Left Side - Branding */}
      <div className="hidden w-1/2 flex-col justify-between bg-black p-12 text-white lg:flex">
        <Link href="/" className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-black shadow-2xl">
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" />
              <path d="M2 17L12 22L22 17" />
              <path d="M2 12L12 17L22 12" />
            </svg>
          </div>
          <span className="text-2xl font-light tracking-tight">RAG Academy</span>
        </Link>

        <div className="space-y-16">
          <div className="space-y-8">
            <h2 className="text-6xl font-bold tracking-tight lg:text-7xl">
              Master production<br />RAG systems.
            </h2>
            <p className="text-xl text-white/70 font-light leading-relaxed">
              Interactive labs, decision playbooks, and code-first challenges designed for engineers.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-12">
            {[
              { value: `${platformStats.totalLessons}`, label: "Lessons" },
              { value: `${platformStats.totalChallenges}+`, label: "Challenges" },
              { value: "Free", label: "To Start" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-5xl font-bold">{stat.value}</p>
                <p className="text-sm text-white/50 font-light">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-white/40 font-light">
          © 2025 RAG Academy. Built for engineers.
        </p>
      </div>

      {/* Right Side - Form */}
      <div className="flex flex-1 flex-col items-center justify-center px-12 py-20">
        <div className="w-full max-w-sm">
{/* Mobile Logo */}
          <Link href="/" className="mb-16 flex items-center justify-center gap-4 lg:hidden">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white shadow-2xl">
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                <path d="M2 17L12 22L22 17" />
                <path d="M2 12L12 17L22 12" />
              </svg>
            </div>
            <span className="text-2xl font-light tracking-tight text-black">RAG Academy</span>
          </Link>

          {/* Header */}
          <div className="mb-16 text-center lg:text-left">
            <h1 className="text-5xl font-bold tracking-tight text-black">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h1>
            <p className="mt-4 text-xl text-black/60 font-light">
              {isSignUp ? "Start your RAG engineering journey" : "Sign in to continue learning"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <label htmlFor="email" className="text-lg font-light text-black">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full rounded-2xl border border-black/10 bg-white px-6 py-5 text-lg outline-none transition-all duration-200-all duration-200 focus:border-black/30 focus:bg-black/[0.02] shadow-sm cursor-pointer"
                placeholder="you@company.com"
              />
            </div>

            <div className="space-y-4">
              <label htmlFor="password" className="text-lg font-light text-black">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="block w-full rounded-2xl border border-black/10 bg-white px-6 py-5 text-lg outline-none transition-all duration-200-all duration-200 focus:border-black/30 focus:bg-black/[0.02] shadow-sm cursor-pointer"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading || authLoading}
              className="flex w-full items-center justify-center gap-4 rounded-2xl bg-black py-6 text-lg font-medium text-white transition-all duration-200-all duration-200 hover:bg-black/90 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              ) : (
                isSignUp ? "Create account" : "Sign in"
              )}
            </button>
          </form>

          {/* Messages */}
          {error && (
            <div className="mt-10 flex items-center gap-4 rounded-2xl border border-black/10 bg-black/[0.02] p-6 text-sm text-black/70 shadow-sm">
              <svg className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div className="mt-10 flex items-center gap-4 rounded-2xl border border-black/10 bg-black/[0.02] p-6 text-sm text-black/70 shadow-sm">
              <svg className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {success}
            </div>
          )}

          {/* Toggle */}
          <div className="mt-16 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setSuccess(null);
              }}
              className="text-lg text-black/50 hover:text-black transition-all duration-200-all duration-200 font-light cursor-pointer"
            >
              {isSignUp ? (
                <>Already have an account? <span className="font-medium text-black underline underline-offset-4">Sign in</span></>
              ) : (
                <>Don&apos;t have an account? <span className="font-medium text-black underline underline-offset-4">Sign up</span></>
              )}
            </button>
          </div>

          {/* Footer */}
          <p className="mt-20 text-center text-sm text-black/40 font-light">
            Secure authentication by <span className="font-medium text-black/60">Supabase</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function LoginLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-black/10 border-t-black" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginContent />
    </Suspense>
  );
}
