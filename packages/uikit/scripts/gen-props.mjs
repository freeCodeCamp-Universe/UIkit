#!/usr/bin/env node
// Wave 8 P1 (W8-3) — props extraction.
//
// Reads every `*.tsx` (skip `.test.tsx`) under the package's `src/`,
// runs `react-docgen-typescript` against the package tsconfig, and
// emits a single `dist/props.json`:
//
//   {
//     "$schemaVersion": "1.0.0",
//     "Button":    { "displayName": "Button",   "description": "...", "props": { ... } },
//     "DataTable": { "displayName": "DataTable", "description": "...", "props": {}, "_extractionFailed": true }
//   }
//
// `react-docgen-typescript` (styleguidist#203) returns empty `props`
// for generic components like `<TRow,>(...)`. The generator detects
// the empty-result + `export const X = <` pattern and emits a stub
// envelope with `_extractionFailed: true`, plus a WARN line on
// stderr. Consumers (PlaygroundCard PropTable) render a fallback
// "Prop signature unavailable" message in that case.
//
// Build sequence (D10): `tsup && node scripts/gen-props.mjs`. tsup
// `clean: true` wipes `dist/`; the generator must run AFTER tsup so
// its output isn't deleted.
//
// CLI flags (used by the test harness only — production callers run
// without flags from `packages/uikit`):
//   --root <dir>   Override package root (default: script's parent's
//                  parent). Lets the test point at a synthetic fixture.
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import docgen from 'react-docgen-typescript';

const SCHEMA_VERSION = '1.0.0';

function parseArgs(argv) {
  const out = { root: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--root' && argv[i + 1]) {
      out.root = argv[i + 1];
      i++;
    }
  }
  return out;
}

const argv = parseArgs(process.argv.slice(2));
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = argv.root ?? resolve(here, '..');
const srcDir = resolve(packageRoot, 'src');
const distDir = resolve(packageRoot, 'dist');
const tsconfigPath = resolve(packageRoot, 'tsconfig.json');

/** @returns {string[]} */
function walkTsx(dir) {
  /** @type {string[]} */
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkTsx(full));
      continue;
    }
    if (!entry.isFile()) continue;
    if (!entry.name.endsWith('.tsx')) continue;
    if (entry.name.endsWith('.test.tsx')) continue;
    out.push(full);
  }
  return out;
}

/** Detect `export const Name = <` style generic component signatures.
 *  styleguidist#203: react-docgen-typescript returns empty props for
 *  these. We use the regex hit to flag the stub envelope. */
const GENERIC_RE = /export\s+const\s+\w+\s*=\s*<\w+,?\s*>?\(/;

/** Return the displayName a generic-heavy file is meant to expose.
 *  Falls back to the first `export const` identifier. */
function guessDisplayName(source, sourceFile) {
  const explicit = source.match(/(\w+)\.displayName\s*=\s*['"](\w+)['"]/);
  if (explicit) return explicit[2];
  const decl = source.match(/export\s+const\s+(\w+)\s*=\s*</);
  if (decl) return decl[1];
  // Fall back to the file basename.
  return dirname(sourceFile).endsWith('src')
    ? sourceFile
        .split('/')
        .pop()
        .replace(/\.tsx$/, '')
    : sourceFile
        .split('/')
        .pop()
        .replace(/\.tsx$/, '');
}

const parser = docgen.withCustomConfig(tsconfigPath, {
  savePropValueAsString: true,
  shouldExtractLiteralValuesFromEnum: true,
  shouldRemoveUndefinedFromOptional: true,
  // Skip the kitchen-sink HTML-attribute spread react-docgen-typescript
  // would otherwise inline for every `extends ButtonHTMLAttributes`
  // interface — the docgen output would balloon to ~200 props per
  // component.
  propFilter: prop => {
    if (prop.parent == null) return true;
    return !prop.parent.fileName.includes('node_modules');
  }
});

const files = walkTsx(srcDir);
/** @type {Record<string, unknown>} */
const out = { $schemaVersion: SCHEMA_VERSION };

for (const file of files) {
  const source = readFileSync(file, 'utf8');
  const isGeneric = GENERIC_RE.test(source);
  let parsed = [];
  try {
    parsed = parser.parse(file);
  } catch (err) {
    process.stderr.write(
      `[gen-props] WARN: parse failed for ${file}: ${err.message}\n`
    );
  }

  if (parsed.length === 0 && isGeneric) {
    const name = guessDisplayName(source, file);
    process.stderr.write(
      `[gen-props] WARN: extraction returned empty props for ${name}; emitting stub\n`
    );
    out[name] = {
      displayName: name,
      description: '',
      props: {},
      _extractionFailed: true
    };
    continue;
  }

  for (const entry of parsed) {
    const props = {};
    for (const [name, def] of Object.entries(entry.props ?? {})) {
      props[name] = {
        type: def.type?.name ?? 'unknown',
        required: !!def.required,
        description: def.description ?? '',
        defaultValue: def.defaultValue?.value ?? null
      };
    }
    out[entry.displayName] = {
      displayName: entry.displayName,
      description: entry.description ?? '',
      props
    };
    if (Object.keys(props).length === 0 && isGeneric) {
      out[entry.displayName]._extractionFailed = true;
      process.stderr.write(
        `[gen-props] WARN: extraction returned empty props for ${entry.displayName}; emitting stub\n`
      );
    }
  }
}

mkdirSync(distDir, { recursive: true });
writeFileSync(
  resolve(distDir, 'props.json'),
  `${JSON.stringify(out, null, 2)}\n`
);
process.stdout.write(
  `[gen-props] wrote ${Object.keys(out).length - 1} component entries to dist/props.json\n`
);
