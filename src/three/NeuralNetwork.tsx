import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { Html } from '@react-three/drei'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { motion } from 'framer-motion'
import { ArrowUpRight, X } from 'lucide-react'
import gsap from 'gsap'
import * as THREE from 'three'
import { usePersona } from '../context/PersonaContext'
import { projects, type Project } from '../data/resumes'
import {
  dustPositions,
  edgePositions,
  hiddenNodes,
  projectEdges,
  projectNodePositions,
  projectNodes,
} from './networkLayout'
import { frame, selectProject, useSceneValue } from './sceneStore'

/**
 * The interactive neural network.
 *
 * - hidden-layer nodes are one InstancedMesh (cheap), pulsing per module
 * - edges are one LineSegments field + per-project accent edges
 * - project nodes are raycast targets; clicking one flies the camera in,
 *   deepens the DOF and opens a glass project card (drei <Html>)
 * - personas dim nodes that belong to another track instead of removing them
 */

const REDUCED =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const tmp = new THREE.Object3D()

/* ------------------------------------------------------------------ */
/* Hidden layer                                                        */
/* ------------------------------------------------------------------ */

function HiddenNodes({ color }: { color: string }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const flat = useMemo(() => hiddenNodes.flat(), [])
  const geo = useMemo(() => new THREE.SphereGeometry(0.075, 12, 12), [])

  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    flat.forEach((n, i) => {
      tmp.position.copy(n.pos)
      tmp.scale.setScalar(1)
      tmp.updateMatrix()
      mesh.setMatrixAt(i, tmp.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [flat])

  useFrame((state) => {
    const mesh = ref.current
    if (!mesh || REDUCED) return
    const t = state.clock.elapsedTime
    flat.forEach((n, i) => {
      const s = 0.8 + 0.35 * Math.sin(t * 1.3 + i * 0.7)
      tmp.position.copy(n.pos)
      tmp.scale.setScalar(s)
      tmp.updateMatrix()
      mesh.setMatrixAt(i, tmp.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[geo, undefined, flat.length]} frustumCulled={false}>
      <meshBasicMaterial color={color} transparent opacity={0.55} depthWrite={false} />
    </instancedMesh>
  )
}

/* ------------------------------------------------------------------ */
/* Edges                                                               */
/* ------------------------------------------------------------------ */

function EdgeField({ color }: { color: string }) {
  const mat = useRef<THREE.LineBasicMaterial>(null)
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(edgePositions, 3))
    return g
  }, [])
  const target = useMemo(() => new THREE.Color(color), [color])

  useFrame((_, delta) => {
    if (mat.current) mat.current.color.lerp(target, Math.min(1, delta * 3))
  })

  return (
    <lineSegments geometry={geo} frustumCulled={false}>
      <lineBasicMaterial
        ref={mat}
        color={color}
        transparent
        opacity={0.16}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  )
}

function ProjectEdge({
  id,
  color,
  active,
  selected,
}: {
  id: string
  color: string
  active: boolean
  selected: boolean
}) {
  const mat = useRef<THREE.LineBasicMaterial>(null)
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(projectEdges[id], 3))
    return g
  }, [id])
  const target = useMemo(() => new THREE.Color(color), [color])

  useFrame((_, delta) => {
    const m = mat.current
    if (!m) return
    const want = active ? (selected ? 0.85 : 0.4) : 0.04
    m.opacity += (want - m.opacity) * Math.min(1, delta * 4)
    m.color.lerp(target, Math.min(1, delta * 3))
  })

  return (
    <lineSegments geometry={geo} frustumCulled={false}>
      <lineBasicMaterial
        ref={mat}
        color={color}
        transparent
        opacity={0.05}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  )
}

/* ------------------------------------------------------------------ */
/* Travelling signals                                                  */
/* ------------------------------------------------------------------ */

function Signals({ color }: { color: string }) {
  const COUNT = 18
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(COUNT * 3), 3))
    return g
  }, [])
  const edgeCount = edgePositions.length / 6

  useFrame((state) => {
    if (REDUCED) return
    const attr = geo.getAttribute('position') as THREE.BufferAttribute
    const arr = attr.array as Float32Array
    const t = state.clock.elapsedTime
    for (let i = 0; i < COUNT; i++) {
      const e = (i * 7 + 3) % edgeCount
      const phase = (t * 0.16 + i / COUNT) % 1
      const o = e * 6
      arr[i * 3] = edgePositions[o] + (edgePositions[o + 3] - edgePositions[o]) * phase
      arr[i * 3 + 1] = edgePositions[o + 1] + (edgePositions[o + 4] - edgePositions[o + 1]) * phase
      arr[i * 3 + 2] = edgePositions[o + 2] + (edgePositions[o + 5] - edgePositions[o + 2]) * phase
    }
    attr.needsUpdate = true
  })

  return (
    <points geometry={geo} frustumCulled={false}>
      <pointsMaterial
        color={color}
        size={0.11}
        sizeAttenuation
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/* ------------------------------------------------------------------ */
/* Ambient dust                                                        */
/* ------------------------------------------------------------------ */

function Dust({ color }: { color: string }) {
  const ref = useRef<THREE.Points>(null)
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3))
    return g
  }, [])

  useFrame((state) => {
    const p = ref.current
    if (!p || REDUCED) return
    p.rotation.y = state.clock.elapsedTime * 0.012
    p.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.05
  })

  return (
    <points ref={ref} geometry={geo} frustumCulled={false}>
      <pointsMaterial
        color={color}
        size={0.045}
        sizeAttenuation
        transparent
        opacity={0.45}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/* ------------------------------------------------------------------ */
/* Project node + glass detail overlay                                 */
/* ------------------------------------------------------------------ */

function ProjectCard({ project, onClose }: { project: Project; onClose: () => void }) {
  return (
    <motion.div
      key={project.id}
      initial={{ opacity: 0, y: 14, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-auto max-h-[min(72vh,540px)] w-[min(340px,78vw)] overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-[#060a12]/85 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.65)] backdrop-blur-2xl [scrollbar-width:thin]"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="accent-text font-mono text-[10px] uppercase tracking-[0.22em]">
            output · {project.id}
          </p>
          <h3 className="mt-1 text-lg font-semibold leading-tight text-zinc-50">
            {project.title}
          </h3>
          <p className="mt-0.5 text-[11px] text-zinc-400">{project.subtitle}</p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close project details"
          className="shrink-0 rounded-full border border-white/10 bg-white/5 p-1.5 text-zinc-400 transition-colors hover:border-white/25 hover:text-zinc-100"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <p className="text-xs leading-relaxed text-zinc-400">{project.description}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {project.tech.map((t) => (
          <span
            key={t}
            className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 font-mono text-[10px] text-zinc-300"
          >
            {t}
          </span>
        ))}
      </div>

      <ul className="mt-3 space-y-1.5">
        {project.bullets.map((b) => (
          <li key={b} className="flex gap-1.5 text-[11px] leading-relaxed text-zinc-400">
            <span className="accent-text mt-[1px]">▸</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>

      {project.github && (
        <a
          href={project.github}
          target="_blank"
          rel="noopener noreferrer"
          className="accent-text mt-4 inline-flex items-center gap-1 font-mono text-[11px] transition-opacity hover:opacity-75"
        >
          repository <ArrowUpRight className="h-3 w-3" />
        </a>
      )}
    </motion.div>
  )
}

function ProjectNode({
  project,
  color,
  active,
}: {
  project: Project
  color: string
  active: boolean
}) {
  const group = useRef<THREE.Group>(null)
  const glow = useRef<THREE.MeshBasicMaterial>(null)
  const core = useRef<THREE.MeshStandardMaterial>(null)
  const selectedId = useSceneValue(() => frame.selectedId)
  const selected = selectedId === project.id
  const pos = projectNodePositions[project.id]
  const seed = useMemo(() => project.id.charCodeAt(0) % 7, [project.id])
  const scale = useRef(0.45)

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const pulse = REDUCED ? 1 : 1 + Math.sin(t * 2.1 + seed) * 0.12
    const want = (active ? 1 : 0.42) * (selected ? 1.5 : 1) * pulse
    scale.current += (want - scale.current) * Math.min(1, delta * 5)
    if (group.current) group.current.scale.setScalar(scale.current)

    if (glow.current) {
      const oWant = active ? (selected ? 0.5 : 0.2) : 0.05
      glow.current.opacity += (oWant - glow.current.opacity) * Math.min(1, delta * 4)
    }
    if (core.current) {
      const eWant = active ? (selected ? 3.4 : 1.6) : 0.15
      core.current.emissiveIntensity += (eWant - core.current.emissiveIntensity) * Math.min(1, delta * 4)
    }
  })

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (!active) return
    selectProject(selected ? null : project.id)
  }

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    if (active) document.body.style.cursor = 'pointer'
  }

  const onOut = () => {
    document.body.style.cursor = ''
  }

  useEffect(() => () => {
    document.body.style.cursor = ''
  }, [])

  return (
    <group ref={group} position={pos}>
      <mesh>
        <sphereGeometry args={[0.12, 20, 20]} />
        <meshStandardMaterial
          ref={core}
          color={color}
          emissive={color}
          emissiveIntensity={1.6}
          roughness={0.25}
          metalness={0.35}
          transparent
        />
      </mesh>

      {/* generous invisible-ish hit sphere */}
      <mesh onClick={onClick} onPointerOver={onOver} onPointerOut={onOut}>
        <sphereGeometry args={[0.46, 16, 16]} />
        <meshBasicMaterial
          ref={glow}
          color={color}
          transparent
          opacity={0.18}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {selected && (
        <Html position={[0, -0.18, 0]} center zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
          <ProjectCard project={project} onClose={() => selectProject(null)} />
        </Html>
      )}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Network                                                             */
/* ------------------------------------------------------------------ */

export default function NeuralNetwork() {
  const { personaId, persona } = usePersona()
  const camera = useThree((s) => s.camera)
  const selectedId = useSceneValue(() => frame.selectedId)

  const activeSet = useMemo(
    () => new Set(projects.filter((p) => p.personas.includes(personaId)).map((p) => p.id)),
    [personaId],
  )

  // Camera flight + DOF hand-off whenever a node is selected / cleared
  useEffect(() => {
    const tween = { duration: 1.5, ease: 'power3.inOut', overwrite: 'auto' as const }
    if (selectedId) {
      const p = projectNodePositions[selectedId]
      if (p) {
        const dir = camera.position.clone().sub(p).normalize()
        frame.focusCam.copy(p).addScaledVector(dir, 3.4)
        frame.focusCam.y += 0.45
        frame.focusTarget.copy(p)
      }
      gsap.to(frame, { focusBlend: 1, ...tween })
    } else {
      gsap.to(frame, { focusBlend: 0, ...tween })
    }
    return () => {
      gsap.killTweensOf(frame, 'focusBlend')
    }
  }, [selectedId, camera])

  return (
    <group>
      <HiddenNodes color={persona.accent} />
      <EdgeField color={persona.accent} />
      <Signals color={persona.accent} />
      <Dust color={persona.accent} />

      {projectNodes.map((n) => {
        const project = projects.find((p) => p.id === n.id)
        if (!project) return null
        const active = activeSet.has(n.id)
        return (
          <group key={n.id}>
            <ProjectEdge
              id={n.id}
              color={persona.accent}
              active={active}
              selected={selectedId === n.id}
            />
            <ProjectNode project={project} color={persona.accent} active={active} />
          </group>
        )
      })}
    </group>
  )
}
