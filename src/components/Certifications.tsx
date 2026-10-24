import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react'
import { GraduationCap, ShieldCheck } from 'lucide-react'
import { certifications, profile } from '../data/resumes'
import { frame, useSceneValue } from '../three/sceneStore'

/**
 * Certifications — a dark glass section intersecting the WebGL canvas.
 *
 * - ScrollTrigger already drops the global lighting (`frame.certDim`).
 * - The cursor drives a CSS "flashlight": a radial darkness mask plus a
 *   screen-blended glow that lights the frosted-glass edges of the cards.
 * - The matching 3D point light (CertTypography) follows the same cursor and
 *   casts real shadows on the extruded type — but only while hovered.
 */
export default function Certifications() {
  const activeSection = useSceneValue(() => frame.activeSection)
  const beamOn = activeSection === 'certifications'
  // One merged shelf: every certification from all three resumes, always.
  const allCerts = certifications

  const host = useRef<HTMLDivElement>(null)
  const target = useRef({ x: 0, y: 0 })
  const cur = useRef({ x: 0, y: 0 })
  const entered = useRef(false)

  useEffect(() => {
    let raf = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const el = host.current
      if (!el) return
      cur.current.x += (target.current.x - cur.current.x) * 0.16
      cur.current.y += (target.current.y - cur.current.y) * 0.16
      el.style.setProperty('--fx', `${cur.current.x.toFixed(1)}px`)
      el.style.setProperty('--fy', `${cur.current.y.toFixed(1)}px`)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  const onMove = (e: ReactPointerEvent<HTMLElement>) => {
    // also arm the 3D flashlight if we arrived by scrolling, not by entering
    frame.certHover = 1
    const r = host.current?.getBoundingClientRect()
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
    <section
      id="certifications"
      className="pointer-events-auto relative h-[190vh]"
      onPointerMove={onMove}
      onPointerEnter={() => {
        entered.current = false
        frame.certHover = 1
      }}
      onPointerLeave={() => {
        frame.certHover = 0
      }}
    >
      <div ref={host} className="sticky top-0 h-screen overflow-hidden">
        {/* darkened scrim so the canvas reads as "lights out" */}
        <div className="pointer-events-none absolute inset-0 bg-[#04060c]/55" />

        {/* flashlight: darkness outside the beam */}
        <div
          className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-700"
          style={{
            opacity: beamOn ? 1 : 0,
            background:
              'radial-gradient(circle 280px at var(--fx, 50%) var(--fy, 32%), rgba(2,3,7,0) 0%, rgba(2,3,7,0.38) 42%, rgba(2,3,7,0.92) 100%)',
          }}
        />

        {/* flashlight: light bloom that catches frosted-glass edges */}
        <div
          className="pointer-events-none absolute inset-0 z-30 mix-blend-screen transition-opacity duration-700"
          style={{
            opacity: beamOn ? 1 : 0,
            background:
              'radial-gradient(circle 220px at var(--fx, 50%) var(--fy, 32%), rgba(196,219,255,0.22), rgba(130,170,255,0.07) 46%, transparent 72%)',
          }}
        />

        <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-between px-4 pt-24 pb-10 sm:px-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-zinc-500">
              04 — Credentials
            </p>
            <h2 className="mt-2 max-w-xl text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
              The shelf, lit by your cursor.
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-400">
              Move the pointer — the beam wakes the frosted glass and throws real
              shadows across the type behind it.
            </p>
          </div>

          <div className="max-h-[52vh] overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {allCerts.map((c) => (
                <article
                  key={c.title}
                  className="glass rounded-2xl p-4 transition-colors duration-300 hover:border-white/25"
                >
                  <div className="flex items-start justify-between gap-2">
                    <ShieldCheck className="accent-text h-4 w-4 shrink-0" />
                    {c.status && (
                      <span className="rounded-full border border-white/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-zinc-400">
                        {c.status}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 text-sm font-medium leading-snug text-zinc-100">
                    {c.title}
                  </h3>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                    {c.issuer}
                  </p>
                </article>
              ))}

              <div className="glass rounded-2xl p-4 sm:col-span-2 lg:col-span-3">
                <div className="flex items-start gap-3">
                  <GraduationCap className="accent-text mt-0.5 h-4 w-4 shrink-0" />
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-zinc-100">
                      {profile.education.degree} — {profile.education.school}
                    </h3>
                    <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
                      {profile.education.coursework}
                    </p>
                  </div>
                  <span className="ml-auto shrink-0 font-mono text-[10px] text-zinc-500">
                    {profile.education.period}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
