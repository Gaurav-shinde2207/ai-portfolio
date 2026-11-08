import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { projectsSchema } from './data/content-schema';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.lazy(() => projectsSchema),
});

export const collections = { projects };
