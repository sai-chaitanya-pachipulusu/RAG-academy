import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const filePath = path.join(ROOT, "next-env.d.ts");

function fail(msg) {
  // eslint-disable-next-line no-console
  console.error(`\nnext-env.d.ts validation failed:\n- ${msg}\n`);
  process.exit(1);
}

// Default content for next-env.d.ts (Next.js auto-generates this)
const DEFAULT_NEXT_ENV = `/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
`;

// Check if file exists, create it if not (fresh clone scenario)
let raw;
try {
  raw = await fs.readFile(filePath, "utf8");
} catch (err) {
  if (err.code === "ENOENT") {
    // File doesn't exist - create it with default content
    console.log("next-env.d.ts not found, creating default file...");
    // Ensure directory exists before writing
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, DEFAULT_NEXT_ENV, "utf8");
    raw = DEFAULT_NEXT_ENV;
  } else {
    throw err;
  }
}

async function ensureFileExists(relPath, content) {
  const abs = path.join(ROOT, relPath);
  const dir = path.dirname(abs);
  await fs.mkdir(dir, { recursive: true });
  try {
    await fs.access(abs);
  } catch {
    await fs.writeFile(abs, content, "utf8");
  }
}

// Next 16+ may auto-inject a typed routes import here.
// The real problem is when the referenced file DOES NOT exist yet (fresh clone),
// which can cascade into confusing TS errors. So we ensure a stub exists.
const ROUTES_IMPORTS = [
  "./.next/types/routes.d.ts",
  "./.next/dev/types/routes.d.ts",
];

for (const spec of ROUTES_IMPORTS) {
  if (!raw.includes(spec)) continue;

  const rel = spec.replace(/^\.\//, ""); // "./.next/..." -> ".next/..."
  await ensureFileExists(
    rel,
    `// Auto-generated stub to prevent TS errors when .next types are missing.\n// Next will overwrite this file during dev/build.\nexport {};\n`
  );
}

// Sanity: keep the standard Next references present.
if (!raw.includes('/// <reference types="next" />')) {
  fail('Missing `/// <reference types="next" />`');
}
if (!raw.includes('/// <reference types="next/image-types/global" />')) {
  fail('Missing `/// <reference types="next/image-types/global" />`');
}

// eslint-disable-next-line no-console
console.log("next-env.d.ts validation OK (and route type stubs ensured if needed)");


