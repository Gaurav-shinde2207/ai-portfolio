import { AlertTriangle, ExternalLink, FolderGit2, TriangleAlert } from 'lucide-react'
import ArchitectureFlow from '../visualizations/ArchitectureFlow'
import CafeSim from '../visualizations/CafeSim'
import Reveal from '../ui/Reveal'
import SectionHeading from '../ui/SectionHeading'
import { projects, type Project } from '../../data/projects'

const KIND_LABEL: Record<Project['kind'], string> = {
  agent: 'AGENT',
  finetune: 'FINE-TUNE',
  rag: 'RAG',
  cafe: 'FULL-STACK + AI',
}

function EvalTable({ project }: { project: Project }) {
  if (project.evaluation.length === 0 && !project.evalNarrative) return null

  return (
    <div className="mt-5 border border-line bg-panel p-4">
      <p className="tech-label text-amber">MEASURED RESULTS</p>
      {project.evaluation.length > 0 && (
        <dl className="mt-3 space-y-2">
          {project.evaluation.map((row) => (
            <div
              key={row.label}
              className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-line/60 pb-2 last:border-0 last:pb-0"
            >
              <dt className="text-sm text-muted">{row.label}</dt>
              <dd className="font-mono text-sm text-ink">
                <span className="text-amber">{row.value}</span>
                {row.context && <span className="ml-2 text-xs text-muted">({row.context})</span>}
              </dd>
            </div>
          ))}
        </dl>
      )}
      {project.evalNarrative && (
        <p className="mt-3 flex gap-2 text-xs leading-relaxed text-muted">
          <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber" aria-hidden="true" />
          {project.evalNarrative}
        </p>
      )}
    </div>
  )
}

function Limitations({ project }: { project: Project }) {
  if (project.limitations.length === 0) return null
  return (
    <div className="mt-4 border border-line/60 p-4">
      <p className="tech-label flex items-center gap-2 text-muted">
        <AlertTriangle className="h-3.5 w-3.5 text-amber" aria-hidden="true" />
        KNOWN LIMITS
      </p>
      <ul className="mt-2 space-y-1.5">
        {project.limitations.map((l) => (
          <li key={l.slice(0, 32)} className="flex gap-2 text-xs leading-relaxed text-muted">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber/70" aria-hidden="true" />
            {l}
          </li>
        ))}
      </ul>
    </div>
  )
}

function ProjectLinks({ project }: { project: Project }) {
  return (
    <div className="mt-5 flex flex-wrap gap-3">
      <a href={project.github} target="_blank" rel="noreferrer" className="btn-secondary">
        <FolderGit2 className="h-4 w-4" aria-hidden="true" />
        Source code
      </a>
      {project.hf && (
        <a href={project.hf} target="_blank" rel="noreferrer" className="btn-secondary">
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          Model on Hugging Face
        </a>
      )}
      {project.demo && (
        <a href={project.demo} target="_blank" rel="noreferrer" className="btn-primary">
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          Live demo
        </a>
      )}
    </div>
  )
}

function ProjectStage({ project, flip }: { project: Project; flip: boolean }) {
  const body = (
    <div className={flip ? 'lg:order-2' : undefined}>
      <div className="flex items-baseline gap-4">
        <span className="font-mono text-sm text-amber">{project.index}</span>
        <span className="chip">{KIND_LABEL[project.kind]}</span>
      </div>
      <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
        {project.title}
      </h3>
      <p className="mt-3 max-w-xl leading-relaxed text-muted">{project.overview}</p>

      <ul className="mt-5 space-y-2">
        {project.highlights.slice(0, 5).map((h) => (
          <li key={h.slice(0, 32)} className="flex gap-2 text-sm leading-relaxed text-muted">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-cyan" aria-hidden="true" />
            {h}
          </li>
        ))}
      </ul>

      <EvalTable project={project} />
      <Limitations project={project} />
      <ProjectLinks project={project} />

      <div className="mt-5 flex flex-wrap gap-2">
        {project.tech.map((t) => (
          <span key={t} className="chip">
            {t}
          </span>
        ))}
      </div>
    </div>
  )

  const visual = (
    <div className={flip ? 'lg:order-1' : undefined}>
      {project.kind === 'cafe' ? (
        <div className="panel">
          <p className="tech-label text-amber">INTERACTIVE SHOWCASE — ORDER SIMULATOR</p>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            A simplified in-browser simulation of the production conversational ordering flow:
            confirm, server-side validation, preparation states and ready-for-pickup estimate.
            Try it below — then use the live demo link for the real application.
          </p>
          <div className="mt-4">
            <CafeSim />
          </div>
        </div>
      ) : (
        <div className="panel">
          <p className="tech-label text-amber">SYSTEM PIPELINE</p>
          <p className="mt-2 mb-4 font-mono text-[0.68rem] text-muted">
            Scroll — the flow lights up in execution order.
          </p>
          <ArchitectureFlow steps={project.flow} />
        </div>
      )}
    </div>
  )

  return (
    <Reveal as="article" className="grid gap-10 lg:grid-cols-2 lg:gap-14">
      {body}
      {visual}
    </Reveal>
  )
}

export default function Projects() {
  const [sqlmind, sql2nl, finsight, cafemind] = projects

  return (
    <section id="projects" className="border-t border-line py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="PROJECTS · 02"
          title="Systems built. Evaluated honestly."
          sub="Every project below ships with its real evaluation numbers — including the results that did not improve the system."
        />
        <div className="space-y-24 md:space-y-32">
          {sqlmind && <ProjectStage project={sqlmind} flip={false} />}
          {sql2nl && <ProjectStage project={sql2nl} flip />}
          {finsight && <ProjectStage project={finsight} flip={false} />}
          {cafemind && <ProjectStage project={cafemind} flip />}
        </div>
      </div>
    </section>
  )
}
