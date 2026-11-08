# One-page redesign (Ravindra-style editorial, not copied)

User approval 2026-11-08: "start making changes in animation and make it just 1 page website like the example I've provided."

## Intent
Single-page cinematic AI engineer portfolio for recruiters; user approved animation pack 1+3+5+7+9 (split-text hero, rolling stat counters, scroll-drawn SVG pipelines per project, magnetic CTA, underline draw) plus baseline staggered fade-up (4). Ravindra site (ravindra-portfolio-v1.web.app) studied: pure black rgb(0,0,0), warm cream rgb(222,219,200), Almarai font, ~137px hero h1, anchor nav, per-project content spine, grain, bg video. We copy the editorial *spirit*, not his effects: no background video, no grain (unless asked later), scroll-drawn diagrams instead of click-expandable.

## Decisions
- Keep Astro/React islands/GSAP/Framer Motion stack, Firebase hosting, resume.json as data source.
- index.astro = the one-pager: Hero, About (identity paragraph), Projects (3 deep stages: SQLmind, SQL2NL, FinSight + 2 secondary rows: CafeMind, customer-churn-ml-api), Experience (TCS), Skills (grouped buckets), Contact closing (email promise, copy-email, GitHub/LinkedIn/résumé link).
- Static text lives in src/data/onep.ts (typed, repo-gated by tests); Astro reads it, GSAP animates it.
- Keep routes: /ask-gaurav/ (chat), /resume/ (print artifact), /self-test/ (hidden). DELETE /projects/ and /contact/ routes.
- RAG citations repoint to in-page anchors: project chunk anchors prefixed with repo slug at build (anchor `sqlmind-intro` etc.), corpus entry paths become '/' — Chat links scroll the one-pager. Resume anchors unchanged (summary/skills/experience/education/contact) and one-pager sections carry those ids.
- Fonts: Almarai via Google Fonts (display swap). Tokens: `--bg:#000`, `--ink:#dedbc8`, keep accent green #00e5a0 for interactive/animated elements.

## Constraints
- Every animation <= 1s, max 2 signature effects per section; prefers-reduced-motion disables all (opacity 1, strokes full); Lighthouse mobile perf >= 90 (currently 100, must not fall far); key text in HTML (no JS-only content).
- Only GitHub projects (user directive): repoUrls must be github.com/Gaurav-shinde2207/<known repo>.

## Anti-goals
No framework rewrite, no bg video/autoplay media, no copy of the example site's exact markup/labels, no third-party heavy libs beyond what's installed.
