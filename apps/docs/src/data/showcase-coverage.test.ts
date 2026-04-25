// Wave 6 P2 — invariant. Every component in `knownComponentSlugs`
// must have a per-slug showcase file under `apps/docs/src/showcase/`,
// and the showcase directory must not contain orphan files for slugs
// the nav doesn't know about. The home page glob-imports this dir
// and indexes by `<slug>.astro`, so a missing file = a missing
// component on `/`, and an orphan = a component the nav can't reach.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { knownComponentSlugs } from './knownComponents.ts';

const here = dirname(fileURLToPath(import.meta.url));
const showcaseDir = resolve(here, '..', 'showcase');

const showcaseFiles = readdirSync(showcaseDir)
  .filter(name => name.endsWith('.astro'))
  .map(name => name.replace(/\.astro$/, ''));

test('every known component has a showcase/<slug>.astro', () => {
  for (const slug of knownComponentSlugs) {
    assert.ok(
      showcaseFiles.includes(slug),
      `expected apps/docs/src/showcase/${slug}.astro to exist`
    );
  }
});

test('showcase/ directory has no orphans not in knownComponentSlugs', () => {
  for (const file of showcaseFiles) {
    assert.ok(
      knownComponentSlugs.has(file),
      `showcase/${file}.astro is an orphan — add ${file} to knownComponentSlugs or delete the file`
    );
  }
});

test('exactly 46 showcase files (one per component)', () => {
  // Wave 8 P4 — Breadcrumb (W8-5) shipped, 45 → 46.
  assert.equal(
    showcaseFiles.length,
    46,
    `expected 46 showcase files, got ${showcaseFiles.length}`
  );
});

test('every showcase file imports PlaygroundCard', () => {
  for (const file of showcaseFiles) {
    const src = readFileSync(resolve(showcaseDir, `${file}.astro`), 'utf8');
    assert.match(
      src,
      /import\s+PlaygroundCard\s+from/,
      `showcase/${file}.astro must import PlaygroundCard`
    );
  }
});

test('every showcase file declares an id matching its filename', () => {
  for (const file of showcaseFiles) {
    const src = readFileSync(resolve(showcaseDir, `${file}.astro`), 'utf8');
    const idRegex = new RegExp(`id=['"]${file}['"]`);
    assert.match(
      src,
      idRegex,
      `showcase/${file}.astro must declare id='${file}' so the anchor target matches the slug`
    );
  }
});
