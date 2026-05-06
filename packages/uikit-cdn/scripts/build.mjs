#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bundle } from 'lightningcss';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(__dirname, '..');
const monorepoRoot = path.resolve(pkgRoot, '..', '..');
const uikitCssSrc = path.join(monorepoRoot, 'packages', 'uikit-css', 'src');
const uikitPkgJson = path.join(
  monorepoRoot,
  'packages',
  'uikit',
  'package.json'
);
const uikitJsGlobal = path.join(
  monorepoRoot,
  'packages',
  'uikit-js',
  'dist',
  'uikit.global.js'
);
const uikitIconsSprite = path.join(
  monorepoRoot,
  'packages',
  'uikit-icons',
  'dist',
  'sprite.svg'
);
const stylesDir = uikitCssSrc;
const fontsSrc = path.join(uikitCssSrc, 'fonts');
const brandSrc = path.join(uikitCssSrc, 'brand');
const outRoot = path.join(monorepoRoot, 'dist-cdn', 'uikit');

const rewriteFontUrl = url => (url.startsWith('/fonts/') ? '.' + url : url);

function bundleCss(entryFile) {
  const { code, warnings } = bundle({
    filename: entryFile,
    minify: true,
    sourceMap: false,
    visitor: {
      Url(node) {
        return { ...node, url: rewriteFontUrl(node.url) };
      }
    }
  });
  if (warnings && warnings.length) {
    for (const w of warnings) {
      console.warn(`[build-cdn] warn: ${w.type} ${w.value ?? ''}`);
    }
  }
  return code;
}

async function readVersion() {
  const pkg = JSON.parse(await fs.readFile(uikitPkgJson, 'utf8'));
  if (!pkg.version)
    throw new Error('packages/uikit/package.json is missing "version".');
  return pkg.version;
}

function getAliasDirs(version) {
  const aliases = ['latest', version];
  const stable = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!stable) return aliases;

  const [, major, minor] = stable;
  aliases.splice(1, 0, major, `${major}.${minor}`);
  return [...new Set(aliases)];
}

async function copyDirIfExists(src, dest) {
  try {
    const stat = await fs.stat(src);
    if (!stat.isDirectory()) return false;
  } catch {
    return false;
  }
  await fs.cp(src, dest, { recursive: true });
  return true;
}

async function hashFile(filePath) {
  const buf = await fs.readFile(filePath);
  const sha384B64 = createHash('sha384').update(buf).digest('base64');
  return {
    sha256: createHash('sha256').update(buf).digest('hex'),
    sha384: `sha384-${sha384B64}`,
    bytes: buf.byteLength
  };
}

async function copyFileIfExists(src, dest) {
  try {
    await fs.access(src);
  } catch {
    return false;
  }
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.copyFile(src, dest);
  return true;
}

async function walk(dir, basePath = dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await walk(full, basePath)));
    } else if (entry.isFile()) {
      out.push(path.relative(basePath, full));
    }
  }
  return out.sort();
}

async function copyDirContents(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  for (const entry of await fs.readdir(src, { withFileTypes: true })) {
    await fs.cp(path.join(src, entry.name), path.join(dest, entry.name), {
      recursive: true
    });
  }
}

async function writeBundle(destDir) {
  await fs.mkdir(destDir, { recursive: true });

  const styles = bundleCss(path.join(stylesDir, '_cdn-entry.css'));
  const tokensOnly = bundleCss(path.join(stylesDir, 'tokens.css'));
  const componentsOnly = bundleCss(path.join(stylesDir, 'components.css'));

  await Promise.all([
    fs.writeFile(path.join(destDir, 'styles.min.css'), styles),
    fs.writeFile(path.join(destDir, 'tokens.min.css'), tokensOnly),
    fs.writeFile(path.join(destDir, 'components.min.css'), componentsOnly)
  ]);

  await copyDirIfExists(fontsSrc, path.join(destDir, 'fonts'));
  await copyDirIfExists(brandSrc, path.join(destDir, 'brand'));

  if (
    !(await copyFileIfExists(
      uikitJsGlobal,
      path.join(destDir, 'uikit.global.js')
    ))
  ) {
    throw new Error(
      `uikit-js build output missing at ${path.relative(monorepoRoot, uikitJsGlobal)}; run uikit-js build first`
    );
  }
  if (
    !(await copyFileIfExists(
      uikitIconsSprite,
      path.join(destDir, 'sprite.svg')
    ))
  ) {
    throw new Error(
      `uikit-icons sprite missing at ${path.relative(monorepoRoot, uikitIconsSprite)}; run uikit-icons build first`
    );
  }

  const files = await walk(destDir);
  const manifest = {};
  for (const rel of files) {
    if (rel === 'manifest.json') continue;
    manifest[rel] = await hashFile(path.join(destDir, rel));
  }
  await fs.writeFile(
    path.join(destDir, 'manifest.json'),
    JSON.stringify(
      { generatedAt: new Date().toISOString(), files: manifest },
      null,
      2
    ) + '\n'
  );
}

async function writeEntryCss() {
  const entry = "@import 'tokens.css';\n@import 'components.css';\n";
  await fs.writeFile(path.join(stylesDir, '_cdn-entry.css'), entry);
}

async function removeEntryCss() {
  try {
    await fs.unlink(path.join(stylesDir, '_cdn-entry.css'));
  } catch {}
}

async function main() {
  const version = await readVersion();
  const aliasDirs = getAliasDirs(version);
  const stagingDir = path.join(monorepoRoot, 'dist-cdn', '.uikit-staging');

  await fs.rm(outRoot, { recursive: true, force: true });
  await fs.rm(stagingDir, { recursive: true, force: true });
  await fs.mkdir(outRoot, { recursive: true });

  await writeEntryCss();
  try {
    await writeBundle(stagingDir);
    await copyDirContents(stagingDir, outRoot);
    for (const alias of aliasDirs) {
      await fs.cp(stagingDir, path.join(outRoot, alias), { recursive: true });
    }
  } finally {
    await removeEntryCss();
    await fs.rm(stagingDir, { recursive: true, force: true });
  }

  const rel = path.relative(monorepoRoot, outRoot);
  console.log(
    `[build-cdn] wrote ${rel}/ (version ${version}, aliases: ${aliasDirs.join(', ')})`
  );
}

main().catch(err => {
  console.error('[build-cdn] failed:', err);
  process.exit(1);
});
