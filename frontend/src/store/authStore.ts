import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ApiResponse, AuthUser, Role } from '../types'
import { api } from '../services/api'

interface MeResponse {
  role: Role
  account: Omit<AuthUser, 'role'>
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  /** True until the persisted token has been validated against the API on load. */
  isInitializing: boolean

  login: (user: AuthUser, token: string) => void
  logout: () => void
  /** Validate a persisted token via GET /auth/me; restore or clear accordingly. */
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isInitializing: true,

      login: (user, token) => set({ user, token, isAuthenticated: true }),

      logout: () => set({ user: null, token: null, isAuthenticated: false }),

      initialize: async () => {
        const { token } = get()
        if (!token) {
          set({ isInitializing: false })
          return
        }
        try {
          const { data } = await api.get<ApiResponse<MeResponse>>('/auth/me')
          const { role, account } = data.data
          set({
            user: { ...account, role },
            isAuthenticated: true,
            isInitializing: false,
          })
        } catch {
          // Invalid or expired token — clear everything.
          set({ user: null, token: null, isAuthenticated: false, isInitializing: false })
        }
      },
    }),
    {
      name: 'pc-auth',
      // Persist only what's needed to restore a session; isInitializing is runtime-only.
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
