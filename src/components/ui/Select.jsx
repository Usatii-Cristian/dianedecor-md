import { ChevronDown } from 'lucide-react'

import { fieldClasses } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

export default function Select({ className, children, ...props }) {
  return (
    <span className="relative block">
      <select className={cn(fieldClasses, 'appearance-none pr-8', className)} {...props}>
        {children}
      </select>
      <ChevronDown
        size={18}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 text-muted"
      />
    </span>
  )
}
