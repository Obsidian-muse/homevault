'use client'

import { motion } from 'framer-motion'
import { Boxes, Home, ShieldCheck, TrendingUp, Wallet, Wrench } from 'lucide-react'
import { Reveal } from './reveal'

const widgets = [
  { icon: Home, label: 'Homes', value: '3', tint: 'text-primary' },
  { icon: Boxes, label: 'Assets', value: '129', tint: 'text-violet' },
  { icon: ShieldCheck, label: 'Active Warranties', value: '18', tint: 'text-success' },
  { icon: Wallet, label: 'Total Value', value: '$374k', tint: 'text-primary' },
]

export function DashboardPreview() {
  return (
    <section className="relative px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium text-primary">A dashboard you will love</span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Beautiful clarity at a glance
          </h2>
        </Reveal>

        <Reveal delay={0.1} className="mt-14">
          <div className="relative rounded-3xl border border-border bg-gradient-to-b from-card to-background p-2 shadow-2xl">
            <div className="pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-b from-primary/20 to-transparent opacity-50 [mask-image:linear-gradient(black,transparent)]" />
            <div className="relative overflow-hidden rounded-[20px] border border-border bg-background">
              {/* top bar */}
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <span className="size-3 rounded-full bg-destructive/70" />
                <span className="size-3 rounded-full bg-warning/70" />
                <span className="size-3 rounded-full bg-success/70" />
                <div className="ml-4 h-6 w-52 rounded-md bg-secondary" />
              </div>

              <div className="grid gap-4 p-5 md:grid-cols-4">
                {widgets.map((w, i) => {
                  const Icon = w.icon
                  return (
                    <motion.div
                      key={w.label}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + i * 0.08 }}
                      className="rounded-xl border border-border bg-card p-4"
                    >
                      <Icon className={`size-5 ${w.tint}`} />
                      <div className="mt-3 text-2xl font-semibold tracking-tight">{w.value}</div>
                      <div className="text-xs text-muted-foreground">{w.label}</div>
                    </motion.div>
                  )
                })}
              </div>

              <div className="grid gap-4 px-5 pb-5 md:grid-cols-3">
                <div className="rounded-xl border border-border bg-card p-5 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Asset value over time</span>
                    <span className="inline-flex items-center gap-1 text-xs text-success">
                      <TrendingUp className="size-3.5" /> +12.4%
                    </span>
                  </div>
                  <div className="mt-6 flex h-28 items-end gap-2">
                    {[42, 55, 48, 66, 60, 78, 72, 88, 84, 96].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
                        className="flex-1 rounded-t bg-gradient-to-t from-primary/30 to-primary"
                      />
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <span className="inline-flex items-center gap-2 text-sm font-medium">
                    <Wrench className="size-4 text-warning" /> Upcoming
                  </span>
                  <div className="mt-4 space-y-3">
                    {['TV Service', 'Vacuum Filter', 'Descaling'].map((t, i) => (
                      <div key={t} className="flex items-center gap-3">
                        <span className="size-2 rounded-full bg-warning" />
                        <span className="text-sm text-muted-foreground">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
