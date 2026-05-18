import { CHALLENGES } from "@/lib/challenges/catalog";
import { CURRICULUM_STAGE_IDS, CURRICULUM_STAGE_LABELS, type CurriculumStage } from "@/lib/curriculum/stages";

export function buildCurriculumOutlineJson() {
  const byStage: Record<CurriculumStage, number> = {} as Record<CurriculumStage, number>;
  for (const id of CURRICULUM_STAGE_IDS) {
    byStage[id] = 0;
  }
  for (const c of CHALLENGES) {
    byStage[c.stage] = (byStage[c.stage] ?? 0) + 1;
  }

  const phases = CURRICULUM_STAGE_IDS.map((id) => ({
    id,
    label: CURRICULUM_STAGE_LABELS[id],
    challengeCount: byStage[id] ?? 0,
  }));

  return {
    generatedWith: "challenge_catalog" as const,
    totalChallenges: CHALLENGES.length,
    phases,
  };
}
