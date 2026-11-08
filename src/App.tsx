import { useEffect, useState } from 'react'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import BootSequence from './components/sections/BootSequence'
import Hero from './components/sections/Hero'
import About from './components/sections/About'
import Projects from './components/sections/Projects'
import Playground from './components/sections/Playground'
import Expertise from './components/sections/Expertise'
import Contact from './components/sections/Contact'

const BOOT_KEY = 'gaurav-ai-booted'

export default function App() {
  const [booted, setBooted] = useState<boolean | null>(null)

  useEffect(() => {
    try {
      setBooted(window.sessionStorage.getItem(BOOT_KEY) === '1')
    } catch {
      setBooted(true) // storage blocked (private mode etc.) — skip the intro, never trap a visitor
    }
  }, [])

  const finishBoot = () => {
    try {
      window.sessionStorage.setItem(BOOT_KEY, '1')
    } catch {
      /* ignore — intro just replays next visit */
    }
    setBooted(true)
  }

  if (booted === null) {
    // Avoid a boot-intro flash on hydration-relevant edge cases: render nothing until checked.
    return null
  }

  return (
    <>
      {!booted && <BootSequence onDone={finishBoot} />}
      <Navbar />
      <main id="main">
        <Hero />
        <About />
        <Projects />
        <Playground />
        <Expertise />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
