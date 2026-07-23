'use client'

import { motion } from 'framer-motion'
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Stat {
  label: string
  value: string
  icon: LucideIcon
  trend?: number
  hint?: string
  tint?: 'primary' | 'violet' | 'success' | 'warning'
}

const tints = {
  primary: 'from-primary/20 to-primary/5 text-primary',
  violet: 'from-violet/20 to-violet/5 text-violet',
  success: 'from-success/20 to-success/5 text-success',
  warning: 'from-warning/20 to-warning/5 text-warning',
}

export function StatCard({ stat, index = 0 }: { stat: Stat; index?: number }) {
  const Icon = stat.icon
  const tint = stat.tint ?? 'primary'
  const up = (stat.trend ?? 0) >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5"
    >
      <div
        className={cn(
          'pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-gradient-to-br opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100',
          tints[tint],
        )}
      />
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ring-inset ring-border',
            tints[tint],
          )}
        >
          <Icon className="size-5" />
        </span>
        {stat.trend !== undefined && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium',
              up ? 'bg-success/12 text-success' : 'bg-destructive/12 text-destructive',
            )}
          >
            {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
            {Math.abs(stat.trend)}%
          </span>
        )}
      </div>
      <div className="mt-4 text-3xl font-semibold tracking-tight">{stat.value}</div>
      <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
      {stat.hint && <div className="mt-2 text-xs text-muted-foreground/70">{stat.hint}</div>}
    </motion.div>
  )
}
