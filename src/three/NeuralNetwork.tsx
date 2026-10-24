import { useEffect, useMemo, useRef, useState } from 'react'
import { Billboard, Html, Text } from '@react-three/drei'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import gsap from 'gsap'
import * as THREE from 'three'
import {
  columns,
  columnTop,
  dustPositions,
  edgePositions,
  edges,
  nodeById,
  nodeDefs,
  traverse,
  type NetworkNodeDef,
  type Traversal,
} from './networkData'
import { frame, selectProject, useSceneValue } from './sceneStore'

const REDUCED =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ------------------------------------------------------------------ */
/* One node — a volumetric sphere with emissive glow + hover label     */
/* ------------------------------------------------------------------ */

function Node({ def, lit }: { def: NetworkNodeDef; lit: boolean | null }) {
  const group = useRef<THREE.Group>(null)
  const mat = useRef<THREE.MeshStandardMaterial>(null)
  const [hovered, setHovered] = useState(false)
  const scaleRef = useRef(1)
  const seed = useMemo(() => (def.id.charCodeAt(0) + def.id.length) % 7, [def.id])

  // Only output-column nodes are clickable; only in the network tab.
  const interactive = def.output

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const m = mat.current
    const g = group.current
    if (!m || !g) return
    const k = Math.min(1, delta * 4)

    // reverse-traversal: lit nodes stay bright, everything else drops to 0.1
    const wantOpacity = lit === null ? 0.92 : lit ? 1 : 0.1
    m.opacity += (wantOpacity - m.opacity) * k

    const wantEmissive =
      lit === true ? 3.4 : lit === false ? 0.12 : def.output ? 1.7 : 1.15
    m.emissiveIntensity += (wantEmissive - m.emissiveIntensity) * k

    const pulse = REDUCED ? 1 : 1 + Math.sin(t * 1.6 + seed) * 0.06
    // Input layer + output heads swell while the user revolves the network —
    // makes the multi-head architecture read as a real 3D object.
    const swell = (def.output || def.col === 0) && frame.orbitActive ? 2.1 : 1
    const wantScale = (lit === true ? 1.5 : hovered ? 1.25 : 1) * pulse * swell
    scaleRef.current += (wantScale - scaleRef.current) * Math.min(1, delta * 6)
    g.scale.setScalar(scaleRef.current)
  })

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (frame.tab !== 1) return
    if (e.delta > 6) return // ignore the click that ends an orbit drag
    if (!interactive) return
    selectProject(frame.selectedId === def.id ? null : def.id)
  }

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHovered(true)
    if (interactive && frame.tab === 1) document.body.style.cursor = 'pointer'
  }
  const onOut = () => {
    setHovered(false)
    document.body.style.cursor = ''
  }
  useEffect(() => () => void (document.body.style.cursor = ''), [])

  return (
    <group ref={group} position={def.pos}>
      <mesh castShadow receiveShadow onClick={onClick} onPointerOver={onOver} onPointerOut={onOut}>
        <sphereGeometry args={[def.radius, 16, 16]} />
        <meshStandardMaterial
          ref={mat}
          color={def.color}
          emissive={new THREE.Color(def.color)}
          emissiveIntensity={1.15}
          roughness={0.3}
          metalness={0.25}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* generous invisible hit target (raycastable, renders nothing) */}
      <mesh
        onClick={onClick}
        onPointerOver={onOver}
        onPointerOut={onOut}
        position={[0, 0, 0]}
      >
        <sphereGeometry args={[def.output ? 0.55 : 0.26, 8, 8]} />
        <meshBasicMaterial
          transparent
          opacity={0}
          depthWrite={false}
          colorWrite={false}
        />
      </mesh>

      {hovered && (
        <Html
          position={[0, def.radius + 0.3, 0]}
          center
          zIndexRange={[24, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div className="whitespace-nowrap rounded-full border border-[rgba(0,150,180,0.35)] bg-[rgba(2,8,19,0.85)] px-2.5 py-1 font-mono text-[10px] tracking-wide text-zinc-200 backdrop-blur-md">
            {def.id}
            {def.output && (
              <span className="ml-1.5 text-[9px] uppercase tracking-[0.2em] text-teal-300/70">
                · trace
              </span>
            )}
          </div>
        </Html>
      )}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Edges — one draw call, vertex colours animate toward lit/dim targets */
/* ------------------------------------------------------------------ */

function EdgeField({ traversal }: { traversal: Traversal | null }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(edgePositions, 3))
    const col = new Float32Array(edgePositions.length)
    for (let i = 0; i < edges.length; i++) {
      const c = edges[i].color
      const f = 0.2 // dim resting state ≈ opacity 0.1
      for (const v of [0, 1]) {
        col[i * 6 + v * 3] = c.r * f
        col[i * 6 + v * 3 + 1] = c.g * f
        col[i * 6 + v * 3 + 2] = c.b * f
      }
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    return g
  }, [])

  const target = useMemo(() => {
    const t = new Float32Array(edgePositions.length)
    return t
  }, [])

  // Recompute target colours whenever the traversal changes.
  useEffect(() => {
    for (let i = 0; i < edges.length; i++) {
      const lit = traversal ? traversal.edges.has(i) : false
      const f = lit ? 2.1 : 0.2
      const c = edges[i].color
      for (const v of [0, 1]) {
        target[i * 6 + v * 3] = c.r * f
        target[i * 6 + v * 3 + 1] = c.g * f
        target[i * 6 + v * 3 + 2] = c.b * f
      }
    }
  }, [traversal, target])

  useFrame((_, delta) => {
    const attr = geo.getAttribute('color') as THREE.BufferAttribute
    const arr = attr.array as Float32Array
    const k = Math.min(1, delta * 4)
    let dirty = false
    for (let i = 0; i < arr.length; i++) {
      const d = target[i] - arr[i]
      if (Math.abs(d) > 0.0015) {
        arr[i] += d * k
        dirty = true
      }
    }
    if (dirty) attr.needsUpdate = true
  })

  return (
    <lineSegments geometry={geo} frustumCulled={false}>
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={0.95}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  )
}

/* ------------------------------------------------------------------ */
/* Travelling signals along the wires (network tab only)               */
/* ------------------------------------------------------------------ */

function Signals({ on }: { on: boolean }) {
  const COUNT = 20
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(COUNT * 3), 3))
    return g
  }, [])
  const edgeCount = edges.length

  useFrame((state) => {
    if (REDUCED || !on) return
    const attr = geo.getAttribute('position') as THREE.BufferAttribute
    const arr = attr.array as Float32Array
    const t = state.clock.elapsedTime
    for (let i = 0; i < COUNT; i++) {
      const e = (i * 7 + 3) % edgeCount
      const phase = (t * 0.18 + i / COUNT) % 1
      const o = e * 6
      arr[i * 3] = edgePositions[o] + (edgePositions[o + 3] - edgePositions[o]) * phase
      arr[i * 3 + 1] = edgePositions[o + 1] + (edgePositions[o + 4] - edgePositions[o + 1]) * phase
      arr[i * 3 + 2] = edgePositions[o + 2] + (edgePositions[o + 5] - edgePositions[o + 2]) * phase
    }
    attr.needsUpdate = true
  })

  if (!on) return null

  return (
    <points geometry={geo} frustumCulled={false}>
      <pointsMaterial
        color="#7fe3ff"
        size={0.1}
        sizeAttenuation
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function Dust() {
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
  })

  return (
    <points ref={ref} geometry={geo} frustumCulled={false}>
      <pointsMaterial
        color="#3f7fa6"
        size={0.045}
        sizeAttenuation
        transparent
        opacity={0.4}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/* ------------------------------------------------------------------ */
/* Billboard headings — always face the camera, even at 90°            */
/* ------------------------------------------------------------------ */

function ColumnHeadings() {
  return (
    <group>
      {columns.map((col, i) => (
        <Billboard
          key={col.id}
          position={[col.x, columnTop[i] + (col.output ? 1.45 : 1.1), 0]}
        >
          <Text
            fontSize={0.4}
            color={col.color}
            anchorX="center"
            anchorY="bottom"
            letterSpacing={0.08}
            outlineWidth={0.014}
            outlineColor="#020813"
          >
            {col.title.toUpperCase()}
          </Text>
          <Text
            position={[0, -0.42, 0]}
            fontSize={0.19}
            color="#9ca3af"
            fillOpacity={0.8}
            anchorX="center"
            anchorY="bottom"
            letterSpacing={0.22}
          >
            {col.hint.toUpperCase()}
          </Text>
        </Billboard>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Network root                                                        */
/* ------------------------------------------------------------------ */

export default function NeuralNetwork() {
  const camera = useThree((s) => s.camera)
  const group = useRef<THREE.Group>(null)
  const selectedId = useSceneValue(() => frame.selectedId)
  const tab = useSceneValue(() => frame.tab)

  const traversal = useMemo(
    () => (selectedId ? traverse(selectedId) : null),
    [selectedId],
  )

  /* Dev-only handle for tests/console inspection. */
  useEffect(() => {
    if (!import.meta.env.DEV) return
    const w = window as unknown as Record<string, unknown>
    w.__netGroup = group.current
  }, [])

  /* Camera flight toward the clicked node (Tab 1 only).
     Applied-experience heads fly all the way in (full lock); project heads
     stop halfway and leave the camera free to keep revolving the lit graph. */
  useEffect(() => {
    const tween = { duration: 1.4, ease: 'power3.inOut', overwrite: 'auto' as const }
    const def = selectedId ? nodeById.get(selectedId) : null
    if (def && frame.tab === 1) {
      const halfway = def.col === 3 // projects & deliverables output head
      const dist = halfway ? 9.5 : 5.0
      const dir = camera.position.clone().sub(def.pos).normalize()
      frame.focusCam.copy(def.pos).addScaledVector(dir, dist)
      frame.focusCam.y += 0.35
      frame.focusTarget.copy(def.pos)
      gsap.to(frame, { focusBlend: halfway ? 0.55 : 1, ...tween })
    } else {
      gsap.to(frame, { focusBlend: 0, ...tween })
    }
    return () => {
      gsap.killTweensOf(frame, 'focusBlend')
    }
  }, [selectedId, camera])

  /* Rotation choreography: intro + deep-dive auto-rotate slowly, the
     network tab settles to rest so OrbitControls can revolve cleanly. */
  useFrame((state, delta) => {
    const g = group.current
    if (!g) return
    // The certifications tab is a pure dark room — the network disappears.
    g.visible = frame.tab !== 4
    if (frame.tab === 1) {
      g.rotation.y += (0 - g.rotation.y) * Math.min(1, delta * 2.2)
      g.rotation.x += (0 - g.rotation.x) * Math.min(1, delta * 2.2)
    } else {
      const speed = frame.tab === 0 ? 0.05 : 0.065
      g.rotation.y += delta * speed
      g.rotation.x = Math.sin(state.clock.elapsedTime * 0.06) * 0.05
    }
  })

  return (
    <group ref={group}>
      <EdgeField traversal={traversal} />
      <Signals on={tab === 1} />
      <Dust />
      <ColumnHeadings />

      {nodeDefs.map((def) => (
        <Node
          key={def.id}
          def={def}
          lit={traversal ? traversal.nodes.has(def.id) : null}
        />
      ))}
    </group>
  )
}
