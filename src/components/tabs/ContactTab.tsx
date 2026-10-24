import { useRef } from 'react'
import { Download, Github, Linkedin, Mail, MapPin, Phone } from 'lucide-react'
import { profile, resumeFiles } from '../../data/resumes'

/**
 * Tab 4 — Contact. A single floating holographic glass card:
 *  - 3D tilt mapped to mouse position over the card
 *  - magnetic pull on the GitHub / LinkedIn / Email icons and the three
 *    resume download buttons (they drift toward the cursor inside a radius)
 */
export default function ContactTab() {
  const card = useRef<HTMLDivElement>(null)
  const magnets = useRef<{ el: HTMLElement; cx: number; cy: number }[]>([])
  const MAGNET_RADIUS = 140

  const measure = () => {
    const c = card.current
    if (!c) return []
    // measure while untransformed (called on pointer-enter / after reset)
    return [...c.querySelectorAll<HTMLElement>('[data-magnet]')].map((el) => {
      const b = el.getBoundingClientRect()
      return { el, cx: b.left + b.width / 2, cy: b.top + b.height / 2 }
    })
  }

  const onEnter = () => {
    const c = card.current
    if (c) c.style.transform = 'perspective(1100px) rotateY(0deg) rotateX(0deg)'
    card.current
      ?.querySelectorAll<HTMLElement>('[data-magnet]')
      .forEach((el) => (el.style.transform = 'translate(0px, 0px)'))
    magnets.current = measure()
  }

  const onMove = (e: React.PointerEvent) => {
    const c = card.current
    if (!c) return
    if (magnets.current.length === 0) magnets.current = measure()

    // ---- card tilt ----
    const r = c.getBoundingClientRect()
    const px = (e.clientX - (r.left + r.width / 2)) / (r.width / 2)
    const py = (e.clientY - (r.top + r.height / 2)) / (r.height / 2)
    const cl = (v: number) => (v < -1 ? -1 : v > 1 ? 1 : v)
    c.style.transform = `perspective(1100px) rotateY(${cl(px) * 7}deg) rotateX(${-cl(py) * 6}deg)`

    // ---- magnetic pull ----
    for (const m of magnets.current) {
      const dx = e.clientX - m.cx
      const dy = e.clientY - m.cy
      const dist = Math.hypot(dx, dy)
      if (dist < MAGNET_RADIUS) {
        const pull = 0.32 * (1 - dist / MAGNET_RADIUS)
        m.el.style.transform = `translate(${dx * pull}px, ${dy * pull}px)`
      } else if (m.el.style.transform && m.el.style.transform !== 'translate(0px, 0px)') {
        m.el.style.transform = 'translate(0px, 0px)'
      }
    }
  }

  const onLeave = () => {
    const c = card.current
    if (c) c.style.transform = 'perspective(1100px) rotateY(0deg) rotateX(0deg)'
    for (const m of magnets.current) m.el.style.transform = 'translate(0px, 0px)'
  }

  const socials = [
    { label: 'GitHub', href: profile.github, Icon: Github },
    { label: 'LinkedIn', href: profile.linkedin, Icon: Linkedin },
    { label: 'Email', href: `mailto:${profile.email}`, Icon: Mail },
  ]

  return (
    <div className="pointer-events-auto flex h-full items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div
          ref={card}
          onPointerEnter={onEnter}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
          className="glass rounded-[28px] p-7 shadow-[0_30px_90px_rgba(0,0,0,0.6)] sm:p-9"
          style={{
            transformStyle: 'preserve-3d',
            transition: 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-teal-300/70">
            05 — Contact &amp; Resumes
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-50">
            Let&apos;s build something
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Open to anything — internships, collaborations, or a stubborn
            problem worth solving.
          </p>

          {/* Magnetic social icons */}
          <div className="mt-6 flex gap-3">
            {socials.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('mailto:') ? undefined : '_blank'}
                rel="noopener noreferrer"
                aria-label={label}
                data-magnet
                className="group flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(0,150,180,0.35)] bg-[rgba(0,150,180,0.14)] text-teal-200 transition-colors duration-300 hover:border-[rgba(0,150,180,0.7)] hover:text-white"
                style={{ transition: 'transform 260ms cubic-bezier(0.22,1,0.36,1), border-color 300ms, color 300ms' }}
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] text-zinc-500">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3 w-3" /> {profile.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-3 w-3" /> {profile.phone}
            </span>
          </div>

          {/* Magnetic resume downloads */}
          <div className="mt-6 border-t border-white/10 pt-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
              Résumés — pick your track
            </p>
            <div className="mt-3 grid gap-2.5">
              {resumeFiles.map((r) => (
                <a
                  key={r.persona}
                  href={r.file}
                  download
                  data-magnet
                  className="flex items-center justify-between rounded-xl border border-[rgba(0,150,180,0.3)] bg-[rgba(0,150,180,0.12)] px-4 py-3 text-sm font-medium text-zinc-100 transition-colors duration-300 hover:border-[rgba(0,150,180,0.7)] hover:bg-[rgba(0,150,180,0.2)]"
                  style={{ transition: 'transform 260ms cubic-bezier(0.22,1,0.36,1), border-color 300ms, background-color 300ms' }}
                >
                  <span className="inline-flex items-center gap-2.5">
                    <Download className="h-4 w-4 text-teal-300" />
                    {r.label}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-teal-300/70">
                    PDF
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
