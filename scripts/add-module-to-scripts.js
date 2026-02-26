import fs from 'fs';
import path from 'path';

function updateContent(content) {
  // Add type="module" to script tags that reference local main.js or consent.js
  const re = /<script\s+([^>]*src=["'][^"']*js\/(?:main|consent)\.js["'][^>]*)>/gmi;
  return content.replace(re, (m, inner) => {
    if (/\btype=/.test(inner)) return `<script ${inner}>`;
    return `<script type="module" ${inner}>`;
  });
}

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walk(full);
    } else if (/\.html?$/.test(name)) {
      let content = fs.readFileSync(full, 'utf8');
      const updated = updateContent(content);
      if (updated !== content) {
        fs.writeFileSync(full, updated, 'utf8');
        console.log('Updated scripts in:', full);
      }
    }
  }
}

walk(process.cwd());
console.log('Done.');
