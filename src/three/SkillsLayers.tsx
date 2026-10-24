import { useRef } from 'react'
import { Edges, Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { skillCategories } from '../data/resumes'
import { clamp01, frame } from './sceneStore'

/**
 * Scroll-triggered exploded view.
 *
 * Four glass architecture layers start scattered around the corridor, then
 * fly in, align and lock into a 2×2 structure as `skillsProgress` runs 0→1 —
 * driven by GSAP ScrollTrigger, animated per frame against the R3F clock.
 * Skill chips ride on each panel as drei <Html>.
 */

const PANEL_W = 3.4
const PANEL_H = 2.0

const CONFIG = [
  { exploded: [-4.6, 2.9, -33], rot: [0.55, -0.6, 0.3], home: [-1.85, 1.15, -40] },
  { exploded: [4.3, 1.8, -36.5], rot: [-0.5, 0.65, -0.28], home: [1.85, 1.15, -40] },
  { exploded: [-3.9, -2.6, -37.6], rot: [0.6, 0.5, 0.36], home: [-1.85, -1.15, -40] },
  { exploded: [4.1, -2.9, -34.4], rot: [-0.55, -0.5, -0.32], home: [1.85, -1.15, -40] },
]

const lerp = THREE.MathUtils.lerp

/** easeOutBack — panels overshoot slightly, then "lock". */
function backOut(x: number) {
  const c1 = 1.5
  const c3 = c1 + 1
  const p = x - 1
  return 1 + c3 * p * p * p + c1 * p * p
}

export default function SkillsLayers() {
  const group = useRef<THREE.Group>(null)
  const panels = useRef<(THREE.Group | null)[]>([])
  const labels = useRef<(HTMLDivElement | null)[]>([])

  // Every skill from every persona rides the panels — content is merged.
  const categories = skillCategories

  useFrame((state) => {
    const g = group.current
    if (!g) return
    const p = frame.skillsProgress
    g.visible = p > 0.002
    if (!g.visible) {
      // never leave floating labels behind on other sections
      for (const l of labels.current) if (l) l.style.opacity = '0'
      return
    }

    // Whole assembly sways gently with the pointer
    g.rotation.y += (frame.pointer.x * 0.07 - g.rotation.y) * 0.05
    g.rotation.x += (-frame.pointer.y * 0.035 - g.rotation.x) * 0.05

    for (let i = 0; i < CONFIG.length; i++) {
      const node = panels.current[i]
      const cfg = CONFIG[i]
      if (!node || !cfg) continue

      const t = clamp01((p - i * 0.14) / 0.56)
      const e = t <= 0 ? 0 : t >= 1 ? 1 : backOut(t)

      node.position.set(
        lerp(cfg.exploded[0], cfg.home[0], e),
        lerp(cfg.exploded[1], cfg.home[1], e),
        lerp(cfg.exploded[2], cfg.home[2], e),
      )
      node.rotation.set(
        lerp(cfg.rot[0], 0, e),
        lerp(cfg.rot[1], 0, e),
        lerp(cfg.rot[2], 0, e),
      )

      const label = labels.current[i]
      if (label) {
        // Reveal the data once the layer is close to locked, and only while
        // the camera is actually in the skills zone (not when flying past).
        const appear = clamp01((t - 0.55) / 0.3)
        const near = clamp01((-20 - state.camera.position.z) / 8)
        // hide once the camera has flown past the assembly
        const front = clamp01((state.camera.position.z + 42) / 2)
        label.style.opacity = `${appear * near * front}`
      }
    }
  })

  return (
    <group ref={group} visible={false} position={[0.85, 0.05, 0]}>
      {categories.map((cat, i) => (
        <group
          key={cat.id}
          ref={(el) => {
            panels.current[i] = el
          }}
          position={[0, 0, -600]}
        >
          {/* frosted glass slab */}
          <mesh>
            <boxGeometry args={[PANEL_W, PANEL_H, 0.12]} />
            <meshPhysicalMaterial
              color="#b9d5ff"
              transparent
              opacity={0.14}
              roughness={0.12}
              metalness={0}
              clearcoat={1}
              clearcoatRoughness={0.08}
            />
            <Edges scale={1.002} threshold={20} color="#a7c8ff" />
          </mesh>

          {/* inner sheen */}
          <mesh position={[0, 0, 0.065]}>
            <planeGeometry args={[PANEL_W - 0.3, PANEL_H - 0.3]} />
            <meshBasicMaterial
              color="#7fb2ff"
              transparent
              opacity={0.05}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>

          <Html
            position={[0, 0, 0.09]}
            center
            zIndexRange={[5, 0]}
            style={{ pointerEvents: 'none' }}
          >
            <div
              ref={(el) => {
                labels.current[i] = el
              }}
              className="pointer-events-none select-none text-center"
              style={{ opacity: 0, width: 300 }}
            >
              <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-white/45">
                layer {String(i + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-1 text-[13px] font-semibold uppercase tracking-[0.2em] text-white/90">
                {cat.label}
              </h3>
              <div className="mt-2 flex flex-wrap justify-center gap-1">
                {cat.skills.map((s) => (
                  <span
                    key={s.name}
                    className="rounded-full border border-white/15 bg-white/[0.07] px-1.5 py-[1px] text-[9.5px] leading-4 text-white/75"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          </Html>
        </group>
      ))}
    </group>
  )
}
