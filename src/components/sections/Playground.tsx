import { FlaskConical } from 'lucide-react'
import AgentGraph from '../visualizations/AgentGraph'
import FineTunePipeline from '../visualizations/FineTunePipeline'
import RagExplorer from '../visualizations/RagExplorer'
import Reveal from '../ui/Reveal'
import SectionHeading from '../ui/SectionHeading'

const DEMOS = [
  {
    id: 'rag',
    label: 'RAG EXPLORER',
    note: 'Retrieval scoring, live in your browser — over a small local corpus.',
    component: <RagExplorer />,
  },
  {
    id: 'agent',
    label: 'AGENT GRAPH',
    note: 'A deterministic simulation of the LangGraph state machine behind SQLMind.',
    component: <AgentGraph />,
  },
  {
    id: 'finetune',
    label: 'FINE-TUNE PIPELINE',
    note: 'The QLoRA → GGUF → serving path, modeled on SQL2NL.',
    component: <FineTunePipeline />,
  },
] as const

export default function Playground() {
  return (
    <section id="playground" className="border-t border-line py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="PLAYGROUND · 03"
          title="Break the concepts down yourself."
          sub="Three interactive explainers covering the three disciplines of AI engineering: retrieval, agents, and fine-tuning. Simulated in-browser, honestly labeled."
        />

        <div className="space-y-10">
          {DEMOS.map((demo, i) => (
            <Reveal key={demo.id} delay={i * 60}>
              <div className="panel">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center border border-amber/40 bg-amber/10 text-amber">
                    <FlaskConical className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <h3 className="font-display text-lg font-semibold text-ink">{demo.label}</h3>
                  <span className="chip">DEMO · SIMULATION</span>
                </div>
                <p className="mt-2 max-w-2xl text-sm text-muted">{demo.note}</p>
                <div className="mt-5">{demo.component}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
