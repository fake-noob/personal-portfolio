import { useEffect } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap'
import { frame, ramp, selectProject, setActiveSection } from './sceneStore'
import { certMV, projectsMV, skillsMV } from './scrollValues'

/**
 * The scroll director.
 *
 * Sections hand off to each other at exact scroll boundaries:
 *   projects: top hits viewport bottom → bottom hits viewport bottom
 *   skills:   same convention, starting where projects ended
 *   certs:    same, driving the lights-out factor and the final dolly
 *
 * Progress is written straight into `frame` (no React re-render) and mirrored
 * into motion values for the DOM overlays.
 */

gsap.registerPlugin(ScrollTrigger)

export function useScrollDirector() {
  useEffect(() => {
    const triggers: ScrollTrigger[] = []

    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = -((e.clientY / window.innerHeight) * 2 - 1)
      frame.mouse.x = x < -1 ? -1 : x > 1 ? 1 : x
      frame.mouse.y = y < -1 ? -1 : y > 1 ? 1 : y
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') selectProject(null)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('keydown', onKey)

    // ---- camera drives ----
    triggers.push(
      ScrollTrigger.create({
        trigger: '#projects',
        start: 'top bottom',
        end: 'bottom bottom',
        onUpdate: (self) => {
          frame.projectsProgress = self.progress
          projectsMV.set(self.progress)
          if (self.progress <= 0.001 && frame.selectedId) selectProject(null)
        },
      }),
    )

    triggers.push(
      ScrollTrigger.create({
        trigger: '#skills',
        start: 'top bottom',
        end: 'bottom bottom',
        onUpdate: (self) => {
          frame.skillsProgress = self.progress
          skillsMV.set(self.progress)
          // leaving the network must release a focused node
          if (self.progress > 0.02 && frame.selectedId) selectProject(null)
        },
      }),
    )

    triggers.push(
      ScrollTrigger.create({
        trigger: '#certifications',
        start: 'top bottom',
        end: 'bottom bottom',
        onUpdate: (self) => {
          const p = self.progress
          frame.certProgress = p
          certMV.set(p)
          if (p > 0.02 && frame.selectedId) selectProject(null)
          // lights out on entry, back on for the footer
          frame.certDim = Math.min(ramp(p, 0.1, 0.4), 1 - ramp(p, 0.92, 1))
        },
        onLeave: () => setActiveSection('idle'),
      }),
    )

    // ---- active section (drives the flashlight overlay + hover light) ----
    const section = (selector: string, name: 'projects' | 'skills' | 'certifications') => {
      triggers.push(
        ScrollTrigger.create({
          trigger: selector,
          start: 'top 50%',
          end: 'bottom 50%',
          onToggle: (self) => {
            if (self.isActive) setActiveSection(name)
            else if (frame.activeSection === name) setActiveSection('idle')
          },
        }),
      )
    }
    section('#projects', 'projects')
    section('#skills', 'skills')
    section('#certifications', 'certifications')

    // Layout settles after fonts/images — re-measure a few times.
    const timers = [300, 900, 1800, 3200].map((t) =>
      window.setTimeout(() => ScrollTrigger.refresh(), t),
    )
    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load', onLoad)
    document.fonts?.ready.then(() => ScrollTrigger.refresh())

    if (import.meta.env.DEV) {
      ;(window as unknown as Record<string, unknown>).__st = ScrollTrigger
    }

    // Sections are sized in vh, so a viewport change re-choreographs
    // everything — and hosted webviews do not always emit a window resize
    // event. Poll the viewport cheaply (never refresh from a ResizeObserver,
    // which can loop through scrollbar reflow).
    let lastW = window.innerWidth
    let lastH = window.innerHeight
    const viewportWatch = window.setInterval(() => {
      if (window.innerWidth === lastW && window.innerHeight === lastH) return
      lastW = window.innerWidth
      lastH = window.innerHeight
      ScrollTrigger.refresh()
    }, 800)

    return () => {
      timers.forEach((t) => window.clearTimeout(t))
      window.clearInterval(viewportWatch)
      window.removeEventListener('load', onLoad)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('keydown', onKey)
      triggers.forEach((t) => t.kill())
    }
  }, [])
}
