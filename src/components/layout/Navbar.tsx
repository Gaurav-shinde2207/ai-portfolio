import { useEffect, useState } from 'react'
import {
  Menu,
  X,
  FileDown,
} from 'lucide-react'
import { identity } from '../../data/profile'

const links = [
  { label: 'HOME', href: '#home' },
  { label: 'ABOUT', href: '#about' },
  { label: 'PROJECTS', href: '#projects' },
  { label: 'EXPERTISE', href: '#expertise' },
  { label: 'CONTACT', href: '#contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const iconLinks = links.slice(1)

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? 'bg-bg/85 border-b border-line backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 md:px-8" aria-label="Primary">
        <a href="#home" className="flex items-center gap-2.5 py-4">
          <span className="grid h-8 w-8 place-items-center rounded-sm border border-amber/50 font-mono text-xs font-medium text-amber">
            G
          </span>
          <span className="font-mono text-sm tracking-[0.18em] text-ink">GAURAV.AI</span>
        </a>

        {/* Desktop */}
        <div className="hidden items-center gap-7 md:flex">
          {iconLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="font-mono text-xs tracking-[0.14em] text-muted transition-colors hover:text-amber"
            >
              <span className="text-amber/60">{l.label.slice(0, 1)}</span> {l.label}
            </a>
          ))}
          <a href={identity.contact.resume} download className="btn-primary !px-4 !py-2">
            <FileDown className="h-4 w-4" aria-hidden="true" />
            Resume
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-sm border border-line text-ink md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-menu" className="border-t border-line bg-bg/95 px-5 pb-6 pt-2 backdrop-blur-md md:hidden">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block border-b border-line/60 py-3.5 font-mono text-sm tracking-[0.12em] text-ink hover:text-amber"
            >
              {l.label}
            </a>
          ))}
          <a
            href={identity.contact.resume}
            download
            onClick={() => setOpen(false)}
            className="btn-primary mt-4 w-full"
          >
            <FileDown className="h-4 w-4" aria-hidden="true" />
            Download resume
          </a>
        </div>
      )}
    </header>
  )
}
