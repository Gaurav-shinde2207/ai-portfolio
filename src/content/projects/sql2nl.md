---
title: 'SQL2NL'
blurb: 'Fine-tuned Llama 3.2 3B small language model that translates analytical SQL into plain-language business logic — served with FastAPI + llama.cpp and a reproducible evaluation harness.'
metrics:
  - label: 'Model'
    value: 'Llama 3.2 3B fine-tuned'
  - label: 'Serving'
    value: 'FastAPI + llama.cpp'
stack:
  - Python
  - PyTorch
  - Llama 3.2
  - llama.cpp
  - FastAPI
  - Hugging Face Hub
repoUrl: 'https://github.com/Gaurav-shinde2207/SQL2NL'
---

A fine-tuning project turning an open 3B-parameter model into a SQL explainer: given an
analytical query, it describes the business logic in plain language. The model is served
by a FastAPI app that streaming-serves through llama.cpp.

Weights auto-download from Hugging Face Hub on first run, and a reproducible evaluation
harness measures output quality on a held-out set — the same fine-tune can be re-trained
and re-scored end to end from the repo.
