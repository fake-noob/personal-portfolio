import * as THREE from 'three'

/**
 * The hardcoded multi-head neural network for Tab 1.
 *
 * Four volumetric columns spaced along X:
 *   1. Core Skills & Tools
 *   2. Highlighted Coursework
 *   3. Applied Experiences   (Output Head A)
 *   4. Projects & Deliverables (Output Head B)
 *
 * Wiring is the exact dependency graph: output nodes point at their
 * prerequisite coursework and skills (and, for Weather Ways, at EdgeFirm).
 * Clicking an output node triggers a reverse traversal over these edges.
 */

/* Deterministic PRNG — organic offsets stay stable across renders. */
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
const rand = mulberry32(20261024)

export interface ColumnDef {
  id: 'skills' | 'coursework' | 'experience' | 'projects'
  title: string
  hint: string
  x: number
  color: string
  nodes: string[]
  /** nodes per Z slice — the column is a slab, not a flat wall */
  zCols: number
  rowGap: number
  zGap: number
  radius: number
  /** output columns are clickable (raycast → reverse traversal) */
  output: boolean
}

export const columns: ColumnDef[] = [
  {
    id: 'skills',
    title: 'Core Skills & Tools',
    hint: 'input layer',
    x: -9.6,
    color: '#0096b4',
    zCols: 5,
    rowGap: 0.78,
    zGap: 0.95,
    radius: 0.085,
    output: false,
    nodes: [
      'Python', 'PyTorch', 'TensorFlow', 'scikit-learn', 'LangChain',
      'Sentence Transformers', 'Pinecone', 'BM25', 'DQN', 'RAG',
      'MLflow', 'Gemini API', 'NumPy', 'Pandas', 'JavaScript',
      'HTML/CSS', 'React', 'React Router', 'Vite', 'Tailwind',
      'Flutter', 'GetX', 'Node.js', 'Express', 'C++',
      'SQL', 'PostgreSQL (Supabase)', 'Prisma', 'REST APIs', 'JWT',
      'OAuth 2.0', 'AWS CloudWatch', 'Firebase', 'Twilio', 'Git/GitHub',
      'GitHub Actions', 'VS Code', 'Cursor', 'Claude Code', 'Windsurf',
      'MS Entra', 'MS Power Apps', 'MS Office', 'MS Excel (Pivot Tables)', 'Clickup',
      'Trello', 'Figma', 'Agile/Scrum', 'Standups', 'Sprint Planning',
      'Kaggle', 'Google Colabs', 'Verilog', 'Antigravity', 'Freebuff',
    ],
  },
  {
    id: 'coursework',
    title: 'Highlighted Coursework',
    hint: 'hidden layer',
    x: -3.2,
    color: '#4577c9',
    zCols: 4,
    rowGap: 0.82,
    zGap: 1.0,
    radius: 0.09,
    output: false,
    nodes: [
      'Statistics', 'Linear Algebra', 'Calculus', 'Discrete Math',
      'Numerical Analysis', 'Statistical Inference', 'OOP', 'DSA',
      'Computer Architecture and Assembly Language', 'Operating Systems',
      'Database Systems', 'Digital Logic and Circuit Design',
      'TOA (Theory of Automata)', 'Machine Learning', 'AI',
      'NLP with Deep Learning', 'Web-Based App Dev', 'Software Engineering',
      'Cloud Computing', 'Computer Networking', 'HCI',
      'Electricity Magnetism and Waves',
    ],
  },
  {
    id: 'experience',
    title: 'Applied Experiences',
    hint: 'output head A',
    x: 3.4,
    color: '#a8946b',
    zCols: 1,
    rowGap: 1.6,
    zGap: 0,
    radius: 0.21,
    output: true,
    nodes: ['EdgeFirm Intern', 'IBAGrads Instructor', 'Enigma Module Head'],
  },
  {
    id: 'projects',
    title: 'Projects & Deliverables',
    hint: 'output head B',
    x: 9.2,
    color: '#58b7cf',
    zCols: 2,
    rowGap: 1.15,
    zGap: 1.3,
    radius: 0.21,
    output: true,
    nodes: [
      'Weather Ways',
      'Multi-Agent Path Finding (MAPF)',
      'Hybrid RAG System',
      'PantryPal',
      'AcademIQ',
      'S4 Galaxy Classifier',
    ],
  },
]

/* ------------------------------------------------------------------ */
/* Wiring — exact reverse-traversal dependency graph                   */
/* ------------------------------------------------------------------ */

/** Aliases so the wiring names resolve onto the canonical node ids. */
const ALIAS: Record<string, string> = {
  PostgreSQL: 'PostgreSQL (Supabase)',
}

/** source (output node) → its direct prerequisites */
export const wiring: Record<string, string[]> = {
  'Weather Ways': [
    'Flutter', 'Node.js', 'Prisma', 'Gemini API', 'AWS CloudWatch',
    'Firebase', 'OAuth 2.0', 'Twilio', 'GitHub Actions',
    'Software Engineering', 'Cloud Computing', 'Web-Based App Dev',
    'EdgeFirm Intern',
  ],
  'Multi-Agent Path Finding (MAPF)': [
    'Python', 'PyTorch', 'DQN', 'Google Colabs',
    'AI', 'DSA', 'OOP', 'Linear Algebra',
  ],
  'Hybrid RAG System': [
    'Python', 'LangChain', 'Pinecone', 'Sentence Transformers', 'BM25',
    'RAG', 'Kaggle',
    'NLP with Deep Learning', 'Machine Learning', 'Statistical Inference',
  ],
  PantryPal: [
    'React', 'Node.js', 'Express', 'PostgreSQL', 'REST APIs', 'JWT',
    'Agile/Scrum', 'Windsurf',
    'Database Systems', 'Web-Based App Dev', 'Software Engineering',
  ],
  AcademIQ: [
    'JavaScript', 'Node.js', 'SQL', 'Agile/Scrum', 'Figma', 'Cursor',
    'HCI', 'Software Engineering', 'Database Systems',
  ],
  'S4 Galaxy Classifier': [
    'C++', 'Python', 'Verilog', 'PyTorch',
    'Computer Architecture and Assembly Language', 'Digital Logic and Circuit Design',
  ],
  'IBAGrads Instructor': [
    'MS Excel (Pivot Tables)', 'MS Office',
    'Calculus', 'Statistics', 'Linear Algebra', 'Discrete Math',
  ],
  'Enigma Module Head': ['Trello', 'Standups', 'Sprint Planning', 'Agile/Scrum'],
}

/* ------------------------------------------------------------------ */
/* Layout — volumetric node positions (X column, organic Y/Z offsets)  */
/* ------------------------------------------------------------------ */

export interface NetworkNodeDef {
  id: string
  col: number
  pos: THREE.Vector3
  radius: number
  color: string
  output: boolean
}

function resolve(name: string): string {
  return ALIAS[name] ?? name
}

export const nodeDefs: NetworkNodeDef[] = []
export const nodeById = new Map<string, NetworkNodeDef>()

columns.forEach((col, ci) => {
  const n = col.nodes.length
  col.nodes.forEach((rawName, i) => {
    /* Layout:
       - input/hidden columns: a volumetric slab (rows × Z slices)
       - output columns: a single zigzag column — every node gets its own Y
         row (no two output nodes ever stack behind each other on screen)
         while alternating Z keeps the column genuinely 3D. */
    const id = resolve(rawName)
    const output = col.output
    const row = output ? i : Math.floor(i / col.zCols)
    const zi = i % col.zCols
    const rows = output ? n : Math.ceil(n / col.zCols)
    const zSpread = output ? (col.zGap || 0.9) * 0.6 : col.zGap
    const pos = new THREE.Vector3(
      col.x + (rand() - 0.5) * 0.5, // slight X scatter inside the column
      (row - (rows - 1) / 2) * col.rowGap + (rand() - 0.5) * 0.18, // organic Y
      (output
        ? (i % 2 === 0 ? -1 : 1) * zSpread
        : (zi - (col.zCols - 1) / 2) * zSpread) +
        (rand() - 0.5) * 0.3, // organic Z
    )
    const def: NetworkNodeDef = {
      id,
      col: ci,
      pos,
      radius: col.radius,
      color: col.color,
      output: col.output,
    }
    nodeDefs.push(def)
    nodeById.set(id, def)
  })
})

/** Top of each column — where the billboard heading floats. */
export const columnTop: number[] = columns.map((col, ci) => {
  const tops = nodeDefs.filter((n) => n.col === ci).map((n) => n.pos.y)
  return Math.max(...tops)
})

/* ------------------------------------------------------------------ */
/* Edges                                                               */
/* ------------------------------------------------------------------ */

export interface EdgeDef {
  from: string
  to: string
  a: THREE.Vector3
  b: THREE.Vector3
  color: THREE.Color
}

export const edges: EdgeDef[] = []

for (const [from, targets] of Object.entries(wiring)) {
  const src = nodeById.get(from)
  if (!src) continue
  for (const rawTo of targets) {
    const dst = nodeById.get(resolve(rawTo))
    if (!dst) continue
    // Blend source → target column colour so wires read as flow direction.
    const c = new THREE.Color(src.color).lerp(new THREE.Color(dst.color), 0.5)
    edges.push({ from, to: dst.id, a: src.pos, b: dst.pos, color: c })
  }
}

export const edgePositions = new Float32Array(
  edges.flatMap((e) => [e.a.x, e.a.y, e.a.z, e.b.x, e.b.y, e.b.z]),
)

/** Direct prerequisites of each node (outgoing edges). */
export const outgoing: Record<string, string[]> = {}
for (const e of edges) (outgoing[e.from] ??= []).push(e.to)

export interface Traversal {
  nodes: Set<string>
  edges: Set<number>
}

/**
 * Reverse traversal: from a clicked output node, walk every outgoing edge
 * and collect all reachable prerequisite nodes + the edges that light up.
 */
export function traverse(startId: string): Traversal {
  const nodes = new Set<string>([startId])
  const edgeIdx = new Set<number>()
  const queue = [startId]
  while (queue.length) {
    const cur = queue.pop()!
    edges.forEach((e, i) => {
      if (e.from !== cur || edgeIdx.has(i)) return
      edgeIdx.add(i)
      if (!nodes.has(e.to)) {
        nodes.add(e.to)
        queue.push(e.to)
      }
    })
  }
  return { nodes, edges: edgeIdx }
}

/* Output-column ids (the clickable raycast targets). */
export const outputNodeIds = new Set(
  nodeDefs.filter((n) => n.output).map((n) => n.id),
)

/* Ids of nodes that carry a wiring entry (reverse lookup for extras). */
export const wiredSources = new Set(Object.keys(wiring))

/** Ambient dust field around the network. */
export const dustPositions = (() => {
  const arr = new Float32Array(260 * 3)
  for (let i = 0; i < 260; i++) {
    arr[i * 3] = (rand() - 0.5) * 26
    arr[i * 3 + 1] = (rand() - 0.5) * 14
    arr[i * 3 + 2] = (rand() - 0.5) * 14
  }
  return arr
})()
