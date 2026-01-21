import type { LocalProgressState } from "@/lib/progress/localStore";

type RemoteProfile = {
  xp: number | null;
  streak_days: number | null;
  last_activity_date: string | null;
} | null;

type RemoteChallengeRow = {
  challenge_slug: string;
  status: "not_started" | "in_progress" | "completed";
  attempts: number | null;
  user_code: string | null;
  completed_at: string | null;
};

export function mergeRemoteIntoLocal(
  local: LocalProgressState,
  remote: { profile: RemoteProfile; challenges: RemoteChallengeRow[] }
): LocalProgressState {
  const next: LocalProgressState = {
    ...local,
    challenges: { ...local.challenges },
    lessons: { ...local.lessons },
    streak: { ...local.streak },
  };

  if (remote.profile) {
    const remoteXp = remote.profile.xp ?? 0;
    next.xp = Math.max(next.xp, remoteXp);

    const remoteStreak = remote.profile.streak_days ?? 0;
    next.streak.streakDays = Math.max(next.streak.streakDays, remoteStreak);

    if (remote.profile.last_activity_date) {
      // Prefer whichever is later lexicographically (YYYY-MM-DD).
      const localDate = next.streak.lastActivityDate;
      next.streak.lastActivityDate =
        !localDate || remote.profile.last_activity_date > localDate
          ? remote.profile.last_activity_date
          : localDate;
    }
  }

  for (const row of remote.challenges) {
    const slug = row.challenge_slug;
    const localRow = next.challenges[slug];

    if (!localRow) {
      next.challenges[slug] = {
        status: row.status,
        attempts: row.attempts ?? 0,
        userCode: row.user_code ?? null,
        completedAt: row.completed_at ?? null,
      };
      continue;
    }

    const mergedStatus =
      localRow.status === "completed" || row.status === "completed"
        ? "completed"
        : localRow.status === "in_progress" || row.status === "in_progress"
          ? "in_progress"
          : "not_started";

    next.challenges[slug] = {
      status: mergedStatus,
      attempts: Math.max(localRow.attempts, row.attempts ?? 0),
      userCode: localRow.userCode ?? (row.user_code ?? null),
      completedAt:
        row.completed_at && localRow.completedAt
          ? row.completed_at > localRow.completedAt
            ? row.completed_at
            : localRow.completedAt
          : row.completed_at ?? localRow.completedAt,
    };
  }

  return next;
}


