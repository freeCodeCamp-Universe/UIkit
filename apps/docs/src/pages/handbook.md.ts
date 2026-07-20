import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { stripMdx } from '../lib/strip-mdx';

const SITE = 'https://design.freecodecamp.org';

export const GET: APIRoute = async () => {
  const foundations = (await getCollection('foundations')).sort(
    (a, b) => a.data.order - b.data.order
  );

  const lines: string[] = [];
  lines.push('# freeCodeCamp UIKit - Handbook');
  lines.push('');
  lines.push(`HTML: ${SITE}/handbook`);
  lines.push('');
  lines.push(
    'Design philosophy, palette, typography, spacing, iconography, motion, voice.'
  );
  lines.push('');
  lines.push('---');
  lines.push('');

  for (const entry of foundations) {
    lines.push(`## ${entry.data.title}`);
    lines.push('');
    lines.push(`> ${entry.data.summary}`);
    lines.push('');
    lines.push(stripMdx(entry.body ?? ''));
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
};
