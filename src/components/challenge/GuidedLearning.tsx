"use client";

import { useState } from "react";

interface Props {
  challengeSlug: string;
  title: string;
  difficulty: string;
  onStartChallenge?: () => void;
}

// Learning stages based on educational psychology
type LearningStage = "motivation" | "analogy" | "example" | "practice" | "challenge";

export function GuidedLearning({ challengeSlug, title, difficulty, onStartChallenge }: Props) {
  const [currentStage, setCurrentStage] = useState<LearningStage>("motivation");
  const [stagesCompleted, setStagesCompleted] = useState<Set<LearningStage>>(new Set());

  const stages: { id: LearningStage; label: string; icon: string }[] = [
    { id: "motivation", label: "Why Learn This?", icon: "🎯" },
    { id: "analogy", label: "Mental Model", icon: "🧠" },
    { id: "example", label: "Worked Example", icon: "📖" },
    { id: "practice", label: "Guided Practice", icon: "✍️" },
    { id: "challenge", label: "Full Challenge", icon: "🚀" },
  ];

  const completeStage = (stage: LearningStage) => {
    setStagesCompleted(prev => new Set([...prev, stage]));
    const stageIndex = stages.findIndex(s => s.id === stage);
    if (stageIndex < stages.length - 1) {
      setCurrentStage(stages[stageIndex + 1].id);
    }
  };

  // Get content based on challenge (this would be dynamic in production)
  const getContent = () => {
    // Default content - in production, this would come from a database
    return {
      motivation: {
        realWorld: "This concept is used by companies like Google, Netflix, and Spotify to power their search and recommendation systems.",
        problems: [
          "How does Spotify find songs similar to your favorites?",
          "How does Google rank search results?",
          "How do chatbots understand your questions?"
        ],
        impact: "Understanding this opens doors to ML engineering, search systems, and AI applications."
      },
      analogy: {
        title: "Think of it like organizing a library...",
        description: "Imagine you're a librarian trying to find books similar to one a customer likes. Instead of reading every book (slow!), you could represent each book as a point in space based on its topics. Similar books would be close together.",
        visual: "📚 → 🔢 → 📍 → 🎯",
        connection: "That's exactly what this algorithm does with text/data!"
      },
      example: {
        problem: "Find the most similar document to a query",
        steps: [
          { code: "# Step 1: Represent data as vectors", explanation: "Convert text to numbers that capture meaning" },
          { code: "query = [0.2, 0.8, 0.3]", explanation: "Our search query as a vector" },
          { code: "docs = [[0.1, 0.9, 0.2], [0.8, 0.1, 0.7]]", explanation: "Documents in vector form" },
          { code: "# Step 2: Calculate similarity", explanation: "Compare vectors using distance/similarity" },
          { code: "similarities = [cosine_sim(query, d) for d in docs]", explanation: "Higher = more similar" },
          { code: "best_match = docs[argmax(similarities)]", explanation: "Return the closest match!" }
        ]
      },
      practice: {
        warmup: "Now let's practice with simplified inputs...",
        hint: "Don't worry about perfection. Focus on understanding the pattern."
      },
      encouragement: [
        "Struggling is part of learning. Every expert was once a beginner.",
        "Take your time. Deep understanding beats fast completion.",
        "If stuck, that's your brain growing new neural pathways!",
        "You're building skills that compound over time."
      ]
    };
  };

  const content = getContent();
  const progress = (stagesCompleted.size / stages.length) * 100;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 text-white">
        <div className="flex items-center gap-2 text-violet-200">
          <span>📚</span>
          <span className="text-sm font-medium">Guided Learning Mode</span>
        </div>
        <h2 className="mt-3 text-2xl font-bold lg:text-3xl">{title}</h2>
        <p className="mt-2 text-violet-100">
          Learn step-by-step with context, examples, and encouragement
        </p>

        {/* Stage Progress */}
        <div className="mt-6 flex items-center gap-1">
          {stages.map((stage, i) => (
            <div key={stage.id} className="flex items-center">
              <button
                onClick={() => setCurrentStage(stage.id)}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200-all duration-200 ${
                  currentStage === stage.id
                    ? "bg-white text-violet-700"
                    : stagesCompleted.has(stage.id)
                      ? "bg-emerald-400 text-white"
                      : "bg-white/20 text-white/80 hover:bg-white/30"
                }`}
              >
                <span>{stage.icon}</span>
                <span className="hidden sm:inline">{stage.label}</span>
              </button>
              {i < stages.length - 1 && (
                <div className={`mx-1 h-0.5 w-4 ${stagesCompleted.has(stage.id) ? "bg-emerald-400" : "bg-white/30"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stage Content */}
      <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-[#2563EB]">
        
        {/* Stage 1: Motivation */}
        {currentStage === "motivation" && (
          <div className="space-y-8">
            <div>
              <h3 className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-gray-100">
                <span className="text-3xl">🎯</span>
                Why Learn This?
              </h3>
              <p className="mt-2 text-gray-500">Understanding the "why" makes the "how" much easier</p>
            </div>

            {/* Real-world usage */}
            <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:from-blue-950/30 dark:to-indigo-950/30">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">🌍 Real-World Impact</h4>
              <p className="mt-2 text-blue-800 dark:text-blue-200">{content.motivation.realWorld}</p>
            </div>

            {/* Problems it solves */}
            <div>
              <h4 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">💡 Problems You'll Be Able to Solve:</h4>
              <div className="grid gap-3">
                {content.motivation.problems.map((problem, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                      {i + 1}
                    </span>
                    <p className="text-gray-700 dark:text-gray-300">{problem}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Career impact */}
            <div className="rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50 p-6 dark:border-emerald-800 dark:bg-emerald-950/30">
              <h4 className="font-semibold text-emerald-800 dark:text-emerald-200">🚀 Career Value</h4>
              <p className="mt-2 text-emerald-700 dark:text-emerald-300">{content.motivation.impact}</p>
            </div>

            <button
              onClick={() => completeStage("motivation")}
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200-all duration-200 hover:from-violet-500 hover:to-indigo-500 cursor-pointer"
            >
              I'm Motivated! Show Me The Concept →
            </button>
          </div>
        )}

        {/* Stage 2: Analogy */}
        {currentStage === "analogy" && (
          <div className="space-y-8">
            <div>
              <h3 className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-gray-100">
                <span className="text-3xl">🧠</span>
                Build Your Mental Model
              </h3>
              <p className="mt-2 text-gray-500">Connect new concepts to things you already understand</p>
            </div>

            {/* Main analogy */}
            <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-8 dark:from-amber-950/30 dark:to-orange-950/30">
              <h4 className="text-xl font-bold text-amber-900 dark:text-amber-100">
                {content.analogy.title}
              </h4>
              <p className="mt-4 text-lg leading-relaxed text-amber-800 dark:text-amber-200">
                {content.analogy.description}
              </p>
              
              {/* Visual flow */}
              <div className="mt-6 flex items-center justify-center gap-4 text-4xl">
                {content.analogy.visual.split(" → ").map((emoji, i, arr) => (
                  <div key={i} className="flex items-center gap-4">
                    <span>{emoji}</span>
                    {i < arr.length - 1 && <span className="text-amber-400">→</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Connection to code */}
            <div className="rounded-xl border-2 border-violet-200 bg-violet-50 p-6 dark:border-violet-900 dark:bg-violet-950/30">
              <h4 className="font-semibold text-violet-800 dark:text-violet-200">🔗 The Connection</h4>
              <p className="mt-2 text-lg text-violet-700 dark:text-violet-300">{content.analogy.connection}</p>
            </div>

            {/* Growth mindset message */}
            <div className="flex items-start gap-4 rounded-xl bg-gray-100 p-6 dark:bg-gray-900">
              <span className="text-3xl">💪</span>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Remember</h4>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  {content.encouragement[Math.floor(Math.random() * content.encouragement.length)]}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStage("motivation")}
                className="rounded-xl border-2 border-gray-200 px-6 py-4 font-medium text-gray-600 transition-all duration-200-all duration-200 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-400 cursor-pointer"
              >
                ← Back
              </button>
              <button
                onClick={() => completeStage("analogy")}
                className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200-all duration-200 hover:from-violet-500 hover:to-indigo-500 cursor-pointer"
              >
                Got It! Show Me An Example →
              </button>
            </div>
          </div>
        )}

        {/* Stage 3: Worked Example */}
        {currentStage === "example" && (
          <div className="space-y-8">
            <div>
              <h3 className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-gray-100">
                <span className="text-3xl">📖</span>
                Worked Example
              </h3>
              <p className="mt-2 text-gray-500">Watch how an expert solves a similar problem</p>
            </div>

            {/* Problem statement */}
            <div className="rounded-xl bg-gray-100 p-6 dark:bg-gray-900">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">📋 Problem</h4>
              <p className="mt-2 text-lg text-gray-700 dark:text-gray-300">{content.example.problem}</p>
            </div>

            {/* Step-by-step solution */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">🔍 Solution Walkthrough</h4>
              
              {content.example.steps.map((step, i) => (
                <div key={i} className="rounded-xl border border-gray-200 overflow-hidden dark:border-gray-800">
                  <div className="bg-[#2563EB] p-4">
                    <code className="text-sm text-emerald-400">{step.code}</code>
                  </div>
                  <div className="bg-emerald-50 p-4 dark:bg-emerald-950/30">
                    <div className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-200 text-xs font-bold text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200">
                        {i + 1}
                      </span>
                      <p className="text-emerald-800 dark:text-emerald-200">{step.explanation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Key insight */}
            <div className="flex items-start gap-4 rounded-xl bg-yellow-50 p-6 dark:bg-yellow-950/30">
              <span className="text-3xl">💡</span>
              <div>
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Key Insight</h4>
                <p className="mt-1 text-yellow-700 dark:text-yellow-300">
                  The pattern is: Convert → Compare → Return Best. Most retrieval algorithms follow this structure!
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStage("analogy")}
                className="rounded-xl border-2 border-gray-200 px-6 py-4 font-medium text-gray-600 transition-all duration-200-all duration-200 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-400 cursor-pointer"
              >
                ← Back
              </button>
              <button
                onClick={() => completeStage("example")}
                className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200-all duration-200 hover:from-violet-500 hover:to-indigo-500 cursor-pointer"
              >
                I Understand! Let Me Practice →
              </button>
            </div>
          </div>
        )}

        {/* Stage 4: Guided Practice */}
        {currentStage === "practice" && (
          <div className="space-y-8">
            <div>
              <h3 className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-gray-100">
                <span className="text-3xl">✍️</span>
                Guided Practice
              </h3>
              <p className="mt-2 text-gray-500">Apply what you've learned with training wheels</p>
            </div>

            <div className="rounded-xl bg-indigo-50 p-6 dark:bg-indigo-950/30">
              <p className="text-lg text-indigo-800 dark:text-indigo-200">{content.practice.warmup}</p>
              <p className="mt-2 text-indigo-600 dark:text-indigo-400">{content.practice.hint}</p>
            </div>

            {/* Simplified practice area */}
            <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-900">
              <span className="text-5xl">🎯</span>
              <h4 className="mt-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
                Ready for the Challenge?
              </h4>
              <p className="mt-2 text-gray-500">
                You've built context, seen examples, and understand the pattern.<br/>
                Now it's time to write the code yourself!
              </p>
            </div>

            {/* Encouragement */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-emerald-50 p-5 dark:bg-emerald-950/30">
                <span className="text-2xl">✅</span>
                <h5 className="mt-2 font-semibold text-emerald-800 dark:text-emerald-200">You Know Why</h5>
                <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">Real-world applications are clear</p>
              </div>
              <div className="rounded-xl bg-blue-50 p-5 dark:bg-blue-950/30">
                <span className="text-2xl">✅</span>
                <h5 className="mt-2 font-semibold text-blue-800 dark:text-blue-200">You Have a Model</h5>
                <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">The analogy connects to prior knowledge</p>
              </div>
              <div className="rounded-xl bg-purple-50 p-5 dark:bg-purple-950/30">
                <span className="text-2xl">✅</span>
                <h5 className="mt-2 font-semibold text-purple-800 dark:text-purple-200">You've Seen It Done</h5>
                <p className="mt-1 text-sm text-purple-600 dark:text-purple-400">The worked example shows the pattern</p>
              </div>
              <div className="rounded-xl bg-amber-50 p-5 dark:bg-amber-950/30">
                <span className="text-2xl">💪</span>
                <h5 className="mt-2 font-semibold text-amber-800 dark:text-amber-200">You're Ready</h5>
                <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">Trust the process!</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStage("example")}
                className="rounded-xl border-2 border-gray-200 px-6 py-4 font-medium text-gray-600 transition-all duration-200-all duration-200 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-400 cursor-pointer"
              >
                ← Review Example
              </button>
              <button
                onClick={() => {
                  completeStage("practice");
                  onStartChallenge?.();
                }}
                className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200-all duration-200 hover:from-emerald-500 hover:to-teal-500 cursor-pointer"
              >
                🚀 Start the Challenge!
              </button>
            </div>
          </div>
        )}

        {/* Stage 5: Challenge (redirect) */}
        {currentStage === "challenge" && (
          <div className="space-y-8 text-center">
            <span className="text-6xl">🎉</span>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              You're Ready!
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              You've completed all preparation stages. Now tackle the full challenge with confidence!
            </p>
            <button
              onClick={onStartChallenge}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200-all duration-200 hover:from-emerald-500 hover:to-teal-500 cursor-pointer"
            >
              Open Challenge Editor →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Styling helper for creating a toggle button in parent components
export const guidedLearningToggleStyles = {
  enabled: "flex items-center gap-3 rounded-xl px-5 py-3 text-sm font-medium transition-all duration-200-all duration-200 bg-violet-100 text-violet-700 ring-2 ring-violet-300 dark:bg-violet-950/50 dark:text-violet-300 dark:ring-violet-800",
  disabled: "flex items-center gap-3 rounded-xl px-5 py-3 text-sm font-medium transition-all duration-200-all duration-200 bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-[#2563EB] dark:text-gray-400 dark:hover:bg-gray-700",
};

