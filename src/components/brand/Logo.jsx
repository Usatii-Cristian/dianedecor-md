import { cn } from '@/lib/utils'
import { siteConfig } from '@/lib/site-config'

/**
 * The single source of truth for the brand mark. Nothing else in the codebase
 * renders the studio name in a visual header position.
 */
export default function Logo({ variant = 'dark', className }) {
  // TODO: replace the wordmark below with <Image src="/logo.svg" .../> once the client delivers the logo. This is the only file that needs to change.
  return (
    <span
      className={cn(
        'font-display leading-none tracking-[0.02em] whitespace-nowrap',
        variant === 'light' && 'text-ivory',
        variant === 'dark' && 'text-ink',
        className
      )}
      aria-label={siteConfig.name}
    >
      <span className="font-normal">Diane</span>
      <span className="font-semibold">Decor</span>
    </span>
  )
}
