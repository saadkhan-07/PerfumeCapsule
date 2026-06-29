import axios from 'axios'
import type { ApiResponse } from '../types'

interface FieldError {
  field?: string
  message?: string
}

/**
 * Extracts a user-friendly message from an Axios error using the backend's
 * standard envelope ({ message, errors[] }). Falls back to a generic message —
 * raw error objects are never shown to users.
 */
export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiResponse<unknown> | undefined
    const firstFieldError = data?.errors?.[0] as FieldError | undefined
    if (firstFieldError?.message) return firstFieldError.message
    if (data?.message) return data.message
    if (!error.response) return 'Cannot reach the server. Check your connection and try again.'
  }
  return fallback
}
