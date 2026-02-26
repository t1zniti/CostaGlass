import { defineConfig } from 'vite';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { resolve } from 'path';
import fs from 'fs';

// 1. Set your base pages manually
const inputPages = {
  main: resolve(__dirname, 'index.html'),
  // Add any other manual pages you already have:
  // blog: resolve(__dirname, 'blog.html'),
  // contact: resolve(__dirname, 'contact.html'),
};

// 2. Automatically detect all generated SEO pages
const dirs = fs.readdirSync(__dirname, { withFileTypes: true });
for (const dir of dirs) {
  // Ignore dev/build folders
  if (dir.isDirectory() && !['node_modules', 'dist', 'seo-generator', '.git', 'Assets'].includes(dir.name)) {
    const indexPath = resolve(__dirname, dir.name, 'index.html');
    if (fs.existsSync(indexPath)) {
      // Automatically adds e.g., 'cerramientos-de-cristal-marbella' to Vite's build list
      inputPages[dir.name] = indexPath; 
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
