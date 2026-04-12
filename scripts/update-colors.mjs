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

const replacements = [
  { from: 'text-zinc-', to: 'text-gray-' },
  { from: 'bg-zinc-', to: 'bg-gray-' },
  { from: 'border-zinc-', to: 'border-gray-' },
  { from: 'hover:bg-zinc-', to: 'hover:bg-gray-' },
  { from: 'hover:text-zinc-', to: 'hover:text-gray-' },
  { from: 'hover:border-zinc-', to: 'hover:border-gray-' },
  { from: 'ring-zinc-', to: 'ring-gray-' },
  { from: 'from-zinc-', to: 'from-gray-' },
  { from: 'to-zinc-', to: 'to-gray-' },
  { from: 'via-zinc-', to: 'via-gray-' },
];

let filesUpdated = 0;
let totalReplacements = 0;

walkDir(srcDir, (filepath) => {
  let content = fs.readFileSync(filepath, 'utf8');
  let fileChanged = false;
  
  for (const { from, to } of replacements) {
    const regex = new RegExp(from, 'g');
    const matches = content.match(regex);
    if (matches) {
      content = content.replace(regex, to);
      fileChanged = true;
      totalReplacements += matches.length;
    }
  }
  
  if (fileChanged) {
    fs.writeFileSync(filepath, content);
    filesUpdated++;
  }
});

console.log(`✅ Updated ${filesUpdated} files with ${totalReplacements} total replacements.`);