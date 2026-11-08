---
title: 'SQL2NL'
blurb: 'Fine-tuned Llama 3.2 3B small language model that translates analytical SQL into plain-language business logic — a Q4_K_M GGUF published on Hugging Face, served with FastAPI + llama.cpp, and scored by a reproducible evaluation harness.'
metrics:
  - label: 'Fine-tune'
    value: 'QLoRA, under 1 GPU-hour (Kaggle T4)'
  - label: 'Held-out eval'
    value: '6/8 passed · 0.74 semantic similarity'
stack:
  - Python
  - Llama 3.2 3B
  - Unsloth
  - QLoRA
  - TRL
  - llama.cpp
  - FastAPI
  - Ollama
  - Hugging Face Hub
repoUrl: 'https://github.com/Gaurav-shinde2207/SQL2NL'
---

Fine-tuned Llama 3.2 3B Instruct with QLoRA on 150 SQL-to-explanation examples covering
CTEs, window functions, and JOINs — trained in under 1 GPU-hour on a Kaggle T4 and
exported to a ~2 GB Q4_K_M GGUF model, published at
huggingface.co/ShindeGaurav-207/SQL2NL and served through FastAPI with llama.cpp/Ollama.

Quality is measured, not asserted: a keyword-coverage, MiniLM semantic-similarity, and
latency harness scores held-out queries — 6/8 passed with 0.74 average semantic
similarity and 65.1% keyword coverage. pytest tests and GitHub Actions CI keep the
pipeline reproducible end to end.
