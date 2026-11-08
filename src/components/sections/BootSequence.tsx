import { useEffect, useState } from 'react'

const BOOT_LINES = [
  '[SYS] INITIALIZING GAURAV.AI',
  '[SYS] LOADING ENGINEERING PROFILE',
  '[SYS] CONNECTING PROJECT DATABASE',
  '[SYS] INITIALIZING INTELLIGENCE SYSTEMS',
  '[SYS] ESTABLISHING NEURAL CONNECTIONS',
  '[SYS] SYSTEM ONLINE',
]

const LINE_MS = 340   // per line
const HOLD_MS = 420   // hang on SYSTEM ONLINE
const FADE_MS = 500

export default function BootSequence({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(0)
  const [fading, setFading] = useState(false)

  const finish = () => {
    // guard: finish may fire after fade already scheduled
    setFading(true)
    setTimeout(onDone, FADE_MS)
  }

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      onDone()
      return
    }
    const timers: Array<ReturnType<typeof setTimeout>> = []
    for (let i = 1; i <= BOOT_LINES.length; i++) {
      timers.push(setTimeout(() => setCount(i), i * LINE_MS))
    }
    const total = BOOT_LINES.length * LINE_MS + HOLD_MS
    timers.push(setTimeout(() => finish(), total))
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      timers.forEach(clearTimeout)
      window.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="System boot animation"
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-bg transition-opacity duration-500 ${
        fading ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <div className="scanlines relative w-full max-w-xl px-6">
        <div className="mb-5 flex items-center justify-between">
          <span className="font-mono text-xs tracking-[0.2em] text-amber">GAURAV.AI</span>
          <button
            type="button"
            onClick={() => finish()}
            className="border border-line px-2.5 py-1 font-mono text-[0.65rem] tracking-[0.12em] text-muted transition-colors hover:border-amber hover:text-amber"
          >
            SKIP INTRO
          </button>
        </div>

        <div className="space-y-1.5" aria-hidden="true">
          {BOOT_LINES.map((line, i) => (
            <p
              key={line}
              className={`font-mono text-xs transition-opacity duration-200 md:text-sm ${
                i < count ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <span className={i === BOOT_LINES.length - 1 && i < count ? 'text-amber' : 'text-cyan'}>
                {line}
              </span>
            </p>
          ))}
        </div>

        {/* progress */}
        <div
          className="mt-6 h-0.5 w-full bg-line"
          role="progressbar"
          aria-label="Boot progress"
          aria-valuenow={Math.round((count / BOOT_LINES.length) * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-amber transition-[width] duration-300"
            style={{ width: `${(count / BOOT_LINES.length) * 100}%` }}
          />
        </div>
        <p className="mt-2 font-mono text-[0.6rem] text-muted/60">
          Press ESC or SKIP INTRO to continue immediately · shown once per session
        </p>
      </div>
    </div>
  )
}
