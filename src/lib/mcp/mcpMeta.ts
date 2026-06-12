import { getPublicSiteOrigin } from "@/lib/mcp/siteUrl";
import { CACHE_TTL_MS } from "@/lib/research/fetchFeed";

export const MCP_SERVER_VERSION = "0.6.0";

export type McpResponseMeta = {
  serverVersion: string;
  siteBaseUrl: string | null;
  /** Keyword index + multi-query expansion + RRF fusion; not embedding search. */
  searchPipeline: "keyword_overlap_rrf";
  /** Parsed RSS/Atom cache TTL for research feeds (ms). */
  feedCacheTtlMs: number;
  /** Per-source HTTP timeout when fetching feeds (ms). */
  feedFetchTimeoutMs: number;
};

export function buildMcpMeta(overrides?: Partial<McpResponseMeta>): McpResponseMeta {
  return {
    serverVersion: MCP_SERVER_VERSION,
    siteBaseUrl: getPublicSiteOrigin(),
    searchPipeline: "keyword_overlap_rrf",
    feedCacheTtlMs: CACHE_TTL_MS,
    feedFetchTimeoutMs: 15_000,
    ...overrides,
  };
}
