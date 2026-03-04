/**
 * Extracts product page body content into reusable Astro components.
 * Run with: node scripts/extract-product-components.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const root = '/Users/noz/Desktop/development/costaGlass';

const products = [
  {
    key: 'cortinas-de-cristal',
    h1Original: 'Cortinas de Cristal',
    h1City: 'Cortinas de Cristal',
    // Frontmatter ends at line 67, BaseLayout opens line 69, ">" at 74, content starts line 75
    // </BaseLayout> at line 736 → slice(74, 735)
    contentSlice: [74, 735],
    schemaName: 'CortinasCristalContent',
  },
  {
    key: 'pergolas-bioclimaticas',
    h1Original: 'Pérgolas Bioclimáticas Motorizadas a Medida',
    h1City: 'Pérgolas Bioclimáticas',
    // </BaseLayout> at line 751 → content lines 83-750 → slice(82, 750)
    contentSlice: [82, 750],
    schemaName: 'PergotlasBioclimáticasContent', // unused, just for logging
  },
  {
    key: 'guillotina-de-cristal',
    h1Original: 'Guillotinas de Cristal Motorizadas',
    h1City: 'Guillotinas de Cristal',
    // </BaseLayout> at line 749 → content lines 83-748 → slice(82, 748)
    contentSlice: [82, 748],
  },
  {
    key: 'toldo-zip',
    h1Original: 'Toldos Zip y Estores Exteriores Motorizados',
    h1City: 'Toldos Zip',
    contentSlice: [82, 750],
  },
  {
    key: 'retractable-pvc-roof',
    h1Original: 'Pérgolas Retráctiles Motorizadas a Medida',
    h1City: 'Pérgolas Retráctiles',
    contentSlice: [82, 750],
  },
  {
    key: 'paraviento-de-cristal',
    h1Original: 'Paravientos de Cristal para Terrazas y Hostelería',
    h1City: 'Paravientos de Cristal',
    contentSlice: [82, 750],
  },
];

mkdirSync(join(root, 'src/components/products'), { recursive: true });

for (const p of products) {
  const filePath = join(root, `src/pages/${p.key}/index.astro`);
  const text = readFileSync(filePath, 'utf8');
  const lines = text.split('\n');

  // Dynamically find </BaseLayout> to guard against off-by-one
  const closeTagIdx = lines.findIndex(l => l.trim() === '</BaseLayout>');
  if (closeTagIdx === -1) {
    console.error(`ERROR: Could not find </BaseLayout> in ${p.key}`);
    process.exit(1);
  }

  // Dynamically find where content starts (line after the closing > of <BaseLayout>)
  // Search backwards from closeTagIdx for the line that is just ">"
  let contentStartIdx = p.contentSlice[0]; // fallback
  for (let i = closeTagIdx - 1; i >= 0; i--) {
    const trimmed = lines[i].trim();
    if (trimmed === '>') {
      contentStartIdx = i + 1;
      break;
    }
  }

  // Extract content lines: from contentStartIdx up to (but not including) closeTagIdx
  const contentLines = lines.slice(contentStartIdx, closeTagIdx);
  let content = contentLines.join('\n');

  // Replace H1 with city-aware version using Astro expression
  const h1Original = `<h1>${p.h1Original}</h1>`;
  const h1Dynamic = `<h1>{cityName ? \`${p.h1City} en \${cityName}\` : '${p.h1Original}'}</h1>`;
  if (!content.includes(h1Original)) {
    console.error(`ERROR: H1 not found in ${p.key}. Expected: ${h1Original}`);
    process.exit(1);
  }
  content = content.replace(h1Original, h1Dynamic);

  // Remove slot="scripts" so the script renders inline (valid in components)
  content = content.replace(/ slot="scripts"/g, '');

  // Derive PascalCase component name from slug
  const compName = p.key.split('-').map(s => s[0].toUpperCase() + s.slice(1)).join('') + 'Content';
  const compPath = join(root, `src/components/products/${compName}.astro`);

  const componentSource = `---
interface Props {
  cityName?: string;
}
const { cityName } = Astro.props;
---
${content}
`;

  writeFileSync(compPath, componentSource, 'utf8');
  console.log(`✓ Created: src/components/products/${compName}.astro (${contentLines.length} lines of content)`);

  // -----------------------------------------------------------------------
  // Rewrite the product page as a thin wrapper that uses the component
  // -----------------------------------------------------------------------
  // Keep everything from line 1 up to and including the ">" line of BaseLayout
  const baseLayoutOpenLines = lines.slice(0, contentStartIdx);  // includes the ">"
  const importLine = `import ${compName} from '../../components/products/${compName}.astro';`;

  // Find the existing import line and add the new import after it
  let pageLines = [...baseLayoutOpenLines];

  // Add the component import right after the existing BaseLayout import
  const baseLayoutImportIdx = pageLines.findIndex(l => l.includes("import BaseLayout"));
  if (baseLayoutImportIdx !== -1) {
    pageLines.splice(baseLayoutImportIdx + 1, 0, importLine);
  }

  // Find where the frontmatter ends (second ---)
  const fmEnd = pageLines.findIndex((l, i) => i > 0 && l === '---');

  // Close BaseLayout at end
  const newPage = [...pageLines, `  <${compName} />`, '</BaseLayout>', ''].join('\n');
  writeFileSync(filePath, newPage, 'utf8');
  console.log(`✓ Slimmed:  src/pages/${p.key}/index.astro`);
}

console.log('\nDone. Run: npm run build');
