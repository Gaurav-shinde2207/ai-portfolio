import { useEffect, useRef } from 'react'
import type { FlowStep } from '../../data/projects'
import { ensureGsap, prefersReducedMotion, ScrollTrigger } from '../../lib/anim'

/**
 * Animated architecture pipeline: steps light up in sequence with
 * drawn connector rails when the component scrolls into view.
 */
export default function ArchitectureFlow({ steps }: { steps: FlowStep[] }) {
  const ref = useRef<HTMLUListElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const gsap = ensureGsap()

    const lightAll = () => {
      el.querySelectorAll<HTMLElement>('.af-dot').forEach((d) => d.classList.add('lit'))
      el.querySelectorAll<HTMLElement>('.af-line').forEach((l) => (l.style.transform = 'scaleY(1)'))
    }

    if (prefersReducedMotion()) {
      lightAll()
      return
    }

    const dots = el.querySelectorAll('.af-dot')
    const lines = el.querySelectorAll('.af-line')
    gsap.set(lines, { scaleY: 0, transformOrigin: 'top center' })

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 82%',
      once: true,
      onEnter: () => {
        el.classList.add('flow-live')
        dots.forEach((d, i) => {
          setTimeout(() => d.classList.add('lit'), i === 0 ? 0 : 140 + (i - 1) * 260)
        })
        gsap.to(lines, {
          scaleY: 1,
          duration: 0.3,
          ease: 'power2.out',
          stagger: 0.14,
          delay: 0.1,
        })
      },
    })

    return () => {
      trigger.kill()
    }
  }, [steps])

  return (
    <ul ref={ref} className="af relative">
      {steps.map((s, i) => (
        <li key={s.id} className="relative flex items-start gap-3 pb-5 last:pb-0">
          {i < steps.length - 1 && (
            <span className="af-line absolute left-[7px] top-5 h-[calc(100%-1.1rem)] w-px bg-gradient-to-b from-amber/60 to-amber/15" aria-hidden="true" />
          )}
          <span className="af-dot mt-1 grid h-[15px] w-[15px] shrink-0 place-items-center rounded-full border border-amber/45 transition-all duration-300">
            <span className="h-[5px] w-[5px] rounded-full bg-amber/25 transition-all duration-300" />
          </span>
          <div className="min-w-0">
            <p className="font-mono text-[0.72rem] tracking-[0.1em] text-muted transition-colors duration-300 [.lit_&]:text-current">
              {s.label}
            </p>
            {s.note && (
              <p className="font-mono text-[0.62rem] text-muted/60">{s.note}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
