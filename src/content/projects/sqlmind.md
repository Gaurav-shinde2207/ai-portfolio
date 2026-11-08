---
title: 'SQLmind'
blurb: 'Self-correcting natural-language-to-SQL agent over SQLite Chinook — a LangGraph pipeline with bounded retries, correction-memory few-shot retrieval, and a leakage-guarded evaluation that includes the honest negative result.'
metrics:
  - label: 'Pipeline'
    value: 'LangGraph with bounded retries'
  - label: 'Honesty'
    value: 'Leakage-guarded eval, all runs reported'
stack:
  - Python
  - LangGraph
  - SQLite
  - FastAPI
  - CLI
repoUrl: 'https://github.com/Gaurav-shinde2207/SQLmind'
---

Natural language goes in, correct SQL comes out — and when it does not, the agent
fixes itself. A LangGraph pipeline turns a question into SQL, runs it against the
Chinook dataset, and on failure retries with bounded attempts while retrieving few-shot
corrections from a replay memory of past mistakes.

The evaluation is leakage-guarded: baseline, retry, and correction-memory variants are
measured separately, and the honest negative result is reported in the repo. Two
interfaces ship in the same codebase: an interactive CLI and a FastAPI endpoint.
