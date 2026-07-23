'use client'

import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Plus, Package, Home as HomeIcon, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { useApiGet, apiPost } from '@/lib/api-client'
import { formatCurrency, type RoomDTO, type RoomType, type HomeDTO } from '@/lib/data'
import { ROOM_TYPES } from '@/lib/validations'
import { cn } from '@/lib/utils'

const roomAccent: Record<string, string> = {
  Bedroom: 'bg-chart-1/15 text-chart-1',
  Kitchen: 'bg-chart-2/15 text-chart-2',
  'Living Room': 'bg-chart-3/15 text-chart-3',
  Office: 'bg-chart-4/15 text-chart-4',
  Garage: 'bg-chart-5/15 text-chart-5',
  Bathroom: 'bg-primary/15 text-primary',
  Outdoor: 'bg-chart-2/15 text-chart-2',
}

const filters = ['All', 'Bedroom', 'Kitchen', 'Living Room', 'Office', 'Garage']

interface RoomWithHome extends RoomDTO {
  home?: { name: string }
}

export default function RoomsPage() {
  const [active, setActive] = useState('All')
  const [addOpen, setAddOpen] = useState(false)
  const { data: roomsData, loading, error, refetch } = useApiGet<{ rooms: RoomWithHome[] }>('/api/rooms')
  const { data: homesData } = useApiGet<{ homes: HomeDTO[] }>('/api/homes')

  const rooms = roomsData?.rooms ?? []
  const homes = homesData?.homes ?? []
  const filtered = active === 'All' ? rooms : rooms.filter((r) => r.type === active)

  return (
    <div className="space-y-8">
      <PageHeader
        title="Rooms"
        description="Browse every room across all of your homes."
        actions={
          <Button
            onClick={() => setAddOpen(true)}
            disabled={homes.length === 0}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="size-4" />
            Add Room
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActive(f)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm transition-colors',
              active === f ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground',
            )}
          >
            {f}
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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((room, i) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Card className="h-full transition-colors hover:border-primary/40">
                <div className="flex items-start justify-between">
                  <span
                    className={cn(
                      'inline-flex rounded-md px-2 py-0.5 text-xs font-medium',
                      roomAccent[room.type] ?? 'bg-secondary text-secondary-foreground',
                    )}
                  >
                    {room.type}
                  </span>
                  <span className="font-medium text-foreground">{formatCurrency(room.value)}</span>
                </div>
                <h3 className="mt-3 font-serif text-lg font-medium text-foreground">{room.name}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <HomeIcon className="size-3.5" />
                  {room.home?.name ?? ''}
                </p>
                <div className="mt-4 flex items-center gap-1.5 border-t border-border pt-4 text-sm text-muted-foreground">
                  <Package className="size-4 text-primary" />
                  {room.assetCount} items tracked
                </div>
              </Card>
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
              No rooms match this filter.
            </div>
          )}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add a room" description="Add a new room to one of your homes.">
        <AddRoomForm
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

function AddRoomForm({ homes, onDone }: { homes: HomeDTO[]; onDone: () => void }) {
  const [homeId, setHomeId] = useState(homes[0]?.id ?? '')
  const [name, setName] = useState('')
  const [type, setType] = useState<RoomType>('Bedroom')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await apiPost('/api/rooms', { homeId, name, type })
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add room')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
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
              {t}
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
          {submitting ? 'Saving…' : 'Save Room'}
        </Button>
      </div>
    </form>
  )
}
