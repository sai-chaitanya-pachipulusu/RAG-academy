import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      walkDir(filepath, callback);
    } else if (filepath.endsWith('.tsx') || filepath.endsWith('.ts') || filepath.endsWith('.css')) {
      callback(filepath);
    }
  });
}

// Replace purple with blue - careful to not break numbers in class names
const replacements = [
  // Replace full hex colors in className (when they appear as #[8B5CF6])
  { from: /#8B5CF6(?!\d)/g, to: '#3B82F6' },
  { from: /#7C3AED(?!\d)/g, to: '#2563EB' },
  { from: /#A78BFA(?!\d)/g, to: '#60A5FA' },
  { from: /#6D28D9(?!\d)/g, to: '#1D4ED8' },
];

let filesUpdated = 0;
let totalReplacements = 0;

walkDir(srcDir, (filepath) => {
  // Skip challenge defs files - they contain slugs that should not be changed
  if (filepath.includes('/challenges/defs/')) {
    return;
  }
  
  let content = fs.readFileSync(filepath, 'utf8');
  let fileChanged = false;
  
  for (const { from, to } of replacements) {
    const matches = content.match(from);
    if (matches) {
      content = content.replace(from, to);
      fileChanged = true;
      totalReplacements += matches.length;
    }
  }
  
  if (fileChanged) {
    fs.writeFileSync(filepath, content);
    filesUpdated++;
  }
});

console.log(`✅ Updated ${filesUpdated} files with ${totalReplacements} color replacements (purple → blue).`);