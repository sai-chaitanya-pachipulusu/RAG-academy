import { listLessonsByPhase, listPhases } from "@/lib/lessons/fs";
import { LearnHub } from "@/components/learn/LearnHub";

export default async function LearnPage() {
  const phases = await listPhases();
  const phaseBlocks = await Promise.all(
    phases.map(async (phase) => ({
      phase,
      lessons: await listLessonsByPhase(phase),
    }))
  );

  return <LearnHub phases={phases} phaseBlocks={phaseBlocks} />;
}


