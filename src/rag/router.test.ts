import { describe, expect, it } from 'vitest';
import { route, RAG_THRESHOLD } from './router';
import type { RetrievalHit } from './types';

function hit(score: number, id = `c${score}`): RetrievalHit {
  return { id, anchor: 'a', path: '/p/', text: 't', score };
}

describe('route', () => {
  it('is RAG when top1 score reaches the threshold', () => {
    expect(route([hit(RAG_THRESHOLD), hit(0.1)]).mode).toBe('rag');
  });

  it('is general when the best score is below the threshold', () => {
    expect(route([hit(RAG_THRESHOLD - 0.001), hit(0.05)]).mode).toBe('general');
  });

  it('is general with no hits', () => {
    const { mode, hits } = route([]);
    expect(mode).toBe('general');
    expect(hits).toHaveLength(0);
  });

  it('passes hits through unchanged', () => {
    const hits = [hit(0.9)];
    expect(route(hits).hits).toEqual(hits);
  });

  it('threshold is 0.35', () => {
    expect(RAG_THRESHOLD).toBe(0.35);
  });
});
