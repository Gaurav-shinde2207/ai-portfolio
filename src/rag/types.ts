export interface ChunkRecord {
  id: string;
  anchor: string;
  path: string;
  text: string;
}

export interface Corpus {
  chunks: ChunkRecord[];
  vectors: Float32Array[];
}

export interface RetrievalHit {
  id: string;
  anchor: string;
  path: string;
  text: string;
  score: number;
}
