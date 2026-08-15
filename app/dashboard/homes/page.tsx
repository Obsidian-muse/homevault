'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Plus, MapPin, DoorOpen, Package, Loader2, Pencil, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { DeleteConfirm } from '@/components/dashboard/delete-confirm'
import { useApiGet, apiPost, apiPatch, apiDelete } from '@/lib/api-client'
import { formatCurrency, type HomeDTO } from '@/lib/data'

export default function HomesPage() {
  const { data, loading, error, refetch } = useApiGet<{ homes: HomeDTO[] }>('/api/homes')
  const [addOpen, setAddOpen] = useState(false)
  const [editHome, setEditHome] = useState<HomeDTO | null>(null)
  const [deleteHome, setDeleteHome] = useState<HomeDTO | null>(null)

  const homes = data?.homes ?? []

  return (
    <div className="space-y-8">
      <PageHeader
        title="Homes"
        description="Every property you manage, all in one place."
        actions={
          <Button onClick={() => setAddOpen(true)} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="size-4" />
            Add Home
          </Button>
        }
      />

      {loading && (
        <div className="flex h-40 items-center justify-center text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      )}

      {error && !loading && (
        <div className="rounded-xl border border-dashed border-destructive/40 py-16 text-center text-destructive">{error}</div>
      )}

      {!loading && !error && (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {homes.map((home, i) => (
            <motion.div
              key={home.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
            >
              <Card className="group relative h-full overflow-hidden p-0 transition-colors hover:border-primary/40">
                <div className="absolute right-3 top-3 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      setEditHome(home)
                    }}
                    aria-label="Edit home"
                    className="flex size-7 items-center justify-center rounded-md bg-background/80 text-muted-foreground backdrop-blur hover:text-foreground"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      setDeleteHome(home)
                    }}
                    aria-label="Delete home"
                    className="flex size-7 items-center justify-center rounded-md bg-background/80 text-destructive backdrop-blur hover:bg-destructive/10"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <Link href={`/dashboard/homes/${home.id}`}>
                  <div className="relative h-44 w-full overflow-hidden bg-secondary/40">
                    <Image
                      src={home.image || '/placeholder.svg'}
                      alt={home.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-transparent to-transparent" />
                    <span className="absolute left-3 top-3 rounded-md bg-background/70 px-2 py-1 text-xs font-medium backdrop-blur">
                      {home.type}
                    </span>
                  </div>
                  <div className="space-y-3 p-5">
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight text-foreground">{home.name}</h3>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="size-3.5" />
                        {home.address}, {home.city}
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <DoorOpen className="size-3.5 text-primary" />
                          {home.roomCount}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Package className="size-3.5 text-primary" />
                          {home.assetCount}
                        </span>
                      </div>
                      <span className="font-medium text-foreground">{formatCurrency(home.value)}</span>
                    </div>
                  </div>
                </Link>
              </Card>
            </motion.div>
          ))}

          {homes.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
              No homes yet — add your first one to get started.
            </div>
          )}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add a home" description="Add a new property to manage.">
        <HomeForm
          onDone={() => {
            setAddOpen(false)
            refetch()
          }}
        />
      </Modal>

      <Modal open={!!editHome} onClose={() => setEditHome(null)} title="Edit home" description="Update this property's details.">
        {editHome && (
          <HomeForm
            home={editHome}
            onDone={() => {
              setEditHome(null)
              refetch()
            }}
          />
        )}
      </Modal>

      <Modal
        open={!!deleteHome}
        onClose={() => setDeleteHome(null)}
        title="Delete home"
        description={`This permanently deletes "${deleteHome?.name}" and every room, asset, warranty, and maintenance record inside it. This cannot be undone.`}
      >
        <DeleteConfirm
          onCancel={() => setDeleteHome(null)}
          onConfirm={async () => {
            if (!deleteHome) return
            await apiDelete(`/api/homes/${deleteHome.id}`)
            setDeleteHome(null)
            refetch()
          }}
        />
      </Modal>
    </div>
  )
}

function HomeForm({ home, onDone }: { home?: HomeDTO; onDone: () => void }) {
  const [name, setName] = useState(home?.name ?? '')
  const [address, setAddress] = useState(home?.address ?? '')
  const [city, setCity] = useState(home?.city ?? '')
  const [type, setType] = useState(home?.type ?? '')
  const [yearBuilt, setYearBuilt] = useState(home?.yearBuilt ? String(home.yearBuilt) : '')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const payload = {
        name,
        address,
        city,
        type,
        yearBuilt: yearBuilt ? Number(yearBuilt) : undefined,
      }
      if (home) {
        await apiPatch(`/api/homes/${home.id}`, payload)
      } else {
        await apiPost('/api/homes', payload)
      }
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save home')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Field label="Home name" placeholder="Skyline Residence" value={name} onChange={setName} required />
      <Field label="Address" placeholder="2400 Highland Ave" value={address} onChange={setAddress} required />
      <div className="grid grid-cols-2 gap-4">
        <Field label="City" placeholder="San Francisco, CA" value={city} onChange={setCity} required />
        <Field label="Type" placeholder="Modern Villa" value={type} onChange={setType} required />
      </div>
      <Field label="Year built" placeholder="2019" value={yearBuilt} onChange={setYearBuilt} type="number" />

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting} className="bg-primary text-primary-foreground hover:bg-primary/90">
          {submitting ? 'Saving…' : home ? 'Save changes' : 'Save Home'}
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
        className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/40"
      />
    </label>
  )
}
