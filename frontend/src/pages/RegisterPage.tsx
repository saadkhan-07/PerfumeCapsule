import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { registerSchema, type RegisterValues } from '../utils/validation'
import { registerRequest } from '../services/auth.service'
import { useAuthStore } from '../store/authStore'
import { getApiErrorMessage } from '../utils/apiError'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

interface RegisterPrefill {
  name?: string
  phone?: string
  email?: string
}

export function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)
  const [formError, setFormError] = useState<string | null>(null)

  // Prefill from a guest checkout's details when arriving from the confirmation prompt.
  const prefill = (location.state as { prefill?: RegisterPrefill } | null)?.prefill

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: prefill?.name ?? '',
      email: prefill?.email ?? '',
      phone: prefill?.phone ?? '',
      password: '',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      const { user, token } = await registerRequest(values)
      login({ ...user, role: 'user' }, token)
      navigate('/shop', { replace: true })
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Could not create your account'))
    }
  })

  return (
    <PageWrapper>
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
        <p className="mt-1 text-sm text-neutral-500">Join Perfume Capsules in a few seconds.</p>

        {formError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {formError}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          <Input
            label="Full name"
            autoComplete="name"
            placeholder="Your name"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Phone (optional)"
            type="tel"
            autoComplete="tel"
            placeholder="03001234567"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            error={errors.password?.message}
            {...register('password')}
          />
          <Button type="submit" fullWidth isLoading={isSubmitting}>
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-neutral-900 underline">
            Log in
          </Link>
        </p>
      </div>
    </PageWrapper>
  )
}
