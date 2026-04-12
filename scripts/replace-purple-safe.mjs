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
  { from: '#8B5CF6', to: '#3B82F6' },
  { from: '#7C3AED', to: '#2563EB' },
  { from: '#A78BFA', to: '#60A5FA' },
  { from: '#6D28D9', to: '#1D4ED8' },
  { from: 'text-[#8B5CF6]', to: 'text-[#3B82F6]' },
  { from: 'bg-[#8B5CF6]', to: 'bg-[#3B82F6]' },
  { from: 'hover:bg-[#7C3AED]', to: 'hover:bg-[#2563EB]' },
  { from: 'hover:border-[#8B5CF6]', to: 'hover:border-[#3B82F6]' },
  { from: 'ring-[#8B5CF6]', to: 'ring-[#3B82F6]' },
  { from: 'focus:ring-[#8B5CF6]', to: 'focus:ring-[#3B82F6]' },
  { from: 'focus:border-[#8B5CF6]', to: 'focus:border-[#3B82F6]' },
  { from: 'border-[#8B5CF6]', to: 'border-[#3B82F6]' },
  { from: '[#8B5CF6]', to: '[#3B82F6]' },
  { from: '[#7C3AED]', to: '[#2563EB]' },
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

console.log(`✅ Updated ${filesUpdated} files with ${totalReplacements} color replacements (purple → blue).`);