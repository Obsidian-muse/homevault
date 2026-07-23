import { Boxes, ShieldCheck, Wrench, Home, Receipt, Bell } from 'lucide-react'
import { Reveal } from './reveal'

const features = [
  {
    icon: Home,
    title: 'Multi-Home Management',
    desc: 'Organize every property, room, and space with a beautiful, structured hierarchy.',
  },
  {
    icon: Boxes,
    title: 'Asset Inventory',
    desc: 'Catalog appliances, electronics, and furniture with photos, values, and serial numbers.',
  },
  {
    icon: ShieldCheck,
    title: 'Warranty Tracking',
    desc: 'Never miss an expiration. Get clear status indicators for every warranty you own.',
  },
  {
    icon: Wrench,
    title: 'Maintenance Records',
    desc: 'Log repairs, schedule upkeep, and keep a full service history for every item.',
  },
  {
    icon: Receipt,
    title: 'Receipts & Docs',
    desc: 'Store purchase information and important documents securely alongside each asset.',
  },
  {
    icon: Bell,
    title: 'Smart Reminders',
    desc: 'Stay ahead with intelligent alerts for maintenance and expiring coverage.',
  },
]

export function Features() {
  return (
    <section id="features" className="relative px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium text-primary">Everything in one place</span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            A complete system for your home
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground leading-relaxed">
            HomeVault brings clarity to your most valuable possessions with powerful tools designed for the
            way homeowners actually live.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <Reveal key={f.title} delay={i * 0.06}>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/40 hover:-translate-y-1">
                  <div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
                  <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-violet/20 text-primary ring-1 ring-inset ring-border">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-5 text-base font-semibold tracking-tight">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
