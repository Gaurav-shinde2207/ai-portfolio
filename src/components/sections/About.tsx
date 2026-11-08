import { GraduationCap, MapPin } from 'lucide-react'
import { identity } from '../../data/profile'
import Reveal from '../ui/Reveal'
import SectionHeading from '../ui/SectionHeading'

export default function About() {
  const xp = identity.experience[0]!

  return (
    <section id="about" className="border-t border-line py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading eyebrow="ABOUT · 01" title={identity.about.headline} />

        <div className="grid gap-12 lg:grid-cols-[7fr_5fr]">
          {/* About prose */}
          <Reveal>
            <h3 className="font-mono text-xs tracking-[0.14em] text-amber">WHO RUNS THE LAB</h3>
            {identity.about.body.map((p) => (
              <p key={p.slice(0, 24)} className="mt-4 max-w-2xl leading-relaxed text-muted">
                {p}
              </p>
            ))}
            <dl className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="border border-line bg-panel p-4">
                <dt className="tech-label flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-amber" aria-hidden="true" />
                  Education
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-ink">
                  {identity.education.degree}
                  <span className="block text-xs text-muted">
                    {identity.education.school} · {identity.education.period}
                  </span>
                </dd>
              </div>
              <div className="border border-line bg-panel p-4">
                <dt className="tech-label flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-amber" aria-hidden="true" />
                  Base
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-ink">
                  {identity.location}
                  <span className="block text-xs text-muted">Open to relocation for the right system.</span>
                </dd>
              </div>
            </dl>
          </Reveal>

          {/* Experience timeline */}
          <Reveal delay={120}>
            <h3 className="font-mono text-xs tracking-[0.14em] text-amber">EXPERIENCE TIMELINE</h3>
            <ol className="mt-4 space-y-8">
              <li className="relative pl-7">
                <span className="xp-line" aria-hidden="true" />
                <span className="absolute left-0 top-1.5 grid h-[15px] w-[15px] place-items-center rounded-full border border-amber bg-amber/15">
                  <span className="h-[5px] w-[5px] rounded-full bg-amber" />
                </span>
                <p className="font-mono text-xs text-muted">{xp.period}</p>
                <h4 className="mt-1 font-display text-lg font-semibold text-ink">
                  {xp.role} — {xp.org}
                </h4>
                <p className="font-mono text-xs text-cyan">{xp.location}</p>
                <ul className="mt-3 list-none space-y-2">
                  {xp.highlights.map((h) => (
                    <li key={h.slice(0, 24)} className="flex gap-2 text-sm leading-relaxed text-muted">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber" aria-hidden="true" />
                      {h}
                    </li>
                  ))}
                </ul>
              </li>
            </ol>
            <p className="mt-6 border-l border-line pl-4 font-mono text-[0.68rem] leading-relaxed text-muted/70">
              Only documented, verifiable experience is listed. Nothing else.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
