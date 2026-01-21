"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";

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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
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
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Left Side - Branding */}
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-slate-900 to-slate-800 p-12 text-white lg:flex">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-xl">
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" />
              <path d="M2 17L12 22L22 17" />
              <path d="M2 12L12 17L22 12" />
            </svg>
          </div>
          <span className="text-xl font-bold">RAG Academy</span>
        </Link>

        <div className="space-y-12">
          <div className="space-y-6">
            <h2 className="text-5xl font-bold tracking-tight lg:text-6xl">
              Master production<br />RAG systems.
            </h2>
            <p className="text-xl text-slate-300 leading-relaxed">
              Interactive labs, decision playbooks, and code-first challenges designed for engineers.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8">
            {[
              { value: "50+", label: "Challenges" },
              { value: "12", label: "Modules" },
              { value: "Free", label: "Access" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl font-bold">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-slate-400">
          © 2025 RAG Academy. Built for engineers.
        </p>
      </div>

      {/* Right Side - Form */}
      <div className="flex flex-1 flex-col items-center justify-center px-8 py-16">
        <div className="w-full max-w-md">
{/* Mobile Logo */}
          <Link href="/" className="mb-12 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-xl">
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                <path d="M2 17L12 22L22 17" />
                <path d="M2 12L12 17L22 12" />
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-900">RAG Academy</span>
          </Link>

          {/* Header */}
          <div className="mb-12 text-center lg:text-left">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h1>
            <p className="mt-3 text-lg text-slate-600">
              {isSignUp ? "Start your RAG engineering journey" : "Sign in to continue learning"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label htmlFor="email" className="text-base font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full rounded-2xl border border-slate-200/50 bg-white/80 backdrop-blur px-5 py-4 text-base outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 shadow-sm"
                placeholder="you@company.com"
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="password" className="text-base font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="block w-full rounded-2xl border border-slate-200/50 bg-white/80 backdrop-blur px-5 py-4 text-base outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 shadow-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading || authLoading}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 py-4 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              ) : (
                isSignUp ? "Create account" : "Sign in"
              )}
            </button>
          </form>

          {/* Messages */}
          {error && (
            <div className="mt-8 flex items-center gap-4 rounded-2xl border border-red-100 bg-red-50/80 backdrop-blur p-5 text-sm text-red-600 shadow-sm">
              <svg className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div className="mt-8 flex items-center gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/80 backdrop-blur p-5 text-sm text-emerald-600 shadow-sm">
              <svg className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {success}
            </div>
          )}

          {/* Toggle */}
          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setSuccess(null);
              }}
              className="text-base text-slate-500 hover:text-slate-900 transition-colors"
            >
              {isSignUp ? (
                <>Already have an account? <span className="font-semibold text-slate-900 underline underline-offset-4">Sign in</span></>
              ) : (
                <>Don&apos;t have an account? <span className="font-semibold text-slate-900 underline underline-offset-4">Sign up</span></>
              )}
            </button>
          </div>

          {/* Footer */}
          <p className="mt-16 text-center text-sm text-slate-400">
            Secure authentication by <span className="font-medium text-slate-600">Supabase</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function LoginLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
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
