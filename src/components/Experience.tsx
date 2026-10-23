import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Briefcase, ChevronDown, GraduationCap, MapPin, Sparkles } from 'lucide-react'
import { usePersona } from '../context/PersonaContext'
import { experience, filterByPersona } from '../data/resumes'
import Reveal from './Reveal'

function TimelineItem({
  role,
  index,
  persona,
}: {
  role: (typeof experience)[number]
  index: number
  persona: 'aiml' | 'swe' | 'pm'
}) {
  const [open, setOpen] = useState(index === 0)
  const bullets = filterByPersona(role.bullets, persona)

  return (
    <Reveal delay={index * 0.1} className="relative pl-10 sm:pl-14">
      {/* Timeline rail */}
      <span className="absolute left-[13px] top-0 h-full w-px bg-gradient-to-b from-zinc-800 via-zinc-800 to-transparent sm:left-[19px]" />
      {/* Node */}
      <span className="absolute left-0 top-6 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-card sm:h-9 sm:w-9">
        <span
          className={`h-2.5 w-2.5 rounded-full transition-colors duration-500 ${
            role.highlight ? 'accent-bg accent-glow' : 'bg-zinc-600'
          }`}
        />
      </span>

      <div
        className={`glass spotlight-card cursor-pointer rounded-2xl p-5 transition-colors duration-300 hover:border-white/20 sm:p-6 ${
          role.highlight ? 'accent-border' : ''
        }`}
        onClick={() => setOpen((o) => !o)}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setOpen((o) => !o)
          }
        }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
          e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
        }}
      >
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold text-zinc-100 sm:text-lg">{role.title}</h3>
                {role.highlight && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] accent-text">
                    <Sparkles className="h-2.5 w-2.5" /> highlight
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm font-medium accent-text">{role.org}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-zinc-500">
                <span>{role.period}</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {role.location}
                </span>
              </div>
            </div>
            <ChevronDown
              className={`mt-1 h-5 w-5 shrink-0 text-zinc-500 transition-transform duration-300 ${
                open ? 'rotate-180 accent-text' : ''
              }`}
            />
          </div>

          <AnimatePresence initial={false}>
            {open && (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
                  {bullets.map((b, i) => (
                    <motion.li
                      key={b.text}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.3 }}
                      className="flex gap-3 text-sm leading-relaxed text-zinc-400"
                    >
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full accent-bg" />
                      {b.text}
                    </motion.li>
                  ))}
                </div>
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Reveal>
  )
}

/** Sleek vertical timeline of experience with expanding bullet accordions. */
export default function Experience() {
  const { personaId } = usePersona()

  return (
    <section id="experience" className="pointer-events-auto scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="mb-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest accent-text">
                <Briefcase className="h-3.5 w-3.5" /> Experience
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
                Where I&apos;ve made impact
              </h2>
              <p className="mt-3 max-w-xl text-sm text-zinc-500">
                Bullets reframe for the selected persona — try switching in the nav.
              </p>
            </div>
            <div className="glass inline-flex items-center gap-2 self-start rounded-full px-3.5 py-1.5 font-mono text-xs text-zinc-400 sm:self-auto">
              <GraduationCap className="h-3.5 w-3.5 accent-text" />
              BS CS · IBA Karachi · 2027
            </div>
          </div>
        </Reveal>

        <div className="space-y-6">
          {experience.map((role, i) => (
            <TimelineItem key={role.id} role={role} index={i} persona={personaId} />
          ))}
        </div>
      </div>
    </section>
  )
}
