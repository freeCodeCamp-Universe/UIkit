// Wave 9 P7.1 (W9-B13) — token discipline gate.
//
// `apps/docs/src/styles/showcase.css` declares chrome surfaces that
// must paint correctly under both palettes. Hex literals break that
// contract — a `light-palette` flip can't recolour `#b0b0bd`. The
// audit (B13) flagged 4 lines; this gate fails until every chrome
// colour reads from a CSS custom property (`var(--…)`).
//
// We allow hex inside `url(data:…)` payloads (none today, but keep
// the carve-out so the contract reads narrowly), and inside
// comments. Everything else must be a token.
import { test } from 'vitest';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const cssPath = resolve(here, '../styles/showcase.css');

test('showcase.css uses tokens, not hex literals, for chrome colours', () => {
  const src = readFileSync(cssPath, 'utf8');
  // Strip block comments so legitimate notes can mention hex codes.
  const stripped = src.replace(/\/\*[\s\S]*?\*\//g, '');
  const offenders: { line: number; literal: string }[] = [];
  stripped.split('\n').forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//')) return;
    const match = trimmed.match(/#[0-9a-f]{3,8}\b/i);
    if (match) {
      offenders.push({ line: i + 1, literal: match[0] });
    }
  });
  assert.deepEqual(
    offenders,
    [],
    `showcase.css must not declare hex colour literals; offenders: ${offenders
      .map(o => `L${o.line} ${o.literal}`)
      .join(', ')}`
  );
});
