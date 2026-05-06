import { test } from 'vitest';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import preset from './preset';

const here = dirname(fileURLToPath(import.meta.url));
const tokensPath = resolve(here, '../../uikit-css/src/tokens.css');
const css = readFileSync(tokensPath, 'utf8');

function extractProps(source: string): Set<string> {
  const re = /(?:^|\s)(--[a-z0-9-]+)\s*:/gi;
  const found = new Set<string>();
  for (const match of source.matchAll(re)) {
    if (match[1]) found.add(match[1]);
  }
  return found;
}

const declared = extractProps(css);

test('preset is a plain object with theme.extend', () => {
  assert.equal(typeof preset, 'object');
  assert.ok(preset.theme);
  assert.ok(preset.theme.extend);
});

test('every --foreground-* token maps to a colors.fg.* key', () => {
  const fg = preset.theme?.extend?.colors as
    | Record<string, Record<string, string>>
    | undefined;
  assert.ok(fg?.fg, 'colors.fg namespace missing');

  const foregroundProps = [...declared].filter(p =>
    p.startsWith('--foreground-')
  );
  for (const prop of foregroundProps) {
    // --foreground-primary → fg.primary
    const key = prop.replace('--foreground-', '');
    const mapped = fg.fg[key];
    assert.ok(
      mapped,
      `Expected preset colors.fg.${key} for ${prop}, got: ${JSON.stringify(fg.fg)}`
    );
    assert.ok(
      mapped.includes(prop),
      `colors.fg.${key} should reference var(${prop}), got: ${mapped}`
    );
  }
});

test('motion tokens (--ease-*, --dur-*) mapped on preset', () => {
  const ease = preset.theme?.extend?.transitionTimingFunction as
    | Record<string, string>
    | undefined;
  const dur = preset.theme?.extend?.transitionDuration as
    | Record<string, string>
    | undefined;
  assert.ok(ease?.snap?.includes('--ease-snap'));
  assert.ok(ease?.out?.includes('--ease-out'));
  assert.ok(dur?.fast?.includes('--dur-fast'));
  assert.ok(dur?.base?.includes('--dur-base'));
  assert.ok(dur?.slow?.includes('--dur-slow'));
});
