import { cn } from '@/lib/utils'
import { forwardRef, InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type = 'text', ...props }, ref) => (
    <div className="w-full">
      <input
        ref={ref}
        type={type}
        className={cn(
          'w-full rounded-lg border border-gray-300 px-4 py-3',
          'text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
)
Input.displayName = 'Input'
