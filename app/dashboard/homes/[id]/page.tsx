'use client'

import { use, useState, type FormEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, MapPin, CalendarDays, DoorOpen, Package, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { useApiGet, apiPost } from '@/lib/api-client'
import { formatCurrency, type HomeDTO, type RoomDTO, type RoomType } from '@/lib/data'
import { ROOM_TYPES } from '@/lib/validations'

const roomAccent: Record<string, string> = {
  Bedroom: 'bg-chart-1/15 text-chart-1',
  Kitchen: 'bg-chart-2/15 text-chart-2',
  'Living Room': 'bg-chart-3/15 text-chart-3',
  Office: 'bg-chart-4/15 text-chart-4',
  Garage: 'bg-chart-5/15 text-chart-5',
  Bathroom: 'bg-primary/15 text-primary',
  Outdoor: 'bg-chart-2/15 text-chart-2',
}

interface HomeDetailDTO extends HomeDTO {
  rooms: RoomDTO[]
}

export default function HomeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data, loading, error, refetch } = useApiGet<{ home: HomeDetailDTO }>(`/api/homes/${id}`)
  const [addOpen, setAddOpen] = useState(false)

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
      </div>
    )
  }

  if (error || !data?.home) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/homes" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />
          All Homes
        </Link>
        <div className="rounded-xl border border-dashed border-destructive/40 py-16 text-center text-destructive">
          {error ?? 'Home not found.'}
        </div>
      </div>
    )
  }

  const home = data.home

  return (
    <div className="space-y-8">
      <Link
        href="/dashboard/homes"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All Homes
      </Link>

      <Card className="overflow-hidden p-0">
        <div className="relative h-56 w-full sm:h-64">
          <Image src={home.image || '/placeholder.svg'} alt={home.name} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <Badge className="mb-3 border-transparent bg-background/70 text-foreground backdrop-blur">{home.type}</Badge>
              <h1 className="font-serif text-3xl font-medium text-foreground">{home.name}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-3.5" />
                {home.address}, {home.city}
              </p>
            </div>
            <div className="flex gap-6 rounded-xl bg-background/60 px-5 py-3 backdrop-blur">
              <Metric icon={DoorOpen} label="Rooms" value={String(home.roomCount)} />
              <Metric icon={Package} label="Assets" value={String(home.assetCount)} />
              <Metric icon={CalendarDays} label="Built" value={home.yearBuilt ? String(home.yearBuilt) : '—'} />
            </div>
          </div>
        </div>
      </Card>

      <PageHeader
        title="Rooms"
        description={`Total catalogued value ${formatCurrency(home.value)}`}
        actions={
          <Button onClick={() => setAddOpen(true)} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="size-4" />
            Add Room
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {home.rooms.map((room, i) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.06 }}
          >
            <Link href={`/dashboard/rooms?roomId=${room.id}`}>
              <Card className="group h-full transition-colors hover:border-primary/40">
                <div className="flex items-start justify-between">
                  <div>
                    <span
                      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${
                        roomAccent[room.type] ?? 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      {room.type}
                    </span>
                    <h3 className="mt-3 font-serif text-lg font-medium text-foreground">{room.name}</h3>
                  </div>
                  <span className="font-medium text-foreground">{formatCurrency(room.value)}</span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="size-4 text-primary" />
                  {room.assetCount} items tracked
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}

        {home.rooms.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
            No rooms yet — add your first one.
          </div>
        )}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add a room" description="Add a new room to this home.">
        <AddRoomForm
          homeId={home.id}
          onDone={() => {
            setAddOpen(false)
            refetch()
          }}
        />
      </Modal>
    </div>
  )
}

function AddRoomForm({ homeId, onDone }: { homeId: string; onDone: () => void }) {
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

function Metric({ icon: Icon, label, value }: { icon: typeof DoorOpen; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center">
      <Icon className="mb-1 size-4 text-primary" />
      <span className="font-serif text-lg font-medium text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}
