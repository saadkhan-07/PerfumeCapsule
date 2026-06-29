import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { RootLayout } from '../components/layout/RootLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { AdminRoute } from './AdminRoute'

import { HomePage } from '../pages/HomePage'
import { CatalogPage } from '../pages/CatalogPage'
import { ProductDetailPage } from '../pages/ProductDetailPage'
import { CartPage } from '../pages/CartPage'
import { CheckoutPage } from '../pages/CheckoutPage'
import { OrderConfirmationPage } from '../pages/OrderConfirmationPage'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { WishlistPage } from '../pages/WishlistPage'
import { OrderHistoryPage } from '../pages/OrderHistoryPage'
import { AdminDashboardPage } from '../pages/AdminDashboardPage'
import { AdminProductsPage } from '../pages/AdminProductsPage'
import { AdminOrdersPage } from '../pages/AdminOrdersPage'
import { NotFoundPage } from '../pages/NotFoundPage'

/**
 * Application route tree. Every route renders inside RootLayout (navbar/footer).
 * Protected and admin groups are wrapped by their respective guard elements.
 */
/** Route tree, exported separately so tests can mount it with a memory router. */
export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      // Public
      { index: true, element: <HomePage /> },
      { path: 'shop', element: <CatalogPage /> },
      { path: 'shop/:productId', element: <ProductDetailPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },

      // Protected (requires login)
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'checkout', element: <CheckoutPage /> },
          { path: 'order-confirmation', element: <OrderConfirmationPage /> },
          { path: 'wishlist', element: <WishlistPage /> },
          { path: 'orders', element: <OrderHistoryPage /> },
        ],
      },

      // Admin (requires isAdmin)
      {
        element: <AdminRoute />,
        children: [
          { path: 'admin', element: <AdminDashboardPage /> },
          { path: 'admin/products', element: <AdminProductsPage /> },
          { path: 'admin/orders', element: <AdminOrdersPage /> },
        ],
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
]

export const router = createBrowserRouter(routes)
