import { useState } from 'react'
import Reveal from '../ui/Reveal'
import SectionHeading from '../ui/SectionHeading'
import { skills, type SkillGroup } from '../../data/skills'

/**
 * Interactive skill clusters: the selected bucket's tokens expand,
 * the others stay as compact count chips. No invented proficiency bars.
 */
export default function Expertise() {
  const [activeId, setActiveId] = useState<string>(skills[0]?.id ?? 'genai')
  const active: SkillGroup | undefined = skills.find((g) => g.id === activeId)

  return (
    <section id="expertise" className="border-t border-line py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="EXPERTISE · 04"
          title="The stack behind the systems."
          sub="Grouped by function, not inflated by percentages. Select a cluster to see its tools."
        />

        <Reveal>
          <div
            role="tablist"
            aria-label="Skill clusters"
            className="flex flex-wrap gap-2"
          >
            {skills.map((g) => {
              const isActive = g.id === activeId
              return (
                <button
                  key={g.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveId(g.id)}
                  className={`tech-label border px-3.5 py-2 transition-colors ${
                    isActive
                      ? 'border-amber bg-amber/15 text-amber'
                      : 'border-line bg-panel text-muted hover:border-amber/50 hover:text-ink'
                  }`}
                >
                  {g.name}
                  <span className="ml-2 font-mono text-[0.65rem] opacity-70">{g.skills.length}</span>
                </button>
              )
            })}
          </div>

          <div className="mt-6 border border-line bg-panel p-5 md:p-7">
            {active && (
              <>
                <p className="font-display text-xl font-semibold text-ink md:text-2xl">{active.name}</p>
                <p className="mt-1 text-sm text-muted">{active.note}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {active.skills.map((s) => (
                    <span
                      key={s}
                      className="chip animate-[word-in_0.35s_ease-out_both] hover:border-cyan/70 hover:text-cyan"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
