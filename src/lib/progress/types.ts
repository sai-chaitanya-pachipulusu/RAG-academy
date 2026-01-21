export type ProgressStatus = "not_started" | "in_progress" | "completed";

export type ChallengeProgress = {
  status: ProgressStatus;
  attempts: number;
  userCode: string | null;
  completedAt: string | null; // ISO string
};

export type LessonProgress = {
  status: ProgressStatus;
  completedAt: string | null; // ISO string
};

export type StreakState = {
  streakDays: number;
  lastActivityDate: string | null; // YYYY-MM-DD (local)
};

export type LocalProgressStateV1 = {
  version: 1;
  xp: number;
  streak: StreakState;
  challenges: Record<string, ChallengeProgress>;
  lessons: Record<string, LessonProgress>;
};


