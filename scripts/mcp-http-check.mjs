/**
 * HTTP MCP endpoint check — run against a live deployment or local dev server:
 *   node scripts/mcp-http-check.mjs [url]
 * Default url: http://localhost:3000/api/mcp
 *
 * Verifies initialize, tools/list, an RRF search call, and that anonymous
 * Q&A is refused with sign-in guidance (no platform key leak).
 */
const endpoint = process.argv[2] ?? "http://localhost:3000/api/mcp";

let nextId = 1;

async function rpc(method, params = {}, headers = {}) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      ...headers,
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: nextId++, method, params }),
    signal: AbortSignal.timeout(60_000),
  });
  const json = await res.json();
  if (json.error) throw new Error(`${method}: ${JSON.stringify(json.error)}`);
  return json.result;
}

function ok(label, detail) {
  console.log(`  ✓ ${label}${detail ? ` — ${detail}` : ""}`);
}

function fail(label, err) {
  console.error(`  ✗ ${label}`);
  console.error(err);
  process.exit(1);
}

console.log(`\nMCP HTTP check → ${endpoint}\n`);

try {
  const init = await rpc("initialize", {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: { name: "http-check", version: "0.0.0" },
  });
  ok("initialize", `server ${init.serverInfo.name}@${init.serverInfo.version}`);

  const tools = await rpc("tools/list");
  if (tools.tools.length < 13) fail("tools/list", new Error(`got ${tools.tools.length} tools`));
  ok("tools/list", `${tools.tools.length} tools`);

  const search = await rpc("tools/call", {
    name: "rag_academy_search_content",
    arguments: { query: "semantic chunking vs proposition chunking", limit: 4 },
  });
  if (search.isError) fail("search", new Error(search.content?.[0]?.text));
  if (search.structuredContent?.fusion !== "rrf") {
    fail("search", new Error(`expected rrf fusion, got ${search.structuredContent?.fusion}`));
  }
  ok("tools/call search", `${search.structuredContent.results.length} results (RRF)`);

  const answer = await rpc("tools/call", {
    name: "rag_academy_answer",
    arguments: { question: "What is hybrid retrieval?" },
  });
  if (answer.structuredContent?.available !== false) {
    fail("anonymous answer", new Error("expected available:false for anonymous caller"));
  }
  if (!/Authorization: Bearer/.test(answer.structuredContent?.error ?? "")) {
    fail("anonymous answer", new Error("expected sign-in guidance in error"));
  }
  ok("anonymous answer refused", "sign-in guidance returned, no platform key used");

  console.log("\nHTTP endpoint OK.\n");
} catch (err) {
  fail("http check", err);
}
