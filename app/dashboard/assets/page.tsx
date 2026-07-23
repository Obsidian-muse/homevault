'use client'

import { useMemo, useState, type FormEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Plus, Search, LayoutGrid, List, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { WarrantyBadge, ConditionBadge } from '@/components/dashboard/status-badge'
import { useApiGet, apiPost } from '@/lib/api-client'
import { formatCurrency, warrantyStatusLabel, type AssetDTO, type AssetCondition, type HomeDTO, type RoomDTO } from '@/lib/data'
import { ASSET_CONDITIONS } from '@/lib/validations'
import { computeWarrantyStatus } from '@/lib/warranty-status'
import { cn } from '@/lib/utils'

export default function AssetsPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [addOpen, setAddOpen] = useState(false)

  const { data, loading, error, refetch } = useApiGet<{ assets: AssetDTO[] }>('/api/assets')
  const { data: homesData } = useApiGet<{ homes: HomeDTO[] }>('/api/homes')

  const assets = data?.assets ?? []
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
                <Link href={`/dashboard/assets/${asset.id}`}>
                  <Card className="group h-full overflow-hidden p-0 transition-colors hover:border-primary/40">
                    <div className="relative h-40 w-full overflow-hidden bg-secondary/40">
                      <Image
                        src={asset.imageUrl || '/placeholder.svg'}
                        alt={asset.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {status && (
                        <div className="absolute right-3 top-3">
                          <WarrantyBadge status={status} />
                        </div>
                      )}
                    </div>
                    <div className="space-y-3 p-5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">{asset.brand ?? 'Unbranded'}</p>
                          <h3 className="font-serif text-lg font-medium text-foreground">{asset.name}</h3>
                        </div>
                        <ConditionBadge condition={asset.condition} />
                      </div>
                      <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
                        <span className="text-muted-foreground">{asset.room?.name ?? '—'}</span>
                        <span className="font-medium text-foreground">{formatCurrency(asset.purchasePrice ?? asset.currentValue)}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
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
                <Link
                  key={asset.id}
                  href={`/dashboard/assets/${asset.id}`}
                  className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-secondary/40"
                >
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
        <AddAssetForm
          homes={homes}
          onDone={() => {
            setAddOpen(false)
            refetch()
          }}
        />
      </Modal>
    </div>
  )
}

function AddAssetForm({ homes, onDone }: { homes: HomeDTO[]; onDone: () => void }) {
  const [homeId, setHomeId] = useState(homes[0]?.id ?? '')
  const { data: roomsData } = useApiGet<{ rooms: RoomDTO[] }>(homeId ? `/api/rooms?homeId=${homeId}` : null)
  const rooms = roomsData?.rooms ?? []

  const [roomId, setRoomId] = useState('')
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [category, setCategory] = useState('')
  const [condition, setCondition] = useState<AssetCondition>('Good')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [serialNumber, setSerialNumber] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const effectiveRoomId = roomId || rooms[0]?.id || ''

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!homeId || !effectiveRoomId) {
      setError('Add a room to this home first.')
      return
    }
    setSubmitting(true)
    try {
      await apiPost('/api/assets', {
        homeId,
        roomId: effectiveRoomId,
        name,
        brand: brand || undefined,
        category,
        condition,
        serialNumber: serialNumber || undefined,
        purchasePrice: purchasePrice ? Number(purchasePrice) : undefined,
      })
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add asset')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground">Home</span>
          <select
            value={homeId}
            onChange={(e) => {
              setHomeId(e.target.value)
              setRoomId('')
            }}
            className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/40"
          >
            {homes.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground">Room</span>
          <select
            value={effectiveRoomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/40"
          >
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Asset name" placeholder="Smart Refrigerator" value={name} onChange={setName} required />
        <Field label="Brand" placeholder="Samsung" value={brand} onChange={setBrand} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Category" placeholder="Appliance" value={category} onChange={setCategory} required />
        <Field label="Purchase price" placeholder="0" value={purchasePrice} onChange={setPurchasePrice} type="number" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground">Condition</span>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value as AssetCondition)}
            className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/40"
          >
            {ASSET_CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <Field label="Serial number" placeholder="SN-000000" value={serialNumber} onChange={setSerialNumber} />
      </div>

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting} className="bg-primary text-primary-foreground hover:bg-primary/90">
          {submitting ? 'Saving…' : 'Save Asset'}
        </Button>
      </div>
    </form>
  )
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  required,
  type = 'text',
}: {
  label: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  required?: boolean
  type?: string
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-primary/60 focus:ring-2 focus:ring-ring/40"
      />
    </label>
  )
}
