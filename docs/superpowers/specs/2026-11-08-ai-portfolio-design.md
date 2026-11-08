# AI-Engineer Portfolio — Design

**Intent:** Get Gaurav hired as an AI engineer, fast. Site must look and behave like an AI engineer built it: dark terminal aesthetic, real local AI running in the visitor's browser, measurable engineering everywhere.

**Goals**
- Deployed on Firebase Hosting free tier, custom URL live for recruiters.
- Flagship: "Ask-Gaurav" in-browser RAG assistant — retrieval over site content, streaming local LLM answers, clickable citations, tokens/sec stats.
- General AI questions route to ungrounded persona mode; personal questions are grounded with citations.
- Scroll animations (GSAP), typing hero, neural-node canvas — subtle, fast, reduced-motion safe.
- Every project: live demo link + GitHub link + a number ("cut X 32%").
- In-browser eval self-test page showing a live pass-rate table.

**Non-goals / anti-goals**
- No server-side LLM, no API keys, no login-gated anything.
- No Awwwards-tier WebGL that breaks weak GPUs or mobile.
- No Fancy animations that delay LCP or fire on reduced-motion systems.

**Constraints**
- Astro static export; classic Firebase Hosting (`firebase deploy`). Next.js SSR path closed to new users.
- LLM load user-gesture-gated (600–900 MB, cached); explicit consent UI with progress; cancel leaves site usable.
- Fallback ladder: WebLLM/WebGPU → wllama/WASM → canned hand-written answers. Never blank UI.
- Contact = shindegaurav2201@gmail.com; GitHub = Gaurav-shinde2207.
- All content/comments English only. No secrets in repo.

**Decided**
- Stack: Astro + React islands + Tailwind v4 + GSAP ScrollTrigger + Framer Motion (islands) + Lottie micro-animations.
- Models: primary Llama-3.2-1B-Instruct-q4f16_1-MLC (WebLLM); embeddings all-MiniLM-L6-v2 (transformers.js), 384-dim, precomputed at build.
- Retrieval threshold for grounded mode: cosine top-1 ≥ 0.35.
- Evals: 20 curated Q→keyword pairs live-scored in browser.
- Repo: github.com/Gaurav-shinde2207/ai-portfolio.

**Left to builder:** exact worker messaging ergonomics, Lottie scene files, copy tone beyond persona prompt, favicon/meta art.
