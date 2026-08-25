import { TriangleAlert } from 'lucide-react'

import Container from '@/components/layout/Container'
import Button from '@/components/ui/Button'

/**
 * Shared body for every `error.js` boundary. `onRetry` receives the boundary's
 * `reset`, so the caller stays a two-line client component.
 */
export default function ErrorState({
  title = 'Ceva nu a mers bine',
  description = 'Nu am reușit să încărcăm conținutul. Încearcă din nou sau sună-ne direct.',
  onRetry,
  retryLabel = 'Încearcă din nou',
}) {
  return (
    <Container className="flex flex-col items-center gap-6 py-28 text-center md:py-36">
      <TriangleAlert size={32} strokeWidth={1.25} aria-hidden="true" className="text-muted" />
      <h1>{title}</h1>
      <p className="max-w-[52ch] text-ink-soft">{description}</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        {onRetry ? (
          <Button onClick={onRetry} variant="primary">
            {retryLabel}
          </Button>
        ) : null}
        <Button href="/" variant="secondary">
          Înapoi la pagina principală
        </Button>
      </div>
    </Container>
  )
}
