import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Environment, Lightformer } from '@react-three/drei'
import { Bloom, DepthOfField, EffectComposer, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { useSceneValue, frame, selectProject } from './sceneStore'
import { projectNodePositions } from './networkLayout'
import FluidBackground from './FluidBackground'
import CameraRig from './CameraRig'
import NeuralNetwork from './NeuralNetwork'
import SkillsLayers from './SkillsLayers'
import CertTypography from './CertTypography'

/**
 * One fixed canvas behind the whole document. DOM glass overlays scroll on
 * top; GSAP ScrollTrigger choreographs the camera inside.
 */

function Lights() {
  const ambient = useRef<THREE.AmbientLight>(null)
  const key = useRef<THREE.DirectionalLight>(null)
  const skillsFill = useRef<THREE.PointLight>(null)

  useFrame((_, delta) => {
    const k = Math.min(1, delta * 4)
    const dim = frame.certDim
    if (ambient.current) {
      const want = 1.0 - dim * 0.92
      ambient.current.intensity += (want - ambient.current.intensity) * k
    }
    if (key.current) {
      const want = 1.7 - dim * 1.55
      key.current.intensity += (want - key.current.intensity) * k
    }
    if (skillsFill.current) {
      const want = 26 * (1 - dim)
      skillsFill.current.intensity += (want - skillsFill.current.intensity) * k
    }
  })

  return (
    <>
      <ambientLight ref={ambient} intensity={1.0} color="#c9d8ff" />
      <directionalLight ref={key} position={[6, 9, 12]} intensity={1.7} color="#e8f1ff" />
      <pointLight ref={skillsFill} position={[0, 0, -33]} intensity={26} distance={32} decay={2} color="#9fc4ff" />
      <pointLight position={[0, 1, 5]} intensity={14} distance={20} decay={2} color="#355f96" />
    </>
  )
}

function Effects() {
  const selectedId = useSceneValue(() => frame.selectedId)
  const focused = !!selectedId

  // The DOF pass is the expensive one, so it only exists in the focused state
  // (which is also the only time it has a job — blurring the rest of the net).
  if (focused) {
    return (
      <EffectComposer multisampling={0}>
        <DepthOfField focusDistance={0.024} focalLength={0.05} bokehScale={5.5} height={320} />
        <Bloom mipmapBlur intensity={0.7} luminanceThreshold={0.58} luminanceSmoothing={0.15} />
        <Vignette eskil={false} offset={0.18} darkness={0.62} />
      </EffectComposer>
    )
  }

  return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur intensity={0.7} luminanceThreshold={0.58} luminanceSmoothing={0.15} />
      <Vignette eskil={false} offset={0.18} darkness={0.62} />
    </EffectComposer>
  )
}

/** Dev-only handles so the scene can be inspected from the console/tests. */
function DebugBridge() {
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera)
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    if (!import.meta.env.DEV) return
    const w = window as unknown as Record<string, unknown>
    w.__scene = scene
    w.__camera = camera
    w.__gl = gl
    w.__frame = frame
    w.__nodes = projectNodePositions
  }, [scene, camera, gl])
  return null
}

export default function SceneCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  /**
   * Free-look hand-off: a real click-drag on the bare canvas (more than 6px)
   * flags the gesture as an orbit, and CameraRig yields the camera to
   * OrbitControls until the user scrolls or selects a node.
   */
  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    let down = false
    let sx = 0
    let sy = 0
    const onDown = (e: PointerEvent) => {
      down = true
      sx = e.clientX
      sy = e.clientY
    }
    const onMove = (e: PointerEvent) => {
      if (!down || frame.orbitActive) return
      if (Math.hypot(e.clientX - sx, e.clientY - sy) > 6) frame.orbitActive = 1
    }
    const onUp = () => {
      down = false
    }
    el.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [])

  return (
    /* Dedicated sticky background: full-viewport canvas at z-0. DOM
       overlays (z-10, mostly pointer-events-none) scroll above it, so the
       right side of the screen is always clear for click-drag orbiting. */
    <div className="fixed inset-0 z-0">
      <Canvas
        ref={canvasRef}
        dpr={[1, 1.75]}
        shadows="percentage"
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0.35, 15], fov: 50, near: 0.1, far: 160 }}
        onPointerMissed={() => selectProject(null)}
      >
        <OrbitControls
          makeDefault
          enablePan={false}
          enableZoom={false}
          enableDamping
          dampingFactor={0.06}
          rotateSpeed={0.65}
          minPolarAngle={0.15}
          maxPolarAngle={Math.PI - 0.15}
        />
        <color attach="background" args={['#020813']} />
        <Suspense fallback={null}>
          <FluidBackground />
          <Lights />
          <CameraRig />
          <NeuralNetwork />
          <SkillsLayers />
          <CertTypography />
          <Environment resolution={128} frames={1}>
            <Lightformer intensity={1.1} position={[0, 4, -6]} scale={[10, 4, 1]} color="#8fd3ff" />
            <Lightformer
              intensity={0.9}
              position={[-5, 0, 2]}
              rotation-y={Math.PI / 2}
              scale={[8, 5, 1]}
              color="#1e3a6e"
            />
            <Lightformer
              intensity={0.7}
              position={[5, -2, 2]}
              rotation-y={-Math.PI / 2}
              scale={[8, 5, 1]}
              color="#008080"
            />
          </Environment>
        </Suspense>
        <Effects />
        <DebugBridge />
      </Canvas>
    </div>
  )
}