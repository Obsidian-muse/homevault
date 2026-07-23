import { cn } from '@/lib/utils'
import type { ComponentProps } from 'react'

type Variant = 'default' | 'success' | 'warning' | 'destructive' | 'violet' | 'outline'

const variants: Record<Variant, string> = {
  default: 'bg-primary/12 text-primary border-primary/20',
  success: 'bg-success/12 text-success border-success/20',
  warning: 'bg-warning/12 text-warning border-warning/20',
  destructive: 'bg-destructive/12 text-destructive border-destructive/20',
  violet: 'bg-violet/12 text-violet border-violet/20',
  outline: 'bg-transparent text-muted-foreground border-border',
}

export function Badge({
  className,
  variant = 'default',
  ...props
}: ComponentProps<'span'> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
