/**
 * Stdio entry point for the RAG Academy MCP server (Curriculum Compass).
 * Server construction lives in src/lib/mcp/createServer.ts, shared with the
 * hosted Streamable HTTP endpoint at /api/mcp.
 *
 * Stdio context: the process runs on the user's machine, so their own LLM
 * keys may answer Q&A and client sampling is offered.
 */
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { createRagAcademyMcpServer } from "@/lib/mcp/createServer";

async function main() {
  const server = createRagAcademyMcpServer({ allowLocalLlm: true, allowSampling: true });
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
