import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

/**
 * Gates routes that require an authenticated user. While the persisted token is
 * still being validated on load, render nothing to avoid a redirect flash.
 * Unauthenticated users are sent to /login.
 */
export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isInitializing = useAuthStore((s) => s.isInitializing)

  if (isInitializing) return null
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
