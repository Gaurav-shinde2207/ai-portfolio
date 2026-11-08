// One-page portfolio copy. Repo-gated by src/data/data.test.ts — every
// repoUrl must be github.com/Gaurav-shinde2207/<known repo>.

export type PipelineNode = { label: string; note?: string };

export type Stage = {
  key: string;
  title: string;
  tagline: string;
  dates: string;
  status: string;
  stack: string[];
  kpis: { value: string; label: string }[];
  problem: string;
  build: string;
  outcomes: string[];
  repoUrl: string;
  demoUrl?: string;
  pipeline: PipelineNode[];
  secondary?: false;
};

export type Row = {
  key: string;
  title: string;
  tagline: string;
  note: string;
  repoUrl: string;
  demoUrl?: string;
  secondary: true;
};

export const HERO_NAME = 'Gaurav Shinde';
export const HERO_PROMISE =
  'AI Engineer — I ship grounded RAG, fine-tuned small models, and a portfolio that runs a real LLM in your browser.';
export const IDENTITY =
  'Built it. Broke it. Now I decide. Every system on this page is evaluated, not asserted — accuracy numbers, refusal behavior, and the honest negative results are all reported out loud.';

export const STATS = [
  { value: 75, suffix: '%', label: 'bank service-desk requests resolved without analyst escalation' },
  { value: 60.7, suffix: '%', label: 'SQLMind execution accuracy on held-out questions' },
  { value: 8, prefix: '6/', label: 'SQL2NL held-out queries passed', display: '6/8' },
  { value: 4, suffix: '', label: 'AI systems shipped end-to-end with evaluation harnesses', display: '4' },
];

export const PROJECTS: Stage[] = [
  {
    key: 'sqlmind',
    title: 'SQLMind',
    tagline: 'Self-correcting text-to-SQL agent',
    dates: '2025',
    status: 'Public repo — architecture and full evaluation in the open.',
    stack: ['LangGraph', 'Groq', 'SQLite', 'FastAPI', 'Sentence Transformers'],
    kpis: [
      { value: '60.7%', label: 'execution accuracy, 28 held-out questions' },
      { value: '×3', label: 'bounded self-correction retries' },
      { value: 'STRIDE', label: 'threat model with SQL allowlisting' },
    ],
    problem:
      'Business teams need data, not SQL. Service analysts translate every request by hand, and generated SQL is trusted blindly or not at all — nobody ships text-to-SQL without a story about wrong queries and database safety.',
    build:
      'A LangGraph agent turns natural language into SQL: intent parsing, few-shot example retrieval, generation, execution and validation, then up to 3 bounded self-correction retries — exposed as CLI and FastAPI. Security is designed in, not bolted on: SELECT/WITH-only statement gate, read-only connection, LIMIT guard, query timeout, and a STRIDE threat model covering cache poisoning.',
    outcomes: [
      '60.7% baseline execution accuracy on 28 leakage-controlled Chinook questions; nested queries were the weakest class (28.6%).',
      'Correction memory showed no measurable gain (overlapping 95% CIs) — the honest negative result ships in the repo.',
      '150 offline tests plus a hard security gate make the agent safe to point at a real database.',
    ],
    repoUrl: 'https://github.com/Gaurav-shinde2207/SQLmind',
    pipeline: [
      { label: 'Question', note: 'natural language in' },
      { label: 'Intent parse' },
      { label: 'Example retrieval' },
      { label: 'SQL generate' },
      { label: 'Execute + validate', note: 'SELECT/WITH-only gate' },
      { label: 'Self-correct ×3' },
    ],
  },
  {
    key: 'sql2nl',
    title: 'SQL2NL',
    tagline: 'Fine-tuned small model: SQL → plain business language',
    dates: '2025',
    status: 'Weights public on Hugging Face (ShindeGaurav-207/SQL2NL).',
    stack: ['Llama 3.2 3B', 'Unsloth', 'QLoRA', 'TRL', 'llama.cpp', 'FastAPI', 'Ollama'],
    kpis: [
      { value: '6/8', label: 'held-out queries passed' },
      { value: '0.74', label: 'MiniLM semantic similarity' },
      { value: '<1 hr', label: 'QLoRA fine-tune on a Kaggle T4' },
    ],
    problem:
      'Analytical SQL is write-only for most stakeholders: a correct query still needs a human to explain what it actually computes before anyone trusts the number on the dashboard.',
    build:
      'Fine-tuned Llama 3.2 3B Instruct with QLoRA on 150 SQL-to-explanation examples covering CTEs, window functions, and JOINs — trained in under one GPU-hour. The ~2 GB Q4_K_M GGUF model is published on Hugging Face and served through FastAPI with llama.cpp/Ollama, with pytest tests and GitHub Actions CI.',
    outcomes: [
      '6/8 held-out queries passed with 0.74 average semantic similarity and 65.1% keyword coverage.',
      'Evaluation measures keyword coverage, MiniLM similarity, and latency — reproducible end-to-end from the repo.',
      'A small, quantized model does the job — no API keys, no cloud requirement.',
    ],
    repoUrl: 'https://github.com/Gaurav-shinde2207/SQL2NL',
    pipeline: [
      { label: 'SQL query in', note: 'CTEs, windows, JOINs' },
      { label: 'Fine-tuned 3B', note: 'Q4_K_M GGUF' },
      { label: 'Plain-language explanation' },
      { label: 'Eval harness', note: 'coverage · similarity · latency' },
    ],
  },
  {
    key: 'finsight',
    title: 'FinSight',
    tagline: 'Financial document Q&A with grounded RAG',
    dates: '2025',
    status: 'Public repo — evaluation endpoint ships in the API.',
    stack: ['FastAPI', 'Streamlit', 'ChromaDB', 'BGE', 'PyMuPDF', 'Groq (Llama 3.1 8B)', 'RAGAS', 'Docker Compose'],
    kpis: [
      { value: 'RAGAS', label: 'faithfulness + NDCG@k retrieval metrics' },
      { value: '0', label: 'LLM calls when context is insufficient' },
      { value: '3-level', label: 'file / page / section citations' },
    ],
    problem:
      'Financial Q&A cannot afford one hallucinated number. RAG demos look great until a recruiter asks what happens when retrieval comes back empty — most systems answer anyway.',
    build:
      'End-to-end RAG: PDF upload, page-level extraction with PyMuPDF, section-aware overlapping chunks, BGE embeddings in persistent ChromaDB, and grounded generation behind REST APIs (FastAPI + Streamlit, Docker Compose). Every answer carries file/page/section citations and similarity scores.',
    outcomes: [
      'When no relevant chunk is retrieved, FinSight returns an insufficient-context response instead of calling the LLM.',
      'RAGAS metrics, NDCG@k, and deterministic sentence-level hallucination detection run in a benchmark runner that flags faithfulness regressions.',
      'Evaluation is a first-class endpoint: GET /evaluate, not a notebook.',
    ],
    repoUrl: 'https://github.com/Gaurav-shinde2207/finsight-financial-rag-system',
    pipeline: [
      { label: 'PDF upload' },
      { label: 'Page-level extraction', note: 'PyMuPDF' },
      { label: 'Section-aware chunks' },
      { label: 'BGE → ChromaDB' },
      { label: 'Grounded answer', note: 'citations attached' },
    ],
  },
];

export const SECONDARY: Row[] = [
  {
    key: 'cafemind',
    title: 'CafeMind',
    tagline: 'AI cafe platform — Gemini chat ordering',
    note: 'Live demo on Cloud Run.',
    repoUrl: 'https://github.com/Gaurav-shinde2207/CafeMind',
    demoUrl: 'https://cafemind-frontend-889599586116.asia-south1.run.app',
    secondary: true,
  },
  {
    key: 'customer-churn',
    title: 'Customer Churn ML API',
    tagline: 'Churn prediction served over FastAPI',
    note: 'Dockerized ML pipeline.',
    repoUrl: 'https://github.com/Gaurav-shinde2207/customer-churn-ml-api',
    secondary: true,
  },
];

export const SKILLS_BUCKETS: { name: string; items: string[] }[] = [
  { name: 'Modeling & fine-tuning', items: ['Llama 3.1/3.2', 'SLMs', 'LoRA/QLoRA', 'Unsloth', 'TRL', 'GGUF', 'llama.cpp', 'Ollama'] },
  { name: 'Retrieval & RAG', items: ['ChromaDB', 'Sentence Transformers', 'BGE', 'Semantic search', 'Citation-grounded generation'] },
  { name: 'Agents & orchestration', items: ['LangChain', 'LangGraph', 'Tool calling', 'Self-correction loops', 'Text-to-SQL'] },
  { name: 'Evaluation & safety', items: ['RAGAS', 'NDCG', 'Execution accuracy', 'Hallucination detection', 'Leakage control', 'STRIDE threat modeling'] },
  { name: 'MLOps & serving', items: ['Python', 'PyTorch', 'FastAPI', 'Docker', 'GitHub Actions', 'pytest'] },
  { name: 'Interfaces', items: ['In-browser LLM (WebLLM/wllama)', 'TypeScript', 'Astro', 'React'] },
];

export const EMAIL_PROMISE =
  'Hiring for an AI engineer role? This page tells you what I do. My inbox tells you how fast I work — one email gets a reply within a day.';
