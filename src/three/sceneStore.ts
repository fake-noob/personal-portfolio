/**
 * Mutable per-frame scene state shared between GSAP ScrollTrigger,
 * DOM pointer handlers and the R3F render loop — avoids React re-renders
 * inside useFrame. React-facing values (selection, active section) go
 * through pub/sub so DOM overlays stay in sync.
 */
import { useSyncExternalStore } from 'react'
import * as THREE from 'three'

export type ActiveSection = 'idle' | 'hero' | 'projects' | 'skills' | 'certifications'

export const frame = {
  /** raw normalized pointer, -1..1, y up */
  mouse: { x: 0, y: 0 },
  /** smoothed pointer used for camera parallax */
  pointer: { x: 0, y: 0 },
  /** pointer parallax strength in world units */
  parallaxStrength: 1.7,

  /** node focus blend 0..1 + the poses it blends toward */
  focusBlend: 0,
  focusCam: new THREE.Vector3(),
  focusTarget: new THREE.Vector3(),

  /** 0..1 scroll progress per choreographed section */
  projectsProgress: 0,
  skillsProgress: 0,
  certProgress: 0,

  /** global lights-out factor for the certifications section */
  certDim: 0,
  /** pointer currently hovering the certifications section (0/1) */
  certHover: 0,

  /** selected project node id */
  selectedId: null as string | null,
  activeSection: 'idle' as ActiveSection,
}

type Listener = () => void
const listeners = new Set<Listener>()
function emit() {
  listeners.forEach((l) => l())
}
function subscribe(l: Listener) {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

/** Select a project node (or null to clear). Drives camera focus + DOF. */
export function selectProject(id: string | null) {
  if (frame.selectedId === id) return
  frame.selectedId = id
  emit()
}

export function setActiveSection(s: ActiveSection) {
  if (frame.activeSection === s) return
  frame.activeSection = s
  emit()
}

/** React subscription for values that must re-render UI. */
export function useSceneValue<T>(read: () => T): T {
  return useSyncExternalStore(subscribe, read)
}

/** Clamp helpers */
export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
export const smooth = (v: number) => {
  const t = clamp01(v)
  return t * t * (3 - 2 * t)
}
export const ramp = (v: number, a: number, b: number) => clamp01((v - a) / (b - a))
