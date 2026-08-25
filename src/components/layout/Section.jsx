import Container from '@/components/layout/Container'
import { cn } from '@/lib/utils'

/**
 * The vertical rhythm every page shares. `labelledBy` wires the section to its
 * heading id so screen readers announce the landmark by name.
 */
export default function Section({
  id,
  labelledBy,
  className,
  containerClassName,
  reveal = false,
  children,
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn('py-20 md:py-28 lg:py-32', reveal && 'reveal', className)}
    >
      <Container className={containerClassName}>{children}</Container>
    </section>
  )
}
