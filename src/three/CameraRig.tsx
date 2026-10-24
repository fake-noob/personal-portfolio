import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { frame } from './sceneStore'

/**
 * The single camera controller for the discrete tab system.
 *
 * Each tab owns one base pose; the rig damps toward it every frame, so
 * switching tabs glides the camera instead of cutting. Pointer parallax
 * rides on top, and selecting a neural node blends the pose toward a
 * close-up. In Tab 1 a click-drag hands the camera to OrbitControls
 * (frame.orbitActive) and the rig stands down until selection/tab changes.
 */

interface Pose {
  x: number
  y: number
  z: number
  tx: number
  ty: number
  tz: number
}

/** Tab poses: distant intro → sharp focus → background → dark → centered card */
const POSES: Pose[] = [
  { x: 0, y: 0.5, z: 30, tx: 0, ty: 0, tz: 0 }, // 0 intro (network far + blurred)
  { x: 0, y: 0, z: 15, tx: 0, ty: 0, tz: 0 }, // 1 network (sharp, centered)
  { x: 0, y: 1.4, z: 25, tx: 0, ty: 0.4, tz: 0 }, // 2 deep dive (background)
  { x: 0, y: 0.4, z: 27, tx: 0, ty: 0, tz: 0 }, // 3 certifications (lights out)
  { x: 0, y: -0.8, z: 23, tx: 0, ty: 0.3, tz: 0 }, // 4 contact
]

const _desired = new THREE.Vector3()
const _target = new THREE.Vector3()
const _lookMatrix = new THREE.Matrix4()
const _lookQuat = new THREE.Quaternion()

export default function CameraRig() {
  /* drei's OrbitControls (makeDefault) runs controls.update() at priority -1,
     BEFORE this rig — and update() lookAt()'s its own target. We therefore
     keep the controls' target in sync with the rig's desired look-at every
     frame, so its lookAt lands where we want (and node focus flights actually
     centre the node). While orbiting, the controls own the target untouched. */
  const controls = useThree((s) => s.controls) as
    | { target?: THREE.Vector3 }
    | null
    | undefined

  useFrame((state, delta) => {
    const cam = state.camera as THREE.PerspectiveCamera
    const f = frame
    const k = 1 - Math.pow(0.0015, delta) // frame-rate independent damping
    const pK = Math.min(1, delta * 6)

    // Smooth the raw pointer for the parallax offset
    f.pointer.x += (f.mouse.x - f.pointer.x) * pK
    f.pointer.y += (f.mouse.y - f.pointer.y) * pK

    // While the user click-drags in Tab 1, OrbitControls owns the camera.
    if (f.orbitActive) return

    const pose = POSES[f.tab] ?? POSES[0]

    // Narrow viewports need to pull back so all four columns stay framed.
    const aspect = state.viewport.aspect || 1.7
    const zScale = Math.max(1, 1.75 / aspect)

    // ---- pointer parallax ----
    const pStr = f.parallaxStrength * (1 - f.focusBlend * 0.85)
    _desired.set(
      pose.x + f.pointer.x * pStr,
      pose.y + f.pointer.y * pStr * 0.55,
      pose.z * zScale + f.pointer.x * 0.35,
    )
    _target.set(
      pose.tx + f.pointer.x * pStr * 0.14,
      pose.ty + f.pointer.y * pStr * 0.1,
      pose.tz,
    )

    // ---- node focus blend ----
    if (f.focusBlend > 0.001) {
      _desired.lerp(f.focusCam, f.focusBlend)
      _target.lerp(f.focusTarget, f.focusBlend)
    }

    // Hand the look-at target to OrbitControls so its update() agrees with us.
    if (controls && controls.target) controls.target.copy(_target)

    // Position and orientation both damp toward the desired pose; orientation
    // uses a quaternion slerp so reclaiming the camera from OrbitControls
    // settles smoothly instead of snapping.
    cam.position.lerp(_desired, k)
    _lookMatrix.lookAt(_desired, _target, cam.up)
    _lookQuat.setFromRotationMatrix(_lookMatrix)
    cam.quaternion.slerp(_lookQuat, k)

    // Gentle hand-held roll from horizontal pointer movement
    cam.rotation.z += (-f.pointer.x * 0.022 - cam.rotation.z) * k
  })

  return null
}

/** Lights-out factor per tab, damped (exported for lights/background). */
export function tabDim(tab: number): number {
  switch (tab) {
    case 0:
      return 0.18
    case 1:
      return 0
    case 2:
      return 0.35
    case 3:
      return 1
    default:
      return 0.55
  }
}
