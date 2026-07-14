import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { stripMdx } from '../../lib/strip-mdx';
import { renderComponentPage } from '../../lib/registry-md';

export const getStaticPaths: GetStaticPaths = async () => {
  const components = await getCollection('components');
  return components.map(entry => ({
    params: { slug: entry.id },
    props: { entry }
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { entry } = props as { entry: CollectionEntry<'components'> };

  const page = renderComponentPage({
    slug: entry.id,
    title: entry.data.title,
    summary: entry.data.summary,
    status: entry.data.status,
    since: entry.data.since,
    category: entry.data.category,
    tokens: entry.data.tokens,
    a11yPattern: entry.data.a11yPattern,
    prose: stripMdx(entry.body ?? '')
  });

  return new Response(page, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
};
