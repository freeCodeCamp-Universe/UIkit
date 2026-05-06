import { execFileSync } from 'node:child_process';
import { existsSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const publicBrand = path.resolve(here, '..', 'public', 'brand');
const out = path.join(publicBrand, 'asset-kit.zip');
const marks = ['fcc-primary.svg', 'fcc-secondary.svg', 'fcc-puck.svg'];

if (existsSync(out)) unlinkSync(out);

try {
  execFileSync(
    'zip',
    ['-j', '-q', '-X', out, ...marks.map(m => path.join(publicBrand, m))],
    { stdio: 'inherit' }
  );
  console.log(`[build-asset-kit] wrote ${path.relative(process.cwd(), out)}`);
} catch (err) {
  console.error(
    '[build-asset-kit] failed — is the `zip` CLI installed? (mac + debian ship it by default).'
  );
  throw err;
}
