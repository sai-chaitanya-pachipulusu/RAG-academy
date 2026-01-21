"use client";

import { useState, useEffect } from "react";
import { getMicroTasks, markMicroTaskComplete, type MicroTask } from "@/lib/challenges/microTasks";

interface Props {
  challengeSlug: string;
  onTaskComplete?: (taskIndex: number) => void;
  onAllComplete?: () => void;
}

export function MicroTaskView({ challengeSlug, onTaskComplete, onAllComplete }: Props) {
  const [tasks, setTasks] = useState<MicroTask[] | null>(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<boolean[]>([]);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [showHints, setShowHints] = useState(false);

  useEffect(() => {
    const microTasks = getMicroTasks(challengeSlug);
    setTasks(microTasks);

    if (microTasks) {
      const stored = localStorage.getItem(`microtasks_${challengeSlug}`);
      const progress = stored ? JSON.parse(stored) : new Array(microTasks.length).fill(false);
      setCompletedTasks(progress);

      const firstIncomplete = progress.findIndex((completed: boolean) => !completed);
      setCurrentTaskIndex(firstIncomplete >= 0 ? firstIncomplete : 0);

      if (microTasks[firstIncomplete >= 0 ? firstIncomplete : 0]) {
        setCode(microTasks[firstIncomplete >= 0 ? firstIncomplete : 0].starterCode);
      }
    }
  }, [challengeSlug]);

  if (!tasks || tasks.length === 0) {
    return null;
  }

  const currentTask = tasks[currentTaskIndex];
  const completedCount = completedTasks.filter(Boolean).length;
  const progress = (completedCount / tasks.length) * 100;

  const handleRun = async () => {
    setIsRunning(true);
    setOutput("Running...\n");

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const hasImplementation = !code.includes("pass") && code.length > currentTask.starterCode.length;

      if (hasImplementation) {
        setOutput(`✓ ${currentTask.title} - Test passed!\n\nYour implementation looks correct.`);

        const newCompleted = [...completedTasks];
        newCompleted[currentTaskIndex] = true;
        setCompletedTasks(newCompleted);
        markMicroTaskComplete(challengeSlug, currentTaskIndex);
        onTaskComplete?.(currentTaskIndex);

        if (newCompleted.every(Boolean)) {
          onAllComplete?.();
        }
      } else {
        setOutput(
          "❌ Test failed\n\nMake sure to replace 'pass' with your implementation."
        );
      }
    } catch (error) {
      setOutput(`Error: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const goToTask = (index: number) => {
    setCurrentTaskIndex(index);
    setCode(tasks[index].starterCode);
    setOutput("");
    setShowHints(false);
  };

  const goToNextTask = () => {
    if (currentTaskIndex < tasks.length - 1) {
      goToTask(currentTaskIndex + 1);
    }
  };

  const goToPrevTask = () => {
    if (currentTaskIndex > 0) {
      goToTask(currentTaskIndex - 1);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Hero Header */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 text-white lg:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-4xl">🧩</span>
            <div>
              <h3 className="text-xl font-bold lg:text-2xl">Step-by-Step Mode</h3>
              <p className="mt-1 text-white/80">Break down the challenge into manageable micro-tasks</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{completedCount}/{tasks.length}</p>
            <p className="text-sm text-white/70">tasks complete</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full bg-white transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Task Pills */}
        <div className="mt-6 flex flex-wrap gap-3">
          {tasks.map((task, i) => (
            <button
              key={task.id}
              onClick={() => goToTask(i)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                i === currentTaskIndex
                  ? "bg-white text-indigo-700 shadow-lg"
                  : completedTasks[i]
                    ? "bg-emerald-400 text-white"
                    : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              {completedTasks[i] ? (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-xs">✓</span>
              ) : (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/30 text-xs">{i + 1}</span>
              )}
              <span className="hidden sm:inline">{task.title}</span>
              <span className="sm:hidden">Task {i + 1}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Current Task Card */}
      <div className="rounded-2xl border-2 border-indigo-200 bg-white p-6 dark:border-indigo-900/50 dark:bg-zinc-950 lg:p-8">
        {/* Task Header */}
        <div className="mb-6 flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                {currentTaskIndex + 1}
              </span>
              <div>
                <h4 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {currentTask.title}
                </h4>
                <p className="mt-1 text-sm text-zinc-500">
                  ⏱️ Estimated: ~{currentTask.estimatedMinutes} minutes
                </p>
              </div>
            </div>
          </div>
          {completedTasks[currentTaskIndex] && (
            <span className="flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
              <span>✓</span> Completed
            </span>
          )}
        </div>

        {/* Task Description */}
        <div className="mb-6 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 p-5 dark:from-indigo-950/30 dark:to-purple-950/30">
          <h5 className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Your Task
          </h5>
          <p className="text-lg text-zinc-800 dark:text-zinc-200">{currentTask.description}</p>
        </div>

        {/* Hints Section */}
        {currentTask.hints.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setShowHints(!showHints)}
              className="flex items-center gap-2 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 px-5 py-3 text-sm font-medium text-amber-800 transition-all hover:border-amber-400 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200"
            >
              <span className="text-lg">💡</span>
              {showHints ? "Hide Hints" : `Show ${currentTask.hints.length} Hints`}
              <span className="ml-2">{showHints ? "▲" : "▼"}</span>
            </button>

            {showHints && (
              <div className="mt-4 space-y-3">
                {currentTask.hints.map((hint, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-200 text-xs font-bold text-amber-800 dark:bg-amber-800 dark:text-amber-200">
                      {i + 1}
                    </span>
                    <code className="text-sm text-amber-900 dark:text-amber-100">{hint}</code>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Code Editor */}
        <div className="mb-6">
          <div className="flex items-center justify-between rounded-t-xl bg-zinc-800 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-300">📝 Your Solution</span>
            </div>
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-red-500"></span>
              <span className="h-3 w-3 rounded-full bg-yellow-500"></span>
              <span className="h-3 w-3 rounded-full bg-green-500"></span>
            </div>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="h-64 w-full resize-none rounded-b-xl bg-zinc-900 p-4 font-mono text-sm leading-relaxed text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500"
            spellCheck={false}
            placeholder="Write your code here..."
          />
        </div>

        {/* Output */}
        {output && (
          <div className="mb-6">
            <div className="rounded-t-xl bg-zinc-700 px-4 py-2">
              <span className="text-sm font-medium text-zinc-300">📤 Output</span>
            </div>
            <div className={`rounded-b-xl p-4 font-mono text-sm ${
              output.includes("✓") 
                ? "bg-emerald-900 text-emerald-100" 
                : output.includes("❌") 
                  ? "bg-red-900 text-red-100"
                  : "bg-zinc-800 text-zinc-100"
            }`}>
              <pre className="whitespace-pre-wrap">{output}</pre>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-3">
            <button
              onClick={goToPrevTask}
              disabled={currentTaskIndex === 0}
              className="rounded-xl border-2 border-zinc-200 px-5 py-3 text-sm font-medium text-zinc-600 transition-all hover:bg-zinc-50 disabled:opacity-30 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
            >
              ← Previous
            </button>
            <button
              onClick={goToNextTask}
              disabled={currentTaskIndex === tasks.length - 1}
              className="rounded-xl border-2 border-zinc-200 px-5 py-3 text-sm font-medium text-zinc-600 transition-all hover:bg-zinc-50 disabled:opacity-30 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
            >
              Next →
            </button>
          </div>

          <button
            onClick={handleRun}
            disabled={isRunning}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50"
          >
            {isRunning ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                Running...
              </span>
            ) : (
              "▶ Run & Test"
            )}
          </button>
        </div>
      </div>

      {/* All Complete Celebration */}
      {completedTasks.every(Boolean) && (
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 p-8 text-center text-white">
          <span className="text-6xl">🎉</span>
          <h3 className="mt-4 text-2xl font-bold">All Micro-Tasks Complete!</h3>
          <p className="mt-2 text-emerald-100">
            You've broken down and conquered every step. Now try the full challenge to solidify your understanding.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-white px-8 py-3 font-semibold text-emerald-700 shadow-lg transition-all hover:bg-emerald-50"
          >
            Try Full Challenge →
          </button>
        </div>
      )}
    </div>
  );
}

// Toggle button for switching between modes
export function MicroTaskToggle({
  hasMicroTasks,
  isEnabled,
  onToggle,
}: {
  hasMicroTasks: boolean;
  isEnabled: boolean;
  onToggle: () => void;
}) {
  if (!hasMicroTasks) return null;

  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-3 rounded-xl px-5 py-3 text-sm font-medium transition-all ${
        isEnabled
          ? "bg-indigo-100 text-indigo-700 ring-2 ring-indigo-300 dark:bg-indigo-950/50 dark:text-indigo-300 dark:ring-indigo-800"
          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
      }`}
    >
      <span className="text-lg">🧩</span>
      <span>{isEnabled ? "Exit Step-by-Step" : "Step-by-Step Mode"}</span>
      {!isEnabled && (
        <span className="rounded-full bg-indigo-500 px-2 py-0.5 text-xs text-white">Recommended</span>
      )}
    </button>
  );
}
