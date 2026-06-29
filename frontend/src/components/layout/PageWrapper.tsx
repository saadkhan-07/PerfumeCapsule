import type { ReactNode } from 'react'

interface PageWrapperProps {
  children: ReactNode
  className?: string
}

/**
 * Constrains page content to a consistent max width with responsive padding.
 * Pages render their content inside this for uniform layout.
 */
export function PageWrapper({ children, className = '' }: PageWrapperProps) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  )
}
