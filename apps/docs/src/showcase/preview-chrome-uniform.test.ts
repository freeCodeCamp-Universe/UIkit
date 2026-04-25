// Wave 9 P3.1 (W9-B12) — preview chrome must be visually uniform
// across every showcase.
//
// Wave 8 introduced `previewPlain` as a per-card escape hatch that
// drops the gridded purple backdrop in favour of solid flat dark.
// Ten showcases adopted it: 4 layouts (auth/sidebar/stacked + sidebar
// nav rail), 4 overlays (modal/dropdown/command-palette/form-stepper),
// navbar, and spacer. The Wave 9 audit (B12) flagged this as visual
// drift — the canonical look (textarea, button, etc.) is the gridded
// backdrop, and the user could not tell which cards were "real"
// chrome vs which were opted out.
//
// Audit policy (a): single canonical preview backdrop for every card.
// Components that don't render well on the grid must fix themselves
// (set their own opaque background) instead of overriding chrome.
//
// This gate fails any new use of `previewPlain` in a showcase. The
// prop and CSS class stay in PlaygroundCard.astro / showcase.css for
// now (sweep can prune them later if there are still zero consumers
// at GA cut), but no showcase may pass them.
import { test } from 'vitest';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

const showcaseFiles = readdirSync(here)
  .filter(name => name.endsWith('.astro'))
  .map(name => resolve(here, name));

test('no showcase passes `previewPlain` (canonical chrome only)', () => {
  const offenders: string[] = [];
  for (const file of showcaseFiles) {
    const src = readFileSync(file, 'utf8');
    if (/\bpreviewPlain\b(?!\s*=\s*\{false\})/.test(src)) {
      offenders.push(file.replace(`${here}/`, ''));
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `Showcases passing previewPlain (must drop per W9-B12): ${offenders.join(', ')}`
  );
});
