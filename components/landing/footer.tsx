import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'
import { Reveal } from './reveal'

const columns = [
  { title: 'Product', links: ['Features', 'How It Works', 'Benefits', 'Pricing'] },
  { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
  { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'Cookies'] },
]

export function Footer() {
  return (
    <footer className="relative px-4 pb-10">
      <Reveal className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card to-background p-10 text-center md:p-16">
          <div className="pointer-events-none absolute left-1/2 top-0 size-[400px] -translate-x-1/2 rounded-full bg-primary/15 blur-[100px]" />
          <div className="relative">
            <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
              Start protecting your home today
            </h2>
            <p className="mx-auto mt-4 max-w-md text-pretty text-muted-foreground">
              Join thousands of homeowners who trust HomeVault to organize everything inside their homes.
            </p>
            <Button
              size="lg"
              nativeButton={false}
              render={
                <Link href="/dashboard">
                  Open HomeVault
                  <ArrowRight className="size-4" />
                </Link>
              }
              className="mt-8 h-11 gap-2 px-6 bg-primary text-primary-foreground shadow-[0_12px_32px_-10px_rgba(59,130,246,0.7)] hover:bg-primary/90"
            />
          </div>
        </div>
      </Reveal>

      <div className="mx-auto mt-12 grid max-w-6xl gap-8 border-t border-border pt-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <Logo />
            <span className="text-sm font-semibold tracking-tight">HomeVault</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            The premium home inventory and property management platform for modern homeowners.
          </p>
        </div>
        {columns.map((c) => (
          <div key={c.title}>
            <h4 className="text-sm font-semibold">{c.title}</h4>
            <ul className="mt-4 space-y-3">
              {c.links.map((l) => (
                <li key={l}>
                  <span className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {l}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-10 max-w-6xl border-t border-border pt-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} HomeVault. Crafted for the modern home.
      </div>
    </footer>
  )
}
