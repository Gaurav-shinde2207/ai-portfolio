---
title: 'SQLmind'
blurb: 'Self-correcting natural-language-to-SQL agent over SQLite Chinook — a LangGraph pipeline with intent parsing, bounded self-correction retries, hard security gates, and a leakage-controlled evaluation that reports the honest negative result.'
metrics:
  - label: 'Execution accuracy'
    value: '60.7% baseline on 28 held-out questions'
  - label: 'Safety'
    value: 'STRIDE threat model, SQL allowlisting'
stack:
  - Python
  - LangGraph
  - Groq
  - SQLite
  - FastAPI
  - Sentence Transformers
repoUrl: 'https://github.com/Gaurav-shinde2207/SQLmind'
---

A LangGraph agent turns natural language into SQL: intent parsing, example retrieval,
SQL generation, execution, validation, and up to 3 bounded self-correction retries,
exposed through both a CLI and a FastAPI endpoint.

Security is first-class: read-only SQL execution behind a SELECT/WITH-only statement
gate, a read-only database connection, a LIMIT guard, and a query timeout — with a
STRIDE threat model covering cache poisoning.

The evaluation is leakage-controlled on 28 held-out Chinook questions: baseline 60.7%,
retry-only 57.1%, retry plus correction memory 57.1% execution accuracy. Correction
memory gave no measurable gain (overlapping 95% CIs) and nested queries were weakest at
28.6% — both honest results reported, not hidden. 150 offline tests back the pipeline.
