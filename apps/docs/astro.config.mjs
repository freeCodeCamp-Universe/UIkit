// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import searchIndex from './integrations/search-index.ts';

/** @param {string} rel */
const pkgUrl = rel =>
  fileURLToPath(new URL(`../../packages/${rel}`, import.meta.url));

// https://astro.build/config
export default defineConfig({
  site: 'https://design.freecodecamp.org',
  markdown: {
    shikiConfig: {
      theme: 'github-dark'
    }
  },
  integrations: [
    react(),
    mdx({
      rehypePlugins: [
        rehypeSlug,
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
    // Sitemap skips /api/* - reachable but excluded from search engines.
    sitemap({
      filter: page => !page.includes('/api/') && !/\/api\/?$/.test(page)
    }),
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
    // SSR must bundle TS/TSX uikit source rather than route through Node's loader.
    ssr: {
      noExternal: [
        '@freecodecamp/uikit',
        '@freecodecamp/uikit-icons',
        '@freecodecamp/uikit-js',
        '@freecodecamp/uikit-tailwind'
      ]
    },
    server: {
      fs: {
        allow: ['..', '../..']
      }
    },
    // Excluded from prebundle so HMR hits raw source via the alias.
    optimizeDeps: {
      exclude: [
        '@freecodecamp/uikit',
        '@freecodecamp/uikit-icons',
        '@freecodecamp/uikit-js',
        '@freecodecamp/uikit-tailwind'
      ]
    }
  }
});
