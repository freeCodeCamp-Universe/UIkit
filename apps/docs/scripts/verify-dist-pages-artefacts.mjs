#!/usr/bin/env node
import { existsSync, readFileSync, statSync } from 'node:fs';
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

/** Build-generated (endpoint) artefacts — not sourced from public/. */
export const REQUIRED_GENERATED_ARTEFACTS = Object.freeze([
  'llms.txt',
  'llms-full.txt',
  'registry/index.json',
  'registry/starter.md',
  'registry/theme.md'
]);

/**
 * Registry self-consistency: every item in the built registry/index.json
 * must have its docs page and every raw file present in dist/, and every
 * component must be listed in llms.txt.
 */
export function findRegistryProblems(distDir) {
  const problems = [];
  const indexPath = join(distDir, 'registry', 'index.json');
  if (!existsSync(indexPath)) return ['registry/index.json missing'];
  const index = JSON.parse(readFileSync(indexPath, 'utf8'));
  const llms = existsSync(join(distDir, 'llms.txt'))
    ? readFileSync(join(distDir, 'llms.txt'), 'utf8')
    : '';

  const components = index.items.filter(item => item.kind === 'component');
  if (components.length < 40) {
    problems.push(
      `registry/index.json lists only ${components.length} components`
    );
  }
  for (const item of index.items) {
    const docsPath = new URL(item.docs).pathname.replace(/^\//, '');
    if (!existsSync(join(distDir, docsPath))) {
      problems.push(`${item.name}: docs page ${docsPath} missing from dist`);
    }
    for (const file of item.files) {
      const rawPath = new URL(file.url).pathname.replace(/^\//, '');
      if (!existsSync(join(distDir, rawPath))) {
        problems.push(`${item.name}: raw file ${rawPath} missing from dist`);
      }
    }
    if (!llms.includes(new URL(item.docs).pathname)) {
      problems.push(`${item.name}: not listed in llms.txt`);
    }
  }
  return problems;
}

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
  const missing = [
    ...findMissingArtefacts(distDir),
    ...findMissingArtefacts(distDir, REQUIRED_GENERATED_ARTEFACTS)
  ];
  if (missing.length > 0) {
    console.error(
      `✗ Cloudflare Pages artefact(s) missing from ${distDir}:\n${missing
        .map(m => `    ${m}`)
        .join('\n')}`
    );
    process.exit(1);
  }
  const registryProblems = findRegistryProblems(distDir);
  if (registryProblems.length > 0) {
    console.error(
      `✗ Registry inconsistencies in ${distDir}:\n${registryProblems
        .map(m => `    ${m}`)
        .join('\n')}`
    );
    process.exit(1);
  }
  console.log(
    `✓ Cloudflare Pages artefacts present in dist/ (${REQUIRED_PAGES_ARTEFACTS.length} files)`
  );
  console.log('✓ Registry pages, raw files and llms.txt are consistent');
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  main();
}
