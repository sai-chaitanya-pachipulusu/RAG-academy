import { describe, expect, it } from "vitest";

import { expandQuery, searchContentFused } from "@/lib/search/multiSearch";

describe("expandQuery", () => {
  it("returns just the original for a plain query with no domain terms", () => {
    expect(expandQuery("welcome aboard")).toEqual(["welcome aboard"]);
  });

  it("splits 'X vs Y' comparisons into both sides", () => {
    const queries = expandQuery("semantic chunking vs proposition chunking");
    expect(queries[0]).toBe("semantic chunking vs proposition chunking");
    expect(queries).toContain("semantic chunking");
    expect(queries).toContain("proposition chunking");
  });

  it("splits 'difference between X and Y' questions", () => {
    const queries = expandQuery("what is the difference between bm25 and dense retrieval?");
    expect(queries).toContain("bm25");
    expect(queries).toContain("dense retrieval");
  });

  it("adds a synonym-augmented variant for RAG domain terms", () => {
    const queries = expandQuery("reranking strategies");
    expect(queries.length).toBeGreaterThan(1);
    expect(queries.some((q) => q.includes("cross encoder"))).toBe(true);
  });

  it("caps the number of sub-queries", () => {
    const queries = expandQuery("hybrid embedding reranking vs bm25 evaluation hallucination");
    expect(queries.length).toBeLessThanOrEqual(4);
  });

  it("returns empty for an empty query", () => {
    expect(expandQuery("   ")).toEqual([]);
  });
});

describe("searchContentFused", () => {
  it("fuses comparison queries with RRF and dedupes results", async () => {
    const { results, queriesUsed, fusion } = await searchContentFused(
      "semantic chunking vs proposition chunking",
      { limit: 8 }
    );
    expect(fusion).toBe("rrf");
    expect(queriesUsed.length).toBeGreaterThan(1);
    expect(results.length).toBeGreaterThan(0);
    const keys = results.map((r) => r.contentId ?? r.url);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("returns RRF scores in descending order and respects limit", async () => {
    const { results } = await searchContentFused("hybrid retrieval vs keyword search", { limit: 5 });
    expect(results.length).toBeLessThanOrEqual(5);
    for (let i = 1; i < results.length; i += 1) {
      expect(results[i - 1]!.score).toBeGreaterThanOrEqual(results[i]!.score);
    }
  });

  it("falls back to single-query search when nothing expands", async () => {
    const { fusion, queriesUsed } = await searchContentFused("welcome", { limit: 3 });
    expect(fusion).toBe("single");
    expect(queriesUsed).toEqual(["welcome"]);
  });
});
