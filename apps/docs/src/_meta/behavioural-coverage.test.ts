// Wave 9 P1 (W9-S2) — every-stateful-showcase-has-a-behavioural-spec
// meta gate.
//
// `WAVE-9-TESTING-PLAN.md` defines the Layer 4 behavioural-contract
// matrix: 19 slugs whose interactivity must be locked under
// `apps/docs/tests/behavioural/<slug>.behaviour.spec.ts`. This meta
// test enforces two contracts:
//
//   1. Every slug listed in `READY` actually has its spec file —
//      hard gate. Drift fails CI.
//   2. `READY ⊆ REQUIRED_AT_GA` — drift gate. A spec name added to
//      `READY` that is not in the target matrix fails the build.
//
// Names listed in `REQUIRED_AT_GA \ READY` show up as `test.todo`
// so the gap is visible in test output but does not block the
// commit. Phase 2 + Phase 6 of the plan move names from todo →
// ready as specs land. When `READY === REQUIRED_AT_GA` the meta
// is fully hard.
import { test, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const behaviouralDir = resolve(here, '../../tests/behavioural');

// Wave 9 GA target — every stateful primitive whose interactivity is
// part of its documented contract. Sourced from the L4 column in
// WAVE-9-TESTING-PLAN's coverage matrix.
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

// Names with a landed spec. Phase 2 / Phase 6 commits append here as
// each behavioural spec ships. Keep alphabetised for diff hygiene.
const READY: readonly string[] = [
  'command-palette',
  'dropdown',
  'form-stepper',
  'listbox',
  'modal',
  'pagination',
  'radio',
  'tabs',
  'toast'
];

test('S2 — READY is a subset of REQUIRED_AT_GA (drift gate)', () => {
  const target = new Set<string>(REQUIRED_AT_GA);
  for (const slug of READY) {
    expect(
      target.has(slug),
      `READY contains '${slug}' but it is not in REQUIRED_AT_GA — remove or add to the target matrix`
    ).toBe(true);
  }
});

for (const slug of READY) {
  test(`S2 — '${slug}' has a behavioural spec`, () => {
    const path = resolve(behaviouralDir, `${slug}.behaviour.spec.ts`);
    expect(
      existsSync(path),
      `Expected ${path} to exist (READY claims it does)`
    ).toBe(true);
  });
}

const readySet = new Set<string>(READY);
for (const slug of REQUIRED_AT_GA.filter(s => !readySet.has(s))) {
  test.todo(`S2 — pending behavioural spec for '${slug}' (Phase 2/6 backfill)`);
}
