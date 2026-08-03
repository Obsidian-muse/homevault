'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Sparkles, ShieldCheck, Wrench, TrendingUp, DoorOpen, FileText, Copy, Check } from 'lucide-react'
import { formatCurrency, formatDate, warrantyStatusLabel, type DashboardStats, type WarrantyDTO, type MaintenanceDTO } from '@/lib/data'

interface Props {
  name: string
  stats: DashboardStats
  expiringWarranties: (WarrantyDTO & { asset?: { name: string } })[]
  upcomingMaintenance: (MaintenanceDTO & { asset?: { name: string } })[]
  roomsNeedingReview: number
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export function AiAssistant({ name, stats, expiringWarranties, upcomingMaintenance, roomsNeedingReview }: Props) {
  const [reportOpen, setReportOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // Every bullet below is a direct read of data already fetched by the
  // dashboard (/api/dashboard) — no synthetic content, no new API calls.
  const bullets: { icon: typeof ShieldCheck; text: string }[] = [
    ...(expiringWarranties.length > 0
      ? [
          {
            icon: ShieldCheck,
            text: `${expiringWarranties.length} ${expiringWarranties.length === 1 ? 'warranty is' : 'warranties are'} expiring soon`,
          },
        ]
      : []),
    ...(upcomingMaintenance.length > 0
      ? [
          {
            icon: Wrench,
            text: `Maintenance recommended for ${upcomingMaintenance[0].asset?.name ?? 'an asset'}${upcomingMaintenance.length > 1 ? ` and ${upcomingMaintenance.length - 1} other${upcomingMaintenance.length > 2 ? 's' : ''}` : ''}`,
          },
        ]
      : []),
    { icon: TrendingUp, text: `Tracking ${formatCurrency(stats.totalValue)} in protected asset value` },
    ...(roomsNeedingReview > 0
      ? [{ icon: DoorOpen, text: `${roomsNeedingReview} room${roomsNeedingReview === 1 ? '' : 's'} with no assets logged yet` }]
      : []),
  ]

  const reportText = [
    `HomeVault Intelligence Report — ${new Date().toLocaleDateString()}`,
    '',
    `Homes: ${stats.totalHomes}  ·  Rooms: ${stats.totalRooms}  ·  Assets: ${stats.totalAssets}`,
    `Total protected value: ${formatCurrency(stats.totalValue)}`,
    `Active warranties: ${stats.activeWarranties}  ·  Upcoming maintenance: ${stats.upcomingMaintenance}`,
    '',
    'Warranties expiring soon:',
    ...(expiringWarranties.length
      ? expiringWarranties.map((w) => `  • ${w.asset?.name ?? 'Asset'} — ${w.provider}, ${warrantyStatusLabel(w.status)}, expires ${formatDate(w.expiryDate)}`)
      : ['  • None']),
    '',
    'Upcoming maintenance:',
    ...(upcomingMaintenance.length
      ? upcomingMaintenance.map((m) => `  • ${m.asset?.name ?? 'Asset'} — ${m.type}, due ${formatDate(m.nextDueDate ?? m.date)}`)
      : ['  • None scheduled']),
  ].join('\n')

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(reportText)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // clipboard access denied — non-critical, no-op
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl holo-panel p-6">
      <div className="holo-grid pointer-events-none absolute inset-0 opacity-20" />
      <div className="relative flex items-start gap-4">
        <span className="relative flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 glow-neural">
          <Sparkles className="size-5 text-primary" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">
            {greeting()}, <span className="font-medium text-foreground">{name}</span>.
          </p>
          <h3 className="text-lg font-semibold text-glow">Home Intelligence Report</h3>

          <div className="mt-3 space-y-2">
            {bullets.map((b, i) => {
              const Icon = b.icon
              return (
                <div key={i} className="flex items-center gap-2 text-sm text-foreground/90">
                  <Icon className="size-3.5 shrink-0 text-primary" />
                  {b.text}
                </div>
              )
            })}
            {bullets.length === 1 && (
              <p className="text-sm text-muted-foreground">No alerts — your home is fully monitored and on track.</p>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/dashboard/warranties"
              className="rounded-lg border border-warning/30 bg-warning/8 px-3 py-1.5 text-xs font-medium text-warning transition-colors hover:bg-warning/15"
            >
              Review Warranties
            </Link>
            <Link
              href="/dashboard/maintenance"
              className="rounded-lg border border-primary/30 bg-primary/8 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
            >
              Schedule Maintenance
            </Link>
            <button
              type="button"
              onClick={() => setReportOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg border border-violet/30 bg-violet/8 px-3 py-1.5 text-xs font-medium text-violet transition-colors hover:bg-violet/15"
            >
              <FileText className="size-3.5" />
              {reportOpen ? 'Hide Report' : 'Generate Home Report'}
            </button>
          </div>

          <AnimatePresence>
            {reportOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="relative mt-4 rounded-xl border border-border bg-background/60 p-4">
                  <button
                    type="button"
                    onClick={copyReport}
                    aria-label="Copy report"
                    className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
                  </button>
                  <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-muted-foreground">{reportText}</pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
