import { cn } from '@/lib/utils'

export default function Container({ as: Tag = 'div', className, children }) {
  return (
    <Tag className={cn('mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12', className)}>
      {children}
    </Tag>
  )
}
