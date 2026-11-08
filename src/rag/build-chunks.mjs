// Build-time generator for src/data/chunks.json + src/data/embeddings.bin.
// Run with: npm run build:data   (node >= 24: strips TS types natively)
import {
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from '@huggingface/transformers';
import { splitIntoChunks } from '../rag/chunk.ts';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');

const MAX_CHARS = 800;
const MODEL = 'Xenova/all-MiniLM-L6-v2';
const DIM = 384;

// ---------- corpus ----------
const corpus = []; // { id, anchor, path, text }

function add(mdText, path) {
  for (const chunk of splitIntoChunks(mdText, { maxChars: MAX_CHARS })) {
    corpus.push({ ...chunk, path });
  }
}

// projects: src/content/projects/*.md, path -> /projects/<id>/
const projectsDir = join(root, 'src', 'content', 'projects');
for (const name of readdirSync(projectsDir).sort()) {
  if (!name.endsWith('.md')) continue;
  const raw = readFileSync(join(projectsDir, name), 'utf8');
  const body = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
  add(body, `/projects/${name.replace(/\.md$/, '')}/`);
}

// resume: synthesized markdown, path -> /resume/
const resume = JSON.parse(readFileSync(join(root, 'src', 'data', 'resume.json'), 'utf8'));
const resumeMd = [
  '# Summary',
  resume.summary,
  '',
  '# Skills',
  resume.skills.map((s) => (s.endsWith('.') ? s : `${s}.`)).join(' '),
  '',
  '# Experience',
  ...resume.experience.map(
    (e) => `${e.role} (${e.org}, ${e.period}). ${e.detail}`
  ),
  '',
  '# Education',
  `${resume.education.degree} — ${resume.education.school}, ${resume.education.period}. Certification: ${resume.certification}.`,
  '',
  '# Contact',
  `Email: ${resume.email}. GitHub: https://github.com/${resume.github}. LinkedIn: ${resume.linkedin}. Location: ${resume.location ?? 'India'}.`,
].join('\n');
add(resumeMd, '/resume/');

// ---------- embeddings ----------
const extractor = await pipeline('feature-extraction', MODEL);
const vectors = [];
for (const chunk of corpus) {
  const output = await extractor(chunk.text, {
    pooling: 'mean',
    normalize: true,
  });
  vectors.push(Float32Array.from(output.data));
}

if (vectors.length !== corpus.length) {
  throw new Error(`embedding count ${vectors.length} != chunk count ${corpus.length}`);
}
for (const v of vectors) {
  if (v.length !== DIM) throw new Error(`embedding dim ${v.length} != ${DIM}`);
}

// ---------- write outputs ----------
const outJson = join(root, 'src', 'data', 'chunks.json');
const outBin = join(root, 'src', 'data', 'embeddings.bin');

writeFileSync(outJson, JSON.stringify(corpus, null, 2) + '\n');

const bin = new Float32Array(vectors.length * DIM);
for (let i = 0; i < vectors.length; i++) bin.set(vectors[i], i * DIM);
writeFileSync(outBin, Buffer.from(bin.buffer));

console.log(`chunks: ${corpus.length} -> ${outJson}`);
console.log(`embeddings: ${vectors.length} x ${DIM} float32 -> ${outBin}`);
