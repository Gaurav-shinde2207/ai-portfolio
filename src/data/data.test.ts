import { describe, expect, test } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load as yamlLoad } from 'js-yaml';
import { projectsSchema } from './content-schema';
import { PROJECTS, SECONDARY } from './onep';

const here = dirname(fileURLToPath(import.meta.url));

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

  test('contains the confirmed phone number', () => {
    expect(resume.phone).toBe('+91-9158113546');
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

describe('one-pager data (src/data/onep.ts)', () => {
  test('every featured project is a known GitHub repo under Gaurav-shinde2207', () => {
    for (const p of [...PROJECTS, ...SECONDARY]) {
      expect(p.repoUrl, `${p.key} repoUrl must be a real Gaurav repo`).toMatch(
        /^https:\/\/github\.com\/Gaurav-shinde2207\/[^/]+$/
      );
      expect(REPOS, `${p.key} references unknown repo`).toContain(
        p.repoUrl.replace('https://github.com/Gaurav-shinde2207/', '')
      );
    }
  });

  test('deep stages carry the headline metric and both prose blocks', () => {
    for (const p of PROJECTS) {
      expect(p.kpis.length).toBeGreaterThanOrEqual(3);
      expect(p.problem.trim().length, `${p.key} needs "The problem."`).toBeGreaterThan(40);
      expect(p.build.trim().length, `${p.key} needs "What I built."`).toBeGreaterThan(40);
      expect(p.outcomes.length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('rag corpus anchors', () => {
  const chunks = JSON.parse(
    readFileSync(join(here, 'chunks.json'), 'utf8'),
  ) as Array<{ id: string; anchor: string; path: string; text: string }>;

  test('project content is repo-prefixed and cites the one-pager', () => {
    const projectChunks = chunks.filter((c) => c.path === '/' && /^.+-intro$/.test(c.anchor));
    expect(projectChunks.length).toBeGreaterThanOrEqual(5);
    for (const c of projectChunks) {
      expect(c.anchor).toMatch(/^(sqlmind|sql2nl|finsight|cafemind|customer-churn)-intro$/);
    }
  });

  test('resume chunks cite the one-pager sections', () => {
    for (const a of ['summary', 'skills', 'experience', 'education', 'contact']) {
      expect(chunks.some((c) => c.anchor === a && c.path === '/'), `missing anchor ${a}`).toBe(true);
    }
  });
});
