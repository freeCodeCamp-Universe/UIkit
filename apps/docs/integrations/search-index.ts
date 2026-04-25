// Wave 8 P2 (W8-2) — static search-index Astro integration.
//
// Replaces Pagefind. Pagefind only ran on the production build, so
// `pnpm dev` had a broken search and the indexed content was a strict
// subset of what shipped on `/`. This integration solves both:
//
//  - dev: registers a Vite middleware on `/search-index.json` that
//    rebuilds the index on every request and watches `src/content/`
//    via the Vite dev-server watcher. dev queries hit live content.
//
//  - prod: writes `dist/search-index.json` once after the build is
//    complete. Same builder = same shape = same results.
//
// The builder is a pure function over the content directory
// (`./lib/build-index.ts`); test fixtures cover its contract. This
// file is the thin Astro hook glue.
//
// D9: dev hook is `astro:server:setup`, NOT `astro:config:setup` —
// the latter fires before content collections are loaded, so any
// attempt to `getCollection()` or read content there would race the
// Astro content-layer init. Astro 6 also drops `routes` from
// `astro:build:done` — we use `dir` only.
import type { AstroIntegration } from 'astro';
import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { buildIndex } from './lib/build-index.ts';

interface IntegrationOptions {
  /** Optional override for the content root. Defaults to
   *  `<projectRoot>/src/content`. Test harness only. */
  contentRoot?: string;
}

export default function searchIndex(
  options: IntegrationOptions = {}
): AstroIntegration {
  return {
    name: 'fcc-uikit-search-index',
    hooks: {
      'astro:server:setup': ({ server, logger }) => {
        // `server` is the Vite dev server. Use the existing watcher
        // for content invalidation; no separate filesystem watcher
        // process. `server.middlewares` is a Connect-style stack —
        // the first middleware whose URL matches handles the
        // request and short-circuits the rest.
        const projectRoot = process.cwd();
        const contentRoot =
          options.contentRoot ?? resolve(projectRoot, 'src', 'content');
        server.middlewares.use('/search-index.json', (_req, res) => {
          try {
            const index = buildIndex(contentRoot);
            const body = JSON.stringify(index);
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('Cache-Control', 'no-store');
            res.end(body);
          } catch (err) {
            logger.error(
              `[search-index] dev middleware failed: ${(err as Error).message}`
            );
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'index unavailable' }));
          }
        });
        logger.info(
          `[search-index] dev middleware mounted on /search-index.json`
        );
      },
      'astro:build:done': async ({ dir, logger }) => {
        const projectRoot = process.cwd();
        const contentRoot =
          options.contentRoot ?? resolve(projectRoot, 'src', 'content');
        const index = buildIndex(contentRoot);
        const out = fileURLToPath(new URL('./search-index.json', dir));
        await mkdir(dirname(out), { recursive: true });
        await writeFile(out, JSON.stringify(index));
        logger.info(`[search-index] wrote ${index.length} entries to ${out}`);
      }
    }
  };
}
