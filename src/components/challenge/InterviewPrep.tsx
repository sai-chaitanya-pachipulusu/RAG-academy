"use client";

import { useState } from "react";
import Link from "next/link";
import { CHALLENGES, type Challenge } from "@/lib/challenges/catalog";
import { getInterviewDuration } from "@/components/challenge/InterviewTimer";
import { Reveal } from "@/components/ui/Reveal";

type Difficulty = "easy" | "medium" | "hard" | "mixed";
type Status = "idle" | "ready";

interface InterviewSession {
  challenges: Challenge[];
  currentIndex: number;
  startTime: number;
}

const PRESETS = [
  { id: "warmup", name: "Warm Up", difficulty: "easy" as Difficulty, count: 3, time: 15, icon: "🌱", description: "Quick technical reset" },
  { id: "standard", name: "Standard", difficulty: "medium" as Difficulty, count: 5, time: 50, icon: "🎯", description: "Mid-level interview" },
  { id: "senior", name: "Senior", difficulty: "hard" as Difficulty, count: 3, time: 45, icon: "🔥", description: "Architectural depth" },
  { id: "mock", name: "Full Mock", difficulty: "mixed" as Difficulty, count: 7, time: 70, icon: "💼", description: "Comprehensive evaluation" },
];

const TIPS = [
  { title: "Read Carefully", description: "Requirements are strictly typed." },
  { title: "Time Yourself", description: "Execution speed matters." },
  { title: "Test First", description: "Run your own test cases." },
  { title: "No Retries", description: "Failed steps are final." },
];

export function InterviewPrep() {
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [count, setCount] = useState(3);
  const [status, setStatus] = useState<Status>("idle");
  const [session, setSession] = useState<InterviewSession | null>(null);

  const selectedPreset = PRESETS.find(p => p.difficulty === difficulty && p.count === count);

  const estimatedTime = difficulty === "easy" ? 5 * count
    : difficulty === "medium" ? 10 * count
    : difficulty === "hard" ? 15 * count
    : 10 * count;

  const startSession = () => {
    let pool = CHALLENGES.filter((c: Challenge) => !c.benchmark);
    if (difficulty !== "mixed") {
      pool = pool.filter((c: Challenge) => c.difficulty === difficulty);
    }
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));

    setSession({
      challenges: selected,
      currentIndex: 0,
      startTime: Date.now(),
    });
    setStatus("ready");
  };

  const getTotalTime = () => {
    if (!session) return 0;
    return session.challenges.reduce((total: number, c: Challenge) => total + getInterviewDuration(c.difficulty), 0);
  };

  if (status === "ready" && session) {
    return (
      <Reveal>
        <div className="mx-auto max-w-3xl rounded-2xl border border-[#3B82F6] bg-gray-900 p-6 text-white shadow-xl">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-900 text-lg font-bold">
              ⚡
            </div>
            <div>
              <h2 className="text-lg font-bold">Session Ready</h2>
              <p className="text-sm text-gray-400">
                {session.challenges.length} challenges • ~{Math.round(getTotalTime() / 60)} minutes
              </p>
            </div>
          </div>

          <div className="mb-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {session.challenges.map((c, i) => (
              <div key={c.slug} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[10px] font-bold text-gray-900">
                  {i + 1}
                </span>
                <span className="truncate text-xs font-medium">{c.title}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Link
              href={`/challenges/${session.challenges[0].slug}?interview=true`}
              className="flex-1 rounded-lg bg-white py-3 text-center text-sm font-bold text-gray-900 transition-all duration-200-all duration-200 hover:bg-gray-100 cursor-pointer"
            >
              Start
            </Link>
            <button
              onClick={() => { setSession(null); setStatus("idle"); }}
              className="rounded-lg border border-white/20 px-4 py-3 text-sm font-semibold text-gray-400 transition-all duration-200-all duration-200 hover:bg-white/5 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </Reveal>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="max-w-xl space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Timed Assessments
        </h2>
        <p className="text-sm leading-relaxed text-gray-500">
          Test your RAG knowledge under pressure. No docs, no hints.
        </p>
      </div>

      {/* Presets */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Quick Start</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PRESETS.map((preset) => {
            const isSelected = difficulty === preset.difficulty && count === preset.count;
            return (
              <Reveal key={preset.id}>
                <button
                  onClick={() => { setDifficulty(preset.difficulty); setCount(preset.count); }}
                  className={`group w-full rounded-xl border p-4 text-left transition-all duration-200-all duration-200 ${
                    isSelected
                      ? "border-[#3B82F6] bg-white shadow-lg"
                      : "border-gray-100 bg-white hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl">{preset.icon}</span>
                    {isSelected && <div className="h-2 w-2 rounded-full bg-gray-900" />}
                  </div>
                  <h4 className="text-sm font-bold text-gray-900">{preset.name}</h4>
                  <p className="mt-0.5 text-[10px] text-gray-500">{preset.description}</p>
                  <div className="mt-3 flex items-center justify-between text-[9px] font-bold uppercase tracking-widest">
                    <span className="text-gray-400">{preset.count} challenges</span>
                    <span className="text-gray-900">~{preset.time}m</span>
                  </div>
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>

      {/* Custom Configuration */}
      <Reveal>
        <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Difficulty */}
            <div>
              <h4 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Difficulty</h4>
              <div className="flex flex-wrap gap-1.5">
                {(["easy", "medium", "hard", "mixed"] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`rounded-lg px-4 py-2 text-xs font-semibold capitalize transition-all duration-200-all duration-200 ${
                      difficulty === d
                        ? "bg-[#3B82F6] text-white shadow-lg"
                        : "bg-white border border-gray-100 text-gray-600 hover:border-gray-200"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Count */}
            <div>
              <h4 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Count</h4>
              <div className="flex gap-1.5">
                {[1, 3, 5, 7, 10].map((n) => (
                  <button
                    key={n}
                    onClick={() => setCount(n)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold transition-all duration-200-all duration-200 ${
                      count === n
                        ? "bg-[#3B82F6] text-white shadow-lg"
                        : "bg-white border border-gray-100 text-gray-400 hover:border-gray-200"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Summary & Start */}
          <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Session</p>
              <p className="mt-0.5 text-sm font-bold text-gray-900">
                {count} {difficulty} • ~{estimatedTime}m
              </p>
            </div>
            <button
              onClick={startSession}
              className="w-full rounded-lg bg-[#3B82F6] px-6 py-2.5 text-sm font-bold text-white transition-all duration-200-all duration-200 hover:bg-[#2563EB] sm:w-auto cursor-pointer"
            >
              Generate Session
            </button>
          </div>
        </div>
      </Reveal>

      {/* Tips */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TIPS.map((tip, i) => (
          <Reveal key={tip.title} delayMs={i * 30}>
            <div className="rounded-xl border border-gray-100 bg-white p-4 space-y-1">
              <div className="h-px w-4 bg-gray-200" />
              <h5 className="text-xs font-bold text-gray-900">{tip.title}</h5>
              <p className="text-[10px] text-gray-500 leading-relaxed">{tip.description}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
