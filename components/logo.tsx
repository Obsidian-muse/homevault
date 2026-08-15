import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-violet text-primary-foreground shadow-[0_6px_18px_-6px_rgba(59,130,246,0.7)]',
        className,
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-4.5" aria-hidden="true">
        <path
          d="M3 11.5 12 4l9 7.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.5 10v9.5h13V10"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="10" y="13.5" width="4" height="6" rx="0.6" fill="currentColor" />
      </svg>
    </span>
  )
}
