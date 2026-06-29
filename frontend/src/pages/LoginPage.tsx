import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { loginSchema, type LoginValues } from '../utils/validation'
import { loginRequest, adminLoginRequest } from '../services/auth.service'
import { useAuthStore } from '../store/authStore'
import { getApiErrorMessage } from '../utils/apiError'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  // Return to where the user was headed (set by the route guards) or /shop.
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/shop'

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      const { user, token } = await loginRequest(values)
      login({ ...user, role: 'user' }, token)
      navigate(redirectTo, { replace: true })
    } catch (customerError) {
      // Not a customer account — try the admin login before giving up.
      try {
        const { admin, token } = await adminLoginRequest(values)
        login({ ...admin, phone: null, role: 'admin' }, token)
        navigate('/admin', { replace: true })
      } catch {
        setFormError(getApiErrorMessage(customerError, 'Invalid email or password'))
      }
    }
  })

  return (
    <PageWrapper>
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-sm text-neutral-500">Log in to continue shopping.</p>

        {formError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {formError}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <Button type="submit" fullWidth isLoading={isSubmitting}>
            Log in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          No account?{' '}
          <Link to="/register" className="font-medium text-neutral-900 underline">
            Create one
          </Link>
        </p>
      </div>
    </PageWrapper>
  )
}
