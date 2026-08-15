'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { useApiGet, apiPost, apiPatch } from '@/lib/api-client'
import type { AssetCondition, AssetDTO, HomeDTO, RoomDTO } from '@/lib/data'
import { ASSET_CONDITIONS } from '@/lib/validations'

export function AssetForm({
  homes,
  asset,
  defaultHomeId,
  onDone,
}: {
  homes: HomeDTO[]
  asset?: AssetDTO
  defaultHomeId?: string
  onDone: () => void
}) {
  const [homeId, setHomeId] = useState(asset?.homeId ?? defaultHomeId ?? homes[0]?.id ?? '')
  const { data: roomsData } = useApiGet<{ rooms: RoomDTO[] }>(homeId ? `/api/rooms?homeId=${homeId}` : null)
  const rooms = roomsData?.rooms ?? []

  const [roomId, setRoomId] = useState(asset?.roomId ?? '')
  const [name, setName] = useState(asset?.name ?? '')
  const [brand, setBrand] = useState(asset?.brand ?? '')
  const [category, setCategory] = useState(asset?.category ?? '')
  const [condition, setCondition] = useState<AssetCondition>(asset?.condition ?? 'Good')
  const [purchasePrice, setPurchasePrice] = useState(asset?.purchasePrice ? String(asset.purchasePrice) : '')
  const [serialNumber, setSerialNumber] = useState(asset?.serialNumber ?? '')
  const [notes, setNotes] = useState(asset?.notes ?? '')
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
      const payload = {
        homeId,
        roomId: effectiveRoomId,
        name,
        brand: brand || undefined,
        category,
        condition,
        serialNumber: serialNumber || undefined,
        purchasePrice: purchasePrice ? Number(purchasePrice) : undefined,
        notes: notes || undefined,
      }
      if (asset) {
        await apiPatch(`/api/assets/${asset.id}`, payload)
      } else {
        await apiPost('/api/assets', payload)
      }
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save asset')
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
      <Field label="Notes" placeholder="Optional notes" value={notes} onChange={setNotes} />

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting} className="bg-primary text-primary-foreground hover:bg-primary/90">
          {submitting ? 'Saving…' : asset ? 'Save changes' : 'Save Asset'}
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
