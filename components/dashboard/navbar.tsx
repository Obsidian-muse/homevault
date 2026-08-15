'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Bell, Menu, Search, LogOut, User, Settings } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { ThemeToggle } from '@/components/theme-toggle'

const notifications = [
  { title: 'Warranty expiring soon', desc: 'OLED Television 65" — 27 days left', tint: 'bg-warning' },
  { title: 'Maintenance due', desc: 'Robotic Vacuum filter replacement', tint: 'bg-primary' },
  { title: 'New asset added', desc: 'Electric SUV Charger in Garage', tint: 'bg-success' },
]

export function Navbar({ onMenu }: { onMenu: () => void }) {
  const [bellOpen, setBellOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { data: session } = useSession()

  const name = session?.user?.name ?? 'Account'
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl md:px-6">
      <button
        type="button"
        aria-label="Open menu"
        onClick={onMenu}
        className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground lg:hidden"
      >
        <Menu className="size-4" />
      </button>

      <div className="relative flex-1 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search assets, rooms, warranties…"
          className="h-9 w-full rounded-lg border border-border bg-card/60 pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:bg-card"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative">
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => setBellOpen((v) => !v)}
            className="relative inline-flex size-9 items-center justify-center rounded-lg border border-border bg-card/60 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Bell className="size-4" />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-primary ring-2 ring-background" />
          </button>
          <AnimatePresence>
            {bellOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setBellOpen(false)} aria-hidden="true" />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="glass-strong absolute right-0 z-20 mt-2 w-72 rounded-xl border border-border p-2 shadow-2xl"
                >
                  <p className="px-2 py-1.5 text-sm font-semibold">Notifications</p>
                  {notifications.map((n) => (
                    <div
                      key={n.title}
                      className="flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-secondary"
                    >
                      <span className={`mt-1.5 size-2 shrink-0 rounded-full ${n.tint}`} />
                      <span>
                        <span className="block text-sm font-medium">{n.title}</span>
                        <span className="block text-xs text-muted-foreground">{n.desc}</span>
                      </span>
                    </div>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <ThemeToggle />

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg border border-border bg-card/60 py-1 pl-1 pr-2.5 transition-colors hover:bg-card"
          >
            <span className="flex size-7 items-center justify-center rounded-md bg-gradient-to-br from-primary to-violet text-xs font-semibold text-primary-foreground">
              {initials}
            </span>
            <span className="hidden text-sm font-medium sm:block">{name}</span>
          </button>
          <AnimatePresence>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} aria-hidden="true" />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="glass-strong absolute right-0 z-20 mt-2 w-52 rounded-xl border border-border p-1.5 shadow-2xl"
                >
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-secondary"
                  >
                    <User className="size-4 text-muted-foreground" />
                    Profile
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-secondary"
                  >
                    <Settings className="size-4 text-muted-foreground" />
                    Settings
                  </Link>
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <LogOut className="size-4" />
                    Sign out
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
