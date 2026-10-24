import { MousePointerClick } from 'lucide-react'
import { projects, type Project } from '../data/resumes'
import { projectClusters } from '../three/networkLayout'
import { selectProject, useSceneValue, frame } from '../three/sceneStore'

/**
 * DOM overlay for the neural-network section. Kept as pointer-events-none
 * except for the glass flashcard, which is pinned to the LEFT of the screen
 * so the right side stays a clear drag-to-orbit zone over the WebGL canvas.
 * The chips are an accessible alternative to clicking 3D nodes, and every
 * project from every persona is listed here — grouped by semantic cluster.
 */

function ProjectChip({ project, on }: { project: Project; on: boolean }) {
  return (
    <button
      onClick={() => selectProject(on ? null : project.id)}
      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
        on
          ? 'accent-border bg-white/[0.08] text-zinc-100'
          : 'border-[rgba(0,150,180,0.28)] bg-[rgba(0,150,180,0.07)] text-zinc-400 hover:border-white/30 hover:text-zinc-100'
      }`}
    >
      <span className="accent-bg h-1.5 w-1.5 rounded-full" />
      {project.title}
    </button>
  )
}

export default function Projects() {
  const selectedId = useSceneValue(() => frame.selectedId)

  // One comprehensive experience: every project, every persona — no filtering.
  const clustered = new Set(projectClusters.flatMap((c) => c.members))
  const unclustered = projects.filter((p) => !clustered.has(p.id))

  return (
    <section id="projects" className="pointer-events-none relative h-[240vh]">
      <div className="pointer-events-none sticky top-0 h-screen">
        {/* pinned left so the right ~60% of the screen stays clear for orbiting */}
        <div className="mr-auto w-full max-w-6xl px-4 pt-24 sm:px-6">
          <div className="glass pointer-events-auto max-w-md rounded-3xl p-5 sm:p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-zinc-500">
              02 — Projects
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-50">
              An interactive neural network
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Every output node is a shipped project, grouped into semantic
              clusters. Click a pulsing node to fly the camera in and open its
              case file.
            </p>

            <div className="mt-4 space-y-3">
              {projectClusters.map((c) => (
                <div key={c.id}>
                  <p
                    className="font-mono text-[9px] uppercase tracking-[0.28em]"
                    style={{ color: c.color }}
                  >
                    {c.label}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {projects
                      .filter((p) => c.members.includes(p.id))
                      .map((p) => (
                        <ProjectChip key={p.id} project={p} on={selectedId === p.id} />
                      ))}
                  </div>
                </div>
              ))}
              {unclustered.length > 0 && (
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-zinc-500">
                    More
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {unclustered.map((p) => (
                      <ProjectChip key={p.id} project={p} on={selectedId === p.id} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <p className="mt-4 flex items-center gap-1.5 font-mono text-[10px] text-zinc-500">
              <MousePointerClick className="h-3 w-3" />
              drag to orbit · click to focus · esc to close
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
