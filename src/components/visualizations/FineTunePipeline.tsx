import { useEffect, useRef, useState } from 'react'
import { Cpu, Database, FileCode2, Package, Server, Wrench } from 'lucide-react'

/**
 * Model training pipeline visualiser. Static flow + expandable concept
 * explainers. Runs matched to SQL2NL: Llama 3.2 3B, QLoRA, GGUF.
 */

interface Step {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  body: string
}

const STEPS: Step[] = [
  {
    id: 'base',
    label: 'BASE MODEL',
    icon: Cpu,
    title: 'Base model',
    body: 'The untouched pretrained weights — for SQL2NL, Llama 3.2 3B. A base model knows language; it does not yet know the specific mapping between SQL and business explanations.',
  },
  {
    id: 'dataset',
    label: 'TRAINING DATASET',
    icon: Database,
    title: 'Training dataset',
    body: '1,500 SQL-to-explanation examples covering CTEs, JOINs and window functions. Data quality — representative queries plus clean, consistent explanations — decides almost everything downstream.',
  },
  {
    id: 'lora',
    label: 'QLoRA / LoRA ADAPTER',
    icon: Wrench,
    title: 'LoRA & QLoRA',
    body: 'LoRA freezes the base weights and trains tiny low-rank adapter matrices. QLoRA additionally quantises the frozen base to 4-bit, so the whole fit fits consumer hardware — SQL2NL trained in under one GPU-hour on a Kaggle T4.',
  },
  {
    id: 'ft',
    label: 'FINE-TUNED MODEL',
    icon: FileCode2,
    title: 'Fine-tuned model',
    body: 'Base weights plus the trained adapter merged into a model that reliably turns SQL into business language. The evaluation gate measured 6/8 held-out queries passed with 0.774 semantic similarity.',
  },
  {
    id: 'gguf',
    label: 'GGUF EXPORT',
    icon: Package,
    title: 'Quantization & GGUF export',
    body: 'The merged model is converted to the GGUF format and quantised to Q4_K_M (~2 GB), trading a small accuracy cost for local inferencing on laptops through llama.cpp or Ollama.',
  },
  {
    id: 'serving',
    label: 'INFERENCE / SERVING',
    icon: Server,
    title: 'Model serving',
    body: 'The artifact ships behind a FastAPI service and installs on Ollama; model loading, prompt formatting and throughput are treated as engineering constraints, not afterthoughts.',
  },
]

export default function FineTunePipeline() {
  const [selected, setSelected] = useState<Step>(STEPS[2]!) // QLoRA default
  const EligibleRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // subtle lifecycle: animate selection panel height on reduced-motion-safe CSS only
    if (EligibleRef.current) EligibleRef.current.dataset.step = selected.id
  }, [selected])

  return (
    <div className="panel h-full p-5 md:p-7">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-lg font-semibold text-ink">Fine-Tuning Pipeline</h3>
        <span className="chip !border-cyan/40 !text-cyan">MODELED ON SQL2NL</span>
      </div>
      <p className="mb-6 text-sm text-muted leading-relaxed">
        How a small language model is customised, quantised and served. Select a stage to read what
        actually happens — conceptual walkthrough, not live training.
      </p>

      <ol className="flex flex-wrap items-stretch gap-2" aria-label="Fine-tuning pipeline stages">
        {STEPS.map((s, i) => {
          const Icon = s.icon
          const isSel = selected.id === s.id
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => setSelected(s)}
                aria-pressed={isSel}
                className={`flex h-full min-w-[104px] flex-col items-center gap-1.5 border px-3 py-3 text-center transition-all duration-200 ${
                  isSel
                    ? 'border-amber bg-amber/10 text-amber'
                    : 'border-line bg-bg-2 text-muted hover:border-amber/50 hover:text-ink'
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="font-mono text-[0.6rem] leading-tight tracking-[0.06em]">{s.label}</span>
                {i < STEPS.length - 1 && <span className="sr-only">next: {STEPS[i + 1]!.label}</span>}
              </button>
            </li>
          )
        })}
      </ol>

      <div ref={EligibleRef} className="mt-5 border border-line bg-bg-2 p-4" data-testid="ft-detail">
        <p className="tech-label !text-amber">{selected.title}</p>
        <p className="mt-2 text-sm text-ink leading-relaxed">{selected.body}</p>
      </div>
    </div>
  )
}
