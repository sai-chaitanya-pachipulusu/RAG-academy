"use client";

import { useState, useEffect } from "react";
import { getMicroTasks, markMicroTaskComplete, type MicroTask } from "@/lib/challenges/microTasks";
import { pyodideExec } from "@/lib/pyodide/executor";
import { isPythonTraceback, formatTestFailure } from "@/lib/pyodide/errorParser";

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
    setOutput("🔄 Loading Python environment...\n");

    try {
      // Actually run the code with Pyodide
      const result = await pyodideExec.test(code, currentTask.testCode);
      
      // Build output message
      let outputText = "";
      
      if (result.stdout) {
        outputText += result.stdout;
      }
      
      if (result.ok) {
        // Test passed!
        outputText = `✓ ${currentTask.title} - Test passed!\n\n${result.stdout || "Your implementation is correct."}`;
        setOutput(outputText);

        const newCompleted = [...completedTasks];
        newCompleted[currentTaskIndex] = true;
        setCompletedTasks(newCompleted);
        markMicroTaskComplete(challengeSlug, currentTaskIndex);
        onTaskComplete?.(currentTaskIndex);

        if (newCompleted.every(Boolean)) {
          onAllComplete?.();
        }
      } else {
        // Test failed - format the error nicely
        const errorMessage = result.stderr || result.error || "Test failed";
        const formattedError = isPythonTraceback(errorMessage) 
          ? formatTestFailure(errorMessage) 
          : errorMessage;
        
        setOutput(`❌ Test failed\n\n${formattedError}`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      setOutput(`❌ Error: ${errorMsg}\n\n💡 Tip: Make sure your code is syntactically correct.`);
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
      <div className="rounded-2xl border border-gray-200 bg-white p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-4xl">🧩</span>
            <div>
              <h3 className="text-xl font-bold text-gray-900 lg:text-2xl">Step-by-Step Mode</h3>
              <p className="mt-1 text-gray-500">Break down the challenge into manageable micro-tasks</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">{completedCount}/{tasks.length}</p>
            <p className="text-sm text-gray-500">tasks complete</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm font-medium text-gray-500">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full bg-indigo-600 transition-all duration-200-all duration-500 ease-out cursor-pointer"
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
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200-all duration-200 ${
                i === currentTaskIndex
                  ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                  : completedTasks[i]
                    ? "border-emerald-200 bg-emerald-100 text-emerald-800"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {completedTasks[i] ? (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600/20 text-xs text-emerald-700">✓</span>
              ) : (
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                  i === currentTaskIndex ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                }`}>{i + 1}</span>
              )}
              <span className="hidden sm:inline">{task.title}</span>
              <span className="sm:hidden">Task {i + 1}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Current Task Card */}
      <div className="rounded-2xl border-2 border-indigo-100 bg-white p-6 lg:p-8">
        {/* Task Header */}
        <div className="mb-6 flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700">
                {currentTaskIndex + 1}
              </span>
              <div>
                <h4 className="text-xl font-bold text-gray-900">
                  {currentTask.title}
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  ⏱️ Estimated: ~{currentTask.estimatedMinutes} minutes
                </p>
              </div>
            </div>
          </div>
          {completedTasks[currentTaskIndex] && (
            <span className="flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
              <span>✓</span> Completed
            </span>
          )}
        </div>

        {/* Task Description */}
        <div className="mb-6 rounded-xl border border-indigo-100 bg-indigo-50/50 p-5">
          <h5 className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-700">
            Your Task
          </h5>
          <p className="text-lg text-gray-800">{currentTask.description}</p>
        </div>

        {/* Hints Section */}
        {currentTask.hints.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setShowHints(!showHints)}
              className="flex items-center gap-2 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 px-5 py-3 text-sm font-medium text-amber-800 transition-all duration-200-all duration-200 hover:border-amber-400 hover:bg-amber-100 cursor-pointer"
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
                    className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-200 text-xs font-bold text-amber-800">
                      {i + 1}
                    </span>
                    <code className="text-sm text-amber-900">{hint}</code>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Code Editor */}
        <div className="mb-6">
          <div className="flex items-center justify-between rounded-t-xl bg-gray-100 border border-gray-200 border-b-0 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Your Solution</span>
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
            className="h-64 w-full resize-none rounded-b-xl border border-gray-200 bg-white p-4 font-mono text-sm leading-relaxed text-gray-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            spellCheck={false}
            placeholder="Write your code here..."
          />
        </div>

        {/* Output */}
        {output && (
          <div className="mb-6">
            <div className="rounded-t-xl bg-gray-100 border border-gray-200 border-b-0 px-4 py-2">
              <span className="text-sm font-medium text-gray-700">Output</span>
            </div>
            <div className={`rounded-b-xl border border-gray-200 p-4 font-mono text-sm ${
              output.includes("✓") 
                ? "bg-emerald-50 text-emerald-900 border-emerald-200" 
                : output.includes("❌") 
                  ? "bg-red-50 text-red-900 border-red-200"
                  : "bg-white text-gray-800"
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
              className="rounded-xl border-2 border-gray-200 px-5 py-3 text-sm font-medium text-gray-600 transition-all duration-200-all duration-200 hover:bg-gray-50 disabled:opacity-30 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-900 cursor-pointer"
            >
              ← Previous
            </button>
            <button
              onClick={goToNextTask}
              disabled={currentTaskIndex === tasks.length - 1}
              className="rounded-xl border-2 border-gray-200 px-5 py-3 text-sm font-medium text-gray-600 transition-all duration-200-all duration-200 hover:bg-gray-50 disabled:opacity-30 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-900 cursor-pointer"
            >
              Next →
            </button>
          </div>

          <button
            onClick={handleRun}
            disabled={isRunning}
            className="rounded-xl bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200-all duration-200 hover:bg-indigo-500 disabled:opacity-50 cursor-pointer"
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
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center text-gray-900">
          <span className="text-6xl">🎉</span>
          <h3 className="mt-4 text-2xl font-bold">All Micro-Tasks Complete!</h3>
          <p className="mt-2 text-emerald-800">
            You've broken down and conquered every step. Now try the full challenge to solidify your understanding.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-emerald-600 px-8 py-3 font-semibold text-white shadow-sm transition-all duration-200-all duration-200 hover:bg-emerald-500 cursor-pointer"
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
  onToggleAction,
}: {
  hasMicroTasks: boolean;
  isEnabled: boolean;
  onToggleAction: () => void;
}) {
  if (!hasMicroTasks) return null;

  return (
    <button
      onClick={onToggleAction}
      className={`flex items-center gap-3 rounded-xl border px-5 py-3 text-sm font-medium transition-all duration-200-all duration-200 ${
        isEnabled
          ? "border-indigo-200 bg-indigo-50 text-indigo-700"
          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
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
