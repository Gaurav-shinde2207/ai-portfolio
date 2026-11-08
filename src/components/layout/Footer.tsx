import { identity } from '../../data/profile'

export default function Footer() {
  return (
    <footer className="border-t border-line py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 text-center md:flex-row md:px-8 md:text-left">
        <p className="font-mono text-xs tracking-[0.16em] text-muted">
          {identity.name.toUpperCase()}
          <span className="mx-2 text-line">|</span>AI ENGINEER
        </p>
        <p className="font-mono text-xs text-muted">© 2026 · Built with React, TypeScript &amp; GSAP</p>
      </div>
    </footer>
  )
}
