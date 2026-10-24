import * as THREE from 'three'
import { projects } from '../data/resumes'

/** Deterministic PRNG so the network layout is stable across renders. */
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(20260815)

/* Topology: 4 hidden layers then an output layer of project nodes. */
const LAYER_X = [-6.4, -3.6, -0.8, 2.0, 5.4]
const LAYER_COUNTS = [4, 6, 6, 5, projects.length]

export interface NetworkNode {
  pos: THREE.Vector3
  layer: number
  index: number
}

/**
 * Hidden layers are volumes, not walls: X jitter per node, a fan-out that
 * widens with depth, and generous Z spread — a genuinely 3D network.
 */
export const hiddenNodes: NetworkNode[][] = []
for (let l = 0; l < LAYER_COUNTS.length - 1; l++) {
  const count = LAYER_COUNTS[l]
  const layer: NetworkNode[] = []
  const zSpread = 1.4 + l * 0.9
  for (let i = 0; i < count; i++) {
    layer.push({
      pos: new THREE.Vector3(
        LAYER_X[l] + (rand() - 0.5) * 0.55,
        (i - (count - 1) / 2) * 1.18 + (rand() - 0.5) * 0.3,
        (rand() - 0.5) * zSpread,
      ),
      layer: l,
      index: i,
    })
  }
  hiddenNodes.push(layer)
}

/**
 * Semantic clusters — each occupies a distinct region of 3D space on the
 * output side of the network. Muted colours per the dark-sleek palette.
 */
export interface ProjectCluster {
  id: string
  label: string
  color: string
  center: THREE.Vector3
  members: string[]
}

export const projectClusters: ProjectCluster[] = [
  {
    id: 'ml',
    label: 'Machine Learning',
    color: '#0096b4',
    center: new THREE.Vector3(5.9, 1.75, -1.5),
    members: ['mapf', 'rag'],
  },
  {
    id: 'fullstack',
    label: 'Full-Stack',
    color: '#4577c9',
    center: new THREE.Vector3(5.9, -1.75, 1.5),
    members: ['pantrypal', 'weatherways'],
  },
  {
    id: 'pm',
    label: 'Product Management',
    color: '#a8946b',
    center: new THREE.Vector3(8.6, 0.1, -0.7),
    members: ['academiq'],
  },
]

/** Output layer = one node per project, orbiting its cluster center in X/Y/Z. */
export interface ProjectNode {
  id: string
  pos: THREE.Vector3
}

const clusteredIds = new Set(projectClusters.flatMap((c) => c.members))

export const projectNodes: ProjectNode[] = [
  ...projectClusters.flatMap((c) =>
    c.members.map((id, i) => {
      const n = c.members.length
      const angle = (i / n) * Math.PI * 2 + 0.7
      const r = n > 1 ? 1.05 : 0
      return {
        id,
        pos: new THREE.Vector3(
          c.center.x + Math.cos(angle) * r,
          c.center.y + (i - (n - 1) / 2) * 1.15,
          c.center.z + Math.sin(angle) * r,
        ),
      }
    }),
  ),
  // Defensive: any project not assigned to a cluster still gets an output node.
  ...projects
    .filter((p) => !clusteredIds.has(p.id))
    .map((p, i) => ({
      id: p.id,
      pos: new THREE.Vector3(LAYER_X[4], 3.4 + i * 1.3, (rand() - 0.5) * 1.4),
    })),
]

export const projectNodePositions: Record<string, THREE.Vector3> =
  Object.fromEntries(projectNodes.map((n) => [n.id, n.pos]))

/** Sparse edges between adjacent layers (2 random targets per source). */
const allLayers = [...hiddenNodes, []]
const edgePairs: number[][] = []
for (let l = 0; l < allLayers.length - 1; l++) {
  const src = allLayers[l]
  const dst = l === allLayers.length - 2 ? projectNodes : allLayers[l + 1]
  src.forEach((s) => {
    const targets = new Set<number>()
    while (targets.size < Math.min(2, dst.length)) {
      targets.add(Math.floor(rand() * dst.length))
    }
    targets.forEach((ti) => {
      const d = dst[ti].pos
      edgePairs.push([s.pos.x, s.pos.y, s.pos.z, d.x, d.y, d.z])
    })
  })
}

export const edgePositions = new Float32Array(edgePairs.flat())

/** Accent edges: hidden layer → each project node (for highlight). */
export const projectEdges: Record<string, Float32Array> = {}
for (const pn of projectNodes) {
  const arr: number[] = []
  const lastLayer = hiddenNodes[hiddenNodes.length - 1]
  const picks = [0, 1].map((k) => lastLayer[(pn.pos.y > 0 ? k + 1 : k) % lastLayer.length])
  picks.forEach((s) => {
    arr.push(s.pos.x, s.pos.y, s.pos.z, pn.pos.x, pn.pos.y, pn.pos.z)
  })
  projectEdges[pn.id] = new Float32Array(arr)
}

/** Ambient dust particle field. */
export const dustPositions = (() => {
  const arr = new Float32Array(320 * 3)
  for (let i = 0; i < 320; i++) {
    arr[i * 3] = (rand() - 0.5) * 22
    arr[i * 3 + 1] = (rand() - 0.5) * 14
    arr[i * 3 + 2] = (rand() - 0.5) * 16
  }
  return arr
})()
