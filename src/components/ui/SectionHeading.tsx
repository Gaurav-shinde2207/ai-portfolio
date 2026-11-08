export default function SectionHeading({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string
  title: string
  sub?: string
}) {
  return (
    <div className="mb-10 md:mb-14">
      <p className="tech-label text-amber mb-3 flex items-center gap-3">
        <span className="inline-block h-px w-8 bg-amber/60" aria-hidden="true" />
        {eyebrow}
      </p>
      <h2 className="font-display text-3xl md:text-5xl font-semibold tracking-tight text-ink">
        {title}
      </h2>
      {sub && <p className="mt-3 max-w-2xl text-muted text-sm md:text-base leading-relaxed">{sub}</p>}
    </div>
  )
}
