import { useRef } from 'react'
import { Center, Edges, Text3D } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { frame } from './sceneStore'

/**
 * Certifications zone: 3D typography sitting in the dark.
 *
 * The global rig already dropped the lighting (`certDim`). A point light
 * follows the cursor in world space — it only exists while the pointer is
 * inside the certifications section (`certHover`) — and casts real shadows
 * from the floating glass shards onto the extruded type.
 */

const FONT = 'https://threejs.org/examples/fonts/helvetiker_bold.typeface.json'
const TITLE_Z = -95
const LIGHT_PLANE_Z = -91.6

const SHARDS = [
  { p: [-3.3, 1.7, -92.4], s: 0.85, r: 0.5 },
  { p: [2.6, 2.2, -92.9], s: 0.6, r: 1.1 },
  { p: [-1.4, -1.9, -92.2], s: 0.7, r: 0.8 },
  { p: [3.6, -1.2, -92.6], s: 0.9, r: 0.3 },
  { p: [0.8, 1.1, -92.1], s: 0.45, r: 1.6 },
]

const ndc = new THREE.Vector2()
const dir = new THREE.Vector3()
const hit = new THREE.Vector3()

export default function CertTypography() {
  const group = useRef<THREE.Group>(null)
  const light = useRef<THREE.PointLight>(null)
  const shards = useRef<THREE.Group>(null)
  const hover = useRef(0)

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return
    g.visible = frame.certProgress > 0.002
    if (!g.visible) return

    hover.current += (frame.certHover - hover.current) * Math.min(1, delta * 5)

    const cam = state.camera
    const L = light.current
    if (L) {
      ndc.set(frame.mouse.x, frame.mouse.y)
      dir.set(ndc.x, ndc.y, 0.5).unproject(cam).sub(cam.position).normalize()
      const t = (LIGHT_PLANE_Z - cam.position.z) / dir.z
      hit.copy(cam.position).addScaledVector(dir, t)
      L.position.set(
        THREE.MathUtils.clamp(hit.x, -7, 7),
        THREE.MathUtils.clamp(hit.y, -5, 5),
        LIGHT_PLANE_Z + 0.6,
      )
      // Only lit while hovered — shadows exist only then, per spec.
      L.intensity = frame.certDim * hover.current * 70
    }

    const s = shards.current
    if (s) {
      const t = state.clock.elapsedTime
      s.rotation.y = Math.sin(t * 0.14) * 0.3 + frame.pointer.x * 0.1
      s.children.forEach((c, i) => {
        const cfg = SHARDS[i]
        if (!cfg) return
        c.position.y = cfg.p[1] + Math.sin(t * 0.35 + i * 1.7) * 0.22
        c.rotation.x = t * (0.1 + i * 0.02) * (i % 2 ? 1 : -1)
        c.rotation.y = t * 0.08 * (i % 2 ? -1 : 1)
      })
    }
  })

  return (
    <group ref={group} visible={false}>
      {/* Extruded type */}
      <Center position={[0, -0.35, TITLE_Z]}>
        <Text3D
          font={FONT}
          size={0.9}
          height={0.26}
          curveSegments={5}
          bevelEnabled
          bevelSize={0.02}
          bevelThickness={0.03}
          bevelSegments={2}
          letterSpacing={0.05}
          receiveShadow
          castShadow
        >
          CERTIFICATIONS
          <meshStandardMaterial
            color="#dfe9fa"
            roughness={0.35}
            metalness={0.3}
            emissive="#0d1626"
            emissiveIntensity={0.5}
          />
        </Text3D>
      </Center>

      <Center position={[0, -1.75, TITLE_Z + 0.1]}>
        <Text3D
          font={FONT}
          size={0.24}
          height={0.1}
          curveSegments={3}
          bevelEnabled
          bevelSize={0.008}
          bevelThickness={0.01}
          bevelSegments={1}
          letterSpacing={0.16}
          receiveShadow
        >
          DATA · CLOUD · DELIVERY
          <meshStandardMaterial color="#8fb2dd" roughness={0.5} metalness={0.2} />
        </Text3D>
      </Center>

      {/* Floating shards that cast the shadows */}
      <group ref={shards}>
        {SHARDS.map((s, i) => (
          <mesh key={i} position={s.p as [number, number, number]} castShadow>
            <boxGeometry args={[s.s, s.s * 1.45, 0.06]} />
            <meshStandardMaterial
              color="#cfe0f8"
              metalness={0.65}
              roughness={0.16}
              transparent
              opacity={0.55}
            />
            <Edges scale={1.001} threshold={20} color="#b9d2f4" />
          </mesh>
        ))}
      </group>

      {/* The flashlight */}
      <pointLight
        ref={light}
        position={[0, 0, LIGHT_PLANE_Z]}
        intensity={0}
        distance={22}
        decay={2}
        color="#d8e8ff"
        castShadow
        shadow-mapSize={[512, 512]}
        shadow-camera-near={0.5}
        shadow-camera-far={16}
        shadow-bias={-0.0025}
      />
    </group>
  )
}
