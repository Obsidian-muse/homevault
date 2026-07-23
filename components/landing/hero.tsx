'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SmartHome3D } from './smart-home-3d'

const heroStats = [
  { value: '12k+', label: 'Assets tracked' },
  { value: '99.9%', label: 'Uptime' },
  { value: '4.9/5', label: 'User rating' },
]

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pt-36 pb-20 md:pt-44 md:pb-28">
      {/* background */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.35] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="pointer-events-none absolute left-1/2 top-0 size-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground"
          >
            <Sparkles className="size-3.5 text-primary" />
            Intelligent home inventory, reimagined
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl"
          >
            Manage Everything <span className="text-gradient">Inside Your Home</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground md:text-lg"
          >
            Track assets, warranties, maintenance records, and important home information from a single
            intelligent platform built for modern homeowners.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Button
              size="lg"
              nativeButton={false}
              render={
                <Link href="/dashboard">
                  Launch Dashboard
                  <ArrowRight className="size-4" />
                </Link>
              }
              className="h-11 gap-2 px-5 text-sm bg-primary text-primary-foreground shadow-[0_12px_32px_-10px_rgba(59,130,246,0.7)] hover:bg-primary/90"
            />
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              render={<a href="#features">Explore Features</a>}
              className="h-11 px-5 text-sm"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-12 grid max-w-md grid-cols-3 gap-6"
          >
            {heroStats.map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-semibold tracking-tight md:text-3xl">{s.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2 }}
        >
          <SmartHome3D />
        </motion.div>
      </div>
    </section>
  )
}
