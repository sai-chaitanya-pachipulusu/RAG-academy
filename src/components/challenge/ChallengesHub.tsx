"use client";

import { useState } from "react";
import { CatalogView } from "./CatalogView";
import { ProjectsView } from "./ProjectsView";
import { InterviewPrep } from "./InterviewPrep";

type Tab = "catalog" | "projects" | "interview";

const TABS: { id: Tab; label: string }[] = [
  { id: "catalog", label: "Challenges" },
  { id: "projects", label: "Projects" },
  { id: "interview", label: "Interview Prep" },
];

export function ChallengesHub() {
  const [activeTab, setActiveTab] = useState<Tab>("catalog");

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Practice Hub</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {TABS.find(t => t.id === activeTab)?.label === "Challenges" && "Bite-sized coding problems"}
            {TABS.find(t => t.id === activeTab)?.label === "Projects" && "End-to-end portfolio builds"}
            {TABS.find(t => t.id === activeTab)?.label === "Interview Prep" && "Timed technical assessments"}
          </p>
        </div>
      </div>

      <div className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
              activeTab === tab.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {activeTab === "catalog" && <CatalogView />}
        {activeTab === "projects" && <ProjectsView />}
        {activeTab === "interview" && <InterviewPrep />}
      </div>
    </div>
  );
}
