---
title: 'Heesch-Number Explainer Videos'
blurb: 'Manim-rendered math explainer videos with AI-generated voiceover — a research paper on Heesch numbers in 3D turned into a narrated, animated proof walkthrough.'
metrics:
  - label: 'Runtime'
    value: '52s polished draft in one session'
  - label: 'Videos'
    value: '2 explainer scenes'
stack:
  - Python
  - Manim 0.22
  - manim-voiceover
  - edge-tts
  - TinyTeX/LaTeX
  - FFmpeg
repoUrl: 'https://github.com/Gaurav-shinde2207'
---

A hybrid ThreeDScene + VoiceoverScene pipeline that turns dense math (Bašić,
"The Heesch number in E³ is unbounded", arXiv:2610.24281) into a narrated,
frame-checked animation. The second scene re-imagined the same math as a flat
vector "rings" visual with a dimension ladder and a big red No. card.

Rendering is fully scripted: portable TinyTeX for pdflatex, cached narration
mp3s for offline re-renders, and deterministic 480p15 drafts verified frame by
frame before any 1080p60 final.
