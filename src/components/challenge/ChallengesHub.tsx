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
    <div className="space-y-12">
      {/* Header */}
      <Reveal>
        <header className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-[-0.03em] text-zinc-900 lg:text-5xl">
            Practice Hub
          </h1>
          <p className="text-lg text-zinc-500 max-w-xl">
            Hands-on challenges, portfolio projects, and timed assessments.
          </p>
        </header>
      </Reveal>

      {/* Tab Navigation */}
      <Reveal delayMs={100}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 p-1.5">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <p className="text-sm text-zinc-400">
            {TABS.find(t => t.id === activeTab)?.description}
          </p>
        </div>
      </Reveal>

      {/* Content */}
      <div className="min-h-[500px]">
        {activeTab === "catalog" && <CatalogView />}
        {activeTab === "projects" && <ProjectsView />}
        {activeTab === "interview" && <InterviewPrep />}
      </div>
    </div>
  );
}
