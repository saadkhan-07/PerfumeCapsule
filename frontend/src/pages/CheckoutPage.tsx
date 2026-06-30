import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { checkoutSchema, type CheckoutValues } from '../utils/validation'
import { useCartStore, selectCartSubtotal } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { useSettings } from '../hooks/useSettings'
import { useCreateOrder } from '../hooks/useCreateOrder'
import { openWhatsApp } from '../utils/whatsapp'
import { getApiErrorMessage } from '../utils/apiError'
import { formatPKR } from '../utils/format'
import { calculateShippingFee } from '../utils/shipping'
import { cn } from '../utils/cn'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { EmptyState } from '../components/common/EmptyState'
import { InlineSignIn } from '../features/checkout/InlineSignIn'
import { CityCombobox } from '../features/checkout/CityCombobox'
import { CheckoutSummary } from '../features/checkout/CheckoutSummary'

// Business payment accounts (placeholder — update with the real account details).
// Payment is always confirmed manually via WhatsApp; there is no method selection.
const PAYMENT_ACCOUNTS = [
  { label: 'JazzCash', name: 'Perfume Capsules', account: '0300-XXXXXXX' },
  { label: 'EasyPaisa', name: 'Perfume Capsules', account: '0345-XXXXXXX' },
]

/** Splits a stored full name into first + remaining (last) for the two name fields. */
function splitName(name?: string | null): { first: string; last: string } {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean)
  return { first: parts[0] ?? '', last: parts.slice(1).join(' ') }
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-base font-semibold text-neutral-900">{children}</h2>
}

export function CheckoutPage() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const subtotal = useCartStore(selectCartSubtotal)
  const clearCart = useCartStore((s) => s.clearCart)
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { data: settings } = useSettings()
  const createOrder = useCreateOrder()

  const [agreed, setAgreed] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const [showSignIn, setShowSignIn] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const initialName = splitName(user?.name)
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    control,
    formState: { errors },
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      contact: user?.email ?? '',
      firstName: initialName.first,
      lastName: initialName.last,
      address: '',
      city: '',
      phone: user?.phone ?? '',
    },
  })

  // When a guest logs in via the inline panel, fill any still-empty fields from
  // their account (never clobbering something they've already typed).
  useEffect(() => {
    if (!user) return
    const { first, last } = splitName(user.name)
    if (!getValues('contact') && user.email) setValue('contact', user.email)
    if (!getValues('firstName') && first) setValue('firstName', first)
    if (!getValues('lastName') && last) setValue('lastName', last)
    if (!getValues('phone') && user.phone) setValue('phone', user.phone)
  }, [user, getValues, setValue])

  // Live shipping preview, mirroring the backend. Null until a city is selected
  // and settings are loaded — the summary shows "Select a city" in that case.
  const selectedCity = watch('city')
  const shippingFee =
    settings && selectedCity ? calculateShippingFee(subtotal, selectedCity, settings) : null
  const total = shippingFee === null ? subtotal : subtotal + shippingFee

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

  const placeOrder = handleSubmit(async (values) => {
    if (!agreed) return
    setSubmitError(null)
    const customerName = `${values.firstName} ${values.lastName}`.trim()
    try {
      const order = await createOrder.mutateAsync({
        items: items.map((i) => ({ variantId: i.variant.id, quantity: i.quantity })),
        shippingInfo: {
          name: customerName,
          phone: values.phone,
          address: values.address,
          city: values.city,
        },
        // No method selection in this single-path flow; confirmed via WhatsApp.
        paymentMethod: 'JAZZCASH',
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

      {/* Mobile: collapsible order summary ABOVE the form (collapsed shows total only). */}
      <div className="mt-4 lg:hidden">
        <button
          type="button"
          onClick={() => setSummaryOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm"
          aria-expanded={summaryOpen}
        >
          <span className="font-medium text-neutral-900">
            Order summary
            <span className="ml-1 text-neutral-400">{summaryOpen ? '▲' : '▼'}</span>
          </span>
          <span className="font-semibold text-neutral-900">{formatPKR(total)}</span>
        </button>
        {summaryOpen && (
          <div className="mt-3">
            <CheckoutSummary items={items} subtotal={subtotal} shippingFee={shippingFee} total={total} />
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* LEFT — form (scrolls normally) */}
        <form onSubmit={placeOrder} noValidate className="space-y-8 lg:col-span-3">
          {/* Contact */}
          <section>
            <div className="flex items-center justify-between gap-3">
              <SectionTitle>Contact</SectionTitle>
              {isAuthenticated ? (
                <span className="truncate text-sm text-neutral-500">
                  Logged in as <span className="text-neutral-900">{user?.email}</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSignIn((v) => !v)}
                  className="text-sm font-medium text-neutral-900 underline underline-offset-2"
                >
                  Sign in
                </button>
              )}
            </div>

            {!isAuthenticated && showSignIn && (
              <InlineSignIn onSuccess={() => setShowSignIn(false)} />
            )}

            <div className="mt-4">
              <Input
                label="Email or phone number"
                autoComplete="email"
                error={errors.contact?.message}
                {...register('contact')}
              />
            </div>
            <label className="mt-3 flex items-center gap-2 text-sm text-neutral-600">
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
                className="h-4 w-4 accent-neutral-900"
              />
              Email me with news and offers
            </label>
          </section>

          {/* Delivery */}
          <section>
            <SectionTitle>Delivery</SectionTitle>
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="First name" error={errors.firstName?.message} {...register('firstName')} />
                <Input label="Last name" error={errors.lastName?.message} {...register('lastName')} />
              </div>
              <Input label="Address" error={errors.address?.message} {...register('address')} />
              <Controller
                name="city"
                control={control}
                render={({ field, fieldState }) => (
                  <CityCombobox
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <Input
                label="Phone"
                type="tel"
                placeholder="03001234567"
                error={errors.phone?.message}
                {...register('phone')}
              />
            </div>
          </section>

          {/* Payment */}
          <section>
            <SectionTitle>Payment</SectionTitle>
            <p className="mt-1 text-sm text-neutral-500">
              Payment is confirmed via WhatsApp after your order is placed.
            </p>
            <div className="mt-4 space-y-3">
              {PAYMENT_ACCOUNTS.map((acc) => (
                <div
                  key={acc.label}
                  className="rounded-lg border border-neutral-200 p-4 text-sm"
                >
                  <p className="font-medium text-neutral-900">{acc.label}</p>
                  <p className="text-neutral-500">
                    {acc.name} · {acc.account}
                  </p>
                </div>
              ))}
            </div>

            <label className="mt-5 flex items-start gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-neutral-900"
              />
              I understand, place my order
            </label>
          </section>

          {submitError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {submitError}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            fullWidth
            disabled={!agreed}
            isLoading={createOrder.isPending}
          >
            Place Order
          </Button>
        </form>

        {/* RIGHT — sticky summary (desktop only) */}
        <aside className={cn('hidden lg:col-span-2 lg:block')}>
          <div className="lg:sticky lg:top-24">
            <CheckoutSummary items={items} subtotal={subtotal} shippingFee={shippingFee} total={total} />
          </div>
        </aside>
      </div>
    </PageWrapper>
  )
}
