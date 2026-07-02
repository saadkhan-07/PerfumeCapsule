import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { forgotPasswordSchema, type ForgotPasswordValues } from '../utils/validation'
import { forgotPasswordRequest } from '../services/auth.service'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

// Shown after any submit — never reveals whether the email was registered.
const GENERIC_MESSAGE = 'If an account exists with this email, a reset link has been sent.'

export function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({ resolver: zodResolver(forgotPasswordSchema) })

  const onSubmit = handleSubmit(async (values) => {
    // The endpoint returns an identical 200 whether or not the account exists;
    // even on a network error we show the same neutral state (no enumeration).
    try {
      await forgotPasswordRequest(values.email)
    } catch {
      // Intentionally ignored — the success state is identical either way.
    } finally {
      setSubmitted(true)
    }
  })

  return (
    <PageWrapper>
      <div className="mx-auto max-w-md">
        {submitted ? (
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
            <p className="mt-3 text-sm text-neutral-600">{GENERIC_MESSAGE}</p>
            <Link
              to="/login"
              className="mt-6 inline-block text-sm font-medium text-neutral-900 underline"
            >
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-semibold tracking-tight">Reset your password</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Enter your email and we'll send you a reset link.
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register('email')}
              />
              <Button type="submit" fullWidth isLoading={isSubmitting}>
                Send reset link
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-neutral-500">
              Remembered it?{' '}
              <Link to="/login" className="font-medium text-neutral-900 underline">
                Back to login
              </Link>
            </p>
          </>
        )}
      </div>
    </PageWrapper>
  )
}
