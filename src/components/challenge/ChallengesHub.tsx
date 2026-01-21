"use client";

import { useState } from "react";
import { CatalogView } from "./CatalogView";
import { ProjectsView } from "./ProjectsView";
import { InterviewPrep } from "./InterviewPrep";
import { Reveal } from "@/components/ui/Reveal";

type Tab = "catalog" | "projects" | "interview";

const TABS: { id: Tab; label: string; description: string }[] = [
  { id: "catalog", label: "Challenges", description: "Bite-sized coding problems" },
  { id: "projects", label: "Projects", description: "End-to-end portfolio builds" },
  { id: "interview", label: "Interview Prep", description: "Timed technical assessments" },
];

export function ChallengesHub() {
  const [activeTab, setActiveTab] = useState<Tab>("catalog");

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <Reveal>
        <header>
          <div className="max-w-2xl space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
              Practice Hub
            </h1>
            <p className="text-base leading-relaxed text-zinc-500">
              Hands-on challenges, portfolio projects, and timed assessments.
            </p>
          </div>
        </header>
      </Reveal>

      {/* Tab Navigation */}
      <Reveal delayMs={100}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1 rounded-xl border border-zinc-100 bg-zinc-50/50 p-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute -bottom-1 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-zinc-900" />
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-zinc-400">
            {TABS.find(t => t.id === activeTab)?.description}
          </p>
        </div>
      </Reveal>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === "catalog" && <CatalogView />}
        {activeTab === "projects" && <ProjectsView />}
        {activeTab === "interview" && <InterviewPrep />}
      </div>
    </div>
  );
}
