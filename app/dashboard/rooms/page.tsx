'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Package, Home as HomeIcon, Loader2, Pencil, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { RoomForm } from '@/components/dashboard/room-form'
import { DeleteConfirm } from '@/components/dashboard/delete-confirm'
import { useApiGet, apiDelete } from '@/lib/api-client'
import { formatCurrency, roomTypeLabel, type RoomDTO, type HomeDTO } from '@/lib/data'
import { cn } from '@/lib/utils'

const roomAccent: Record<string, string> = {
  Bedroom: 'bg-chart-1/15 text-chart-1',
  Kitchen: 'bg-chart-2/15 text-chart-2',
  LivingRoom: 'bg-chart-3/15 text-chart-3',
  Office: 'bg-chart-4/15 text-chart-4',
  Garage: 'bg-chart-5/15 text-chart-5',
  Bathroom: 'bg-primary/15 text-primary',
  Outdoor: 'bg-chart-2/15 text-chart-2',
}

const filters = ['All', 'Bedroom', 'Kitchen', 'LivingRoom', 'Office', 'Garage']

interface RoomWithHome extends RoomDTO {
  home?: { name: string }
}

export default function RoomsPage() {
  const [active, setActive] = useState('All')
  const [addOpen, setAddOpen] = useState(false)
  const [editRoom, setEditRoom] = useState<RoomWithHome | null>(null)
  const [deleteRoom, setDeleteRoom] = useState<RoomWithHome | null>(null)
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
            {f === 'All' ? f : roomTypeLabel(f)}
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
              <Card className="group relative h-full transition-colors hover:border-primary/40">
                <div className="absolute right-3 top-3 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => setEditRoom(room)}
                    aria-label="Edit room"
                    className="flex size-7 items-center justify-center rounded-md bg-background/80 text-muted-foreground backdrop-blur hover:text-foreground"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteRoom(room)}
                    aria-label="Delete room"
                    className="flex size-7 items-center justify-center rounded-md bg-background/80 text-destructive backdrop-blur hover:bg-destructive/10"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <div className="flex items-start justify-between pr-14">
                  <span
                    className={cn(
                      'inline-flex rounded-md px-2 py-0.5 text-xs font-medium',
                      roomAccent[room.type] ?? 'bg-secondary text-secondary-foreground',
                    )}
                  >
                    {roomTypeLabel(room.type)}
                  </span>
                  <span className="font-medium text-foreground">{formatCurrency(room.value)}</span>
                </div>
                <h3 className="mt-3 text-lg font-semibold tracking-tight text-foreground">{room.name}</h3>
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
        <RoomForm
          homes={homes}
          onDone={() => {
            setAddOpen(false)
            refetch()
          }}
        />
      </Modal>

      <Modal open={!!editRoom} onClose={() => setEditRoom(null)} title="Edit room" description="Update this room's details.">
        {editRoom && (
          <RoomForm
            room={editRoom}
            onDone={() => {
              setEditRoom(null)
              refetch()
            }}
          />
        )}
      </Modal>

      <Modal
        open={!!deleteRoom}
        onClose={() => setDeleteRoom(null)}
        title="Delete room"
        description={`This permanently deletes "${deleteRoom?.name}" and every asset inside it. This cannot be undone.`}
      >
        <DeleteConfirm
          onCancel={() => setDeleteRoom(null)}
          onConfirm={async () => {
            if (!deleteRoom) return
            await apiDelete(`/api/rooms/${deleteRoom.id}`)
            setDeleteRoom(null)
            refetch()
          }}
        />
      </Modal>
    </div>
  )
}
