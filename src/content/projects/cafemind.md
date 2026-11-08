---
title: 'CafeMind'
blurb: 'AI-powered cafe ecosystem with Gemini chat ordering — a FastAPI backend, Cloud SQL, and a deployed Cloud Run service with a live demo you can use right now.'
metrics:
  - label: 'Live demo'
    value: 'Deployed on Cloud Run'
  - label: 'Serving'
    value: 'FastAPI + Cloud SQL'
stack:
  - Python
  - FastAPI
  - Google Gemini
  - Cloud Run
  - Cloud SQL
  - JavaScript
demoUrl: 'https://cafemind-721274091547.asia-south1.run.app'
repoUrl: 'https://github.com/Gaurav-shinde2207/CafeMind'
---

An end-to-end cafe platform where ordering happens through an AI chat agent built on
Google Gemini. The conversation layer is served by a FastAPI backend that talks to
Cloud SQL for state, and the whole thing runs as a Cloud Run service — a real,
publicly reachable deployment rather than a localhost demo.

The live URL above is the actual production service: send a message, and the agent
interprets the order, grounds it in menu data, and handles the back-and-forth.
