import { api } from './api'
import type { ApiResponse, User } from '../types'
import type { LoginValues, RegisterValues } from '../utils/validation'

interface AuthResult {
  user: User
  token: string
}

export async function loginRequest(values: LoginValues): Promise<AuthResult> {
  const { data } = await api.post<ApiResponse<AuthResult>>('/auth/login', values)
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
