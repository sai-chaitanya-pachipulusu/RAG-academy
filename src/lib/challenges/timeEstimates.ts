// Time estimate utilities for challenges
// These defaults are used when a challenge doesn't have an explicit timeEstimate

export type TimeEstimate = {
  minutes: number;
  label: string;
};

// Default time estimates based on difficulty
export const DEFAULT_TIME_ESTIMATES: Record<string, TimeEstimate> = {
  easy: { minutes: 15, label: "10-20 min" },
  medium: { minutes: 35, label: "30-45 min" },
  hard: { minutes: 60, label: "45-90 min" },
};

// Get time estimate for a challenge
export function getTimeEstimate(
  difficulty: string,
  explicitEstimate?: TimeEstimate
): TimeEstimate {
  if (explicitEstimate) {
    return explicitEstimate;
  }
  return DEFAULT_TIME_ESTIMATES[difficulty] || DEFAULT_TIME_ESTIMATES.medium;
}

// Format time estimate for display
export function formatTimeEstimate(estimate: TimeEstimate): string {
  return estimate.label;
}

// Calculate total time for a learning path
export function calculatePathTime(
  challenges: Array<{ difficulty: string; timeEstimate?: TimeEstimate }>
): { totalMinutes: number; label: string } {
  const totalMinutes = challenges.reduce((sum, c) => {
    const estimate = getTimeEstimate(c.difficulty, c.timeEstimate);
    return sum + estimate.minutes;
  }, 0);

  // Format based on total time
  if (totalMinutes < 60) {
    return { totalMinutes, label: `${totalMinutes} min` };
  } else if (totalMinutes < 120) {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return { 
      totalMinutes, 
      label: mins > 0 ? `${hours}h ${mins}m` : `${hours} hour` 
    };
  } else {
    const hours = Math.round(totalMinutes / 60);
    return { totalMinutes, label: `~${hours} hours` };
  }
}
