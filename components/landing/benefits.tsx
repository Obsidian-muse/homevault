import { Check } from 'lucide-react'
import { Reveal } from './reveal'

const benefits = [
  'Know exactly what you own and what it is worth',
  'Protect thousands in warranties from silently expiring',
  'Speed up insurance claims with organized records',
  'Plan maintenance before small issues become expensive',
  'Hand off a complete home manual when you sell or rent',
  'Access everything securely from any device',
]

export function Benefits() {
  return (
    <section id="benefits" className="relative px-4 py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <span className="text-sm font-medium text-violet">Why HomeVault</span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Peace of mind for everything you own
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            Your home holds tens of thousands of dollars in assets. HomeVault gives you a single,
            trustworthy source of truth so nothing falls through the cracks.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {benefits.map((b, i) => (
              <Reveal key={b} delay={i * 0.05}>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                    <Check className="size-3.5" />
                  </span>
                  <span className="text-sm leading-relaxed text-muted-foreground">{b}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="relative grid grid-cols-2 gap-4">
            {[
              { value: '$374k', label: 'Assets protected', tint: 'from-primary/20' },
              { value: '18', label: 'Warranties active', tint: 'from-violet/20' },
              { value: '96%', label: 'Coverage tracked', tint: 'from-success/20' },
              { value: '0', label: 'Missed renewals', tint: 'from-primary/20' },
            ].map((c, i) => (
              <div
                key={c.label}
                className={`relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b ${c.tint} to-card p-6 ${
                  i % 3 === 0 ? 'mt-6' : ''
                }`}
              >
                <div className="text-3xl font-semibold tracking-tight">{c.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{c.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
