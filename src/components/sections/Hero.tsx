import { ArrowDownRight, FileDown, Mail } from 'lucide-react'
import { heroAnnotations, identity } from '../../data/profile'
import NeuralCanvas from '../visualizations/NeuralCanvas'

export default function Hero() {
  const words = identity.tagline.split(' ')

  return (
    <section id="home" className="relative flex min-h-[92svh] items-center overflow-hidden">
      <NeuralCanvas className="absolute inset-0 h-full w-full opacity-70" />
      <div className="grid-fade pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto w-full max-w-7xl px-5 py-20 md:px-8">
        <p className="tech-label mb-4 flex items-center gap-3 text-amber">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-amber" aria-hidden="true" />
          {identity.role.toUpperCase()} · GENERATIVE AI · AGENTIC SYSTEMS
        </p>

        <h1 className="font-display max-w-4xl text-[clamp(2.6rem,7.5vw,5.5rem)] font-bold leading-[1.02] tracking-tight text-ink">
          {words.map((w, i) => (
            <span
              key={`${w}-${i}`}
              className="reveal-word inline-block opacity-0"
              style={{ animationDelay: `${0.18 + i * 0.09}s` }}
            >
              {w}
              {i < words.length - 1 && '\u00A0'}
            </span>
          ))}
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
          {identity.support}
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <a href="#projects" className="btn-primary">
            Explore my work
            <ArrowDownRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <a href={identity.contact.resume} download className="btn-secondary">
            <FileDown className="h-4 w-4" aria-hidden="true" />
            Download resume
          </a>
          <a href={`mailto:${identity.contact.email}`} className="btn-secondary">
            <Mail className="h-4 w-4" aria-hidden="true" />
            Connect with me
          </a>
        </div>

        {/* technical status annotations */}
        <dl className="mt-12 grid max-w-3xl grid-cols-1 gap-3 border-t border-line pt-6 sm:grid-cols-3">
          {heroAnnotations.map((a) => (
            <div key={a.label}>
              <dt className="tech-label">{a.label}</dt>
              <dd className="mt-0.5 font-mono text-xs text-cyan">{a.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
