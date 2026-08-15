'use client'

import { use, useState, type FormEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, Pencil, Trash2, MapPin, CalendarDays, DoorOpen, Package, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { DeleteConfirm } from '@/components/dashboard/delete-confirm'
import { RoomForm } from '@/components/dashboard/room-form'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { useApiGet, apiPatch, apiDelete } from '@/lib/api-client'
import { formatCurrency, roomTypeLabel, type HomeDTO, type RoomDTO } from '@/lib/data'

const roomAccent: Record<string, string> = {
  Bedroom: 'bg-chart-1/15 text-chart-1',
  Kitchen: 'bg-chart-2/15 text-chart-2',
  LivingRoom: 'bg-chart-3/15 text-chart-3',
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
  const router = useRouter()
  const { data, loading, error, refetch } = useApiGet<{ home: HomeDetailDTO }>(`/api/homes/${id}`)
  const [addRoomOpen, setAddRoomOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editRoom, setEditRoom] = useState<RoomDTO | null>(null)
  const [deleteRoom, setDeleteRoom] = useState<RoomDTO | null>(null)

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
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/homes"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          All Homes
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)} className="gap-1.5">
            <Pencil className="size-3.5" />
            Edit Home
          </Button>
          <Button
            variant="outline"
            onClick={() => setDeleteOpen(true)}
            className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-3.5" />
            Delete
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="relative h-56 w-full sm:h-64">
          <Image src={home.image || '/placeholder.svg'} alt={home.name} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <Badge className="mb-3 border-transparent bg-background/70 text-foreground backdrop-blur">{home.type}</Badge>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">{home.name}</h1>
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
          <Button onClick={() => setAddRoomOpen(true)} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
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
              <Link href={`/dashboard/rooms?roomId=${room.id}`} className="block">
                <div className="flex items-start justify-between pr-14">
                  <div>
                    <span
                      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${
                        roomAccent[room.type] ?? 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      {roomTypeLabel(room.type)}
                    </span>
                    <h3 className="mt-3 text-lg font-semibold tracking-tight text-foreground">{room.name}</h3>
                  </div>
                  <span className="font-medium text-foreground">{formatCurrency(room.value)}</span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="size-4 text-primary" />
                  {room.assetCount} items tracked
                </div>
              </Link>
            </Card>
          </motion.div>
        ))}

        {home.rooms.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
            No rooms yet — add your first one.
          </div>
        )}
      </div>

      <Modal open={addRoomOpen} onClose={() => setAddRoomOpen(false)} title="Add a room" description="Add a new room to this home.">
        <RoomForm
          homeId={home.id}
          onDone={() => {
            setAddRoomOpen(false)
            refetch()
          }}
        />
      </Modal>

      <Modal open={!!editRoom} onClose={() => setEditRoom(null)} title="Edit room" description="Update this room's details.">
        {editRoom && (
          <RoomForm
            homeId={home.id}
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

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit home" description="Update this property's details.">
        <HomeForm
          home={home}
          onDone={() => {
            setEditOpen(false)
            refetch()
          }}
        />
      </Modal>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete home"
        description={`This permanently deletes "${home.name}" and every room, asset, warranty, and maintenance record inside it. This cannot be undone.`}
      >
        <DeleteConfirm
          onCancel={() => setDeleteOpen(false)}
          onConfirm={async () => {
            await apiDelete(`/api/homes/${home.id}`)
            router.push('/dashboard/homes')
          }}
        />
      </Modal>
    </div>
  )
}

function HomeForm({ home, onDone }: { home: HomeDetailDTO; onDone: () => void }) {
  const [name, setName] = useState(home.name)
  const [address, setAddress] = useState(home.address)
  const [city, setCity] = useState(home.city)
  const [type, setType] = useState(home.type)
  const [yearBuilt, setYearBuilt] = useState(home.yearBuilt ? String(home.yearBuilt) : '')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await apiPatch(`/api/homes/${home.id}`, {
        name,
        address,
        city,
        type,
        yearBuilt: yearBuilt ? Number(yearBuilt) : undefined,
      })
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update home')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <TextField label="Home name" value={name} onChange={setName} required />
      <TextField label="Address" value={address} onChange={setAddress} required />
      <div className="grid grid-cols-2 gap-4">
        <TextField label="City" value={city} onChange={setCity} required />
        <TextField label="Type" value={type} onChange={setType} required />
      </div>
      <TextField label="Year built" value={yearBuilt} onChange={setYearBuilt} type="number" />

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting} className="bg-primary text-primary-foreground hover:bg-primary/90">
          {submitting ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </form>
  )
}

function TextField({
  label,
  value,
  onChange,
  required,
  type = 'text',
}: {
  label: string
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
        className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/40"
      />
    </label>
  )
}

function Metric({ icon: Icon, label, value }: { icon: typeof DoorOpen; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center">
      <Icon className="mb-1 size-4 text-primary" />
      <span className="text-lg font-semibold tracking-tight text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}
