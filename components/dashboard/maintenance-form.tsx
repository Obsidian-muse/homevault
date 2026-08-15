'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { apiPost, apiPatch } from '@/lib/api-client'
import type { AssetDTO, MaintenanceDTO, MaintenanceType } from '@/lib/data'
import { MAINTENANCE_TYPES } from '@/lib/validations'

export function MaintenanceForm({
  assets,
  assetId,
  record,
  onDone,
}: {
  assets?: AssetDTO[]
  assetId?: string
  record?: MaintenanceDTO
  onDone: () => void
}) {
  const [selectedAssetId, setSelectedAssetId] = useState(record?.assetId ?? assetId ?? assets?.[0]?.id ?? '')
  const [type, setType] = useState<MaintenanceType>(record?.type ?? 'Repair')
  const [date, setDate] = useState(record?.date ? record.date.slice(0, 10) : new Date().toISOString().slice(0, 10))
  const [cost, setCost] = useState(record?.cost ? String(record.cost) : '')
  const [provider, setProvider] = useState(record?.provider ?? '')
  const [notes, setNotes] = useState(record?.notes ?? '')
  const [nextDueDate, setNextDueDate] = useState(record?.nextDueDate ? record.nextDueDate.slice(0, 10) : '')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const payload = {
        assetId: selectedAssetId,
        type,
        date,
        cost: cost ? Number(cost) : 0,
        provider: provider || undefined,
        notes: notes || undefined,
        nextDueDate: nextDueDate || undefined,
      }
      if (record) {
        await apiPatch(`/api/maintenance/${record.id}`, payload)
      } else {
        await apiPost('/api/maintenance', payload)
      }
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save maintenance record')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {assets && (
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground">Asset</span>
          <select
            required
            value={selectedAssetId}
            onChange={(e) => setSelectedAssetId(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/40"
          >
            {assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
      )}
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
          {submitting ? 'Saving…' : record ? 'Save changes' : 'Save'}
        </Button>
      </div>
    </form>
  )
}
