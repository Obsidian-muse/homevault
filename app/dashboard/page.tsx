'use client'

import { motion } from 'framer-motion'
import { Boxes, DoorOpen, Home as HomeIcon, ShieldCheck, Wallet, Wrench, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { PageHeader } from '@/components/dashboard/page-header'
import { StatCard, type Stat } from '@/components/dashboard/stat-card'
import { Badge } from '@/components/ui/badge'
import { useApiGet } from '@/lib/api-client'
import { formatCurrency, formatDate, warrantyStatusLabel, type DashboardStats, type WarrantyDTO, type MaintenanceDTO, type AssetDTO } from '@/lib/data'

interface DashboardResponse {
  stats: DashboardStats
  expiringWarranties: (WarrantyDTO & { asset?: { name: string } })[]
  upcomingMaintenance: (MaintenanceDTO & { asset?: { name: string } })[]
  recentAssets: (AssetDTO & { room?: { name: string }; home?: { name: string } })[]
}

const chartData = [
  { m: 'Jan', v: 42 },
  { m: 'Feb', v: 55 },
  { m: 'Mar', v: 48 },
  { m: 'Apr', v: 66 },
  { m: 'May', v: 61 },
  { m: 'Jun', v: 78 },
  { m: 'Jul', v: 72 },
  { m: 'Aug', v: 88 },
  { m: 'Sep', v: 84 },
  { m: 'Oct', v: 96 },
]

const statusVariant = { Active: 'success', 'Expiring Soon': 'warning', Expired: 'destructive' } as const

export default function DashboardPage() {
  const { data: session } = useSession()
  const { data, loading, error } = useApiGet<DashboardResponse>('/api/dashboard')

  const firstName = session?.user?.name?.split(' ')[0] ?? 'there'

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
        {error ?? 'Unable to load your dashboard.'}
      </div>
    )
  }

  const { stats } = data
  const statCards: Stat[] = [
    { label: 'Total Homes', value: String(stats.totalHomes), icon: HomeIcon, trend: 0, tint: 'primary' },
    { label: 'Total Rooms', value: String(stats.totalRooms), icon: DoorOpen, trend: 8, tint: 'violet' },
    { label: 'Total Assets', value: String(stats.totalAssets), icon: Boxes, trend: 12, tint: 'primary' },
    { label: 'Active Warranties', value: String(stats.activeWarranties), icon: ShieldCheck, trend: 5, tint: 'success' },
    { label: 'Upcoming Maintenance', value: String(stats.upcomingMaintenance), icon: Wrench, trend: -3, tint: 'warning' },
    { label: 'Total Asset Value', value: formatCurrency(stats.totalValue), icon: Wallet, trend: 12, tint: 'primary' },
  ]

  return (
    <div>
      <PageHeader title="Dashboard" description={`Welcome back, ${firstName}. Here is what is happening across your homes.`} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((s, i) => (
          <StatCard key={s.label} stat={s} index={i} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border bg-card p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold">Asset value growth</h3>
              <p className="text-sm text-muted-foreground">Estimated inventory value over 10 months</p>
            </div>
            <Badge variant="success">+12.4%</Badge>
          </div>
          <div className="mt-8 flex h-48 items-end gap-2">
            {chartData.map((d, i) => (
              <div key={d.m} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${d.v}%` }}
                    transition={{ delay: 0.3 + i * 0.05, duration: 0.6, ease: 'easeOut' }}
                    className="w-full rounded-t-md bg-gradient-to-t from-primary/25 to-primary transition-colors hover:from-violet/30 hover:to-violet"
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">{d.m}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Warranties expiring */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border bg-card p-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Warranties</h3>
            <Link href="/dashboard/warranties" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {data.expiringWarranties.length === 0 && (
              <p className="text-sm text-muted-foreground">Nothing expiring soon.</p>
            )}
            {data.expiringWarranties.slice(0, 5).map((w) => (
              <div key={w.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{w.asset?.name ?? 'Asset'}</p>
                  <p className="text-xs text-muted-foreground">{w.provider}</p>
                </div>
                <Badge variant={statusVariant[warrantyStatusLabel(w.status)]}>{warrantyStatusLabel(w.status)}</Badge>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* Upcoming maintenance */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl border border-border bg-card p-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Upcoming maintenance</h3>
            <Link href="/dashboard/maintenance" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {data.upcomingMaintenance.length === 0 && (
              <p className="text-sm text-muted-foreground">Nothing scheduled in the next 30 days.</p>
            )}
            {data.upcomingMaintenance.map((m) => (
              <div key={m.id} className="flex items-center gap-3 rounded-xl border border-border bg-background/40 p-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-warning/12 text-warning">
                  <Wrench className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{m.asset?.name ?? 'Asset'}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.type} · {formatDate(m.nextDueDate ?? m.date)}
                  </p>
                </div>
                <span className="text-sm font-medium">{m.cost ? formatCurrency(m.cost) : 'Free'}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent assets */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-border bg-card p-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Recently added assets</h3>
            <Link href="/dashboard/assets" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {data.recentAssets.length === 0 && (
              <p className="text-sm text-muted-foreground">No assets yet — add your first one.</p>
            )}
            {data.recentAssets.map((a) => (
              <div key={a.id} className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Boxes className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{a.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.brand ?? 'Unbranded'} · {a.room?.name ?? 'Unassigned'}
                  </p>
                </div>
                <span className="text-sm font-medium">{formatCurrency(a.purchasePrice ?? a.currentValue)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
