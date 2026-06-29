import { Link, useLocation } from 'react-router-dom'
import type { Order } from '../types'
import { formatPKR } from '../utils/format'
import { openWhatsApp } from '../utils/whatsapp'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Button } from '../components/ui/Button'

export function OrderConfirmationPage() {
  const location = useLocation()
  const order = (location.state as { order?: Order } | null)?.order

  return (
    <PageWrapper>
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
          ✓
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">Order placed!</h1>

        {order ? (
          <>
            <p className="mt-2 text-sm text-neutral-500">
              Order <span className="font-medium text-neutral-900">#{order.id}</span> has been saved.
              We’ve opened WhatsApp so you can confirm it with us.
            </p>

            <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-5 text-left text-sm">
              <div className="flex justify-between py-1">
                <span className="text-neutral-500">Subtotal</span>
                <span className="text-neutral-900">{formatPKR(order.subtotal)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-neutral-500">Shipping</span>
                <span className="text-neutral-900">{formatPKR(order.shippingFee)}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-neutral-100 pt-2 font-semibold">
                <span>Total</span>
                <span>{formatPKR(order.total)}</span>
              </div>
            </div>

            <p className="mt-4 text-xs text-neutral-400">
              If WhatsApp didn’t open, tap the button below.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button onClick={() => openWhatsApp(order)}>Open WhatsApp</Button>
              <Link to="/shop">
                <Button variant="outline" fullWidth>
                  Continue shopping
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-neutral-500">Thank you for your order.</p>
            <Link to="/shop" className="mt-6 inline-block">
              <Button>Continue shopping</Button>
            </Link>
          </>
        )}
      </div>
    </PageWrapper>
  )
}
