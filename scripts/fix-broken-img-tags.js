import fs from 'fs';
import path from 'path';

function fixContent(content) {
  // Pattern: <img ...> \n  < \n  attribute=... >
  // Replace with: <img ... attribute=...>
  const re = /(<img\b[^>]*?)>\s*\n\s*<\s*\n\s*([^>]*?)\s*>/gmi;
  let prev;
  do {
    prev = content;
    content = content.replace(re, (m, a, b) => {
      return `${a} ${b}>`;
    });
  } while (content !== prev);
  return content;
}

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walk(full);
    } else if (/\.html?$/.test(name)) {
      let content = fs.readFileSync(full, 'utf8');
      const fixed = fixContent(content);
      if (fixed !== content) {
        fs.writeFileSync(full, fixed, 'utf8');
        console.log('Fixed:', full);
      }
    }
  }
}

const root = process.cwd();
walk(root);
console.log('Done.');
