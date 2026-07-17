/**
 * Machine-readable registry index. One fetch gives an agent every item,
 * its files (raw URLs), npm deps and registry deps.
 */
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import {
  SITE,
  componentItem,
  iconSvgNames,
  nonComponentItems,
  registryVersion,
  type RegistryItem
} from '../../lib/registry';

function serialize(item: RegistryItem) {
  return {
    name: item.name,
    kind: item.kind,
    title: item.title,
    ...(item.category ? { category: item.category } : {}),
    description: item.description,
    npmDependencies: item.npmDependencies,
    registryDependencies: item.registryDependencies,
    files: item.files.map(f => ({
      name: f.name,
      target: f.target,
      url: `${SITE}${f.url}`
    })),
    docs: `${SITE}${item.docsPath}`
  };
}

export const GET: APIRoute = async () => {
  const components = await getCollection('components');
  components.sort((a, b) => a.id.localeCompare(b.id));

  const items = [
    ...components
      .map(entry =>
        componentItem(entry.id, {
          title: entry.data.title,
          summary: entry.data.summary,
          category: entry.data.category
        })
      )
      .filter((item): item is RegistryItem => item !== null),
    ...nonComponentItems()
  ];

  const body = {
    name: 'freecodecamp-uikit',
    homepage: SITE,
    version: registryVersion(),
    llms: `${SITE}/llms.txt`,
    starter: `${SITE}/registry/starter.md`,
    icons: {
      names: iconSvgNames(),
      svgUrlTemplate: `${SITE}/registry/icons/svg/{name}.svg`
    },
    items: items.map(serialize)
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
};
