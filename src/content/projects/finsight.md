---
title: 'FinSight — Financial RAG System'
blurb: 'Production-grade RAG over financial PDFs with citation-aware retrieval, hallucination detection, and evaluation metrics for grounded answers.'
metrics:
  - label: 'Retrieval'
    value: 'Citation-aware over financial PDFs'
  - label: 'Guardrails'
    value: 'Hallucination detection + eval metrics'
stack:
  - Python
  - LangChain
  - Vector store
  - LLM APIs
repoUrl: 'https://github.com/Gaurav-shinde2207/finsight-financial-rag-system'
---

Grounded question-answering over financial documents. Every answer is pinned to
citation-aware retrievals from the underlying PDFs, and a hallucination-detection layer
checks the generated text against the retrieved evidence before it reaches the user.

The repo includes an evaluation harness with explicit metrics, so retrieval quality and
answer grounding are measured, not asserted.
