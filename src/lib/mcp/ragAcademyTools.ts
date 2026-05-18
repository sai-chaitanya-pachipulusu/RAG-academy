import {
  getAllChallenges,
  getChallengeBySlug,
  getPlatformStats,
} from "@/lib/challenges/catalog";
import type { Challenge, ChallengeDifficulty } from "@/lib/challenges/types";
import type { CurriculumStage } from "@/lib/curriculum/stages";
import { readAcademyDocument } from "@/lib/mcp/contentDocument";
import { MCP_DISPLAY_NAME, MCP_DOCS_PATH, MCP_SERVER_ID } from "@/lib/mcp/branding";
import { buildMcpMeta } from "@/lib/mcp/mcpMeta";
import { MCP_RATE_LIMITS, takeMcpRateSlot } from "@/lib/mcp/mcpRateLimit";
import { getPublicPricingSnapshot, PRICING_PAGE_PATH } from "@/lib/mcp/pricingPublic";
import { toAbsoluteSiteUrl, getPublicSiteOrigin } from "@/lib/mcp/siteUrl";
import {
  fetchMyProgress,
  fetchMyRecommendations,
  type RecommendationType,
} from "@/lib/mcp/authApi";
import { searchContent } from "@/lib/search/search";
import type { SearchResult } from "@/lib/search/types";
import { fetchFeed } from "@/lib/research/fetchFeed";
import { DEFAULT_FEED_SOURCES } from "@/lib/research/sources";
import type { FeedItem, FeedSource } from "@/lib/research/types";

const DEFAULT_LIMIT = 8;
const MAX_SEARCH_LIMIT = 20;
const MAX_CHALLENGE_LIMIT = 100;
const MAX_FEED_LIMIT = 50;

export type SearchAcademyContentInput = {
  query: string;
  limit?: number;
};

export type ListChallengeSummariesInput = {
  stage?: CurriculumStage;
  group?: string;
  difficulty?: ChallengeDifficulty;
  minXp?: number;
  limit?: number;
  offset?: number;
};

export type GetChallengeDetailInput = {
  slug: string;
  includeCode?: boolean;
};

export type GetAcademyResearchFeedInput = {
  sourceIds?: string[];
  tags?: string[];
  limit?: number;
};

export type GetAcademyContentInput = {
  /** Site path, e.g. /learn/phase-2/hybrid-retrieval or /challenges/rrf-fusion */
  sitePath: string;
  maxChars?: number;
  /** Read the next slice of MDX body; use `nextCharacterOffset` from a prior chunk. */
  characterOffset?: number;
};

type ChallengeSummary = Pick<
  Challenge,
  | "slug"
  | "title"
  | "description"
  | "stage"
  | "group"
  | "difficulty"
  | "xpReward"
  | "benchmark"
  | "complexity"
  | "realWorld"
  | "prerequisites"
  | "relatedChallenges"
  | "relatedPlaybooks"
  | "timeEstimate"
> & {
  path: string;
  url: string;
  hasSolution: boolean;
};

type ChallengeDetail = ChallengeSummary & {
  hints: string[];
  starterCode?: string;
  testCode?: string;
};

function clampLimit(limit: number | undefined, fallback: number, max: number) {
  if (!Number.isFinite(limit)) return fallback;
  return Math.max(1, Math.min(max, Math.trunc(limit ?? fallback)));
}

function normalizeOffset(offset: number | undefined) {
  if (!Number.isFinite(offset)) return 0;
  return Math.max(0, Math.trunc(offset ?? 0));
}

function challengePath(slug: string) {
  return `/challenges/${slug}`;
}

function absolutize(urlPath: string, origin: string | null) {
  return {
    path: urlPath,
    url: toAbsoluteSiteUrl(urlPath, origin),
  };
}

function withAbsoluteSearchResults(results: SearchResult[], origin: string | null) {
  return results.map((r) => {
    const { url, ...rest } = r;
    const abs = absolutize(url, origin);
    return { ...rest, path: abs.path, url: abs.url };
  });
}

function toChallengeSummary(challenge: Challenge, origin: string | null): ChallengeSummary {
  const p = challengePath(challenge.slug);
  const { path, url } = absolutize(p, origin);
  return {
    slug: challenge.slug,
    title: challenge.title,
    description: challenge.description,
    stage: challenge.stage,
    group: challenge.group,
    difficulty: challenge.difficulty,
    xpReward: challenge.xpReward,
    benchmark: challenge.benchmark,
    complexity: challenge.complexity,
    realWorld: challenge.realWorld,
    prerequisites: challenge.prerequisites,
    relatedChallenges: challenge.relatedChallenges,
    relatedPlaybooks: challenge.relatedPlaybooks,
    timeEstimate: challenge.timeEstimate,
    path,
    url,
    hasSolution: Boolean(challenge.solution),
  };
}

function toChallengeDetail(
  challenge: Challenge,
  includeCode: boolean,
  origin: string | null
): ChallengeDetail {
  const detail: ChallengeDetail = {
    ...toChallengeSummary(challenge, origin),
    hints: challenge.hints,
  };

  if (includeCode) {
    detail.starterCode = challenge.starterCode;
    detail.testCode = challenge.testCode;
  }

  return detail;
}

export async function searchAcademyContent({ query, limit }: SearchAcademyContentInput) {
  const origin = getPublicSiteOrigin();
  const normalizedQuery = query.trim();
  const normalizedLimit = clampLimit(limit, DEFAULT_LIMIT, MAX_SEARCH_LIMIT);
  const results = await searchContent(normalizedQuery, { limit: normalizedLimit });

  return {
    meta: buildMcpMeta(),
    query: normalizedQuery,
    limit: normalizedLimit,
    count: results.length,
    results: withAbsoluteSearchResults(results, origin),
  };
}

export function listChallengeSummaries(input: ListChallengeSummariesInput = {}) {
  const origin = getPublicSiteOrigin();
  const limit = clampLimit(input.limit, DEFAULT_LIMIT, MAX_CHALLENGE_LIMIT);
  const offset = normalizeOffset(input.offset);
  const group = input.group?.trim().toLowerCase();

  const matching = getAllChallenges().filter((challenge) => {
    if (input.stage && challenge.stage !== input.stage) return false;
    if (input.difficulty && challenge.difficulty !== input.difficulty) return false;
    if (typeof input.minXp === "number" && challenge.xpReward < input.minXp) return false;
    if (group && challenge.group.toLowerCase() !== group) return false;
    return true;
  });

  return {
    meta: buildMcpMeta(),
    filters: {
      stage: input.stage ?? null,
      group: input.group ?? null,
      difficulty: input.difficulty ?? null,
      minXp: input.minXp ?? null,
    },
    pagination: {
      limit,
      offset,
      returned: Math.max(0, Math.min(limit, matching.length - offset)),
      totalMatching: matching.length,
    },
    challenges: matching.slice(offset, offset + limit).map((c) => toChallengeSummary(c, origin)),
  };
}

export function getChallengeDetail({ slug, includeCode = false }: GetChallengeDetailInput) {
  const origin = getPublicSiteOrigin();
  const normalizedSlug = slug.trim();
  const challenge = getChallengeBySlug(normalizedSlug);

  if (!challenge) {
    throw new Error(`Challenge not found: ${normalizedSlug}`);
  }

  return {
    meta: buildMcpMeta(),
    challenge: toChallengeDetail(challenge, includeCode, origin),
  };
}

export function getPlatformStatsSummary() {
  return {
    meta: buildMcpMeta(),
    stats: getPlatformStats(),
  };
}

export function getAcademyPricingSnapshot() {
  return {
    meta: buildMcpMeta(),
    ...getPublicPricingSnapshot(),
  };
}

export function getAcademyServerInfo() {
  return {
    meta: buildMcpMeta(),
    displayName: MCP_DISPLAY_NAME,
    serverId: MCP_SERVER_ID,
    docsPath: MCP_DOCS_PATH,
    pricing: {
      tool: "rag_academy_get_pricing",
      resourceUri: "ragacademy://pricing/public",
      preferredForAgents: "tool",
      siteCheckoutPath: PRICING_PAGE_PATH,
      note: "Snapshots match in-app pricing config (marketing tiers only); no SKU or Polar product IDs. Send learners to siteLinks from tool/resource output for checkout.",
    },
    prompts: [
      {
        name: "rag_academy_pricing_advisor",
        description: "Ground pricing answers in rag_academy_get_pricing; link to /pricing for checkout.",
      },
      {
        name: "rag_academy_study_plan",
        description: "Build a curriculum-grounded study plan from search + challenges.",
      },
      {
        name: "rag_academy_tutor_session",
        description: "Grounded tutoring turn using search and get_content.",
      },
    ],
    tools: [
      "rag_academy_search_content",
      "rag_academy_list_challenges",
      "rag_academy_get_challenge",
      "rag_academy_get_platform_stats",
      "rag_academy_get_research_feed",
      "rag_academy_get_pricing",
      "rag_academy_get_content",
      "rag_academy_server_info",
      "rag_academy_get_my_progress",
      "rag_academy_get_my_recommendations",
    ],
    resources: [
      {
        uri: "ragacademy://curriculum/outline",
        description: "Challenge counts by curriculum stage (JSON).",
      },
      {
        uri: "ragacademy://pricing/public",
        description: "Public pricing phases and tiers (JSON, same data as rag_academy_get_pricing minus MCP meta wrapper).",
      },
    ],
    rateLimitDisableEnv: "RAG_ACADEMY_MCP_DISABLE_RATE_LIMIT",
  };
}

export async function getAcademyContentDocument({
  sitePath,
  maxChars,
  characterOffset,
}: GetAcademyContentInput) {
  takeMcpRateSlot("rag_academy_get_content", MCP_RATE_LIMITS.content);
  const origin = getPublicSiteOrigin();
  const doc = await readAcademyDocument(sitePath, { maxChars, characterOffset });
  const pathNorm = doc.sitePath.startsWith("/") ? doc.sitePath : `/${doc.sitePath}`;
  const { url } = absolutize(pathNorm, origin);

  return {
    meta: buildMcpMeta(),
    kind: doc.kind,
    path: pathNorm,
    url,
    sourceFile: doc.relativePath,
    frontmatter: doc.frontmatter,
    body: doc.body,
    truncated: doc.truncated,
    maxCharsApplied: doc.maxChars,
    characterOffsetApplied: doc.characterOffsetApplied,
    totalBodyChars: doc.totalBodyChars,
    nextCharacterOffset: doc.nextCharacterOffset,
    paginationNotes: doc.nextCharacterOffset
      ? [`Call rag_academy_get_content again with sitePath unchanged, characterOffset: ${doc.nextCharacterOffset}, and the same maxChars.`]
      : [],
  };
}

export async function getAcademyResearchFeed(
  input: GetAcademyResearchFeedInput = {},
  fetcher: (sources: FeedSource[]) => Promise<FeedItem[]> = fetchFeed
) {
  takeMcpRateSlot("rag_academy_get_research_feed", MCP_RATE_LIMITS.researchFeed);
  const limit = clampLimit(input.limit, DEFAULT_LIMIT, MAX_FEED_LIMIT);
  const sourceIds = new Set(input.sourceIds ?? []);
  const tags = new Set((input.tags ?? []).map((tag) => tag.toLowerCase()));

  const sources = DEFAULT_FEED_SOURCES.filter((source) => {
    if (sourceIds.size > 0 && !sourceIds.has(source.id)) return false;
    if (tags.size > 0 && !source.tags.some((tag) => tags.has(tag.toLowerCase()))) return false;
    return true;
  });

  const items = (await fetcher(sources)).slice(0, limit);

  return {
    meta: buildMcpMeta(),
    limit,
    count: items.length,
    sources: sources.map((source) => source.id),
    sourceDetails: sources.map((s) => ({
      id: s.id,
      title: s.title,
      kind: s.kind,
    })),
    items,
    notes: [
      "Each source fetch uses a 15s HTTP timeout; slow feeds return empty for that source.",
      "Successful responses are cached in-process for 1 hour per feed (see feedCacheTtlMs).",
    ],
  };
}

export async function getAuthenticatedProgress() {
  takeMcpRateSlot("rag_academy_get_my_progress", MCP_RATE_LIMITS.authenticated);
  const json = await fetchMyProgress();
  return {
    meta: buildMcpMeta(),
    progress: json,
  };
}

export async function getAuthenticatedRecommendations(input: {
  type?: RecommendationType;
  limit?: number;
  goal?: string;
}) {
  const type = input.type ?? "personalized";
  takeMcpRateSlot("rag_academy_get_my_recommendations", MCP_RATE_LIMITS.authenticated);
  const limit = clampLimit(input.limit, 5, 20);
  const json = await fetchMyRecommendations({
    type,
    limit,
    goal: input.goal,
  });
  return {
    meta: buildMcpMeta(),
    recommendationType: type,
    data: json,
  };
}
