import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as z from "zod/v4";

import { CURRICULUM_STAGE_IDS } from "@/lib/curriculum/stages";
import { MCP_DISPLAY_NAME, MCP_SERVER_ID } from "@/lib/mcp/branding";
import { buildCurriculumOutlineJson } from "@/lib/mcp/curriculumOutline";
import { MCP_SERVER_VERSION } from "@/lib/mcp/mcpMeta";
import { getPublicPricingSnapshot } from "@/lib/mcp/pricingPublic";
import {
  getAcademyContentDocument,
  getAcademyPricingSnapshot,
  getAcademyResearchFeed,
  getAcademyServerInfo,
  getAuthenticatedProgress,
  getAuthenticatedRecommendations,
  getChallengeDetail,
  getPlatformStatsSummary,
  listChallengeSummaries,
  searchAcademyContent,
} from "@/lib/mcp/ragAcademyTools";

/** Zod: allow any JSON-shaped tool result for structuredContent. */
const JsonObjectOutput = z.record(z.string(), z.unknown());

function toolResult(data: unknown) {
  const structured: Record<string, unknown> =
    data !== null && typeof data === "object" && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : { result: data as string | number | boolean | null };
  return {
    structuredContent: structured,
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

const server = new McpServer(
  { name: MCP_SERVER_ID, version: MCP_SERVER_VERSION },
  {
    instructions: [
      `${MCP_DISPLAY_NAME} (${MCP_SERVER_ID}): RAG Academy MCP — curriculum search, challenges, paginated lesson MDX bodies, public pricing, research RSS/arXiv feeds, and optional authenticated progress/recommendations.`,
      "Set RAG_ACADEMY_SITE_URL, NEXT_PUBLIC_APP_URL, or NEXT_PUBLIC_SITE_URL for absolute HTTPS links in responses.",
      "Search uses keyword overlap over a build-time index, not embeddings. Results include contentId where applicable (lesson/playbook ids, challenge:<slug>).",
      "Research feeds: 15s HTTP timeout per source; in-process cache TTL 1h per feed (see meta.feedCacheTtlMs).",
      "Auth: set RAG_ACADEMY_API_BASE_URL (or site URL) and RAG_ACADEMY_SUPABASE_ACCESS_TOKEN for progress and personalized recommendations.",
      "Pricing tiers mirror marketing ranges in-app (no payment product IDs). Prefer rag_academy_get_pricing in agent turns (includes meta + siteLinks); resource ragacademy://pricing/public is for MCP discovery/subscription. Checkout stays on /pricing and /checkout.",
      "In-process sliding-window rate limits on expensive tools (~60s). Set RAG_ACADEMY_MCP_DISABLE_RATE_LIMIT=true to bypass (development only).",
    ].join("\n"),
  }
);

const difficultySchema = z.enum(["easy", "medium", "hard"]);
const stageSchema = z.enum(CURRICULUM_STAGE_IDS);
const recommendationTypeSchema = z.enum(["personalized", "continue", "review", "goal"]);

server.registerResource(
  "curriculum_outline",
  "ragacademy://curriculum/outline",
  {
    description: "Challenge counts grouped by curriculum stage (JSON)",
    mimeType: "application/json",
  },
  async (uri) => ({
    contents: [
      {
        uri: uri.toString(),
        mimeType: "application/json",
        text: JSON.stringify(buildCurriculumOutlineJson(), null, 2),
      },
    ],
  })
);

server.registerResource(
  "pricing_public",
  "ragacademy://pricing/public",
  {
    description:
      "Public pricing phases and tier features (application/json). Same data as rag_academy_get_pricing omitting MCP meta wrapper; never includes Polar product IDs.",
    mimeType: "application/json",
  },
  async (uri) => ({
    contents: [
      {
        uri: uri.toString(),
        mimeType: "application/json",
        text: JSON.stringify(getPublicPricingSnapshot(), null, 2),
      },
    ],
  })
);

server.registerPrompt(
  "rag_academy_pricing_advisor",
  {
    title: "Answer pricing questions",
    description:
      "Ground tier and phase answers in rag_academy_get_pricing (tool-first). Link learners to siteLinks.pricingPagePath for checkout; never invent prices or SKUs.",
    argsSchema: {
      question: z.string().min(1).describe("Learner pricing question."),
      teamSize: z
        .number()
        .int()
        .min(1)
        .optional()
        .describe("Optional team headcount when recommending a tier."),
    },
  },
  async (args) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: [
            "Answer RAG Academy pricing using ONLY rag_academy_get_pricing.",
            "Do not read ragacademy://pricing/public unless the pricing tool is unavailable.",
            "Never invent prices, SKUs, Polar product IDs, or payment URLs.",
            "Quote tiers, phase name, and daysRemainingInCurrentPhase from tool output only.",
            "For signup or checkout, cite siteLinks.pricingPageUrl or siteLinks.pricingPagePath from the tool response.",
            args.teamSize ? `Team size to consider: ${args.teamSize}.` : "",
            `Question: ${args.question}`,
          ]
            .filter(Boolean)
            .join("\n"),
        },
      },
    ],
  })
);

server.registerPrompt(
  "rag_academy_study_plan",
  {
    title: "Build a study plan",
    description:
      "Turn a learning goal and weekly hours into a phased plan. Use tools rag_academy_search_content and rag_academy_list_challenges to ground URLs.",
    argsSchema: {
      goal: z
        .string()
        .min(1)
        .describe("What the learner wants to achieve, e.g. ship hybrid retrieval to production."),
      hoursPerWeek: z
        .number()
        .min(0.5)
        .max(80)
        .describe("Sustainable weekly study time."),
      currentStage: stageSchema
        .optional()
        .describe("Where they are in the roadmap, if known."),
    },
  },
  async (args) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: [
            "You are a RAG engineering mentor using RAG Academy curriculum only as citations.",
            `Learner goal: ${args.goal}`,
            `Time budget: ${args.hoursPerWeek} hours/week.`,
            args.currentStage ? `Current curriculum stage: ${args.currentStage}.` : "",
            "",
            "Steps: (1) Call rag_academy_search_content for subtopics. (2) List 2–4 challenge slugs with rag_academy_list_challenges. (3) Output a week-by-week plan with lesson/challenge paths and tradeoffs.",
            "If RAG_ACADEMY_SITE_URL or NEXT_PUBLIC_APP_URL is set, cite absolute URLs from tool results.",
          ]
            .filter(Boolean)
            .join("\n"),
        },
      },
    ],
  })
);

server.registerPrompt(
  "rag_academy_tutor_session",
  {
    title: "Grounded tutoring turn",
    description:
      "Ask the model to answer using rag_academy_get_content and rag_academy_search_content sources only.",
    argsSchema: {
      question: z.string().min(1).describe("Learner question."),
      sitePathHint: z
        .string()
        .optional()
        .describe(
          "Optional path like /learn/phase-2/hybrid-retrieval to fetch with rag_academy_get_content; use characterOffset for long lessons."
        ),
    },
  },
  async (args) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: [
            "Answer using ONLY RAG Academy MCP tools.",
            args.sitePathHint
              ? `First call rag_academy_get_content with sitePath: ${args.sitePathHint}.`
              : "First call rag_academy_search_content for relevant pages.",
            `Question: ${args.question}`,
            "Cite paths/URLs from tool output. If evidence is insufficient, say what to read next.",
          ].join("\n"),
        },
      },
    ],
  })
);

server.registerTool(
  "rag_academy_search_content",
  {
    title: "Search RAG Academy content",
    description:
      "Search lessons, playbooks, and challenges in the RAG Academy curriculum. Use this to find grounded learning material by topic.",
    inputSchema: z.object({
      query: z.string().min(1).max(4000).describe("Search query, for example 'hybrid retrieval'."),
      limit: z.number().int().min(1).max(20).optional().describe("Maximum number of results to return."),
    }),
    outputSchema: JsonObjectOutput,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async ({ query, limit }) => toolResult(await searchAcademyContent({ query, limit }))
);

server.registerTool(
  "rag_academy_list_challenges",
  {
    title: "List RAG Academy challenges",
    description:
      "List challenge summaries with optional filters for stage, group, difficulty, XP, and pagination.",
    inputSchema: z.object({
      stage: stageSchema.optional().describe("Curriculum stage id to filter by."),
      group: z.string().min(1).optional().describe("Exact challenge group/module name to filter by."),
      difficulty: difficultySchema.optional().describe("Challenge difficulty to filter by."),
      minXp: z.number().int().min(0).optional().describe("Minimum XP reward."),
      limit: z.number().int().min(1).max(100).optional().describe("Maximum number of challenges to return."),
      offset: z.number().int().min(0).optional().describe("Number of matching challenges to skip."),
    }),
    outputSchema: JsonObjectOutput,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  ({ stage, group, difficulty, minXp, limit, offset }) =>
    toolResult(listChallengeSummaries({ stage, group, difficulty, minXp, limit, offset }))
);

server.registerTool(
  "rag_academy_get_challenge",
  {
    title: "Get RAG Academy challenge",
    description:
      "Fetch a single challenge by slug. Starter and test code are included only when includeCode is true; solutions are never returned.",
    inputSchema: z.object({
      slug: z.string().min(1).describe("Challenge slug, for example 'cosine-similarity'."),
      includeCode: z
        .boolean()
        .optional()
        .describe("Include starterCode and testCode. Solutions are still omitted."),
    }),
    outputSchema: JsonObjectOutput,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  ({ slug, includeCode }) => toolResult(getChallengeDetail({ slug, includeCode }))
);

server.registerTool(
  "rag_academy_get_platform_stats",
  {
    title: "Get RAG Academy platform stats",
    description: "Return aggregate curriculum and challenge statistics.",
    inputSchema: z.object({}),
    outputSchema: JsonObjectOutput,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  () => toolResult(getPlatformStatsSummary())
);

server.registerTool(
  "rag_academy_server_info",
  {
    title: "Server info and discovery",
    description:
      "MCP capability summary: pricing tool/resource URIs, advertised resources, rate-limit env var.",
    inputSchema: z.object({}),
    outputSchema: JsonObjectOutput,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  () => toolResult(getAcademyServerInfo())
);

server.registerTool(
  "rag_academy_get_research_feed",
  {
    title: "Get RAG Academy research feed",
    description:
      "Fetch recent RAG, LLM security, community, and vector database items from configured research sources. Each source uses a 15s HTTP timeout; responses are cached 1h per source in-process.",
    inputSchema: z.object({
      sourceIds: z.array(z.string().min(1)).optional().describe("Source ids to include, such as 'arxiv-rag'."),
      tags: z.array(z.string().min(1)).optional().describe("Tags to include, such as 'rag' or 'security'."),
      limit: z.number().int().min(1).max(50).optional().describe("Maximum number of feed items to return."),
    }),
    outputSchema: JsonObjectOutput,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  async ({ sourceIds, tags, limit }) => toolResult(await getAcademyResearchFeed({ sourceIds, tags, limit }))
);

server.registerTool(
  "rag_academy_get_pricing",
  {
    title: "Get public pricing snapshot",
    description:
      "Preferred path for agent pricing answers: current marketing phases, tier features, siteLinks (/pricing, /checkout), and MCP meta. Does not expose payment product IDs.",
    inputSchema: z.object({}),
    outputSchema: JsonObjectOutput,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  () => toolResult(getAcademyPricingSnapshot())
);

server.registerTool(
  "rag_academy_get_content",
  {
    title: "Get lesson, playbook, or challenge MDX body",
    description:
      "Load MDX body (YAML frontmatter via gray-matter) for /learn/, /playbooks/, or /challenges/ paths. Use characterOffset + nextCharacterOffset to page long lessons.",
    inputSchema: z.object({
      sitePath: z
        .string()
        .min(1)
        .describe("e.g. /learn/phase-2/hybrid-retrieval or /playbooks/chunking-strategies"),
      maxChars: z.number().int().min(1000).max(500_000).optional(),
      characterOffset: z
        .number()
        .int()
        .min(0)
        .optional()
        .describe("Body slice offset; pass nextCharacterOffset from a previous response to continue."),
    }),
    outputSchema: JsonObjectOutput,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async ({ sitePath, maxChars, characterOffset }) =>
    toolResult(await getAcademyContentDocument({ sitePath, maxChars, characterOffset }))
);

server.registerTool(
  "rag_academy_get_my_progress",
  {
    title: "Get my progress (authenticated)",
    description:
      "Calls deployed /api/progress/sync with RAG_ACADEMY_SUPABASE_ACCESS_TOKEN. Requires RAG_ACADEMY_API_BASE_URL or public site URL.",
    inputSchema: z.object({}),
    outputSchema: JsonObjectOutput,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  async () => toolResult(await getAuthenticatedProgress())
);

server.registerTool(
  "rag_academy_get_my_recommendations",
  {
    title: "Get my recommendations (authenticated)",
    description:
      "Calls /api/recommendations with user id from the JWT. Types: personalized, continue, review, goal (needs goal text).",
    inputSchema: z.object({
      type: recommendationTypeSchema.optional().describe('Defaults to "personalized"'),
      limit: z.number().int().min(1).max(20).optional(),
      goal: z.string().optional().describe("Required when type is goal."),
    }),
    outputSchema: JsonObjectOutput,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  async (input) =>
    toolResult(
      await getAuthenticatedRecommendations({
        type: input.type ?? "personalized",
        limit: input.limit,
        goal: input.goal,
      })
    )
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
