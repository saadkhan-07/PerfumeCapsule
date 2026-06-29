import axios from 'axios'
import { useAuthStore } from '../store/authStore'

/**
 * Central Axios instance. baseURL comes from VITE_API_URL (includes the /api
 * prefix), so callers use bare paths like `api.get('/auth/me')`.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

// Request: attach the JWT (read from the persisted auth store) as a Bearer token.
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response: on 401, clear auth state and bounce the user to /login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  },
)
