import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { Briefcase, Github, MapPin, Sparkles } from 'lucide-react'
import { experience, projects } from '../../data/resumes'

/**
 * Tab 2 — Deep Dive. Glass cards slide in from both sides (GSAP) carrying the
 * real bullet points of every experience and project. The neural network sits
 * behind, dimmed and slowly auto-rotating.
 */
export default function DeepDiveTab() {
  const left = useRef<HTMLDivElement>(null)
  const right = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const ease = 'power3.out'
      if (left.current) {
        gsap.fromTo(
          left.current,
          { x: -90, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.9, ease },
        )
      }
      if (right.current) {
        gsap.fromTo(
          right.current,
          { x: 90, opacity: 0 },
          {x: 0, opacity: 1, duration: 0.9, ease },
        )
      }
      gsap.fromTo(
        '.dd-item',
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: 0.7, ease, stagger: 0.06, delay: 0.18 },
      )
    })
    return () => ctx.revert()
  }, [])

  return (
    <div className="flex h-full flex-col px-4 pt-5 sm:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-teal-300/70">
          03 — Deep Dive
        </p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
          The details, for the recruiters
        </h2>
      </div>

      <div className="mx-auto grid min-h-0 w-full max-w-7xl flex-1 grid-cols-1 gap-5 pb-24 pt-4 md:grid-cols-2">
        {/* Applied experiences — slides in from the left */}
        <section ref={left} className="flex min-h-0 flex-col">
          <div className="mb-2 flex items-center gap-2">
            <Briefcase className="h-3.5 w-3.5 text-teal-300/80" />
            <h3 className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-400">
              Applied Experiences
            </h3>
          </div>
          <div className="pointer-events-auto min-h-0 flex-1 space-y-4 overflow-y-auto pr-1.5 pb-4 [scrollbar-width:thin]">
            {experience.map((role) => (
              <article key={role.id} className="dd-item glass rounded-2xl p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold leading-snug text-zinc-50 sm:text-base">
                      {role.title}
                    </h4>
                    <p className="mt-0.5 text-sm font-medium accent-text">
                      {role.org}
                    </p>
                  </div>
                  {role.highlight && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 font-mono text-[9px] accent-text">
                      <Sparkles className="h-2.5 w-2.5" /> highlight
                    </span>
                  )}
                </div>

                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] text-zinc-500">
                  <span>{role.period}</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {role.location}
                  </span>
                </div>

                <ul className="mt-3 space-y-2 border-t border-white/10 pt-3">
                  {role.bullets.map((b) => (
                    <li
                      key={b.text}
                      className="flex gap-2 text-[13px] leading-relaxed text-zinc-400"
                    >
                      <span className="accent-text mt-[1px]">▸</span>
                      <span>{b.text}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* Projects — slides in from the right */}
        <section ref={right} className="flex min-h-0 flex-col">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-teal-300/80" />
            <h3 className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-400">
              Projects &amp; Deliverables
            </h3>
          </div>
          <div className="pointer-events-auto min-h-0 flex-1 space-y-4 overflow-y-auto pr-1.5 pb-4 [scrollbar-width:thin]">
            {projects.map((p) => (
              <article key={p.id} className="dd-item glass rounded-2xl p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-zinc-50 sm:text-base">
                      {p.title}
                    </h4>
                    <p className="mt-0.5 text-[11px] text-zinc-500">{p.subtitle}</p>
                  </div>
                  {p.github && (
                    <a
                      href={p.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${p.title} repository`}
                      className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] p-1.5 text-zinc-400 transition-colors hover:border-white/25 hover:text-zinc-100"
                    >
                      <Github className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>

                <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">
                  {p.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.tech.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-[rgba(0,150,180,0.28)] bg-[rgba(0,150,180,0.08)] px-2 py-0.5 font-mono text-[9px] text-teal-100/80"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {p.bullets.length > 0 && (
                  <ul className="mt-3 space-y-2 border-t border-white/10 pt-3">
                    {p.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex gap-2 text-[13px] leading-relaxed text-zinc-400"
                      >
                        <span className="accent-text mt-[1px]">▸</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
