import { z } from 'zod';

export const projectsSchema = z.object({
  title: z.string(),
  blurb: z.string(),
  metrics: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
    }),
  ),
  stack: z.array(z.string()),
  demoUrl: z.string().optional(),
  repoUrl: z.string().optional(),
});

export type ProjectFrontmatter = z.infer<typeof projectsSchema>;
