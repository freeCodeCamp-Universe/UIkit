// Wave 8 P1 (W8-3) — gen-props generator contract test.
//
// The generator runs after `tsup` (build sequence locked by D10) and
// emits `dist/props.json` keyed by component displayName. This test
// builds a minimal synthetic fixture tree (one normal component, one
// generic component) and asserts the generator's contract:
//
//  1. Normal components emit populated `props` objects.
//  2. Generic components (`<TRow,>`-style) return empty props from
//     `react-docgen-typescript` (styleguidist#203). The generator
//     must emit a stub `_extractionFailed: true` envelope so
//     downstream consumers can render a fallback message.
//  3. Top-level `$schemaVersion: "1.0.0"` is present as a forward
//     compat marker.
//  4. A `[gen-props] WARN` line is written to stderr for the
//     generic-heavy stub case.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  rmSync,
  readFileSync
} from 'node:fs';
import { resolve, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const generator = resolve(here, 'gen-props.mjs');

function makeFixture() {
  const root = mkdtempSync(resolve(tmpdir(), 'gen-props-'));
  const src = resolve(root, 'src');
  mkdirSync(src, { recursive: true });
  mkdirSync(resolve(root, 'dist'));
  // Normal component.
  writeFileSync(
    resolve(src, 'Greet.tsx'),
    `import React from 'react';
export interface GreetProps {
  /** Name to greet. */
  name: string;
  /** Loud mode. */
  loud?: boolean;
}
export const Greet = (props: GreetProps) => <p>hello {props.name}</p>;
Greet.displayName = 'Greet';
`
  );
  // Generic-shaped file react-docgen-typescript cannot extract from
  // (no React component, just a generic helper). Triggers the
  // stub-envelope fallback: empty parser output + GENERIC_RE hit.
  writeFileSync(
    resolve(src, 'Bag.tsx'),
    `// Generic helper that looks like a component to the regex but
// is not a React component, so react-docgen-typescript returns
// empty parsed output and the generator must emit the stub
// envelope with _extractionFailed: true.
export const Bag = <T,>(items: readonly T[]): readonly T[] => items;
`
  );
  writeFileSync(
    resolve(root, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        target: 'es2022',
        module: 'esnext',
        moduleResolution: 'bundler',
        jsx: 'react-jsx',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true
      },
      include: ['src/**/*']
    })
  );
  return root;
}

test('gen-props generator emits populated props for normal components', () => {
  const root = makeFixture();
  try {
    execFileSync('node', [generator, '--root', root], {
      stdio: ['ignore', 'pipe', 'pipe']
    });
    const out = JSON.parse(
      readFileSync(resolve(root, 'dist', 'props.json'), 'utf8')
    );
    assert.equal(out.$schemaVersion, '1.0.0', 'schema version sentinel');
    assert.ok(out.Greet, 'Greet entry present');
    assert.ok(
      Object.keys(out.Greet.props).length >= 2,
      `Greet props expected ≥ 2, got ${Object.keys(out.Greet.props).length}`
    );
    assert.ok(out.Greet.props.name, 'name prop present');
    assert.equal(out.Greet.props.name.required, true, 'name is required');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('gen-props generator emits stub envelope for generic components', () => {
  const root = makeFixture();
  try {
    const res = spawnSync('node', [generator, '--root', root], {
      encoding: 'utf8'
    });
    assert.equal(
      res.status,
      0,
      `generator exit status ${res.status}: ${res.stderr}`
    );
    const stderr = res.stderr ?? '';
    const out = JSON.parse(
      readFileSync(resolve(root, 'dist', 'props.json'), 'utf8')
    );
    assert.ok(out.Bag, 'Bag entry present');
    assert.equal(
      out.Bag._extractionFailed,
      true,
      'Bag must be flagged with _extractionFailed: true'
    );
    assert.deepEqual(out.Bag.props, {}, 'Bag props must be empty');
    assert.match(
      stderr,
      /\[gen-props\] WARN.*Bag/,
      `expected stderr WARN line for Bag, got: ${stderr}`
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
