'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Clock, ShieldAlert, Loader2, Plus, Pencil, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { WarrantyBadge } from '@/components/dashboard/status-badge'
import { WarrantyForm } from '@/components/dashboard/warranty-form'
import { DeleteConfirm } from '@/components/dashboard/delete-confirm'
import { useApiGet, apiDelete } from '@/lib/api-client'
import { formatDate, warrantyStatusLabel, type WarrantyDTO, type AssetDTO } from '@/lib/data'
import { computeWarrantyStatus, daysRemaining } from '@/lib/warranty-status'
import { cn } from '@/lib/utils'

const tabs = ['All', 'Active', 'Expiring Soon', 'Expired']

type WarrantyRow = Omit<WarrantyDTO, 'status'> & { asset?: { name: string } }
type DisplayWarranty = WarrantyRow & { status: string; daysRemaining: number }

export default function WarrantiesPage() {
  const [tab, setTab] = useState('All')
  const [addOpen, setAddOpen] = useState(false)
  const [editWarranty, setEditWarranty] = useState<DisplayWarranty | null>(null)
  const [deleteWarranty, setDeleteWarranty] = useState<DisplayWarranty | null>(null)
  const { data, loading, error, refetch } = useApiGet<{ warranties: WarrantyRow[] }>('/api/warranties')
  const { data: assetsData } = useApiGet<{ assets: AssetDTO[] }>('/api/assets')
  const assets = assetsData?.assets ?? []

  const warranties: DisplayWarranty[] = useMemo(() => {
    return (data?.warranties ?? []).map((w) => {
      const status = warrantyStatusLabel(computeWarrantyStatus(new Date(w.expiryDate)))
      return { ...w, status, daysRemaining: daysRemaining(new Date(w.expiryDate)) }
    })
  }, [data])

  const active = warranties.filter((w) => w.status === 'Active').length
  const expiring = warranties.filter((w) => w.status === 'Expiring Soon').length
  const expired = warranties.filter((w) => w.status === 'Expired').length

  const filtered = tab === 'All' ? warranties : warranties.filter((w) => w.status === tab)

  return (
    <div className="space-y-8">
      <PageHeader
        title="Warranties"
        description="Track coverage across all your assets and never miss an expiry."
        actions={
          <Button
            onClick={() => setAddOpen(true)}
            disabled={assets.length === 0}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="size-4" />
            Add Warranty
          </Button>
        }
      />

      <div className="grid gap-5 sm:grid-cols-3">
        <SummaryCard icon={ShieldCheck} label="Active" value={active} accent="text-chart-2" />
        <SummaryCard icon={Clock} label="Expiring Soon" value={expiring} accent="text-chart-4" />
        <SummaryCard icon={ShieldAlert} label="Expired" value={expired} accent="text-destructive" />
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm transition-colors',
              tab === t ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground',
            )}
          >
            {t}
          </button>
        ))}
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
        <div className="space-y-4">
          {filtered.map((w, i) => {
            const pct = w.status === 'Expired' ? 0 : Math.max(6, Math.min(100, Math.round((w.daysRemaining / 1200) * 100)))
            return (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Card className="group flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold tracking-tight text-foreground">{w.asset?.name ?? 'Asset'}</h3>
                      <WarrantyBadge status={w.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {w.provider} · {w.coverage ?? '—'}
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-1.5 w-40 overflow-hidden rounded-full bg-secondary">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            w.status === 'Expired' ? 'bg-destructive' : w.status === 'Expiring Soon' ? 'bg-chart-4' : 'bg-chart-2',
                          )}
                          style={{ width: `${pct || 4}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {w.status === 'Expired' ? 'Coverage ended' : `${w.daysRemaining} days remaining`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <p className="text-muted-foreground">Expires</p>
                      <p className="font-medium text-foreground">{formatDate(w.expiryDate)}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => setEditWarranty(w)}
                        aria-label="Edit warranty"
                        className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteWarranty(w)}
                        aria-label="Delete warranty"
                        className="flex size-8 items-center justify-center rounded-md text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}

          {filtered.length === 0 && (
            <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
              No warranties in this category.
            </div>
          )}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add a warranty" description="Track coverage for one of your assets.">
        <WarrantyForm
          assets={assets}
          onDone={() => {
            setAddOpen(false)
            refetch()
          }}
        />
      </Modal>

      <Modal open={!!editWarranty} onClose={() => setEditWarranty(null)} title="Edit warranty" description="Update this coverage's details.">
        {editWarranty && (
          <WarrantyForm
            warranty={editWarranty}
            onDone={() => {
              setEditWarranty(null)
              refetch()
            }}
          />
        )}
      </Modal>

      <Modal
        open={!!deleteWarranty}
        onClose={() => setDeleteWarranty(null)}
        title="Delete warranty"
        description={`This permanently removes the warranty for "${deleteWarranty?.asset?.name ?? 'this asset'}".`}
      >
        <DeleteConfirm
          onCancel={() => setDeleteWarranty(null)}
          onConfirm={async () => {
            if (!deleteWarranty) return
            await apiDelete(`/api/warranties/${deleteWarranty.id}`)
            setDeleteWarranty(null)
            refetch()
          }}
        />
      </Modal>
    </div>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof ShieldCheck
  label: string
  value: number
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
