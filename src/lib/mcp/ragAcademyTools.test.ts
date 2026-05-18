import { describe, expect, it, beforeEach, afterEach } from "vitest";

import { getAllChallenges } from "@/lib/challenges/catalog";
import {
  getAcademyContentDocument,
  getAcademyResearchFeed,
  getAcademyPricingSnapshot,
  getAcademyServerInfo,
  getChallengeDetail,
  getPlatformStatsSummary,
  listChallengeSummaries,
  searchAcademyContent,
} from "@/lib/mcp/ragAcademyTools";
import { readAcademyDocument } from "@/lib/mcp/contentDocument";
import type { FeedItem, FeedSource } from "@/lib/research/types";

describe("RAG Academy MCP tool helpers", () => {
  beforeEach(() => {
    delete process.env.RAG_ACADEMY_SITE_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.NEXT_PUBLIC_APP_URL;
    process.env.RAG_ACADEMY_MCP_DISABLE_RATE_LIMIT = "true";
  });

  afterEach(() => {
    delete process.env.RAG_ACADEMY_SITE_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.RAG_ACADEMY_MCP_DISABLE_RATE_LIMIT;
  });
  it("returns bounded curriculum search results with path and url", async () => {
    const response = await searchAcademyContent({ query: "hybrid retrieval", limit: 3 });

    expect(response.query).toBe("hybrid retrieval");
    expect(response.results.length).toBeGreaterThan(0);
    expect(response.results.length).toBeLessThanOrEqual(3);
    expect(response.results[0]).toHaveProperty("path");
    expect(response.results[0].path.startsWith("/")).toBe(true);
    expect(response.meta.serverVersion).toMatch(/\d+\.\d+\.\d+/);
    expect(response.results.every((hit) => hit.contentId && hit.contentId.length > 0)).toBe(true);
  });

  it("uses absolute URLs when site origin is set", async () => {
    process.env.RAG_ACADEMY_SITE_URL = "https://example.com";

    const response = await searchAcademyContent({ query: "hybrid", limit: 1 });
    expect(response.results[0].url.startsWith("https://example.com/")).toBe(true);
  });

  it("lists paginated challenge summaries without leaking code", () => {
    const response = listChallengeSummaries({ difficulty: "easy", limit: 5 });

    expect(response.pagination.limit).toBe(5);
    expect(response.challenges.length).toBeGreaterThan(0);
    expect(response.challenges.length).toBeLessThanOrEqual(5);
    expect(response.challenges.every((challenge) => challenge.difficulty === "easy")).toBe(true);
    expect(response.challenges[0]).not.toHaveProperty("starterCode");
    expect(response.challenges[0]).not.toHaveProperty("testCode");
    expect(response.challenges[0]).not.toHaveProperty("solution");
    expect(response.challenges[0]?.path?.startsWith("/challenges/")).toBe(true);
  });

  it("returns challenge details and only includes code when requested", () => {
    const [firstChallenge] = getAllChallenges();

    const summary = getChallengeDetail({ slug: firstChallenge.slug });
    const withCode = getChallengeDetail({ slug: firstChallenge.slug, includeCode: true });

    expect(summary.challenge.slug).toBe(firstChallenge.slug);
    expect(summary.challenge.path).toBe(`/challenges/${firstChallenge.slug}`);
    expect(summary.challenge).not.toHaveProperty("starterCode");
    expect(summary.challenge).not.toHaveProperty("testCode");
    expect(withCode.challenge).toHaveProperty("starterCode", firstChallenge.starterCode);
    expect(withCode.challenge).toHaveProperty("testCode", firstChallenge.testCode);
    expect(withCode.challenge).not.toHaveProperty("solution");
  });

  it("summarizes platform stats from the challenge catalog", () => {
    const response = getPlatformStatsSummary();

    expect(response.stats.totalChallenges).toBe(getAllChallenges().length);
    expect(response.stats.totalLessons).toBeGreaterThan(0);
  });

  it("exposes public pricing without polar product ids", () => {
    const response = getAcademyPricingSnapshot();
    const paid = response.current.tiers.paid as Record<string, unknown>;
    expect(paid).not.toHaveProperty("polarProductId");
    expect(response.current.tiers.paid.price.monthly).toBeGreaterThanOrEqual(0);
    expect(response.siteLinks.pricingPagePath).toBe("/pricing");
    expect(response.mcpAccess.preferredForAgents).toBe("rag_academy_get_pricing");
  });

  it("adds absolute pricing URLs when site origin is set", () => {
    process.env.RAG_ACADEMY_SITE_URL = "https://example.com";
    const response = getAcademyPricingSnapshot();
    expect(response.siteLinks.pricingPageUrl).toBe("https://example.com/pricing");
    expect(response.siteLinks.checkoutPageUrl).toBe("https://example.com/checkout");
  });

  it("loads lesson MDX body with truncation cap", async () => {
    const doc = await readAcademyDocument("/learn/phase-0/chunking-101", 1000);
    expect(doc.body.length).toBeLessThanOrEqual(1000);
    expect(doc.truncated).toBe(true);
    expect(doc.characterOffsetApplied).toBe(0);
    expect(doc.nextCharacterOffset).toBeGreaterThan(0);
    expect(doc.kind).toBe("lesson");
  });

  it("pages MDX bodies by characterOffset", async () => {
    const first = await readAcademyDocument("/learn/phase-0/chunking-101", {
      maxChars: 900,
      characterOffset: 0,
    });
    expect(first.totalBodyChars).toBeGreaterThan(first.body.length);
    expect(first.nextCharacterOffset).not.toBeNull();
    const second = await readAcademyDocument("/learn/phase-0/chunking-101", {
      maxChars: 900,
      characterOffset: first.nextCharacterOffset!,
    });
    expect(second.characterOffsetApplied).toBe(first.nextCharacterOffset);
    expect(second.body).not.toBe(first.body);
  });

  it("returns pagination fields from getAcademyContentDocument", async () => {
    const first = await getAcademyContentDocument({
      sitePath: "/learn/phase-0/chunking-101",
      maxChars: 900,
      characterOffset: 0,
    });
    expect(first.paginationNotes.length > 0).toBe(first.truncated);
    expect(first.totalBodyChars).toBeGreaterThan(0);
  });

  it("lists server discovery including pricing URIs", () => {
    const info = getAcademyServerInfo();
    expect(info.displayName).toBe("Curriculum Compass");
    expect(info.serverId).toBe("curriculum-compass");
    expect(info.docsPath).toBe("/developers/curriculum-compass");
    expect(info.tools).toContain("rag_academy_get_pricing");
    expect(info.tools).toContain("rag_academy_server_info");
    expect(info.resources.some((r) => r.uri === "ragacademy://pricing/public")).toBe(true);
    expect(info.pricing.resourceUri).toBe("ragacademy://pricing/public");
    expect(info.pricing.preferredForAgents).toBe("tool");
    expect(info.pricing.siteCheckoutPath).toBe("/pricing");
    expect(info.prompts.some((p) => p.name === "rag_academy_pricing_advisor")).toBe(true);
  });

  it("filters research feed sources before fetching", async () => {
    const fetchedSources: FeedSource[] = [];
    const item: FeedItem = {
      id: "paper-1",
      source: "arXiv (RAG / Retrieval-Augmented Generation)",
      title: "RAG paper",
      url: "https://example.com/paper",
      publishedAt: "2026-01-01T00:00:00.000Z",
      summary: "A relevant paper",
      tags: ["papers", "rag"],
    };

    const response = await getAcademyResearchFeed(
      { sourceIds: ["arxiv-rag"], tags: ["rag"], limit: 2 },
      async (sources) => {
        fetchedSources.push(...sources);
        return [item];
      }
    );

    expect(fetchedSources.map((source) => source.id)).toEqual(["arxiv-rag"]);
    expect(response.items).toEqual([item]);
    expect(response.sources).toEqual(["arxiv-rag"]);
    expect(response.notes?.length).toBeGreaterThan(0);
  });
});
