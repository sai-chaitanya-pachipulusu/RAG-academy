"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { Challenge } from "@/lib/challenges/catalog";
import type { LocalProgressState } from "@/lib/progress/localStore";
import { pyodideExec } from "@/lib/pyodide/executor";
import { typescriptExec } from "@/lib/typescript/executor";
import { RetrievalVisualizer } from "./visualizers/RetrievalVisualizer";
import { Leaderboard } from "./arena/Leaderboard";
import { LearnMoreSection } from "@/components/resources/LearnMore";
import { AICodeReview, CodeReviewButton, InlineCodeReview } from "./AICodeReview";
import { InterviewTimer, InterviewModeToggle, getInterviewDuration } from "./InterviewTimer";
import { TheoryTab, CHALLENGE_THEORY } from "./TheoryTab";
import { MicroTaskView, MicroTaskToggle } from "./MicroTaskView";
import { SubmissionHistory } from "./SubmissionHistory";
import { getMicroTasks } from "@/lib/challenges/microTasks";
import { CodeEditor } from "./CodeEditor";
import { useLocalProgress } from "@/components/providers/LocalProgressProvider";
import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";
import { submitChallengeResult } from "@/lib/supabase/arena";
import { Card, CardLink } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { isChallengeFree } from "@/lib/challenges/access";
import { ChallengePaywall } from "./ChallengePaywall";
import {
  markChallengeAttempt,
  markChallengeCompleted,
  resetChallenge,
  upsertChallengeCode,
} from "@/lib/progress/localStore";
import { upsertChallengeProgressFromLocal, upsertProfileFromLocal } from "@/lib/supabase/progress";
import { deepClone } from "@/lib/utils/deepClone";
import { CURRICULUM_STAGE_LABELS } from "@/lib/curriculum/stages";
import { isPythonTraceback, formatTestFailure, parsePythonError, formatErrorForDisplay } from "@/lib/pyodide/errorParser";
import { isTypeScriptError, formatTypeScriptTestFailure, parseTypeScriptError, formatTypeScriptErrorForDisplay } from "@/lib/typescript/errorParser"; 
import { saveSubmission } from "@/lib/supabase/submissions";
import { useToast } from "@/components/ui/Toast";
import type { CodeReviewFeedback } from "@/lib/ai/types";
import { loadReviewPreferences } from "@/lib/ai/client";
import { useDevice } from "@/hooks/useDevice";
import { MobileIDE } from "./MobileIDE";
import { TouchButton } from "@/components/ui/TouchButton";

type Neighbor = Pick<Challenge, "slug" | "title" | "group">;

function cleanGroupLabel(group: string) {
  return group
    .replace(/^Phase\s+\d+\s+—\s+/i, "")
    .replace(/^Production\s+RAG\s+Labs\s+—\s+/i, "")
    .trim();
}

type Props = {
  challenge: Challenge;
  children?: React.ReactNode;
  prev?: Neighbor | null;
  next?: Neighbor | null;
};

export function ChallengeIDE({ challenge, children, prev, next }: Props) {
  const { state, setState } = useLocalProgress();
  const { user, hasPaidAccess, subscriptionLoading } = useSupabaseAuth();
  const { addToast } = useToast();

  // Access control: check if user can access this challenge
  const isFree = isChallengeFree(challenge);

  const savedCode = state.challenges[challenge.slug]?.userCode ?? null;
  const initial = useMemo(
    () => savedCode ?? challenge.starterCode,
    [savedCode, challenge.starterCode]
  );

  const [code, setCode] = useState(initial);
  const [revealedHints, setRevealedHints] = useState(0);
  const [running, setRunning] = useState<"run" | "test" | "submit" | null>(
    null
  );
  const [showAIReview, setShowAIReview] = useState(false);
  const [microTaskMode, setMicroTaskMode] = useState(false);
  const [inlineReview, setInlineReview] = useState<CodeReviewFeedback | null>(null);
  const [showInlineReview, setShowInlineReview] = useState(false);

  const [stdout, setStdout] = useState("");
  const [stderr, setStderr] = useState("");
  const [meta, setMeta] = useState<{
    durationMs?: number;
    score?: number | null;
    metrics?: Record<string, number | string> | null;
    visuals?: any;
  } | null>(null);

  const progress = state.challenges[challenge.slug];
  const status = progress?.status ?? "not_started";
  const completed = status === "completed";

  // Check if challenge has micro-tasks
  const hasMicroTasks = getMicroTasks(challenge.slug) !== null;
  // Check if challenge has theory content
  const theoryContent = CHALLENGE_THEORY[challenge.slug];

  // Detect if this is a TypeScript challenge
  const isTypeScript = challenge.slug.startsWith("ts-");
  const executor = isTypeScript ? typescriptExec : pyodideExec;
  
  // Show loading while checking subscription
  if (!isFree && subscriptionLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900" />
      </div>
    );
  }
  
  // Show paywall for paid challenges if user doesn't have access
  if (!isFree && !hasPaidAccess) {
    return <ChallengePaywall challenge={challenge} isLoggedIn={!!user} />;
  }

  useEffect(() => {
    // If there IS saved code (e.g. from a previous session), hydrate editor once.
    if (savedCode === null) return;
    setCode((prev: string) =>
      prev === challenge.starterCode ? savedCode : prev
    );
  }, [savedCode, challenge.starterCode]);

  // Check for reverted code from submission history
  useEffect(() => {
    const revertKey = `challenge_${challenge.slug}_revert_code`;
    const revertedCode = localStorage.getItem(revertKey);
    if (revertedCode) {
      setCode(revertedCode);
      localStorage.removeItem(revertKey);
      addToast("Previous submission code loaded", "success");
    }
  }, [challenge.slug, addToast]);

  // Persist code in local progress (debounced).
  useEffect(() => {
    const t = setTimeout(() => {
      setState((prev: LocalProgressState) => {
        const next = {
          ...prev,
          challenges: { ...prev.challenges },
        };

        const existing = prev.challenges[challenge.slug];
        if (existing) next.challenges[challenge.slug] = { ...existing };

        upsertChallengeCode(next, challenge.slug, code, challenge.starterCode);
        return next;
      });
    }, 400);

    return () => clearTimeout(t);
  }, [challenge.slug, challenge.starterCode, code, setState]);

  async function run(mode: "run" | "test") {
    setRunning(mode);
    setStdout("");
    setStderr("");
    setMeta(null);

    try {
      const result =
        mode === "run"
          ? await executor.run(code)
          : await executor.test(code, challenge.testCode, challenge.dataset);

      setStdout(result.stdout);
      setStderr(result.stderr || (result.error ? result.error : ""));
      setMeta({
        durationMs: result.durationMs,
        score: result.score,
        metrics: result.metrics,
        visuals: (result as any).visuals,
      });
    } catch (err) {
      setStderr(err instanceof Error ? err.message : String(err));
    } finally {
      setRunning(null);
    }
  }

  async function submit() {
    if (completed) return;

    setRunning("submit");
    setStdout("");
    setStderr("");
    setMeta(null);

    setState((prev: LocalProgressState) => {
      const next = { ...prev, challenges: { ...prev.challenges } };
      const existing = prev.challenges[challenge.slug];
      if (existing) next.challenges[challenge.slug] = { ...existing };
      markChallengeAttempt(next, challenge.slug);
      upsertChallengeCode(next, challenge.slug, code, challenge.starterCode);
      return next;
    });

    try {
      const result = await executor.test(code, challenge.testCode, challenge.dataset);
      setStdout(result.stdout);
      setStderr(result.stderr || (result.error ? result.error : ""));
      setMeta({
        durationMs: result.durationMs,
        score: result.score,
        metrics: result.metrics,
        visuals: (result as any).visuals,
      });

      // Save EVERY submission attempt to history (like LeetCode)
      if (user) {
        const errorInfo = result.stderr || result.error;
        const parsedError = errorInfo && isPythonTraceback(errorInfo) 
          ? parsePythonError(errorInfo) 
          : null;
        
        saveSubmission(user.id, challenge.slug, {
          code,
          language: isTypeScript ? "typescript" : "python",
          passed: result.ok,
          executionTimeMs: result.durationMs,
          score: result.score ?? undefined,
          errorMessage: errorInfo || undefined,
          errorType: parsedError?.type || undefined,
          metrics: result.metrics || undefined,
        }).catch(e => console.warn("Failed to save submission history:", e));
      }

      if (result.ok) {
        setState((prev: LocalProgressState) => {
          const next = { ...prev, challenges: { ...prev.challenges } };
          const existing = prev.challenges[challenge.slug];
          if (existing) next.challenges[challenge.slug] = { ...existing };
          markChallengeCompleted(next, challenge.slug, challenge.xpReward);
          return next;
        });

        // Best-effort Supabase sync (only on successful submit).
        if (user) {
          try {
            // Recompute the same state transition on a clone of the *pre-submit* render state
            // (so attempts/xp/streak are consistent for the remote write).
            const syncState = deepClone(state);
            markChallengeAttempt(syncState, challenge.slug);
            upsertChallengeCode(syncState, challenge.slug, code, challenge.starterCode);
            markChallengeCompleted(syncState, challenge.slug, challenge.xpReward);

            await upsertProfileFromLocal(user.id, syncState);
            await upsertChallengeProgressFromLocal(user.id, challenge.slug, syncState);

            // Arena Submission
            if (result.score != null && result.score > 0) {
              await submitChallengeResult(
                user.id, 
                challenge.slug, 
                result.score, 
                result.metrics || {}, 
                code
              );
            }
          } catch (e) {
            console.warn("Supabase sync failed:", e);
          }
        }
      }
    } catch (err) {
      setStderr(err instanceof Error ? err.message : String(err));
    } finally {
      setRunning(null);
    }
  }

  const { isMobile } = useDevice();

  // Render mobile-optimized IDE on mobile devices
  if (isMobile) {
    return (
      <MobileIDE
        challenge={challenge}
        code={code}
        onCodeChange={setCode}
        onRun={() => run("run")}
        onSubmit={submit}
        onReset={() => {
          if (confirm("Are you sure you want to reset your code to the starter template? This cannot be undone.")) {
            setCode(challenge.starterCode);
            setStdout("");
            setStderr("");
            setMeta(null);
            setState((prev: LocalProgressState) => {
              const next = { ...prev, challenges: { ...prev.challenges } };
              const existing = prev.challenges[challenge.slug];
              if (existing) next.challenges[challenge.slug] = { ...existing };
              resetChallenge(next, challenge.slug);
              return next;
            });
          }
        }}
        running={running !== null}
        stdout={stdout}
        stderr={stderr}
        meta={meta}
      >
        {children}
      </MobileIDE>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1.5">
        <div>
          <Link
            href="/challenges"
            className="text-xs font-medium text-zinc-950 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-500 dark:text-zinc-50 dark:decoration-white/25 dark:hover:decoration-white/50"
          >
            Challenges →
          </Link>
          <span className="px-2 text-xs text-zinc-400">/</span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {cleanGroupLabel(challenge.group)}
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {challenge.title}
          </h1>
          <div className="flex items-center gap-2">
            <Badge variant="muted">{CURRICULUM_STAGE_LABELS[challenge.stage]}</Badge>
            {challenge.benchmark && (
              <Badge variant="accent" className="border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300">
                Benchmark
              </Badge>
            )}
            <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
              {challenge.difficulty} · {challenge.xpReward} XP
            </span>
            {completed ? (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                Completed
              </span>
            ) : null}
          </div>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {challenge.description}
        </p>

        {/* Real-World Context - LeetCode Differentiator */}
        {(challenge.realWorld || challenge.complexity) && (
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {challenge.complexity && (
              <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Complexity</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  <code className="rounded bg-zinc-200/80 px-1.5 py-0.5 text-xs font-medium text-zinc-800">
                    Time: {challenge.complexity.time}
                  </code>
                  <code className="rounded bg-zinc-200/80 px-1.5 py-0.5 text-xs font-medium text-zinc-800">
                    Space: {challenge.complexity.space}
                  </code>
                </div>
                {challenge.complexity.latency && (
                  <p className="mt-1.5 text-[11px] text-zinc-500">⚡ {challenge.complexity.latency}</p>
                )}
              </div>
            )}

            {challenge.realWorld?.companies && challenge.realWorld.companies.length > 0 && (
              <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Used By</p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {challenge.realWorld.companies.map((company) => (
                    <span
                      key={company}
                      className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-800"
                    >
                      {company}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {challenge.realWorld?.useCases && challenge.realWorld.useCases.length > 0 && (
              <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Use Cases</p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {challenge.realWorld.useCases.map((useCase) => (
                    <span
                      key={useCase}
                      className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-800"
                    >
                      {useCase}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {challenge.realWorld?.description && (
          <div className="mt-2 rounded-lg border border-amber-200/50 bg-amber-50/50 p-2.5">
            <p className="text-xs font-medium text-amber-800">🏭 In Production</p>
            <p className="mt-1 text-xs text-amber-700">
              {challenge.realWorld.description}
            </p>
          </div>
        )}
      </header>

      {children ? (
        <section className="rounded-2xl border border-zinc-200 bg-white p-5">
          {children}
        </section>
      ) : null}

      {/* Theory Tab - TensorTonic-inspired */}
      {theoryContent && (
        <TheoryTab
          challengeSlug={challenge.slug}
          conceptTitle={theoryContent.title}
          content={theoryContent.content}
        />
      )}

      {/* Micro-Task Mode Toggle */}
      {hasMicroTasks && microTaskMode && (
        <MicroTaskView
          challengeSlug={challenge.slug}
          onAllComplete={() => setMicroTaskMode(false)}
        />
      )}

      <section className="grid gap-3 lg:grid-cols-12">
        <div className="flex flex-col gap-2 lg:col-span-9">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium">Editor (Python)</p>
            <div className="flex items-center gap-2">
              {/* Micro-Task Mode Toggle Button */}
              <MicroTaskToggle
                hasMicroTasks={hasMicroTasks}
                isEnabled={microTaskMode}
                onToggleAction={() => setMicroTaskMode(!microTaskMode)}
              />
              {/* AI Code Review Button */}
              <CodeReviewButton onClick={() => setShowAIReview(true)} />
              
              <button
                type="button"
                onClick={() => run("test")}
                disabled={running !== null}
                className="inline-flex h-9 items-center justify-center rounded-full bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 shadow-sm transition-all"
              >
                {running === "test" ? (
                  <>
                    <span className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                    Running...
                  </>
                ) : (
                  <>
                    <span className="mr-2">▶</span> Run Code
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={submit}
                disabled={running !== null || completed}
                className="inline-flex h-9 items-center justify-center rounded-full bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60 shadow-sm transition-all"
              >
                {running === "submit" ? "Submitting…" : "Submit"}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  if (confirm("Are you sure you want to reset your code to the starter template? This cannot be undone.")) {
                    setCode(challenge.starterCode);
                    setStdout("");
                    setStderr("");
                    setMeta(null);
                    setState((prev: LocalProgressState) => {
                      const next = { ...prev, challenges: { ...prev.challenges } };
                      const existing = prev.challenges[challenge.slug];
                      if (existing) next.challenges[challenge.slug] = { ...existing };
                      resetChallenge(next, challenge.slug);
                      return next;
                    });
                  }
                }}
                disabled={running !== null}
                className="inline-flex h-9 items-center justify-center rounded-full border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-60 transition-all"
              >
                Reset
              </button>
            </div>
          </div>

          <CodeEditor value={code} onChange={setCode} />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Status: {status.replace("_", " ")}
            {typeof progress?.attempts === "number" && progress.attempts > 0
              ? ` · attempts: ${progress.attempts}`
              : ""}
          </p>
        </div>

        <div className="flex flex-col gap-2 lg:col-span-3">
          {/* Inline AI Review */}
          {showInlineReview && inlineReview && (
            <InlineCodeReview
              feedback={inlineReview}
              onDismiss={() => setShowInlineReview(false)}
            />
          )}

          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Output</p>
            {meta?.durationMs !== undefined ? (
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {meta.durationMs}ms
              </span>
            ) : null}
          </div>


          {meta?.score != null && (
            <div className="mb-2 rounded-xl border border-indigo-100 bg-indigo-50 p-3 dark:border-indigo-900/50 dark:bg-indigo-950/30">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-indigo-900 dark:text-indigo-100">
                  Efficiency Score: {meta.score > 100 ? 100 : meta.score}
                </span>
                {meta.metrics && (
                   <div className="flex gap-3 text-xs text-indigo-700 dark:text-indigo-300">
                     {Object.entries(meta.metrics).map(([k, v]) => (
                        <span key={k} className="font-mono">{k}: {v}</span>
                     ))}
                   </div>
                )}
              </div>
            </div>
          )}

          {meta?.visuals && (
             <div className="mb-2 rounded-xl border border-blue-100 bg-blue-50 p-3 dark:border-blue-900/50 dark:bg-blue-950/30 overflow-auto max-h-[400px]">
                <span className="mb-2 block text-xs font-semibold text-blue-800 dark:text-blue-200">Visual Output</span>
                {meta.visuals.type === "retrieval" ? (
                  <RetrievalVisualizer data={meta.visuals} />
                ) : (
                  <pre className="text-[10px] leading-3 whitespace-pre-wrap">{JSON.stringify(meta.visuals, null, 2)}</pre>
                )}
             </div>
          )}

          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            {stdout ? (
              <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-6 text-zinc-950">
                {stdout}
              </pre>
            ) : stderr ? (
               <p className="text-sm italic text-zinc-500">
                 (See error below)
               </p>
            ) : meta ? (
              <p className="text-sm italic text-zinc-500 text-emerald-600">
                ✓ Code executed successfully.
                <br />
                <span className="mt-1 block text-xs not-italic text-zinc-400">
                  Tip: Use <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-zinc-800">print()</code> to see values.
                </span>
              </p>
            ) : (
              <p className="text-sm text-zinc-500">
                Run your code to see results here.
              </p>
            )}
          </div>

          {stderr ? (() => {
            // Parse and format errors for better UX based on language
            const isTraceback = isPythonTraceback(stderr);
            const isTSError = isTypeScriptError(stderr);
            
            let formattedError: string;
            let errorTitle: string;
            let errorIcon: string;
            let parsedError: ReturnType<typeof parsePythonError> | ReturnType<typeof parseTypeScriptError> | null = null;
            
            if (isTypeScript) {
              // TypeScript error handling
              parsedError = parseTypeScriptError(stderr);
              formattedError = formatTypeScriptErrorForDisplay(parsedError);
              errorTitle = parsedError.isTestFailure ? "Test Failed" : parsedError.type;
              errorIcon = parsedError.isTestFailure ? "🧪" : parsedError.isCompilationError ? "⚠️" : "❌";
            } else if (isTraceback) {
              // Python error handling
              parsedError = parsePythonError(stderr);
              formattedError = formatTestFailure(stderr);
              errorTitle = "Python Error";
              errorIcon = "🐍";
            } else {
              // Generic error handling
              formattedError = stderr;
              errorTitle = "Error";
              errorIcon = "❌";
            }
            
            const hasLineNumber = parsedError?.lineNumber != null;
            const hasFullDetails = isTraceback || (isTSError && parsedError && 'stackTrace' in parsedError && parsedError.stackTrace);
            
            return (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{errorIcon}</span>
                    <p className="text-xs font-medium text-red-700 dark:text-red-300">
                      {errorTitle}
                    </p>
                  </div>
                  {hasFullDetails && (
                    <details className="text-xs text-red-600 dark:text-red-400">
                      <summary className="cursor-pointer hover:text-red-700 dark:hover:text-red-300">Show full details</summary>
                      <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-red-100 dark:bg-red-900/30 p-2 text-[10px] leading-relaxed">
                        {stderr}
                      </pre>
                    </details>
                  )}
                </div>
                
                {/* Error Message */}
                <div className="mt-3 space-y-2">
                  <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-6 text-red-900 dark:text-red-200">
                    {formattedError}
                  </pre>
                  
                  {/* Line Number Badge */}
                  {hasLineNumber && (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-red-200 dark:bg-red-800 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:text-red-200">
                        📍 Line {parsedError!.lineNumber}
                      </span>
                      {isTypeScript && parsedError && 'columnNumber' in parsedError && parsedError.columnNumber && (
                        <span className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/50 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:text-red-300">
                          Column {parsedError.columnNumber}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Helpful Tip */}
                  {parsedError?.suggestion && (
                    <div className="mt-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3">
                      <p className="text-xs text-amber-800 dark:text-amber-200">
                        <span className="font-semibold">💡 Tip:</span> {parsedError.suggestion}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })() : null}

          <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">Hints</p>
              <button
                type="button"
                onClick={() =>
                  setRevealedHints((n: number) =>
                    Math.min(challenge.hints.length, n + 1)
                  )
                }
                disabled={revealedHints >= challenge.hints.length}
                className="inline-flex h-8 items-center justify-center rounded-full border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-950 hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
              >
                Reveal hint
              </button>
            </div>

            <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
              {challenge.hints.slice(0, revealedHints).map((hint) => (
                <li key={hint}>{hint}</li>
              ))}
            </ol>
            {revealedHints === 0 ? (
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Stuck? Reveal hints progressively.
              </p>
            ) : null}
          </div>

          {/* Solution Section */}
          {challenge.solution && (completed || revealedHints >= challenge.hints.length) && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
              <details>
                <summary className="cursor-pointer text-sm font-medium text-emerald-800 dark:text-emerald-200">
                  {completed ? "View Solution" : "🔓 All hints revealed — Show Solution"}
                </summary>
                <div className="mt-3">
                  <p className="mb-2 text-xs text-emerald-600 dark:text-emerald-400">
                    Study this solution carefully before moving on.
                  </p>
                  <pre className="overflow-x-auto rounded-lg bg-zinc-900 p-3 text-xs text-zinc-100">
                    <code>{challenge.solution}</code>
                  </pre>
                </div>
              </details>
            </div>
          )}

          {/* Learn More - External Resources */}
          <LearnMoreSection challengeSlug={challenge.slug} />

          {/* Submission History - like LeetCode */}
          <SubmissionHistory
            challengeSlug={challenge.slug}
            onLoadCode={(loadedCode) => setCode(loadedCode)}
          />
        </div>
      </section>

      <section className="grid gap-2 sm:grid-cols-2">
        {prev ? (
          <CardLink href={`/challenges/${prev.slug}`}>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Previous challenge</p>
            <p className="mt-1 text-sm font-medium">{prev.title}</p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{prev.group}</p>
          </CardLink>
        ) : (
          <Card>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Previous challenge</p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              You’re at the start of the challenge track.
            </p>
          </Card>
        )}

        {next ? (
          <CardLink href={`/challenges/${next.slug}`}>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Next challenge</p>
            <p className="mt-1 text-sm font-medium">{next.title}</p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{next.group}</p>
          </CardLink>
        ) : (
          <Card>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Next challenge</p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              End of list. Browse all challenges or follow the Study Plan.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href="/challenges"
                className="text-sm font-medium text-zinc-950 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-500 dark:text-zinc-50 dark:decoration-white/25 dark:hover:decoration-white/50"
              >
                All challenges →
              </Link>
              <Link
                href="/plan"
                className="text-sm font-medium text-zinc-950 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-500 dark:text-zinc-50 dark:decoration-white/25 dark:hover:decoration-white/50"
              >
                Study Plan →
              </Link>
            </div>
          </Card>
        )}
      </section>

      {/* Related Challenges - LeetCode Differentiator */}
      {challenge.relatedChallenges && challenge.relatedChallenges.length > 0 && (
        <section className="mt-4">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Continue Learning</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {challenge.relatedChallenges.map((slug) => (
              <Link
                key={slug}
                href={`/challenges/${slug}`}
                className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/50"
              >
                {slug} →
              </Link>
            ))}
          </div>
        </section>
      )}

      {challenge.benchmark && (
        <section className="mt-5">
          <Leaderboard slug={challenge.slug} />
        </section>
      )}

      {/* AI Code Review Modal */}
      <AICodeReview
        code={code}
        challengeSlug={challenge.slug}
        challengeTitle={challenge.title}
        isVisible={showAIReview}
        onClose={() => setShowAIReview(false)}
        onReviewReceived={(feedback) => {
          setInlineReview(feedback);
          setShowInlineReview(true);
        }}
      />
    </div>
  );
}


