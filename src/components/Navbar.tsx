import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { usePersona } from '../context/PersonaContext'
import { personas, type PersonaId } from '../data/resumes'

const links = [
  { href: '#experience', label: 'Experience' },
  { href: '#projects', label: 'Projects' },
  { href: '#skills', label: 'Skills' },
  { href: '#certifications', label: 'Certs' },
  { href: '#resume', label: 'Resume' },
]

/** Sleek 3-way toggle that drives the whole site's persona + accent color. */
export function PersonaSwitcher({ compact = false }: { compact?: boolean }) {
  const { personaId, setPersona } = usePersona()

  return (
    <div
      role="tablist"
      aria-label="Select professional persona"
      className="glass pointer-events-auto flex items-center gap-1 rounded-full p-1"
    >
      {personas.map((p: (typeof personas)[number]) => {
        const active = p.id === personaId
        return (
          <button
            key={p.id}
            role="tab"
            aria-selected={active}
            onClick={() => setPersona(p.id as PersonaId)}
            className={`relative rounded-full px-3.5 py-1.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 accent-ring sm:text-sm ${
              active ? 'text-ink' : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            {active && (
              <motion.span
                layoutId="persona-pill"
                className="accent-bg absolute inset-0 rounded-full"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative z-10 whitespace-nowrap">
              {compact ? p.shortLabel : p.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/** Sticky, blurred backdrop navigation bar. */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'border-b border-white/10 bg-ink/70 backdrop-blur-md'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <a href="#top" className="group flex items-center gap-2 font-mono text-sm font-semibold">
          <span className="accent-text transition-transform duration-300 group-hover:scale-110">
            {'</>'}
          </span>
          <span className="hidden text-zinc-200 sm:inline">ahzam</span>
        </a>

        <div className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
            >
              {l.label}
            </a>
          ))}
        </div>

        <PersonaSwitcher compact />
      </nav>
    </header>
  )
}
