import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, resolve, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = resolve(here, '..');
const svgDir = resolve(pkgRoot, 'src/svg');
const distDir = resolve(pkgRoot, 'dist');

mkdirSync(distDir, { recursive: true });

const files = readdirSync(svgDir)
  .filter(f => f.endsWith('.svg'))
  .sort();

const symbols = files.map(file => {
  const name = basename(file, extname(file));
  const raw = readFileSync(resolve(svgDir, file), 'utf8');
  const body = raw
    .replace(/<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')
    .trim();
  return `  <symbol id="fcc-icon-${name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</symbol>`;
});

const sprite =
  '<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n' +
  symbols.join('\n') +
  '\n</svg>\n';

writeFileSync(resolve(distDir, 'sprite.svg'), sprite);

console.log(
  `[uikit-icons] wrote sprite with ${files.length} symbols -> dist/sprite.svg`
);
