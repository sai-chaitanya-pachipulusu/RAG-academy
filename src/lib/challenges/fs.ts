import fs from "node:fs/promises";
import path from "node:path";

const CHALLENGES_DIR = path.join(process.cwd(), "content", "challenges");

async function fileExists(p: string) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

export async function getChallengePrompt(slug: string): Promise<string | null> {
  const filePath = path.join(CHALLENGES_DIR, `${slug}.mdx`);
  const exists = await fileExists(filePath);
  if (!exists) return null;
  return await fs.readFile(filePath, "utf8");
}


