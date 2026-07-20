#!/usr/bin/env node
import { createHash } from 'node:crypto';
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

/** Build-generated (endpoint) artefacts - not sourced from public/. */
export const REQUIRED_GENERATED_ARTEFACTS = Object.freeze([
  'llms.txt',
  'llms-full.txt',
  'registry/index.json',
  'registry/starter.md',
  'registry/theme.md'
]);

/** Zero-build CDN bundle artefacts - see apps/docs/scripts/build-cdn-bundle.mjs. */
export const REQUIRED_CDN_ARTEFACTS = Object.freeze([
  'cdn/styles.min.css',
  'cdn/tokens.min.css',
  'cdn/components.min.css',
  'cdn/uikit.global.js',
  'cdn/sprite.svg',
  'cdn/manifest.json'
]);

/**
 * CDN bundle integrity: every manifest entry's recomputed hash must match,
 * and no minified CSS file may reference an absolute /fonts/ URL (must be
 * rewritten to ./fonts/... so the bundle is relocatable).
 */
export function findCdnBundleProblems(distDir) {
  const problems = [];
  const cdnDir = join(distDir, 'cdn');
  const manifestPath = join(cdnDir, 'manifest.json');
  if (!existsSync(manifestPath)) return ['cdn/manifest.json missing'];
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

  for (const [rel, expected] of Object.entries(manifest.files ?? {})) {
    const filePath = join(cdnDir, rel);
    if (!existsSync(filePath)) {
      problems.push(`cdn manifest entry ${rel}: file missing`);
      continue;
    }
    const buf = readFileSync(filePath);
    const sha256 = createHash('sha256').update(buf).digest('hex');
    const sha384 = `sha384-${createHash('sha384').update(buf).digest('base64')}`;
    if (sha256 !== expected.sha256) {
      problems.push(`cdn manifest entry ${rel}: sha256 mismatch`);
    }
    if (sha384 !== expected.sha384) {
      problems.push(`cdn manifest entry ${rel}: sha384 mismatch`);
    }
  }

  for (const rel of [
    'styles.min.css',
    'tokens.min.css',
    'components.min.css'
  ]) {
    const filePath = join(cdnDir, rel);
    if (!existsSync(filePath)) continue;
    if (/(^|[^.])\/fonts\//.test(readFileSync(filePath, 'utf8'))) {
      problems.push(`cdn/${rel}: contains an absolute /fonts/ URL`);
    }
  }

  return problems;
}

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
    ...findMissingArtefacts(distDir, REQUIRED_GENERATED_ARTEFACTS),
    ...findMissingArtefacts(distDir, REQUIRED_CDN_ARTEFACTS)
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
  const cdnProblems = findCdnBundleProblems(distDir);
  if (cdnProblems.length > 0) {
    console.error(
      `✗ CDN bundle problems in ${distDir}:\n${cdnProblems
        .map(m => `    ${m}`)
        .join('\n')}`
    );
    process.exit(1);
  }
  console.log(
    `✓ Cloudflare Pages artefacts present in dist/ (${REQUIRED_PAGES_ARTEFACTS.length} files)`
  );
  console.log('✓ Registry pages, raw files and llms.txt are consistent');
  console.log('✓ CDN bundle artefacts present and integrity-verified');
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  main();
}
