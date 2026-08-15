'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Wrench, CalendarClock, CheckCircle2, Loader2, Pencil, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { MaintenanceForm } from '@/components/dashboard/maintenance-form'
import { DeleteConfirm } from '@/components/dashboard/delete-confirm'
import { useApiGet, apiDelete } from '@/lib/api-client'
import { formatCurrency, formatDate, type MaintenanceDTO, type AssetDTO } from '@/lib/data'
import { cn } from '@/lib/utils'

const typeStyles: Record<string, string> = {
  Inspection: 'border-transparent bg-chart-1/15 text-chart-1',
  Repair: 'border-transparent bg-chart-4/15 text-chart-4',
  Cleaning: 'border-transparent bg-chart-2/15 text-chart-2',
  Replacement: 'border-transparent bg-chart-3/15 text-chart-3',
  Service: 'border-transparent bg-primary/15 text-primary',
}

type MaintenanceRow = MaintenanceDTO & { asset?: { name: string } }

export default function MaintenancePage() {
  const [addOpen, setAddOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<MaintenanceRow | null>(null)
  const [deleteRecord, setDeleteRecord] = useState<MaintenanceRow | null>(null)
  const { data, loading, error, refetch } = useApiGet<{ maintenance: MaintenanceRow[] }>('/api/maintenance')
  const { data: assetsData } = useApiGet<{ assets: AssetDTO[] }>('/api/assets')
  const assets = assetsData?.assets ?? []

  const records = data?.maintenance ?? []
  const now = useMemo(() => new Date(), [])
  const upcoming = records.filter((m) => m.nextDueDate && new Date(m.nextDueDate) >= now)
  const history = records.filter((m) => !m.nextDueDate || new Date(m.nextDueDate) < now)
  const totalSpent = history.reduce((sum, m) => sum + m.cost, 0)

  return (
    <div className="space-y-8">
      <PageHeader
        title="Maintenance"
        description="Schedule upkeep and keep a full service history for every asset."
        actions={
          <Button
            onClick={() => setAddOpen(true)}
            disabled={assets.length === 0}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="size-4" />
            Log Maintenance
          </Button>
        }
      />

      <div className="grid gap-5 sm:grid-cols-3">
        <StatBlock icon={CalendarClock} label="Upcoming" value={String(upcoming.length)} accent="text-chart-4" />
        <StatBlock icon={CheckCircle2} label="Completed" value={String(history.length)} accent="text-chart-2" />
        <StatBlock icon={Wrench} label="Total Spent" value={formatCurrency(totalSpent)} accent="text-primary" />
      </div>

      {loading && (
        <div className="flex h-40 items-center justify-center text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      )}

      {error && !loading && (
        <div className="rounded-xl border border-dashed border-destructive/40 py-16 text-center text-destructive">{error}</div>
      )}

      {!loading && !error && (
        <>
          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Upcoming</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {upcoming.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Card className="group relative h-full border-l-2 border-l-chart-4">
                    <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => setEditRecord(m)}
                        aria-label="Edit maintenance record"
                        className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteRecord(m)}
                        aria-label="Delete maintenance record"
                        className="flex size-7 items-center justify-center rounded-md text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between pr-14">
                      <Badge className={cn(typeStyles[m.type])}>{m.type}</Badge>
                      <span className="text-sm font-medium text-chart-4">{formatDate(m.nextDueDate)}</span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold tracking-tight text-foreground">{m.asset?.name ?? 'Asset'}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{m.notes}</p>
                    <p className="mt-3 text-xs text-muted-foreground">{m.provider ?? 'Self'}</p>
                  </Card>
                </motion.div>
              ))}

              {upcoming.length === 0 && (
                <div className="col-span-full rounded-xl border border-dashed border-border py-10 text-center text-muted-foreground">
                  Nothing scheduled.
                </div>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">History</h2>
            <Card className="p-0">
              <div className="divide-y divide-border">
                {history.map((m) => (
                  <div
                    key={m.id}
                    className="group flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Badge className={cn(typeStyles[m.type])}>{m.type}</Badge>
                      <div>
                        <p className="font-medium text-foreground">{m.asset?.name ?? 'Asset'}</p>
                        <p className="text-sm text-muted-foreground">{m.notes}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 pl-1 text-sm sm:pl-0">
                      <span className="text-muted-foreground">{m.provider ?? 'Self'}</span>
                      <span className="text-muted-foreground">{formatDate(m.date)}</span>
                      <span className="w-16 text-right font-medium text-foreground">
                        {m.cost > 0 ? formatCurrency(m.cost) : '—'}
                      </span>
                      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => setEditRecord(m)}
                          aria-label="Edit maintenance record"
                          className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteRecord(m)}
                          aria-label="Delete maintenance record"
                          className="flex size-8 items-center justify-center rounded-md text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {history.length === 0 && (
                  <div className="px-5 py-10 text-center text-muted-foreground">No maintenance history yet.</div>
                )}
              </div>
            </Card>
          </section>
        </>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Log maintenance" description="Record a service or schedule upcoming upkeep.">
        <MaintenanceForm
          assets={assets}
          onDone={() => {
            setAddOpen(false)
            refetch()
          }}
        />
      </Modal>

      <Modal
        open={!!editRecord}
        onClose={() => setEditRecord(null)}
        title="Edit maintenance record"
        description="Update this service entry."
      >
        {editRecord && (
          <MaintenanceForm
            assets={assets}
            record={editRecord}
            onDone={() => {
              setEditRecord(null)
              refetch()
            }}
          />
        )}
      </Modal>

      <Modal
        open={!!deleteRecord}
        onClose={() => setDeleteRecord(null)}
        title="Delete maintenance record"
        description="This permanently removes this entry from the maintenance history."
      >
        <DeleteConfirm
          onCancel={() => setDeleteRecord(null)}
          onConfirm={async () => {
            if (!deleteRecord) return
            await apiDelete(`/api/maintenance/${deleteRecord.id}`)
            setDeleteRecord(null)
            refetch()
          }}
        />
      </Modal>
    </div>
  )
}

function StatBlock({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Wrench
  label: string
  value: string
  accent: string
}) {
  return (
    <Card className="flex items-center gap-4">
      <span className={cn('flex size-11 items-center justify-center rounded-xl bg-secondary', accent)}>
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </Card>
  )
}
