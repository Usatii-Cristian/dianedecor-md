import { cn } from '@/lib/utils'

export default function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  as: Tag = 'h2',
  align = 'left',
  className,
  children,
}) {
  const centered = align === 'center'

  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        centered ? 'items-center text-center' : 'items-start',
        className
      )}
    >
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <Tag id={id} className="max-w-[20ch]">
        {title}
      </Tag>
      {description ? (
        <p className={cn('max-w-[62ch] text-ink-soft', centered && 'mx-auto')}>{description}</p>
      ) : null}
      {children}
    </div>
  )
}
