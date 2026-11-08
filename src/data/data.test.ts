import { describe, expect, test } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load as yamlLoad } from 'js-yaml';
import { projectsSchema } from './content-schema';

const here = dirname(fileURLToPath(import.meta.url));

describe('projects content collection', () => {
  const REPOS = [
    'ai-portfolio',
    'Gaurav-shinde2207',
    'CafeMind',
    'SQLmind',
    'SQL2NL',
    'customer-churn-ml-api',
    'finsight-financial-rag-system',
    'my_Leetcode_journey',
    'Credit-Card-Fraud-Detection-using-ML',
    'Parkison-Disease-Prediction-using-ML',
    'House-Price-Prediction',
  ];

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

  test('every project is a real GitHub repo under Gaurav-shinde2207', () => {
    const dir = join(here, '../content/projects');
    for (const f of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
      const raw = readFileSync(join(dir, f), 'utf8');
      const fm = yamlLoad(raw.split(/^---$/m)[1]) as { repoUrl?: string; demoUrl?: string };
      const links = [fm.repoUrl, fm.demoUrl].filter(
        (l): l is string => typeof l === 'string' && l.length > 0
      );
      expect(links.length, `${f} must link its GitHub repo or demo`).toBeGreaterThan(0);
      expect(
        fm.repoUrl,
        `${f} repoUrl must be github.com/Gaurav-shinde2207/<repo>`
      ).toMatch(/^https:\/\/github\.com\/Gaurav-shinde2207\/[^/]+$/);
      const repo = (fm.repoUrl as string).replace('https://github.com/Gaurav-shinde2207/', '');
      expect(REPOS, `${f} references unknown repo ${repo}`).toContain(repo);
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

  const experience = resume.experience as Array<{
    role: string;
    org: string;
    period: string;
    detail: string;
  }>;
  const skills = resume.skills as string[];

  test('leads with the TCS AI Engineer experience', () => {
    expect(experience[0].org).toBe('Tata Consultancy Services (TCS)');
    expect(experience[0].period).toContain('2024');
    expect(experience[0].detail).toContain('75%');
  });

  test('skills cover the LLM/RAG/agents stack from the resume', () => {
    for (const s of ['LangChain', 'LangGraph', 'LoRA/QLoRA', 'RAGAS', 'FastAPI']) {
      expect(skills.some((k) => k.includes(s)), `skill list must mention ${s}`).toBe(true);
    }
  });

  test('has education and certification from the resume', () => {
    expect((resume.education as { school: string }).school).toContain('Annasaheb Dange');
    expect(resume.certification as string).toContain('Generative AI with Large Language Models');
  });
});
