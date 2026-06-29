import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

/**
 * Gates admin-only routes. Unauthenticated users go to /login; authenticated
 * non-admins are sent to the home page.
 */
export function AdminRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isInitializing = useAuthStore((s) => s.isInitializing)
  const user = useAuthStore((s) => s.user)

  if (isInitializing) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return user?.role === 'admin' ? <Outlet /> : <Navigate to="/" replace />
}
