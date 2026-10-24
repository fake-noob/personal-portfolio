import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { Github, Sparkles } from 'lucide-react'
import { projects } from '../../data/resumes'

/**
 * Tab 3 — Projects & Deliverables. Glass cards slide in from the right with
 * every project's bullet points; the neural network runs behind as a slightly
 * blurred, slowly rotating miniature (same as the experiences tab).
 */
export default function ProjectsTab() {
  const col = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const ease = 'power3.out'
      if (col.current) {
        gsap.fromTo(
          col.current,
          { x: 110, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.9, ease },
        )
      }
      gsap.fromTo(
        '.proj-item',
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.7, ease, stagger: 0.08, delay: 0.15 },
      )
    })
    return () => ctx.revert()
  }, [])

  return (
    <div className="flex h-full flex-col items-end px-4 pt-5 pb-24 sm:px-8">
      <div className="w-full max-w-2xl text-left">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-teal-300/70">
          04 — Projects &amp; Deliverables
        </p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
          Things I&apos;ve shipped
        </h2>
      </div>

      <div ref={col} className="mt-4 flex min-h-0 w-full max-w-2xl flex-1 flex-col">
        <div className="pointer-events-auto min-h-0 flex-1 space-y-4 overflow-y-auto pr-1.5 pb-4 [scrollbar-width:thin]">
          {projects.map((p) => (
            <article key={p.id} className="proj-item glass rounded-2xl p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-zinc-50 sm:text-base">{p.title}</h4>
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

              <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">{p.description}</p>

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

        <p className="mt-2 flex items-center gap-1.5 font-mono text-[10px] text-zinc-600">
          <Sparkles className="h-3 w-3" /> click a cyan project head in tab 02 — the graph lights
          up halfway, then drag to explore
        </p>
      </div>
    </div>
  )
}
