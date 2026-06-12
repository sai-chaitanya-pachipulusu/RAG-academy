/** Consumer-facing name for the RAG Academy MCP server. */
export const MCP_DISPLAY_NAME = "Curriculum Compass";

/** MCP protocol server id (use as the key in client config files). */
export const MCP_SERVER_ID = "curriculum-compass";

export const MCP_TAGLINE =
  "Connect AI assistants to the RAG Academy curriculum — RRF-fused search, grounded Q&A via your editor's own LLM, goal-driven learning paths, challenges, and pricing.";

export const MCP_DOCS_PATH = "/developers/curriculum-compass";

export const MCP_LESSON_PATH = "/learn/phase-5/mcp-integration";

/** Production site origin (used in docs examples and recommended MCP env). */
export const MCP_PUBLIC_SITE_URL = "https://ragacademy.space";

/** Hosted Streamable HTTP MCP endpoint path (no clone needed). */
export const MCP_HTTP_ENDPOINT_PATH = "/api/mcp";

/** Full hosted endpoint URL for docs and connect commands. */
export const MCP_HTTP_ENDPOINT_URL = `${MCP_PUBLIC_SITE_URL}${MCP_HTTP_ENDPOINT_PATH}`;

/** One-liner connect command shown in docs and marketing. */
export const MCP_HTTP_CONNECT_COMMAND = `claude mcp add --transport http ${MCP_SERVER_ID} ${MCP_HTTP_ENDPOINT_URL}`;

/** Placeholder repo path shown in client config snippets — replace after cloning. */
export const MCP_REPO_CWD_PLACEHOLDER = "/path/to/rag-academy";

/** Example env vars documented on the setup page. */
export const MCP_ENV_VARS = [
  {
    name: "RAG_ACADEMY_SITE_URL",
    required: false,
    description: `Absolute site origin for links in tool responses (e.g. ${MCP_PUBLIC_SITE_URL}).`,
  },
  {
    name: "NEXT_PUBLIC_APP_URL",
    required: false,
    description: "Fallback public app URL if RAG_ACADEMY_SITE_URL is unset.",
  },
  {
    name: "RAG_ACADEMY_API_BASE_URL",
    required: false,
    description: "Deployed API origin for authenticated progress and recommendations tools.",
  },
  {
    name: "RAG_ACADEMY_SUPABASE_ACCESS_TOKEN",
    required: false,
    description: "Supabase user JWT for authenticated tools only.",
  },
  {
    name: "RAG_ACADEMY_MCP_DISABLE_RATE_LIMIT",
    required: false,
    description: "Set to true for local development to bypass in-process rate limits.",
  },
] as const;

export const MCP_FEATURED_TOOLS = [
  { name: "rag_academy_answer", description: "Grounded Q&A — answers via your editor's own LLM (MCP sampling), zero keys needed." },
  { name: "rag_academy_search_content", description: "Multi-query + RRF-fused search over lessons, playbooks, and challenges." },
  { name: "rag_academy_get_learning_path", description: "Turn a goal into an ordered, hour-estimated study path." },
  { name: "rag_academy_get_content", description: "Read lesson, playbook, or challenge MDX (paginated)." },
  { name: "rag_academy_list_challenges", description: "Filter challenges by stage, difficulty, and XP." },
  { name: "rag_academy_get_pricing", description: "Public tier ranges and phase countdown (tool-first for agents)." },
] as const;

export const MCP_RESOURCES = [
  { uri: "ragacademy://curriculum/outline", description: "Challenge counts by curriculum stage." },
  { uri: "ragacademy://pricing/public", description: "Public pricing snapshot for MCP resource subscriptions." },
  { uri: "ragacademy://lesson/{phase}/{slug}", description: "Lesson MDX by path — variables autocomplete in MCP clients." },
  { uri: "ragacademy://playbook/{slug}", description: "Playbook MDX by slug — autocompletes in MCP clients." },
  { uri: "ragacademy://challenge/{slug}", description: "Challenge JSON by slug (never includes solutions)." },
] as const;
