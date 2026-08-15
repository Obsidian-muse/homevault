'use client'

import { useState, type FormEvent } from 'react'
import { useSession } from 'next-auth/react'
import { Mail, Calendar, Boxes, Home as HomeIcon, ShieldCheck, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { useApiGet, apiPatch } from '@/lib/api-client'
import { formatCurrency, formatDate, type DashboardStats } from '@/lib/data'

interface ProfileDTO {
  id: string
  name: string
  email: string
  image: string | null
  createdAt: string
}

export default function ProfilePage() {
  const { update: updateSession } = useSession()
  const { data: profileData, loading, refetch } = useApiGet<{ user: ProfileDTO }>('/api/profile')
  const { data: dashboardData } = useApiGet<{ stats: DashboardStats }>('/api/dashboard')
  const [editOpen, setEditOpen] = useState(false)

  const profile = profileData?.user
  const stats = dashboardData?.stats

  const initials = profile?.name
    ? profile.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '—'

  return (
    <div className="space-y-8">
      <PageHeader title="Profile" description="Manage your personal information and see your account at a glance." />

      <Card className="overflow-hidden p-0">
        <div className="h-36 w-full bg-gradient-to-r from-primary/25 via-primary/10 to-violet/20" />
        <div className="flex flex-col gap-6 px-8 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="-mt-16 flex items-center gap-5">
            <div className="flex size-24 shrink-0 items-center justify-center rounded-2xl border-4 border-card bg-primary text-xl font-semibold text-primary-foreground">
              {loading ? <Loader2 className="size-5 animate-spin" /> : initials}
            </div>
            <div className="flex flex-col justify-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">{profile?.name ?? 'Loading…'}</h2>
              <p className="mt-1 text-base text-muted-foreground">
                Homeowner · Member since {profile ? formatDate(profile.createdAt) : '—'}
              </p>
            </div>
          </div>
          <Button
            onClick={() => setEditOpen(true)}
            className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Edit Profile
          </Button>
        </div>
      </Card>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-8 space-y-8 rounded-3xl">
          <h3 className="text-xl font-semibold tracking-tight text-foreground">Personal Information</h3>
          <div className="grid gap-5 sm:grid-cols-2">
            <Info icon={Mail} label="Email" value={profile?.email ?? '—'} />
            <Info icon={Calendar} label="Joined" value={profile ? formatDate(profile.createdAt) : '—'} />
          </div>
          <div className="border-t border-border pt-6">
            <h3 className="mb-4 text-xl font-semibold tracking-tight text-foreground">Portfolio Value</h3>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-semibold tracking-tight text-foreground">{formatCurrency(stats?.totalValue)}</span>
              <Badge className="border-transparent bg-chart-2/15 text-chart-2">Insured</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Total catalogued value across {stats?.totalHomes ?? 0} homes.
            </p>
          </div>
        </Card>

        <Card className="p-8 space-y-6 rounded-3xl">
          <h3 className="text-xl font-semibold tracking-tight text-foreground">Account Overview</h3>
          <OverviewRow icon={HomeIcon} label="Homes" value={stats?.totalHomes ?? 0} />
          <OverviewRow icon={Boxes} label="Assets tracked" value={stats?.totalAssets ?? 0} />
          <OverviewRow icon={ShieldCheck} label="Active warranties" value={stats?.activeWarranties ?? 0} />
        </Card>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit profile" description="Update your name or password.">
        {profile && (
          <EditProfileForm
            profile={profile}
            onDone={() => {
              setEditOpen(false)
              refetch()
              updateSession()
            }}
          />
        )}
      </Modal>
    </div>
  )
}

function EditProfileForm({ profile, onDone }: { profile: ProfileDTO; onDone: () => void }) {
  const [name, setName] = useState(profile.name)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await apiPatch('/api/profile', {
        name,
        ...(newPassword ? { currentPassword, newPassword } : {}),
      })
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-foreground">Full name</span>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/40"
        />
      </label>

      <div className="border-t border-border pt-4">
        <p className="mb-3 text-sm font-medium text-foreground">Change password (optional)</p>
        <div className="grid grid-cols-2 gap-4">
          <label className="block space-y-1.5">
            <span className="text-xs text-muted-foreground">Current password</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/40"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs text-muted-foreground">New password</span>
            <input
              type="password"
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/40"
            />
          </label>
        </div>
      </div>

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

function Info({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-primary">
        <Icon className="size-4" />
      </span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  )
}

function OverviewRow({ icon: Icon, label, value }: { icon: typeof HomeIcon; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-3 last:border-0">
      <span className="flex items-center gap-2.5 text-sm text-muted-foreground">
        <Icon className="size-4 text-primary" />
        {label}
      </span>
      <span className="text-lg font-semibold tracking-tight text-foreground">{value}</span>
    </div>
  )
}
