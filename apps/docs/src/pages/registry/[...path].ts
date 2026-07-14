/**
 * Raw copy-source endpoints: every registry file served verbatim as
 * text/plain, e.g. /registry/button/Button.tsx, /registry/theme/tokens.css,
 * /registry/icons/svg/check.svg. Agents that already know what they need
 * can skip the markdown pages entirely.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import {
  componentItem,
  iconSvgFile,
  iconSvgNames,
  nonComponentItems,
  readRegistryFile,
  type RegistryFile
} from '../../lib/registry';

async function allFiles(): Promise<RegistryFile[]> {
  const files: RegistryFile[] = [];
  const components = await getCollection('components');
  for (const entry of components) {
    const item = componentItem(entry.id, {
      title: entry.data.title,
      summary: entry.data.summary,
      category: entry.data.category
    });
    if (item) files.push(...item.files);
  }
  for (const item of nonComponentItems()) files.push(...item.files);
  for (const name of iconSvgNames()) {
    const svg = iconSvgFile(name);
    files.push({ ...svg, url: `/registry/icons/svg/${name}.svg` });
  }
  return files;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const files = await allFiles();
  return files.map(file => ({
    params: { path: file.url.replace(/^\/registry\//, '') },
    props: { file }
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { file } = props as { file: RegistryFile };
  return new Response(readRegistryFile(file), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
};
