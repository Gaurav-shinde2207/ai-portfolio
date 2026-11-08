export interface Citation {
  path: string;
  anchor: string;
}

export interface Stats {
  tps: number;
  prompt_tokens: number;
  model: string;
}

export type MainToWorker =
  | { type: 'init'; force?: 'webgpu' | 'wllama' | 'none' }
  | { type: 'ask'; q: string }
  | { type: 'cancel' };

export type WorkerToMain =
  | { type: 'engine'; engine: 'webgpu' | 'wllama' | 'none'; detail: string }
  | { type: 'progress'; pct: number; detail: string }
  | { type: 'token'; t: string }
  | { type: 'done'; cited: Citation[]; stats: Stats }
  | { type: 'error'; detail: string };
