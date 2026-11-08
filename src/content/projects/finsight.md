---
title: 'FinSight — Financial RAG System'
blurb: 'End-to-end RAG over financial PDFs: section-aware chunking into persistent ChromaDB, citation-grounded answers, an insufficient-context fallback that refuses to call the LLM, and a RAGAS/NDCG@k evaluation with hallucination detection.'
metrics:
  - label: 'Retrieval'
    value: 'BGE + persistent ChromaDB, page-level citations'
  - label: 'Evaluation'
    value: 'RAGAS + NDCG@k + hallucination detection'
stack:
  - Python
  - FastAPI
  - Streamlit
  - ChromaDB
  - BGE
  - PyMuPDF
  - Groq (Llama 3.1 8B)
  - RAGAS
  - Docker Compose
repoUrl: 'https://github.com/Gaurav-shinde2207/finsight-financial-rag-system'
---

Grounded question-answering over financial documents: PDF upload, page-level extraction
with PyMuPDF, section-aware overlapping chunks, BGE embeddings into persistent ChromaDB,
and answer generation behind REST APIs (FastAPI + Streamlit UI, Docker Compose).

Every answer ships with file/page/section citations and similarity scores — and when no
relevant chunk is retrieved, the system returns an insufficient-context response instead
of calling the LLM. Evaluation is built in: RAGAS metrics, NDCG@k, deterministic
sentence-level hallucination detection, and a benchmark runner that flags faithfulness
regressions, exposed through a FastAPI /evaluate endpoint.
