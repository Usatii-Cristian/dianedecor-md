import Button from '@/components/ui/Button'

export default function EmptyState({ icon: Icon, title, description, actionLabel, actionHref }) {
  return (
    <div className="flex flex-col items-center gap-5 border border-line bg-paper px-6 py-16 text-center">
      {Icon ? <Icon size={32} strokeWidth={1.25} aria-hidden="true" className="text-muted" /> : null}
      <p className="max-w-[46ch] text-ink">{title}</p>
      {description ? <p className="max-w-[52ch] text-sm text-muted">{description}</p> : null}
      {actionLabel && actionHref ? (
        <Button href={actionHref} variant="secondary">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
