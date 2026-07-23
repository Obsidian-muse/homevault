'use client'

import { use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ShieldCheck, Wrench, Home as HomeIcon, DoorOpen, Hash, Tag, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { WarrantyBadge, ConditionBadge } from '@/components/dashboard/status-badge'
import { useApiGet } from '@/lib/api-client'
import { formatCurrency, formatDate, warrantyStatusLabel, type AssetDTO, type WarrantyDTO, type MaintenanceDTO } from '@/lib/data'
import { computeWarrantyStatus } from '@/lib/warranty-status'

interface AssetDetailDTO extends AssetDTO {
  home?: { id: string; name: string }
  room?: { id: string; name: string }
  warranties: WarrantyDTO[]
  maintenance: MaintenanceDTO[]
}

export default function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data, loading, error } = useApiGet<{ asset: AssetDetailDTO }>(`/api/assets/${id}`)

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
      </div>
    )
  }

  if (error || !data?.asset) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/assets" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />
          All Assets
        </Link>
        <div className="rounded-xl border border-dashed border-destructive/40 py-16 text-center text-destructive">
          {error ?? 'Asset not found.'}
        </div>
      </div>
    )
  }

  const asset = data.asset
  const assetWarranty = asset.warranties[0]
  const liveStatus = assetWarranty ? warrantyStatusLabel(computeWarrantyStatus(new Date(assetWarranty.expiryDate))) : null

  return (
    <div className="space-y-8">
      <Link
        href="/dashboard/assets"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All Assets
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <Card className="overflow-hidden p-0">
          <div className="relative aspect-[4/3] w-full bg-secondary/40">
            <Image src={asset.imageUrl || '/placeholder.svg'} alt={asset.name} fill className="object-cover" />
          </div>
        </Card>

        <div className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-wide text-muted-foreground">{asset.brand ?? 'Unbranded'}</p>
            <h1 className="mt-1 font-serif text-3xl font-medium text-foreground text-balance">{asset.name}</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <ConditionBadge condition={asset.condition} />
              {liveStatus && <WarrantyBadge status={liveStatus} />}
            </div>
          </div>

          <Card className="space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Purchase Price</span>
              <span className="font-serif text-2xl font-medium text-foreground">
                {formatCurrency(asset.purchasePrice ?? asset.currentValue)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
              <Detail icon={HomeIcon} label="Home" value={asset.home?.name ?? '—'} />
              <Detail icon={DoorOpen} label="Room" value={asset.room?.name ?? '—'} />
              <Detail icon={Tag} label="Category" value={asset.category} />
              <Detail icon={Hash} label="Serial" value={asset.serialNumber ?? '—'} />
            </div>
            <div className="border-t border-border pt-4 text-sm text-muted-foreground">
              Purchased {formatDate(asset.purchaseDate)}
            </div>
          </Card>

          <div className="flex gap-3">
            <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">Edit Asset</Button>
            <Button variant="outline" className="flex-1">
              Log Maintenance
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            <h2 className="font-serif text-lg font-medium text-foreground">Warranty</h2>
          </div>
          {assetWarranty ? (
            <div className="space-y-3 text-sm">
              <Row label="Provider" value={assetWarranty.provider} />
              <Row label="Coverage" value={assetWarranty.coverage ?? '—'} />
              <Row label="Start" value={formatDate(assetWarranty.startDate)} />
              <Row label="Expires" value={formatDate(assetWarranty.expiryDate)} />
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-muted-foreground">Status</span>
                {liveStatus && <WarrantyBadge status={liveStatus} />}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No warranty on record.</p>
          )}
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Wrench className="size-5 text-primary" />
            <h2 className="font-serif text-lg font-medium text-foreground">Maintenance History</h2>
          </div>
          {asset.maintenance.length > 0 ? (
            <div className="space-y-4">
              {asset.maintenance.map((m) => (
                <div key={m.id} className="flex gap-3">
                  <div className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{m.type}</span>
                      <span className="text-sm text-muted-foreground">{formatDate(m.date)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{m.notes}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {m.provider ?? 'Self'} · {m.cost > 0 ? formatCurrency(m.cost) : 'No cost'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No maintenance logged yet.</p>
          )}
        </Card>
      </div>
    </div>
  )
}

function Detail({ icon: Icon, label, value }: { icon: typeof HomeIcon; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 size-4 text-primary" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}
