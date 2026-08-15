import { Star } from 'lucide-react'
import { Reveal } from './reveal'

const testimonials = [
  {
    quote:
      'HomeVault saved me during an insurance claim. Every receipt and serial number was right there in seconds.',
    name: 'Marcus Reyes',
    role: 'Homeowner, Austin',
    initials: 'MR',
  },
  {
    quote:
      'The warranty reminders alone have paid for themselves. I finally feel in control of my home.',
    name: 'Priya Nair',
    role: 'Property Manager',
    initials: 'PN',
  },
  {
    quote:
      'It looks and feels like a premium product. Managing three properties has never been this effortless.',
    name: 'Daniel Okafor',
    role: 'Real Estate Investor',
    initials: 'DO',
  },
]

export function Testimonials() {
  return (
    <section className="relative px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium text-primary">Loved by homeowners</span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Trusted to protect what matters
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <figure className="flex h-full flex-col rounded-2xl border border-border bg-card p-6">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="size-4 fill-warning text-warning" />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground/90">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-violet text-xs font-semibold text-primary-foreground">
                    {t.initials}
                  </span>
                  <span>
                    <span className="block text-sm font-medium">{t.name}</span>
                    <span className="block text-xs text-muted-foreground">{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
