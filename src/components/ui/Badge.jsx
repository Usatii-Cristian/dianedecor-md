import { cn } from '@/lib/utils'

const tones = {
  default: 'border-line text-muted',
  accent: 'border-accent/40 text-accent',
  sage: 'border-sage/40 text-sage',
  light: 'border-ivory/50 text-ivory',
}

export default function Badge({ tone = 'default', className, children }) {
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center self-start rounded-full border px-3 py-1 text-xs leading-none tracking-[0.14em] uppercase',
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  )
}
