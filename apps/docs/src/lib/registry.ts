/**
 * Copy-source registry manifest.
 *
 * Assembles the machine-readable view of every distributable item from:
 *   - packages/uikit/src/<category>/  (component .tsx + colocated .css)
 *   - packages/uikit-css/src/         (theme: tokens.css, base.css, html/)
 *   - packages/uikit-icons/src/       (Icon component, icon map, raw SVGs)
 *   - packages/uikit-js/src/          (vanilla data-uikit-* runtime)
 *   - packages/uikit-tailwind/src/    (preset + plugin)
 * Dependencies are derived by scanning static imports, never hand-listed.
 *
 * Consumed by the .md component pages, /registry/* raw endpoints,
 * /registry/index.json, llms.txt and llms-full.txt.
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

/**
 * Find the workspace root by walking up from cwd. import.meta.url is
 * useless here: after `astro build` these modules run from bundled chunks
 * in dist/.prerender/, so file-relative paths would point nowhere.
 */
function findRepoRoot(): string {
  let dir = process.cwd();
  for (;;) {
    if (existsSync(resolve(dir, 'pnpm-workspace.yaml'))) return dir;
    const parent = dirname(dir);
    if (parent === dir) {
      throw new Error(
        `registry.ts: pnpm-workspace.yaml not found above ${process.cwd()}`
      );
    }
    dir = parent;
  }
}

const repoRoot = findRepoRoot();
const appRoot = resolve(repoRoot, 'apps', 'docs');
const uikitSrc = resolve(repoRoot, 'packages', 'uikit', 'src');
const cssSrc = resolve(repoRoot, 'packages', 'uikit-css', 'src');
const iconsSrc = resolve(repoRoot, 'packages', 'uikit-icons', 'src');
const jsSrc = resolve(repoRoot, 'packages', 'uikit-js', 'src');
const tailwindSrc = resolve(repoRoot, 'packages', 'uikit-tailwind', 'src');
const showcaseDir = resolve(appRoot, 'src', 'showcase');

export const SITE = 'https://design.freecodecamp.org';

export interface RegistryFile {
  /** File name as served, e.g. `Button.tsx`. */
  name: string;
  /** Absolute path on disk (build-time only). */
  absPath: string;
  /** Raw endpoint path, e.g. `/registry/button/Button.tsx`. */
  url: string;
  /** Suggested destination inside a consuming project. */
  target: string;
  /** Fence language for markdown embedding. */
  lang: string;
}

export interface RegistryItem {
  /** Registry-unique kebab-case name, e.g. `button`, `theme`. */
  name: string;
  kind:
    | 'component'
    | 'lib'
    | 'theme'
    | 'icons'
    | 'vanilla'
    | 'tailwind'
    | 'html';
  title: string;
  description: string;
  category?: string;
  /** npm packages the copied source imports, with version ranges. */
  npmDependencies: string[];
  /** Other registry items this one needs. */
  registryDependencies: string[];
  files: RegistryFile[];
  /** Human/agent docs page for this item. */
  docsPath: string;
}

const CATEGORY_DIRS = [
  'primitives',
  'forms',
  'navigation',
  'overlays',
  'data-display',
  'layouts',
  'games'
] as const;

function pascal(slug: string): string {
  return slug
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

const uikitPkg = JSON.parse(
  readFileSync(resolve(repoRoot, 'packages', 'uikit', 'package.json'), 'utf8')
) as { peerDependencies: Record<string, string> };
const jsPkg = JSON.parse(
  readFileSync(
    resolve(repoRoot, 'packages', 'uikit-js', 'package.json'),
    'utf8'
  )
) as { dependencies: Record<string, string> };

function peer(name: string): string {
  const range = uikitPkg.peerDependencies[name];
  return range ? `${name}@${range}` : name;
}

/** `@ark-ui/react/dialog` → `@ark-ui/react`; `@zag-js/combobox` stays. */
function packageOf(specifier: string): string {
  const parts = specifier.split('/');
  return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
}

/** Static-import scan: external packages + sibling registry items. */
function scanImports(absPath: string): {
  npm: Set<string>;
  registry: Set<string>;
} {
  const src = readFileSync(absPath, 'utf8');
  const npm = new Set<string>();
  const registry = new Set<string>();
  const importRe = /import\s[^'"]*['"]([^'"]+)['"]/g;
  let m: RegExpExecArray | null;
  while ((m = importRe.exec(src)) !== null) {
    const spec = m[1];
    if (spec.startsWith('.')) {
      const base = spec.split('/').pop() ?? '';
      // PascalCase sibling → its own registry item (kebab-cased).
      const kebab = base
        .replace(/\.(tsx?|css)$/, '')
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .toLowerCase();
      if (kebab && !spec.endsWith('.css')) registry.add(kebab);
      continue;
    }
    const pkg = packageOf(spec);
    if (pkg === 'react' || pkg === 'react-dom') continue;
    npm.add(pkg);
  }
  return { npm, registry };
}

/** Locate `<Pascal>.tsx` for a component slug across category dirs. */
export function componentSource(slug: string): {
  category: string;
  absPath: string;
  fileName: string;
} | null {
  const fileName = `${pascal(slug)}.tsx`;
  for (const dir of CATEGORY_DIRS) {
    const absPath = resolve(uikitSrc, dir, fileName);
    if (existsSync(absPath)) return { category: dir, absPath, fileName };
  }
  return null;
}

function componentFiles(slug: string): RegistryFile[] {
  const source = componentSource(slug);
  if (!source) return [];
  const files: RegistryFile[] = [
    {
      name: source.fileName,
      absPath: source.absPath,
      url: `/registry/${slug}/${source.fileName}`,
      target: `src/ui/${slug}/${source.fileName}`,
      lang: 'tsx'
    }
  ];
  const cssPath = resolve(uikitSrc, source.category, `${slug}.css`);
  if (existsSync(cssPath)) {
    files.push({
      name: `${slug}.css`,
      absPath: cssPath,
      url: `/registry/${slug}/${slug}.css`,
      target: `src/ui/${slug}/${slug}.css`,
      lang: 'css'
    });
  }
  return files;
}

export function componentItem(
  slug: string,
  meta: { title: string; summary: string; category: string }
): RegistryItem | null {
  const files = componentFiles(slug);
  if (!files.length) return null;
  const npm = new Set<string>([peer('react')]);
  const registry = new Set<string>(['theme']);
  for (const file of files) {
    if (file.lang !== 'tsx') continue;
    const scanned = scanImports(file.absPath);
    for (const pkg of scanned.npm) npm.add(peer(pkg));
    for (const dep of scanned.registry) registry.add(dep);
  }
  return {
    name: slug,
    kind: 'component',
    title: meta.title,
    description: meta.summary,
    category: meta.category,
    npmDependencies: [...npm],
    registryDependencies: [...registry],
    files,
    docsPath: `/components/${slug}.md`
  };
}

function libItem(
  name: string,
  title: string,
  description: string,
  absPath: string,
  fileName: string
): RegistryItem {
  const scanned = scanImports(absPath);
  const registry = new Set<string>(scanned.registry);
  registry.delete(name);
  return {
    name,
    kind: 'lib',
    title,
    description,
    npmDependencies: [peer('react'), ...[...scanned.npm].map(peer)],
    registryDependencies: [...registry],
    files: [
      {
        name: fileName,
        absPath,
        url: `/registry/${name}/${fileName}`,
        target: `src/ui/${name}/${fileName}`,
        lang: fileName.endsWith('.tsx') ? 'tsx' : 'ts'
      }
    ],
    docsPath: `/registry/${name}.md`
  };
}

function file(
  item: string,
  absPath: string,
  target: string,
  lang: string
): RegistryFile {
  const name = absPath.split('/').pop()!;
  return { name, absPath, url: `/registry/${item}/${name}`, target, lang };
}

export function themeItem(): RegistryItem {
  return {
    name: 'theme',
    kind: 'theme',
    title: 'Theme',
    description:
      'Design tokens (colors, type, spacing, motion) + shared base helpers. Every component depends on this. Dark by default; add .light-palette to opt into light mode.',
    npmDependencies: [],
    registryDependencies: [],
    files: [
      file(
        'theme',
        resolve(cssSrc, 'tokens.css'),
        'src/ui/theme/tokens.css',
        'css'
      ),
      file('theme', resolve(cssSrc, 'base.css'), 'src/ui/theme/base.css', 'css')
    ],
    docsPath: '/registry/theme.md'
  };
}

export function iconsItem(): RegistryItem {
  return {
    name: 'icons',
    kind: 'icons',
    title: 'Icons',
    description:
      'Curated Lucide subset: Icon React component + icon map. Copy Icon.tsx and a subset of icons.ts, or grab raw SVGs per icon.',
    npmDependencies: [peer('react')],
    registryDependencies: [],
    files: [
      file(
        'icons',
        resolve(iconsSrc, 'react.tsx'),
        'src/ui/icons/Icon.tsx',
        'tsx'
      ),
      file(
        'icons',
        resolve(iconsSrc, 'icons.ts'),
        'src/ui/icons/icons.ts',
        'ts'
      )
    ],
    docsPath: '/registry/icons.md'
  };
}

export function iconSvgNames(): string[] {
  return readdirSync(resolve(iconsSrc, 'svg'))
    .filter(f => f.endsWith('.svg'))
    .map(f => f.replace(/\.svg$/, ''))
    .sort();
}

export function iconSvgFile(name: string): RegistryFile {
  return file(
    'icons',
    resolve(iconsSrc, 'svg', `${name}.svg`),
    `src/ui/icons/svg/${name}.svg`,
    'svg'
  );
}

export function vanillaItem(): RegistryItem {
  const adapters = readdirSync(resolve(jsSrc, 'adapters'))
    .filter(f => f.endsWith('.ts'))
    .sort();
  return {
    name: 'vanilla',
    kind: 'vanilla',
    title: 'Vanilla JS runtime',
    description:
      'Framework-free behaviours bound via data-uikit-* attributes (dialog, combobox, listbox, pagination, toast), powered by Zag state machines. Alternative to the React components for plain HTML.',
    npmDependencies: Object.entries(jsPkg.dependencies).map(
      ([name, range]) => `${name}@${range}`
    ),
    registryDependencies: ['theme'],
    files: [
      file(
        'vanilla',
        resolve(jsSrc, 'core.ts'),
        'src/ui/vanilla/core.ts',
        'ts'
      ),
      file(
        'vanilla',
        resolve(jsSrc, 'index.ts'),
        'src/ui/vanilla/index.ts',
        'ts'
      ),
      ...adapters.map(name =>
        file(
          'vanilla',
          resolve(jsSrc, 'adapters', name),
          `src/ui/vanilla/adapters/${name}`,
          'ts'
        )
      )
    ],
    docsPath: '/registry/vanilla.md'
  };
}

export function tailwindItem(): RegistryItem {
  return {
    name: 'tailwind',
    kind: 'tailwind',
    title: 'Tailwind preset',
    description:
      'Optional Tailwind (>=4) preset + plugin mirroring the UIKit tokens as utilities. Components do not require Tailwind.',
    npmDependencies: ['tailwindcss@>=4.0.0'],
    registryDependencies: ['theme'],
    files: [
      file(
        'tailwind',
        resolve(tailwindSrc, 'preset.ts'),
        'src/ui/tailwind/preset.ts',
        'ts'
      ),
      file(
        'tailwind',
        resolve(tailwindSrc, 'plugin.ts'),
        'src/ui/tailwind/plugin.ts',
        'ts'
      )
    ],
    docsPath: '/registry/tailwind.md'
  };
}

export function htmlProgressItem(): RegistryItem {
  return {
    name: 'html-progress',
    kind: 'html',
    title: 'Progress (HTML-only)',
    description:
      'BEM progress bar pattern with no React counterpart. Copy the CSS and use the .progress / .progress__bar classes directly.',
    npmDependencies: [],
    registryDependencies: ['theme'],
    files: [
      file(
        'html-progress',
        resolve(cssSrc, 'html', 'progress.css'),
        'src/ui/html-progress/progress.css',
        'css'
      )
    ],
    docsPath: '/registry/html-progress.md'
  };
}

export function sharedLibItems(): RegistryItem[] {
  return [
    libItem(
      'use-async-combobox-items',
      'useAsyncComboboxItems',
      'Debounced + cancellable async item loading for the Combobox component.',
      resolve(uikitSrc, 'navigation', 'useAsyncComboboxItems.ts'),
      'useAsyncComboboxItems.ts'
    ),
    libItem(
      'hotspot-shapes',
      'HotspotShapes',
      'Shape helpers (rect, circle, polygon) for the Hotspots game component.',
      resolve(uikitSrc, 'games', 'HotspotShapes.tsx'),
      'HotspotShapes.tsx'
    )
  ];
}

export function nonComponentItems(): RegistryItem[] {
  return [
    themeItem(),
    iconsItem(),
    vanillaItem(),
    tailwindItem(),
    htmlProgressItem(),
    ...sharedLibItems()
  ];
}

// --- props.json → markdown table ---------------------------------------

interface PropEntry {
  type: string;
  required: boolean;
  description: string;
  defaultValue?: string | null;
  _extractionFailed?: boolean;
}
interface PropsJson {
  [component: string]:
    | { displayName: string; props: Record<string, PropEntry> }
    | string;
}

let propsJsonCache: PropsJson | null = null;
function propsJson(): PropsJson {
  if (!propsJsonCache) {
    propsJsonCache = JSON.parse(
      readFileSync(
        resolve(repoRoot, 'packages', 'uikit', 'dist', 'props.json'),
        'utf8'
      )
    ) as PropsJson;
  }
  return propsJsonCache;
}

/** Markdown props table for a component slug, or a source pointer fallback. */
export function propsTable(slug: string): string {
  const entry = propsJson()[pascal(slug)];
  if (!entry || typeof entry === 'string' || !entry.props) {
    return 'Props could not be statically extracted - see the TypeScript source below.';
  }
  const names = Object.keys(entry.props);
  if (!names.length) {
    return 'No component-specific props - accepts standard HTML attributes. See the TypeScript source below.';
  }
  const rows = names.map(name => {
    const p = entry.props[name];
    const def = p.defaultValue == null ? '-' : `\`${p.defaultValue}\``;
    const desc = (p.description || '')
      .replaceAll('|', '\\|')
      .replaceAll('\n', ' ');
    return `| \`${name}\` | \`${p.type}\` | ${p.required ? 'yes' : 'no'} | ${def} | ${desc} |`;
  });
  return [
    '| Prop | Type | Required | Default | Description |',
    '| --- | --- | --- | --- | --- |',
    ...rows
  ].join('\n');
}

// --- showcase snippet extraction ----------------------------------------

function showcaseSnippet(slug: string, slot: 'react' | 'html'): string | null {
  const path = resolve(showcaseDir, `${slug}.astro`);
  if (!existsSync(path)) return null;
  const src = readFileSync(path, 'utf8');
  const re = new RegExp(
    `<Code\\s+slot=['"]${slot}['"][\\s\\S]*?code=\\{\`([\\s\\S]*?)\`\\}`
  );
  const m = re.exec(src);
  return m ? m[1] : null;
}

/** Showcase React snippet - authored with copied-source imports (./ui/...). */
export function reactSnippet(slug: string): string | null {
  return showcaseSnippet(slug, 'react');
}

export function htmlSnippet(slug: string): string | null {
  return showcaseSnippet(slug, 'html');
}

// --- version --------------------------------------------------------------

let versionCache: string | null = null;
/** `<git short sha> (<ISO date>)` - falls back to package version. */
export function registryVersion(): string {
  if (versionCache) return versionCache;
  try {
    const sha = execSync('git rev-parse --short HEAD', {
      cwd: repoRoot,
      encoding: 'utf8'
    }).trim();
    const date = execSync('git show -s --format=%cs HEAD', {
      cwd: repoRoot,
      encoding: 'utf8'
    }).trim();
    versionCache = `${sha} (${date})`;
  } catch {
    versionCache = 'unknown';
  }
  return versionCache;
}

export function readRegistryFile(f: RegistryFile): string {
  return readFileSync(f.absPath, 'utf8');
}

/** Font files shipped in the docs public dir (referenced by tokens.css). */
export function publicFontNames(): string[] {
  return readdirSync(resolve(appRoot, 'public', 'fonts'))
    .filter(f => /\.woff2?$/.test(f))
    .sort();
}
