#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bundle } from 'lightningcss';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, '..');
const monorepoRoot = path.resolve(appRoot, '..', '..');
const uikitCssSrc = path.join(monorepoRoot, 'packages', 'uikit-css', 'src');
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
const outDir = path.join(appRoot, 'public', 'cdn');

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
      console.warn(`[build-cdn-bundle] warn: ${w.type} ${w.value ?? ''}`);
    }
  }
  return code;
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

async function hashFile(filePath) {
  const buf = await fs.readFile(filePath);
  const sha384B64 = createHash('sha384').update(buf).digest('base64');
  return {
    sha256: createHash('sha256').update(buf).digest('hex'),
    sha384: `sha384-${sha384B64}`,
    bytes: buf.byteLength
  };
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
  await fs.rm(outDir, { recursive: true, force: true });
  await fs.mkdir(outDir, { recursive: true });

  await writeEntryCss();
  try {
    const styles = bundleCss(path.join(stylesDir, '_cdn-entry.css'));
    const tokensOnly = bundleCss(path.join(stylesDir, 'tokens.css'));
    const componentsOnly = bundleCss(path.join(stylesDir, 'components.css'));

    await Promise.all([
      fs.writeFile(path.join(outDir, 'styles.min.css'), styles),
      fs.writeFile(path.join(outDir, 'tokens.min.css'), tokensOnly),
      fs.writeFile(path.join(outDir, 'components.min.css'), componentsOnly)
    ]);

    await copyDirIfExists(fontsSrc, path.join(outDir, 'fonts'));
    await copyDirIfExists(brandSrc, path.join(outDir, 'brand'));

    if (
      !(await copyFileIfExists(
        uikitJsGlobal,
        path.join(outDir, 'uikit.global.js')
      ))
    ) {
      throw new Error(
        `uikit-js build output missing at ${path.relative(monorepoRoot, uikitJsGlobal)}; run uikit-js build first`
      );
    }
    if (
      !(await copyFileIfExists(
        uikitIconsSprite,
        path.join(outDir, 'sprite.svg')
      ))
    ) {
      throw new Error(
        `uikit-icons sprite missing at ${path.relative(monorepoRoot, uikitIconsSprite)}; run uikit-icons build first`
      );
    }
  } finally {
    await removeEntryCss();
  }

  const files = await walk(outDir);
  const manifest = {};
  for (const rel of files) {
    if (rel === 'manifest.json') continue;
    manifest[rel] = await hashFile(path.join(outDir, rel));
  }
  await fs.writeFile(
    path.join(outDir, 'manifest.json'),
    JSON.stringify(
      { generatedAt: new Date().toISOString(), files: manifest },
      null,
      2
    ) + '\n'
  );

  const rel = path.relative(monorepoRoot, outDir);
  console.log(`[build-cdn-bundle] wrote ${rel}/ (rolling, unversioned)`);
}

main().catch(err => {
  console.error('[build-cdn-bundle] failed:', err);
  process.exit(1);
});
