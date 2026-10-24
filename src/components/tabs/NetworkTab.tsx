import { columns, nodeById, traverse } from '../../three/networkData'
import { frame, useSceneValue } from '../../three/sceneStore'

/**
 * Tab 1 — the interactive neural network overlay.
 *
 * Purely informational (pointer-events-none) so the entire screen stays a
 * drag-to-revolve zone over the WebGL canvas. When an output node is clicked,
 * the small card lists exactly what the reverse traversal lit up.
 */
export default function NetworkTab() {
  const selectedId = useSceneValue(() => frame.selectedId)
  const lit = selectedId ? traverse(selectedId) : null
  const selected = selectedId ? nodeById.get(selectedId) : undefined
  // Project heads only zoom halfway — the read-out stays a hint, not a card,
  // because the user keeps free camera to explore the lit graph.
  const freeLook = !!selected && selected.col === 3

  const litNames = lit
    ? [...lit.nodes].filter((n) => n !== selectedId)
    : []

  return (
    <div className="flex h-full flex-col justify-between p-5 sm:p-7">
      {/* Kicker */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-teal-300/70">
          02 — The Network
        </p>
        <h2 className="mt-1 max-w-md text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
          Multi-head architecture
        </h2>
      </div>

      {/* Legend + instructions + traversal read-out, pinned bottom-left */}
      <div className="max-w-md space-y-3">
        {lit && selected && (
          <div className="glass rounded-2xl p-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-teal-300/70">
              reverse traversal
            </p>
            <p className="mt-1 text-sm font-semibold text-zinc-50">
              {selected.id}
            </p>
            <p className="mt-0.5 text-[11px] text-zinc-400">
              {litNames.length} prerequisite{litNames.length === 1 ? '' : 's'} lit ·{' '}
              {lit.edges.size} connections active
            </p>
            {freeLook ? (
              <p className="mt-2 font-mono text-[10px] leading-relaxed text-teal-200/80">
                free look — drag anywhere to revolve around the highlighted path
              </p>
            ) : (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {litNames.slice(0, 10).map((n) => (
                <span
                  key={n}
                  className="rounded-full border border-[rgba(0,150,180,0.35)] bg-[rgba(0,150,180,0.12)] px-2 py-0.5 font-mono text-[9px] text-teal-100/90"
                >
                  {n}
                </span>
              ))}
              {litNames.length > 10 && (
                <span className="font-mono text-[9px] text-zinc-500">
                  +{litNames.length - 10} more
                </span>
              )}
            </div>
            )}
          </div>
        )}

        <div className="glass rounded-2xl p-4">
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {columns.map((c) => (
              <li key={c.id} className="flex items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
                <span className="truncate text-[11px] text-zinc-300">
                  {c.title}
                </span>
                <span className="ml-auto font-mono text-[9px] text-zinc-600">
                  {c.nodes.length}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 font-mono text-[10px] leading-relaxed text-zinc-500">
            drag to revolve 360° · gold head = fly-in focus · cyan head = mid-zoom
            highlight you can orbit · esc to release
          </p>
        </div>
      </div>
    </div>
  )
}
