import { ChevronDown, ChevronUp } from 'lucide-react'
import { TAB_COUNT, TAB_NAMES } from '../three/sceneStore'

/**
 * The only navigation in the app: glass Up/Down buttons (plus the matching
 * ArrowUp/ArrowDown keys) and a small state indicator. Deliberately not a
 * nav bar — it lives at the bottom edge and carries no links.
 */
export default function TabControls({
  tab,
  onTab,
}: {
  tab: number
  onTab: (t: number) => void
}) {
  const atTop = tab === 0
  const atBottom = tab === TAB_COUNT - 1

  const btn =
    'flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(0,150,180,0.3)] bg-[rgba(0,150,180,0.12)] text-teal-200/90 backdrop-blur-xl transition-all duration-300 hover:border-[rgba(0,150,180,0.6)] hover:bg-[rgba(0,150,180,0.22)] hover:text-white disabled:pointer-events-none disabled:opacity-25'

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex flex-col items-center gap-2 pb-5">
      <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-zinc-600">
        ↑ ↓ keys or arrows to navigate
      </p>

      <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-white/10 bg-black/40 px-3 py-2 backdrop-blur-xl">
        <button
          type="button"
          aria-label="Previous tab"
          className={btn}
          disabled={atTop}
          onClick={() => onTab(tab - 1)}
        >
          <ChevronUp className="h-4 w-4" />
        </button>

        <div className="flex min-w-[190px] flex-col items-center leading-none">
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-500">
            {String(tab + 1).padStart(2, '0')} / {String(TAB_COUNT).padStart(2, '0')}
          </span>
          <span className="mt-1 text-sm font-medium text-zinc-100">
            {TAB_NAMES[tab]}
          </span>
          {/* state dots — indicators only, not links */}
          <div className="mt-2 flex gap-1.5">
            {TAB_NAMES.map((name, i) => (
              <span
                key={name}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === tab ? 'w-4 bg-teal-400/80' : 'w-1 bg-zinc-700'
                }`}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          aria-label="Next tab"
          className={btn}
          disabled={atBottom}
          onClick={() => onTab(tab + 1)}
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
