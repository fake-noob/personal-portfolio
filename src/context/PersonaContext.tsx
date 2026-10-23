import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { defaultPersona, getPersona, type Persona, type PersonaId } from '../data/resumes'

interface PersonaContextValue {
  personaId: PersonaId
  persona: Persona
  setPersona: (id: PersonaId) => void
}

const PersonaContext = createContext<PersonaContextValue | null>(null)

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [personaId, setPersonaId] = useState<PersonaId>(defaultPersona)
  const persona = useMemo(() => getPersona(personaId), [personaId])

  // Swap the site-wide accent CSS variables — every accent-* utility
  // transitions via the --accent-transition easing.
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--accent', persona.accent)
    root.style.setProperty('--accent-rgb', persona.accentRgb)
  }, [persona])

  const value = useMemo(
    () => ({ personaId, persona, setPersona: setPersonaId }),
    [personaId, persona],
  )

  return <PersonaContext.Provider value={value}>{children}</PersonaContext.Provider>
}

export function usePersona(): PersonaContextValue {
  const ctx = useContext(PersonaContext)
  if (!ctx) throw new Error('usePersona must be used within PersonaProvider')
  return ctx
}
