// Wave 8 P1 (W8-3) — auto-build guard for the docs site.
//
// `apps/docs` consumes `@freecodecamp/uikit/props.json` at build time
// (PlaygroundCard renders the prop table inside the anatomy block).
// On a fresh clone or after `pnpm install --frozen-lockfile`, the
// uikit's `dist/props.json` does not exist yet — Astro fails the
// import resolution. This guard detects the missing file and
// auto-runs `pnpm -F @freecodecamp/uikit build` once. Pre-launch
// contributor friction matters more than perfect invariant strictness
// (D13).
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
    `[apps/docs] ${propsPath} missing — auto-running \`pnpm -F @freecodecamp/uikit build\`.\n`
  );
  execSync('pnpm -F @freecodecamp/uikit build', { stdio: 'inherit' });
}
