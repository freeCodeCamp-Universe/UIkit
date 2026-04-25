// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import searchIndex from './integrations/search-index.ts';

// Wave 6 · P0 — sibling-source dogfood. The docs site imports from
// `@freecodecamp/uikit*` but resolves those specifiers to the raw TS
// source under `packages/<name>/src/`, not the published `dist/`. The
// payoff: edits in `packages/uikit/src/primitives/Button.tsx` HMR into
// the running `pnpm --filter docs dev` server with zero publish/link
// dance. Mirrors the path map in `apps/docs/tsconfig.json` so the IDE,
// `astro check`, and the runtime bundler all agree.
//
// `uikit-css` ships CSS-only via package `exports`; no alias needed.
const pkgUrl = rel =>
  fileURLToPath(new URL(`../../packages/${rel}`, import.meta.url));

// https://astro.build/config
export default defineConfig({
  site: 'https://fcc-uikit.netlify.app',
  // Wave 7 P3 — pin Shiki to `github-dark` so every `<Code>` block
  // and MDX fence emits `<pre class="astro-code github-dark">`. The
  // playground previews and the brand handbook both depend on the
  // dark-first palette; an Astro default change must not silently
  // re-theme the docs.
  markdown: {
    shikiConfig: {
      theme: 'github-dark'
    }
  },
  integrations: [
    react(),
    // Wave 7 P8 — `rehype-slug` adds an `id` attribute to every
    // heading; `rehype-autolink-headings` wraps each in a `<a>` so
    // direct anchor links work. ProseLayout's TOC harvests `<h2 id=…>`
    // at runtime; without slug the harvest finds nothing and the TOC
    // hides itself. Apply to MDX so guides + foundations both light up.
    mdx({
      rehypePlugins: [
        rehypeSlug,
        // `behavior: 'append'` adds a small `#` link AFTER the heading
        // text. `'wrap'` (Wave 7 P8 first cut) wrapped the entire
        // heading in an `<a>`, which inherited link styles and made
        // every H3 in the foundations MDX look like an underlined
        // link. Append keeps headings as plain headings.
        [
          rehypeAutolinkHeadings,
          {
            behavior: 'append',
            properties: {
              className: ['heading-anchor'],
              ariaHidden: 'true',
              tabIndex: -1
            },
            content: { type: 'text', value: ' #' }
          }
        ]
      ]
    }),
    // Sitemap covers the Playground + Handbook but skips every /api/*
    // page. The API reference is reachable (robots allow) but stays
    // out of search engines.
    sitemap({
      filter: page => !page.includes('/api/') && !/\/api\/?$/.test(page)
    }),
    // Wave 8 P2 — static search index. Dev mounts middleware on
    // `/search-index.json`; build writes `dist/search-index.json`.
    // Replaces Pagefind (build-only, broken in dev).
    searchIndex()
  ],
  vite: {
    resolve: {
      alias: [
        {
          find: /^@freecodecamp\/uikit$/,
          replacement: pkgUrl('uikit/src/index.ts')
        },
        {
          find: /^@freecodecamp\/uikit\/(.*)$/,
          replacement: pkgUrl('uikit/src/$1')
        },
        {
          find: /^@freecodecamp\/uikit-icons$/,
          replacement: pkgUrl('uikit-icons/src/index.ts')
        },
        {
          find: /^@freecodecamp\/uikit-icons\/(.*)$/,
          replacement: pkgUrl('uikit-icons/src/$1')
        },
        {
          find: /^@freecodecamp\/uikit-js$/,
          replacement: pkgUrl('uikit-js/src/index.ts')
        },
        {
          find: /^@freecodecamp\/uikit-tailwind$/,
          replacement: pkgUrl('uikit-tailwind/src/index.ts')
        }
      ]
    },
    // SSR must compile uikit JSX in-process — the source is TS/TSX, not
    // pre-built JS. `noExternal` tells Vite to bundle these instead of
    // requiring them through Node's loader.
    ssr: {
      noExternal: [
        '@freecodecamp/uikit',
        '@freecodecamp/uikit-icons',
        '@freecodecamp/uikit-js',
        '@freecodecamp/uikit-tailwind'
      ]
    },
    // Vite's default `fs.allow` is the project root (`apps/docs/`). We
    // import from `../../packages/*`, so widen the allow-list to the
    // monorepo root.
    server: {
      fs: {
        allow: ['..', '../..']
      }
    },
    // Pre-bundling the uikit packages caches `dist/` artifacts and
    // breaks HMR on raw-source edits. Exclude them so Vite hits the
    // alias on every request.
    optimizeDeps: {
      exclude: [
        '@freecodecamp/uikit',
        '@freecodecamp/uikit-icons',
        '@freecodecamp/uikit-js',
        '@freecodecamp/uikit-tailwind'
      ]
    }
  },
  // IA redirects through Wave 4 + Wave 6. Astro's redirect map only
  // supports destinations that resolve to existing routes, so it
  // can't add a URL fragment. The wildcard rules `/api/* → /#:splat`
  // and `/components/* → /#:splat` live in `public/_redirects` for
  // Netlify; what stays here is the route-level retirement (the
  // index pages of the retired sections both go to `/`).
  redirects: {
    // Wave 4 · 4.3 — playground took over `/`.
    '/showcase': '/',
    // Wave 6 — `/api/*` retired. The playground (`/`) is the single
    // source of truth; external deep-links land at the matching
    // anchor via the `_redirects` rules in `public/`.
    '/api': '/',
    // Wave 4 · 4.4 — `/components` was an alias for `/api`. Both fold
    // into `/` post-Wave-6.
    '/components': '/',
    // Wave 4 · 4.7 → Wave 6 — `/guides/*` was folded into `/handbook`
    // in Wave 4 but un-retired in Wave 6 with a richer per-package
    // surface. The route is live again; only the foundations
    // sub-routes still fold into the handbook (catch-all for
    // `/foundations/*` lives in `public/_redirects`).
    '/foundations': '/handbook',
    '/foundations/colors': '/handbook#palette',
    '/foundations/typography': '/handbook#typography',
    '/foundations/spacing': '/handbook#spacing',
    '/foundations/iconography': '/handbook#iconography',
    '/foundations/motion': '/handbook#motion',
    '/foundations/voice': '/handbook#voice'
  }
});
