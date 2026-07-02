import { api } from './api'
import type { ApiResponse, User } from '../types'
import type { LoginValues, RegisterValues } from '../utils/validation'

interface AuthResult {
  user: User
  token: string
}

interface AdminAuthResult {
  admin: { id: string; email: string; name: string; createdAt: string; updatedAt: string }
  token: string
}

export async function loginRequest(values: LoginValues): Promise<AuthResult> {
  const { data } = await api.post<ApiResponse<AuthResult>>('/auth/login', values)
  return data.data
}

/** Admin login (separate Admin account table). */
export async function adminLoginRequest(values: LoginValues): Promise<AdminAuthResult> {
  const { data } = await api.post<ApiResponse<AdminAuthResult>>('/auth/admin/login', values)
  return data.data
}

export async function registerRequest(values: RegisterValues): Promise<AuthResult> {
  const payload = {
    name: values.name,
    email: values.email,
    password: values.password,
    ...(values.phone ? { phone: values.phone } : {}),
  }
  const { data } = await api.post<ApiResponse<AuthResult>>('/auth/register', payload)
  return data.data
}

/**
 * Request a password reset link. The backend always responds 200 with the same
 * generic message whether or not the email is registered (anti-enumeration), so
 * this resolves without indicating whether an account was found.
 */
export async function forgotPasswordRequest(email: string): Promise<void> {
  await api.post<ApiResponse<null>>('/auth/forgot-password', { email })
}

/** Complete a password reset with the emailed token and a new password. */
export async function resetPasswordRequest(token: string, newPassword: string): Promise<void> {
  await api.post<ApiResponse<null>>('/auth/reset-password', { token, newPassword })
}
