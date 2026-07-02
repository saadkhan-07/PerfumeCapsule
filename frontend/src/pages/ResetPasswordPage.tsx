import { useState } from 'react'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useSearchParams } from 'react-router-dom'
import { resetPasswordSchema, type ResetPasswordValues } from '../utils/validation'
import { resetPasswordRequest } from '../services/auth.service'
import { getApiErrorMessage } from '../utils/apiError'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

const INVALID_MESSAGE = 'This reset link is invalid or has expired.'

type View = 'form' | 'success' | 'invalid'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  // No token in the URL → the link is unusable; show the invalid state up front.
  const [view, setView] = useState<View>(token ? 'form' : 'invalid')
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({ resolver: zodResolver(resetPasswordSchema) })

  const onSubmit = handleSubmit(async (values) => {
    if (!token) {
      setView('invalid')
      return
    }
    setFormError(null)
    try {
      await resetPasswordRequest(token, values.newPassword)
      setView('success')
    } catch (error) {
      // 400 = invalid/expired/used token → swap to the dedicated invalid view.
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        setView('invalid')
        return
      }
      setFormError(getApiErrorMessage(error, 'Could not reset your password. Please try again.'))
    }
  })

  return (
    <PageWrapper>
      <div className="mx-auto max-w-md">
        {view === 'success' && (
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Password reset</h1>
            <p className="mt-3 text-sm text-neutral-600">Your password has been reset.</p>
            <Link to="/login" className="mt-6 inline-block">
              <Button>Log in</Button>
            </Link>
          </div>
        )}

        {view === 'invalid' && (
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Link expired</h1>
            <p className="mt-3 text-sm text-neutral-600">{INVALID_MESSAGE}</p>
            <Link
              to="/forgot-password"
              className="mt-6 inline-block text-sm font-medium text-neutral-900 underline"
            >
              Request a new link
            </Link>
          </div>
        )}

        {view === 'form' && (
          <>
            <h1 className="text-2xl font-semibold tracking-tight">Set a new password</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Choose a new password for your account.
            </p>

            {formError && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
              <Input
                label="New password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                error={errors.newPassword?.message}
                {...register('newPassword')}
              />
              <Input
                label="Confirm password"
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter your password"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
              <Button type="submit" fullWidth isLoading={isSubmitting}>
                Reset password
              </Button>
            </form>
          </>
        )}
      </div>
    </PageWrapper>
  )
}
