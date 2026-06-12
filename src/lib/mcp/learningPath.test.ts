import { describe, expect, it } from "vitest";

import { CURRICULUM_STAGE_IDS } from "@/lib/curriculum/stages";
import { buildLearningPath } from "@/lib/mcp/learningPath";

const stageRank = new Map(CURRICULUM_STAGE_IDS.map((stage, index) => [stage, index]));

describe("buildLearningPath", () => {
  it("builds an ordered path with per-stage caps and a week estimate", async () => {
    const path = await buildLearningPath({
      goal: "ship hybrid retrieval with reranking and evaluation to production",
      hoursPerWeek: 5,
    });

    expect(path.steps.length).toBeGreaterThan(0);
    expect(path.estimate.totalLessons + path.estimate.totalChallenges).toBeGreaterThan(0);
    expect(path.estimate.estimatedHours).toBeGreaterThan(0);
    expect(path.estimate.estimatedWeeks).toBeGreaterThanOrEqual(1);

    for (let i = 0; i < path.steps.length; i += 1) {
      const step = path.steps[i]!;
      expect(step.order).toBe(i + 1);
      expect(step.lessons.length).toBeLessThanOrEqual(3);
      expect(step.challenges.length).toBeLessThanOrEqual(2);
      if (i > 0) {
        expect(stageRank.get(step.stage)!).toBeGreaterThan(stageRank.get(path.steps[i - 1]!.stage)!);
      }
    }
  });

  it("skips stages the learner already covered", async () => {
    const path = await buildLearningPath({
      goal: "hybrid retrieval reranking evaluation production",
      currentStage: "post-retrieval",
    });

    const minRank = stageRank.get("post-retrieval")!;
    for (const step of path.steps) {
      expect(stageRank.get(step.stage)!).toBeGreaterThanOrEqual(minRank);
    }
    expect(path.notes.some((n) => n.includes("post-retrieval"))).toBe(true);
  });

  it("returns an empty path with guidance for an unmatched goal", async () => {
    const path = await buildLearningPath({ goal: "qqqq zzzz xxxx" });
    expect(path.steps).toEqual([]);
    expect(path.notes.some((n) => /no curriculum matches/i.test(n))).toBe(true);
  });

  it("absolutizes urls when a site origin is configured", async () => {
    const prev = process.env.RAG_ACADEMY_SITE_URL;
    process.env.RAG_ACADEMY_SITE_URL = "https://example.com";
    try {
      const path = await buildLearningPath({ goal: "chunking strategies for retrieval" });
      const first = path.steps[0]?.lessons[0] ?? path.steps[0]?.challenges[0];
      expect(first?.url).toMatch(/^https:\/\/example\.com\//);
      expect(first?.path).toMatch(/^\//);
    } finally {
      if (prev === undefined) delete process.env.RAG_ACADEMY_SITE_URL;
      else process.env.RAG_ACADEMY_SITE_URL = prev;
    }
  });
});
