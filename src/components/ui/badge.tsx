import { cn } from '@/lib/utils'
import { forwardRef, HTMLAttributes } from 'react'

export const Badge = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
        className
      )}
      {...props}
    />
  )
)
Badge.displayName = 'Badge'
