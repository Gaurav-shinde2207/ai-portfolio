import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let initialized = false;

/**
 * Fade-up reveal for every element carrying [data-reveal], once per element.
 * Honors prefers-reduced-motion: elements show instantly, no animation.
 * Idempotent: safe to call from multiple scripts.
 */
export function initScrollReveal(): void {
  if (initialized) return;
  const els = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (!els.length) return;
  initialized = true;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.set(els, { opacity: 1, y: 0 });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  gsap.set(els, { opacity: 0, y: 24 });
  els.forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });
}
