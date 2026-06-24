import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const foundations = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/foundations' }),
  schema: z.object({
    title: z.string(),
    eyebrow: z.string(),
    summary: z.string(),
    description: z.string().optional(),
    order: z.number().int().positive(),
    wide: z.boolean().optional()
  })
});

const components = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/components' }),
  schema: z.object({
    title: z.string(),
    eyebrow: z.string(),
    status: z.enum(['stable', 'beta', 'planned']).default('planned'),
    since: z.string().optional(),
    category: z.enum([
      'primitive',
      'form',
      'overlay',
      'navigation',
      'data-display',
      'layout'
    ]),
    summary: z.string(),
    a11yPattern: z.url().optional(),
    tokens: z.array(z.string()).optional(),
    order: z.number().int().nonnegative().optional()
  })
});

export const collections = { foundations, components };
