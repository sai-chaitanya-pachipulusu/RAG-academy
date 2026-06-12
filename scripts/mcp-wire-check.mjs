/**
 * Wire-protocol check: spawn the stdio MCP server and exercise the real
 * JSON-RPC surface — initialize, tools/list, prompts/list, resources/list,
 * resources/templates/list, completion/complete (prompt arg + template var),
 * resources/read (templated), tools/call, and a full sampling round-trip
 * (this script acts as the client LLM). Run: npm run mcp:wire
 */
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// Deterministic env: no platform API, no LLM keys — sampling must carry Q&A.
const env = { ...process.env, RAG_ACADEMY_MCP_DISABLE_RATE_LIMIT: "true" };
for (const key of [
  "RAG_ACADEMY_API_BASE_URL",
  "RAG_ACADEMY_SUPABASE_ACCESS_TOKEN",
  "OPENAI_API_KEY",
  "ANTHROPIC_API_KEY",
]) {
  delete env[key];
}

const child = spawn(process.execPath, ["--import", "tsx", "mcp/server.ts"], {
  cwd: root,
  stdio: ["pipe", "pipe", "inherit"],
  env,
  windowsHide: true,
});

let shuttingDown = false;
child.on("exit", (code, signal) => {
  if (!shuttingDown) {
    console.error(`  ✗ server exited early (code=${code}, signal=${signal})`);
    process.exit(1);
  }
});

const pending = new Map();
let nextId = 1;
let buffer = "";
let samplingRequests = 0;

const STUB_ANSWER =
  "Hybrid retrieval combines lexical and dense scoring [1].\n\n---EVIDENCE---\n[1] CLAIM: hybrid combines both | SUPPORT: BM25 plus embeddings fused with RRF";

function send(msg) {
  child.stdin.write(JSON.stringify(msg) + "\n");
}

/** Server → client requests (sampling). We play the host LLM. */
function handleServerRequest(msg) {
  if (msg.method === "sampling/createMessage") {
    samplingRequests += 1;
    send({
      jsonrpc: "2.0",
      id: msg.id,
      result: {
        model: "wire-check-stub",
        role: "assistant",
        content: { type: "text", text: STUB_ANSWER },
        stopReason: "endTurn",
      },
    });
    return;
  }
  send({
    jsonrpc: "2.0",
    id: msg.id,
    error: { code: -32601, message: `wire-check does not implement ${msg.method}` },
  });
}

child.stdout.on("data", (chunk) => {
  buffer += chunk.toString("utf8");
  let nl;
  while ((nl = buffer.indexOf("\n")) !== -1) {
    const line = buffer.slice(0, nl).trim();
    buffer = buffer.slice(nl + 1);
    if (!line) continue;
    const msg = JSON.parse(line);
    if (msg.method !== undefined && msg.id !== undefined) {
      handleServerRequest(msg);
    } else if (msg.id != null && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(JSON.stringify(msg.error)));
      else resolve(msg.result);
    }
    // bare notifications are ignored
  }
});

function request(method, params = {}) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    send({ jsonrpc: "2.0", id, method, params });
    setTimeout(() => {
      if (pending.delete(id)) reject(new Error(`timeout waiting for ${method}`));
    }, 120_000);
  });
}

function notify(method, params = {}) {
  send({ jsonrpc: "2.0", method, params });
}

function fail(label, err) {
  console.error(`  ✗ ${label}`);
  console.error(err);
  shuttingDown = true;
  child.kill();
  process.exit(1);
}

function ok(label, detail) {
  console.log(`  ✓ ${label}${detail ? ` — ${detail}` : ""}`);
}

try {
  const init = await request("initialize", {
    protocolVersion: "2025-06-18",
    capabilities: { sampling: {} },
    clientInfo: { name: "wire-check", version: "0.0.0" },
  });
  notify("notifications/initialized");
  ok("initialize", `server ${init.serverInfo.name}@${init.serverInfo.version}`);
  if (!init.capabilities?.completions) {
    fail("capabilities", new Error("server did not advertise completions capability"));
  }
  ok("capabilities", "completions advertised");

  const tools = await request("tools/list");
  if (!Array.isArray(tools.tools) || tools.tools.length < 13) {
    fail("tools/list", new Error(`expected >=13 tools, got ${tools.tools?.length}`));
  }
  const searchTool = tools.tools.find((t) => t.name === "rag_academy_search_content");
  if (!searchTool?.outputSchema?.properties?.results) {
    fail("tools/list", new Error("search tool missing typed outputSchema.properties.results"));
  }
  ok("tools/list", `${tools.tools.length} tools, typed output schemas`);

  const prompts = await request("prompts/list");
  ok("prompts/list", `${prompts.prompts.length} prompts`);

  const resources = await request("resources/list");
  if (!Array.isArray(resources.resources) || resources.resources.length < 300) {
    fail("resources/list", new Error(`expected 300+ resources (templates enumerate), got ${resources.resources?.length}`));
  }
  ok("resources/list", `${resources.resources.length} resources`);

  const templates = await request("resources/templates/list");
  if ((templates.resourceTemplates?.length ?? 0) < 3) {
    fail("resources/templates/list", new Error(`expected 3 templates, got ${templates.resourceTemplates?.length}`));
  }
  ok("resources/templates/list", templates.resourceTemplates.map((t) => t.uriTemplate).join(", "));

  const promptCompletion = await request("completion/complete", {
    ref: { type: "ref/prompt", name: "rag_academy_study_plan" },
    argument: { name: "currentStage", value: "re" },
  });
  if (!promptCompletion.completion?.values?.includes("retrieval")) {
    fail("completion/complete (prompt)", new Error(JSON.stringify(promptCompletion)));
  }
  ok("completion/complete prompt:currentStage", promptCompletion.completion.values.join(", "));

  const templateCompletion = await request("completion/complete", {
    ref: { type: "ref/resource", uri: "ragacademy://challenge/{slug}" },
    argument: { name: "slug", value: "cos" },
  });
  if ((templateCompletion.completion?.values?.length ?? 0) === 0) {
    fail("completion/complete (template)", new Error(JSON.stringify(templateCompletion)));
  }
  ok("completion/complete challenge:slug", templateCompletion.completion.values.slice(0, 3).join(", "));

  const challenges = await request("tools/call", {
    name: "rag_academy_list_challenges",
    arguments: { difficulty: "easy", limit: 1 },
  });
  const slug = challenges.structuredContent?.challenges?.[0]?.slug;
  if (!slug) fail("tools/call list_challenges", new Error("no slug returned"));
  ok("tools/call rag_academy_list_challenges", slug);

  const readResult = await request("resources/read", { uri: `ragacademy://challenge/${slug}` });
  const challengeJson = JSON.parse(readResult.contents?.[0]?.text ?? "{}");
  if (challengeJson.challenge?.slug !== slug) {
    fail("resources/read (template)", new Error(`slug mismatch: ${challengeJson.challenge?.slug}`));
  }
  ok("resources/read templated", `ragacademy://challenge/${slug}`);

  const search = await request("tools/call", {
    name: "rag_academy_search_content",
    arguments: { query: "semantic chunking vs proposition chunking", limit: 4 },
  });
  if (search.isError) fail("tools/call search", new Error(search.content?.[0]?.text));
  if (search.structuredContent?.fusion !== "rrf") {
    fail("tools/call search", new Error(`expected rrf fusion, got ${search.structuredContent?.fusion}`));
  }
  ok(
    "tools/call rag_academy_search_content",
    `${search.structuredContent.results.length} results, ${search.structuredContent.queriesUsed.length} sub-queries (RRF)`
  );

  const path = await request("tools/call", {
    name: "rag_academy_get_learning_path",
    arguments: { goal: "ship hybrid retrieval with reranking to production", hoursPerWeek: 5 },
  });
  if (path.isError) fail("tools/call learning_path", new Error(path.content?.[0]?.text));
  if (!path.structuredContent?.steps?.length) {
    fail("tools/call learning_path", new Error("no steps returned"));
  }
  ok(
    "tools/call rag_academy_get_learning_path",
    `${path.structuredContent.steps.length} stages, ~${path.structuredContent.estimate.estimatedHours}h`
  );

  const qa = await request("tools/call", {
    name: "rag_academy_answer",
    arguments: { question: "What is hybrid retrieval?" },
  });
  if (qa.isError) fail("tools/call answer", new Error(qa.content?.[0]?.text));
  if (qa.structuredContent?.mode !== "client-sampling") {
    fail("tools/call answer", new Error(`expected client-sampling mode, got ${qa.structuredContent?.mode}`));
  }
  if (samplingRequests !== 1) {
    fail("sampling round-trip", new Error(`expected 1 sampling/createMessage, saw ${samplingRequests}`));
  }
  if (!qa.structuredContent?.evidence?.length) {
    fail("tools/call answer", new Error("evidence not parsed from sampled response"));
  }
  ok("tools/call rag_academy_answer", "answered via client sampling, evidence parsed");

  console.log("\nWire protocol OK — SOTA surface verified (templates, completions, typed schemas, sampling).\n");
  shuttingDown = true;
  child.kill();
  process.exit(0);
} catch (err) {
  fail("wire check", err);
}
