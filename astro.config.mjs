import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://costaglass.com',
  output: 'static',
  build: {
    format: 'directory',
  },
});
