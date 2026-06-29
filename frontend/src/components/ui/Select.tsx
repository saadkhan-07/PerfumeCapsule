import { forwardRef } from 'react'
import type { SelectHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  children: ReactNode
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, className, id, name, children, ...rest },
  ref,
) {
  const selectId = id ?? name
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        name={name}
        className={cn(
          'h-11 w-full rounded-lg border bg-white px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10',
          error ? 'border-red-400' : 'border-neutral-300 focus:border-neutral-900',
          className,
        )}
        {...rest}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
})
