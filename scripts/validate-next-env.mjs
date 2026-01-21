import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const filePath = path.join(ROOT, "next-env.d.ts");

function fail(msg) {
  // eslint-disable-next-line no-console
  console.error(`\nnext-env.d.ts validation failed:\n- ${msg}\n`);
  process.exit(1);
}

const raw = await fs.readFile(filePath, "utf8");

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


