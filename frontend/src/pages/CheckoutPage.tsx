import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { shippingSchema, type ShippingValues } from '../utils/validation'
import { useCartStore, selectCartSubtotal } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { useCreateOrder } from '../hooks/useCreateOrder'
import { openWhatsApp } from '../utils/whatsapp'
import { getApiErrorMessage } from '../utils/apiError'
import { formatPKR } from '../utils/format'
import type { PaymentMethod } from '../types'
import { cn } from '../utils/cn'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { EmptyState } from '../components/common/EmptyState'

// Business payment accounts (placeholder — update with the real account details).
const PAYMENT_ACCOUNTS: Record<PaymentMethod, { label: string; account: string; name: string }> = {
  JAZZCASH: { label: 'JazzCash', account: '0300-XXXXXXX', name: 'Perfume Capsules' },
  EASYPAISA: { label: 'EasyPaisa', account: '0345-XXXXXXX', name: 'Perfume Capsules' },
}

const STEPS = ['Review', 'Shipping', 'Payment'] as const

export function CheckoutPage() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const subtotal = useCartStore(selectCartSubtotal)
  const clearCart = useCartStore((s) => s.clearCart)
  const user = useAuthStore((s) => s.user)
  const createOrder = useCreateOrder()

  const [step, setStep] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('JAZZCASH')
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<ShippingValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: { name: user?.name ?? '', phone: user?.phone ?? '', address: '', city: '' },
  })

  if (items.length === 0 && !createOrder.isSuccess) {
    return (
      <PageWrapper>
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">Checkout</h1>
        <EmptyState
          title="Your cart is empty"
          message="Add some products before checking out."
          action={
            <Link to="/shop">
              <Button>Browse products</Button>
            </Link>
          }
        />
      </PageWrapper>
    )
  }

  const goToPayment = async () => {
    const valid = await trigger()
    if (valid) setStep(2)
  }

  const placeOrder = handleSubmit(async (shipping) => {
    setSubmitError(null)
    try {
      const order = await createOrder.mutateAsync({
        items: items.map((i) => ({ variantId: i.variant.id, quantity: i.quantity })),
        shippingInfo: shipping,
        paymentMethod,
      })
      clearCart()
      openWhatsApp(order)
      navigate('/order-confirmation', { state: { order } })
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, 'Could not place your order. Please try again.'))
    }
  })

  return (
    <PageWrapper>
      <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>

      {/* Stepper */}
      <ol className="mt-4 mb-8 flex items-center gap-2 text-sm">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
                i <= step ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-500',
              )}
            >
              {i + 1}
            </span>
            <span className={cn(i === step ? 'font-medium text-neutral-900' : 'text-neutral-400')}>
              {label}
            </span>
            {i < STEPS.length - 1 && <span className="mx-1 text-neutral-300">→</span>}
          </li>
        ))}
      </ol>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* STEP 1 — Review */}
          {step === 0 && (
            <section className="rounded-xl border border-neutral-200 bg-white p-5">
              <h2 className="text-base font-semibold">Order review</h2>
              <ul className="mt-4 divide-y divide-neutral-100">
                {items.map(({ product, variant, quantity }) => (
                  <li key={variant.id} className="flex justify-between gap-3 py-3 text-sm">
                    <span className="text-neutral-700">
                      {product.name}{' '}
                      <span className="text-neutral-400">
                        ({variant.size}) × {quantity}
                      </span>
                    </span>
                    <span className="font-medium text-neutral-900">
                      {formatPKR(Number(variant.price) * quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <Button className="mt-6" onClick={() => setStep(1)}>
                Continue to shipping
              </Button>
            </section>
          )}

          {/* STEPS 2 & 3 share one form */}
          <form onSubmit={placeOrder} noValidate className={step === 0 ? 'hidden' : ''}>
            {/* STEP 2 — Shipping */}
            <section className={cn('rounded-xl border border-neutral-200 bg-white p-5', step !== 1 && 'hidden')}>
              <h2 className="text-base font-semibold">Shipping information</h2>
              <div className="mt-4 space-y-4">
                <Input label="Full name" error={errors.name?.message} {...register('name')} />
                <Input
                  label="Phone number"
                  type="tel"
                  placeholder="03001234567"
                  error={errors.phone?.message}
                  {...register('phone')}
                />
                <Input label="Street address" error={errors.address?.message} {...register('address')} />
                <Input label="City" error={errors.city?.message} {...register('city')} />
              </div>
              <div className="mt-6 flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(0)}>
                  Back
                </Button>
                <Button type="button" onClick={goToPayment}>
                  Continue to payment
                </Button>
              </div>
            </section>

            {/* STEP 3 — Payment */}
            <section className={cn('rounded-xl border border-neutral-200 bg-white p-5', step !== 2 && 'hidden')}>
              <h2 className="text-base font-semibold">Payment instructions</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Pay manually after we confirm your order on WhatsApp. Choose your method:
              </p>

              <div className="mt-4 space-y-3">
                {(Object.keys(PAYMENT_ACCOUNTS) as PaymentMethod[]).map((method) => {
                  const acc = PAYMENT_ACCOUNTS[method]
                  const selected = paymentMethod === method
                  return (
                    <label
                      key={method}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors',
                        selected ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200',
                      )}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method}
                        checked={selected}
                        onChange={() => setPaymentMethod(method)}
                        className="accent-neutral-900"
                      />
                      <span className="flex-1">
                        <span className="block text-sm font-medium text-neutral-900">{acc.label}</span>
                        <span className="block text-sm text-neutral-500">
                          {acc.name} · {acc.account}
                        </span>
                      </span>
                    </label>
                  )
                })}
              </div>

              {submitError && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="submit" isLoading={createOrder.isPending}>
                  I understand, place my order
                </Button>
              </div>
            </section>
          </form>
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="text-base font-semibold text-neutral-900">Summary</h2>
          <div className="mt-4 flex justify-between text-sm">
            <span className="text-neutral-500">Subtotal</span>
            <span className="font-medium text-neutral-900">{formatPKR(subtotal)}</span>
          </div>
          <p className="mt-1 text-xs text-neutral-400">
            Final shipping is added by the server when your order is placed.
          </p>
        </aside>
      </div>
    </PageWrapper>
  )
}
