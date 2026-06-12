import { getAllChallenges } from "@/lib/challenges/catalog";
import { CURRICULUM_STAGE_IDS } from "@/lib/curriculum/stages";
import { getContentIndex } from "@/lib/search/search";

/**
 * Backing data for MCP resource templates and argument completion:
 *   ragacademy://lesson/{phase}/{slug}
 *   ragacademy://playbook/{slug}
 *   ragacademy://challenge/{slug}
 */

const MAX_COMPLETIONS = 50;

type ResourceEntry = { uri: string; name: string; description?: string; mimeType?: string };

function lessonParts(url: string): { phase: string; slug: string } | null {
  const m = url.match(/^\/learn\/([^/]+)\/([^/]+)$/);
  return m ? { phase: m[1], slug: m[2] } : null;
}

function playbookSlug(url: string): string | null {
  const m = url.match(/^\/playbooks\/([^/]+)$/);
  return m ? m[1] : null;
}

export function listLessonResources(): ResourceEntry[] {
  const entries: ResourceEntry[] = [];
  for (const doc of getContentIndex()) {
    if (doc.type !== "lesson") continue;
    const parts = lessonParts(doc.url);
    if (!parts) continue;
    entries.push({
      uri: `ragacademy://lesson/${parts.phase}/${parts.slug}`,
      name: doc.title,
      description: doc.description,
      mimeType: "text/markdown",
    });
  }
  return entries;
}

export function listPlaybookResources(): ResourceEntry[] {
  const entries: ResourceEntry[] = [];
  for (const doc of getContentIndex()) {
    if (doc.type !== "playbook") continue;
    const slug = playbookSlug(doc.url);
    if (!slug) continue;
    entries.push({
      uri: `ragacademy://playbook/${slug}`,
      name: doc.title,
      description: doc.description,
      mimeType: "text/markdown",
    });
  }
  return entries;
}

export function listChallengeResources(): ResourceEntry[] {
  return getAllChallenges().map((c) => ({
    uri: `ragacademy://challenge/${c.slug}`,
    name: c.title,
    description: `${c.difficulty} · ${c.xpReward} XP · ${c.group}`,
    mimeType: "application/json",
  }));
}

function prefixFilter(values: string[], prefix: string): string[] {
  const p = prefix.toLowerCase();
  const startsWith = values.filter((v) => v.toLowerCase().startsWith(p));
  const contains = p
    ? values.filter((v) => !v.toLowerCase().startsWith(p) && v.toLowerCase().includes(p))
    : [];
  return [...startsWith, ...contains].slice(0, MAX_COMPLETIONS);
}

export function completeLessonPhase(value: string): string[] {
  const phases = [...new Set(
    getContentIndex()
      .filter((d) => d.type === "lesson")
      .map((d) => lessonParts(d.url)?.phase)
      .filter((p): p is string => Boolean(p))
  )];
  return prefixFilter(phases, value);
}

export function completeLessonSlug(value: string, phase?: string): string[] {
  const slugs = getContentIndex()
    .filter((d) => d.type === "lesson")
    .map((d) => lessonParts(d.url))
    .filter((p): p is { phase: string; slug: string } => Boolean(p))
    .filter((p) => !phase || p.phase === phase)
    .map((p) => p.slug);
  return prefixFilter([...new Set(slugs)], value);
}

export function completePlaybookSlug(value: string): string[] {
  const slugs = getContentIndex()
    .filter((d) => d.type === "playbook")
    .map((d) => playbookSlug(d.url))
    .filter((s): s is string => Boolean(s));
  return prefixFilter([...new Set(slugs)], value);
}

export function completeChallengeSlug(value: string): string[] {
  return prefixFilter(getAllChallenges().map((c) => c.slug), value);
}

export function completeCurriculumStage(value: string): string[] {
  return prefixFilter([...CURRICULUM_STAGE_IDS], value);
}

/** Site paths for prompt-arg completion (tutor_session sitePathHint). */
export function completeSitePath(value: string): string[] {
  const paths = [
    ...getContentIndex().map((d) => d.url),
    ...getAllChallenges().map((c) => `/challenges/${c.slug}`),
  ];
  return prefixFilter(paths, value).slice(0, 25);
}
