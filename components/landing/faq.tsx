'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Reveal } from './reveal'

const faqs = [
  {
    q: 'Is HomeVault free to use?',
    a: 'HomeVault offers a generous free tier for a single home. Premium plans unlock unlimited homes, advanced reminders, and document storage.',
  },
  {
    q: 'Can I manage more than one property?',
    a: 'Absolutely. HomeVault is built for multiple homes, from a single apartment to an entire real estate portfolio.',
  },
  {
    q: 'How does warranty tracking work?',
    a: 'Add a purchase date and warranty length, and HomeVault automatically calculates status, showing you what is active, expiring soon, or expired.',
  },
  {
    q: 'Is my data secure?',
    a: 'Your data is encrypted in transit and at rest. You stay in full control of your information at all times.',
  },
  {
    q: 'Can I export my inventory?',
    a: 'Yes. Export a full home manual as a document, perfect for insurance, selling, or renting your property.',
  },
]

export function Faq() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="relative px-4 py-24">
      <div className="mx-auto max-w-3xl">
        <Reveal className="text-center">
          <span className="text-sm font-medium text-violet">FAQ</span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Questions, answered
          </h2>
        </Reveal>

        <div className="mt-12 space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i
            return (
              <Reveal key={f.q} delay={i * 0.05}>
                <div className="overflow-hidden rounded-2xl border border-border bg-card">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm font-medium md:text-base">{f.q}</span>
                    <span
                      className={`flex size-7 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-transform duration-300 ${
                        isOpen ? 'rotate-45 text-primary' : ''
                      }`}
                    >
                      <Plus className="size-4" />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                      >
                        <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
