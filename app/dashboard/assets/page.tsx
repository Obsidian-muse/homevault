'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Plus, Search, LayoutGrid, List, Loader2, Pencil, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { WarrantyBadge, ConditionBadge } from '@/components/dashboard/status-badge'
import { AssetForm } from '@/components/dashboard/asset-form'
import { DeleteConfirm } from '@/components/dashboard/delete-confirm'
import { useApiGet, apiDelete } from '@/lib/api-client'
import { formatCurrency, warrantyStatusLabel, type AssetDTO, type HomeDTO } from '@/lib/data'
import { computeWarrantyStatus } from '@/lib/warranty-status'
import { cn } from '@/lib/utils'

export default function AssetsPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [addOpen, setAddOpen] = useState(false)
  const [editAsset, setEditAsset] = useState<AssetDTO | null>(null)
  const [deleteAsset, setDeleteAsset] = useState<AssetDTO | null>(null)

  const { data, loading, error, refetch } = useApiGet<{ assets: AssetDTO[] }>('/api/assets')
  const { data: homesData } = useApiGet<{ homes: HomeDTO[] }>('/api/homes')

  const assets = useMemo(() => data?.assets ?? [], [data])
  const homes = homesData?.homes ?? []
  const categories = useMemo(() => ['All', ...Array.from(new Set(assets.map((a) => a.category)))], [assets])

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      const matchesCategory = category === 'All' || a.category === category
      const q = query.toLowerCase()
      const matchesQuery = a.name.toLowerCase().includes(q) || (a.brand ?? '').toLowerCase().includes(q)
      return matchesCategory && matchesQuery
    })
  }, [assets, query, category])

  function assetWarrantyStatus(asset: AssetDTO) {
    const warranty = asset.warranties?.[0]
    if (!warranty) return null
    return warrantyStatusLabel(computeWarrantyStatus(new Date(warranty.expiryDate)))
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Assets"
        description="Your complete catalog of tracked belongings."
        actions={
          <Button
            onClick={() => setAddOpen(true)}
            disabled={homes.length === 0}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="size-4" />
            Add Asset
          </Button>
        }
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search assets or brands…"
            className="h-10 w-full rounded-lg border border-border bg-input pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-primary/60 focus:ring-2 focus:ring-ring/40"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  'rounded-full border px-3.5 py-1.5 text-sm transition-colors',
                  category === c ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground',
                )}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex rounded-lg border border-border p-0.5">
            <button
              onClick={() => setView('grid')}
              className={cn('rounded-md p-1.5', view === 'grid' ? 'bg-secondary text-foreground' : 'text-muted-foreground')}
              aria-label="Grid view"
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn('rounded-md p-1.5', view === 'list' ? 'bg-secondary text-foreground' : 'text-muted-foreground')}
              aria-label="List view"
            >
              <List className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex h-40 items-center justify-center text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      )}

      {error && !loading && (
        <div className="rounded-xl border border-dashed border-destructive/40 py-16 text-center text-destructive">{error}</div>
      )}

      {!loading && !error && view === 'grid' && (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((asset, i) => {
            const status = assetWarrantyStatus(asset)
            return (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              >
                <Card className="group relative h-full overflow-hidden p-0 transition-colors hover:border-primary/40">
                  <div className="absolute right-3 top-3 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        setEditAsset(asset)
                      }}
                      aria-label="Edit asset"
                      className="flex size-7 items-center justify-center rounded-md bg-background/80 text-muted-foreground backdrop-blur hover:text-foreground"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        setDeleteAsset(asset)
                      }}
                      aria-label="Delete asset"
                      className="flex size-7 items-center justify-center rounded-md bg-background/80 text-destructive backdrop-blur hover:bg-destructive/10"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                  <Link href={`/dashboard/assets/${asset.id}`}>
                    <div className="relative h-40 w-full overflow-hidden bg-secondary/40">
                      <Image
                        src={asset.imageUrl || '/placeholder.svg'}
                        alt={asset.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {status && (
                        <div className="absolute right-3 top-3 group-hover:opacity-0">
                          <WarrantyBadge status={status} />
                        </div>
                      )}
                    </div>
                    <div className="space-y-3 p-5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">{asset.brand ?? 'Unbranded'}</p>
                          <h3 className="text-lg font-semibold tracking-tight text-foreground">{asset.name}</h3>
                        </div>
                        <ConditionBadge condition={asset.condition} />
                      </div>
                      <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
                        <span className="text-muted-foreground">{asset.room?.name ?? '—'}</span>
                        <span className="font-medium text-foreground">{formatCurrency(asset.purchasePrice ?? asset.currentValue)}</span>
                      </div>
                    </div>
                  </Link>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {!loading && !error && view === 'list' && (
        <Card className="overflow-hidden p-0">
          <div className="divide-y divide-border">
            {filtered.map((asset) => {
              const status = assetWarrantyStatus(asset)
              return (
                <div key={asset.id} className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-secondary/40">
                  <Link href={`/dashboard/assets/${asset.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-secondary/40">
                      <Image src={asset.imageUrl || '/placeholder.svg'} alt={asset.name} fill className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">{asset.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {asset.brand ?? 'Unbranded'} · {asset.room?.name ?? '—'}
                      </p>
                    </div>
                    <div className="hidden sm:block">
                      <ConditionBadge condition={asset.condition} />
                    </div>
                    <div className="hidden md:block">{status && <WarrantyBadge status={status} />}</div>
                    <span className="w-24 text-right font-medium text-foreground">
                      {formatCurrency(asset.purchasePrice ?? asset.currentValue)}
                    </span>
                  </Link>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => setEditAsset(asset)}
                      aria-label="Edit asset"
                      className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteAsset(asset)}
                      aria-label="Delete asset"
                      className="flex size-8 items-center justify-center rounded-md text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
          No assets match your search.
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add an asset" description="Catalog a new belonging with its details.">
        <AssetForm
          homes={homes}
          onDone={() => {
            setAddOpen(false)
            refetch()
          }}
        />
      </Modal>

      <Modal open={!!editAsset} onClose={() => setEditAsset(null)} title="Edit asset" description="Update this asset's details.">
        {editAsset && (
          <AssetForm
            homes={homes}
            asset={editAsset}
            onDone={() => {
              setEditAsset(null)
              refetch()
            }}
          />
        )}
      </Modal>

      <Modal
        open={!!deleteAsset}
        onClose={() => setDeleteAsset(null)}
        title="Delete asset"
        description={`This permanently deletes "${deleteAsset?.name}" along with its warranty and maintenance history. This cannot be undone.`}
      >
        <DeleteConfirm
          onCancel={() => setDeleteAsset(null)}
          onConfirm={async () => {
            if (!deleteAsset) return
            await apiDelete(`/api/assets/${deleteAsset.id}`)
            setDeleteAsset(null)
            refetch()
          }}
        />
      </Modal>
    </div>
  )
}
