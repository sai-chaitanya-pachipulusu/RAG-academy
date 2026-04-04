import fs from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";

const ROOT = process.cwd();

const CONTENT_DIRS = [
  { id: "lessons", dir: path.join(ROOT, "content", "lessons") },
  { id: "playbooks", dir: path.join(ROOT, "content", "playbooks") },
];

const STAGES = new Set([
  "foundations",
  "pre-retrieval",
  "retrieval",
  "query-transforms",
  "advanced-retrieval",
  "post-retrieval",
  "grounding-safety",
  "agentic-rag",
  "graph-rag",
  "multimodal",
  "fine-tuning",
  "production-ops",
  "evaluation-ops",
  "frontier",
  "capstone-projects",
  "arena",
]);

function hasHeading(body, heading) {
  const h = heading.toLowerCase();
  return body
    .split(/\r?\n/g)
    .some((line) => line.trim().toLowerCase() === `## ${h}`);
}

function normalizeArray(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  return [];
}

async function listMdxFiles(dir) {
  const out = [];
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        out.push(...(await listMdxFiles(full)));
      } else if (e.isFile() && e.name.toLowerCase().endsWith(".mdx")) {
        out.push(full);
      }
    }
  } catch {
    // directory may not exist yet; fine
  }
  return out;
}

function fail(errors) {
  // eslint-disable-next-line no-console
  console.error("\nContent validation failed:\n");
  for (const e of errors) {
    // eslint-disable-next-line no-console
    console.error(`- ${e}`);
  }
  // eslint-disable-next-line no-console
  console.error("");
  process.exit(1);
}

const errors = [];

for (const { id, dir } of CONTENT_DIRS) {
  const files = await listMdxFiles(dir);
  for (const file of files) {
    const rel = path.relative(ROOT, file);
    const raw = await fs.readFile(file, "utf8");
    const { data, content } = matter(raw);

    const tags = normalizeArray(data?.tags);
    const sources = normalizeArray(data?.sources);

    // Lessons require tags; playbooks are more flexible
    if (id === "lessons" && tags.length < 1) {
      errors.push(`${rel}: frontmatter 'tags' must be a non-empty array`);
    }

    // Lessons require at least 1 source; playbooks don't require any (they may be reference/cheatsheet style)
    if (id === "lessons" && sources.length < 1) {
      errors.push(`${rel}: frontmatter 'sources' must have at least 1 item(s)`);
    }

    // Playbooks: no strict heading requirements since different playbook types have different structures
    // (e.g., interview questions, cheatsheets, guides all have different formats)

    if (id === "lessons") {
      const stage = String(data?.stage ?? "");
      if (!stage || !STAGES.has(stage)) {
        errors.push(
          `${rel}: frontmatter 'stage' must be one of: ${Array.from(STAGES).join(
            ", "
          )}`
        );
      }

      const outcomes = normalizeArray(data?.outcomes);
      if (outcomes.length < 1) {
        errors.push(`${rel}: frontmatter 'outcomes' must be a non-empty array`);
      }

      const requiredLessonHeadings = [
        "Goals",
        "Prereqs",
        "Core idea",
        "Failure modes",
        "Production defaults",
        "Do next",
      ];
      for (const h of requiredLessonHeadings) {
        if (!hasHeading(content, h)) {
          errors.push(`${rel}: missing required heading '## ${h}'`);
        }
      }
    }
  }
}

// ── Challenge MDX validation ─────────────────────────────────────────────────
// Checks every file in content/challenges/ for required frontmatter fields.
// This is separate from validate-challenges.mjs which only confirms a file exists.

const VALID_DIFFICULTIES = new Set([
  "beginner",
  "intermediate",
  "medium",
  "hard",
  "advanced",
  "expert",
]);

const challengesDir = path.join(ROOT, "content", "challenges");
const challengeFiles = await listMdxFiles(challengesDir);

const challengeWarnings = [];

for (const file of challengeFiles) {
  const rel = path.relative(ROOT, file);
  let raw;
  try {
    raw = await fs.readFile(file, "utf8");
  } catch {
    errors.push(`${rel}: could not read file`);
    continue;
  }

  let data, content;
  try {
    ({ data, content } = matter(raw));
  } catch (e) {
    errors.push(`${rel}: malformed YAML frontmatter — ${e.message}`);
    continue;
  }

  // Required string fields — missing or empty means the UI can't render the card
  if (!data?.title || String(data.title).trim() === "") {
    errors.push(`${rel}: frontmatter 'title' is required`);
  }
  if (!data?.description || String(data.description).trim() === "") {
    errors.push(`${rel}: frontmatter 'description' is required`);
  }

  // difficulty must be a recognised value
  if (!data?.difficulty) {
    errors.push(`${rel}: frontmatter 'difficulty' is required`);
  } else if (!VALID_DIFFICULTIES.has(String(data.difficulty).trim().toLowerCase())) {
    errors.push(
      `${rel}: frontmatter 'difficulty' has unrecognised value "${data.difficulty}" (valid: ${Array.from(VALID_DIFFICULTIES).join(", ")})`
    );
  }

  // xpReward is optional but should be a positive number when present
  if (data?.xpReward !== undefined && (typeof data.xpReward !== "number" || data.xpReward <= 0)) {
    errors.push(`${rel}: frontmatter 'xpReward' must be a positive number when present`);
  }

  // Body must not be empty
  if (!content || content.trim().length < 50) {
    errors.push(`${rel}: challenge body is too short (< 50 chars) — likely empty`);
  }
}

// eslint-disable-next-line no-console
console.log(`Challenge MDX validation: ${challengeFiles.length} files checked.`);

if (errors.length > 0) fail(errors);

// eslint-disable-next-line no-console
console.log("Content validation OK");


