/// <reference lib="webworker" />
import { CreateMLCEngine } from '@mlc-ai/web-llm';
import type { MLCEngineInterface } from '@mlc-ai/web-llm';
import { pipeline } from '@huggingface/transformers';
import { Wllama } from '@wllama/wllama';
import wasmUrl from '@wllama/wllama/esm/wasm/wllama.wasm?url';
import { retrieve } from './retrieve';
import { route, RAG_THRESHOLD } from './router';
import { buildRagPrompt, buildGeneralPrompt } from './prompts';
import { PERSONA_SYSTEM, GENERAL_SYSTEM } from '../data/persona';
import chunksJson from '../data/chunks.json';
import embeddingsUrl from '../data/embeddings.bin?url';
import type { ChunkRecord, Corpus } from './types';
import type { WorkerToMain } from './protocol';

const MODEL_ID = 'Llama-3.2-1B-Instruct-q4f16_1-MLC';
const WLLAMA_REPO = 'Qwen/Qwen2.5-0.5B-Instruct-GGUF';
const WLLAMA_FILE = 'qwen2.5-0.5b-instruct-q4_k_m.gguf';
const WLLAMA_CTX = 2048;
// Tiny WASM engines have small contexts: cap each retrieved hit's text.
const WLLAMA_HIT_CHARS = 300;
const EMBED_MODEL = 'Xenova/all-MiniLM-L6-v2';

const post = (msg: WorkerToMain) => self.postMessage(msg);

let mlc: MLCEngineInterface | null = null;
let wllama: Wllama | null = null;
let embedder: Awaited<ReturnType<typeof pipeline>> | null = null;
let corpus: Corpus | null = null;
let generating = false;
let cancelled = false;

async function init(force?: 'webgpu' | 'wllama' | 'none'): Promise<void> {
  if (force === 'none') {
    post({ type: 'engine', engine: 'none', detail: 'engine forced off (test/override)' });
    return;
  }
  if (force !== 'wllama' && 'gpu' in self.navigator) {
    try {
      mlc = await CreateMLCEngine(MODEL_ID, {
        initProgressCallback: (r) => {
          post({ type: 'progress', pct: r.progress ?? 0, detail: r.text ?? '' });
        },
      });
      post({ type: 'engine', engine: 'webgpu', detail: MODEL_ID });
      return;
    } catch (e) {
      mlc = null;
      post({
        type: 'progress',
        pct: 0,
        detail: `WebGPU init failed, falling back to WASM engine (${String(e).slice(0, 120)})`,
      });
    }
  }
  try {
    wllama = new Wllama({ default: wasmUrl });
    await wllama.loadModelFromHF(
      { repo: WLLAMA_REPO, file: WLLAMA_FILE },
      {
        progressCallback: ({ loaded, total }) => {
          post({ type: 'progress', pct: total > 0 ? loaded / total : 0, detail: 'downloading WASM model' });
        },
        n_threads: 1,
        n_ctx: WLLAMA_CTX,
      }
    );
    post({ type: 'engine', engine: 'wllama', detail: WLLAMA_FILE });
  } catch (e) {
    post({ type: 'engine', engine: 'none', detail: `no engine available: ${String(e).slice(0, 120)}` });
  }
}

async function ensureEmbeddings(): Promise<void> {
  if (!embedder) embedder = await pipeline('feature-extraction', EMBED_MODEL);
  if (!corpus) {
    const buf = await fetch(embeddingsUrl).then((r) => r.arrayBuffer());
    const { loadCorpus } = await import('./retrieve');
    corpus = loadCorpus(chunksJson as ChunkRecord[], buf);
  }
}

async function generateWebGPU(prompt: { system: string; user: string }): Promise<{ tokens: number; elapsedMs: number }> {
  const start = performance.now();
  let tokens = 0;
  cancelled = false;
  const stream = await mlc!.chat.completions.create({
    messages: [
      { role: 'system', content: prompt.system },
      { role: 'user', content: prompt.user },
    ],
    stream: true,
    stream_options: { include_usage: true },
    max_tokens: 512,
    temperature: 0.6,
  });
  for await (const chunk of stream) {
    if (cancelled) break;
    const delta = chunk.choices[0]?.delta?.content ?? '';
    if (delta) {
      tokens++;
      post({ type: 'token', t: delta });
    }
  }
  return { tokens, elapsedMs: performance.now() - start };
}

async function generateWllama(prompt: { system: string; user: string }, maxTokens: number): Promise<{ tokens: number; elapsedMs: number }> {
  const start = performance.now();
  let tokens = 0;
  cancelled = false;
  await wllama!.createChatCompletion({
    messages: [
      { role: 'system', content: prompt.system },
      { role: 'user', content: prompt.user },
    ],
    max_tokens: maxTokens,
    temperature: 0.6,
    stream: true,
    onData: (chunk) => {
      if (cancelled) return;
      const delta = chunk.choices?.[0]?.delta?.content ?? '';
      if (delta) {
        tokens++;
        post({ type: 'token', t: delta });
      }
    },
  } as never);
  return { tokens, elapsedMs: performance.now() - start };
}

async function ask(q: string): Promise<void> {
  try {
    await ensureEmbeddings();
    const out = await embedder!(q, { pooling: 'mean', normalize: true });
    const qemb = Float32Array.from(out.data as Float32Array);
    const hits = retrieve(qemb, corpus!, 4);
    const { mode } = route(hits);
    const vadapt = (h: typeof hits[number]) =>
      mlc ? h : { ...h, text: h.text.slice(0, WLLAMA_HIT_CHARS) };
    if (mode === 'rag') {
      const prompt = buildRagPrompt(q, hits.map(vadapt), PERSONA_SYSTEM);
      const gen = mlc
        ? await generateWebGPU(prompt)
        : await generateWllama(prompt, 160);
      const cited = hits
        .filter((h) => h.score >= RAG_THRESHOLD)
        .slice(0, 3)
        .map((h) => ({ path: h.path, anchor: h.anchor }));
      post({
        type: 'done',
        cited,
        stats: {
          tps: gen.elapsedMs > 0 ? gen.tokens / (gen.elapsedMs / 1000) : 0,
          prompt_tokens: Math.ceil(prompt.user.length / 4),
          model: mlc ? MODEL_ID : WLLAMA_FILE,
        },
      });
    } else {
      const prompt = buildGeneralPrompt(q, GENERAL_SYSTEM);
      const gen = mlc
        ? await generateWebGPU(prompt)
        : await generateWllama(prompt, 160);
      post({
        type: 'done',
        cited: [],
        stats: {
          tps: gen.elapsedMs > 0 ? gen.tokens / (gen.elapsedMs / 1000) : 0,
          prompt_tokens: Math.ceil(prompt.user.length / 4),
          model: mlc ? MODEL_ID : WLLAMA_FILE,
        },
      });
    }
  } catch (e) {
    post({ type: 'error', detail: String(e).slice(0, 200) });
  } finally {
    generating = false;
  }
}

self.onmessage = (ev: MessageEvent) => {
  const msg = ev.data;
  switch (msg.type) {
    case 'init':
      void init(msg.force);
      break;
    case 'ask':
      if (generating) break;
      generating = true;
      void ask(msg.q);
      break;
    case 'cancel':
      cancelled = true;
      break;
  }
};
