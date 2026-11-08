import { useEffect, useRef } from 'react'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Runs a callback once per matching element when scrolled into view,
 * driven by IntersectionObserver — no continuous scroll listeners.
 * Returns the observed root element style; attach `data-m-reveal` targets.
 */
export function useReducedMotion(): boolean {
  const ref = useRef(prefersReducedMotion())
  useEffect(() => {
    ref.current = prefersReducedMotion()
  }, [])
  return ref.current
}

export { prefersReducedMotion }
