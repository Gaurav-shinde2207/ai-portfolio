import { Copy, FileDown, ExternalLink, Mail } from 'lucide-react'
import { useState } from 'react'
import Reveal from '../ui/Reveal'
import SectionHeading from '../ui/SectionHeading'
import { identity } from '../../data/profile'

export default function Contact() {
  const email = identity.contact.email
  const [copied, setCopied] = useState(false)

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section id="contact" className="border-t border-line py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading eyebrow="CONTACT · 05" title={identity.contact.headline} />
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-[7fr_5fr]">
            <div>
              <p className="max-w-xl text-base leading-relaxed text-muted md:text-lg">
                {identity.contact.copy}
              </p>
              <p className="mt-4 max-w-xl text-sm text-muted">
                Based in {identity.location}. Open to the roles in my objective:{' '}
                <span className="text-ink">{identity.objective}</span>
              </p>
              <div className="contact-row mt-8 flex flex-wrap items-center gap-4">
                <a href={`mailto:${email}`} className="btn-primary text-base">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  Email me
                </a>
                <button
                  type="button"
                  onClick={copyEmail}
                  className="btn-secondary"
                  aria-live="polite"
                >
                  {copied ? (
                    'Copied ✓'
                  ) : (
                    <>
                      <Copy className="h-4 w-4" aria-hidden="true" />
                      Copy email
                    </>
                  )}
                </button>
                <a href={identity.contact.resume} download className="btn-secondary">
                  <FileDown className="h-4 w-4" aria-hidden="true" />
                  Resume (PDF)
                </a>
              </div>
              <p className="font-mono text-xs text-cyan mt-4">{email}</p>
            </div>

            <Reveal delay={120}>
              <div className="panel p-5 md:p-6">
                <p className="tech-label text-amber">DIRECT CHANNELS</p>
                <ul className="mt-4 space-y-3">
                  <li>
                    <a
                      href={identity.contact.github}
                      target="_blank"
                      rel="noreferrer"
                      className="link-cyan flex items-center gap-3 text-sm"
                    >
                      <ExternalLink className="h-4 w-4 text-amber" aria-hidden="true" />
                      github.com/Gaurav-shinde2207
                    </a>
                  </li>
                  <li>
                    <a
                      href={identity.contact.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="link-cyan flex items-center gap-3 text-sm"
                    >
                      <ExternalLink className="h-4 w-4 text-amber" aria-hidden="true" />
                      linkedin.com/in/gaurav-shinde-2182b51a1
                    </a>
                  </li>
                </ul>
                <p className="mt-6 border-t border-line pt-4 font-mono text-[0.68rem] leading-relaxed text-muted/70">
                  Recruiters, hiring managers, engineers — all welcome. The lab is open.
                </p>
              </div>
            </Reveal>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
