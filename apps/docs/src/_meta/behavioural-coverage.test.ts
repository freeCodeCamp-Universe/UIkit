import { test, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const behaviouralDir = resolve(here, '../../tests/behavioural');

const REQUIRED_AT_GA: readonly string[] = [
  'toggle-button',
  'close-button',
  'input',
  'textarea',
  'select',
  'checkbox',
  'radio',
  'switch',
  'form-stepper',
  'tabs',
  'pagination',
  'listbox',
  'combobox',
  'command-palette',
  'modal',
  'dropdown',
  'tooltip',
  'toast',
  'data-table'
];

const READY: readonly string[] = [
  'checkbox',
  'close-button',
  'combobox',
  'command-palette',
  'data-table',
  'dropdown',
  'form-stepper',
  'input',
  'listbox',
  'modal',
  'pagination',
  'radio',
  'select',
  'switch',
  'tabs',
  'textarea',
  'toast',
  'toggle-button',
  'tooltip'
];

test('S2 - READY is a subset of REQUIRED_AT_GA (drift gate)', () => {
  const target = new Set<string>(REQUIRED_AT_GA);
  for (const slug of READY) {
    expect(
      target.has(slug),
      `READY contains '${slug}' but it is not in REQUIRED_AT_GA - remove or add to the target matrix`
    ).toBe(true);
  }
});

for (const slug of READY) {
  test(`S2 - '${slug}' has a behavioural spec`, () => {
    const path = resolve(behaviouralDir, `${slug}.behaviour.spec.ts`);
    expect(
      existsSync(path),
      `Expected ${path} to exist (READY claims it does)`
    ).toBe(true);
  });
}

const readySet = new Set<string>(READY);
for (const slug of REQUIRED_AT_GA.filter(s => !readySet.has(s))) {
  test.todo(`S2 - pending behavioural spec for '${slug}' (backfill)`);
}
