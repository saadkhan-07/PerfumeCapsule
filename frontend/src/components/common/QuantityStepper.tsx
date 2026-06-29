import { cn } from '../../utils/cn'

interface QuantityStepperProps {
  value: number
  onChange: (next: number) => void
  min?: number
  max?: number
}

export function QuantityStepper({ value, onChange, min = 1, max }: QuantityStepperProps) {
  const atMin = value <= min
  const atMax = max !== undefined && value >= max

  const btn = 'flex h-9 w-9 items-center justify-center text-lg text-neutral-700 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-300'

  return (
    <div className="inline-flex items-center rounded-lg border border-neutral-300">
      <button
        type="button"
        aria-label="Decrease quantity"
        className={cn(btn, 'rounded-l-lg')}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={atMin}
      >
        −
      </button>
      <span className="w-10 text-center text-sm font-medium tabular-nums">{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        className={cn(btn, 'rounded-r-lg')}
        onClick={() => onChange(max !== undefined ? Math.min(max, value + 1) : value + 1)}
        disabled={atMax}
      >
        +
      </button>
    </div>
  )
}
