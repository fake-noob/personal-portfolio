/**
 * Central data structure for Muhammad Ahzam's three professional personas.
 * Sourced directly from the three resumes: resume_AIML, resume_SWE, resume_PM.
 */

export type PersonaId = 'aiml' | 'swe' | 'pm'

export interface Persona {
  id: PersonaId
  label: string
  shortLabel: string
  accent: string // hex
  accentRgb: string // "r, g, b" for alpha variants
  headline: string
  typewriterPhrases: string[]
  bio: string
  focus: string[]
}

export interface Bullet {
  text: string
  /** Personas this bullet appears under; omit for "all" */
  personas?: PersonaId[]
}

export interface ExperienceRole {
  id: string
  title: string
  org: string
  location: string
  period: string
  highlight?: boolean
  bullets: Bullet[]
}

export interface Project {
  id: string
  title: string
  subtitle: string
  description: string
  tech: string[]
  bullets: string[]
  github?: string
  live?: string
  /** Grid span hint for the bento layout */
  span: 'large' | 'wide' | 'normal'
  personas: PersonaId[]
}

export interface SkillCategory {
  id: string
  label: string
  skills: { name: string; personas: PersonaId[] }[]
}

export interface ResumeFile {
  persona: PersonaId
  label: string
  file: string
}

export interface Certification {
  title: string
  issuer: string
  status?: string
  personas: PersonaId[]
}

/* ------------------------------------------------------------------ */
/* PERSONAS                                                            */
/* ------------------------------------------------------------------ */

export const personas: Persona[] = [
  {
    id: 'aiml',
    label: 'AI / ML',
    shortLabel: 'AI/ML',
    accent: '#a855f7', // Electric Purple
    accentRgb: '168, 85, 247',
    headline: 'AI/ML Engineer',
    typewriterPhrases: [
      'Deep Q-Networks.',
      'Hybrid RAG pipelines.',
      'Multi-agent systems.',
      'Gemini-powered apps.',
    ],
    bio: 'CS student at IBA Karachi building intelligent systems — from decentralized multi-agent path finding to retrieval-augmented forensic QA. I care about reward curves, eval frameworks and latency budgets.',
    focus: ['PyTorch & DQN', 'RAG / LangChain', 'Gemini API integrations'],
  },
  {
    id: 'swe',
    label: 'Software Engineering',
    shortLabel: 'SWE',
    accent: '#22d3ee', // Cyberpunk Cyan
    accentRgb: '34, 211, 238',
    headline: 'Software Engineer',
    typewriterPhrases: [
      '40+ REST endpoints.',
      'OAuth 2.0 flows.',
      'Flutter + Next.js stacks.',
      'Production observability.',
    ],
    bio: 'Full-stack engineer shipping production software — I took over a live three-repo client stack mid-cycle at EdgeFirm, shipped OAuth 2.0 and Twilio alert fan-outs, and keep Crashlytics and CloudWatch honest.',
    focus: ['React / Node.js / PostgreSQL', 'Auth & API design', 'Cloud & observability'],
  },
  {
    id: 'pm',
    label: 'Product Management',
    shortLabel: 'PM',
    accent: '#f59e0b', // Amber
    accentRgb: '245, 158, 11',
    headline: 'Product Manager',
    typewriterPhrases: [
      'user surveys → specs.',
      'Agile sprints led.',
      'client UAT cycles.',
      'prioritized roadmaps.',
    ],
    bio: 'Product-minded builder who turns user research into shipped software — I surveyed IBA students to scope AcademIQ, mapped end-to-end journeys for PantryPal, and drove a live client through UAT at EdgeFirm.',
    focus: ['Discovery & requirements', 'Agile leadership', 'Client-facing delivery'],
  },
]

export const defaultPersona: PersonaId = 'aiml'

export const resumeFiles: ResumeFile[] = [
  { persona: 'aiml', label: 'AI / ML Resume', file: '/resumes/resume_AIML.pdf' },
  { persona: 'swe', label: 'Software Engineering Resume', file: '/resumes/resume_SWE.pdf' },
  { persona: 'pm', label: 'Product Management Resume', file: '/resumes/resume_PM.pdf' },
]

/* ------------------------------------------------------------------ */
/* PROFILE                                                             */
/* ------------------------------------------------------------------ */

export const profile = {
  name: 'Muhammad Ahzam',
  role: 'Computer Science @ IBA Karachi',
  location: 'Karachi, Pakistan',
  email: 'muhammadahzam115@gmail.com',
  phone: '+92 331 3758455',
  linkedin: 'https://linkedin.com/in/mAhzam',
  github: 'https://github.com/fake-noob',
  education: {
    school: 'Institute of Business Administration (IBA), Karachi',
    degree: 'BS in Computer Science',
    period: 'Expected 2027',
    coursework:
      'Machine Learning · NLP with Deep Learning · Statistical Inference · Data Structures & Algorithms · Database Systems · Cloud Computing · Operating Systems · Software Engineering',
  },
}

/* ------------------------------------------------------------------ */
/* EXPERIENCE                                                          */
/* ------------------------------------------------------------------ */

export const experience: ExperienceRole[] = [
  {
    id: 'edgefirm',
    title: 'AI-Integrated Mobile App Developer Intern',
    org: 'EdgeFirm',
    location: 'Remote',
    period: 'Jul – Aug 2026',
    highlight: true,
    bullets: [
      {
        text: 'Took over the Weather Ways project mid-cycle and delivered its remaining three sprints on a live three-repository stack (Flutter/GetX, Node.js/Prisma, Next.js) through client User Acceptance Testing.',
        personas: ['aiml', 'swe'],
      },
      {
        text: 'Inherited the Weather Ways project mid-cycle and delivered its remaining three sprints to a live client, working through User Acceptance Testing and direct client feedback.',
        personas: ['pm'],
      },
      {
        text: 'Integrated the Google Gemini API to turn real-time weather context into dynamic route optimizations, managing app state and latency so AI output became safe, navigable routes.',
        personas: ['aiml'],
      },
      {
        text: 'Shipped Gemini-powered, weather-aware route optimization, handling latency and state so AI output became safe, usable routes for end users.',
        personas: ['pm'],
      },
      {
        text: 'Implemented OAuth 2.0 identity-token validation and a Twilio SMS fan-out that dispatches high-severity emergency alerts (e.g. sudden road closures), with global administrative kill-switches.',
        personas: ['swe', 'pm'],
      },
      {
        text: 'Added AWS CloudWatch (backend) and Firebase Crashlytics (mobile) observability to catch silent failures and edge cases in production.',
        personas: ['aiml', 'swe', 'pm'],
      },
      {
        text: 'Rewrote coordinate-parsing logic to fix client-reported map rendering artifacts, so backend spatial data renders as smooth traffic-flow polylines on mobile.',
        personas: ['swe', 'aiml', 'pm'],
      },
    ],
  },
  {
    id: 'ibagrads',
    title: 'Math & Problem-Solving Instructor',
    org: 'IBAGrads (IBA & SAT entry-test prep institute)',
    location: 'Karachi',
    period: 'Jul 2024 – Apr 2026',
    highlight: true,
    bullets: [
      {
        text: 'Taught ~70 students across four batches for the IBA and SAT entry test, plus 4 private O-level students — selected after ranking 1st in the IBA entry test.',
      },
      {
        text: 'Tailored instruction to each batch\u2019s performance; students are now enrolled across IBA programs and universities abroad.',
        personas: ['pm', 'aiml', 'swe'],
      },
    ],
  },
  {
    id: 'enigma',
    title: 'Module Head — Enigma, IBA\u2019s flagship event',
    org: 'IBA',
    location: 'Karachi',
    period: '2023 & 2024',
    bullets: [
      {
        text: 'Selected as module head two years running; led a 20-person team running a module for 16 competing teams (144 participants).',
      },
    ],
  },
]

/* ------------------------------------------------------------------ */
/* PROJECTS                                                            */
/* ------------------------------------------------------------------ */

export const projects: Project[] = [
  {
    id: 'mapf',
    title: 'Multi-Agent Path Finding',
    subtitle: 'Priority-Based Routing · solo project',
    description:
      'A decentralized path-finding engine for robots on a 25×35 hospital pharmacy grid with 1-tile storage aisles and 2–3 tile corridors, combining A* search with a Constraint Satisfaction framework. Moves and 90° turns each cost one time unit.',
    tech: ['Python', 'PyTorch', 'DQN', 'A*', 'CSP'],
    bullets: [
      'Resolved deadlocks with Priority Inheritance with Backtracking, enforcing yielding behavior in single-tile aisles.',
      'Trained a Deep Q-Network with curriculum learning, a 10,000-sample experience replay buffer and a custom reward balancing progress, collisions and time-based urgency.',
      'Achieved 100% success and a 1.0602 cost-efficiency ratio across six deterministic edge-case scenarios, eliminating livelock oscillations.',
    ],
    github: 'https://github.com/fake-noob',
    span: 'large',
    personas: ['aiml', 'swe', 'pm'],
  },
  {
    id: 'pantrypal',
    title: 'PantryPal',
    subtitle: 'Meal Planning Platform · Lead Architect & Developer',
    description:
      'Full-stack pantry and recipe-discovery app with 40+ REST endpoints, JWT authentication, multi-filter search and multipart uploads. React UX requirements map directly onto PostgreSQL constraints via PL/pgSQL stored procedures for real-time pantry deductions and daily macro aggregation.',
    tech: ['React 19', 'Node.js', 'Express', 'PostgreSQL', 'Supabase', 'Multer'],
    bullets: [
      'Built a drag-and-drop weekly meal calendar and a real-time cooking countdown tracker.',
      'Mapped user journeys and specs for meal planning, inventory tracking, shopping-list PDFs, nutrition tracking and interactive cooking mode.',
    ],
    github: 'https://github.com/fake-noob',
    span: 'large',
    personas: ['aiml', 'swe', 'pm'],
  },
  {
    id: 'rag',
    title: 'Hybrid RAG System',
    subtitle: 'Forensic Science Queries · equal contributors',
    description:
      'A RAG pipeline answering questions on fingerprints, blood groups and dermatoglyphics strictly from a specialized PDF corpus — recursive chunking, a Qwen LLM via OpenRouter, and Pinecone semantic search fused with local BM25 via Reciprocal Rank Fusion.',
    tech: ['Python', 'LangChain', 'Pinecone', 'BM25', 'Sentence Transformers'],
    bullets: [
      'Designed a custom evaluation framework scoring faithfulness (word overlap) and relevancy (cosine similarity).',
      'Reduced response latency by 35% to 1.544 s while maintaining accuracy.',
    ],
    github: 'https://github.com/fake-noob',
    span: 'normal',
    personas: ['aiml', 'pm'],
  },
  {
    id: 'weatherways',
    title: 'Weather Ways',
    subtitle: 'AI-integrated navigation · client project at EdgeFirm',
    description:
      'Live three-repository client stack (Flutter/GetX, Node.js/Prisma, Next.js) delivering Gemini-powered, weather-aware route optimization with emergency SMS alerts — inherited mid-cycle and shipped through client UAT.',
    tech: ['Flutter', 'Next.js', 'Node.js', 'Prisma', 'Gemini API', 'Twilio'],
    bullets: [
      'Gemini API turns real-time weather into dynamic route optimizations with managed latency and safe, navigable output.',
      'Twilio SMS fan-out for road closures with global admin kill-switches; OAuth 2.0 identity-token validation.',
      'AWS CloudWatch + Firebase Crashlytics observability; rewrote coordinate-parsing for smooth traffic-flow polylines.',
    ],
    span: 'wide',
    personas: ['aiml', 'swe', 'pm'],
  },
  {
    id: 'academiq',
    title: 'AcademIQ',
    subtitle: 'Academic Collaboration Platform · Project Lead',
    description:
      'Academic resource platform scoped from a survey of IBA students, built by a four-person team through Agile sprints — coordinating UI design with database development and prioritizing the backlog.',
    tech: ['JavaScript', 'Node.js', 'SQL'],
    bullets: [
      'Turned survey findings into product requirements and led the team through Agile sprints.',
      'Built email/phone authentication, an interactive calendar module and structured resource hubs.',
    ],
    github: 'https://github.com/fake-noob',
    span: 'normal',
    personas: ['swe', 'pm'],
  },
]

/* ------------------------------------------------------------------ */
/* SKILLS                                                              */
/* ------------------------------------------------------------------ */

export const skillCategories: SkillCategory[] = [
  {
    id: 'ml',
    label: 'ML / AI',
    skills: [
      { name: 'PyTorch', personas: ['aiml'] },
      { name: 'TensorFlow', personas: ['aiml'] },
      { name: 'scikit-learn', personas: ['aiml'] },
      { name: 'LangChain', personas: ['aiml'] },
      { name: 'Sentence Transformers', personas: ['aiml'] },
      { name: 'Pinecone', personas: ['aiml'] },
      { name: 'BM25', personas: ['aiml'] },
      { name: 'Reinforcement Learning (DQN)', personas: ['aiml'] },
      { name: 'RAG', personas: ['aiml'] },
      { name: 'MLflow', personas: ['aiml'] },
      { name: 'Gemini API', personas: ['aiml', 'swe'] },
      { name: 'ML fundamentals', personas: ['pm'] },
    ],
  },
  {
    id: 'fullstack',
    label: 'Full-Stack',
    skills: [
      { name: 'React', personas: ['aiml', 'swe', 'pm'] },
      { name: 'Node.js', personas: ['aiml', 'swe', 'pm'] },
      { name: 'Express', personas: ['swe'] },
      { name: 'Prisma', personas: ['swe'] },
      { name: 'PostgreSQL', personas: ['aiml', 'swe', 'pm'] },
      { name: 'Supabase', personas: ['swe'] },
      { name: 'REST APIs', personas: ['swe', 'pm'] },
      { name: 'JWT / OAuth 2.0', personas: ['swe'] },
      { name: 'Firebase', personas: ['aiml', 'swe', 'pm'] },
      { name: 'Tailwind CSS', personas: ['swe'] },
      { name: 'React Router / Vite', personas: ['swe'] },
      { name: 'Python', personas: ['aiml', 'swe', 'pm'] },
      { name: 'SQL', personas: ['aiml', 'swe', 'pm'] },
      { name: 'C++', personas: ['aiml', 'swe'] },
      { name: 'NumPy / Pandas', personas: ['aiml'] },
    ],
  },
  {
    id: 'tools',
    label: 'Tools & Cloud',
    skills: [
      { name: 'Git / GitHub', personas: ['aiml', 'swe', 'pm'] },
      { name: 'AWS CloudWatch', personas: ['aiml', 'swe', 'pm'] },
      { name: 'Twilio', personas: ['swe', 'pm'] },
      { name: 'VS Code', personas: ['aiml', 'swe'] },
      { name: 'Cursor', personas: ['aiml', 'swe'] },
      { name: 'Claude Code', personas: ['aiml', 'swe'] },
      { name: 'Figma', personas: ['pm'] },
      { name: 'MS Excel', personas: ['aiml', 'pm'] },
      { name: 'MS Power Apps', personas: ['pm'] },
      { name: 'MS Entra', personas: ['pm', 'swe'] },
      { name: 'Trello / ClickUp', personas: ['pm', 'swe'] },
    ],
  },
  {
    id: 'delivery',
    label: 'Delivery & Product',
    skills: [
      { name: 'Agile / Scrum', personas: ['pm', 'swe'] },
      { name: 'Sprint Planning', personas: ['pm'] },
      { name: 'Requirements Definition', personas: ['pm'] },
      { name: 'User Surveys', personas: ['pm'] },
      { name: 'User Journey Mapping', personas: ['pm'] },
      { name: 'Prioritization', personas: ['pm'] },
      { name: 'Metrics Definition', personas: ['pm'] },
      { name: 'Client Communication', personas: ['pm'] },
      { name: 'Team Leadership', personas: ['pm', 'aiml', 'swe'] },
      { name: 'Client UAT', personas: ['swe', 'pm'] },
    ],
  },
]

/* ------------------------------------------------------------------ */
/* CERTIFICATIONS                                                      */
/* ------------------------------------------------------------------ */

export const certifications: Certification[] = [
  { title: 'Supervised Learning with scikit-learn', issuer: 'DataCamp', personas: ['aiml'] },
  { title: 'Cluster Analysis in Python', issuer: 'DataCamp', personas: ['aiml'] },
  { title: 'Introduction to MLflow', issuer: 'DataCamp', personas: ['aiml', 'swe'] },
  { title: 'AI for Professionals', issuer: 'LUMSX / ILMx', personas: ['aiml', 'swe', 'pm'] },
  { title: 'Introduction to Git', issuer: 'DataCamp', status: 'In Progress', personas: ['swe'] },
  { title: 'Business Communication', issuer: 'ILMx', personas: ['pm'] },
]

/* ------------------------------------------------------------------ */
/* HELPERS                                                             */
/* ------------------------------------------------------------------ */

export function filterByPersona<T extends { personas?: PersonaId[] }>(
  items: T[],
  persona: PersonaId,
): T[] {
  return items.filter((item) => !item.personas || item.personas.includes(persona))
}

export function getPersona(id: PersonaId): Persona {
  return personas.find((p) => p.id === id) ?? personas[0]
}
