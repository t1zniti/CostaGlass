import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://costaglass.es',
  output: 'static',
  build: {
    format: 'directory',
  },
});
