// @vitest-environment node
import { describe, expect, it } from "vitest";

import { GET, POST } from "./route";

const ENDPOINT = "http://localhost:3000/api/mcp";

let nextId = 1;

async function rpc(
  method: string,
  params: Record<string, unknown> = {},
  headers: Record<string, string> = {}
) {
  const req = new Request(ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      ...headers,
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: nextId++, method, params }),
  });
  const res = await POST(req);
  const json = (await res.json()) as {
    result?: Record<string, never>;
    error?: { code: number; message: string };
  };
  return { status: res.status, json };
}

describe("POST /api/mcp (stateless Streamable HTTP)", () => {
  it("handles initialize", async () => {
    const { status, json } = await rpc("initialize", {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "route-test", version: "0.0.0" },
    });
    expect(status).toBe(200);
    expect(json.error).toBeUndefined();
    const result = json.result as { serverInfo?: { name?: string } };
    expect(result?.serverInfo?.name).toBe("curriculum-compass");
  });

  it("serves tools/list on a fresh instance without prior initialize (stateless)", async () => {
    const { status, json } = await rpc("tools/list");
    expect(status).toBe(200);
    const result = json.result as { tools?: Array<{ name: string }> };
    expect(result?.tools?.length).toBeGreaterThanOrEqual(13);
  });

  it("executes tools/call with RRF-fused search", async () => {
    const { json } = await rpc("tools/call", {
      name: "rag_academy_search_content",
      arguments: { query: "semantic chunking vs proposition chunking", limit: 4 },
    });
    const result = json.result as {
      isError?: boolean;
      structuredContent?: { fusion?: string; results?: unknown[] };
    };
    expect(result?.isError).toBeFalsy();
    expect(result?.structuredContent?.fusion).toBe("rrf");
    expect(result?.structuredContent?.results?.length).toBeGreaterThan(0);
  });

  it("builds a learning path over HTTP", async () => {
    const { json } = await rpc("tools/call", {
      name: "rag_academy_get_learning_path",
      arguments: { goal: "ship hybrid retrieval with reranking to production" },
    });
    const result = json.result as {
      structuredContent?: { steps?: unknown[] };
    };
    expect(result?.structuredContent?.steps?.length).toBeGreaterThan(0);
  });

  it("refuses anonymous Q&A with sign-in guidance — platform keys are never used", async () => {
    const { json } = await rpc("tools/call", {
      name: "rag_academy_answer",
      arguments: { question: "What is hybrid retrieval?" },
    });
    const result = json.result as {
      structuredContent?: { available?: boolean; error?: string; mode?: string };
    };
    expect(result?.structuredContent?.available).toBe(false);
    expect(result?.structuredContent?.error).toMatch(/Authorization: Bearer/);
  });

  it("requires Pro via the platform API for analyze_arch — anonymous gets proRequired", async () => {
    const { json } = await rpc("tools/call", {
      name: "rag_academy_analyze_arch",
      arguments: { description: "We embed PDFs with ada-002, store in pgvector, retrieve top-5." },
    });
    const result = json.result as {
      structuredContent?: { proRequired?: boolean; available?: boolean };
    };
    expect(result?.structuredContent?.available).toBe(false);
    expect(result?.structuredContent?.proRequired).toBe(true);
  });

  it("rejects GET — stateless endpoint accepts only POST", async () => {
    const res = await GET();
    expect(res.status).toBe(405);
  });
});
