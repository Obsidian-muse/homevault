'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Plus, Wrench, CalendarClock, CheckCircle2, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { useApiGet, apiPost } from '@/lib/api-client'
import { formatCurrency, formatDate, type MaintenanceDTO, type MaintenanceType, type AssetDTO } from '@/lib/data'
import { MAINTENANCE_TYPES } from '@/lib/validations'
import { cn } from '@/lib/utils'

const typeStyles: Record<string, string> = {
  Inspection: 'border-transparent bg-chart-1/15 text-chart-1',
  Repair: 'border-transparent bg-chart-4/15 text-chart-4',
  Cleaning: 'border-transparent bg-chart-2/15 text-chart-2',
  Replacement: 'border-transparent bg-chart-3/15 text-chart-3',
  Service: 'border-transparent bg-primary/15 text-primary',
}

export default function MaintenancePage() {
  const [addOpen, setAddOpen] = useState(false)
  const { data, loading, error, refetch } = useApiGet<{ maintenance: (MaintenanceDTO & { asset?: { name: string } })[] }>(
    '/api/maintenance',
  )
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
            <h2 className="font-serif text-xl font-medium text-foreground">Upcoming</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {upcoming.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Card className="h-full border-l-2 border-l-chart-4">
                    <div className="flex items-center justify-between">
                      <Badge className={cn(typeStyles[m.type])}>{m.type}</Badge>
                      <span className="text-sm font-medium text-chart-4">{formatDate(m.nextDueDate)}</span>
                    </div>
                    <h3 className="mt-3 font-serif text-lg font-medium text-foreground">{m.asset?.name ?? 'Asset'}</h3>
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
            <h2 className="font-serif text-xl font-medium text-foreground">History</h2>
            <Card className="p-0">
              <div className="divide-y divide-border">
                {history.map((m) => (
                  <div key={m.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={cn(typeStyles[m.type])}>{m.type}</Badge>
                      <div>
                        <p className="font-medium text-foreground">{m.asset?.name ?? 'Asset'}</p>
                        <p className="text-sm text-muted-foreground">{m.notes}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 pl-1 text-sm sm:pl-0">
                      <span className="text-muted-foreground">{m.provider ?? 'Self'}</span>
                      <span className="text-muted-foreground">{formatDate(m.date)}</span>
                      <span className="w-16 text-right font-medium text-foreground">
                        {m.cost > 0 ? formatCurrency(m.cost) : '—'}
                      </span>
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
        <LogMaintenanceForm
          assets={assets}
          onDone={() => {
            setAddOpen(false)
            refetch()
          }}
        />
      </Modal>
    </div>
  )
}

function LogMaintenanceForm({ assets, onDone }: { assets: AssetDTO[]; onDone: () => void }) {
  const [assetId, setAssetId] = useState(assets[0]?.id ?? '')
  const [type, setType] = useState<MaintenanceType>('Repair')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [cost, setCost] = useState('')
  const [provider, setProvider] = useState('')
  const [notes, setNotes] = useState('')
  const [nextDueDate, setNextDueDate] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await apiPost('/api/maintenance', {
        assetId,
        type,
        date,
        cost: cost ? Number(cost) : 0,
        provider: provider || undefined,
        notes: notes || undefined,
        nextDueDate: nextDueDate || undefined,
      })
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log maintenance')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-foreground">Asset</span>
        <select
          required
          value={assetId}
          onChange={(e) => setAssetId(e.target.value)}
          className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/40"
        >
          {assets.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground">Type</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as MaintenanceType)}
            className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/40"
          >
            {MAINTENANCE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground">Cost</span>
          <input
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="0"
            className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/40"
          />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground">Date</span>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/40"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground">Next due (optional)</span>
          <input
            type="date"
            value={nextDueDate}
            onChange={(e) => setNextDueDate(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/40"
          />
        </label>
      </div>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-foreground">Provider</span>
        <input
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          placeholder="Self"
          className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/40"
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-foreground">Notes</span>
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What was done?"
          className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/40"
        />
      </label>

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting} className="bg-primary text-primary-foreground hover:bg-primary/90">
          {submitting ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
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
        <p className="font-serif text-2xl font-medium text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </Card>
  )
}
