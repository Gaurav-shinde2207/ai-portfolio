import { describe, expect, test } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load as yamlLoad } from 'js-yaml';
import { projectsSchema } from './content-schema';

const here = dirname(fileURLToPath(import.meta.url));

describe('projects content collection', () => {
  test('loads at least 1 project and every project passes the schema', () => {
    const dir = join(here, '../content/projects');
    const files = readdirSync(dir).filter((f) => f.endsWith('.md'));
    expect(files.length).toBeGreaterThanOrEqual(1);
    for (const f of files) {
      const raw = readFileSync(join(dir, f), 'utf8');
      const fm = yamlLoad(raw.split(/^---$/m)[1]) as Record<string, unknown>;
      expect(() => projectsSchema.parse(fm)).not.toThrow();
    }
  });
});

describe('resume.json', () => {
  const resume = JSON.parse(
    readFileSync(join(here, 'resume.json'), 'utf8'),
  ) as Record<string, unknown>;

  test('contains email and github keys', () => {
    expect(resume.email).toBe('shindegaurav2201@gmail.com');
    expect(resume.github).toBe('Gaurav-shinde2207');
  });

  test('has the full required shape', () => {
    expect(typeof resume.linkedin).toBe('string');
    expect(typeof resume.summary).toBe('string');
    expect(Array.isArray(resume.skills)).toBe(true);
    expect(Array.isArray(resume.experience)).toBe(true);
  });
});
