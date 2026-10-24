import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { Briefcase, MapPin, Sparkles } from 'lucide-react'
import { experience } from '../../data/resumes'

/**
 * Tab 2 — Applied Experiences. Glass cards slide in from the left and carry
 * every bullet of every role. The neural network stays behind as a slightly
 * blurred, slowly rotating miniature (same treatment as the other content
 * tabs) so the whole site keeps one visual language.
 */
export default function ExperienceTab() {
  const col = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const ease = 'power3.out'
      if (col.current) {
        gsap.fromTo(
          col.current,
          { x: -110, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.9, ease },
        )
      }
      gsap.fromTo(
        '.exp-item',
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.7, ease, stagger: 0.09, delay: 0.15 },
      )
    })
    return () => ctx.revert()
  }, [])

  return (
    <div className="flex h-full flex-col px-4 pt-5 pb-24 sm:px-8">
      <div className="w-full max-w-2xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-teal-300/70">
          03 — Applied Experiences
        </p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
          Where I&apos;ve made impact
        </h2>
      </div>

      <div ref={col} className="mt-4 flex min-h-0 w-full max-w-2xl flex-1 flex-col">
        <div className="pointer-events-auto min-h-0 flex-1 space-y-4 overflow-y-auto pr-1.5 pb-4 [scrollbar-width:thin]">
          {experience.map((role) => (
            <article key={role.id} className="exp-item glass rounded-2xl p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold leading-snug text-zinc-50 sm:text-base">
                    {role.title}
                  </h4>
                  <p className="mt-0.5 text-sm font-medium accent-text">{role.org}</p>
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

        <p className="mt-2 flex items-center gap-1.5 font-mono text-[10px] text-zinc-600">
          <Briefcase className="h-3 w-3" /> click the gold experience heads in tab 02 for the
          focused fly-in
        </p>
      </div>
    </div>
  )
}
