import { test } from 'vitest';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const cardPath = resolve(here, 'PlaygroundCard.astro');
const showcasePath = resolve(here, 'Showcase.astro');

test('PlaygroundCard.astro exists at apps/docs/src/components/site/', () => {
  assert.ok(
    existsSync(cardPath),
    'PlaygroundCard.astro must replace Showcase.astro as the per-component preview surface'
  );
});

test('PlaygroundCard preserves the showcase.client.ts data-attribute contract', () => {
  const src = readFileSync(cardPath, 'utf8');
  for (const attr of [
    'data-showcase',
    'data-source',
    'data-tab',
    'data-panel',
    'data-copy',
    'data-copy-as',
    'data-copy-menu',
    'data-copy-label'
  ]) {
    assert.match(
      src,
      new RegExp(attr),
      `PlaygroundCard.astro must emit ${attr} so showcase.client.ts can wire tabs + copy menu`
    );
  }
});

test('PlaygroundCard exposes preview, react, html slots only', () => {
  const src = readFileSync(cardPath, 'utf8');
  for (const name of ['preview', 'react', 'html']) {
    assert.match(
      src,
      new RegExp(`<slot\\s+name=['"]${name}['"]`),
      `PlaygroundCard.astro must expose <slot name="${name}">`
    );
  }
  assert.doesNotMatch(
    src,
    /<slot\s+name=['"]tailwind['"]/,
    'tailwind slot must be removed'
  );
});

test('PlaygroundCard accepts the metadata props', () => {
  const src = readFileSync(cardPath, 'utf8');
  for (const prop of ['status', 'since', 'tokens', 'a11yPattern']) {
    assert.match(
      src,
      new RegExp(`\\b${prop}\\b`),
      `PlaygroundCard.astro Props must include ${prop}`
    );
  }
});

test('apiLinkMode prop deleted - fully retired /api references', () => {
  const src = readFileSync(cardPath, 'utf8');
  assert.doesNotMatch(
    src,
    /apiLinkMode/,
    'apiLinkMode must be deleted from PlaygroundCard.astro'
  );
  assert.doesNotMatch(
    src,
    /\/api\//,
    'PlaygroundCard.astro must contain no /api/ references'
  );
  assert.doesNotMatch(src, /View API/, 'View API link block must be deleted');
});

test('source prop required so the View source link always renders', () => {
  const src = readFileSync(cardPath, 'utf8');
  assert.match(
    src,
    /source:\s*string;/,
    'source must be typed as required (no `?:`)'
  );
});

test('Showcase.astro forwarder deleted - zero consumers post-migration', () => {
  assert.ok(
    !existsSync(showcasePath),
    'Showcase.astro forwarder must be deleted; all 45 showcases import PlaygroundCard directly'
  );
});

test('PlaygroundCard supports defaultOpen for the first ANATOMY block', () => {
  const src = readFileSync(cardPath, 'utf8');
  assert.match(
    src,
    /defaultOpen\?:\s*boolean/,
    'PlaygroundCard.astro Props must include `defaultOpen?: boolean`'
  );
  assert.match(
    src,
    /open=\{defaultOpen\s*\|\|\s*undefined\}/,
    'ANATOMY <details> must bind `open` to the defaultOpen prop'
  );
});

test('astro.config.mjs pins Shiki theme to github-dark', () => {
  const cfgPath = resolve(here, '..', '..', '..', 'astro.config.mjs');
  const cfg = readFileSync(cfgPath, 'utf8');
  assert.match(
    cfg,
    /shikiConfig:\s*\{[^}]*theme:\s*'github-dark'/s,
    'astro.config.mjs must pin shikiConfig.theme to github-dark'
  );
});
