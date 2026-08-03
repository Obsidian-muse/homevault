'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Boxes, Home as HomeIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency, roomTypeLabel, type RoomDTO, type AssetDTO } from '@/lib/data'

type RiskLevel = 'success' | 'warning' | 'destructive'

interface RoomNode {
  room: RoomDTO
  risk: RiskLevel
  topAssets: AssetDTO[]
}

const riskDot: Record<RiskLevel, string> = {
  success: 'bg-success border-success',
  warning: 'bg-warning border-warning',
  destructive: 'bg-destructive border-destructive',
}

const riskRing: Record<RiskLevel, string> = {
  success: 'border-success/40 bg-success/10',
  warning: 'border-warning/40 bg-warning/10',
  destructive: 'border-destructive/40 bg-destructive/10',
}

/** Cross-references each room against its assets' warranty status to derive a
 * risk level — purely a client-side read of data already fetched from the
 * existing /api/rooms and /api/assets endpoints. No new backend logic. */
function buildNodes(rooms: RoomDTO[], assets: AssetDTO[]): RoomNode[] {
  return rooms.map((room) => {
    const roomAssets = assets.filter((a) => a.roomId === room.id)
    const hasExpired = roomAssets.some((a) => a.warranties?.some((w) => w.status === 'Expired'))
    const hasExpiring = roomAssets.some((a) => a.warranties?.some((w) => w.status === 'ExpiringSoon'))
    const risk: RiskLevel = hasExpired ? 'destructive' : hasExpiring ? 'warning' : 'success'
    const topAssets = [...roomAssets]
      .sort((a, b) => (b.currentValue ?? b.purchasePrice ?? 0) - (a.currentValue ?? a.purchasePrice ?? 0))
      .slice(0, 3)
    return { room, risk, topAssets }
  })
}

export function DigitalTwin({ rooms, assets }: { rooms: RoomDTO[]; assets: AssetDTO[] }) {
  const [active, setActive] = useState<string | null>(null)
  const nodes = buildNodes(rooms, assets).slice(0, 10)
  const goldenAngle = 137.508
  const activeNode = nodes.find((n) => n.room.id === active)

  return (
    <div className="relative flex h-full min-h-[380px] items-center justify-center overflow-hidden rounded-2xl holo-panel">
      <div className="holo-grid pointer-events-none absolute inset-0 animate-ambient-rotate opacity-40" />
      <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)] bg-gradient-to-br from-primary/10 via-transparent to-violet/10" />

      <div className="absolute left-4 top-4 z-20 rounded-full bg-background/60 px-2.5 py-1 text-[0.65rem] text-muted-foreground backdrop-blur-sm">
        Digital Twin · hover a room
      </div>

      <div className="relative size-[300px] sm:size-[360px]">
        {[1, 0.68, 0.36].map((scale) => (
          <div
            key={scale}
            className="absolute rounded-full border border-primary/15"
            style={{
              width: `${scale * 100}%`,
              height: `${scale * 100}%`,
              left: `${(100 - scale * 100) / 2}%`,
              top: `${(100 - scale * 100) / 2}%`,
            }}
          />
        ))}

        <svg className="absolute inset-0 size-full" viewBox="-100 -100 200 200">
          {nodes.map((n, i) => {
            const angle = i * goldenAngle * (Math.PI / 180)
            const x = Math.cos(angle) * 76
            const y = Math.sin(angle) * 76
            return (
              <line
                key={n.room.id}
                x1={0}
                y1={0}
                x2={x}
                y2={y}
                stroke="var(--primary)"
                strokeOpacity={active === n.room.id ? 0.5 : 0.15}
                strokeWidth={active === n.room.id ? 1.5 : 1}
              />
            )
          })}
        </svg>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute left-1/2 top-1/2 z-10 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-primary/40 bg-primary/10 glow-neural sm:size-20"
        >
          <span className="absolute inline-flex size-full animate-radar-ping rounded-full bg-primary/30" />
          <HomeIcon className="relative size-6 text-primary sm:size-8" />
        </motion.div>

        {nodes.map((n, i) => {
          const angle = i * goldenAngle * (Math.PI / 180)
          const x = Math.cos(angle) * 38
          const y = Math.sin(angle) * 38
          const isActive = active === n.room.id
          return (
            <motion.button
              key={n.room.id}
              type="button"
              onMouseEnter={() => setActive(n.room.id)}
              onMouseLeave={() => setActive((cur) => (cur === n.room.id ? null : cur))}
              onFocus={() => setActive(n.room.id)}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.35, delay: 0.1 + i * 0.05 }}
              whileHover={{ scale: 1.12 }}
              className="absolute z-10 flex flex-col items-center gap-1"
              style={{ left: `${50 + x}%`, top: `${50 + y}%`, transform: 'translate(-50%, -50%)' }}
            >
              <span
                className={cn(
                  'relative flex size-10 items-center justify-center rounded-full border backdrop-blur-sm transition-all sm:size-12',
                  riskRing[n.risk],
                  isActive && 'shadow-[0_0_20px_-4px_currentColor]',
                )}
              >
                <span className={cn('absolute -right-0.5 -top-0.5 size-2 rounded-full border', riskDot[n.risk])} />
                <Boxes className="size-4 text-foreground sm:size-5" />
              </span>
              <span className="max-w-[72px] truncate rounded-full bg-background/70 px-2 py-0.5 text-[0.6rem] font-medium text-foreground backdrop-blur-sm">
                {n.room.name}
              </span>
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {activeNode && (
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.2 }}
            className="absolute right-3 top-12 z-20 w-52 rounded-xl holo-panel p-3 text-left sm:right-4"
          >
            <p className="text-xs font-semibold text-foreground">{activeNode.room.name}</p>
            <p className="text-[0.65rem] text-muted-foreground">{roomTypeLabel(activeNode.room.type)}</p>
            <div className="mt-2 flex items-center justify-between text-[0.7rem]">
              <span className="text-muted-foreground">{activeNode.room.assetCount} assets</span>
              <span className="font-medium text-foreground">{formatCurrency(activeNode.room.value)}</span>
            </div>
            {activeNode.topAssets.length > 0 && (
              <ul className="mt-2 space-y-1 border-t border-border pt-2">
                {activeNode.topAssets.map((a) => (
                  <li key={a.id} className="flex items-center justify-between text-[0.65rem]">
                    <span className="truncate text-muted-foreground">{a.name}</span>
                    <span className="ml-2 shrink-0 text-foreground">{formatCurrency(a.currentValue ?? a.purchasePrice)}</span>
                  </li>
                ))}
              </ul>
            )}
            <span
              className={cn(
                'mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6rem] font-medium',
                activeNode.risk === 'success' && 'bg-success/12 text-success',
                activeNode.risk === 'warning' && 'bg-warning/12 text-warning',
                activeNode.risk === 'destructive' && 'bg-destructive/12 text-destructive',
              )}
            >
              {activeNode.risk === 'success' ? 'Coverage healthy' : activeNode.risk === 'warning' ? 'Coverage expiring' : 'Coverage expired'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <Link
        href="/dashboard/rooms"
        className="absolute bottom-3 right-3 z-20 rounded-full bg-background/60 px-2.5 py-1 text-[0.65rem] text-primary backdrop-blur-sm hover:underline"
      >
        View all rooms →
      </Link>

      {nodes.length === 0 && (
        <p className="absolute inset-x-0 bottom-6 text-center text-xs text-muted-foreground">
          Add a room to activate the digital twin.
        </p>
      )}
    </div>
  )
}
