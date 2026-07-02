import { useState } from 'react'
import { Link } from 'react-router-dom'
import { loginRequest } from '../../services/auth.service'
import { useAuthStore } from '../../store/authStore'
import { getApiErrorMessage } from '../../utils/apiError'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

/**
 * Compact inline login for the checkout Contact section. Deliberately NOT a
 * <form> element: it renders inside the main checkout form and nested forms are
 * invalid HTML. Logs in on button click (or Enter in the password field); on
 * success it calls onSuccess so the parent can collapse this panel and prefill.
 */
export function InlineSignIn({ onSuccess }: { onSuccess: () => void }) {
  const login = useAuthStore((s) => s.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleLogin = async () => {
    setError(null)
    if (!email || !password) {
      setError('Enter your email and password.')
      return
    }
    setSubmitting(true)
    try {
      const { user, token } = await loginRequest({ email, password })
      login({ ...user, role: 'user' }, token)
      onSuccess()
    } catch (e) {
      setError(getApiErrorMessage(e, 'Invalid email or password'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="space-y-3">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              void handleLogin()
            }
          }}
        />
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-gray-500 transition-colors hover:text-black">
            Forgot password?
          </Link>
        </div>
        <Button type="button" fullWidth isLoading={submitting} onClick={handleLogin}>
          Log in
        </Button>
      </div>
    </div>
  )
}
