import type { RetrievalHit } from './types';

/** Top-1 similarity at or above this routes to grounded RAG mode. */
export const RAG_THRESHOLD = 0.35;

export function route(hits: RetrievalHit[]): {
  mode: 'rag' | 'general';
  hits: RetrievalHit[];
} {
  const top1 = hits[0]?.score ?? -Infinity;
  return {
    mode: top1 >= RAG_THRESHOLD ? 'rag' : 'general',
    hits,
  };
}
