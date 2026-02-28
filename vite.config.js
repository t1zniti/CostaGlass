import { defineConfig } from 'vite';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { resolve } from 'path';
import fs from 'fs';

// 1. Set your base pages manually (prefer `site/main/index.html` if root `index.html` was moved)
const rootIndex = resolve(__dirname, 'index.html');
const siteMainIndex = resolve(__dirname, 'site', 'main', 'index.html');
const mainEntry = fs.existsSync(rootIndex) ? rootIndex : (fs.existsSync(siteMainIndex) ? siteMainIndex : rootIndex);
const blogRoot = resolve(__dirname, 'blog.html');
const siteBlog = resolve(__dirname, 'site', 'main', 'blog.html');
const blogEntry = fs.existsSync(blogRoot) ? blogRoot : (fs.existsSync(siteBlog) ? siteBlog : blogRoot);

const inputPages = {
  main: mainEntry,
  // Add any other manual pages you already have:
  blog: blogEntry,
  // contact: resolve(__dirname, 'contact.html'),
};

// 2. Automatically detect all generated SEO pages (including common nested locations)
const ignoreList = ['node_modules', 'dist', 'seo-generator', '.git', 'Assets'];
const dirs = fs.readdirSync(__dirname, { withFileTypes: true });
for (const dir of dirs) {
  if (!dir.isDirectory() || ignoreList.includes(dir.name)) continue;

  const indexPath = resolve(__dirname, dir.name, 'index.html');
  if (fs.existsSync(indexPath)) {
    inputPages[dir.name] = indexPath;
  }

  // Also check one level deeper (e.g., site/main/index.html, site/products/<product>/index.html)
  try {
    const subEntries = fs.readdirSync(resolve(__dirname, dir.name), { withFileTypes: true });
    for (const sub of subEntries) {
      if (!sub.isDirectory()) continue;
      const subIndex = resolve(__dirname, dir.name, sub.name, 'index.html');
      if (fs.existsSync(subIndex)) {
        const key = `${dir.name}_${sub.name}`;
        inputPages[key] = subIndex;
      }
    }
  } catch (e) {
    // ignore errors reading non-directories
  }
}

// 3. Include site/main HTML files as top-level build entries (company, contact, blog, etc.)
const siteMainDir = resolve(__dirname, 'site', 'main');
if (fs.existsSync(siteMainDir)) {
  const mainFiles = fs.readdirSync(siteMainDir, { withFileTypes: true });
  for (const f of mainFiles) {
    if (!f.isFile() || !f.name.endsWith('.html')) continue;
    const name = f.name.replace(/\.html$/, '');
    // Prefer not to overwrite existing explicit entries
    if (!inputPages[name]) {
      inputPages[name] = resolve(siteMainDir, f.name);
    }
  }
}

// 4. Map site/products HTML filenames to the public product slugs used by the generator
const productSlugMap = {
  'bioclimatic': 'pergolas-bioclimaticas',
  'glass-curtain-walls': 'cortinas-de-cristal',
  'guillotine-glass': 'guillotina-de-cristal',
  'zip-screen': 'toldo-zip',
  'retractable-pvc-roof': 'retractable-pvc-roof',
  'paravientos-de-cristal': 'paraviento-de-cristal',
};
const productsDir = resolve(__dirname, 'site', 'products');
if (fs.existsSync(productsDir)) {
  const prodFiles = fs.readdirSync(productsDir, { withFileTypes: true });
  for (const pf of prodFiles) {
    if (!pf.isFile() || !pf.name.endsWith('.html')) continue;
    const base = pf.name.replace(/\.html$/, '');
    const slug = productSlugMap[base] || base;
    if (!inputPages[slug]) {
      inputPages[slug] = resolve(productsDir, pf.name);
    }
  }
}

export default defineConfig({
  plugins: [
    ViteImageOptimizer({
      jpg: { quality: 80 },
      jpeg: { quality: 80 },
      png: { quality: 80 },
      gif: { quality: 80 },
      svg: {
        multipass: true,
        plugins: [
          {
            name: 'preset-default',
            params: { overrides: { cleanupNumericValues: false, convertPathData: false } },
          },
        ],
      },
      webp: { quality: 80 },
    }),
  ],
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      input: inputPages, // <-- This tells Vite to process the multi-page app
      output: {
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|gif|svg|webp/i.test(ext)) {
            return `Assets/[name]-[hash][extname]`;
          }
          return `[name]-[hash][extname]`;
        },
      },
    },
  },
});
