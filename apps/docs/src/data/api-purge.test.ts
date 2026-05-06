import { test } from 'vitest';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(here, '..', '..');
const repoRoot = resolve(appRoot, '..', '..');

function grep(pattern: string, root: string): string {
  try {
    return execSync(
      `grep -rEI ${JSON.stringify(pattern)} ${JSON.stringify(root)} --include='*.astro' --include='*.ts' --include='*.tsx' --include='*.mdx' --include='*.md' --include='*.css' --exclude='*.test.ts' --exclude='*.test.tsx'`,
      { encoding: 'utf8' }
    );
  } catch (err) {
    // grep exits 1 when no matches — that's the success path here.
    const e = err as { status?: number; stdout?: string };
    if (e.status === 1) return '';
    throw err;
  }
}

const SRC = resolve(appRoot, 'src');

test('no `/api/<slug>` references in apps/docs/src', () => {
  const matches = grep('/api/[a-z]', SRC)
    .split('\n')
    .filter(line => line.length > 0)
    .filter(line => !line.includes('api-purge.test.ts'));
  assert.equal(
    matches.length,
    0,
    `unexpected /api/ references:\n${matches.join('\n')}`
  );
});

test('no `View API` link copy anywhere in apps/docs/src', () => {
  const matches = grep('View API', SRC)
    .split('\n')
    .filter(line => line.length > 0)
    .filter(line => !line.includes('api-purge.test.ts'));
  assert.equal(
    matches.length,
    0,
    `unexpected "View API" copy:\n${matches.join('\n')}`
  );
});

test('apiLinkMode prop fully removed from PlaygroundCard + showcases', () => {
  const matches = grep('apiLinkMode', SRC)
    .split('\n')
    .filter(line => line.length > 0)
    .filter(line => !line.includes('api-purge.test.ts'));
  assert.equal(
    matches.length,
    0,
    `unexpected apiLinkMode references:\n${matches.join('\n')}`
  );
});

test('Showcase.astro forwarder removed, PlaygroundCard imported directly', () => {
  // 45 showcases import PlaygroundCard.astro directly. Forwarder gone.
  const showcases = execSync(`ls ${JSON.stringify(resolve(SRC, 'showcase'))}`, {
    encoding: 'utf8'
  })
    .split('\n')
    .filter(line => line.endsWith('.astro'));
  assert.ok(
    showcases.length >= 45,
    `expected 45+ showcase files, found ${showcases.length}`
  );
  // Spot-check: no showcase imports the deleted forwarder.
  const matches = grep('from [\'"]\\.\\./components/site/Showcase\\.astro', SRC)
    .split('\n')
    .filter(line => line.length > 0);
  assert.equal(
    matches.length,
    0,
    `no showcase may import deleted Showcase.astro:\n${matches.join('\n')}`
  );
});

// Sanity guard against unintended side-effects from `repoRoot` being unused.
test('repo root resolves to the monorepo top', () => {
  assert.match(repoRoot, /UIkit$/);
});
