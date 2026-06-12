import { getAllChallenges } from "@/lib/challenges/catalog";
import type { CurriculumStage } from "@/lib/curriculum/stages";
import type { SearchResult } from "@/lib/search/types";
import contentIndexJson from "./contentIndex.generated.json";

export type IndexedDoc = {
  id: string;
  type: "lesson" | "playbook";
  title: string;
  description: string;
  url: string;
  tags: string[];
  searchText: string;
  excerpt: string;
  /** Present on lessons; playbooks are cross-cutting. */
  stage?: CurriculumStage;
  outcomes?: string[];
};

const CONTENT_INDEX = contentIndexJson as IndexedDoc[];

/** Read-only view of the build-time content index (lessons + playbooks). */
export function getContentIndex(): readonly IndexedDoc[] {
  return CONTENT_INDEX;
}

function tokenize(q: string) {
  return q
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .map((t) => t.trim())
    .filter(Boolean);
}

function scoreText(terms: string[], text: string) {
  const hay = text.toLowerCase();
  let score = 0;
  for (const t of terms) {
    if (!t) continue;
    // Simple scoring: occurrences count (capped)
    const matches = hay.split(t).length - 1;
    score += Math.min(10, matches);
  }
  return score;
}

function scoreDoc(terms: string[], doc: { title: string; description?: string; tags?: string[]; searchText?: string }) {
  const titleScore = scoreText(terms, doc.title) * 6;
  const descScore = scoreText(terms, doc.description ?? "") * 3;
  const tagScore = scoreText(terms, (doc.tags ?? []).join(" ")) * 2;
  const bodyScore = scoreText(terms, doc.searchText ?? "");
  return titleScore + descScore + tagScore + bodyScore;
}

export async function searchContent(
  q: string,
  { limit = 8 }: { limit?: number } = {}
): Promise<SearchResult[]> {
  const query = (q ?? "").trim();
  if (!query) return [];

  const terms = tokenize(query);
  if (terms.length === 0) return [];

  const results: SearchResult[] = [];

  // Challenges
  for (const c of getAllChallenges()) {
    const score = scoreDoc(terms, {
      title: c.title,
      description: c.description,
      tags: [c.group, c.difficulty],
      searchText: `${c.group}\n${c.description}`,
    });
    if (score <= 0) continue;
    results.push({
      type: "challenge",
      contentId: `challenge:${c.slug}`,
      title: c.title,
      url: `/challenges/${c.slug}`,
      snippet: c.description,
      score,
      excerpt: c.description,
    });
  }

  // Lessons + Playbooks (build-time indexed)
  for (const d of CONTENT_INDEX) {
    const score = scoreDoc(terms, d);
    if (score <= 0) continue;
    results.push({
      type: d.type,
      contentId: d.id,
      title: d.title,
      url: d.url,
      snippet: d.description || d.excerpt.slice(0, 180),
      excerpt: d.excerpt,
      score,
    });
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}


