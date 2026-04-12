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
  { from: 'bg-gray-900 text-white', to: 'bg-[#8B5CF6] text-white' },
  { from: 'bg-gray-900 px-', to: 'bg-[#8B5CF6] px-' },
  { from: 'hover:bg-gray-800', to: 'hover:bg-[#7C3AED]' },
  { from: 'active:bg-gray-', to: 'active:bg-[#6D28D9]' },
  { from: 'bg-gray-950', to: 'bg-[#7C3AED]' },
  { from: 'dark:bg-gray-100 dark:text-gray-900', to: 'dark:bg-[#8B5CF6] dark:text-white' },
  { from: 'dark:hover:bg-gray-200', to: 'dark:hover:bg-[#7C3AED]' },
  { from: 'focus:ring-gray-', to: 'focus:ring-[#8B5CF6]' },
  { from: 'focus:border-gray-', to: 'focus:border-[#8B5CF6]' },
  { from: 'bg-gray-800', to: 'bg-[#7C3AED]' },
  { from: 'border-gray-900', to: 'border-[#8B5CF6]' },
  { from: 'ring-gray-', to: 'ring-[#8B5CF6]' },
  { from: 'from-gray-', to: 'from-[#8B5CF6]-' },
  { from: 'to-gray-', to: 'to-[#8B5CF6]-' },
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

console.log(`✅ Updated ${filesUpdated} files with ${totalReplacements} accent color replacements.`);