"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import type { editor } from "monaco-editor";

import type { Challenge } from "@/lib/challenges/catalog";
import type { LocalProgressState } from "@/lib/progress/localStore";
import { pyodideExec } from "@/lib/pyodide/executor";
import { typescriptExec } from "@/lib/typescript/executor";
import { RetrievalVisualizer } from "./visualizers/RetrievalVisualizer";
import { Leaderboard } from "./arena/Leaderboard";
import { LearnMoreSection } from "@/components/resources/LearnMore";
import { AICodeReview, CodeReviewButton } from "./AICodeReview";
import { InterviewTimer, InterviewModeToggle, getInterviewDuration } from "./InterviewTimer";
import { TheoryTab, CHALLENGE_THEORY } from "./TheoryTab";
import { MicroTaskView, MicroTaskToggle } from "./MicroTaskView";
import { SubmissionHistory } from "./SubmissionHistory";
import { getMicroTasks } from "@/lib/challenges/microTasks";
import { CodeEditor, CodeDiffViewer } from "./CodeEditor";
import type { ErrorMarker } from "./editorTypes";
import { ErrorDisplay, parseError, errorToMarker } from "./ErrorDisplay";
import { IDEToolbar, OutputPanel, SuccessBanner } from "./IDEToolbar";
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
import { saveSubmission } from "@/lib/supabase/submissions";
import { useToast } from "@/components/ui/Toast";

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

export function ChallengeIDEEnhanced({ challenge, children, prev, next }: Props) {
  const { state, setState } = useLocalProgress();
  const { user, hasPaidAccess, subscriptionLoading } = useSupabaseAuth();
  const { addToast } = useToast();

  // Access control: check if user can access this challenge
  const isFree = isChallengeFree(challenge);
  
  // Show loading while checking subscription
  if (!isFree && subscriptionLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-zinc-900" />
      </div>
    );
  }
  
  // Show paywall for paid challenges if user doesn't have access
  if (!isFree && !hasPaidAccess) {
    return <ChallengePaywall challenge={challenge} isLoggedIn={!!user} />;
  }

  const savedCode = state.challenges[challenge.slug]?.userCode ?? null;
  const initial = useMemo(
    () => savedCode ?? challenge.starterCode,
    [savedCode, challenge.starterCode]
  );

  // Editor state
  const [code, setCode] = useState(initial);
  const [revealedHints, setRevealedHints] = useState(0);
  const [running, setRunning] = useState<"run" | "test" | "submit" | null>(null);
  const [showAIReview, setShowAIReview] = useState(false);
  const [microTaskMode, setMicroTaskMode] = useState(false);
  const [showDiffView, setShowDiffView] = useState(false);

  // NEW: Enhanced IDE settings
  const [fontSize, setFontSize] = useState(14);
  const [layout, setLayout] = useState<"split" | "stacked">("split");
  const [editorTheme, setEditorTheme] = useState<"light" | "dark">("light");
  const [errorMarkers, setErrorMarkers] = useState<ErrorMarker[]>([]);

  // Editor ref for programmatic control
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  // Output state
  const [stdout, setStdout] = useState("");
  const [stderr, setStderr] = useState("");
  const [meta, setMeta] = useState<{
    durationMs?: number;
    score?: number | null;
    metrics?: Record<string, number | string> | null;
    visuals?: any;
  } | null>(null);
  const [justCompleted, setJustCompleted] = useState(false);

  const progress = state.challenges[challenge.slug];
  const status = progress?.status ?? "not_started";
  const completed = status === "completed";

  // Check if challenge has micro-tasks
  const hasMicroTasks = getMicroTasks(challenge.slug) !== null;
  // Check if challenge has theory content
  const theoryContent = CHALLENGE_THEORY[challenge.slug];

  useEffect(() => {
    // If there IS saved code (e.g. from a previous session), hydrate editor once.
    if (savedCode === null) return;
    setCode((prev: string) =>
      prev === challenge.starterCode ? savedCode : prev
    );
  }, [savedCode, challenge.starterCode]);

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

  // Parse errors and create markers when stderr changes
  useEffect(() => {
    if (!stderr) {
      setErrorMarkers([]);
      return;
    }

    const parsed = parseError(stderr);
    const marker = errorToMarker(parsed);
    if (marker) {
      setErrorMarkers([marker]);
    } else {
      setErrorMarkers([]);
    }
  }, [stderr]);

  // Detect if this is a TypeScript challenge
  const isTypeScript = challenge.slug.startsWith("ts-");
  const executor = isTypeScript ? typescriptExec : pyodideExec;

  // Preload Pyodide worker on mount for Python challenges (reduces first-run latency)
  useEffect(() => {
    if (!isTypeScript) {
      pyodideExec.preload();
    }
  }, [isTypeScript]);

  // Jump to error line in editor
  const handleJumpToLine = useCallback((lineNumber: number) => {
    if (editorRef.current) {
      editorRef.current.revealLineInCenter(lineNumber);
      editorRef.current.setPosition({ lineNumber, column: 1 });
      editorRef.current.focus();
    }
  }, []);

  async function run(mode: "run" | "test") {
    setRunning(mode);
    setStdout("");
    setStderr("");
    setMeta(null);
    setJustCompleted(false);

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
    setJustCompleted(false);

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
        })
          .then((saveResult) => {
            if (saveResult?.paywall) {
              addToast("Upgrade to Pro to save submissions for paid challenges.", "warning");
            }
          })
          .catch(e => console.warn("Failed to save submission history:", e));
      }

      if (result.ok) {
        setJustCompleted(true);
        addToast("🎉 Challenge completed! Your solution has been saved.", "success");
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
      } else {
        // Failed submission - still saved to history
        addToast("Submission recorded. Check the errors below.", "warning");
      }
    } catch (err) {
      setStderr(err instanceof Error ? err.message : String(err));
      addToast("Submission failed. Please try again.", "error");
    } finally {
      setRunning(null);
    }
  }

  function handleReset() {
    if (confirm("Are you sure you want to reset your code to the starter template? This cannot be undone.")) {
      setCode(challenge.starterCode);
      setStdout("");
      setStderr("");
      setMeta(null);
      setErrorMarkers([]);
      setJustCompleted(false);
      setState((prev: LocalProgressState) => {
        const next = { ...prev, challenges: { ...prev.challenges } };
        const existing = prev.challenges[challenge.slug];
        if (existing) next.challenges[challenge.slug] = { ...existing };
        resetChallenge(next, challenge.slug);
        return next;
      });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <header className="flex flex-col gap-1.5">
        <div>
          <Link
            href="/challenges"
            className="text-xs font-medium text-gray-950 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-500 dark:text-gray-50 dark:decoration-white/25 dark:hover:decoration-white/50 cursor-pointer"
          >
            Challenges →
          </Link>
          <span className="px-2 text-xs text-gray-400">/</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
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
            <span className="rounded-full border border-gray-200 px-2 py-0.5 text-xs text-gray-600 dark:border-gray-800 dark:text-gray-400">
              {challenge.difficulty} · {challenge.xpReward} XP
            </span>
            {completed ? (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                Completed
              </span>
            ) : null}
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {challenge.description}
        </p>

        {/* Real-World Context */}
        {(challenge.realWorld || challenge.complexity) && (
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {challenge.complexity && (
              <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 dark:border-gray-800 dark:bg-gray-900/50">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Complexity</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  <code className="rounded bg-gray-200/80 px-1.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-[#2563EB] dark:text-gray-200">
                    Time: {challenge.complexity.time}
                  </code>
                  <code className="rounded bg-gray-200/80 px-1.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-[#2563EB] dark:text-gray-200">
                    Space: {challenge.complexity.space}
                  </code>
                </div>
                {challenge.complexity.latency && (
                  <p className="mt-1.5 text-[11px] text-gray-500">⚡ {challenge.complexity.latency}</p>
                )}
              </div>
            )}

            {challenge.realWorld?.companies && challenge.realWorld.companies.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 dark:border-gray-800 dark:bg-gray-900/50">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Used By</p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {challenge.realWorld.companies.map((company) => (
                    <span
                      key={company}
                      className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
                    >
                      {company}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {challenge.realWorld?.useCases && challenge.realWorld.useCases.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 dark:border-gray-800 dark:bg-gray-900/50">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Use Cases</p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {challenge.realWorld.useCases.map((useCase) => (
                    <span
                      key={useCase}
                      className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200"
                    >
                      {useCase}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Problem Description */}
      {children ? (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          {children}
        </section>
      ) : null}

      {/* Theory Tab */}
      {theoryContent && (
        <TheoryTab
          challengeSlug={challenge.slug}
          conceptTitle={theoryContent.title}
          content={theoryContent.content}
        />
      )}

      {/* Success Banner */}
      {justCompleted && (
        <SuccessBanner
          xpEarned={challenge.xpReward}
          executionTime={meta?.durationMs}
          nextChallenge={next}
        />
      )}

      {/* Micro-Task Mode */}
      {hasMicroTasks && microTaskMode && (
        <MicroTaskView
          challengeSlug={challenge.slug}
          onAllComplete={() => setMicroTaskMode(false)}
        />
      )}

      {/* IDE Section */}
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        {/* IDE Toolbar */}
        <IDEToolbar
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          layout={layout}
          onLayoutChange={setLayout}
          theme={editorTheme}
          onThemeChange={setEditorTheme}
          onRun={() => run("test")}
          onSubmit={submit}
          onReset={handleReset}
          isRunning={running !== null}
          isCompleted={completed}
          onShowAIReview={() => setShowAIReview(true)}
          onShowDiff={challenge.solution ? () => setShowDiffView(true) : undefined}
          hasMicroTasks={hasMicroTasks}
          microTaskMode={microTaskMode}
          onToggleMicroTask={() => setMicroTaskMode(!microTaskMode)}
        />

        {/* Editor + Output Area */}
        <div className={`${layout === "split" ? "grid lg:grid-cols-2" : "flex flex-col"}`}>
          {/* Code Editor */}
          <div className={`${layout === "split" ? "border-r border-gray-200 dark:border-gray-800" : ""}`}>
            <CodeEditor
              value={code}
              onChange={setCode}
              height={layout === "split" ? "clamp(500px, 60vh, 800px)" : "clamp(400px, 50vh, 600px)"}
              fontSize={fontSize}
              theme={editorTheme}
              errorMarkers={errorMarkers}
              onEditorMount={(editor) => {
                editorRef.current = editor;
              }}
            />
          </div>

          {/* Output Panel */}
          <div className={`${layout === "stacked" ? "border-t border-gray-200 dark:border-gray-800" : ""}`}>
            <div style={{ height: layout === "split" ? "clamp(500px, 60vh, 800px)" : "300px" }}>
              {stderr ? (
                <div className="h-full overflow-auto p-4">
                  <ErrorDisplay stderr={stderr} onJumpToLine={handleJumpToLine} />
                </div>
              ) : (
                <OutputPanel
                  stdout={stdout}
                  stderr={stderr}
                  durationMs={meta?.durationMs}
                  score={meta?.score}
                  metrics={meta?.metrics}
                  onJumpToLine={handleJumpToLine}
                />
              )}
            </div>
          </div>
        </div>

        {/* Visual Output (if present) */}
        {meta?.visuals && (
          <div className="border-t border-gray-200 p-4 dark:border-gray-800">
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Visual Output</p>
            {meta.visuals.type === "retrieval" ? (
              <RetrievalVisualizer data={meta.visuals} />
            ) : (
              <pre className="overflow-auto rounded-lg bg-gray-100 p-3 text-xs dark:bg-[#2563EB]">
                {JSON.stringify(meta.visuals, null, 2)}
              </pre>
            )}
          </div>
        )}

        {/* Status Bar */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Status: {status.replace("_", " ")}
            {typeof progress?.attempts === "number" && progress.attempts > 0
              ? ` · attempts: ${progress.attempts}`
              : ""}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Python 3.11</span>
            <span>•</span>
            <span>Pyodide</span>
          </div>
        </div>
      </section>

      {/* Hints Section */}
      <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
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
            className="inline-flex h-8 items-center justify-center rounded-full border border-gray-200 bg-white px-3 text-xs font-medium text-gray-950 hover:bg-gray-50 disabled:opacity-60 dark:border-gray-800 dark:bg-[#2563EB] dark:text-gray-50 dark:hover:bg-gray-900 cursor-pointer"
          >
            Reveal hint ({revealedHints}/{challenge.hints.length})
          </button>
        </div>

        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-gray-700 dark:text-gray-300">
          {challenge.hints.slice(0, revealedHints).map((hint) => (
            <li key={hint}>{hint}</li>
          ))}
        </ol>
        {revealedHints === 0 ? (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Stuck? Reveal hints progressively.
          </p>
        ) : null}
      </div>

      {/* Solution Section */}
      {challenge.solution && (completed || revealedHints >= challenge.hints.length) && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
          {showDiffView ? (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                  📊 Code Comparison
                </p>
                <button
                  onClick={() => setShowDiffView(false)}
                  className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 cursor-pointer"
                >
                  Hide diff
                </button>
              </div>
              <CodeDiffViewer
                originalCode={code}
                modifiedCode={challenge.solution}
                height="400px"
              />
            </div>
          ) : (
            <details>
              <summary className="cursor-pointer text-sm font-medium text-emerald-800 dark:text-emerald-200">
                {completed ? "View Solution" : "🔓 All hints revealed — Show Solution"}
              </summary>
              <div className="mt-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    Study this solution carefully before moving on.
                  </p>
                  <button
                    onClick={() => setShowDiffView(true)}
                    className="text-xs font-medium text-emerald-700 underline hover:text-emerald-800 dark:text-emerald-300 cursor-pointer"
                  >
                    Compare with your code →
                  </button>
                </div>
                <pre className="overflow-x-auto rounded-lg bg-gray-900 p-3 text-xs text-gray-100">
                  <code>{challenge.solution}</code>
                </pre>
              </div>
            </details>
          )}
        </div>
      )}

      {/* Learn More - External Resources */}
      <LearnMoreSection challengeSlug={challenge.slug} />

      {/* Submission History - like LeetCode */}
      <SubmissionHistory
        challengeSlug={challenge.slug}
        onLoadCode={(loadedCode) => setCode(loadedCode)}
      />

      {/* Navigation */}
      <section className="grid gap-2 sm:grid-cols-2">
        {prev ? (
          <CardLink href={`/challenges/${prev.slug}`}>
            <p className="text-xs text-gray-500 dark:text-gray-400">Previous challenge</p>
            <p className="mt-1 text-sm font-medium">{prev.title}</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{prev.group}</p>
          </CardLink>
        ) : (
          <Card>
            <p className="text-xs text-gray-500 dark:text-gray-400">Previous challenge</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              You're at the start of the challenge track.
            </p>
          </Card>
        )}

        {next ? (
          <CardLink href={`/challenges/${next.slug}`}>
            <p className="text-xs text-gray-500 dark:text-gray-400">Next challenge</p>
            <p className="mt-1 text-sm font-medium">{next.title}</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{next.group}</p>
          </CardLink>
        ) : (
          <Card>
            <p className="text-xs text-gray-500 dark:text-gray-400">Next challenge</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              End of list. Browse all challenges or follow the Study Plan.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href="/challenges"
                className="text-sm font-medium text-gray-950 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-500 dark:text-gray-50 dark:decoration-white/25 dark:hover:decoration-white/50 cursor-pointer"
              >
                All challenges →
              </Link>
              <Link
                href="/plan"
                className="text-sm font-medium text-gray-950 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-500 dark:text-gray-50 dark:decoration-white/25 dark:hover:decoration-white/50 cursor-pointer"
              >
                Study Plan →
              </Link>
            </div>
          </Card>
        )}
      </section>

      {/* Related Challenges */}
      {challenge.relatedChallenges && challenge.relatedChallenges.length > 0 && (
        <section className="mt-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Continue Learning</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {challenge.relatedChallenges.map((slug) => (
              <Link
                key={slug}
                href={`/challenges/${slug}`}
                className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-all duration-200-all duration-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-gray-800 dark:bg-[#2563EB] dark:text-gray-300 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/50 cursor-pointer"
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
        isVisible={showAIReview}
        onClose={() => setShowAIReview(false)}
      />
    </div>
  );
}
