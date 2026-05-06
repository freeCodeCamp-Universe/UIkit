import type { AstroIntegration } from 'astro';
import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { buildIndex } from './lib/build-index.ts';

interface IntegrationOptions {
  /** Override content root (default `<projectRoot>/src/content`). Test harness only. */
  contentRoot?: string;
}

export default function searchIndex(
  options: IntegrationOptions = {}
): AstroIntegration {
  return {
    name: 'fcc-uikit-search-index',
    hooks: {
      'astro:server:setup': ({ server, logger }) => {
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
