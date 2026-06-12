import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { completable } from "@modelcontextprotocol/sdk/server/completable.js";
import * as z from "zod/v4";

import { CURRICULUM_STAGE_IDS } from "@/lib/curriculum/stages";
import { MCP_DISPLAY_NAME, MCP_SERVER_ID } from "@/lib/mcp/branding";
import { buildCurriculumOutlineJson } from "@/lib/mcp/curriculumOutline";
import { buildLearningPath } from "@/lib/mcp/learningPath";
import { MCP_SERVER_VERSION } from "@/lib/mcp/mcpMeta";
import { getPublicPricingSnapshot } from "@/lib/mcp/pricingPublic";
import type { ApiConfig } from "@/lib/mcp/authApi";
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
import {
  completeChallengeSlug,
  completeCurriculumStage,
  completeLessonPhase,
  completeLessonSlug,
  completePlaybookSlug,
  completeSitePath,
  listChallengeResources,
  listLessonResources,
  listPlaybookResources,
} from "@/lib/mcp/resourceCatalog";
import { answerMcpQuestion, analyzeArchitectureMcp, type McpSampler } from "@/lib/mcp/ragQa";

/**
 * Per-connection context. The stdio server (user's machine) allows local LLM
 * keys and client sampling; the hosted HTTP endpoint disables both and injects
 * the caller's bearer token as the platform API credential instead.
 */
export type McpServerContext = {
  /**
   * Platform API credentials for answer/analyze/progress/recommendations.
   * `undefined` → resolve from env vars (stdio); `null` → none available
   * (anonymous HTTP caller).
   */
  apiConfig?: ApiConfig | null;
  /** Permit answering with OPENAI_API_KEY/ANTHROPIC_API_KEY from process env. Default true (stdio). */
  allowLocalLlm?: boolean;
  /** Offer MCP client sampling for Q&A. Default true; stateless HTTP sets false. */
  allowSampling?: boolean;
};

/**
 * Zod: allow any JSON-shaped tool result for structuredContent.
 * Must be an object schema (not z.record): the SDK's normalizeObjectSchema
 * returns undefined for non-object schemas and output validation then crashes,
 * breaking every tools/call. Verified by scripts/mcp-wire-check.mjs.
 */
const JsonObjectOutput = z.looseObject({});

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

const difficultySchema = z.enum(["easy", "medium", "hard"]);
const stageSchema = z.enum(CURRICULUM_STAGE_IDS);
const recommendationTypeSchema = z.enum(["personalized", "continue", "review", "goal"]);

/**
 * Optional prompt argument with autocompletion. The SDK checks the inner
 * schema to enable the completions capability but the outer schema when
 * serving completion/complete — so the completable marker must sit on both.
 *
 * `completable()` mutates its argument with a non-configurable property, and
 * this helper runs once per server instance (per HTTP request) — so both
 * schemas are cloned via `.describe()` first; marking a shared module-level
 * schema twice would throw "Cannot redefine property".
 */
function completableOptional(
  schema: z.ZodType,
  description: string,
  complete: (value: string) => string[]
) {
  const completeCb = (value: unknown) => complete(String(value ?? ""));
  const inner = completable(schema.describe(description), completeCb);
  return completable(inner.optional().describe(description), completeCb);
}

// --- Typed output schemas (loose: required fields validated, extras allowed) ---

const MetaOutput = z.looseObject({
  serverVersion: z.string(),
  searchPipeline: z.string(),
});

const SearchResultOutput = z.looseObject({
  type: z.enum(["lesson", "challenge", "playbook"]),
  title: z.string(),
  path: z.string(),
  url: z.string(),
  snippet: z.string(),
  score: z.number(),
});

const SearchOutput = z.looseObject({
  meta: MetaOutput,
  query: z.string(),
  queriesUsed: z.array(z.string()),
  fusion: z.enum(["rrf", "single"]),
  count: z.number(),
  results: z.array(SearchResultOutput),
});

const ChallengeSummaryOutput = z.looseObject({
  slug: z.string(),
  title: z.string(),
  stage: stageSchema,
  difficulty: difficultySchema,
  xpReward: z.number(),
  path: z.string(),
  url: z.string(),
});

const ListChallengesOutput = z.looseObject({
  meta: MetaOutput,
  pagination: z.looseObject({
    limit: z.number(),
    offset: z.number(),
    returned: z.number(),
    totalMatching: z.number(),
  }),
  challenges: z.array(ChallengeSummaryOutput),
});

const PathItemOutput = z.looseObject({ title: z.string(), path: z.string(), url: z.string() });

const LearningPathOutput = z.looseObject({
  meta: MetaOutput,
  goal: z.string(),
  queriesUsed: z.array(z.string()),
  estimate: z.looseObject({
    totalLessons: z.number(),
    totalChallenges: z.number(),
    estimatedHours: z.number(),
  }),
  steps: z.array(
    z.looseObject({
      order: z.number(),
      stage: stageSchema,
      stageLabel: z.string(),
      lessons: z.array(PathItemOutput),
      challenges: z.array(
        z.looseObject({
          slug: z.string(),
          title: z.string(),
          difficulty: difficultySchema,
          xpReward: z.number(),
          estimatedMinutes: z.number(),
          path: z.string(),
          url: z.string(),
        })
      ),
    })
  ),
  supportingPlaybooks: z.array(PathItemOutput),
  notes: z.array(z.string()),
});

/**
 * Bridge to MCP sampling: when the connected client advertises the sampling
 * capability, grounded Q&A runs on the client's own LLM — no API keys and no
 * platform quota. Returns undefined when the client cannot sample.
 */
function clientSampler(server: McpServer): McpSampler | undefined {
  if (!server.server.getClientCapabilities()?.sampling) return undefined;
  return async ({ system, prompt, maxTokens, temperature }) => {
    const result = await server.server.createMessage({
      messages: [{ role: "user", content: { type: "text", text: prompt } }],
      systemPrompt: system,
      maxTokens,
      temperature,
    });
    return result.content.type === "text" ? String(result.content.text) : "";
  };
}

const HTTP_AUTH_HINT =
  "Authentication required: pass 'Authorization: Bearer <your Supabase access token>' with the request.";

export function createRagAcademyMcpServer(ctx: McpServerContext = {}): McpServer {
  const allowSampling = ctx.allowSampling ?? true;

  /** Throws a friendly error for anonymous HTTP callers on authenticated tools. */
  function requireAuthConfig(): ApiConfig | undefined {
    if (ctx.apiConfig === null) throw new Error(HTTP_AUTH_HINT);
    return ctx.apiConfig;
  }

  const server = new McpServer(
    { name: MCP_SERVER_ID, version: MCP_SERVER_VERSION },
    {
      instructions: [
        `${MCP_DISPLAY_NAME} (${MCP_SERVER_ID}): RAG Academy MCP — curriculum search, challenges, learning paths, paginated lesson MDX bodies, public pricing, research RSS/arXiv feeds, grounded RAG Q&A, architecture analysis, and optional authenticated progress/recommendations.`,
        "Set RAG_ACADEMY_SITE_URL, NEXT_PUBLIC_APP_URL, or NEXT_PUBLIC_SITE_URL for absolute HTTPS links in responses.",
        "Search runs multi-query expansion (comparison splits, RAG-domain synonyms) fused with Reciprocal Rank Fusion over a build-time keyword index — the same RRF the curriculum teaches. No embeddings. Results include contentId where applicable (lesson/playbook ids, challenge:<slug>).",
        "Resource templates with argument autocompletion: ragacademy://lesson/{phase}/{slug} (markdown), ragacademy://playbook/{slug} (markdown), ragacademy://challenge/{slug} (JSON, no solutions).",
        "Research feeds: 15s HTTP timeout per source; in-process cache TTL 1h per feed (see meta.feedCacheTtlMs).",
        "Auth: over stdio set RAG_ACADEMY_API_BASE_URL (or site URL) and RAG_ACADEMY_SUPABASE_ACCESS_TOKEN; over HTTP pass 'Authorization: Bearer <Supabase access token>'. Needed for progress, recommendations, and platform-billed Q&A/analysis.",
        "rag_academy_answer answer paths, in order: (1) MCP client sampling (stdio) — your editor's own LLM, zero keys and zero quota; (2) platform API when authenticated (per-user daily quota enforced server-side); (3) local OPENAI_API_KEY/ANTHROPIC_API_KEY (stdio only). rag_academy_analyze_arch always requires the platform API; Pro tier is verified server-side.",
        "Pricing tiers mirror marketing ranges in-app (no payment product IDs). Prefer rag_academy_get_pricing in agent turns (includes meta + siteLinks); resource ragacademy://pricing/public is for MCP discovery/subscription. Checkout stays on /pricing and /checkout.",
        "In-process sliding-window rate limits on expensive tools (~60s). Set RAG_ACADEMY_MCP_DISABLE_RATE_LIMIT=true to bypass (development only).",
      ].join("\n"),
    }
  );

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

  server.registerResource(
    "lesson",
    new ResourceTemplate("ragacademy://lesson/{phase}/{slug}", {
      list: () => ({ resources: listLessonResources() }),
      complete: {
        phase: (value) => completeLessonPhase(String(value ?? "")),
        slug: (value, context) =>
          completeLessonSlug(String(value ?? ""), context?.arguments?.phase),
      },
    }),
    {
      description: "Lesson MDX body by phase and slug (text/markdown). Variables autocomplete.",
      mimeType: "text/markdown",
    },
    async (uri, variables) => {
      const phase = String(variables.phase ?? "");
      const slug = String(variables.slug ?? "");
      const doc = await getAcademyContentDocument({ sitePath: `/learn/${phase}/${slug}` });
      return {
        contents: [{ uri: uri.toString(), mimeType: "text/markdown", text: doc.body }],
      };
    }
  );

  server.registerResource(
    "playbook",
    new ResourceTemplate("ragacademy://playbook/{slug}", {
      list: () => ({ resources: listPlaybookResources() }),
      complete: {
        slug: (value) => completePlaybookSlug(String(value ?? "")),
      },
    }),
    {
      description: "Playbook MDX body by slug (text/markdown). Slug autocompletes.",
      mimeType: "text/markdown",
    },
    async (uri, variables) => {
      const slug = String(variables.slug ?? "");
      const doc = await getAcademyContentDocument({ sitePath: `/playbooks/${slug}` });
      return {
        contents: [{ uri: uri.toString(), mimeType: "text/markdown", text: doc.body }],
      };
    }
  );

  server.registerResource(
    "challenge",
    new ResourceTemplate("ragacademy://challenge/{slug}", {
      list: () => ({ resources: listChallengeResources() }),
      complete: {
        slug: (value) => completeChallengeSlug(String(value ?? "")),
      },
    }),
    {
      description:
        "Challenge detail JSON by slug (hints and metadata; never solutions). Slug autocompletes.",
      mimeType: "application/json",
    },
    async (uri, variables) => {
      const slug = String(variables.slug ?? "");
      const detail = getChallengeDetail({ slug, includeCode: true });
      return {
        contents: [
          {
            uri: uri.toString(),
            mimeType: "application/json",
            text: JSON.stringify(detail, null, 2),
          },
        ],
      };
    }
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
        currentStage: completableOptional(
          stageSchema,
          "Where they are in the roadmap, if known.",
          completeCurriculumStage
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
        sitePathHint: completableOptional(
          z.string(),
          "Optional path like /learn/phase-2/hybrid-retrieval to fetch with rag_academy_get_content; use characterOffset for long lessons.",
          completeSitePath
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
        "Search lessons, playbooks, and challenges in the RAG Academy curriculum. Multi-query expansion (comparisons, RAG-domain synonyms) fused with RRF. Use this to find grounded learning material by topic.",
      inputSchema: z.object({
        query: z.string().min(1).max(4000).describe("Search query, for example 'hybrid retrieval'."),
        limit: z.number().int().min(1).max(20).optional().describe("Maximum number of results to return."),
      }),
      outputSchema: SearchOutput,
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
      outputSchema: ListChallengesOutput,
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
    "rag_academy_get_learning_path",
    {
      title: "Build a goal-driven learning path",
      description:
        "Turn a learning goal into an ordered study path: relevant lessons and challenges selected by multi-query RRF retrieval, sequenced by the official curriculum stage order, with hour/week estimates. Deterministic — no LLM, free, reproducible.",
      inputSchema: z.object({
        goal: z
          .string()
          .min(3)
          .max(500)
          .describe("Learning goal, e.g. 'ship hybrid retrieval with reranking to production'."),
        hoursPerWeek: z
          .number()
          .min(0.5)
          .max(80)
          .optional()
          .describe("Sustainable weekly study hours; enables the week estimate."),
        currentStage: stageSchema
          .optional()
          .describe("Skip stages before this one (already covered)."),
        maxLessonsPerStage: z.number().int().min(1).max(5).optional(),
        maxChallengesPerStage: z.number().int().min(1).max(5).optional(),
      }),
      outputSchema: LearningPathOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ goal, hoursPerWeek, currentStage, maxLessonsPerStage, maxChallengesPerStage }) =>
      toolResult(
        await buildLearningPath({ goal, hoursPerWeek, currentStage, maxLessonsPerStage, maxChallengesPerStage })
      )
  );

  server.registerTool(
    "rag_academy_get_my_progress",
    {
      title: "Get my progress (authenticated)",
      description:
        "Calls deployed /api/progress/sync. Over stdio set RAG_ACADEMY_SUPABASE_ACCESS_TOKEN; over HTTP pass 'Authorization: Bearer <token>'.",
      inputSchema: z.object({}),
      outputSchema: JsonObjectOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async () => toolResult(await getAuthenticatedProgress(requireAuthConfig()))
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
        await getAuthenticatedRecommendations(
          {
            type: input.type ?? "personalized",
            limit: input.limit,
            goal: input.goal,
          },
          requireAuthConfig()
        )
      )
  );

  server.registerTool(
    "rag_academy_answer",
    {
      title: "Answer a RAG question",
      description:
        "Grounded Q&A using RAG Academy's curriculum content. Ask anything about RAG engineering — chunking, retrieval, reranking, evaluation, production. Returns answer with citations and evidence. Answer paths in order: MCP client sampling (stdio; zero config, uses your editor's LLM), platform API (authenticated; per-user daily quota), or local OPENAI_API_KEY/ANTHROPIC_API_KEY (stdio only).",
      inputSchema: z.object({
        question: z.string().min(1).max(4000).describe("The RAG engineering question to answer."),
      }),
      outputSchema: JsonObjectOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async ({ question }) =>
      toolResult(
        await answerMcpQuestion(
          { question },
          {
            sampler: allowSampling ? clientSampler(server) : undefined,
            apiConfig: ctx.apiConfig,
            allowLocalLlm: ctx.allowLocalLlm,
          }
        )
      )
  );

  server.registerTool(
    "rag_academy_analyze_arch",
    {
      title: "Analyze a RAG architecture (Pro)",
      description:
        "Submit a RAG architecture description for expert analysis against curriculum best practices. Returns strengths, risks, and ordered recommendations. Requires a Pro subscription verified server-side (stdio: RAG_ACADEMY_API_BASE_URL + RAG_ACADEMY_SUPABASE_ACCESS_TOKEN; HTTP: Authorization bearer token).",
      inputSchema: z.object({
        description: z.string().min(20).max(10000).describe("Detailed description of the user's RAG architecture, pipeline, or problem."),
      }),
      outputSchema: JsonObjectOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async ({ description }) =>
      toolResult(await analyzeArchitectureMcp({ description }, { apiConfig: ctx.apiConfig }))
  );

  return server;
}
