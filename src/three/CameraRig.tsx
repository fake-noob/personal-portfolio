import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { clamp01, frame, smooth } from './sceneStore'

/**
 * The single camera controller.
 *
 * GSAP ScrollTrigger writes 0..1 progress values into `sceneStore.frame`;
 * this rig turns them into one continuous camera path:
 *
 *   hero → (projects sweep) → (skills dolly through the world) → certifications
 *
 * A pointer parallax offset rides on top, and selecting a neural node blends
 * the whole pose toward a close-up. Everything is damped per frame, so the
 * hand-off between sections is seamless.
 */

const HERO = { x: 0, y: 0.35, z: 15, tx: -0.4, ty: 0, tz: 0 }
const SKILLS_END = { x: 0, y: 0.2, z: -30.5, tx: 0, ty: 0.15, tz: -40 }
const CERTS_END = { x: 0, y: 0.4, z: -86.5, tx: 0, ty: -0.5, tz: -95 }

const _desired = new THREE.Vector3()
const _target = new THREE.Vector3()

const lerp = THREE.MathUtils.lerp

export default function CameraRig() {
  useFrame((state, delta) => {
    const cam = state.camera as THREE.PerspectiveCamera
    const f = frame
    const k = 1 - Math.pow(0.0015, delta) // frame-rate independent damping
    const pK = Math.min(1, delta * 6)

    // Smooth the raw pointer for the parallax offset
    f.pointer.x += (f.mouse.x - f.pointer.x) * pK
    f.pointer.y += (f.mouse.y - f.pointer.y) * pK

    // ---- base pose from the scroll-driven progress ----
    let bx = HERO.x
    let by = HERO.y
    let bz = HERO.z
    let tx = HERO.tx
    let ty = HERO.ty
    let tz = HERO.tz

    if (f.certProgress > 0.0001) {
      const t = smooth(f.certProgress)
      bx = lerp(SKILLS_END.x, CERTS_END.x, t)
      by = lerp(SKILLS_END.y, CERTS_END.y, t)
      bz = lerp(SKILLS_END.z, CERTS_END.z, t)
      tx = lerp(SKILLS_END.tx, CERTS_END.tx, t)
      ty = lerp(SKILLS_END.ty, CERTS_END.ty, t)
      tz = lerp(SKILLS_END.tz, CERTS_END.tz, t)
    } else if (f.skillsProgress > 0.0001) {
      const t = smooth(f.skillsProgress)
      bx = lerp(HERO.x, SKILLS_END.x, t)
      by = lerp(HERO.y, SKILLS_END.y, t)
      bz = lerp(HERO.z, SKILLS_END.z, t)
      tx = lerp(HERO.tx, SKILLS_END.tx, t)
      ty = lerp(HERO.ty, SKILLS_END.ty, t)
      tz = lerp(HERO.tz, SKILLS_END.tz, t)
    } else if (f.projectsProgress > 0.0001) {
      // Sweep across the network: right, closer, then settle back
      const sweep = Math.sin(Math.PI * clamp01(f.projectsProgress))
      bx = HERO.x - 3.3 * sweep
      by = HERO.y - 0.45 * sweep
      bz = HERO.z - 4.0 * sweep
      tx = HERO.tx + 1.7 * sweep
      ty = HERO.ty + 0.25 * sweep
      tz = -0.7 * sweep
    }

    // ---- pointer parallax ----
    const pStr = f.parallaxStrength * (1 - f.focusBlend * 0.85)
    _desired.set(bx + f.pointer.x * pStr, by + f.pointer.y * pStr * 0.55, bz + f.pointer.x * 0.35)
    _target.set(
      tx + f.pointer.x * pStr * 0.14,
      ty + f.pointer.y * pStr * 0.1,
      tz,
    )

    // ---- node focus blend ----
    if (f.focusBlend > 0.001) {
      _desired.lerp(f.focusCam, f.focusBlend)
      _target.lerp(f.focusTarget, f.focusBlend)
    }

    cam.position.lerp(_desired, k)
    cam.lookAt(_target)

    // Gentle hand-held roll from horizontal pointer movement
    cam.rotation.z += (-f.pointer.x * 0.022 - cam.rotation.z) * k
  })

  return null
}
