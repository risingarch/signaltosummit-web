// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import keystatic from '@keystatic/astro';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://signaltosummit.com',
  output: 'static',

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    react(),
    sitemap(),
    keystatic(),
  ],

  adapter: vercel(),
});