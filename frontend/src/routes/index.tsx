import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { RootLayout } from '../components/layout/RootLayout'
import { AdminLayout } from '../components/layout/AdminLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { AdminRoute } from './AdminRoute'

import { HomePage } from '../pages/HomePage'
import { CatalogPage } from '../pages/CatalogPage'
import { ProductDetailPage } from '../pages/ProductDetailPage'
import { CartPage } from '../pages/CartPage'
import { CheckoutPage } from '../pages/CheckoutPage'
import { OrderConfirmationPage } from '../pages/OrderConfirmationPage'
import { TrackOrderPage } from '../pages/TrackOrderPage'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { WishlistPage } from '../pages/WishlistPage'
import { OrderHistoryPage } from '../pages/OrderHistoryPage'
import { AdminDashboardPage } from '../pages/AdminDashboardPage'
import { AdminBrandsPage } from '../pages/AdminBrandsPage'
import { AdminCategoriesPage } from '../pages/AdminCategoriesPage'
import { AdminProductsPage } from '../pages/AdminProductsPage'
import { AdminProductFormPage } from '../pages/AdminProductFormPage'
import { AdminOrdersPage } from '../pages/AdminOrdersPage'
import { AdminOrderDetailPage } from '../pages/AdminOrderDetailPage'
import { AdminSettingsPage } from '../pages/AdminSettingsPage'
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
      // Checkout & confirmation are public to support guest checkout. The page
      // itself offers a guest-or-login choice when the visitor is unauthenticated.
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'order-confirmation', element: <OrderConfirmationPage /> },
      { path: 'track-order', element: <TrackOrderPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },

      // Protected (requires login)
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'wishlist', element: <WishlistPage /> },
          { path: 'orders', element: <OrderHistoryPage /> },
        ],
      },

      // Admin (requires isAdmin) — all pages share the AdminLayout sidebar.
      {
        element: <AdminRoute />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { path: 'admin', element: <AdminDashboardPage /> },
              { path: 'admin/brands', element: <AdminBrandsPage /> },
              { path: 'admin/categories', element: <AdminCategoriesPage /> },
              { path: 'admin/products', element: <AdminProductsPage /> },
              { path: 'admin/products/new', element: <AdminProductFormPage /> },
              { path: 'admin/products/:id', element: <AdminProductFormPage /> },
              { path: 'admin/orders', element: <AdminOrdersPage /> },
              { path: 'admin/orders/:id', element: <AdminOrderDetailPage /> },
              { path: 'admin/settings', element: <AdminSettingsPage /> },
            ],
          },
        ],
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
]

export const router = createBrowserRouter(routes)
