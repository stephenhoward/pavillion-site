// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://pavillion.social',
  vite: {
    build: {
      // Astro builds with target "esnext", which gives lightningcss no browser
      // targets, so it adds no vendor prefixes (e.g. -webkit-backdrop-filter).
      // Use Vite's "baseline widely available" set instead.
      cssTarget: ['chrome111', 'edge111', 'firefox114', 'safari16.4', 'ios16.4'],
    },
  },
});
