export interface FlowStep {
  id: string;
  label: string;
  note?: string;
}

export interface EvalRow {
  label: string;
  value: string;
  context?: string;
}

export interface Project {
  id: string;
  index: string;
  title: string;
  kind: 'agent' | 'finetune' | 'rag' | 'cafe';
  overview: string;
  tech: string[];
  flow: FlowStep[];
  highlights: string[];
  evaluation: EvalRow[];
  evalNarrative?: string;
  limitations: string[];
  github: string;
  demo?: string;
  hf?: string;
}

export const projects: Project[] = [
  {
    id: 'sqlmind',
    index: '01',
    title: 'SQLMind — Self-Correcting Text-to-SQL AI Agent',
    kind: 'agent',
    overview:
      'A LangGraph-based agent that translates natural-language questions into SQL queries, validates and executes them, and performs bounded self-correction on failure.',
    tech: ['LangGraph', 'Groq', 'SQLite', 'FastAPI', 'Sentence Transformers'],
    flow: [
      { id: 'n1', label: 'USER QUERY' },
      { id: 'n2', label: 'INTENT PARSING' },
      { id: 'n3', label: 'EXAMPLE RETRIEVAL' },
      { id: 'n4', label: 'SQL GENERATION' },
      { id: 'n5', label: 'SQL VALIDATION', note: 'allowlist gate' },
      { id: 'n6', label: 'DATABASE EXECUTION', note: 'read-only' },
      { id: 'n7', label: 'ERROR ANALYSIS' },
      { id: 'n8', label: 'BOUNDED CORRECTION', note: '≤ 3 retries' },
      { id: 'n9', label: 'FINAL RESPONSE' },
    ],
    highlights: [
      'Up to 3 bounded self-correction retries — no unbounded rewrite loops.',
      'SELECT/WITH-only SQL statement gate before anything reaches the database.',
      'Read-only database connection, LIMIT guard and query timeout.',
      'STRIDE threat model documented for the SQL execution surface.',
      '150 offline tests covering validator, executor and correction paths.',
    ],
    evaluation: [
      { label: 'Held-out set', value: '28', context: 'Chinook questions, leakage-controlled' },
      { label: 'Baseline accuracy', value: '60.7%' },
      { label: 'Retry-only', value: '57.1%' },
      { label: 'Retry + correction memory', value: '57.1%' },
      { label: 'Nested query accuracy', value: '28.6%', context: 'worst category' },
    ],
    evalNarrative:
      'Presented honestly: correction memory did not provide measurable improvement over retry-only — and retry-only did not beat the baseline, with overlapping confidence intervals. Self-correction is not free; the honest result is documented rather than hidden.',
    limitations: [
      'Retry-only self-correction did not beat the baseline (57.1% vs 60.7%).',
      'Nested queries are the weakest failure class at 28.6%.',
      'Evaluated on 28 held-out questions — small set, wide confidence intervals.',
    ],
    github: 'https://github.com/Gaurav-shinde2207/SQLmind',
  },
  {
    id: 'sql2nl',
    index: '02',
    title: 'SQL2NL — Fine-Tuned Small Language Model',
    kind: 'finetune',
    overview:
      'A fine-tuned small language model that translates SQL queries into understandable business-language explanations.',
    tech: ['Llama 3.2 3B', 'Unsloth', 'QLoRA', 'TRL', 'llama.cpp', 'FastAPI', 'Ollama'],
    flow: [
      { id: 'n1', label: 'DATASET', note: 'SQL ⇄ explanation pairs' },
      { id: 'n2', label: 'TOKENISATION' },
      { id: 'n3', label: 'QLoRA FINE-TUNING', note: 'Kaggle T4' },
      { id: 'n4', label: 'ADAPTER EXPORT' },
      { id: 'n5', label: 'GGUF CONVERSION', note: 'Q4_K_M' },
      { id: 'n6', label: 'MODEL SERVING', note: 'FastAPI · Ollama · llama.cpp' },
      { id: 'n7', label: 'EVALUATION' },
    ],
    highlights: [
      '1,500 SQL-to-explanation examples covering CTEs, JOINs and window functions.',
      'Training completed in under one GPU-hour on a Kaggle T4.',
      'Approximately 2 GB Q4_K_M GGUF artifact — runs locally via llama.cpp or Ollama.',
      'FastAPI model serving wrapper.',
      'pytest suite plus GitHub Actions CI.',
    ],
    evaluation: [
      { label: 'Held-out pass rate', value: '6 / 8' },
      { label: 'Semantic similarity', value: '0.774', context: 'MiniLM, held-out set' },
      { label: 'Keyword coverage', value: '65.1%' },
    ],
    limitations: [
      'Two of eight held-out queries still miss required business meaning.',
      'Keyword coverage 65.1% — paraphrase quality is subjective without human review.',
    ],
    github: 'https://github.com/Gaurav-shinde2207/SQL2NL',
    hf: 'https://huggingface.co/ShindeGaurav-2207/SQL2NL',
  },
  {
    id: 'finsight',
    index: '03',
    title: 'FinSight — Financial Document Intelligence',
    kind: 'rag',
    overview:
      'An end-to-end RAG application that processes financial PDFs and answers with citation-grounded generation — refusing to answer when context is insufficient.',
    tech: ['FastAPI', 'Streamlit', 'ChromaDB', 'BGE', 'PyMuPDF', 'Groq', 'RAGAS', 'Docker Compose'],
    flow: [
      { id: 'n1', label: 'PDF UPLOAD' },
      { id: 'n2', label: 'DOCUMENT EXTRACTION', note: 'PyMuPDF, page-level' },
      { id: 'n3', label: 'SECTION-AWARE CHUNKING' },
      { id: 'n4', label: 'EMBEDDING GENERATION', note: 'BGE' },
      { id: 'n5', label: 'VECTOR RETRIEVAL', note: 'persistent ChromaDB' },
      { id: 'n6', label: 'CONTEXT VALIDATION' },
      { id: 'n7', label: 'LLM GENERATION' },
      { id: 'n8', label: 'CITATION-GROUNDED ANSWER', note: 'file · page · section' },
    ],
    highlights: [
      'Page-level document extraction with section-aware overlapping chunks.',
      'Persistent ChromaDB storage — knowledge survives restarts.',
      'Every answer carries file, page and section citations with similarity scores.',
      'Insufficient-context refusal path: no LLM call when retrieval is weak.',
      'RAGAS evaluation with NDCG@k plus deterministic sentence-level hallucination detection.',
      'Evaluation regression checks prevent silent quality drift.',
    ],
    evaluation: [],
    evalNarrative:
      'Measured with RAGAS + NDCG@k retrieval metrics and a deterministic sentence-level hallucination detector — numbers live in the repository\'s evaluation suite rather than in a marketing banner.',
    limitations: [
      'Grounding quality depends on PDF section structure — badly structured documents degrade retrieval.',
      'No live public deployment; runs via Docker Compose.',
    ],
    github: 'https://github.com/Gaurav-shinde2207/finsight-financial-rag-system',
  },
  {
    id: 'cafemind',
    index: '04',
    title: 'CafeMind — AI-Powered Smart Café Ecosystem',
    kind: 'cafe',
    overview:
      'A full-stack AI-powered café ecosystem connecting customer discovery, conversational ordering, personalised preferences and kitchen operations.',
    tech: ['React 18', 'Vite', 'Tailwind CSS', 'FastAPI', 'Google Gemini', 'SQLAlchemy', 'PostgreSQL', 'Cloud SQL', 'Cloud Run'],
    flow: [
      { id: 'n1', label: 'CUSTOMER' },
      { id: 'n2', label: 'GEMINI CONVERSATIONAL ORDERING' },
      { id: 'n3', label: 'MENU RECOMMENDATIONS', note: 'taste · dietary · budget' },
      { id: 'n4', label: 'CUSTOMER CONFIRMATION' },
      { id: 'n5', label: 'SERVER VALIDATION', note: 'prices from DB' },
      { id: 'n6', label: 'ORDER CREATION' },
      { id: 'n7', label: 'SERVER DASHBOARD', note: 'dispatch + queue' },
      { id: 'n8', label: 'PREPARATION STATUS', note: 'wait-time estimate' },
      { id: 'n9', label: 'COMPLETION' },
    ],
    highlights: [
      'Conversational ordering with taste-preference profiles and dietary/allergen awareness.',
      'Budget-aware, database-grounded menu recommendations.',
      'Explicit customer order confirmation before anything is created.',
      'Server-side price validation — Gemini never sets prices.',
      'Live ticket tracking with dynamic kitchen wait-time estimation.',
      'AI operational insights plus feedback sentiment analysis.',
      'API credentials stay backend-side; Secret Manager stores secrets.',
      'Health endpoint checks application, database and Gemini state.',
    ],
    evaluation: [],
    evalNarrative:
      'Reliability engineering: production prevents silent SQLite fallback, prices and availability always come from the database, and the documented staff PIN is a UI-level demo gate — never advertised as enterprise security.',
    limitations: [
      'Documented staff PIN is a UI-level demo gate, not production-grade authentication.',
      'Conversational quality is bounded by the LLM provider; ordering state is server-authoritative.',
    ],
    github: 'https://github.com/Gaurav-shinde2207/CafeMind',
    demo: 'https://cafemind-721274091547.asia-south1.run.app',
  },
];
