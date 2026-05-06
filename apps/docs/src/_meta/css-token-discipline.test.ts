import { test } from 'vitest';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const cssPath = resolve(here, '../styles/showcase.css');

test('showcase.css uses tokens, not hex literals, for chrome colours', () => {
  const src = readFileSync(cssPath, 'utf8');
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
