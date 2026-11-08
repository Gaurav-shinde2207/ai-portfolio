// One-pager entrance + scroll animations. Pack: split-text hero (1),
// stat counters (3), stagger fade-up (4), scroll-drawn pipelines (5),
// magnetic CTA (7), underline draw (CSS-only, in global.css).
// Every effect is <=1s; prefers-reduced-motion disables everything and
// leaves the page fully visible (html gets .no-motion, and init exits).

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const REDUCED =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initSplitText(): void {
  const title = document.querySelector<HTMLElement>('.hero-title');
  if (!title) return;
  const words = title.textContent?.split(/\s+/).filter(Boolean) ?? [];
  title.setAttribute('aria-label', words.join(' '));
  title.innerHTML = words
    .map(
      (w) =>
        `<span class="st-line" aria-hidden="true"><span class="st-inner">${w}</span></span>`
    )
    .join(' ');
}

function initHeroIntro(): void {
  // CSS pre-hides .st-inner via translateY(115%) (global.css line ~429).
  // GSAP parses that CSS transform into px y on first touch — zero it
  // explicitly or the parsed y survives the yPercent tween forever.
  gsap.set('.st-inner', { y: 0, yPercent: 115 });
  gsap.to('.st-inner', {
    yPercent: 0,
    duration: 0.7,
    stagger: 0.04,
    ease: 'power3.out',
    delay: 0.15,
  });
  gsap.fromTo(
    '.hero-fade',
    { opacity: 0, y: 24 },
    { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'power2.out', delay: 0.6 }
  );
}

function initStaggerReveal(): void {
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      }
    );
  });
}

function initCounters(): void {
  document.querySelectorAll<HTMLElement>('.num[data-to]').forEach((el) => {
    const to = parseFloat(el.dataset.to ?? '0');
    const decimals = parseInt(el.dataset.decimals ?? '0', 10);
    const prefix = el.dataset.prefix ?? '';
    const suffix = el.dataset.suffix ?? '';
    const state = { v: 0 };
    gsap.to(state, {
      v: to,
      duration: 1.2,
      ease: 'power2.out',
      onUpdate: () => {
        el.textContent = prefix + state.v.toFixed(decimals) + suffix;
      },
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });
}

function initPipelines(): void {
  document.querySelectorAll<SVGSVGElement>('.pipeline').forEach((svg) => {
    const lines = Array.from(svg.querySelectorAll<SVGPathElement>('.pl-line'));
    const nodes = Array.from(svg.querySelectorAll<SVGElement>('.pl-node'));
    const labels = Array.from(svg.querySelectorAll<SVGElement>('.pl-label'));
    const lit = (i: number) => {
      nodes[i]?.classList.add('lit');
      labels[i]?.classList.add('lit');
    };
    lit(0);
    const tl = gsap.timeline();
    lines.forEach((line, i) => {
      const len = line.getTotalLength();
      line.style.strokeDasharray = String(len);
      line.style.strokeDashoffset = String(len);
      tl.to(
        line,
        { strokeDashoffset: 0, duration: 0.28, ease: 'none' },
        i * 0.24
      );
      tl.add(() => lit(i + 1), i * 0.24 + 0.24);
    });
    ScrollTrigger.create({
      trigger: svg,
      start: 'top 80%',
      onEnter: () => tl.play(),
    });
    tl.pause();
  });
}

function initMagnetic(): void {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  document.querySelectorAll<HTMLElement>('.magnetic').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const dx = ((e.clientX - (r.left + r.width / 2)) / r.width) * 16;
      const dy = ((e.clientY - (r.top + r.height / 2)) / r.height) * 10;
      gsap.to(btn, { x: dx, y: dy, duration: 0.3, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
    });
  });
}

export function initOnePager(): void {
  if (!document.querySelector('.hero-title')) return;
  if (REDUCED) {
    document.documentElement.classList.add('no-motion');
    document.documentElement.classList.add('js-anim');
    return;
  }
  document.documentElement.classList.add('js-anim');
  gsap.registerPlugin(ScrollTrigger);
  initSplitText();
  initHeroIntro();
  initStaggerReveal();
  initCounters();
  initPipelines();
  initMagnetic();
}
