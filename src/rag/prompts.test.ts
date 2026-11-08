import { describe, expect, it } from 'vitest';
import { buildRagPrompt, buildGeneralPrompt } from './prompts';
import type { RetrievalHit } from './types';

const PERSONA = 'PERSONA SYSTEM MESSAGE';
const HITS: RetrievalHit[] = [
  { id: 'skills-1', anchor: 'skills', path: '/resume/', text: 'Skills text.', score: 0.9 },
  { id: 'intro-1', anchor: 'intro', path: '/projects/heesch-explainer-videos/', text: 'Project text.', score: 0.8 },
];

describe('buildRagPrompt', () => {
  it('uses the persona as the system message', () => {
    const { system } = buildRagPrompt('q', HITS, PERSONA);
    expect(system).toBe(PERSONA);
  });

  it('includes every hit citation path#anchor and its text verbatim', () => {
    const { user } = buildRagPrompt('q', HITS, PERSONA);
    expect(user).toContain('/resume/#skills');
    expect(user).toContain('/projects/heesch-explainer-videos/#intro');
    expect(user).toContain('Skills text.');
    expect(user).toContain('Project text.');
  });

  it('includes the question', () => {
    const { user } = buildRagPrompt('What RAG stack does Gaurav use?', HITS, PERSONA);
    expect(user).toContain('What RAG stack does Gaurav use?');
  });
});

describe('buildGeneralPrompt', () => {
  it('uses the persona as the system message', () => {
    const { system } = buildGeneralPrompt('q', PERSONA);
    expect(system).toBe(PERSONA);
  });

  it('includes the question and no context citations', () => {
    const { user } = buildGeneralPrompt('What is RAG?', PERSONA);
    expect(user).toContain('What is RAG?');
    expect(user).not.toContain('#intro');
    expect(user).not.toContain('#skills');
  });
});
