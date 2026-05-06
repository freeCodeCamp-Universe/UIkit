import { strict as assert } from 'node:assert';
import { test } from 'vitest';
import { promises as fs } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(__dirname, '..');
const monorepoRoot = path.resolve(pkgRoot, '..', '..');
const uikitPkgJson = path.join(
  monorepoRoot,
  'packages',
  'uikit',
  'package.json'
);
const outRoot = path.join(monorepoRoot, 'dist-cdn', 'uikit');
const buildScript = path.join(__dirname, 'build.mjs');
const verifyScript = path.join(__dirname, 'verify.mjs');

async function exists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function readPkgVersion(): Promise<string> {
  const raw = await fs.readFile(uikitPkgJson, 'utf8');
  return JSON.parse(raw).version as string;
}

function getAliasDirs(version: string): string[] {
  const aliases = ['latest', version];
  const stable = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!stable) return aliases;

  const [, major, minor] = stable;
  aliases.splice(1, 0, major, `${major}.${minor}`);
  return [...new Set(aliases)];
}

async function walk(
  dir: string,
  basePath = dir,
  skipTopLevelDirs = new Set<string>()
): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (
      dir === basePath &&
      entry.isDirectory() &&
      skipTopLevelDirs.has(entry.name)
    ) {
      continue;
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await walk(full, basePath, skipTopLevelDirs)));
    } else if (entry.isFile()) {
      out.push(path.relative(basePath, full));
    }
  }
  return out.sort();
}

test('build-cdn produces the expected layout', async () => {
  const result = spawnSync('node', [buildScript], {
    cwd: monorepoRoot,
    encoding: 'utf8'
  });
  assert.equal(
    result.status,
    0,
    `build-cdn exited ${result.status}: ${result.stderr}`
  );

  const version = await readPkgVersion();
  const aliasDirs = getAliasDirs(version);
  const required = [
    'styles.min.css',
    'tokens.min.css',
    'components.min.css',
    'uikit.global.js',
    'sprite.svg',
    'manifest.json',
    'fonts'
  ];
  for (const alias of aliasDirs) {
    required.push(
      path.join(alias, 'styles.min.css'),
      path.join(alias, 'tokens.min.css'),
      path.join(alias, 'components.min.css'),
      path.join(alias, 'uikit.global.js'),
      path.join(alias, 'sprite.svg'),
      path.join(alias, 'manifest.json'),
      path.join(alias, 'fonts')
    );
  }
  for (const rel of required) {
    assert.ok(
      await exists(path.join(outRoot, rel)),
      `dist-cdn/uikit/${rel} missing`
    );
  }
});

test('manifest entries carry a W3C SRI sha384 string alongside sha256', async () => {
  const manifest = JSON.parse(
    await fs.readFile(path.join(outRoot, 'manifest.json'), 'utf8')
  );
  const entries = Object.entries(
    manifest.files as Record<
      string,
      { sha256: string; sha384: string; bytes: number }
    >
  );
  assert.ok(entries.length > 0, 'manifest must list at least one file');
  for (const [rel, meta] of entries) {
    assert.match(
      meta.sha384 ?? '',
      /^sha384-[A-Za-z0-9+/]+=*$/,
      `${rel}: sha384 must be a W3C SRI 'sha384-<base64>' string`
    );
    const b64 = (meta.sha384 ?? '').slice('sha384-'.length);
    assert.equal(
      Buffer.from(b64, 'base64').byteLength,
      48,
      `${rel}: sha384 payload should decode to 48 bytes`
    );
  }
});

test('uikit.global.js exposes window.UIKit and looks like valid JS', async () => {
  const js = await fs.readFile(path.join(outRoot, 'uikit.global.js'), 'utf8');
  assert.ok(js.length > 1000, 'uikit.global.js appears truncated');
  assert.match(
    js,
    /UIKit/,
    'uikit.global.js must reference the UIKit namespace'
  );
});

test('uikit.global.js wires every shipped Tier-4 adapter attribute', async () => {
  const js = await fs.readFile(path.join(outRoot, 'uikit.global.js'), 'utf8');
  for (const attr of [
    'data-uikit-dialog',
    'data-uikit-pagination',
    'data-uikit-listbox',
    'data-uikit-combobox'
  ]) {
    assert.match(
      js,
      new RegExp(attr),
      `${attr} must be wired in the vanilla bundle`
    );
  }
});

test('sprite.svg carries the 60-glyph curated set', async () => {
  const svg = await fs.readFile(path.join(outRoot, 'sprite.svg'), 'utf8');
  const symbolCount = (svg.match(/<symbol\s/g) ?? []).length;
  assert.ok(
    symbolCount >= 60,
    `sprite.svg should ship >=60 symbols, found ${symbolCount}`
  );
});

test('alias directories mirror the top-level bundle', async () => {
  const version = await readPkgVersion();
  const aliasDirs = getAliasDirs(version);
  const topLevelFiles = await walk(outRoot, outRoot, new Set(aliasDirs));

  for (const alias of aliasDirs) {
    const aliasRoot = path.join(outRoot, alias);
    const aliasFiles = await walk(aliasRoot);
    assert.deepEqual(aliasFiles, topLevelFiles, `${alias} file list mismatch`);

    for (const rel of topLevelFiles) {
      const [topLevelBuf, aliasBuf] = await Promise.all([
        fs.readFile(path.join(outRoot, rel)),
        fs.readFile(path.join(aliasRoot, rel))
      ]);
      assert.deepEqual(aliasBuf, topLevelBuf, `${alias}/${rel} mismatch`);
    }
  }
});

test('styles.min.css rewrites /fonts/ urls to ./fonts/', async () => {
  const css = await fs.readFile(path.join(outRoot, 'styles.min.css'), 'utf8');
  assert.equal(
    (css.match(/url\(\s*["']?\/fonts\//g) || []).length,
    0,
    'absolute /fonts/ urls must not appear in styles.min.css'
  );
  const relative = css.match(/url\(\s*["']?\.\/fonts\//g) || [];
  assert.ok(
    relative.length >= 4,
    `expected >=4 ./fonts/ refs, found ${relative.length}`
  );
});

test('manifest.json hashes match files on disk', async () => {
  const manifest = JSON.parse(
    await fs.readFile(path.join(outRoot, 'manifest.json'), 'utf8')
  );
  for (const [rel, meta] of Object.entries(
    manifest.files as Record<string, { sha256: string; bytes: number }>
  )) {
    const buf = await fs.readFile(path.join(outRoot, rel));
    const actual = createHash('sha256').update(buf).digest('hex');
    assert.equal(actual, meta.sha256, `hash mismatch for ${rel}`);
    assert.equal(actual.length, 64);
  }
});

test('verify-cdn exits 0 on a clean build', async () => {
  const result = spawnSync('node', [verifyScript], {
    cwd: monorepoRoot,
    encoding: 'utf8'
  });
  assert.equal(
    result.status,
    0,
    `verify-cdn exited ${result.status}: ${result.stderr}\n${result.stdout}`
  );
});
