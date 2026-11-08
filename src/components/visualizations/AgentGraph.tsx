import { useEffect, useRef, useState } from 'react'
import { Play, RotateCcw, Pin } from 'lucide-react'

/**
 * SIMULATED LangGraph-style workflow. No backend — node activation is a
 * scripted animation of the SQLMind control flow, including a single
 * bounded correction loop.
 */

type NodeId = 'START' | 'INTENT' | 'RETRIEVE' | 'GENERATE' | 'VALIDATE' | 'EXECUTE' | 'CORRECT' | 'END'

const NODES: Array<{ id: NodeId; x: number; y: number; note?: string }> = [
  { id: 'START', x: 0, y: 0 },
  { id: 'INTENT', x: 1, y: 0, note: 'parse question' },
  { id: 'RETRIEVE', x: 2, y: 0, note: 'few-shot examples' },
  { id: 'GENERATE', x: 3, y: 0, note: 'LLM → SQL' },
  { id: 'VALIDATE', x: 3, y: 1, note: 'allowlist gate' },
  { id: 'CORRECT', x: 2, y: 1, note: 'bounded retry ≤3' },
  { id: 'EXECUTE', x: 1, y: 1, note: 'read-only conn' },
  { id: 'END', x: 0, y: 1 },
]

// Scripted run: one validation failure → one bounded correction → success.
const SCRIPT: NodeId[] = ['START', 'INTENT', 'RETRIEVE', 'GENERATE', 'VALIDATE', 'CORRECT', 'GENERATE', 'VALIDATE', 'EXECUTE', 'END']

const grid = (x: number, y: number) => ({ col: x + 1, row: y + 1 })

export default function AgentGraph() {
  const [active, setActive] = useState<NodeId | null>(null)
  const [visited, setVisited] = useState<Set<NodeId>>(new Set())
  const [running, setRunning] = useState(false)
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([])

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout)
    },
    [],
  )

  const run = () => {
    if (running) return
    timers.current.forEach(clearTimeout)
    timers.current = []
    setVisited(new Set())
    setRunning(true)
    setVisited(new Set([SCRIPT[0]!]))
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const step = reduced ? 60 : 640
    SCRIPT.forEach((id, i) => {
      timers.current.push(
        setTimeout(() => {
          setActive(id)
          setVisited((prev) => new Set(prev).add(id))
        }, i * step),
      )
    })
    timers.current.push(setTimeout(() => setRunning(false), SCRIPT.length * step))
  }

  const reset = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setRunning(false)
    setActive(null)
    setVisited(new Set())
  }

  return (
    <div className="panel flex h-full flex-col p-5 md:p-7">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-lg font-semibold text-ink">Agent Workflow</h3>
        <div className="flex items-center gap-2">
          <span className="chip !border-amber/40 !text-amber">SIMULATION</span>
          <button type="button" onClick={run} className="btn-primary !px-3 !py-1.5" disabled={running}>
            <Play className="h-3.5 w-3.5" aria-hidden="true" />
            Run
          </button>
          <button
            type="button"
            onClick={reset}
            className="grid h-8 w-8 place-items-center border border-line bg-bg-2 text-muted transition-colors hover:border-amber hover:text-amber"
            aria-label="Reset workflow"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <p className="mb-5 text-sm text-muted leading-relaxed">
        Interactive visualisation of the SQLMind control flow, including the bounded self-correction loop
        (the demo always exercises one retry). This is a scripted simulation — no model is invoked.
      </p>

      {/* Node grid */}
      <div className="relative grid flex-1 grid-cols-4 gap-3" role="img" aria-label="Agent state graph with nodes START, INTENT, RETRIEVE, GENERATE, VALIDATE, CORRECT, EXECUTE, END">
        {NODES.map((n) => {
          const pos = grid(n.x, n.y)
          const isActive = active === n.id
          const wasVisited = visited.has(n.id)
          return (
            <div
              key={n.id}
              style={{ gridColumn: pos.col, gridRow: pos.row }}
              className={`flex min-h-[74px] flex-col justify-center border p-2 text-center transition-all duration-300 ${
                isActive
                  ? 'border-amber bg-amber/10 shadow-[0_0_18px_rgba(245,166,35,0.35)]'
                  : wasVisited
                    ? 'border-cyan/40 bg-cyan/5'
                    : 'border-line bg-bg-2'
              }`}
            >
              <span
                className={`font-mono text-[0.66rem] tracking-[0.08em] transition-colors duration-300 ${
                  isActive ? 'text-amber' : wasVisited ? 'text-cyan' : 'text-muted'
                }`}
              >
                {n.id}
              </span>
              {n.note && (
                <span className="mt-0.5 font-mono text-[0.55rem] leading-tight text-muted/60">{n.note}</span>
              )}
            </div>
          )
        })}
      </div>

      <p className="mt-4 flex items-start gap-1.5 font-mono text-[0.62rem] text-muted/70">
        <Pin className="mt-0.5 h-3 w-3 shrink-0 text-cyan" aria-hidden="true" />
        Flow path: START → generation → validation; on validation failure the CORRECT loop cycles back to
        regeneration, bounded at 3 retries, before reaching EXECUTE.
      </p>
    </div>
  )
}
