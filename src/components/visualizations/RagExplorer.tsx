import { useEffect, useRef, useState } from 'react'
import { Search, AlertTriangle } from 'lucide-react'
import Reveal from '../ui/Reveal'

/**
 * LOCAL RAG DEMO — runs entirely in the browser on a small static dataset.
 * Scoring is deterministic keyword/term overlap, not a real embedding model.
 */

interface Doc {
  id: string
  title: string
  body: string
  tokens: string[]
}

interface Sample {
  q: string
  tokens: string[]
  expectedDocId: string
}

const CORPUS: Doc[] = [
  {
    id: 'sqlmind',
    title: 'sqlmind/system.md',
    body: 'SQLMind validates every generated SQL query with a SELECT/WITH-only gate, executes through a read-only connection with a LIMIT guard and timeout, and allows three bounded self-correction retries. Evaluation over 28 held-out Chinook questions: 60.7% baseline, correction memory showed no measurable gain.',
    tokens: [],
  },
  {
    id: 'finsight',
    title: 'finsight/grounding.md',
    body: 'FinSight grounds every answer in retrieved financial-document context. Each response carries file, page and section citations with similarity scores. When retrieval similarity is below threshold, it refuses to answer without calling the LLM.',
    tokens: [],
  },
  {
    id: 'sql2nl',
    title: 'sql2nl/training.md',
    body: 'SQL2NL fine-tunes Llama 3.2 3B with QLoRA on 1,500 SQL-to-explanation pairs, finishing in under one GPU-hour on a Kaggle T4. Export is a 2 GB Q4_K_M GGUF artifact served through llama.cpp, Ollama and FastAPI. Held-out pass rate: 6 out of 8.',
    tokens: [],
  },
  {
    id: 'cafemind',
    title: 'cafemind/ordering.md',
    body: 'CafeMind handles conversational ordering with Google Gemini, but the LLM never creates orders or sets prices. Every item, price and availability check is validated server-side against the PostgreSQL menu tables, and the order requires explicit customer confirmation.',
    tokens: [],
  },
  {
    id: 'rag-basics',
    title: 'field-notes/rag.md',
    body: 'Retrieval-augmented generation adds an explicit retrieval step before generation: embed the query, rank a vector store by similarity, select the top chunks, and instruct the model to answer only from that context with citations. Evaluation and hallucination detection judge the pipeline.',
    tokens: [],
  },
]

const SAMPLES: Sample[] = [
  { q: 'How does SQLMind keep database access safe?', tokens: ['sqlmind', 'safe', 'database'], expectedDocId: 'sqlmind' },
  { q: 'What happens when retrieval is weak in FinSight?', tokens: ['finsight', 'weak', 'retrieval'], expectedDocId: 'finsight' },
  { q: 'How fast was SQL2NL to train?', tokens: ['sql2nl', 'fast', 'train'], expectedDocId: 'sql2nl' },
]

const STAGE_LABELS = ['EMBED QUERY', 'RETRIEVE k=3', 'RANK BY SIMILARITY', 'SELECT CONTEXT', 'GROUNDED ANSWER'] as const

const tokenise = (s: string) =>
  s.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 3)

for (const d of CORPUS) d.tokens = tokenise(d.title + ' ' + d.body)

function score(queryTokens: string[], doc: Doc): number {
  if (queryTokens.length === 0) return 0
  let hit = 0
  for (const t of queryTokens) {
    if (doc.tokens.includes(t)) hit++
  }
  return hit / Math.max(queryTokens.length, 4)
}

type Phase = 'idle' | 'running' | 'done'

export default function RagExplorer() {
  const [query, setQuery] = useState('')
  const [phase, setPhase] = useState<Phase>('idle')
  const [stage, setStage] = useState<number>(-1)
  const [ranked, setRanked] = useState<Array<{ doc: Doc; s: number }>>([])
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([])

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout)
    },
    [],
  )

  const run = (q: string) => {
    if (!q.trim() || phase === 'running') return
    timers.current.forEach(clearTimeout)
    timers.current = []
    const qTokens = tokenise(q)
    const scores = CORPUS.map((doc) => ({ doc, s: score(qTokens, doc) })).sort((a, b) => b.s - a.s)
    setRanked([])
    setStage(0)
    setPhase('running')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const step = reduced ? 40 : 700
    STAGE_LABELS.forEach((_, i) => {
      timers.current.push(setTimeout(() => setStage(i), i * step))
    })
    timers.current.push(
      setTimeout(() => {
        setRanked(scores.slice(0, 3))
        setPhase('done')
      }, STAGE_LABELS.length * step),
    )
  }

  const top = ranked[0]
  const stageActive = phase === 'running' || phase === 'done'

  return (
    <div className="panel h-full p-5 md:p-7">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-ink">RAG Explorer</h3>
        <span className="chip !border-cyan/40 !text-cyan">LOCAL DEMO</span>
      </div>
      <p className="mb-4 text-sm text-muted leading-relaxed">
        A miniature retrieval-augmented-generation walkthrough on a static in-browser corpus. Scoring uses
        deterministic keyword overlap — no external API, no real browser embedding model. Enter a sample
        question or try one below.
      </p>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          run(query)
        }}
      >
        <label htmlFor="rag-query" className="sr-only">
          Sample question
        </label>
        <input
          id="rag-query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. How does SQLMind keep database access safe?"
          className="min-w-0 flex-1 border border-line bg-bg-2 px-3 py-2.5 font-mono text-xs text-ink placeholder:text-muted/50 focus:border-amber outline-none"
        />
        <button type="submit" className="btn-primary shrink-0 !px-4" disabled={phase === 'running'}>
          <Search className="h-4 w-4" aria-hidden="true" />
          Trace
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {SAMPLES.map((s) => (
          <button
            key={s.expectedDocId}
            type="button"
            onClick={() => {
              setQuery(s.q)
              run(s.q)
            }}
            className="chip whitespace-normal text-left transition-colors hover:!border-amber hover:!text-amber"
          >
            {s.q}
          </button>
        ))}
      </div>

      {/* Stage rail */}
      <ol className="mt-5 grid grid-cols-5 gap-1" aria-label="RAG pipeline stages">
        {STAGE_LABELS.map((label, i) => (
          <li key={label} className="flex flex-col gap-1">
            <span
              className={`h-1 rounded-full transition-colors duration-500 ${
                stageActive && stage >= i ? 'bg-amber' : 'bg-line'
              }`}
            />
            <span
              className={`font-mono text-[0.55rem] tracking-wide transition-colors duration-500 ${
                stageActive && stage >= i ? 'text-amber' : 'text-muted/50'
              }`}
            >
              {label}
            </span>
          </li>
        ))}
      </ol>

      {phase === 'idle' && <p className="mt-6 font-mono text-xs text-muted/60">// awaiting query</p>}

      {ranked.length > 0 && (
        <div className="mt-5 border-t border-line pt-4">
          <p className="tech-label mb-3">Similarity ranking</p>
          <ul className="space-y-2.5">
            {ranked.map(({ doc, s }) => (
              <li key={doc.id}
                className="group">
                <div className="mb-1 flex items-baseline justify-between gap-2">
                  <span className="truncate font-mono text-xs text-cyan">{doc.title}</span>
                  <span className="font-mono text-xs text-muted">{s.toFixed(2)}</span>
                </div>
                <div className="h-1.5 w-full bg-line">
                  <div
                    className="h-full bg-cyan/70 transition-[width] duration-700"
                    style={{ width: `${Math.round(Math.min(1, s) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>

          {top && (
            <Reveal className="mt-4 border border-cyan/25 bg-cyan/5 p-4">
              <p className="tech-label !text-cyan mb-2">Grounded answer — {top.doc.title}</p>
              <p className="text-sm text-ink leading-relaxed">{top.doc.body}</p>
              <p className="mt-3 flex items-start gap-1.5 font-mono text-[0.62rem] text-muted/70">
                <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber" aria-hidden="true" />
                Simulated retrieval over a static demo corpus — not a live system call.
              </p>
            </Reveal>
          )}
        </div>
      )}
    </div>
  )
}
