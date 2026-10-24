/**
 * Mutable per-frame scene state shared between the tab system, DOM pointer
 * handlers and the R3F render loop — avoids React re-renders inside
 * useFrame. React-facing values (selection, active tab) go through pub/sub
 * so DOM overlays stay in sync.
 */
import { useSyncExternalStore } from 'react'
import * as THREE from 'three'

export const TAB_COUNT = 6
export const TAB_NAMES = [
  'Introduction',
  'Neural Network',
  'Applied Experiences',
  'Projects & Deliverables',
  'Certifications',
  'Contact',
] as const

export const frame = {
  /** raw normalized pointer, -1..1, y up */
  mouse: { x: 0, y: 0 },
  /** smoothed pointer used for camera parallax */
  pointer: { x: 0, y: 0 },
  /** pointer parallax strength in world units */
  parallaxStrength: 1.5,

  /** discrete tab state, 0..4 — drives camera pose, blur and interactivity */
  tab: 0,

  /** node focus blend 0..1 + the poses it blends toward */
  focusBlend: 0,
  focusCam: new THREE.Vector3(),
  focusTarget: new THREE.Vector3(),

  /**
   * 1 while the user is click-drag orbiting in Tab 1 (OrbitControls owns the
   * camera), 0 while CameraRig drives it. Reset by tab changes / selection.
   */
  orbitActive: 0,

  /** global lights-out factor (Tab 3 is fully dark, Tab 4 half) */
  certDim: 0,
  /** pointer currently inside the certifications flashlight (0/1) */
  certHover: 0,

  /** selected output node id (drives reverse-traversal glow + focus) */
  selectedId: null as string | null,
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

/** Select an output node (or null to clear). Drives camera focus + glow. */
export function selectProject(id: string | null) {
  frame.orbitActive = 0 // any selection change returns the camera to the rig
  if (frame.selectedId === id) return
  frame.selectedId = id
  emit()
}

/** Switch tabs: clears the selection and hands the camera back to the rig. */
export function setTab(tab: number) {
  const t = tab < 0 ? 0 : tab > TAB_COUNT - 1 ? TAB_COUNT - 1 : tab
  if (frame.tab === t) return
  if (frame.selectedId) {
    frame.selectedId = null
  }
  frame.orbitActive = 0
  frame.focusBlend = 0
  frame.tab = t
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
