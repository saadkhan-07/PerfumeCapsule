import { useState } from 'react'
import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
} from '@headlessui/react'
import { PAKISTAN_CITIES } from '../../utils/pakistanCities'
import { cn } from '../../utils/cn'

interface CityComboboxProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

/**
 * Searchable city picker built on Headless UI's Combobox. The form value is only
 * ever set by SELECTING an option, so a free-typed string that doesn't match a
 * known city never becomes the form value (the typed text lives in local `query`
 * state and the input snaps back to the selected value on close). Styled to match
 * the shared `Input` component.
 */
export function CityCombobox({ value, onChange, error }: CityComboboxProps) {
  const [query, setQuery] = useState('')

  // Case-insensitive, matches anywhere in the name (not just the start).
  const filtered =
    query.trim() === ''
      ? PAKISTAN_CITIES
      : PAKISTAN_CITIES.filter((c) => c.toLowerCase().includes(query.trim().toLowerCase()))

  return (
    <div className="w-full">
      <label className="mb-1.5 block text-sm font-medium text-neutral-700">City</label>
      <Combobox
        immediate
        value={value || null}
        onChange={(v: string | null) => onChange(v ?? '')}
      >
        <div className="relative">
          <ComboboxInput
            className={cn(
              'h-11 w-full rounded-lg border bg-white px-3 pr-9 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10',
              error
                ? 'border-red-400 focus:border-red-500'
                : 'border-neutral-300 focus:border-neutral-900',
            )}
            placeholder="Search for your city..."
            autoComplete="off"
            displayValue={(v: string | null) => v ?? ''}
            onChange={(e) => setQuery(e.target.value)}
          />
          <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400">
            ▾
          </ComboboxButton>
          <ComboboxOptions className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-neutral-200 bg-white py-1 shadow-lg focus:outline-none">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-neutral-400">No cities found</div>
            ) : (
              filtered.map((city) => (
                <ComboboxOption
                  key={city}
                  value={city}
                  className={({ focus, selected }) =>
                    cn(
                      'cursor-pointer px-3 py-2 text-sm',
                      focus ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-700',
                      selected && 'font-medium text-neutral-900',
                    )
                  }
                >
                  {city}
                </ComboboxOption>
              ))
            )}
          </ComboboxOptions>
        </div>
      </Combobox>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
