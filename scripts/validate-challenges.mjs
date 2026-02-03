import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const DEFS_DIR = path.join(ROOT, "src", "lib", "challenges", "defs");
const PROMPTS_DIR = path.join(ROOT, "content", "challenges");
const STAGE_MAP_FILE = path.join(DEFS_DIR, "stageBySlug.ts");

const VALID_STAGES = new Set([
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

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

function fail(errors) {
  // eslint-disable-next-line no-console
  console.error("\nChallenge validation failed:\n");
  for (const e of errors) {
    // eslint-disable-next-line no-console
    console.error(`- ${e}`);
  }
  // eslint-disable-next-line no-console
  console.error("");
  process.exit(1);
}

const errors = [];

// 1) Collect challenge slugs from defs/*.ts
const entries = await fs.readdir(DEFS_DIR, { withFileTypes: true });
const defFiles = entries
  .filter((e) => e.isFile() && e.name.endsWith(".ts"))
  .map((e) => e.name)
  .filter((name) => name !== "all.ts" && name !== "stageBySlug.ts")
  .sort();

const slugToFile = new Map();
const slugs = [];

for (const name of defFiles) {
  const full = path.join(DEFS_DIR, name);
  const raw = await fs.readFile(full, "utf8");
  const re = /slug:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(raw))) {
    const slug = m[1];
    slugs.push(slug);
    if (slugToFile.has(slug)) {
      errors.push(
        `duplicate slug "${slug}" in ${path.join("src/lib/challenges/defs", name)} (already in ${slugToFile.get(slug)})`
      );
    } else {
      slugToFile.set(slug, path.join("src/lib/challenges/defs", name));
    }
  }
}

if (slugs.length === 0) {
  errors.push("No challenge slugs found in src/lib/challenges/defs/*.ts");
}

// 2) Parse stage map
const stageMapExists = await fileExists(STAGE_MAP_FILE);
if (!stageMapExists) {
  errors.push("Missing stage map file: src/lib/challenges/defs/stageBySlug.ts");
} else {
  const stageRaw = await fs.readFile(STAGE_MAP_FILE, "utf8");
  const stageRe = /"([^"]+)"\s*:\s*"([^"]+)"/g;
  const stageBySlug = new Map();
  let m;
  while ((m = stageRe.exec(stageRaw))) {
    stageBySlug.set(m[1], m[2]);
  }

  for (const slug of slugs) {
    const stage = stageBySlug.get(slug);
    if (!stage) {
      errors.push(`missing stage mapping for slug "${slug}"`);
      continue;
    }
    if (!VALID_STAGES.has(stage)) {
      errors.push(
        `invalid stage "${stage}" for slug "${slug}" (must be one of: ${Array.from(VALID_STAGES).join(", ")})`
      );
    }
  }
}

// 3) Ensure each slug has a prompt MDX
for (const slug of slugs) {
  const promptPath = path.join(PROMPTS_DIR, `${slug}.mdx`);
  const ok = await fileExists(promptPath);
  if (!ok) {
    errors.push(`missing challenge prompt: content/challenges/${slug}.mdx`);
  }
}

if (errors.length > 0) fail(errors);

// eslint-disable-next-line no-console
console.log(`Challenge validation OK (${new Set(slugs).size} challenges)`);


