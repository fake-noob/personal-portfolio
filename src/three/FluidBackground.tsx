import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { usePersona } from '../context/PersonaContext'
import { frame } from './sceneStore'

/**
 * Fullscreen fluid-gradient shader background.
 * Domain-warped FBM noise blending Deep Blue → Teal → Indigo → Emerald,
 * tinted with the active persona accent, dimmed when the certifications
 * section drops the global lighting.
 */

const vertexShader = /* glsl */ `
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec3 uAccent;
  uniform float uDim;

  // Palette: Deep Blue #0B192C, Teal #008080, Indigo #4B0082, Emerald
  const vec3 DEEP_BLUE = vec3(0.043, 0.098, 0.173);
  const vec3 TEAL      = vec3(0.0,    0.502, 0.502);
  const vec3 INDIGO    = vec3(0.294,  0.0,   0.510);
  const vec3 EMERALD   = vec3(0.0,    0.470, 0.330);

  // Simplex-style value noise
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  // Fractal Brownian motion with domain warping for that liquid feel
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);
    for (int i = 0; i < 3; i++) {
      v += a * noise(p);
      p = rot * p * 2.0 + vec2(1.7, 9.2);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;
    // Aspect-correct so blobs stay circular
    vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) / min(uResolution.x, uResolution.y);

    float t = uTime * 0.06; // slow, hypnotic

    // Two-pass domain warp = fluid motion
    vec2 q = vec2(
      fbm(p * 1.6 + vec2(0.0, t)),
      fbm(p * 1.6 + vec2(5.2, -t * 0.8))
    );
    vec2 r = vec2(
      fbm(p * 1.8 + 3.4 * q + vec2(1.7, 9.2) + t * 0.5),
      fbm(p * 1.8 + 3.4 * q + vec2(8.3, 2.8) - t * 0.4)
    );
    float f = fbm(p * 1.5 + 3.2 * r);

    // Blend the four palette colors through the warped field
    vec3 col = mix(DEEP_BLUE, TEAL, smoothstep(0.0, 0.55, f + 0.15 * q.x));
    col = mix(col, INDIGO, smoothstep(0.25, 0.85, r.y * 0.9 + 0.2 * f));
    col = mix(col, EMERALD, smoothstep(0.45, 1.0, q.y * 0.7 + f * 0.6));

    // Persona accent bleed (subtle, so the toggle tints the whole canvas)
    col = mix(col, uAccent, 0.10 + 0.12 * smoothstep(0.4, 1.0, f));

    // Slow pulse so the field breathes
    col += 0.035 * sin(uTime * 0.25 + f * 6.2831);

    // Vignette toward the edges
    float vig = smoothstep(1.25, 0.25, length(p));
    col *= 0.72 + 0.28 * vig;

    // Global dimming for the certifications flashlight section
    col *= (1.0 - uDim * 0.88);

    gl_FragColor = vec4(col, 1.0);
  }
`

export default function FluidBackground() {
  const { persona } = usePersona()
  const matRef = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uAccent: { value: new THREE.Color('#7c5cff') },
      uDim: { value: 0 },
    }),
    [],
  )

  // Keep accent in sync with persona (lerped in useFrame for a smooth swap)
  const targetAccent = useMemo(() => new THREE.Color('#7c5cff'), [])
  const target = useMemo(() => new THREE.Color(persona.accent), [persona.accent])
  target.set(persona.accent)

  useFrame((state, delta) => {
    const mat = matRef.current
    if (!mat) return
    mat.uniforms.uTime.value = state.clock.elapsedTime

    const dpr = Math.min(state.viewport.dpr, 2)
    const w = state.size.width * dpr
    const h = state.size.height * dpr
    if (mat.uniforms.uResolution.value.x !== w || mat.uniforms.uResolution.value.y !== h) {
      mat.uniforms.uResolution.value.set(w, h)
    }

    // Smooth accent transition
    mat.uniforms.uAccent.value.lerp(target, Math.min(1, delta * 2.5))

    // Smoothly follow the certifications dim factor
    const d = mat.uniforms.uDim.value
    mat.uniforms.uDim.value = d + (frame.certDim - d) * Math.min(1, delta * 4)
  })

  return (
    <mesh frustumCulled={false} renderOrder={-1000}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  )
}
