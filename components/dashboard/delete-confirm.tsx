'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function DeleteConfirm({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => Promise<void> }) {
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleConfirm() {
    setError(null)
    setDeleting(true)
    try {
      await onConfirm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" disabled={deleting} onClick={handleConfirm} className="bg-destructive text-white hover:bg-destructive/90">
          {deleting ? 'Deleting…' : 'Yes, delete'}
        </Button>
      </div>
    </div>
  )
}
