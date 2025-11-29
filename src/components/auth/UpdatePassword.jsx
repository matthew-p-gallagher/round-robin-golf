import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import AuthLayout from '../common/AuthLayout.jsx'
import PasswordInput from '../common/PasswordInput.jsx'
import ErrorMessage from '../common/ErrorMessage.jsx'
import SuccessMessage from '../common/SuccessMessage.jsx'
import { validatePassword } from '../../utils/validation.js'

export default function UpdatePassword({ onPasswordUpdated }) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { updatePassword } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    setLoading(true)
    setError('')

    try {
      await updatePassword(password)
      setSuccess(true)

      // Auto-redirect after 2 seconds
      setTimeout(() => {
        if (onPasswordUpdated) {
          onPasswordUpdated()
        }
      }, 2000)
    } catch (err) {
      setError(err.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Update Password"
      subtitle="Choose a new password for your account"
    >
      {success ? (
        <SuccessMessage message="Password updated successfully! Redirecting to your matches..." />
      ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <PasswordInput
              id="password"
              label="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password (min 6 characters)"
              disabled={loading}
              autoComplete="new-password"
              autoFocus
              required
            />

            <PasswordInput
              id="confirmPassword"
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              disabled={loading}
              autoComplete="new-password"
              required
            />

            <ErrorMessage error={error} className="auth-error" />

            <button
              type="submit"
              className="auth-button primary"
              disabled={loading}
            >
              {loading ? 'Updating password...' : 'Update Password'}
            </button>
          </form>
        )}
    </AuthLayout>
  )
}
