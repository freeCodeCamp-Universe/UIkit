import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { stripMdx } from '../lib/strip-mdx';
import { SITE, nonComponentItems } from '../lib/registry';
import { renderComponentPage, renderItemPage } from '../lib/registry-md';

export const GET: APIRoute = async () => {
  const components = await getCollection('components');
  components.sort((a, b) => a.id.localeCompare(b.id));

  const lines: string[] = [];
  lines.push('# freeCodeCamp UIKit — full dump');
  lines.push('');
  lines.push(`Source: ${SITE}/llms.txt`);
  lines.push('');
  lines.push(
    'This file concatenates every registry page — full copyable source included.'
  );
  lines.push('Each item is delimited by a level-1 heading.');
  lines.push(
    `Start with the starter guide (${SITE}/registry/starter.md) if bootstrapping a project.`
  );
  lines.push('');
  lines.push('---');
  lines.push('');

  for (const c of components) {
    lines.push(
      renderComponentPage({
        slug: c.id,
        title: c.data.title,
        summary: c.data.summary,
        status: c.data.status,
        since: c.data.since,
        category: c.data.category,
        tokens: c.data.tokens,
        a11yPattern: c.data.a11yPattern,
        prose: stripMdx(c.body ?? '')
      })
    );
    lines.push('---');
    lines.push('');
  }

  for (const item of nonComponentItems()) {
    // icons.ts is ~8k lines; the icons page links it instead of inlining.
    lines.push(
      renderItemPage(item, {
        skipSources: item.name === 'icons' ? new Set(['icons.ts']) : undefined
      })
    );
    lines.push('---');
    lines.push('');
  }

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
};
