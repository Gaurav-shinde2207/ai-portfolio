# AI-Engineer Portfolio ("Ask-Gaurav") Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a deployed, animated personal portfolio for an AI-engineer role, whose flagship is an in-browser RAG assistant ("Ask-Gaurav"): local embeddings retrieval + WebLLM generation, streaming, cited, with hardware fallbacks and an in-browser eval self-test.

**Architecture:** Astro static site (Firebase free-tier hosting). Content chunks + chunk embeddings precomputed at build time (transformers.js all-MiniLM-L6-v2) and shipped as small data files. At runtime a Web Worker embeds the visitor question, cosines against chunk vectors, routes high-score hits to a grounded RAG prompt or otherwise to a general-AI persona prompt, and streams generation from WebLLM (WebGPU) with wllama (WASM) and canned-answer fallbacks. UI is React islands over a GSAP-animated dark terminal aesthetic.

**Tech Stack:** Astro (static output), React islands, Tailwind v4, GSAP ScrollTrigger, Framer Motion, Lottie web, @mlc-ai/web-llm, @huggingface/transformers, @wllama/wllama, Vitest, Firebase Hosting.

**Spec:** `docs/superpowers/specs/2026-11-08-ai-portfolio-design.md` (approved in-session; record alongside plan before Task 1 commit).

## Global Constraints

- All dependencies installed into the project's local `node_modules` only. Never global/cwd-outside installs. Node ≥ 20.
- All site copy and all code comments in English. No other languages anywhere in the repo.
- No secrets, API keys, or tokens in any file, log, or commit. Model weights and `node_modules` never committed (`.gitignore` from Task 1 covers both).
- Runtime LLM load must be user-gesture-gated; never auto-download weights on page load.
- `prefers-reduced-motion` respected by every animation (GSAP + particles + typing).
- Performance budget: Lighthouse mobile ≥ 90 (perf + a11y) on non-chat pages; hero canvas limited to hero section; chat island lazy-loaded.
- Component/theme: dark terminal aesthetic, accent gradient, monospace accents. Consistent across pages.
- Every step's test commands run inside `D:\ai-portfolio`.

## Review Focus

Uncovered input classes most likely to bite; each has a pinning test in its owning task:

1. **Low retrieval score** (visitor asks an unrelated/general question) → must route to the general-AI prompt, never force-ground an irrelevant chunk. Pinned in Task 6.
2. **No WebGPU / worker crash** (Safari, Firefox, weak GPU) → assistant must fall back: wllama first, then canned answers, never a blank UI. Pinned in Task 8.
3. **First-visit weight download** (600–900 MB, slow networks) → visitor sees explicit consent + progress; cancel leaves site fully usable. Pinned in Task 7.
4. **Hiring intent questions** ("how do I contact you", "can you do X") → assistant must surface the real email and résumé link from grounded chunks, not hallucinate contacts. Pinned in Tasks 4 + 6.
5. **Mobile scroll jank / LCP regression** from islands and animations → budget gate in Task 10 (Lighthouse run proves it).

---

### Task 1: Scaffold Astro + tooling + design tokens

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/styles/global.css` (Tailwind v4 `@import "tailwindcss"` + CSS custom properties for theme), `src/layouts/BaseLayout.astro`, `src/pages/index.astro` (placeholder hero), `.gitignore`, `firebase.json` (`{ "hosting": { "public": "dist", "ignore": ["firebase.json", "**/.*", "**/node_modules/**"] } }`)
- Init: git repo, npm project.

**Interfaces:**
- Produces: `BaseLayout.astro` accepts `{ title: string, description?: string }` and renders `<slot/>` with global stylesheet; theme tokens defined in `src/styles/global.css`: `--bg`, `--surface`, `--accent`, `--accent-2`, `--text`, `--muted`, `--font-mono`.

- [ ] **Step 1:** `npm create astro@latest` (minimal, TypeScript, strict) in `D:\ai-portfolio`; add `@astrojs/react @tailwindcss/vite tailwindcss react react-dom` — local node_modules only.
- [ ] **Step 2:** Configure `astro.config.mjs`: `output: 'static'`, React + Tailwind vite plugin.
- [ ] **Step 3:** Write tokens + `BaseLayout.astro` + placeholder `index.astro`. Verify: `npm run dev` serves placeholder at `localhost:4321`.
- [ ] **Step 4:** `git init`, `.gitignore` (node_modules, dist, .astro, *.bin weights), first commit: `feat: scaffold astro project`.

### Task 2: Content + data layer (case studies, résumé, persona prompts)

**Files:**
- Create: `src/content/projects/*.md` (Astro content collections, schema: `title, blurb, metrics[] {label,value}, stack[], demoUrl?, repoUrl?`), `src/data/resume.json` (email = shindegaurav2201@gmail.com; GitHub = Gaurav-shinde2207), `src/data/persona.ts` exporting `PERSONA_SYSTEM: string` (AI-engineer persona, grounded-mode rules: cite-only-from-context, contact-question rule → real email + résumé link, refusal rule for unrelated-person questions) and `GENERAL_SYSTEM: string` (same persona, ungrounded general-AI answers).

**Interfaces:**
- Produces: typed content collection `projects`; `resume.json` shape `{email, github, linkedin, summary, skills[], experience[] }`; `PERSONA_SYSTEM`, `GENERAL_SYSTEM` strings.
- Test: `npm test` verifies content schema loads ≥ 1 project and resume.json parses with required keys.

- [ ] **Step 1:** Write Vitest test `src/data/data.test.ts` asserting: collection loads ≥1 project with required frontmatter; `resume.json` contains `email` and `github` keys.

### Task 3: Hero + scroll animation system

**Files:**
- Create: `src/components/Hero.astro` (terminal-style typing intro + `<canvas>` neural-node field, cursor-reactive), `src/components/ScrollReveal.astro` wrapper, `src/lib/gsap-init.ts`, `src/components/ReducedMotion` handling in `gsap-init.ts`.
- Modify: `src/pages/index.astro` to use Hero.

**Interfaces:**
- Produces: `gsap-init.ts` exports `initScrollReveal(): void` selecting `[data-reveal]` elements (fade-up on scroll, once). Hero canvas: degrades to static gradient when `matchMedia('(prefers-reduced-motion: reduce)')` or no WebGL-ish canvas context.
- Verify: dev run — typing works once (not in a loop), particles only inside hero, system-wide reduced-motion shows static hero.

- [ ] **Step 1:** Implement `gsap-init.ts` + ScrollReveal (register ScrollTrigger from `gsap` npm package; this is DOM-only animation, verified by browser, no unit test).

### Task 4: Projects index + case-study pages + résumé + contact

**Files:**
- Create: `src/pages/projects/index.astro` (cards with metric badges, live-demo + GitHub links), `src/pages/projects/[slug].astro` (case-study layout), `src/pages/resume.astro` (print-friendly + PDF download anchor), `src/pages/contact.astro` (mailto + email in header of BaseLayout).
- Modify: `BaseLayout.astro` — fixed left nav (desktop) / collapsed top bar (mobile), email link always visible in header.
- Exclude: chat page ships in Task 8; nav reserves the "Ask-Gaurav" item but can 404-guard until then (disable pointer until route exists — remove guard in Task 8).

- [ ] **Step 1:** Implement pages from content schema of Task 2 (each project: 2 links — live demo + GitHub — when present in data).
- [ ] **Step 2:** Verify: `npm run build && npm run preview`, `/projects`, `/projects/<slug>`, `/resume`, `/contact` all 200; nav works.

### Task 5: Content chunker + embeddings build step

**Files:**
- Create: `src/rag/chunk.ts` (pure), `src/rag/build-chunks.mjs` (build-time script), `src/data/chunks.json` + `src/data/embeddings.bin` (generated, git-ignored? No — small, committed).
- Test: `src/rag/chunk.test.ts`.

**Interfaces:**
- `splitIntoChunks(text: string, opts {maxChars: 800}): Chunk[]` where `Chunk = { id: string, anchor: string, text: string }` — headings become anchors (`#-slug`), paragraphs grouped under 800 chars, never splitting a sentence.
- `build-chunks.mjs`: reads content collections + resume.json → writes `chunks.json` (`Chunk[]` + derived `{id, anchor, path}`), computes embeddings via `@huggingface/transformers` (`feature-extraction`, `all-MiniLM-L6-v2`, dim 384) → concatenated `Float32Array` serialized to `embeddings.bin`; deterministic ordering by `chunks.json` index.

- [ ] **Step 1:** Write failing test: `splitIntoChunks("# About\nLong para...\n\n# Contact\nShort")` returns 2 chunks with correct `anchor`s ("about", "contact") and no chunk > 800 chars.
- [ ] **Step 2:** Run: `npm test -- chunk` → FAIL.
- [ ] **Step 3:** Implement `splitIntoChunks` → PASS.
- [ ] **Step 4:** Add `npm run build:data` = `node src/rag/build-chunks.mjs`; run once, verify `chunks.json` + `embeddings.bin` exist, `chunk.id` count matches embedding vector count (count = bytes/4/384), commit data files.

### Task 6: Retrieval + router + prompt builders (pure, worker-ready)

**Files:**
- Create: `src/rag/types.ts` (`Corpus`, `RetrievalHit`), `src/rag/retrieve.ts`, `src/rag/router.ts`, `src/rag/prompts.ts`, `src/data/evals.json` (20 items `{q, expectedKeywords: string[]}`, mix grounded + general).
- Test: `src/rag/retrieve.test.ts`, `src/rag/router.test.ts`, `src/rag/prompts.test.ts` (pure — no model loading in tests; embed a few real chunks offline-by-hand vectors are fine: use deterministic fake vectors).

**Interfaces:**
- `loadCorpus(chunksJson, embBin): Corpus` — parses bin into `Float32Array` matrix (implementer chooses exact storage; final dim must be 384).
- `cosineSimilarity(a: Float32Array, b: Float32Array): number`.
- `retrieve(queryEmb: Float32Array, corpus: Corpus, k = 4): RetrievalHit[]` desc-by-score.
- `route(thits: RetrievalHit[]): {mode: 'rag'|'general', hits: RetrievalHit[]}` — RAG iff `top1 ≥ 0.35` (constant exported as `RAG_THRESHOLD`), else general.
- `buildRagPrompt(question: string, hits: RetrievalHit[], persona: string): {system: string, user: string}` — context = hit texts verbatim, cite instruction with `path#anchor`s.
- `buildGeneralPrompt(question: string, persona: string)` — same shape, no context.

- [ ] **Step 1:** Write failing tests: cosine of identical vector = 1; retrieve returns ≤ k, sorted desc; router general when top1 < 0.35; router rag when top1 ≥ 0.35; `buildRagPrompt` includes hit anchor strings verbatim; general prompt excludes context.
- [ ] **Step 2:** Run tests → FAIL. Implement → PASS → commit.

### Task 7: Assistant Worker + WebLLM engine + consent gate + streaming UI

**Files:**
- Create: `src/rag/assistant.worker.ts` (raw postMessage protocol), `src/components/AskGaurav/Chat.tsx` (React island), `src/components/AskGaurav/ConsentGate.tsx` (explicit "Download ~800 MB model, cached forever" + progress + cancel), `src/components/AskGaurav/Citations.tsx`, `src/pages/ask-gaurav.astro`, `src/stores/askState.ts` (tiny pub-sub or React state; implementer picks).
- Add deps: `@mlc-ai/web-llm` + `@huggingface/transformers` (runtime, already in Task 5).

**Interfaces (postMessage protocol, both directions as string-literal `type`):**
- Main → worker: `{type:'init'}` → worker replies `{type:'engine', engine:'webgpu'|'wllama'|'none', detail: string}`; `{type:'ask', q: string}` → worker streams `{type:'token', t}`, then `{type:'done', cited: Citations, stats: {tps, prompt_tokens, model}}` or `{type:'error', detail}`; `{type:'cancel'}`.
- Worker pipeline on `ask`: embed q (MiniLM) → `retrieve` → `route` → build prompt → stream from engine; `RAG_THRESHOLD` and citation click → `location.hash` scroll to section anchor.
- Chat UI: streaming typewriter into bubbles, stats line under answer, citations clickable.

- [ ] **Step 1:** Wire worker with engine init behind `ConsentGate` (user gesture starts `init`); on choice: WebLLM first (`@mlc-ai/web-llm`, model id pinned: `Llama-3.2-1B-Instruct-q4f16_1-MLC`), wllama fallback when `PrebuiltModelList` none? Pin: WebGPU availability check → `wllama` (`@wllama/wllama`) w/ tiny model → else `"engine: 'none'"`.
- [ ] **Step 2:** Implement `ask` path using Task 6 interfaces; on `error` or `engine:'none'` Chat.tsx shows 3 hand-written canned answers (pinned in `src/data/canned.json`) + honest message.
- [ ] **Step 3:** Browser verify: with dev server, gate appears; consent → progress → ask "What did Gaurav build with metrics?" streams a grounded answer with working citation; ask "Explain attention in transformers" routes general (no citations); stats line shows model name + tps.

### Task 8: Evals self-test page

**Files:**
- Create: `src/pages/self-test.astro` + island `src/components/AskGaurav/SelfTest.tsx`, `src/rag/score.ts` (pure).
- Test: `src/rag/score.test.ts`.

**Interfaces:**
- `scoreAnswer(answer: string, expectedKeywords: string[]): boolean` — every keyword present (case-insensitive, whole keyword as substring lowercased both sides).
- SelfTest runs each `evals.json` question through the live pipeline (worker already from Task 7), prints table q → pass/fail → final pass rate %.

- [ ] **Step 1:** Failing test: `scoreAnswer("cut Outlook boot time 32%", ["outlook","32%"]) === true`, missing keyword → false → implement → pass → commit.
- [ ] **Step 2:** Build page; verify in browser after consent: 20 evals run, pass rate shown (target ≥ 80%, else tune prompts — traffic allowed in this task only).

### Task 9: Mobile + accessibility + Lighthouse pass

- [ ] **Step 1:** Compress gestures to tap-targets ≥44 px, nav collapses, citations scroll work on touch.
- [ ] **Step 2:** `npx lighthouse http://localhost:4321/ --preset=desktop --form-factor=mobile` — perf + a11y ≥ 90 (check first run can be re-run until pass).
- [ ] **Step 3:** Commit.

### Task 10: Firebase deploy + repo push

**Files:**
- Create: `.firebaserc` (project placeholder — user must supply project id at this task; may be replaced from prompt), plus `firebase.json` from Task 1.

- [ ] **Step 1:** `npm run build` clean pass → `dist/` correct.
- [ ] **Step 2:** `npx firebase login` (user) → `firebase init hosting` (pick existing or new project) → `firebase deploy --only hosting` → live URL.
- [ ] **Step 3:** `git remote add origin https://github.com/Gaurav-shinde2207/ai-portfolio.git`, push main.
