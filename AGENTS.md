## Learned User Preferences

- When executing an attached implementation plan, do not edit the plan file; use existing to-dos, mark them in progress while working, and complete all of them.
- For resume and ATS-oriented bullets, omit function names and tighten wording when the user asks for shorter points.

## Learned Workspace Facts

- RAG Academy is a Next.js/React/TypeScript learning product with MDX curriculum, in-browser Python (Pyodide and Monaco), keyword-based site search, Supabase for auth and progress, Polar for subscriptions, and API routes for chat, research, email, and scheduled jobs.
- Production site URL is https://ragacademy.space (not ragacademy.com).
- The MCP server is branded Curriculum Compass (config key `curriculum-compass`): a local stdio server exposing curriculum search, challenges, MDX content, pricing, research feeds, and optional authenticated user data; setup docs live at `/developers/curriculum-compass`.
- MCP stdio clients must launch via `node scripts/mcp-stdio.mjs`, not `npm run`; npm lifecycle output on stdout breaks the JSON-RPC wire protocol.
- MCP pricing is tool-first: agents should call `rag_academy_get_pricing`; `ragacademy://pricing/public` is the discovery resource (payment product IDs are never exposed).
- Verify MCP helpers with `npm run mcp:smoke`.
