import type { ChunkRecord, Corpus, RetrievalHit } from './types';

const DIM = 384;

/** Parse a chunks.json array + embeddings.bin buffer into a retrievable corpus. */
export function loadCorpus(
  chunksJson: ChunkRecord[],
  embBin: ArrayBuffer
): Corpus {
  const f32 = new Float32Array(embBin);
  if (f32.length !== chunksJson.length * DIM) {
    throw new Error(
      `embeddings.bin size ${f32.length} does not match ${chunksJson.length} chunks x ${DIM} dims`
    );
  }
  const vectors = Array.from(
    { length: chunksJson.length },
    (_, i) => f32.slice(i * DIM, (i + 1) * DIM)
  );
  return { chunks: chunksJson, vectors };
}

export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

export function retrieve(
  queryEmb: Float32Array,
  corpus: Corpus,
  k = 4
): RetrievalHit[] {
  const hits: RetrievalHit[] = corpus.chunks.map((chunk, i) => ({
    id: chunk.id,
    anchor: chunk.anchor,
    path: chunk.path,
    text: chunk.text,
    score: cosineSimilarity(queryEmb, corpus.vectors[i]),
  }));
  return hits
    .sort((x, y) => y.score - x.score)
    .slice(0, k);
}
