import fs from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";

const ROOT = process.cwd();
const OUT_FILE = path.join(
  ROOT,
  "src",
  "lib",
  "search",
  "contentIndex.generated.json"
);

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

function stripForIndex(raw, maxChars) {
  let s = raw ?? "";
  // Remove fenced code blocks
  s = s.replace(/```[\s\S]*?```/g, " ");
  // Remove MDX/HTML-ish tags
  s = s.replace(/<[^>]+>/g, " ");
  // Remove markdown headings markers
  s = s.replace(/^#{1,6}\s+/gm, "");
  // Links: [text](url) -> text
  s = s.replace(/\[(.*?)\]\((.*?)\)/g, "$1");
  // Collapse whitespace
  s = s.replace(/\s+/g, " ").trim();
  if (typeof maxChars === "number") return s.slice(0, maxChars);
  return s;
}

async function listDirs(dir) {
  const exists = await fileExists(dir);
  if (!exists) return [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => e.name);
}

async function listMdxFiles(dir) {
  const exists = await fileExists(dir);
  if (!exists) return [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".mdx"))
    .map((e) => e.name);
}

async function buildLessonsIndex() {
  const lessonsRoot = path.join(ROOT, "content", "lessons");
  const phases = (await listDirs(lessonsRoot)).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true })
  );

  const out = [];
  for (const phase of phases) {
    const phaseDir = path.join(lessonsRoot, phase);
    const mdxFiles = await listMdxFiles(phaseDir);
    for (const f of mdxFiles) {
      const slug = f.replace(/\.mdx$/i, "");
      const full = path.join(phaseDir, f);
      const raw = await fs.readFile(full, "utf8");
      const { data, content } = matter(raw);

      const title = String(data?.title ?? slug);
      const description = String(data?.description ?? "");
      const tags = Array.isArray(data?.tags) ? data.tags.map(String) : [];
      const stage = String(data?.stage ?? "");
      const outcomes = Array.isArray(data?.outcomes) ? data.outcomes.map(String) : [];

      const bodyText = stripForIndex(content, 20_000);
      const searchText = stripForIndex(
        `${title}\n${description}\n${stage}\n${tags.join(" ")}\n${outcomes.join(" ")}\n${bodyText}`,
        30_000
      );
      const excerpt = stripForIndex(content, 1400);

      out.push({
        id: `lesson:${phase}/${slug}`,
        type: "lesson",
        title,
        description,
        url: `/learn/${phase}/${slug}`,
        tags,
        stage,
        outcomes,
        searchText,
        excerpt,
      });
    }
  }

  return out;
}

async function buildPlaybooksIndex() {
  const playbooksRoot = path.join(ROOT, "content", "playbooks");
  const mdxFiles = await listMdxFiles(playbooksRoot);
  const out = [];

  for (const f of mdxFiles) {
    const slug = f.replace(/\.mdx$/i, "");
    const full = path.join(playbooksRoot, f);
    const raw = await fs.readFile(full, "utf8");
    const { data, content } = matter(raw);

    const title = String(data?.title ?? slug);
    const description = String(data?.description ?? "");
    const tags = Array.isArray(data?.tags) ? data.tags.map(String) : [];

    const bodyText = stripForIndex(content, 30_000);
    const searchText = stripForIndex(`${title}\n${description}\n${tags.join(" ")}\n${bodyText}`, 40_000);
    const excerpt = stripForIndex(content, 1600);

    out.push({
      id: `playbook:${slug}`,
      type: "playbook",
      title,
      description,
      url: `/playbooks/${slug}`,
      tags,
      searchText,
      excerpt,
    });
  }

  return out;
}

const lessons = await buildLessonsIndex();
const playbooks = await buildPlaybooksIndex();
const all = [...lessons, ...playbooks];

await ensureDir(path.dirname(OUT_FILE));
await fs.writeFile(OUT_FILE, JSON.stringify(all, null, 2) + "\n", "utf8");

// eslint-disable-next-line no-console
console.log(`Search index generated: ${path.relative(ROOT, OUT_FILE)} (${all.length} docs)`);


