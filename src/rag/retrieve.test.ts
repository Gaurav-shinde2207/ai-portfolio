import { describe, expect, it } from 'vitest';
import { loadCorpus, cosineSimilarity, retrieve } from './retrieve';

const DIM = 384;

function basis(index: number, scale = 1): Float32Array {
  const v = new Float32Array(DIM);
  v[index] = scale;
  return v;
}

describe('cosineSimilarity', () => {
  it('returns 1 for identical vectors', () => {
    const a = basis(0);
    expect(cosineSimilarity(a, a)).toBeCloseTo(1);
  });

  it('returns 0 for orthogonal vectors', () => {
    expect(cosineSimilarity(basis(0), basis(1))).toBeCloseTo(0);
  });
});

function makeCorpus(count: number) {
  const chunksJson = Array.from({ length: count }, (_, i) => ({
    id: `c${i}`,
    anchor: `a${i}`,
    path: `/p${i}/`,
    text: `chunk text ${i}`,
  }));
  const embBin = new Float32Array(count * DIM).buffer;
  return { chunksJson, embBin };
}

describe('loadCorpus', () => {
  it('splits the bin into one 384-dim vector per chunk', () => {
    const { chunksJson } = makeCorpus(3);
    const bin = new Float32Array(3 * DIM);
    bin[0] = 1;
    const corpus = loadCorpus(chunksJson, bin.buffer);
    expect(corpus.chunks).toHaveLength(3);
    expect(corpus.vectors).toHaveLength(3);
    for (const v of corpus.vectors) expect(v.length).toBe(DIM);
    expect(corpus.vectors[0][0]).toBe(1);
  });

  it('throws when bin size does not match chunks', () => {
    const { chunksJson } = makeCorpus(2);
    expect(() => loadCorpus(chunksJson, new Float32Array(DIM).buffer)).toThrow();
  });
});

describe('retrieve', () => {
  const corpus = loadCorpus(
    Array.from({ length: 3 }, (_, i) => ({
      id: `c${i}`,
      anchor: `a${i}`,
      path: `/p${i}/`,
      text: `chunk text ${i}`,
    })),
    (() => {
      const bin = new Float32Array(3 * DIM);
      bin[0] = 1; // c0 == basis(0)
      bin[DIM + 1] = 0.5; // c1 == 0.5*basis(1), cosine 0 with basis(0)
      return bin.buffer;
    })()
  );

  it('returns hits sorted by descending score', () => {
    const hits = retrieve(basis(0), corpus);
    expect(hits).toHaveLength(3);
    for (let i = 1; i < hits.length; i++) {
      expect(hits[i - 1].score).toBeGreaterThanOrEqual(hits[i].score);
    }
    expect(hits[0].id).toBe('c0');
    expect(hits[0].score).toBeCloseTo(1);
    expect(hits[0].path).toBe('/p0/');
    expect(hits[0].text).toBe('chunk text 0');
  });

  it('returns at most k hits', () => {
    const hits = retrieve(basis(0), corpus, 2);
    expect(hits).toHaveLength(2);
  });
});
