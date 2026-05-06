import { test } from 'vitest';
import assert from 'node:assert/strict';
import fccPlugin from './plugin';

test('fccPlugin is a Tailwind plugin object with a handler', () => {
  assert.ok(fccPlugin, 'plugin is defined');
  assert.equal(typeof fccPlugin, 'object');
  assert.equal(typeof fccPlugin.handler, 'function');
});

test('plugin registers .focus-ring utility', () => {
  const utilities: Record<string, unknown> = {};
  fccPlugin.handler({
    addUtilities: (u: Record<string, unknown>) => Object.assign(utilities, u),
    addVariant: () => undefined
  } as unknown as Parameters<typeof fccPlugin.handler>[0]);

  assert.ok(utilities['.focus-ring'], '.focus-ring utility registered');
  const ring = utilities['.focus-ring'] as Record<string, string>;
  assert.ok(
    ring.outline?.includes('var(--blue-mid)'),
    'focus-ring uses --blue-mid token'
  );
});

test('plugin registers fcc-dark and fcc-light variants', () => {
  const variants: string[] = [];
  fccPlugin.handler({
    addUtilities: () => undefined,
    addVariant: (name: string) => variants.push(name)
  } as unknown as Parameters<typeof fccPlugin.handler>[0]);

  assert.ok(variants.includes('fcc-dark'), 'fcc-dark variant registered');
  assert.ok(variants.includes('fcc-light'), 'fcc-light variant registered');
});
