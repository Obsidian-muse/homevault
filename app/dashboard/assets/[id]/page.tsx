'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ShieldCheck, Wrench, Home as HomeIcon, DoorOpen, Hash, Tag, Loader2, Pencil, Trash2, Plus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { WarrantyBadge, ConditionBadge } from '@/components/dashboard/status-badge'
import { AssetForm } from '@/components/dashboard/asset-form'
import { WarrantyForm } from '@/components/dashboard/warranty-form'
import { MaintenanceForm } from '@/components/dashboard/maintenance-form'
import { DeleteConfirm } from '@/components/dashboard/delete-confirm'
import { useApiGet, apiDelete } from '@/lib/api-client'
import {
  formatCurrency,
  formatDate,
  warrantyStatusLabel,
  type AssetDTO,
  type WarrantyDTO,
  type MaintenanceDTO,
  type HomeDTO,
} from '@/lib/data'
import { computeWarrantyStatus } from '@/lib/warranty-status'

interface AssetDetailDTO extends AssetDTO {
  home?: { id: string; name: string }
  room?: { id: string; name: string }
  warranties: WarrantyDTO[]
  maintenance: MaintenanceDTO[]
}

export default function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data, loading, error, refetch } = useApiGet<{ asset: AssetDetailDTO }>(`/api/assets/${id}`)
  const { data: homesData } = useApiGet<{ homes: HomeDTO[] }>('/api/homes')
  const homes = homesData?.homes ?? []

  const [editAssetOpen, setEditAssetOpen] = useState(false)
  const [deleteAssetOpen, setDeleteAssetOpen] = useState(false)
  const [warrantyModal, setWarrantyModal] = useState<'add' | 'edit' | null>(null)
  const [deleteWarrantyOpen, setDeleteWarrantyOpen] = useState(false)
  const [maintenanceModal, setMaintenanceModal] = useState<'add' | MaintenanceDTO | null>(null)
  const [deleteMaintenance, setDeleteMaintenance] = useState<MaintenanceDTO | null>(null)

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
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/assets"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          All Assets
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <Card className="overflow-hidden p-0">
          <div className="relative aspect-[4/3] w-full bg-secondary/40">
            <Image src={asset.imageUrl || '/placeholder.svg'} alt={asset.name} fill className="object-cover" />
          </div>
        </Card>

        <div className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-wide text-muted-foreground">{asset.brand ?? 'Unbranded'}</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground text-balance">{asset.name}</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <ConditionBadge condition={asset.condition} />
              {liveStatus && <WarrantyBadge status={liveStatus} />}
            </div>
          </div>

          <Card className="space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Purchase Price</span>
              <span className="text-2xl font-semibold tracking-tight text-foreground">
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
            <Button
              onClick={() => setEditAssetOpen(true)}
              className="flex-1 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Pencil className="size-3.5" />
              Edit Asset
            </Button>
            <Button variant="outline" onClick={() => setMaintenanceModal('add')} className="flex-1">
              Log Maintenance
            </Button>
            <Button
              variant="outline"
              onClick={() => setDeleteAssetOpen(true)}
              className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" />
              <h2 className="text-lg font-semibold tracking-tight text-foreground">Warranty</h2>
            </div>
            {!assetWarranty && (
              <Button variant="outline" size="sm" onClick={() => setWarrantyModal('add')} className="gap-1.5">
                <Plus className="size-3.5" />
                Add
              </Button>
            )}
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
              <div className="flex justify-end gap-2 border-t border-border pt-3">
                <Button variant="outline" size="sm" onClick={() => setWarrantyModal('edit')} className="gap-1.5">
                  <Pencil className="size-3.5" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteWarrantyOpen(true)}
                  className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                  Delete
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No warranty on record.</p>
          )}
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="size-5 text-primary" />
              <h2 className="text-lg font-semibold tracking-tight text-foreground">Maintenance History</h2>
            </div>
            <Button variant="outline" size="sm" onClick={() => setMaintenanceModal('add')} className="gap-1.5">
              <Plus className="size-3.5" />
              Add
            </Button>
          </div>
          {asset.maintenance.length > 0 ? (
            <div className="space-y-4">
              {asset.maintenance.map((m) => (
                <div key={m.id} className="group flex gap-3">
                  <div className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{m.type}</span>
                      <span className="text-sm text-muted-foreground">{formatDate(m.date)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{m.notes}</p>
                    <div className="mt-1 flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {m.provider ?? 'Self'} · {m.cost > 0 ? formatCurrency(m.cost) : 'No cost'}
                      </p>
                      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => setMaintenanceModal(m)}
                          aria-label="Edit maintenance record"
                          className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground"
                        >
                          <Pencil className="size-3" />
                        </button>
                        <button
                          onClick={() => setDeleteMaintenance(m)}
                          aria-label="Delete maintenance record"
                          className="flex size-6 items-center justify-center rounded text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No maintenance logged yet.</p>
          )}
        </Card>
      </div>

      <Modal open={editAssetOpen} onClose={() => setEditAssetOpen(false)} title="Edit asset" description="Update this asset's details.">
        <AssetForm
          homes={homes}
          asset={asset}
          onDone={() => {
            setEditAssetOpen(false)
            refetch()
          }}
        />
      </Modal>

      <Modal
        open={deleteAssetOpen}
        onClose={() => setDeleteAssetOpen(false)}
        title="Delete asset"
        description={`This permanently deletes "${asset.name}" along with its warranty and maintenance history. This cannot be undone.`}
      >
        <DeleteConfirm
          onCancel={() => setDeleteAssetOpen(false)}
          onConfirm={async () => {
            await apiDelete(`/api/assets/${asset.id}`)
            router.push('/dashboard/assets')
          }}
        />
      </Modal>

      <Modal
        open={warrantyModal !== null}
        onClose={() => setWarrantyModal(null)}
        title={warrantyModal === 'edit' ? 'Edit warranty' : 'Add a warranty'}
        description="Track coverage for this asset."
      >
        <WarrantyForm
          assetId={asset.id}
          warranty={warrantyModal === 'edit' ? assetWarranty : undefined}
          onDone={() => {
            setWarrantyModal(null)
            refetch()
          }}
        />
      </Modal>

      <Modal
        open={deleteWarrantyOpen}
        onClose={() => setDeleteWarrantyOpen(false)}
        title="Delete warranty"
        description="This permanently removes the warranty record for this asset."
      >
        <DeleteConfirm
          onCancel={() => setDeleteWarrantyOpen(false)}
          onConfirm={async () => {
            if (!assetWarranty) return
            await apiDelete(`/api/warranties/${assetWarranty.id}`)
            setDeleteWarrantyOpen(false)
            refetch()
          }}
        />
      </Modal>

      <Modal
        open={maintenanceModal !== null}
        onClose={() => setMaintenanceModal(null)}
        title={maintenanceModal && maintenanceModal !== 'add' ? 'Edit maintenance record' : 'Log maintenance'}
        description="Record a service or schedule upcoming upkeep."
      >
        <MaintenanceForm
          assetId={asset.id}
          record={maintenanceModal && maintenanceModal !== 'add' ? maintenanceModal : undefined}
          onDone={() => {
            setMaintenanceModal(null)
            refetch()
          }}
        />
      </Modal>

      <Modal
        open={!!deleteMaintenance}
        onClose={() => setDeleteMaintenance(null)}
        title="Delete maintenance record"
        description="This permanently removes this entry from the maintenance history."
      >
        <DeleteConfirm
          onCancel={() => setDeleteMaintenance(null)}
          onConfirm={async () => {
            if (!deleteMaintenance) return
            await apiDelete(`/api/maintenance/${deleteMaintenance.id}`)
            setDeleteMaintenance(null)
            refetch()
          }}
        />
      </Modal>
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
