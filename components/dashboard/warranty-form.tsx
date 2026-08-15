'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { apiPost, apiPatch } from '@/lib/api-client'
import type { AssetDTO } from '@/lib/data'

interface EditableWarranty {
  id: string
  assetId: string
  provider: string
  policyNumber: string | null
  coverage: string | null
  startDate: string
  expiryDate: string
}

export function WarrantyForm({
  assets,
  assetId,
  warranty,
  onDone,
}: {
  assets?: AssetDTO[]
  assetId?: string
  warranty?: EditableWarranty
  onDone: () => void
}) {
  const [selectedAssetId, setSelectedAssetId] = useState(warranty?.assetId ?? assetId ?? assets?.[0]?.id ?? '')
  const [provider, setProvider] = useState(warranty?.provider ?? '')
  const [coverage, setCoverage] = useState(warranty?.coverage ?? '')
  const [policyNumber, setPolicyNumber] = useState(warranty?.policyNumber ?? '')
  const [startDate, setStartDate] = useState(warranty?.startDate ? warranty.startDate.slice(0, 10) : new Date().toISOString().slice(0, 10))
  const [expiryDate, setExpiryDate] = useState(warranty?.expiryDate ? warranty.expiryDate.slice(0, 10) : '')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const payload = {
        assetId: selectedAssetId,
        provider,
        coverage: coverage || undefined,
        policyNumber: policyNumber || undefined,
        startDate,
        expiryDate,
      }
      if (warranty) {
        await apiPatch(`/api/warranties/${warranty.id}`, payload)
      } else {
        await apiPost('/api/warranties', payload)
      }
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save warranty')
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
        <Field label="Provider" placeholder="Samsung Care+" value={provider} onChange={setProvider} required />
        <Field label="Coverage" placeholder="Parts & Labor" value={coverage} onChange={setCoverage} />
      </div>
      <Field label="Policy number" placeholder="Optional" value={policyNumber} onChange={setPolicyNumber} />
      <div className="grid grid-cols-2 gap-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground">Start date</span>
          <input
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/40"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground">Expiry date</span>
          <input
            type="date"
            required
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/40"
          />
        </label>
      </div>

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting} className="bg-primary text-primary-foreground hover:bg-primary/90">
          {submitting ? 'Saving…' : warranty ? 'Save changes' : 'Save Warranty'}
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
}: {
  label: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  required?: boolean
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <input
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-primary/60 focus:ring-2 focus:ring-ring/40"
      />
    </label>
  )
}
