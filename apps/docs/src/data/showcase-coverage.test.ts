import { test } from 'vitest';
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

test('exactly 48 showcase files (one per component)', () => {
  assert.equal(
    showcaseFiles.length,
    48,
    `expected 48 showcase files, got ${showcaseFiles.length}`
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
