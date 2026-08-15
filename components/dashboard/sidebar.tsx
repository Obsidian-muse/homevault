'use client'

import { motion } from 'framer-motion'
import {
  Boxes,
  DoorOpen,
  LayoutDashboard,
  Home as HomeIcon,
  Settings,
  ShieldCheck,
  User,
  Wrench,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/logo'
import { cn } from '@/lib/utils'

const nav = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Homes', href: '/dashboard/homes', icon: HomeIcon },
  { label: 'Rooms', href: '/dashboard/rooms', icon: DoorOpen },
  { label: 'Assets', href: '/dashboard/assets', icon: Boxes },
  { label: 'Warranties', href: '/dashboard/warranties', icon: ShieldCheck },
  { label: 'Maintenance', href: '/dashboard/maintenance', icon: Wrench },
]

const secondary = [
  { label: 'Profile', href: '/dashboard/profile', icon: User },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href)

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
            <span className="text-sm font-semibold tracking-tight">HomeVault</span>
          </Link>
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={onClose}
            className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground lg:hidden"
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Manage
          </p>
          {nav.map((item) => (
            <NavLink key={item.href} {...item} active={isActive(item.href)} onClose={onClose} />
          ))}

          <p className="px-3 pb-2 pt-6 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Account
          </p>
          {secondary.map((item) => (
            <NavLink key={item.href} {...item} active={isActive(item.href)} onClose={onClose} />
          ))}
        </nav>

        <div className="m-3 rounded-xl border border-sidebar-border bg-gradient-to-br from-primary/10 to-violet/10 p-4">
          <p className="text-sm font-medium">Upgrade to Pro</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Unlock unlimited homes and document storage.
          </p>
          <Link
            href="/dashboard"
            className="mt-3 inline-flex h-8 items-center justify-center rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Upgrade
          </Link>
        </div>
      </aside>
    </>
  )
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  onClose,
}: {
  href: string
  label: string
  icon: typeof HomeIcon
  active: boolean
  onClose: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className={cn(
        'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
        active
          ? 'text-foreground'
          : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground',
      )}
    >
      {active && (
        <motion.span
          layoutId="sidebar-active"
          className="absolute inset-0 rounded-lg border border-primary/20 bg-primary/10"
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        />
      )}
      <Icon className={cn('relative size-4.5', active && 'text-primary')} />
      <span className="relative">{label}</span>
    </Link>
  )
}
