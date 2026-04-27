import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const SITE = 'https://design.freecodecamp.org';

export const GET: APIRoute = async () => {
  const components = await getCollection('components');
  components.sort((a, b) => a.id.localeCompare(b.id));

  const lines: string[] = [];
  lines.push('# freeCodeCamp UIKit');
  lines.push('');
  lines.push('Dark-first, token-driven, framework-agnostic component library.');
  lines.push(
    'Three surfaces: React, vanilla CSS+JS, Tailwind preset. BEM-first.'
  );
  lines.push('');

  lines.push('## Surfaces');
  lines.push('');
  lines.push(`- [Landing](${SITE}/) — overview + quickstart.`);
  lines.push(
    `- [Playground](${SITE}/playground) — every component, paired code.`
  );
  lines.push(
    `- [Handbook](${SITE}/handbook) — design philosophy, tokens, brand, install, CDN, Tailwind, recipes, contributing.`
  );
  lines.push('');

  lines.push('## Components');
  lines.push('');
  for (const c of components) {
    lines.push(
      `- [${c.data.title}](${SITE}/components/${c.id}.md) — ${c.data.summary}`
    );
  }
  lines.push('');

  lines.push('## Concatenated dump');
  lines.push('');
  lines.push(
    `- [llms-full.txt](${SITE}/llms-full.txt) — every page, single file.`
  );
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
};
