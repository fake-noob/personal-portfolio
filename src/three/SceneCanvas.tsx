import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, OrbitControls } from '@react-three/drei'
import { Bloom, DepthOfField, EffectComposer, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { frame, selectProject, setTab, useSceneValue } from './sceneStore'
import { nodeById } from './networkData'
import { tabDim } from './CameraRig'
import FluidBackground from './FluidBackground'
import CameraRig from './CameraRig'
import NeuralNetwork from './NeuralNetwork'

/**
 * One fixed full-screen canvas behind the tab system. DOM glass overlays sit
 * on top; the tab state drives camera pose, blur and interactivity.
 */

function Lights() {
  const ambient = useRef<THREE.AmbientLight>(null)
  const key = useRef<THREE.DirectionalLight>(null)
  const fill = useRef<THREE.PointLight>(null)

  useFrame((_, delta) => {
    const k = Math.min(1, delta * 4)
    // damp the global lights-out factor toward the active tab's target
    const want = tabDim(frame.tab)
    frame.certDim += (want - frame.certDim) * k

    const dim = frame.certDim
    if (ambient.current) {
      const v = 1.0 - dim * 0.94
      ambient.current.intensity += (v - ambient.current.intensity) * k
    }
    if (key.current) {
      const v = 1.7 - dim * 1.6
      key.current.intensity += (v - key.current.intensity) * k
    }
    if (fill.current) {
      const v = 16 * (1 - dim)
      fill.current.intensity += (v - fill.current.intensity) * k
    }
  })

  return (
    <>
      <ambientLight ref={ambient} intensity={1.0} color="#c9d8ff" />
      <directionalLight ref={key} position={[6, 9, 12]} intensity={1.7} color="#e8f1ff" />
      <pointLight ref={fill} position={[0, 1, 6]} intensity={16} distance={34} decay={2} color="#2e6f8e" />
      <pointLight position={[-8, -2, 4]} intensity={9} distance={30} decay={2} color="#355f96" />
    </>
  )
}

/**
 * Post-processing per tab: the intro and deep-dive blur the network behind
 * the glass (depth of field); the network tab renders it sharp with bloom so
 * the reverse-traversal glow reads.
 */
function Effects() {
  const tab = useSceneValue(() => frame.tab)
  const focused = useSceneValue(() => frame.selectedId !== null)
  const blurred = tab === 0 || tab === 2

  if (blurred) {
    return (
      <EffectComposer multisampling={0}>
        <DepthOfField focusDistance={0.008} focalLength={0.12} bokehScale={6} height={400} />
        <Bloom mipmapBlur intensity={0.55} luminanceThreshold={0.6} luminanceSmoothing={0.15} />
        <Vignette eskil={false} offset={0.18} darkness={0.62} />
      </EffectComposer>
    )
  }

  if (focused) {
    return (
      <EffectComposer multisampling={0}>
        <DepthOfField focusDistance={0.024} focalLength={0.05} bokehScale={5.5} height={320} />
        <Bloom mipmapBlur intensity={0.8} luminanceThreshold={0.55} luminanceSmoothing={0.15} />
        <Vignette eskil={false} offset={0.18} darkness={0.62} />
      </EffectComposer>
    )
  }

  return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur intensity={0.8} luminanceThreshold={0.55} luminanceSmoothing={0.15} />
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
    w.__nodes = nodeById
    w.__THREE = THREE
    w.__setTab = setTab
    w.__select = selectProject
  }, [scene, camera, gl])
  return null
}

export default function SceneCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tab = useSceneValue(() => frame.tab)

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = -((e.clientY / window.innerHeight) * 2 - 1)
      frame.mouse.x = x < -1 ? -1 : x > 1 ? 1 : x
      frame.mouse.y = y < -1 ? -1 : y > 1 ? 1 : y
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  /**
   * Free-look hand-off (network tab only): a real click-drag on the canvas
   * (>6px) flags the gesture as an orbit, standing the CameraRig down and
   * handing the camera to OrbitControls until a tab/selection change.
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
      if (!down || frame.orbitActive || frame.tab !== 1) return
      if (Math.hypot(e.clientX - sx, e.clientY - sy) > 6) {
        // dragging orbits — release any focused node first
        if (frame.selectedId) selectProject(null)
        frame.orbitActive = 1
      }
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
    <div className="fixed inset-0 z-0">
      <Canvas
        ref={canvasRef}
        dpr={[1, 1.75]}
        shadows="percentage"
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0.5, 30], fov: 50, near: 0.1, far: 160 }}
        onPointerMissed={() => {
          if (frame.tab === 1) selectProject(null)
        }}
      >
        <OrbitControls
          makeDefault
          enabled={tab === 1}
          enablePan={false}
          enableZoom={false}
          enableDamping
          dampingFactor={0.06}
          rotateSpeed={0.6}
          minPolarAngle={0.15}
          maxPolarAngle={Math.PI - 0.15}
        />
        <color attach="background" args={['#020813']} />
        <Suspense fallback={null}>
          <FluidBackground />
          <Lights />
          <CameraRig />
          <NeuralNetwork />
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
