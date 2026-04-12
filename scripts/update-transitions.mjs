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
    } else if (filepath.endsWith('.tsx') || filepath.endsWith('.ts')) {
      callback(filepath);
    }
  });
}

let filesUpdated = 0;
let replacementsMade = 0;

walkDir(srcDir, (filepath) => {
  let content = fs.readFileSync(filepath, 'utf8');
  let changed = false;
  
  content = content.replace(/transition-colors(?!\s+duration)/g, 'transition-all duration-200');
  content = content.replace(/transition-all(?!\s+duration)/g, 'transition-all duration-200');
  content = content.replace(/transition(?!\s)/g, 'transition-all duration-200');
  
  const cursorPointerRegex = /(className="[^"]*)(")/g;
  let match;
  while ((match = cursorPointerRegex.exec(content)) !== null) {
    const before = match[1];
    const after = match[2];
    if (!before.includes('cursor-pointer') && !before.includes('cursor-not-allowed')) {
      if (before.includes('hover:') || before.includes('transition')) {
        content = content.replace(match[0], before + ' cursor-pointer' + after);
        changed = true;
        replacementsMade++;
      }
    }
  }
  
  if (changed) {
    fs.writeFileSync(filepath, content);
    filesUpdated++;
  }
});

console.log(`✅ Updated ${filesUpdated} files with ${replacementsMade} transition/cursor additions.`);