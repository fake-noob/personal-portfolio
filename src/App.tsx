import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import SceneCanvas from './three/SceneCanvas'
import TabControls from './components/TabControls'
import IntroTab from './components/tabs/IntroTab'
import NetworkTab from './components/tabs/NetworkTab'
import ExperienceTab from './components/tabs/ExperienceTab'
import ProjectsTab from './components/tabs/ProjectsTab'
import CertsTab from './components/tabs/CertsTab'
import ContactTab from './components/tabs/ContactTab'
import { selectProject, setTab, TAB_COUNT } from './three/sceneStore'

const TABS = [IntroTab, NetworkTab, ExperienceTab, ProjectsTab, CertsTab, ContactTab]

/**
 * Discrete tab system: no navigation bar, no free scrolling.
 * The user moves strictly with the on-screen Up/Down buttons or the
 * ArrowUp / ArrowDown keys; the WebGL canvas stays fixed behind everything.
 */
export default function App() {
  const [tab, setTabState] = useState(0)

  const go = useCallback((next: number) => {
    const t = Math.max(0, Math.min(TAB_COUNT - 1, next))
    setTabState(t)
    setTab(t) // mirror into the scene store for the canvas
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        go(tab + 1)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        go(tab - 1)
      } else if (e.key === 'Escape') {
        selectProject(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [tab, go])

  const Active = TABS[tab]

  return (
    <div className="grain relative h-[100dvh] w-full overflow-hidden bg-gradient-to-b from-black to-[#020813]">
      {/* Full-screen WebGL background, fixed across all tabs */}
      <SceneCanvas />

      {/* Tab panels cross-fade above it; each panel decides its own hit-testing */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute inset-0 z-10"
        >
          <Active />
        </motion.div>
      </AnimatePresence>

      <TabControls tab={tab} onTab={go} />
    </div>
  )
}
