import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const CHALLENGES_DIR = path.join(process.cwd(), "content", "challenges");

async function fixFrontmatter() {
  const entries = await fs.readdir(CHALLENGES_DIR, { withFileTypes: true });
  const mdxFiles = entries.filter((e) => e.isFile() && e.name.endsWith(".mdx"));

  let fixed = 0;

  for (const file of mdxFiles) {
    const filePath = path.join(CHALLENGES_DIR, file.name);
    const raw = await fs.readFile(filePath, "utf8");

    let data, content;
    try {
      ({ data, content } = matter(raw));
    } catch (e) {
      // Try to fix malformed YAML
      console.warn(`Fixing malformed frontmatter in ${file.name}`);
      const lines = raw.split("\n");
      const dashIndices = [];
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim() === "---") dashIndices.push(i);
      }

      if (dashIndices.length >= 2) {
        // Rebuild with proper frontmatter
        const body = lines.slice(dashIndices[1] + 1).join("\n");
        const slug = file.name.replace(".mdx", "");
        const title = slug
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());

        const newFm = `---
title: "${title}"
description: "Interactive challenge for ${title}"
difficulty: medium
---`;

        await fs.writeFile(filePath, newFm + "\n" + body);
        fixed++;
      }
      continue;
    }

    let needsFix = false;
    const newData = { ...data };

    if (!data?.title || String(data.title).trim() === "") {
      const slug = file.name.replace(".mdx", "");
      newData.title = slug
        .replace(/-/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
      needsFix = true;
    }

    if (!data?.description || String(data.description).trim() === "") {
      newData.description = `Interactive challenge for ${newData.title}`;
      needsFix = true;
    }

    if (!data?.difficulty) {
      newData.difficulty = "medium";
      needsFix = true;
    }

    if (needsFix) {
      const newContent = matter.stringify(content, newData);
      await fs.writeFile(filePath, newContent);
      fixed++;
    }
  }

  console.log(`Fixed frontmatter in ${fixed} files`);
}

fixFrontmatter().catch(console.error);
