import { Link, useNavigate } from 'react-router-dom'
import { useCartStore, selectCartSubtotal } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { formatPKR } from '../utils/format'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/common/EmptyState'
import { QuantityStepper } from '../components/common/QuantityStepper'

export function CartPage() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const subtotal = useCartStore(selectCartSubtotal)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const proceedToCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } })
      return
    }
    navigate('/checkout')
  }

  if (items.length === 0) {
    return (
      <PageWrapper>
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">Your cart</h1>
        <EmptyState
          title="Your cart is empty"
          message="Browse our collection and add a few decants."
          action={
            <Link to="/shop">
              <Button>Continue shopping</Button>
            </Link>
          }
        />
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Your cart</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Line items */}
        <ul className="space-y-4 lg:col-span-2">
          {items.map(({ product, variant, quantity }) => {
            const image = product.images?.[0]?.url
            const lineTotal = Number(variant.price) * quantity
            return (
              <li
                key={variant.id}
                className="flex gap-4 rounded-xl border border-neutral-200 bg-white p-3 sm:p-4"
              >
                <Link
                  to={`/shop/${product.id}`}
                  className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100 sm:h-24 sm:w-24"
                >
                  {image ? (
                    <img src={image} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-neutral-300">
                      No image
                    </div>
                  )}
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wide text-neutral-400">
                        {product.brand?.name}
                      </p>
                      <Link
                        to={`/shop/${product.id}`}
                        className="block truncate text-sm font-medium text-neutral-900 hover:underline"
                      >
                        {product.name}
                      </Link>
                      <p className="mt-0.5 text-sm text-neutral-500">Size: {variant.size}</p>
                      <p className="mt-0.5 text-sm text-neutral-500">{formatPKR(variant.price)} each</p>
                    </div>
                    <p className="whitespace-nowrap text-sm font-semibold text-neutral-900">
                      {formatPKR(lineTotal)}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <QuantityStepper
                      value={quantity}
                      onChange={(q) => updateQuantity(variant.id, q)}
                      max={variant.stock}
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(variant.id)}
                      className="text-sm text-neutral-500 transition-colors hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>

        {/* Summary */}
        <aside className="h-fit rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="text-base font-semibold text-neutral-900">Order summary</h2>
          <div className="mt-4 flex justify-between text-sm">
            <span className="text-neutral-500">Subtotal</span>
            <span className="font-medium text-neutral-900">{formatPKR(subtotal)}</span>
          </div>
          <p className="mt-1 text-xs text-neutral-400">
            Shipping is calculated at checkout.
          </p>
          <Button fullWidth className="mt-5" onClick={proceedToCheckout}>
            Proceed to checkout
          </Button>
          <Link
            to="/shop"
            className="mt-3 block text-center text-sm text-neutral-500 hover:text-neutral-900"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </PageWrapper>
  )
}
