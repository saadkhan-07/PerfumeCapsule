import { describe, it, expect, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routes } from './index'
import { useAuthStore } from '../store/authStore'
import { api } from '../services/api'
import type { AuthUser } from '../types'

const adminUser: AuthUser = {
  id: 'a1', name: 'Admin', email: 'a@x.com', role: 'admin', createdAt: '', updatedAt: '',
}
const customer: AuthUser = {
  id: 'u1', name: 'Customer', email: 'c@x.com', phone: null, role: 'user',
  createdAt: '', updatedAt: '',
}

/** Mount the real route tree at `path`; returns the router so tests can read the
 *  resulting location (robust against page copy changes). */
function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return router
}

const pathAfterRender = (router: ReturnType<typeof renderAt>) => router.state.location.pathname

beforeEach(() => {
  useAuthStore.setState({
    user: null, token: null, isAuthenticated: false, isInitializing: false,
  })
  localStorage.clear()
})

describe('ProtectedRoute', () => {
  it('redirects an unauthenticated user from /wishlist to /login', async () => {
    const router = renderAt('/wishlist')
    await waitFor(() => expect(pathAfterRender(router)).toBe('/login'))
  })

  it('redirects an unauthenticated user from /checkout to /login', async () => {
    const router = renderAt('/checkout')
    await waitFor(() => expect(pathAfterRender(router)).toBe('/login'))
  })

  it('allows an authenticated user to reach /orders', async () => {
    useAuthStore.setState({ user: customer, token: 't', isAuthenticated: true })
    const router = renderAt('/orders')
    await waitFor(() => expect(pathAfterRender(router)).toBe('/orders'))
  })
})

describe('AdminRoute', () => {
  it('redirects an authenticated non-admin from /admin to / (home)', async () => {
    useAuthStore.setState({ user: customer, token: 't', isAuthenticated: true })
    const router = renderAt('/admin')
    await waitFor(() => expect(pathAfterRender(router)).toBe('/'))
  })

  it('redirects an unauthenticated user from /admin to /login', async () => {
    const router = renderAt('/admin')
    await waitFor(() => expect(pathAfterRender(router)).toBe('/login'))
  })

  it('allows an admin to reach /admin', async () => {
    useAuthStore.setState({ user: adminUser, token: 't', isAuthenticated: true })
    const router = renderAt('/admin')
    await waitFor(() => expect(pathAfterRender(router)).toBe('/admin'))
  })
})

describe('public routes', () => {
  it('keeps an anonymous visitor on / (home)', () => {
    const router = renderAt('/')
    expect(pathAfterRender(router)).toBe('/')
  })

  it('keeps an anonymous visitor on /shop (catalog)', () => {
    const router = renderAt('/shop')
    expect(pathAfterRender(router)).toBe('/shop')
  })
})

describe('auth store persistence', () => {
  it('persists the token to localStorage on login (survives a refresh)', () => {
    useAuthStore.getState().login(customer, 'jwt-token-123')
    const persisted = JSON.parse(localStorage.getItem('pc-auth') ?? '{}')
    expect(persisted.state.token).toBe('jwt-token-123')
    expect(persisted.state.isAuthenticated).toBe(true)
    expect(persisted.state.user.role).toBe('user')
  })

  it('clears auth state on logout', () => {
    useAuthStore.getState().login(customer, 'jwt-token-123')
    useAuthStore.getState().logout()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(useAuthStore.getState().token).toBeNull()
  })
})

describe('axios JWT interceptor', () => {
  type Handler = { fulfilled: (c: { headers: Record<string, string> }) => { headers: Record<string, string> } }
  const requestHandler = () => (api.interceptors.request as unknown as { handlers: Handler[] }).handlers[0]

  it('attaches Authorization: Bearer <token> when a token is present', () => {
    useAuthStore.setState({ token: 'jwt-abc' })
    const config = requestHandler().fulfilled({ headers: {} })
    expect(config.headers.Authorization).toBe('Bearer jwt-abc')
  })

  it('omits Authorization when no token is present', () => {
    useAuthStore.setState({ token: null })
    const config = requestHandler().fulfilled({ headers: {} })
    expect(config.headers.Authorization).toBeUndefined()
  })
})
