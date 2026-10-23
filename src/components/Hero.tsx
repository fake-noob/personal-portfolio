import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown, ChevronDown, Download, FileText } from 'lucide-react'
import { usePersona } from '../context/PersonaContext'
import { resumeFiles } from '../data/resumes'
import { PersonaSwitcher } from './Navbar'

/** Typewriter effect that re-types whenever the persona (and phrase list) changes. */
function Typewriter({ phrases }: { phrases: string[] }) {
  const [text, setText] = useState('')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    setText('')
    setPhraseIndex(0)
    setDeleting(false)
  }, [phrases])

  useEffect(() => {
    const current = phrases[phraseIndex % phrases.length]
    const timeout = setTimeout(
      () => {
        if (!deleting) {
          setText(current.slice(0, text.length + 1))
          if (text.length + 1 === current.length) setDeleting(true)
        } else {
          setText(current.slice(0, text.length - 1))
          if (text.length - 1 === 0) {
            setDeleting(false)
            setPhraseIndex((i) => i + 1)
          }
        }
      },
      deleting ? 35 : 65,
    )
    return () => clearTimeout(timeout)
  }, [text, deleting, phraseIndex, phrases])

  return (
    <span className="accent-text">
      {text}
      <span className="ml-0.5 inline-block w-[3px] animate-caret bg-current align-middle" />
    </span>
  )
}

/** Dropdown offering all three resume PDFs. The active persona's is marked. */
function ResumeDropdown() {
  const { personaId } = usePersona()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('[data-resume-dropdown]')) setOpen(false)
    }
    window.addEventListener('click', onClick)
    return () => window.removeEventListener('click', onClick)
  }, [])

  return (
    <div className="relative" data-resume-dropdown>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="glass group flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:border-white/25 hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 accent-ring"
      >
        <Download className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
        Download Resume
        <ChevronDown
          className={`h-3.5 w-3.5 text-zinc-500 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="glass absolute left-0 top-[calc(100%+8px)] z-50 w-64 overflow-hidden rounded-xl p-1.5 shadow-2xl"
          >
            {resumeFiles.map((r) => (
              <li key={r.persona}>
                <a
                  href={r.file}
                  download
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-white/[0.07] ${
                    r.persona === personaId ? 'text-zinc-100' : 'text-zinc-400'
                  }`}
                >
                  <FileText className="h-4 w-4 shrink-0 accent-text" />
                  {r.label}
                  {r.persona === personaId && (
                    <span className="ml-auto rounded-full accent-bg px-2 py-0.5 font-mono text-[10px] font-semibold text-ink">
                      ACTIVE
                    </span>
                  )}
                </a>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Hero: animated headline, persona-adaptive bio, persona switcher and CTAs. */
export default function Hero() {
  const { persona } = usePersona()

  return (
    <section id="top" className="pointer-events-auto relative flex min-h-svh flex-col justify-center pt-28 pb-20">
      {/* keeps the headline readable over the WebGL network */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(4,6,12,0.9)_0%,rgba(4,6,12,0.62)_36%,rgba(4,6,12,0.18)_60%,transparent_78%)]"
      />
      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
        {/* Status pill */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 font-mono text-xs text-zinc-400"
        >
          <span className="relative flex h-2 w-2">
            <span className="accent-bg absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" />
            <span className="accent-bg relative inline-flex h-2 w-2 rounded-full" />
          </span>
          Open to internships &amp; new-grad roles · Expected 2027
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl font-bold leading-[1.05] tracking-tight text-zinc-50 sm:text-6xl lg:text-7xl"
        >
          Muhammad Ahzam
          <br />
          <span className="text-zinc-500">ships&nbsp;</span>
          <Typewriter key={persona.id} phrases={persona.typewriterPhrases} />
        </motion.h1>

        {/* Adaptive bio — cross-fades on persona change */}
        <AnimatePresence mode="wait">
          <motion.p
            key={persona.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg"
          >
            {persona.bio}
          </motion.p>
        </AnimatePresence>

        {/* Persona headline + focus tags */}
        <AnimatePresence mode="wait">
          <motion.div
            key={persona.id + '-focus'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-4 flex flex-wrap items-center gap-2"
          >
            <span className="font-mono text-xs accent-text">▸ {persona.headline}</span>
            {persona.focus.map((f) => (
              <span
                key={f}
                className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] text-zinc-400"
              >
                {f}
              </span>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Switcher (mobile-first placement; always visible) + CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="mt-9 flex flex-col gap-5 sm:flex-row sm:items-center"
        >
          <PersonaSwitcher />
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#projects"
              className="accent-glow accent-bg group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-ink transition-transform duration-300 hover:-translate-y-0.5"
            >
              View Projects
              <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
            </a>
            <ResumeDropdown />
          </div>
        </motion.div>

        {/* Education strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mt-14 flex items-center gap-3 font-mono text-xs text-zinc-500"
        >
          <span className="h-px w-10 bg-zinc-800" />
          BS Computer Science · IBA Karachi · Expected 2027
        </motion.div>
      </div>
    </section>
  )
}
