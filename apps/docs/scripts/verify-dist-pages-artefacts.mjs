#!/usr/bin/env node
/**
 * Post-build assertion: every Cloudflare Pages artefact required at deploy
 * time made it from `apps/docs/public/` (or an Astro integration's emit
 * step) into `apps/docs/dist/`.
 *
 * Astro copies `public/` verbatim, but a misconfigured `outDir`, stray
 * `.gitignore` rule, or accidentally-removed integration could silently
 * drop one of these files. A missing `_headers` ships an unhardened
 * deploy; a missing `sitemap-index.xml` breaks crawler discovery.
 *
 * This script runs as the tail of `pnpm build:docs` (chained in
 * `apps/docs/package.json#scripts.build`). It is also imported by the
 * meta-gate at `apps/docs/src/_meta/pages-config.test.ts`.
 */
import { existsSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Files Cloudflare Pages must find in the deployed output directory for
 * the freeCodeCamp UIKit docs site to behave correctly. Order is purely
 * cosmetic; presence is what matters.
 *
 * - `_headers` — security globals + cache rules (PH2-B3, see ADR-0007).
 * - `_redirects` — currently a comment-only stub; reserved for future
 *   canonical-host or legacy-URL aliases (PH2-B4).
 * - `robots.txt` — crawler directives + absolute sitemap URL (PH2-B5).
 * - `favicon.svg` — root favicon.
 * - `sitemap-index.xml` + `sitemap-0.xml` — emitted by `@astrojs/sitemap`.
 */
export const REQUIRED_PAGES_ARTEFACTS = Object.freeze([
  '_headers',
  '_redirects',
  'robots.txt',
  'favicon.svg',
  'sitemap-index.xml',
  'sitemap-0.xml'
]);

/**
 * @param {string} distDir Absolute path to the build output directory.
 * @param {readonly string[]} [required] Override list (test injection only).
 * @returns {string[]} Filenames missing from `distDir`, in declaration order.
 */
export function findMissingArtefacts(
  distDir,
  required = REQUIRED_PAGES_ARTEFACTS
) {
  return required.filter(name => {
    const path = join(distDir, name);
    return !existsSync(path) || !statSync(path).isFile();
  });
}

/**
 * CLI entrypoint. Asserts every required artefact exists in the
 * `apps/docs/dist/` directory adjacent to this script.
 */
function main() {
  const here = dirname(fileURLToPath(import.meta.url));
  const distDir = join(here, '..', 'dist');
  const missing = findMissingArtefacts(distDir);
  if (missing.length > 0) {
    console.error(
      `✗ Cloudflare Pages artefact(s) missing from ${distDir}:\n${missing
        .map(m => `    ${m}`)
        .join('\n')}`
    );
    process.exit(1);
  }
  console.log(
    `✓ Cloudflare Pages artefacts present in dist/ (${REQUIRED_PAGES_ARTEFACTS.length} files)`
  );
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  main();
}
