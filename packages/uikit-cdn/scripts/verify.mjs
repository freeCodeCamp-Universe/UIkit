#!/usr/bin/env node
/**
 * Verify dist-cdn/uikit/ is well-formed.
 *
 *   - No absolute `/fonts/` urls in any .min.css.
 *   - Every `./fonts/...` reference resolves to a real file.
 *   - manifest.json sha256 hashes match recomputed file hashes.
 *   - The alias subtrees mirror the top-level bundle.
 *
 * Exits non-zero on any failure.
 */

import { promises as fs } from 'node:fs';
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

const FAILURES = [];
const fail = msg => FAILURES.push(msg);

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function hashFile(p) {
  const buf = await fs.readFile(p);
  return {
    sha256: createHash('sha256').update(buf).digest('hex'),
    sha384: `sha384-${createHash('sha384').update(buf).digest('base64')}`
  };
}

function getAliasDirs(version) {
  const aliases = ['latest', version];
  const stable = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!stable) return aliases;

  const [, major, minor] = stable;
  aliases.splice(1, 0, major, `${major}.${minor}`);
  return [...new Set(aliases)];
}

async function walk(dir, basePath = dir, skipTopLevelDirs = new Set()) {
  const out = [];
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

async function checkFontUrlRewrite(cssPath) {
  const css = await fs.readFile(cssPath, 'utf8');
  const bad = css.match(/url\(\s*["']?\/fonts\//g);
  if (bad) {
    fail(
      `${path.relative(monorepoRoot, cssPath)}: found ${bad.length} absolute /fonts/ urls (must be ./fonts/...)`
    );
  }
  const refs = [
    ...css.matchAll(/url\(\s*["']?(\.\/fonts\/[^"')]+)["']?\s*\)/g)
  ].map(m => m[1]);
  const cssDir = path.dirname(cssPath);
  for (const ref of refs) {
    const absolute = path.join(cssDir, ref);
    if (!(await exists(absolute))) {
      fail(
        `${path.relative(monorepoRoot, cssPath)}: references missing font ${ref}`
      );
    }
  }
  return refs.length;
}

async function verifyManifest(dir) {
  const manifestPath = path.join(dir, 'manifest.json');
  if (!(await exists(manifestPath))) {
    fail(`${path.relative(monorepoRoot, manifestPath)} missing`);
    return;
  }
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  for (const [rel, meta] of Object.entries(manifest.files)) {
    const p = path.join(dir, rel);
    if (!(await exists(p))) {
      fail(`manifest references missing file ${rel}`);
      continue;
    }
    const actual = await hashFile(p);
    if (actual.sha256 !== meta.sha256) {
      fail(
        `manifest sha256 mismatch for ${rel}: expected ${meta.sha256}, got ${actual.sha256}`
      );
    }
    if (!meta.sha384 || !/^sha384-[A-Za-z0-9+/]+=*$/.test(meta.sha384)) {
      fail(`manifest missing or malformed sha384 for ${rel}`);
      continue;
    }
    if (actual.sha384 !== meta.sha384) {
      fail(
        `manifest sha384 mismatch for ${rel}: expected ${meta.sha384}, got ${actual.sha384}`
      );
    }
  }
}

async function verifyDir(dir, label) {
  if (!(await exists(dir))) {
    fail(`${label} directory missing at ${path.relative(monorepoRoot, dir)}`);
    return;
  }
  const required = [
    'styles.min.css',
    'tokens.min.css',
    'components.min.css',
    'uikit.global.js',
    'sprite.svg',
    'fonts',
    'manifest.json'
  ];
  for (const r of required) {
    if (!(await exists(path.join(dir, r)))) fail(`${label}: missing ${r}`);
  }
  for (const css of ['styles.min.css', 'tokens.min.css']) {
    const p = path.join(dir, css);
    if (await exists(p)) {
      const refs = await checkFontUrlRewrite(p);
      if (css === 'styles.min.css' && refs < 4) {
        fail(
          `${label}/${css}: expected at least 4 font url() refs, found ${refs}`
        );
      }
    }
  }
  await verifyManifest(dir);
}

async function verifyMirror(sourceDir, targetDir, label, aliasDirs) {
  if (!(await exists(sourceDir)) || !(await exists(targetDir))) return;

  const [sourceFiles, targetFiles] = await Promise.all([
    walk(sourceDir, sourceDir, new Set(aliasDirs)),
    walk(targetDir)
  ]);

  const sourceJson = JSON.stringify(sourceFiles);
  const targetJson = JSON.stringify(targetFiles);
  if (sourceJson !== targetJson) {
    fail(`${label}: file list does not match top-level bundle`);
    return;
  }

  for (const rel of sourceFiles) {
    const [sourceHash, targetHash] = await Promise.all([
      hashFile(path.join(sourceDir, rel)),
      hashFile(path.join(targetDir, rel))
    ]);
    if (sourceHash.sha256 !== targetHash.sha256) {
      fail(`${label}: ${rel} does not match top-level bundle`);
    }
  }
}

async function main() {
  const pkg = JSON.parse(await fs.readFile(uikitPkgJson, 'utf8'));
  const aliasDirs = getAliasDirs(pkg.version);

  await verifyDir(outRoot, 'dist-cdn/uikit');
  for (const alias of aliasDirs) {
    const aliasPath = path.join(outRoot, alias);
    const label = `dist-cdn/uikit/${alias}`;
    await verifyDir(aliasPath, label);
    await verifyMirror(outRoot, aliasPath, label, aliasDirs);
  }

  if (FAILURES.length) {
    console.error('[verify-cdn] failed:');
    for (const f of FAILURES) console.error('  - ' + f);
    process.exit(1);
  }
  console.log('[verify-cdn] ok');
}

main().catch(err => {
  console.error('[verify-cdn] crashed:', err);
  process.exit(1);
});
