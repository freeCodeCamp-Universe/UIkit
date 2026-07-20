/**
 * Markdown renderers for the copy-source registry pages.
 * Shared by /components/[slug].md, /registry/*.md and llms-full.txt so the
 * human docs, agent pages and the full dump never drift apart.
 */
import {
  SITE,
  componentItem,
  componentSource,
  htmlSnippet,
  propsTable,
  reactSnippet,
  readRegistryFile,
  type RegistryItem
} from './registry';

export interface ComponentPageMeta {
  slug: string;
  title: string;
  summary: string;
  status: string;
  since?: string;
  category: string;
  tokens?: string[];
  a11yPattern?: string;
  /** stripMdx()'d prose from the MDX body. */
  prose: string;
}

const AGENT_FOOTER = [
  '## For coding agents',
  '',
  `This library is distributed as copyable source, not an npm package. Start at ${SITE}/registry/starter.md, discover components via ${SITE}/llms.txt, and copy files into the consuming project. Keep token names intact; recolour by editing the copied tokens.css.`
].join('\n');

function fence(lang: string, code: string): string {
  return `\`\`\`${lang}\n${code.replace(/\n+$/, '')}\n\`\`\``;
}

/**
 * MDX bodies keep their section headings after stripMdx() removes the JSX
 * beneath them (PropTable, TokenChips, ...). Drop any heading whose section
 * has no content left, repeatedly, so cascades collapse too.
 */
export function dropEmptySections(md: string): string {
  let prev = '';
  let out = `${md.trim()}\n`;
  while (prev !== out) {
    prev = out;
    out = out.replace(/^#{2,6} [^\n]*\n+(?=#{1,6} )/gm, '');
    out = out.replace(/(^|\n)#{2,6} [^\n]*\n*$/, '$1');
  }
  return out.trim();
}

function depsSection(item: RegistryItem): string[] {
  const lines: string[] = [];
  lines.push(
    `- npm dependencies: ${item.npmDependencies.length ? item.npmDependencies.map(d => `\`${d}\``).join(', ') : 'none'}`
  );
  if (item.registryDependencies.length) {
    lines.push(
      `- Registry dependencies: ${item.registryDependencies
        .map(dep => {
          // Components document at /components/<slug>.md; everything else
          // (theme, icons, shared hooks) at /registry/<name>.md.
          const url = componentSource(dep)
            ? `${SITE}/components/${dep}.md`
            : `${SITE}/registry/${dep}.md`;
          return `[${dep}](${url})`;
        })
        .join(', ')}`
    );
  }
  lines.push('- Files:');
  for (const f of item.files) {
    lines.push(`  - \`${f.name}\` → \`${f.target}\` (raw: ${SITE}${f.url})`);
  }
  return lines;
}

export function renderComponentPage(meta: ComponentPageMeta): string {
  const item = componentItem(meta.slug, {
    title: meta.title,
    summary: meta.summary,
    category: meta.category
  });

  const lines: string[] = [];
  lines.push(`# ${meta.title}`);
  lines.push('');
  lines.push(`> ${meta.summary}`);
  lines.push('');
  lines.push(`- Category: ${meta.category}`);
  lines.push(
    `- Status: ${meta.status}${meta.since ? ` (since ${meta.since})` : ''}`
  );
  if (meta.a11yPattern) lines.push(`- A11y pattern: ${meta.a11yPattern}`);
  if (meta.tokens?.length) lines.push(`- Tokens: ${meta.tokens.join(', ')}`);
  lines.push(`- Playground: ${SITE}/playground#${meta.slug}`);
  if (item) lines.push(...depsSection(item));
  lines.push('');

  lines.push('## Install (copy source)');
  lines.push('');
  lines.push(
    `1. Ensure the theme is installed once per project - tokens.css + base.css imported globally, fonts available. See ${SITE}/registry/theme.md and ${SITE}/registry/starter.md.`
  );
  if (item) {
    lines.push(
      `2. Copy the files below into \`src/ui/${meta.slug}/\` (adjust to your project layout) and import the CSS once from your global stylesheet, e.g. \`@import './ui/${meta.slug}/${meta.slug}.css';\`.`
    );
    const deps = item.registryDependencies.filter(d => d !== 'theme');
    if (deps.length) {
      lines.push(
        `3. Also copy the registry dependencies listed above (${deps.join(', ')}).`
      );
    }
  }
  lines.push(
    `${item && item.registryDependencies.filter(d => d !== 'theme').length ? 4 : 3}. Colors, spacing and type come from tokens - tailor the component by editing the copied source; recolour by editing tokens.css, not the component CSS.`
  );
  lines.push('');

  const prose = dropEmptySections(meta.prose);
  if (prose) {
    lines.push('## Usage');
    lines.push('');
    lines.push(prose);
    lines.push('');
  }

  const react = reactSnippet(meta.slug);
  if (react) {
    lines.push('## Example');
    lines.push('');
    lines.push(fence('tsx', react));
    lines.push('');
  }

  lines.push('## Props');
  lines.push('');
  lines.push(propsTable(meta.slug));
  lines.push('');

  if (item) {
    for (const f of item.files) {
      lines.push(`## Source: ${f.name}`);
      lines.push('');
      lines.push(fence(f.lang, readRegistryFile(f)));
      lines.push('');
    }
  }

  const html = htmlSnippet(meta.slug);
  if (html) {
    lines.push('## HTML / vanilla variant');
    lines.push('');
    lines.push(fence('html', html));
    lines.push('');
    lines.push(
      `Interactive behaviours for plain HTML come from the vanilla runtime (data-uikit-* attributes): ${SITE}/registry/vanilla.md - or via CDN: ${SITE}/cdn/uikit.global.js`
    );
    lines.push('');
  }

  lines.push(AGENT_FOOTER);
  lines.push('');
  return lines.join('\n');
}

/** Generic page for non-component items (theme, icons, vanilla, ...). */
export function renderItemPage(
  item: RegistryItem,
  opts: { intro?: string[]; skipSources?: Set<string>; outro?: string[] } = {}
): string {
  const lines: string[] = [];
  lines.push(`# ${item.title}`);
  lines.push('');
  lines.push(`> ${item.description}`);
  lines.push('');
  lines.push(...depsSection(item));
  lines.push('');
  if (opts.intro?.length) {
    lines.push(...opts.intro);
    lines.push('');
  }
  for (const f of item.files) {
    if (opts.skipSources?.has(f.name)) {
      lines.push(`## Source: ${f.name}`);
      lines.push('');
      lines.push(`Too large to inline - fetch the raw file: ${SITE}${f.url}`);
      lines.push('');
      continue;
    }
    lines.push(`## Source: ${f.name}`);
    lines.push('');
    lines.push(fence(f.lang, readRegistryFile(f)));
    lines.push('');
  }
  if (opts.outro?.length) {
    lines.push(...opts.outro);
    lines.push('');
  }
  lines.push(AGENT_FOOTER);
  lines.push('');
  return lines.join('\n');
}
