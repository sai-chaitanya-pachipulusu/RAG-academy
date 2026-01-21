export type LevelInfo = {
  level: number;
  title: string;
  xp: number;
  nextLevelXp: number | null;
  progressToNext: number | null; // 0..1
};

function titleForLevel(level: number) {
  if (level >= 26) return "RAG Master";
  if (level >= 21) return "RAG Expert";
  if (level >= 16) return "RAG Specialist";
  if (level >= 11) return "RAG Engineer";
  if (level >= 6) return "RAG Apprentice";
  return "RAG Novice";
}

const BASE_THRESHOLDS: Array<{ level: number; xp: number }> = [
  { level: 1, xp: 0 },
  { level: 2, xp: 100 },
  { level: 3, xp: 200 },
  { level: 4, xp: 300 },
  { level: 5, xp: 400 },
  { level: 6, xp: 500 },

  { level: 7, xp: 700 },
  { level: 8, xp: 900 },
  { level: 9, xp: 1100 },
  { level: 10, xp: 1300 },
  { level: 11, xp: 1500 },

  { level: 12, xp: 1900 },
  { level: 13, xp: 2300 },
  { level: 14, xp: 2700 },
  { level: 15, xp: 3100 },
  { level: 16, xp: 3500 },

  { level: 17, xp: 4100 },
  { level: 18, xp: 4700 },
  { level: 19, xp: 5300 },
  { level: 20, xp: 5900 },
  { level: 21, xp: 6500 },

  { level: 22, xp: 7200 },
  { level: 23, xp: 7900 },
  { level: 24, xp: 8600 },
  { level: 25, xp: 9300 },
  { level: 26, xp: 10000 },
];

export function getLevelInfo(xp: number): LevelInfo {
  const safeXp = Number.isFinite(xp) ? Math.max(0, Math.floor(xp)) : 0;

  // Level 26+ continues at +1000 XP per level (simple, predictable).
  if (safeXp >= 10000) {
    const extra = Math.floor((safeXp - 10000) / 1000);
    const level = 26 + extra;
    const baseXp = 10000 + extra * 1000;
    const nextLevelXp = baseXp + 1000;
    const progressToNext = (safeXp - baseXp) / 1000;
    return {
      level,
      title: titleForLevel(level),
      xp: safeXp,
      nextLevelXp,
      progressToNext,
    };
  }

  // Find highest threshold <= xp
  let current = BASE_THRESHOLDS[0]!;
  let next: (typeof BASE_THRESHOLDS)[number] | null = null;

  for (let i = 0; i < BASE_THRESHOLDS.length; i++) {
    const t = BASE_THRESHOLDS[i]!;
    if (t.xp <= safeXp) current = t;
    if (t.xp > safeXp) {
      next = t;
      break;
    }
  }

  const nextLevelXp = next?.xp ?? null;
  const progressToNext =
    nextLevelXp === null
      ? null
      : (safeXp - current.xp) / Math.max(1, nextLevelXp - current.xp);

  return {
    level: current.level,
    title: titleForLevel(current.level),
    xp: safeXp,
    nextLevelXp,
    progressToNext,
  };
}


