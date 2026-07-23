'use client'

import { useState, type FormEvent } from 'react'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Moon, Sun, Monitor, Bell, Lock, CreditCard, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { apiPatch, apiDelete } from '@/lib/api-client'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [toggles, setToggles] = useState({
    warranty: true,
    maintenance: true,
    digest: false,
    marketing: false,
  })
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const themeOptions = [
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'system', label: 'System', icon: Monitor },
  ]

  async function handleDelete() {
    setDeleting(true)
    setDeleteError(null)
    try {
      await apiDelete('/api/account')
      await signOut({ callbackUrl: '/' })
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete account')
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Settings" description="Customize your experience and manage account preferences." />

      <Card className="space-y-5">
        <div>
          <h3 className="font-serif text-lg font-medium text-foreground">Appearance</h3>
          <p className="text-sm text-muted-foreground">Choose how HomeVault looks to you.</p>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:max-w-md">
          {themeOptions.map((opt) => {
            const active = theme === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl border p-4 text-sm transition-colors',
                  active ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:text-foreground',
                )}
              >
                <opt.icon className={cn('size-5', active && 'text-primary')} />
                {opt.label}
              </button>
            )
          })}
        </div>
      </Card>

      <Card className="space-y-5">
        <div className="flex items-center gap-2">
          <Bell className="size-5 text-primary" />
          <h3 className="font-serif text-lg font-medium text-foreground">Notifications</h3>
        </div>
        <div className="space-y-1">
          <ToggleRow
            label="Warranty expiry alerts"
            description="Get notified 30 days before a warranty ends."
            checked={toggles.warranty}
            onChange={() => setToggles((t) => ({ ...t, warranty: !t.warranty }))}
          />
          <ToggleRow
            label="Maintenance reminders"
            description="Reminders for scheduled upkeep and service."
            checked={toggles.maintenance}
            onChange={() => setToggles((t) => ({ ...t, maintenance: !t.maintenance }))}
          />
          <ToggleRow
            label="Weekly digest"
            description="A summary of your portfolio every Monday."
            checked={toggles.digest}
            onChange={() => setToggles((t) => ({ ...t, digest: !t.digest }))}
          />
          <ToggleRow
            label="Product updates"
            description="News about new HomeVault features."
            checked={toggles.marketing}
            onChange={() => setToggles((t) => ({ ...t, marketing: !t.marketing }))}
          />
        </div>
      </Card>

      <Card className="space-y-4">
        <h3 className="font-serif text-lg font-medium text-foreground">Account</h3>
        <div className="divide-y divide-border">
          <ActionRow icon={Lock} label="Password & Security" description="Update your password." onClick={() => setPasswordOpen(true)} />
          <ActionRow icon={CreditCard} label="Billing & Plan" description="Pro Annual · renews March 2026." />
        </div>
      </Card>

      <Card className="border-destructive/30">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-destructive/15 text-destructive">
              <Trash2 className="size-4" />
            </span>
            <div>
              <p className="font-medium text-foreground">Delete account</p>
              <p className="text-sm text-muted-foreground">Permanently remove your account and all data.</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setDeleteOpen(true)}
            className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            Delete Account
          </Button>
        </div>
      </Card>

      <Modal open={passwordOpen} onClose={() => setPasswordOpen(false)} title="Password & Security" description="Update your account password.">
        <PasswordForm onDone={() => setPasswordOpen(false)} />
      </Modal>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete account"
        description="This permanently deletes your account and every home, room, asset, warranty, and maintenance record you own. This cannot be undone."
      >
        <div className="space-y-4">
          {deleteError && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{deleteError}</p>
          )}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting ? 'Deleting…' : 'Yes, delete everything'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function PasswordForm({ onDone }: { onDone: () => void }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await apiPatch('/api/profile', { currentPassword, newPassword })
      setSuccess(true)
      setTimeout(onDone, 900)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-foreground">Current password</span>
        <input
          type="password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/40"
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-foreground">New password</span>
        <input
          type="password"
          required
          minLength={8}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/40"
        />
      </label>

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}
      {success && (
        <p className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">Password updated.</p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting} className="bg-primary text-primary-foreground hover:bg-primary/90">
          {submitting ? 'Saving…' : 'Update password'}
        </Button>
      </div>
    </form>
  )
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <div className="flex items-center justify-between border-b border-border py-3 last:border-0">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={onChange}
        className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors', checked ? 'bg-primary' : 'bg-secondary')}
      >
        <span
          className={cn(
            'absolute top-0.5 size-5 rounded-full bg-background transition-transform',
            checked ? 'translate-x-[22px]' : 'translate-x-0.5',
          )}
        />
      </button>
    </div>
  )
}

function ActionRow({
  icon: Icon,
  label,
  description,
  onClick,
}: {
  icon: typeof Lock
  label: string
  description: string
  onClick?: () => void
}) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:opacity-80">
      <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-primary">
        <Icon className="size-4" />
      </span>
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </button>
  )
}
