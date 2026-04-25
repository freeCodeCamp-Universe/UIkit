// Wave 8 P0 (W8-11) — per-card Tailwind tab strip cut. PlaygroundCard
// must expose REACT | HTML only. The Tailwind tab + panel + copy-as
// menu item shipped placeholder copy on ~25 of 45 cards; cutting the
// per-card surface keeps `@freecodecamp/uikit-tailwind` + the
// `/guides/tailwind` page as the canonical Tailwind story.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const cardPath = resolve(here, 'PlaygroundCard.astro');

test('PlaygroundCard exposes exactly two tab buttons (React, HTML)', () => {
  const src = readFileSync(cardPath, 'utf8');
  const tabMatches = src.match(/data-tab=['"][a-z]+['"]/g) ?? [];
  assert.equal(
    tabMatches.length,
    2,
    `expected 2 data-tab buttons, found ${tabMatches.length}: ${tabMatches.join(', ')}`
  );
  assert.deepEqual(
    new Set(tabMatches),
    new Set(["data-tab='react'", "data-tab='html'"]),
    'tab buttons must be exactly react + html'
  );
});

test('PlaygroundCard ships zero data-panel="tailwind" panels', () => {
  const src = readFileSync(cardPath, 'utf8');
  assert.doesNotMatch(
    src,
    /data-panel=['"]tailwind['"]/,
    'tailwind panel must be removed from PlaygroundCard.astro'
  );
});

test('PlaygroundCard exposes exactly two showcase__panel divs (react + html)', () => {
  const src = readFileSync(cardPath, 'utf8');
  const panelMatches = src.match(/data-panel=['"][a-z]+['"]/g) ?? [];
  assert.equal(
    panelMatches.length,
    2,
    `expected 2 data-panel divs, found ${panelMatches.length}: ${panelMatches.join(', ')}`
  );
});

test('PlaygroundCard copy-as menu drops the tailwind option', () => {
  const src = readFileSync(cardPath, 'utf8');
  assert.doesNotMatch(
    src,
    /data-copy-as=['"]tailwind['"]/,
    'copy-as menu must not include the tailwind option'
  );
  const copyAsMatches = src.match(/data-copy-as=['"][a-z]+['"]/g) ?? [];
  assert.equal(
    copyAsMatches.length,
    2,
    `expected 2 data-copy-as items, found ${copyAsMatches.length}`
  );
});

test('PlaygroundCard exposes no slot named "tailwind"', () => {
  const src = readFileSync(cardPath, 'utf8');
  assert.doesNotMatch(
    src,
    /<slot\s+name=['"]tailwind['"]/,
    'tailwind slot must be removed from PlaygroundCard.astro'
  );
});

test('No showcase ships a slot="tailwind" Code block', () => {
  const showcaseDir = resolve(here, '..', '..', 'showcase');
  const violations: string[] = [];
  for (const f of readdirSync(showcaseDir)) {
    if (!f.endsWith('.astro')) continue;
    const src = readFileSync(resolve(showcaseDir, f), 'utf8');
    if (/slot=['"]tailwind['"]/.test(src)) {
      violations.push(f);
    }
  }
  assert.deepEqual(
    violations,
    [],
    `showcases still ship slot="tailwind" Code blocks: ${violations.join(', ')}`
  );
});
