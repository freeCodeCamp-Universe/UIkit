import { test } from 'vitest';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(here, '..', '..');

const ENDPOINTS = [
  'src/pages/llms.txt.ts',
  'src/pages/llms-full.txt.ts',
  'src/pages/handbook.md.ts',
  'src/pages/components/[slug].md.ts'
] as const;

for (const path of ENDPOINTS) {
  test(`${path} exists`, () => {
    assert.ok(
      existsSync(resolve(appRoot, path)),
      `expected agent endpoint at ${path}`
    );
  });
}

test('every agent endpoint sends text/plain', () => {
  for (const path of ENDPOINTS) {
    const src = readFileSync(resolve(appRoot, path), 'utf8');
    assert.match(
      src,
      /text\/plain/,
      `${path} must respond with Content-Type: text/plain`
    );
  }
});

test('the dynamic .md endpoints export getStaticPaths', () => {
  for (const path of ['src/pages/components/[slug].md.ts']) {
    const src = readFileSync(resolve(appRoot, path), 'utf8');
    assert.match(
      src,
      /export\s+const\s+getStaticPaths/,
      `${path} must export getStaticPaths so Astro pre-renders one .md per slug`
    );
  }
});

test('strip-mdx helper exists and is consumed by the agent endpoints', () => {
  const helper = resolve(appRoot, 'src', 'lib', 'strip-mdx.ts');
  assert.ok(existsSync(helper), 'src/lib/strip-mdx.ts must exist');
  for (const path of ENDPOINTS.filter(p => p !== 'src/pages/llms.txt.ts')) {
    const src = readFileSync(resolve(appRoot, path), 'utf8');
    assert.match(
      src,
      /stripMdx/,
      `${path} must call stripMdx() so MDX imports + components don't leak`
    );
  }
});
