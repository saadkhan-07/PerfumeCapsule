import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  message?: string
  action?: ReactNode
}

export function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 px-6 py-16 text-center">
      <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
      {message && <p className="mt-1 max-w-sm text-sm text-neutral-500">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
