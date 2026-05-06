#!/usr/bin/env node
import { existsSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REQUIRED_PAGES_ARTEFACTS = Object.freeze([
  '_headers',
  '_redirects',
  'robots.txt',
  'favicon.svg',
  'sitemap-index.xml',
  'sitemap-0.xml'
]);

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
