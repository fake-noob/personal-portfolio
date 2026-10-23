import { Download, FileText } from 'lucide-react'
import { usePersona } from '../context/PersonaContext'
import { resumeFiles } from '../data/resumes'
import Reveal from './Reveal'

/** Compact resume section with all three downloadable PDFs + social links. */
export default function Footer() {
  const { personaId } = usePersona()

  return (
    <footer id="resume" className="relative z-10 scroll-mt-24 border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        {/* Resume download strip */}
        <Reveal>
          <div className="mb-16">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
              Résumés, one per track
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Each PDF is tuned for its audience — pick the one that matches the conversation.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {resumeFiles.map((r) => {
                const active = r.persona === personaId
                return (
                  <a
                    key={r.persona}
                    href={r.file}
                    download
                    className={`glass group flex items-center justify-between rounded-2xl p-4 transition-all duration-300 hover:border-white/25 ${
                      active ? 'accent-border accent-glow' : ''
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <FileText
                        className={`h-5 w-5 transition-colors ${active ? 'accent-text' : 'text-zinc-500'}`}
                      />
                      <span className="text-sm font-medium text-zinc-200">{r.label}</span>
                    </span>
                    <Download className="h-4 w-4 text-zinc-500 transition-transform group-hover:translate-y-0.5 group-hover:text-zinc-200" />
                  </a>
                )
              })}
            </div>
          </div>
        </Reveal>

        {/* Minimalist bottom bar */}
        <div className="flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 sm:flex-row">
          <div className="text-center sm:text-left">
            <p className="font-mono text-sm text-zinc-300">
              Muhammad Ahzam<span className="accent-text">.</span>
            </p>
            <p className="mt-1 text-xs text-zinc-600">
              Karachi, Pakistan · muhammadahzam115@gmail.com
            </p>
          </div>

          <div className="flex items-center gap-5 font-mono text-xs text-zinc-500">
            <a
              href="https://linkedin.com/in/mAhzam"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-zinc-200"
            >
              LinkedIn
            </a>
            <span className="h-3 w-px bg-zinc-800" />
            <a
              href="https://github.com/fake-noob"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-zinc-200"
            >
              GitHub
            </a>
            <span className="h-3 w-px bg-zinc-800" />
            <a
              href="mailto:muhammadahzam115@gmail.com"
              className="transition-colors hover:text-zinc-200"
            >
              Email
            </a>
          </div>
        </div>

        <p className="mt-8 text-center font-mono text-[10px] text-zinc-700">
          Built with React · Tailwind · Framer Motion — © 2026
        </p>
      </div>
    </footer>
  )
}
