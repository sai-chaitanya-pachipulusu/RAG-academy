import { readFile } from "node:fs/promises";
import { join } from "node:path";

import matter from "gray-matter";

const MAX_BODY_CHARS_DEFAULT = 120_000;

export type AcademyContentKind = "lesson" | "playbook" | "challenge";

export type ReadAcademyDocumentOptions = {
  maxChars?: number;
  /** Slice into the MDX body after frontmatter is stripped (0 = start). */
  characterOffset?: number;
};

/**
 * Map a public URL path to a repo-relative file under content/.
 * Examples: /learn/phase-0/foo → content/lessons/phase-0/foo.mdx
 */
export function resolveSitePathToRelativeFile(sitePath: string): {
  kind: AcademyContentKind;
  relativePath: string;
} | null {
  const p = sitePath.trim().replace(/\/+$/, "") || "/";
  if (p.startsWith("/learn/")) {
    const rest = p.slice("/learn/".length);
    if (!rest) return null;
    return { kind: "lesson", relativePath: join("content", "lessons", `${rest}.mdx`) };
  }
  if (p.startsWith("/playbooks/")) {
    const rest = p.slice("/playbooks/".length);
    if (!rest) return null;
    return { kind: "playbook", relativePath: join("content", "playbooks", `${rest}.mdx`) };
  }
  if (p.startsWith("/challenges/")) {
    const rest = p.slice("/challenges/".length);
    if (!rest) return null;
    return { kind: "challenge", relativePath: join("content", "challenges", `${rest}.mdx`) };
  }
  return null;
}

export type ReadAcademyDocumentResult = {
  kind: AcademyContentKind;
  sitePath: string;
  relativePath: string;
  frontmatter: Record<string, unknown>;
  body: string;
  /** True when additional body exists after this chunk (`nextCharacterOffset` is non-null). */
  truncated: boolean;
  maxChars: number;
  characterOffsetApplied: number;
  totalBodyChars: number;
  /** Start offset of next read; omit follow-up requests when null. */
  nextCharacterOffset: number | null;
};

function normalizeOpts(maxCharsOrOptions?: number | ReadAcademyDocumentOptions): ReadAcademyDocumentOptions {
  if (typeof maxCharsOrOptions === "number") {
    return { maxChars: maxCharsOrOptions };
  }
  return maxCharsOrOptions ?? {};
}

export async function readAcademyDocument(
  sitePath: string,
  maxCharsOrOptions?: number | ReadAcademyDocumentOptions
): Promise<ReadAcademyDocumentResult> {
  const opts = normalizeOpts(maxCharsOrOptions);
  const normalizedPath =
    sitePath.trim().startsWith("/") ? sitePath.trim() : `/${sitePath.trim()}`;
  const resolved = resolveSitePathToRelativeFile(normalizedPath);
  if (!resolved) {
    throw new Error(
      `Invalid path. Use a site path like /learn/phase-0/chunking-101, /playbooks/chunking-strategies, or /challenges/rrf-fusion`
    );
  }

  const abs = join(process.cwd(), resolved.relativePath);
  const raw = await readFile(abs, "utf8");
  const { data, content } = matter(raw);
  const fm = typeof data === "object" && data !== null ? (data as Record<string, unknown>) : {};
  const bodyRaw = content.trim();
  const totalBodyChars = bodyRaw.length;

  const max = Math.max(1000, Math.min(opts.maxChars ?? MAX_BODY_CHARS_DEFAULT, 500_000));
  const requestedOffset = Math.max(0, Math.trunc(opts.characterOffset ?? 0));
  const start = Math.min(requestedOffset, totalBodyChars);
  const end = Math.min(start + max, totalBodyChars);
  const body = bodyRaw.slice(start, end);
  const nextCharacterOffset = end < totalBodyChars ? end : null;

  return {
    kind: resolved.kind,
    sitePath: normalizedPath,
    relativePath: resolved.relativePath,
    frontmatter: fm,
    body,
    truncated: nextCharacterOffset !== null,
    maxChars: max,
    characterOffsetApplied: start,
    totalBodyChars,
    nextCharacterOffset,
  };
}
