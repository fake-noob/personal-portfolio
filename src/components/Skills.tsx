import { motion, useTransform } from 'framer-motion'
import { skillCategories, type PersonaId, type SkillCategory } from '../data/resumes'
import { skillsMV } from '../three/scrollValues'

/**
 * DOM overlay for the exploded-assembly section. Skill rows reveal in step
 * with the 3D panels locking into place — driven by the same scroll value.
 * All skills from all three personas are rendered, grouped by category, in a
 * left-pinned flashcard so the right side of the screen stays clear.
 */

function SkillRow({
  cat,
  index,
  skills,
}: {
  cat: SkillCategory
  index: number
  skills: { name: string; personas: PersonaId[] }[]
}) {
  const start = 0.1 + index * 0.15
  const opacity = useTransform(skillsMV, [start, start + 0.18], [0.12, 1])
  const y = useTransform(skillsMV, [start, start + 0.18], [16, 0])

  return (
    <motion.li
      style={{ opacity, y }}
      className="border-t border-white/10 py-3 first:border-t-0 first:pt-0"
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-400">
          {cat.label}
        </span>
        <span className="font-mono text-[10px] text-zinc-600">
          {String(skills.length).padStart(2, '0')}
        </span>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {skills.map((s) => (
          <span
            key={s.name}
            className="rounded-full border border-[rgba(0,150,180,0.25)] bg-[rgba(0,150,180,0.07)] px-2 py-0.5 font-mono text-[10px] text-zinc-400"
          >
            {s.name}
          </span>
        ))}
      </div>
    </motion.li>
  )
}

export default function Skills() {
  const progress = useTransform(skillsMV, [0, 1], ['0%', '100%'])

  return (
    <section id="skills" className="pointer-events-none relative h-[280vh]">
      <div className="pointer-events-none sticky top-0 h-screen">
        {/* pinned left so the assembly on the right keeps its own space */}
        <div className="mr-auto w-full max-w-6xl px-4 pt-24 sm:px-6">
          <div className="glass max-w-2xl rounded-3xl p-5 sm:p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-zinc-500">
              03 — Stack
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-50">
              Exploded assembly
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Scroll forward — the layers fly in from every direction and lock into a
              single structure. Each panel carries one layer of the stack.
            </p>

            <ul className="mt-5">
              {skillCategories.map((cat, i) => (
                <SkillRow key={cat.id} cat={cat} index={i} skills={cat.skills} />
              ))}
            </ul>

            <div className="mt-4 h-px w-full overflow-hidden bg-white/10">
              <motion.div className="accent-bg h-px" style={{ width: progress }} />
            </div>
            <div className="mt-2 flex justify-between font-mono text-[9px] uppercase tracking-[0.25em] text-zinc-600">
              <span>scatter</span>
              <span>locked</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
