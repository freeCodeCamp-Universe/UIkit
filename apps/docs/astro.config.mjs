// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://fcc-uikit.netlify.app',
  integrations: [
    react(),
    mdx(),
    // Sitemap covers the Playground + Handbook but skips every /api/*
    // page. The API reference is reachable (robots allow) but stays
    // out of search engines; Pagefind ignores it via
    // `data-pagefind-ignore` in the `/api/<slug>` + `/api` templates.
    sitemap({
      filter: page => !page.includes('/api/') && !/\/api\/?$/.test(page)
    })
  ],
  // Wave 4 IA redirects. `/showcase` was the storybook route until the
  // gallery was promoted to `/` in 4.3; external deep-links like
  // `/showcase#button` keep working because browsers preserve the URL
  // fragment across 301s. More redirects land in 4.7 when the legacy
  // `/guides/*` and `/foundations/*` routes fold into /handbook.
  redirects: {
    // Wave 4 · 4.3 — playground took over `/`.
    '/showcase': '/',
    // Wave 4 · 4.4 — per-component MDX moved to /api/<slug>.
    '/components': '/api',
    '/components/[...slug]': '/api/[...slug]',
    // Wave 4 · 4.7 — the handbook absorbed foundations + guides. Deep
    // links fold to the relevant anchor so external blog posts keep
    // working.
    '/guides': '/handbook#overview',
    '/guides/cdn': '/handbook#cdn',
    '/guides/copy-paste': '/handbook#install',
    '/foundations': '/handbook',
    '/foundations/colors': '/handbook#palette',
    '/foundations/typography': '/handbook#typography',
    '/foundations/spacing': '/handbook#spacing',
    '/foundations/iconography': '/handbook#iconography',
    '/foundations/motion': '/handbook#motion',
    '/foundations/voice': '/handbook#voice'
  }
});
