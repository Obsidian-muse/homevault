'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface RadarWarranty {
  id: string
  label: string
  status: string
  daysRemaining: number
}

const statusColor: Record<string, string> = {
  Active: 'bg-success border-success',
  'Expiring Soon': 'bg-warning border-warning',
  Expired: 'bg-destructive border-destructive',
}

// Urgency-based radius: closer to center = expiring sooner. Purely a
// presentational mapping of the daysRemaining value already computed
// on the page — no new data, no backend change.
function radiusFor(days: number, status: string) {
  if (status === 'Expired') return 8
  const clamped = Math.max(0, Math.min(days, 365))
  return 18 + (clamped / 365) * 78
}

export function WarrantyRadar({ items }: { items: RadarWarranty[] }) {
  const shown = items.slice(0, 14)
  const goldenAngle = 137.508

  return (
    <div className="relative flex h-64 items-center justify-center overflow-hidden rounded-2xl holo-panel sm:h-72">
      <div className="holo-grid pointer-events-none absolute inset-0 opacity-30" />
      {[100, 66, 33].map((r) => (
        <div
          key={r}
          className="absolute rounded-full border border-primary/15"
          style={{ width: `${r}%`, height: `${r}%` }}
        />
      ))}
      <span className="absolute inline-flex size-3 animate-radar-ping rounded-full bg-primary/40" />
      <span className="absolute inline-flex size-2 rounded-full bg-primary" />

      <div className="relative size-full">
        {shown.map((w, i) => {
          const angle = i * goldenAngle * (Math.PI / 180)
          const r = radiusFor(w.daysRemaining, w.status)
          const x = 50 + Math.cos(angle) * (r / 2)
          const y = 50 + Math.sin(angle) * (r / 2)
          return (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.03, duration: 0.3 }}
              whileHover={{ scale: 1.4 }}
              title={`${w.label} — ${w.status === 'Expired' ? 'expired' : `${w.daysRemaining}d remaining`}`}
              className={cn(
                'absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border shadow-[0_0_10px_-1px_currentColor]',
                statusColor[w.status] ?? 'bg-muted border-border',
              )}
              style={{ left: `${x}%`, top: `${y}%` }}
            />
          )
        })}
      </div>

      <div className="absolute bottom-3 left-3 flex items-center gap-3 rounded-full bg-background/60 px-3 py-1 text-[0.65rem] text-muted-foreground backdrop-blur-sm">
        <span className="flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-success" /> Active
        </span>
        <span className="flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-warning" /> Expiring
        </span>
        <span className="flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-destructive" /> Expired
        </span>
      </div>
      <div className="absolute right-3 top-3 rounded-full bg-background/60 px-2.5 py-1 text-[0.65rem] text-muted-foreground backdrop-blur-sm">
        Expiration Radar · center = most urgent
      </div>
    </div>
  )
}
