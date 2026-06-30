import { Link } from 'react-router-dom'
import { useMyOrders } from '../hooks/useMyOrders'
import { PageWrapper } from '../components/layout/PageWrapper'
import { EmptyState } from '../components/common/EmptyState'
import { OrderSummaryCard } from '../components/common/OrderSummaryCard'
import { Skeleton } from '../components/ui/Skeleton'
import { Button } from '../components/ui/Button'

export function OrderHistoryPage() {
  const { data: orders, isLoading, isError } = useMyOrders()

  return (
    <PageWrapper>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">My Orders</h1>

      {isError ? (
        <EmptyState title="Couldn’t load your orders" message="Please try again in a moment." />
      ) : isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : !orders || orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          message="When you place an order, it will appear here."
          action={
            <Link to="/shop">
              <Button>Start shopping</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4 pb-12">
          {orders.map((order) => (
            <OrderSummaryCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </PageWrapper>
  )
}
