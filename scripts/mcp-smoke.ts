/**
 * Curriculum Compass MCP smoke test — run: npm run mcp:smoke
 * Exercises core tool helpers the same way MCP Inspector would.
 */
import {
  getAcademyContentDocument,
  getAcademyPricingSnapshot,
  getAcademyServerInfo,
  getChallengeDetail,
  getPlatformStatsSummary,
  listChallengeSummaries,
  searchAcademyContent,
} from "@/lib/mcp/ragAcademyTools";
import { MCP_PUBLIC_SITE_URL } from "@/lib/mcp/branding";
import { getPublicPricingSnapshot } from "@/lib/mcp/pricingPublic";
import { buildCurriculumOutlineJson } from "@/lib/mcp/curriculumOutline";

process.env.RAG_ACADEMY_MCP_DISABLE_RATE_LIMIT = "true";
process.env.RAG_ACADEMY_SITE_URL = MCP_PUBLIC_SITE_URL;

function ok(label: string, detail?: string) {
  console.log(`  ✓ ${label}${detail ? ` — ${detail}` : ""}`);
}

function fail(label: string, err: unknown): never {
  console.error(`  ✗ ${label}`);
  console.error(err);
  process.exit(1);
}

async function main() {
  console.log(`\nCurriculum Compass MCP smoke test`);
  console.log(`Site URL: ${MCP_PUBLIC_SITE_URL}\n`);

  try {
    const info = getAcademyServerInfo();
    if (info.serverId !== "curriculum-compass") fail("server id");
    if (info.docsPath !== "/developers/curriculum-compass") fail("docs path");
    ok("rag_academy_server_info", `${info.tools.length} tools, ${info.resources.length} resources`);

    const search = await searchAcademyContent({ query: "hybrid retrieval", limit: 3 });
    if (search.results.length === 0) fail("search returned no results");
    const firstUrl = search.results[0]?.url ?? "";
    if (!firstUrl.startsWith(`${MCP_PUBLIC_SITE_URL}/`)) {
      fail("search absolute URL", new Error(`expected ${MCP_PUBLIC_SITE_URL} prefix, got ${firstUrl}`));
    }
    ok("rag_academy_search_content", `${search.count} hits, first=${search.results[0]?.path}`);

    const content = await getAcademyContentDocument({
      sitePath: "/learn/phase-0/chunking-101",
      maxChars: 2000,
    });
    if (!content.body.length) fail("get_content empty body");
    if (!content.url.startsWith(`${MCP_PUBLIC_SITE_URL}/learn/`)) {
      fail("get_content URL", new Error(content.url));
    }
    ok("rag_academy_get_content", `${content.body.length} chars, kind=${content.kind}`);

    const challenges = listChallengeSummaries({ difficulty: "easy", limit: 3 });
    if (challenges.challenges.length === 0) fail("list_challenges empty");
    ok("rag_academy_list_challenges", `${challenges.pagination.returned} easy challenges`);

    const slug = challenges.challenges[0]!.slug;
    const detail = getChallengeDetail({ slug });
    if (detail.challenge.slug !== slug) fail("get_challenge slug mismatch");
    ok("rag_academy_get_challenge", slug);

    const stats = getPlatformStatsSummary();
    if (stats.stats.totalChallenges < 1) fail("platform stats");
    ok("rag_academy_get_platform_stats", `${stats.stats.totalChallenges} challenges`);

    const pricing = getAcademyPricingSnapshot();
    if (!pricing.siteLinks.pricingPageUrl?.startsWith(MCP_PUBLIC_SITE_URL)) {
      fail("pricing siteLinks", new Error(JSON.stringify(pricing.siteLinks)));
    }
    ok("rag_academy_get_pricing", `phase=${pricing.current.name}`);

    const outline = buildCurriculumOutlineJson();
    if (!outline.phases?.length) fail("curriculum outline resource");
    ok("ragacademy://curriculum/outline", `${outline.phases.length} phases`);

    const pricingResource = getPublicPricingSnapshot();
    if (!pricingResource.current.tiers.paid) fail("pricing resource snapshot");
    ok("ragacademy://pricing/public", "snapshot OK");

    console.log("\nAll smoke checks passed.\n");
  } catch (err) {
    fail("unexpected error", err);
  }
}

main();
