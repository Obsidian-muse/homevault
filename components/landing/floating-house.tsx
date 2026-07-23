'use client'

import { motion } from 'framer-motion'
import { Bed, Sofa, UtensilsCrossed, Car } from 'lucide-react'

const indicators = [
  { icon: Bed, label: 'Bedroom', x: '-12%', y: '18%', delay: 0 },
  { icon: UtensilsCrossed, label: 'Kitchen', x: '82%', y: '10%', delay: 0.6 },
  { icon: Sofa, label: 'Living Room', x: '86%', y: '62%', delay: 1.1 },
  { icon: Car, label: 'Garage', x: '-14%', y: '66%', delay: 1.6 },
]

export function FloatingHouse() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]">
      {/* ambient glows */}
      <div className="absolute left-1/2 top-1/2 size-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[90px]" />
      <div className="absolute left-[30%] top-[60%] size-[45%] rounded-full bg-violet/20 blur-[80px]" />

      <motion.div
        className="relative flex h-full items-center justify-center"
        style={{ perspective: 1000 }}
        animate={{ y: [0, -16, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.div
          className="relative"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: [-14, 14, -14], rotateX: [8, 12, 8] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Isometric house built from CSS 3D transforms */}
          <IsoHouse />
        </motion.div>
      </motion.div>

      {/* floating room indicators */}
      {indicators.map((ind, i) => {
        const Icon = ind.icon
        return (
          <motion.div
            key={ind.label}
            className="absolute z-10"
            style={{ left: ind.x, top: ind.y }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
            transition={{
              opacity: { delay: 0.4 + i * 0.15, duration: 0.6 },
              scale: { delay: 0.4 + i * 0.15, duration: 0.6 },
              y: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: ind.delay },
            }}
          >
            <div className="glass-strong flex items-center gap-2 rounded-xl border border-border px-3 py-2 shadow-lg">
              <span className="flex size-7 items-center justify-center rounded-md bg-primary/15 text-primary">
                <Icon className="size-4" />
              </span>
              <span className="text-xs font-medium text-foreground">{ind.label}</span>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

function IsoHouse() {
  return (
    <div
      className="relative"
      style={{ width: 220, height: 220, transformStyle: 'preserve-3d', transform: 'rotateX(0deg)' }}
    >
      {/* Base cube - house body */}
      <div style={{ transformStyle: 'preserve-3d' }}>
        {/* front face */}
        <div
          className="absolute rounded-lg border border-primary/30 bg-gradient-to-br from-card-elevated to-card"
          style={{
            width: 160,
            height: 140,
            left: 30,
            top: 60,
            transform: 'translateZ(80px)',
            boxShadow: '0 0 40px -8px rgba(59,130,246,0.35)',
          }}
        >
          <div className="absolute left-4 top-4 h-8 w-10 rounded bg-primary/40" />
          <div className="absolute right-4 top-4 h-8 w-10 rounded bg-violet/40" />
          <div className="absolute bottom-0 left-1/2 h-12 w-9 -translate-x-1/2 rounded-t bg-primary/25" />
        </div>
        {/* right face */}
        <div
          className="absolute rounded-lg border border-violet/30 bg-gradient-to-br from-card to-[#0c0c12]"
          style={{
            width: 160,
            height: 140,
            left: 30,
            top: 60,
            transform: 'rotateY(90deg) translateZ(80px)',
            transformOrigin: 'left',
          }}
        >
          <div className="absolute left-5 top-6 h-8 w-10 rounded bg-violet/30" />
          <div className="absolute left-5 top-20 h-8 w-10 rounded bg-primary/20" />
        </div>
        {/* roof */}
        <div
          className="absolute rounded-lg bg-gradient-to-br from-primary to-violet"
          style={{
            width: 176,
            height: 176,
            left: 22,
            top: 44,
            transform: 'rotateX(90deg) translateZ(80px)',
            boxShadow: '0 0 60px -6px rgba(139,92,246,0.5)',
          }}
        />
      </div>
    </div>
  )
}
