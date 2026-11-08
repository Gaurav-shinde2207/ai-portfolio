# GAURAV.AI — Design Foundation

Single source of truth for the visual + interaction system of this repo
(D:\ai-portfolio, React 19 + TS + Vite + Tailwind v4 + GSAP).
Every new screen/component must derive from this document. When code and
this document disagree, fix the code.

---

## 1. Brand concept — "AI Systems Laboratory"

The site is presented as a **laboratory console**: dark, instrument-panel
precision, amber as the working-light color, cyan reserved for live data.
Copy is an instrument readout — mono labels, datasheet numbers — never
marketing adjectives. The differentiator is **documented honesty**: every
claim ships with its evaluation numbers, including results that did not
improve the system.

Persona rules baked into content:
- No availability claims ("available for work" never appears).
- No invented metrics. Numbers come from `src/data/*` only.
- Simulations are labeled `DEMO · SIMULATION` visibly, in copy.

## 2. Color tokens (Tailwind `@theme` in `src/styles/index.css`)

| Token          | Value     | Role                                                   |
| -------------- | --------- | ------------------------------------------------------ |
| `--color-bg`   | `#0B0D0F` | Page background (near-black, slight blue cast)         |
| `--color-bg-2` | `#111519` | Secondary surfaces, chips, secondary buttons           |
| `--color-panel`| `#171C20` | Cards / panels (`.panel`)                              |
| `--color-amber`| `#F5A623` | **Dominant accent.** CTAs, eyes, dots, highlights      |
| `--color-cyan` | `#39C6C8` | **Sparing accent.** Live/sim data values, status       |
| `--color-ink`  | `#EAE7DF` | Primary text (warm cream, not pure white)              |
| `--color-muted`| `#92999F` | Secondary text, labels                                 |
| `--color-line` | `#232A30` | ALL borders; 1px is the standard weight (`border-line`)|

Usage ratios (deliberate): ~95% of the page is bg/panel/ink/muted;
amber appears only on interaction + emphasis; cyan appears only on live
data values (annotation values, timeline location, link accent).
Selection color: amber bg, bg-dark text.

## 3. Typography

| Face           | Variable        | Loaded weights | Use                                  |
| -------------- | --------------- | -------------- | ------------------------------------ |
| Space Grotesk  | `font-display`  | 500/600/700    | Headlines, project titles, brand     |
| Inter          | `font-body`     | 400/500/600    | Body prose                           |
| JetBrains Mono | `font-mono`     | 400/500        | Labels, numbers, buttons, code-voice |

Google Fonts, preconnected, `display=swap` (see `index.html`).

Type scale in use:
- Hero h1: `clamp(2.6rem, 7.5vw, 5.5rem)` bold, leading 1.02, tracked tight
- Section h2: `text-3xl md:text-5xl` semibold
- Project h3: `text-2xl md:text-3xl` semibold
- Body: `text-sm md:text-base` + `text-muted`, leading relaxed
- `.tech-label`: mono 11px, tracking 0.14em, UPPERCASE — the section
  eyebrow / instrument label primitive
- Numbers in eval tables: mono, value in amber, context in muted

## 4. Spacing & layout

- Content shell: `max-w-7xl mx-auto px-5 md:px-8`
- Section rhythm: `py-24 md:py-32`, top border `border-t border-line`
- Two-column split: `lg:grid-cols-[7fr_5fr]` (prose : side panel)
- Alternating project stages: `lg:grid-cols-2`, `flip` swaps order
- Grid density baseline: 44px (`.grid-fade` cell) — keep on that rhythm
- Panels: `.panel` = bg-panel + 1px line border, `p-4`–`p-7`
- `section[id] { scroll-margin-top: 5.5rem }` — fixed-nav anchor offset

## 5. Component primitives (`@layer components`)

| Class           | Definition                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------ |
| `.panel`        | Card surface (panel bg + line border)                                                       |
| `.tech-label`   | Instrument label (mono, 11px, 0.14em tracking, uppercase)                                   |
| `.chip`         | Tag: outline pill, bg-2, mono 11px. **Nowrap**; long content adds `whitespace-normal text-left` |
| `.btn-primary`  | Amber fill, dark text, mono uppercase 13px, hover lift + amber shadow                       |
| `.btn-secondary`| Line-border ghost, ink text; hover: amber border + text + lift                              |
| `.link-cyan`    | Cyan text + 1px cyan underline (35% alpha); hover: ink                                      |
| `.m-reveal-init`/`.is-visible` | Scroll reveal: 24px rise + fade, 0.7s, cubic-bezier(0.22,1,0.36,1) (driven by Reveal.tsx) |

UI kit note: text flows through lucide-react icons (name/icon pairs);
lucide has **no brand icons** in this build — use ExternalLink for
external profiles.

## 6. Motion system (GSAP + CSS, honest label: motion is a readout, not decoration)

Global constraints:
- Every animation ≤ ~1s; stagger ≤ 0.15s between items
- `prefers-reduced-motion` kills ALL animation (CSS blanket in index.css;
  each JS effect early-returns via `prefersReducedMotion()` in
  `src/lib/anim.ts` — static end-state renders instantly)
- GSAP is registered exactly once (`ensureGsap()`); import `gsap`
  through that helper — never reference bare `gsap` without importing

Inventory:
1. **Boot sequence** (`BootSequence.tsx`) — once/session
   (`gaurav-ai-booted`), SKIP INTRO + Esc exit, ~2–3s, storage errors
   fall back to "already booted" (never trap the visitor)
2. **Neural canvas** (`NeuralCanvas.tsx`) — hero background; cursor
   repel, cyan pulses on links; pauses offscreen/hidden tab; static on
   reduced motion
3. **Word-in hero** — `.reveal-word` CSS keyframes, 0.09s stagger
4. **Architecture flow** (`ArchitectureFlow.tsx`) — dots light stepwise
   (140ms base, 260ms step) + GSAP line draw on ScrollTrigger `top 82%`;
   the label is a readout: "Scroll — the flow lights up in execution order"
5. **Scroll reveals** (`Reveal.tsx`) — IntersectionObserver 0.15
   threshold, `delay` prop for sequenced pairs
6. **Micro-interactions** — button lift (CSS), link underline color,
   CafeSim/AgentGraph/RagExplorer step timers (all cleaned on unmount)

## 7. Section map (single page)

| # | Section    | id           | Eyebrow       | Content owner               |
| - | ---------- | ------------ | ------------- | --------------------------- |
| 0 | Boot       | overlay      | —             | BootSequence                |
| 1 | Hero       | `home`       | role + domains| identity (profile.ts)       |
| 2 | About      | `about`      | ABOUT · 01    | identity.about/experience   |
| 3 | Projects   | `projects`   | PROJECTS · 02 | projects.ts (4 systems)     |
| 3b| — CafeSim  | in-stage 04  | INTERACTIVE SHOWCASE | projets.ts cafemind  |
| 4 | Playground | `playground` | PLAYGROUND · 03| 3 visualizations, SIM chip |
| 5 | Expertise  | `expertise`  | EXPERTISE · 04| skills.ts (6 clusters)      |
| 6 | Contact    | `contact`    | CONTACT · 05  | identity.contact            |

Nav: fixed top bar, blur-on-scroll, brand `G■ GAURAV.AI` (amber square G),
anchors ABOUT/PROJECTS/EXPERTISE/CONTACT + RESUME button; mobile = sheet
menu. Footer: name — role — "© 2026 · Built with React, TypeScript & GSAP".

## 8. Data layer (content is code)

All copy lives in typed files — sections never hardcode facts:
- `src/data/profile.ts` — identity, about, experience, education, contact
- `src/data/projects.ts` — Project { flow (FlowStep), evaluation
  (EvalRow), evalNarrative, limitations, github/demo/hf }
- `src/data/skills.ts` — SkillGroup { name, note, skills[] }
Rule: a number rendered on the page must come from here; revise data,
not JSX, when facts change.

## 9. Accessibility floor

- HTML5 landmarks: single main, banner + contentinfo; skip-to-content link
- Reasonable aria: tabs have role/aria-selected; simulation progress uses
  aria-live (boot, status rails); copy-email announces via aria-live
- Focus: `:focus-visible` = 2px amber outline, offset 3px (never removed)
- Contrast pairs verified: ink/muted on bg/panel; amber reserved for
  large/bold or non-body use
- All interactive states keyboard-reachable; menus close on Esc/unfocus

## 10. Meta/SEO status

`index.html`: title/description/theme-color/favicon/OG+twitter complete.
Gap to close before broad sharing: og:image asset + `og:image:alt`,
canonical URL fix (`og:url` currently points at a github.io placeholder —
update to the final domain when deploying), plus `sitemap.xml` +
`robots.txt` if the host allows.

## 11. New-screen checklist

1. One idea per section; eyebrow + h2 + sub via SectionHeading
2. Facts from data files only; honest narrative + Known limits if measured
3. Panel/border/chip/btn classes, no one-off colors (token or justify)
4. Motion ≤1s, reduced-motion safe, cleanup every timer/observer
5. Simulations carry `DEMO · SIMULATION` visibly
6. Keyboard path + aria for anything interactive
7. Mobile: no horizontal overflow at 375/390px; long-text chips wrap
8. Perf: no image without size/format reasoning; JS additions must
   justify themselves against the 134KB gzip budget
