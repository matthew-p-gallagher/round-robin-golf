/**
 * Tests for AuthLayout component
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AuthLayout from './AuthLayout.jsx'

describe('AuthLayout', () => {
  it('should render title and subtitle', () => {
    render(
      <AuthLayout title="Welcome" subtitle="Sign in to continue">
        <div>Content</div>
      </AuthLayout>
    )

    expect(screen.getByRole('heading', { name: 'Welcome' })).toBeInTheDocument()
    expect(screen.getByText('Sign in to continue')).toBeInTheDocument()
  })

  it('should render children', () => {
    render(
      <AuthLayout title="Test" subtitle="Test subtitle">
        <div>Child content</div>
      </AuthLayout>
    )

    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('should have correct structure', () => {
    const { container } = render(
      <AuthLayout title="Test" subtitle="Test subtitle">
        <div>Content</div>
      </AuthLayout>
    )

    expect(container.querySelector('.auth-container')).toBeInTheDocument()
    expect(container.querySelector('.auth-card')).toBeInTheDocument()
  })
})
