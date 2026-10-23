import { PersonaProvider } from './context/PersonaContext'
import SceneCanvas from './three/SceneCanvas'
import { useScrollDirector } from './three/useScrollDirector'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Experience from './components/Experience'
import Projects from './components/Projects'
import Skills from './components/Skills'
import Certifications from './components/Certifications'
import Footer from './components/Footer'

export default function App() {
  useScrollDirector()

  return (
    <PersonaProvider>
      <div className="grain relative min-h-screen">
        <SceneCanvas />
        <Navbar />
        <main className="pointer-events-none relative z-10">
          <Hero />
          <Experience />
          <Projects />
          <Skills />
          <Certifications />
        </main>
        <Footer />
      </div>
    </PersonaProvider>
  )
}
