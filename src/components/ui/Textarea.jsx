import { fieldClasses } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

export default function Textarea({ className, rows = 5, ...props }) {
  return <textarea rows={rows} className={cn(fieldClasses, 'h-auto py-3', className)} {...props} />
}
