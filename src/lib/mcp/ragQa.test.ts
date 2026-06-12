import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { SearchResult } from "@/lib/search/types";

vi.mock("@/lib/search/search", () => ({
  searchContent: vi.fn(),
}));
vi.mock("@/lib/ai/llmClient", () => ({
  askLLM: vi.fn(),
  isLLMConfigured: vi.fn(),
}));

import {
  answerMcpQuestion,
  analyzeArchitectureMcp,
  parseGroundedAnswer,
  type McpSampler,
} from "@/lib/mcp/ragQa";
import { searchContent } from "@/lib/search/search";
import { askLLM, isLLMConfigured } from "@/lib/ai/llmClient";

const ENV_KEYS = [
  "RAG_ACADEMY_API_BASE_URL",
  "RAG_ACADEMY_SUPABASE_ACCESS_TOKEN",
  "RAG_ACADEMY_SITE_URL",
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_APP_URL",
  "OPENAI_API_KEY",
  "ANTHROPIC_API_KEY",
] as const;

const savedEnv: Record<string, string | undefined> = {};

/** Minimal fetch Response stand-in; postRagApi only uses ok/status/text(). */
function jsonResponse(status: number, payload: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(payload),
  } as unknown as Response;
}

/** Loose view over the tool result unions so tests can assert any branch's fields. */
type ToolResult = {
  available?: boolean;
  mode?: string;
  error?: string;
  answer?: string;
  evidence?: Array<{ citation: number; claim: string; support: string }>;
  formatNote?: string;
  quotaExceeded?: boolean;
  upgradeUrl?: string;
  proRequired?: boolean;
  rateLimited?: boolean;
  analysis?: string;
  sources?: Array<{ url?: unknown }>;
};

async function answer(question: string, sampler?: McpSampler): Promise<ToolResult> {
  return (await answerMcpQuestion({ question }, { sampler })) as ToolResult;
}

async function analyze(description: string): Promise<ToolResult> {
  return (await analyzeArchitectureMcp({ description })) as ToolResult;
}

const LESSON_RESULT: SearchResult = {
  type: "lesson",
  title: "Hybrid Retrieval",
  url: "/learn/phase-2/hybrid-retrieval",
  snippet: "Combine BM25 and dense retrieval.",
  score: 1,
  excerpt: "Combine BM25 and dense retrieval with RRF fusion.",
};

beforeEach(() => {
  for (const key of ENV_KEYS) {
    savedEnv[key] = process.env[key];
    delete process.env[key];
  }
  process.env.RAG_ACADEMY_MCP_DISABLE_RATE_LIMIT = "true";
  vi.mocked(isLLMConfigured).mockReturnValue(false);
  vi.mocked(searchContent).mockResolvedValue([]);
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (savedEnv[key] === undefined) delete process.env[key];
    else process.env[key] = savedEnv[key];
  }
  delete process.env.RAG_ACADEMY_MCP_DISABLE_RATE_LIMIT;
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("parseGroundedAnswer", () => {
  it("parses the canonical ---EVIDENCE--- block", () => {
    const parsed = parseGroundedAnswer(
      [
        "Chunk size drives recall [1].",
        "",
        "---EVIDENCE---",
        '[1] CLAIM: chunk size drives recall | SUPPORT: "smaller chunks improve recall at the cost of context"',
      ].join("\n")
    );
    expect(parsed.answer).toBe("Chunk size drives recall [1].");
    expect(parsed.evidence).toEqual([
      {
        citation: 1,
        claim: "chunk size drives recall",
        support: '"smaller chunks improve recall at the cost of context"',
      },
    ]);
    expect(parsed.formatNote).toBeUndefined();
  });

  it("tolerates 'Evidence:' marker variants and bulleted lines", () => {
    const parsed = parseGroundedAnswer(
      [
        "Use RRF for fusion [2].",
        "",
        "Evidence:",
        "- [2] CLAIM: RRF fuses rankings | SUPPORT: RRF combines rank positions across retrievers",
      ].join("\n")
    );
    expect(parsed.evidence).toHaveLength(1);
    expect(parsed.evidence[0]!.citation).toBe(2);
    expect(parsed.formatNote).toBeUndefined();
  });

  it("degrades gracefully when the marker is missing", () => {
    const parsed = parseGroundedAnswer("Just an answer with [1] but no evidence section.");
    expect(parsed.answer).toBe("Just an answer with [1] but no evidence section.");
    expect(parsed.evidence).toEqual([]);
    expect(parsed.formatNote).toMatch(/no parseable/i);
  });

  it("flags an evidence section whose lines do not match the format", () => {
    const parsed = parseGroundedAnswer("Answer.\n\n---EVIDENCE---\nsome unstructured text");
    expect(parsed.answer).toBe("Answer.");
    expect(parsed.evidence).toEqual([]);
    expect(parsed.formatNote).toMatch(/no lines matched/i);
  });
});

describe("answerMcpQuestion", () => {
  it("returns available: false when neither platform API nor a local LLM key is configured", async () => {
    const result = await answer("What is chunking?");
    expect(result.available).toBe(false);
    expect(result.error).toMatch(/RAG_ACADEMY_API_BASE_URL|OPENAI_API_KEY/);
    expect(askLLM).not.toHaveBeenCalled();
  });

  it("answers locally with the user's own LLM key when no platform API is configured", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    process.env.RAG_ACADEMY_SITE_URL = "https://example.com";
    vi.mocked(isLLMConfigured).mockReturnValue(true);
    vi.mocked(searchContent).mockResolvedValue([LESSON_RESULT]);
    vi.mocked(askLLM).mockResolvedValue({
      text: "Hybrid search wins [1].\n\n---EVIDENCE---\n[1] CLAIM: hybrid wins | SUPPORT: BM25 plus dense beats either alone",
      tokens: { prompt: 10, completion: 20 },
    });

    const result = await answer("Why hybrid retrieval?");

    expect(result.available).toBe(true);
    expect(result.mode).toBe("local-llm");
    expect(result.answer).toBe("Hybrid search wins [1].");
    expect(result.evidence).toHaveLength(1);
    expect(result.sources?.[0]?.url).toBe("https://example.com/learn/phase-2/hybrid-retrieval");
  });

  it("surfaces a formatNote instead of crashing when the model skips the evidence block", async () => {
    vi.mocked(isLLMConfigured).mockReturnValue(true);
    vi.mocked(askLLM).mockResolvedValue({
      text: "Answer without any evidence section.",
      tokens: { prompt: 5, completion: 5 },
    });

    const result = await answer("What is reranking?");

    expect(result.available).toBe(true);
    expect(result.evidence).toEqual([]);
    expect(result.formatNote).toMatch(/no parseable/i);
  });

  it("routes through the platform API when configured, never touching the local LLM", async () => {
    process.env.RAG_ACADEMY_API_BASE_URL = "https://example.com";
    process.env.RAG_ACADEMY_SUPABASE_ACCESS_TOKEN = "jwt-token";
    process.env.RAG_ACADEMY_SITE_URL = "https://example.com";
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(200, {
        answer: "Use semantic chunking [1].",
        sources: [{ type: "lesson", title: "Chunking 101", url: "/learn/phase-0/chunking-101" }],
        evidence: [{ citation: 1, claim: "semantic chunking", support: "groups by meaning" }],
        tokens: { prompt: 50, completion: 80 },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await answer("How should I chunk?");

    expect(result.available).toBe(true);
    expect(result.mode).toBe("platform-api");
    expect(result.answer).toBe("Use semantic chunking [1].");
    expect(result.sources?.[0]?.url).toBe("https://example.com/learn/phase-0/chunking-101");
    expect(askLLM).not.toHaveBeenCalled();

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://example.com/api/rag/ask");
    expect((init.headers as Record<string, string>)["x-supabase-access-token"]).toBe("jwt-token");
  });

  it("reports quotaExceeded with an upgrade link when the platform API returns 429", async () => {
    process.env.RAG_ACADEMY_API_BASE_URL = "https://example.com";
    process.env.RAG_ACADEMY_SUPABASE_ACCESS_TOKEN = "jwt-token";
    process.env.RAG_ACADEMY_SITE_URL = "https://example.com";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse(429, { error: "Daily ask limit reached." }))
    );

    const result = await answer("One more question");

    expect(result.available).toBe(false);
    expect(result.quotaExceeded).toBe(true);
    expect(result.error).toMatch(/daily ask limit/i);
    expect(result.upgradeUrl).toBe("https://example.com/pricing");
  });

  it("prefers client sampling over everything else — zero keys needed", async () => {
    vi.mocked(searchContent).mockResolvedValue([LESSON_RESULT]);
    const sampler = vi
      .fn<McpSampler>()
      .mockResolvedValue(
        "Sampled answer [1].\n\n---EVIDENCE---\n[1] CLAIM: sampled | SUPPORT: from the host LLM"
      );

    const result = await answer("Why hybrid retrieval?", sampler);

    expect(result.available).toBe(true);
    expect(result.mode).toBe("client-sampling");
    expect(result.answer).toBe("Sampled answer [1].");
    expect(result.evidence).toHaveLength(1);
    expect(sampler).toHaveBeenCalledOnce();
    expect(askLLM).not.toHaveBeenCalled();
  });

  it("prefers client sampling even when the platform API is configured", async () => {
    process.env.RAG_ACADEMY_API_BASE_URL = "https://example.com";
    process.env.RAG_ACADEMY_SUPABASE_ACCESS_TOKEN = "jwt-token";
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const sampler = vi.fn<McpSampler>().mockResolvedValue("Sampled.");

    const result = await answer("What is RRF?", sampler);

    expect(result.mode).toBe("client-sampling");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("falls back to the platform API when the client refuses to sample", async () => {
    process.env.RAG_ACADEMY_API_BASE_URL = "https://example.com";
    process.env.RAG_ACADEMY_SUPABASE_ACCESS_TOKEN = "jwt-token";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse(200, { answer: "API answer.", sources: [], evidence: [], tokens: {} })
      )
    );
    const sampler = vi.fn<McpSampler>().mockRejectedValue(new Error("user declined sampling"));

    const result = await answer("What is chunking?", sampler);

    expect(result.mode).toBe("platform-api");
    expect(result.answer).toBe("API answer.");
  });

  it("enforces the in-process rate limit bucket", async () => {
    delete process.env.RAG_ACADEMY_MCP_DISABLE_RATE_LIMIT;
    for (let i = 0; i < 30; i += 1) {
      await answer("spam");
    }
    await expect(answerMcpQuestion({ question: "spam" })).rejects.toThrow(/rate limited/i);
  });
});

describe("analyzeArchitectureMcp", () => {
  const DESCRIPTION = "We embed PDFs with ada-002, store in pgvector, retrieve top-5, no reranking.";

  it("requires the platform API config and never runs a local Pro bypass", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    vi.mocked(isLLMConfigured).mockReturnValue(true);

    const result = await analyze(DESCRIPTION);

    expect(result.available).toBe(false);
    expect(result.proRequired).toBe(true);
    expect(askLLM).not.toHaveBeenCalled();
  });

  it("maps a 402 from the platform API to proRequired with an upgrade link", async () => {
    process.env.RAG_ACADEMY_API_BASE_URL = "https://example.com";
    process.env.RAG_ACADEMY_SUPABASE_ACCESS_TOKEN = "free-user-jwt";
    process.env.RAG_ACADEMY_SITE_URL = "https://example.com";
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(jsonResponse(402, { error: "Architecture analysis requires a Pro subscription." }))
    );

    const result = await analyze(DESCRIPTION);

    expect(result.available).toBe(false);
    expect(result.proRequired).toBe(true);
    expect(result.upgradeUrl).toBe("https://example.com/pricing");
  });

  it("returns the analysis when the platform API accepts the request", async () => {
    process.env.RAG_ACADEMY_API_BASE_URL = "https://example.com";
    process.env.RAG_ACADEMY_SUPABASE_ACCESS_TOKEN = "pro-user-jwt";
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(200, {
        analysis: "1. **Architecture Summary** ...",
        tokens: { prompt: 200, completion: 600 },
        note: "Test in your specific context.",
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await analyze(DESCRIPTION);

    expect(result.available).toBe(true);
    expect(result.analysis).toMatch(/Architecture Summary/);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://example.com/api/rag/analyze");
  });
});
