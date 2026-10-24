import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react'
import { ShieldCheck } from 'lucide-react'
import { certifications } from '../../data/resumes'

/**
 * Tab 3 — Certifications with the interactive flashlight.
 *
 * The cards render as bright frosted glass; a dark layer sits on top of them
 * with a radial-gradient MASK mapped to the smoothed mouse coordinates, so
 * the beam only lights the cards it actually hovers. A screen-blended teal
 * bloom rides inside the same beam.
 */
export default function CertsTab() {
  const layer = useRef<HTMLDivElement>(null)
  const target = useRef({ x: -1, y: -1 })
  const cur = useRef({ x: -1, y: -1 })
  const entered = useRef(false)

  useEffect(() => {
    let raf = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const el = layer.current
      if (!el || target.current.x < 0) return
      cur.current.x += (target.current.x - cur.current.x) * 0.18
      cur.current.y += (target.current.y - cur.current.y) * 0.18
      el.style.setProperty('--fx', `${cur.current.x.toFixed(1)}px`)
      el.style.setProperty('--fy', `${cur.current.y.toFixed(1)}px`)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  const onMove = (e: ReactPointerEvent<HTMLElement>) => {
    const r = layer.current?.getBoundingClientRect()
    if (!r) return
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    if (!entered.current) {
      cur.current.x = x
      cur.current.y = y
      entered.current = true
    }
    target.current.x = x
    target.current.y = y
  }

  return (
    <div
      className="flex h-full flex-col px-4 pt-5 pb-24 sm:px-8"
      onPointerMove={onMove}
      onPointerEnter={() => (entered.current = false)}
    >
      <div className="mx-auto w-full max-w-6xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-teal-300/70">
          04 — Certifications
        </p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
          The shelf, lit by your cursor
        </h2>
        <p className="mt-2 max-w-lg text-sm text-zinc-500">
          Move the pointer — a radial beam unmasks the frosted glass only where
          you hover.
        </p>
      </div>

      <div ref={layer} className="relative mx-auto mt-6 min-h-0 w-full max-w-6xl flex-1">
        {/* Bright frosted-glass cards (the base layer) */}
        <div className="grid grid-cols-1 content-start gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {certifications.map((c) => (
            <article
              key={c.title}
              className="rounded-2xl border border-[rgba(0,150,180,0.35)] bg-[rgba(0,150,180,0.15)] p-4 backdrop-blur-xl"
            >
              <ShieldCheck className="h-4 w-4 text-teal-300" />
              <h3 className="mt-2 text-sm font-medium leading-snug text-zinc-50">
                {c.title}
              </h3>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-teal-200/70">
                {c.issuer}
              </p>
            </article>
          ))}
        </div>

        {/* Darkness everywhere except the beam: radial-gradient MASK on the
            dark layer, mapped to the smoothed mouse position */}
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background: 'rgba(2, 4, 9, 0.945)',
            maskImage:
              'radial-gradient(circle 300px at var(--fx, 50%) var(--fy, 40%), transparent 0%, transparent 38%, black 92%)',
            WebkitMaskImage:
              'radial-gradient(circle 300px at var(--fx, 50%) var(--fy, 40%), transparent 0%, transparent 38%, black 92%)',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
          }}
        />

        {/* Soft teal bloom riding inside the beam */}
        <div
          className="pointer-events-none absolute inset-0 z-20 mix-blend-screen"
          style={{
            background:
              'radial-gradient(circle 240px at var(--fx, 50%) var(--fy, 40%), rgba(0,150,180,0.20), rgba(0,150,180,0.06) 52%, transparent 76%)',
          }}
        />
      </div>
    </div>
  )
}
