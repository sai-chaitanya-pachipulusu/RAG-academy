"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocalProgress } from "@/components/providers/LocalProgressProvider";

type Step = "welcome" | "experience" | "goals" | "time" | "complete";

interface OnboardingState {
  experience: "beginner" | "intermediate" | "advanced" | null;
  goals: string[];
  timePerWeek: "casual" | "moderate" | "intensive" | null;
}

const EXPERIENCE_LEVELS = [
  {
    id: "beginner",
    title: "New to RAG",
    description: "I've heard about RAG but haven't built anything yet",
    icon: "🌱",
    color: "emerald",
  },
  {
    id: "intermediate",
    title: "Some Experience",
    description: "I've built basic RAG pipelines and want to go deeper",
    icon: "🚀",
    color: "blue",
  },
  {
    id: "advanced",
    title: "Production Experience",
    description: "I've deployed RAG systems and want to optimize",
    icon: "⚡",
    color: "purple",
  },
] as const;

const GOALS = [
  { id: "job", label: "Land a job in AI/ML", icon: "💼" },
  { id: "product", label: "Build a RAG product", icon: "🏗️" },
  { id: "research", label: "Understand latest research", icon: "📚" },
  { id: "optimize", label: "Optimize existing systems", icon: "📈" },
  { id: "interview", label: "Prepare for interviews", icon: "🎯" },
  { id: "curiosity", label: "General curiosity", icon: "🧠" },
] as const;

const TIME_COMMITMENTS = [
  {
    id: "casual",
    title: "Casual",
    description: "1-2 hours/week",
    icon: "☕",
    challenges: "~2 challenges/week",
  },
  {
    id: "moderate",
    title: "Moderate",
    description: "3-5 hours/week",
    icon: "📖",
    challenges: "~5 challenges/week",
  },
  {
    id: "intensive",
    title: "Intensive",
    description: "6+ hours/week",
    icon: "🔥",
    challenges: "~10 challenges/week",
  },
] as const;

export function OnboardingFlow() {
  const router = useRouter();
  const { setState } = useLocalProgress();
  const [step, setStep] = useState<Step>("welcome");
  const [state, setOnboardingState] = useState<OnboardingState>({
    experience: null,
    goals: [],
    timePerWeek: null,
  });

  const completeOnboarding = () => {
    // Save preferences to local storage
    localStorage.setItem("rag_academy_onboarding", JSON.stringify({
      completed: true,
      ...state,
      completedAt: new Date().toISOString(),
    }));
    
    // Update progress state
    setState((prev) => ({
      ...prev,
      preferences: {
        experience: state.experience,
        goals: state.goals,
        timePerWeek: state.timePerWeek,
      },
    }));

    router.push("/learn");
  };

  const toggleGoal = (goalId: string) => {
    setOnboardingState((prev) => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter((g) => g !== goalId)
        : [...prev.goals, goalId],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8B5CF6]-50 via-white to-[#8B5CF6]-50">
      {/* Progress indicator */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-200-all duration-500 cursor-pointer"
          style={{
            width:
              step === "welcome"
                ? "0%"
                : step === "experience"
                ? "25%"
                : step === "goals"
                ? "50%"
                : step === "time"
                ? "75%"
                : "100%",
          }}
        />
      </div>

      <div className="mx-auto max-w-2xl px-6 py-20">
        {/* Welcome Step */}
        {step === "welcome" && (
          <div className="animate-fadeIn text-center">
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#8B5CF6]-900 to-[#8B5CF6]-700 text-3xl shadow-2xl">
              🎓
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              Welcome to RAG Academy
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Let's personalize your learning experience.
              <br />
              This takes about 30 seconds.
            </p>
            <button
              onClick={() => setStep("experience")}
              className="mt-10 inline-flex items-center gap-2 rounded-xl bg-[#8B5CF6] px-8 py-4 text-sm font-semibold text-white shadow-lg transition-all duration-200-all duration-200 hover:bg-[#7C3AED] hover:shadow-xl cursor-pointer"
            >
              Get Started
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>

            <button
              onClick={() => {
                localStorage.setItem("rag_academy_onboarding", JSON.stringify({ skipped: true }));
                router.push("/learn");
              }}
              className="mt-4 block w-full text-sm text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              Skip for now
            </button>
          </div>
        )}

        {/* Experience Step */}
        {step === "experience" && (
          <div className="animate-fadeIn">
            <button
              onClick={() => setStep("welcome")}
              className="mb-8 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              What's your experience with RAG?
            </h2>
            <p className="mt-2 text-gray-600">
              We'll customize your learning path based on your level.
            </p>

            <div className="mt-8 space-y-4">
              {EXPERIENCE_LEVELS.map((level) => (
                <button
                  key={level.id}
                  onClick={() => {
                    setOnboardingState((prev) => ({ ...prev, experience: level.id }));
                    setStep("goals");
                  }}
                  className={`group flex w-full items-center gap-4 rounded-2xl border-2 p-5 text-left transition-all duration-200-all duration-200 hover:shadow-lg ${
                    state.experience === level.id
                      ? "border-[#8B5CF6] bg-gray-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 text-2xl transition-all duration-200-transform group-hover:scale-110 cursor-pointer">
                    {level.icon}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">{level.title}</p>
                    <p className="text-sm text-gray-500">{level.description}</p>
                  </div>
                  <svg className="ml-auto h-5 w-5 text-gray-300 transition-all duration-200-all duration-200 group-hover:text-gray-600 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Goals Step */}
        {step === "goals" && (
          <div className="animate-fadeIn">
            <button
              onClick={() => setStep("experience")}
              className="mb-8 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              What are your goals?
            </h2>
            <p className="mt-2 text-gray-600">
              Select all that apply. We'll highlight relevant content.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {GOALS.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all duration-200-all duration-200 ${
                    state.goals.includes(goal.id)
                      ? "border-[#8B5CF6] bg-[#8B5CF6] text-white"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <span className="text-xl">{goal.icon}</span>
                  <span className="text-sm font-medium">{goal.label}</span>
                  {state.goals.includes(goal.id) && (
                    <svg className="ml-auto h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep("time")}
              disabled={state.goals.length === 0}
              className="mt-8 w-full rounded-xl bg-gray-900 py-4 text-sm font-semibold text-white transition-all duration-200-all duration-200 hover:bg-[#7C3AED] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        )}

        {/* Time Commitment Step */}
        {step === "time" && (
          <div className="animate-fadeIn">
            <button
              onClick={() => setStep("goals")}
              className="mb-8 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              How much time can you commit?
            </h2>
            <p className="mt-2 text-gray-600">
              We'll pace your learning accordingly.
            </p>

            <div className="mt-8 space-y-4">
              {TIME_COMMITMENTS.map((time) => (
                <button
                  key={time.id}
                  onClick={() => {
                    setOnboardingState((prev) => ({ ...prev, timePerWeek: time.id }));
                    setStep("complete");
                  }}
                  className={`group flex w-full items-center gap-4 rounded-2xl border-2 p-5 text-left transition-all duration-200-all duration-200 hover:shadow-lg ${
                    state.timePerWeek === time.id
                      ? "border-[#8B5CF6] bg-gray-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 text-2xl">
                    {time.icon}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{time.title}</p>
                    <p className="text-sm text-gray-500">{time.description}</p>
                  </div>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    {time.challenges}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Complete Step */}
        {step === "complete" && (
          <div className="animate-fadeIn text-center">
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 text-3xl shadow-2xl">
              ✨
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              You're all set!
            </h2>
            <p className="mt-4 text-gray-600">
              We've customized your learning path based on your preferences.
            </p>

            {/* Summary */}
            <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-6 text-left">
              <h3 className="font-semibold text-gray-900">Your Learning Plan</h3>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-sm">
                    {EXPERIENCE_LEVELS.find((l) => l.id === state.experience)?.icon}
                  </span>
                  <span className="text-sm text-gray-600">
                    Starting at{" "}
                    <strong className="text-gray-900">
                      {EXPERIENCE_LEVELS.find((l) => l.id === state.experience)?.title}
                    </strong>{" "}
                    level
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-sm">
                    🎯
                  </span>
                  <span className="text-sm text-gray-600">
                    <strong className="text-gray-900">{state.goals.length} goals</strong> to
                    focus on
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-sm">
                    {TIME_COMMITMENTS.find((t) => t.id === state.timePerWeek)?.icon}
                  </span>
                  <span className="text-sm text-gray-600">
                    <strong className="text-gray-900">
                      {TIME_COMMITMENTS.find((t) => t.id === state.timePerWeek)?.description}
                    </strong>{" "}
                    commitment
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={completeOnboarding}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#8B5CF6] px-8 py-4 text-sm font-semibold text-white shadow-lg transition-all duration-200-all duration-200 hover:bg-[#7C3AED] hover:shadow-xl cursor-pointer"
            >
              Start Learning
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* CSS for animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}

// Hook to check if user has completed onboarding
export function useOnboardingStatus() {
  if (typeof window === "undefined") return { completed: false, skipped: false };
  
  const stored = localStorage.getItem("rag_academy_onboarding");
  if (!stored) return { completed: false, skipped: false };
  
  const data = JSON.parse(stored);
  return {
    completed: data.completed ?? false,
    skipped: data.skipped ?? false,
    preferences: data.completed ? {
      experience: data.experience,
      goals: data.goals,
      timePerWeek: data.timePerWeek,
    } : null,
  };
}
