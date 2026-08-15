'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { apiPost, apiPatch } from '@/lib/api-client'
import { roomTypeLabel, type HomeDTO, type RoomDTO, type RoomType } from '@/lib/data'
import { ROOM_TYPES } from '@/lib/validations'

export function RoomForm({
  homes,
  homeId: fixedHomeId,
  room,
  onDone,
}: {
  homes?: HomeDTO[]
  homeId?: string
  room?: RoomDTO
  onDone: () => void
}) {
  const [homeId, setHomeId] = useState(room?.homeId ?? fixedHomeId ?? homes?.[0]?.id ?? '')
  const [name, setName] = useState(room?.name ?? '')
  const [type, setType] = useState<RoomType>(room?.type ?? 'Bedroom')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (room) {
        await apiPatch(`/api/rooms/${room.id}`, { name, type })
      } else {
        await apiPost('/api/rooms', { homeId, name, type })
      }
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save room')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {homes && !room && (
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground">Home</span>
          <select
            required
            value={homeId}
            onChange={(e) => setHomeId(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/40"
          >
            {homes.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-foreground">Room name</span>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Primary Bedroom"
          className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/40"
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-foreground">Room type</span>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as RoomType)}
          className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/40"
        >
          {ROOM_TYPES.map((t) => (
            <option key={t} value={t}>
              {roomTypeLabel(t)}
            </option>
          ))}
        </select>
      </label>

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting} className="bg-primary text-primary-foreground hover:bg-primary/90">
          {submitting ? 'Saving…' : room ? 'Save changes' : 'Save Room'}
        </Button>
      </div>
    </form>
  )
}
