// Parity: src/svg/*.svg filenames must match keys in icons.ts exactly.
// If they drift, the sprite build and the React runtime disagree, which
// means a consumer sees one icon via <Icon> and a different one via the
// CSS sprite. Fail loud on any mismatch. Also pins the curated-subset
// floor at 60 glyphs so Wave 2 icon-sprite expansion stays shipped.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { resolve, dirname, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { icons } from './icons';

const here = dirname(fileURLToPath(import.meta.url));
const svgDir = resolve(here, 'svg');

const svgNames = readdirSync(svgDir)
  .filter(f => f.endsWith('.svg'))
  .map(f => basename(f, extname(f)))
  .sort();

const iconKeys = Object.keys(icons).sort();

test('svg filenames and icons.ts keys are in lockstep', () => {
  assert.deepEqual(svgNames, iconKeys);
});

test('curated subset is at least 60 glyphs', () => {
  assert.ok(
    iconKeys.length >= 60,
    `expected >=60 icons, got ${iconKeys.length}`
  );
});

test('core nav + feedback icons are present', () => {
  for (const required of [
    'chevron-up',
    'chevron-down',
    'chevron-left',
    'chevron-right',
    'arrow-up',
    'arrow-down',
    'arrow-left',
    'arrow-right',
    'info',
    'circle-alert',
    'triangle-alert',
    'loader',
    'menu',
    'grid',
    'home',
    'settings',
    'plus',
    'minus',
    'equal'
  ]) {
    assert.ok(required in icons, `missing required icon in map: ${required}`);
  }
});
