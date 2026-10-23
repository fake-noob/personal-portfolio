import { MousePointerClick } from 'lucide-react'
import { usePersona } from '../context/PersonaContext'
import { projects } from '../data/resumes'
import { selectProject, useSceneValue, frame } from '../three/sceneStore'

/**
 * DOM overlay for the neural-network section. Kept as pointer-events-none
 * glass so the canvas underneath still receives raycasts; only the project
 * chips are interactive (an accessible alternative to clicking 3D nodes).
 */
export default function Projects() {
  const { personaId } = usePersona()
  const selectedId = useSceneValue(() => frame.selectedId)
  const active = projects.filter((p) => p.personas.includes(personaId))

  return (
    <section id="projects" className="pointer-events-none relative h-[240vh]">
      <div className="pointer-events-none sticky top-0 h-screen">
        <div className="mx-auto w-full max-w-6xl px-4 pt-24 sm:px-6">
          <div className="glass pointer-events-auto max-w-md rounded-3xl p-5 sm:p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-zinc-500">
              02 — Projects
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-50">
              An interactive neural network
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Every output node is a shipped project. Click a pulsing node to fly the
              camera in and open its case file.
            </p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {active.map((p) => {
                const on = selectedId === p.id
                return (
                  <button
                    key={p.id}
                    onClick={() => selectProject(on ? null : p.id)}
                    className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                      on
                        ? 'accent-border bg-white/[0.08] text-zinc-100'
                        : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/25 hover:text-zinc-100'
                    }`}
                  >
                    <span className="accent-bg h-1.5 w-1.5 rounded-full" />
                    {p.title}
                  </button>
                )
              })}
            </div>

            <p className="mt-4 flex items-center gap-1.5 font-mono text-[10px] text-zinc-500">
              <MousePointerClick className="h-3 w-3" />
              move to orbit · click to focus · esc to close
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
