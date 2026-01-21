import type { WeeklyEvent } from "./types";

/**
 * Weekly events schedule.
 * 
 * Events rotate weekly. The schedule is defined in advance
 * and the system automatically shows the current week's events.
 * 
 * Week start is Monday.
 */

export const WEEKLY_EVENTS_SCHEDULE: WeeklyEvent[] = [
  // Week 1: Foundations Focus
  {
    id: "w1-challenge",
    type: "weekly_challenge",
    title: "Foundation Friday: Vector Math Sprint",
    description: "Complete all vector math challenges (dot product, cosine similarity, euclidean distance) to earn bonus XP!",
    startDate: "2026-01-13",  // Monday
    endDate: "2026-01-19",    // Sunday
    challengeSlug: "dot-product",
    xpBonus: 100,
    icon: "⚡",
    bannerColor: "emerald",
  },
  {
    id: "w1-paper",
    type: "paper_of_the_week",
    title: "Paper Deep Dive: Original RAG Paper",
    description: "Read and discuss the foundational RAG paper by Lewis et al. (2020). Join the Discord for discussion!",
    startDate: "2026-01-13",
    endDate: "2026-01-19",
    paperUrl: "https://arxiv.org/abs/2005.11401",
    paperId: "lewis-2020-rag",
    icon: "📄",
    bannerColor: "blue",
  },
  
  // Week 2: Chunking Deep Dive
  {
    id: "w2-challenge",
    type: "weekly_challenge",
    title: "Chunking Championship",
    description: "Master chunking strategies: fixed-size, sentence-aware, and recursive. Complete all three for a special badge!",
    startDate: "2026-01-20",
    endDate: "2026-01-26",
    challengeSlug: "simple-chunking",
    xpBonus: 150,
    badgeId: "chunking-master",
    icon: "✂️",
    bannerColor: "amber",
  },
  {
    id: "w2-paper",
    type: "paper_of_the_week",
    title: "Paper: Sentence Transformers",
    description: "Understanding the embeddings that power semantic chunking and retrieval.",
    startDate: "2026-01-20",
    endDate: "2026-01-26",
    paperUrl: "https://arxiv.org/abs/1908.10084",
    paperId: "reimers-2019-sbert",
    icon: "📄",
    bannerColor: "purple",
  },

  // Week 3: Retrieval Wars
  {
    id: "w3-challenge",
    type: "weekly_challenge",
    title: "Retrieval Royale: BM25 vs Dense",
    description: "Implement both BM25 and dense retrieval, then fuse them with RRF. Best combined score wins!",
    startDate: "2026-01-27",
    endDate: "2026-02-02",
    challengeSlug: "bm25-from-scratch",
    xpBonus: 200,
    icon: "🏆",
    bannerColor: "red",
  },
  {
    id: "w3-paper",
    type: "paper_of_the_week",
    title: "Paper: Dense Passage Retrieval",
    description: "The paper that showed dense retrieval can beat BM25 for open-domain QA.",
    startDate: "2026-01-27",
    endDate: "2026-02-02",
    paperUrl: "https://arxiv.org/abs/2004.04906",
    paperId: "karpukhin-2020-dpr",
    icon: "📄",
    bannerColor: "indigo",
  },

  // Week 4: Reranking Revolution
  {
    id: "w4-challenge",
    type: "weekly_challenge",
    title: "Reranking Revolution",
    description: "Build a cascade reranker and beat the baseline by 20%. Efficiency + quality = victory!",
    startDate: "2026-02-03",
    endDate: "2026-02-09",
    challengeSlug: "rerank-cascade",
    xpBonus: 175,
    icon: "🔄",
    bannerColor: "cyan",
  },
  {
    id: "w4-workshop",
    type: "workshop",
    title: "Workshop: Production Reranking",
    description: "Live walkthrough of setting up Cohere Rerank in a production pipeline.",
    startDate: "2026-02-03",
    endDate: "2026-02-09",
    workshopUrl: "/workshops/production-reranking",
    icon: "🎥",
    bannerColor: "pink",
  },

  // Week 5: Evaluation Excellence
  {
    id: "w5-challenge",
    type: "weekly_challenge",
    title: "Evaluation Excellence",
    description: "Implement Recall@K, MRR, and nDCG. Test your retrieval pipeline like a pro!",
    startDate: "2026-02-10",
    endDate: "2026-02-16",
    challengeSlug: "evaluator-recall-at-k",
    xpBonus: 150,
    badgeId: "eval-expert",
    icon: "📊",
    bannerColor: "violet",
  },
  {
    id: "w5-paper",
    type: "paper_of_the_week",
    title: "Paper: RAGAS Evaluation Framework",
    description: "Learn the metrics that matter for RAG evaluation.",
    startDate: "2026-02-10",
    endDate: "2026-02-16",
    paperUrl: "https://arxiv.org/abs/2309.15217",
    paperId: "ragas-2023",
    icon: "📄",
    bannerColor: "teal",
  },

  // Week 6: Agentic Adventure
  {
    id: "w6-challenge",
    type: "weekly_challenge",
    title: "Agentic Adventure",
    description: "Build a ReAct agent from scratch. Chain of thought meets tool use!",
    startDate: "2026-02-17",
    endDate: "2026-02-23",
    challengeSlug: "react-implementation",
    xpBonus: 250,
    badgeId: "agent-architect",
    icon: "🤖",
    bannerColor: "orange",
  },
  {
    id: "w6-paper",
    type: "paper_of_the_week",
    title: "Paper: ReAct - Reasoning and Acting",
    description: "The foundational paper for LLM agents.",
    startDate: "2026-02-17",
    endDate: "2026-02-23",
    paperUrl: "https://arxiv.org/abs/2210.03629",
    paperId: "yao-2022-react",
    icon: "📄",
    bannerColor: "lime",
  },

  // Week 7: Security Sprint
  {
    id: "w7-challenge",
    type: "weekly_challenge",
    title: "Security Sprint",
    description: "Defend your RAG against prompt injection, PII leaks, and more. Become a RAG security expert!",
    startDate: "2026-02-24",
    endDate: "2026-03-02",
    challengeSlug: "prompt-injection-defense",
    xpBonus: 200,
    badgeId: "security-sentinel",
    icon: "🛡️",
    bannerColor: "slate",
  },
  {
    id: "w7-study",
    type: "study_group",
    title: "Study Group: RAG Security Best Practices",
    description: "Join the community discussion on securing RAG systems in production.",
    startDate: "2026-02-24",
    endDate: "2026-03-02",
    icon: "👥",
    bannerColor: "gray",
  },

  // Week 8: Production Perfection
  {
    id: "w8-challenge",
    type: "weekly_challenge",
    title: "Production Perfection",
    description: "Optimize your RAG for production: caching, rate limiting, and observability.",
    startDate: "2026-03-03",
    endDate: "2026-03-09",
    challengeSlug: "semantic-caching",
    xpBonus: 225,
    badgeId: "prod-pro",
    icon: "🚀",
    bannerColor: "sky",
  },
  {
    id: "w8-paper",
    type: "paper_of_the_week",
    title: "Paper: Scaling RAG Systems",
    description: "Best practices from industry for scaling RAG to millions of users.",
    startDate: "2026-03-03",
    endDate: "2026-03-09",
    paperUrl: "https://arxiv.org/abs/2312.10997",
    paperId: "gao-2023-survey",
    icon: "📄",
    bannerColor: "rose",
  },
];

/**
 * Get the start of the week (Monday) for a given date.
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get events for a specific week.
 */
export function getEventsForWeek(weekStart: Date): WeeklyEvent[] {
  const weekStartStr = weekStart.toISOString().split("T")[0];
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekEndStr = weekEnd.toISOString().split("T")[0];

  return WEEKLY_EVENTS_SCHEDULE.filter((event) => {
    // Event overlaps with this week
    return event.startDate <= weekEndStr && event.endDate >= weekStartStr;
  });
}

/**
 * Get current week's events.
 */
export function getCurrentWeekEvents(): WeeklyEvent[] {
  const now = new Date();
  const weekStart = getWeekStart(now);
  return getEventsForWeek(weekStart);
}

/**
 * Get upcoming events (next 2 weeks).
 */
export function getUpcomingEvents(): WeeklyEvent[] {
  const now = new Date();
  const weekStart = getWeekStart(now);
  
  // Next week
  const nextWeekStart = new Date(weekStart);
  nextWeekStart.setDate(nextWeekStart.getDate() + 7);
  
  // Week after
  const weekAfterStart = new Date(weekStart);
  weekAfterStart.setDate(weekAfterStart.getDate() + 14);
  
  return [
    ...getEventsForWeek(nextWeekStart),
    ...getEventsForWeek(weekAfterStart),
  ];
}

/**
 * Get event status based on current date.
 */
export function getEventStatus(event: WeeklyEvent): "upcoming" | "active" | "ended" {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  
  if (today < event.startDate) return "upcoming";
  if (today > event.endDate) return "ended";
  return "active";
}
