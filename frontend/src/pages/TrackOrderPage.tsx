import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { trackOrderSchema, type TrackOrderValues } from '../utils/validation'
import { lookupOrder } from '../services/orders.service'
import { getApiErrorMessage } from '../utils/apiError'
import type { Order } from '../types'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { OrderSummaryCard } from '../components/common/OrderSummaryCard'

// Shown for any failed lookup. Deliberately generic — never reveal whether the
// order id or the phone was the mismatch (prevents enumeration).
const NOT_FOUND_MESSAGE =
  "We couldn't find an order matching those details. Please check your Order ID and phone number."

export function TrackOrderPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TrackOrderValues>({ resolver: zodResolver(trackOrderSchema) })

  const lookup = useMutation<Order, unknown, TrackOrderValues>({
    mutationFn: ({ orderId, phone }) => lookupOrder(orderId.trim(), phone.trim()),
  })

  const onSubmit = handleSubmit((values) => lookup.mutate(values))

  // Rate-limit hits get their own message; everything else is the generic
  // not-found text so we don't leak which field was wrong.
  const errorMessage = lookup.isError
    ? axios.isAxiosError(lookup.error) && lookup.error.response?.status === 429
      ? getApiErrorMessage(lookup.error)
      : NOT_FOUND_MESSAGE
    : null

  return (
    <PageWrapper>
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-semibold tracking-tight">Track your order</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Enter your Order ID and the phone number used at checkout.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          <Input
            label="Order ID"
            placeholder="e.g. clx123abc456..."
            error={errors.orderId?.message}
            {...register('orderId')}
          />
          <Input
            label="Phone number"
            type="tel"
            placeholder="03001234567"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <Button type="submit" fullWidth isLoading={lookup.isPending}>
            Track Order
          </Button>
        </form>

        {errorMessage && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {lookup.isSuccess && (
          <div className="mt-8">
            <OrderSummaryCard order={lookup.data} />
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
