import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import AuthLayout from '../common/AuthLayout.jsx'
import EmailInput from '../common/EmailInput.jsx'
import PasswordInput from '../common/PasswordInput.jsx'
import ErrorMessage from '../common/ErrorMessage.jsx'

export default function Login({ onShowSignup, onShowResetPassword }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      await signIn(email, password)
    } catch (err) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to continue your golf matches"
    >
      <form onSubmit={handleSubmit} className="auth-form">
          <EmailInput
            id="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={loading}
            required
          />

          <PasswordInput
            id="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            disabled={loading}
            autoComplete="current-password"
            required
          />

          <ErrorMessage error={error} className="auth-error" />

          <button
            type="submit"
            className="auth-button primary"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
      </form>

      <div className="auth-links">
        <button
          type="button"
          className="link-button"
          onClick={onShowResetPassword}
          disabled={loading}
        >
          Forgot your password?
        </button>

        <div className="auth-divider">
          <span>Don't have an account?</span>
          <button
            type="button"
            className="link-button"
            onClick={onShowSignup}
            disabled={loading}
          >
            Sign up
          </button>
        </div>
      </div>
    </AuthLayout>
  )
}