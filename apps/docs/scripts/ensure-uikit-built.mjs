import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const propsPath = resolve(
  here,
  '..',
  '..',
  '..',
  'packages',
  'uikit',
  'dist',
  'props.json'
);

if (!existsSync(propsPath)) {
  process.stderr.write(
    `[apps/docs] ${propsPath} missing - auto-running \`pnpm -F @freecodecamp/uikit build\`.\n`
  );
  execSync('pnpm -F @freecodecamp/uikit build', { stdio: 'inherit' });
}
