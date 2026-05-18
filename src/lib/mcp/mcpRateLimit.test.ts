import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { takeMcpRateSlot } from "@/lib/mcp/mcpRateLimit";

describe("takeMcpRateSlot", () => {
  beforeEach(() => {
    delete process.env.RAG_ACADEMY_MCP_DISABLE_RATE_LIMIT;
  });

  afterEach(() => {
    delete process.env.RAG_ACADEMY_MCP_DISABLE_RATE_LIMIT;
  });

  it("is a no-op when RAG_ACADEMY_MCP_DISABLE_RATE_LIMIT=true", () => {
    process.env.RAG_ACADEMY_MCP_DISABLE_RATE_LIMIT = "true";
    const key = `disabled-test-${Math.random().toFixed(8)}`;
    for (let i = 0; i < 10; i += 1) {
      expect(() => takeMcpRateSlot(key, 2)).not.toThrow();
    }
  });

  it("throws after maxPerWindow hits in the sliding window", () => {
    const key = `limit-test-${Math.random().toFixed(8)}`;
    takeMcpRateSlot(key, 2);
    takeMcpRateSlot(key, 2);
    expect(() => takeMcpRateSlot(key, 2)).toThrow(/rate limited/i);
  });

  it("allows bypass with RAG_ACADEMY_MCP_DISABLE_RATE_LIMIT=1", () => {
    process.env.RAG_ACADEMY_MCP_DISABLE_RATE_LIMIT = "1";
    const key = `bypass-num-${Math.random().toFixed(8)}`;
    for (let i = 0; i < 5; i += 1) {
      expect(() => takeMcpRateSlot(key, 1)).not.toThrow();
    }
  });
});
