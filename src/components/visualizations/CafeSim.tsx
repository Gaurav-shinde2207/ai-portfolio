import { useEffect, useRef, useState } from 'react'
import { Check, Coffee, Plus, RotateCcw, ShoppingBag, X } from 'lucide-react'
import { ExternalLink } from 'lucide-react'
import { projects } from '../../data/projects'

interface MenuItem {
  id: string
  name: string
  price: number
  veg: boolean
}

const MENU: MenuItem[] = [
  { id: 'espresso', name: 'Espresso Shot', price: 160, veg: true },
  { id: 'flatwhite', name: 'Flat White', price: 220, veg: true },
  { id: 'coldbrew', name: 'Cold Brew', price: 240, veg: true },
  { id: 'mocha', name: 'Iced Mocha', price: 260, veg: true },
  { id: 'croissant', name: 'Butter Croissant', price: 180, veg: false },
  { id: 'cheesecake', name: 'Blueberry Cheesecake', price: 250, veg: false },
]

const STATUS_STEPS = ['CONFIRMED', 'IN QUEUE', 'PREPARATION', 'READY'] as const
type StatusIdx = -1 | 0 | 1 | 2 | 3

/**
 * Miniature interactive café demo: menu → conversation-style order builder →
 * server-side price validation → live status tracking. Mirrors the deployed
 * CafeMind flow; all orders here are simulated locally (₹ prices).
 */
export default function CafeSim() {
  const cafe = projects.find((p) => p.id === 'cafemind')
  const [order, setOrder] = useState<Array<{ item: MenuItem; qty: number }>>([])
  const [validated, setValidated] = useState<null | 'pass'>(null)
  const [statusIdx, setStatusIdx] = useState<StatusIdx>(-1)
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([])

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout)
    },
    [],
  )

  const add = (item: MenuItem) => {
    if (validated || statusIdx >= 0) return
    setOrder((prev) => {
      const existing = prev.find((l) => l.item.id === item.id)
      if (existing) {
        return prev.map((l) => (l.item.id === item.id ? { ...l, qty: l.qty + 1 } : l))
      }
      return [...prev, { item, qty: 1 }]
    })
  }

  const total = order.reduce((s, l) => s + l.item.price * l.qty, 0)

  const confirm = () => {
    if (order.length === 0 || validated) return
    timers.current.forEach(clearTimeout)
    timers.current = []
    // simulated server-side price validation (all items pass)
    setValidated('pass')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const step = reduced ? 300 : 1700
    STATUS_STEPS.forEach((_, i) => {
      timers.current.push(setTimeout(() => setStatusIdx(i as StatusIdx), i * step))
    })
  }

  const cancel = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setOrder([])
    setValidated(null)
    setStatusIdx(-1)
  }

  const conversationalLine = (() => {
    if (statusIdx >= 0) return "Order locked. Tracking below — prices were verified server-side against the menu database before creation."
    if (validated) return 'Confirmed. Your order is being created…'
    if (order.length > 0)
      return 'Listening. Anything for you — confirm when ready. Prices always come from the database, never from the model.'
    return 'Café open. Pick from the menu — I can only recommend from what is actually in stock, and I will wait for your confirmation.'
  })()

  return (
    <div className="panel h-full p-5 md:p-7">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-lg font-semibold text-ink">Try ordering at CaféMind</h3>
        {cafe?.demo && (
          <a href={cafe.demo} target="_blank" rel="noreferrer" className="link-cyan font-mono text-xs">
            real app <ExternalLink className="inline h-3 w-3" aria-hidden="true" />
          </a>
        )}
      </div>
      <p className="mb-5 text-sm text-muted leading-relaxed">
        Build an order; the pipeline confirms with you, validates every price server-side and tracks
        preparation status. This demo is a local simulation of the deployed workflow.
      </p>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Menu */}
        <div>
          <p className="tech-label mb-2">Menu — database-grounded</p>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {MENU.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => add(m)}
                  disabled={!!validated || statusIdx >= 0}
                  className="flex w-full items-center justify-between border border-line bg-bg-2 px-3 py-2.5 text-left transition-colors hover:border-amber/60 disabled:opacity-40"
                >
                  <span className="flex items-center gap-2">
                    <Coffee className="h-4 w-4 text-amber/70" aria-hidden="true" />
                    <span className="text-sm text-ink">{m.name}</span>
                  </span>
                  <span className="flex items-center gap-2 font-mono text-xs text-muted">
                    ₹{m.price}
                    <Plus className="h-3.5 w-3.5 text-amber" aria-hidden="true" />
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <p className="mt-3 flex items-start gap-1.5 font-mono text-[0.62rem] text-muted/70">
            <X className="mt-0.5 h-3 w-3 shrink-0 text-cyan" aria-hidden="true" />
            Gemini recommends from database stock only — it never sets prices or creates orders.
          </p>
        </div>

        {/* Conversation + status */}
        <div className="flex flex-col">
          <p className="tech-label mb-2">Conversational ordering</p>
          <div className="grow border border-line bg-bg-2 p-3">
            <p className="font-mono text-xs leading-relaxed text-cyan">model: {conversationalLine}</p>
            {order.length > 0 && (
              <ul className="mt-3 space-y-1 border-t border-line pt-3">
                {order.map((l) => (
                  <li key={l.item.id} className="flex justify-between font-mono text-xs">
                    <span className="text-ink">
                      {l.item.name} × {l.qty}
                    </span>
                    <span className="text-muted">
                      {l.qty * l.item.price} ₹
                    </span>
                  </li>
                ))}
                <li className="flex justify-between border-t border-line pt-1.5 font-mono text-xs">
                  <span className="text-amber">TOTAL</span>
                  <span className="text-amber">{total} ₹</span>
                </li>
              </ul>
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={confirm}
              disabled={order.length === 0 || !!validated}
              className="btn-primary !px-4 !py-2 grow disabled:opacity-40"
            >
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              Confirm order
            </button>
            <button
              type="button"
              onClick={cancel}
              className="grid h-10 w-10 shrink-0 place-items-center border border-line bg-bg-2 text-muted hover:border-amber hover:text-amber"
              aria-label="Cancel order"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* server validation + tracking */}
          {validated && (
            <div className="mt-3 border border-cyan/25 bg-cyan/5 p-3" data-testid="cafe-tracking">
              <p className="flex items-center gap-1.5 font-mono text-[0.68rem] text-cyan">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                server validation: prices × {order.length} lines match menu DB — order created
              </p>
              <ol className="mt-2.5 flex gap-1.5" aria-label="Order status">
                {STATUS_STEPS.map((s, i) => (
                  <li key={s} className="flex-1">
                    <span
                      className={`block h-1 rounded-full transition-colors duration-500 ${
                        statusIdx >= i ? 'bg-amber' : 'bg-line'
                      }`}
                    />
                    <span
                      className={`mt-1 block font-mono text-[0.55rem] tracking-wide transition-colors duration-500 ${
                        statusIdx >= i ? 'text-amber' : 'text-muted/50'
                      }`}
                    >
                      {s}
                    </span>
                  </li>
                ))}
              </ol>
              {statusIdx >= 1 && statusIdx < 3 && (
                <p className="mt-2 font-mono text-[0.68rem] text-ink">
                  estimated pick-up: {Math.max(2, 8 - statusIdx * 2)} min
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
