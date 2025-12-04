/**
 * Tests for PageLayout component
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PageLayout from './PageLayout.jsx'

describe('PageLayout', () => {
  it('should render children', () => {
    render(
      <PageLayout>
        <div>Page content</div>
      </PageLayout>
    )

    expect(screen.getByText('Page content')).toBeInTheDocument()
  })

  it('should have correct structure', () => {
    const { container } = render(
      <PageLayout>
        <div>Content</div>
      </PageLayout>
    )

    expect(container.querySelector('.screen')).toBeInTheDocument()
    expect(container.querySelector('.container')).toBeInTheDocument()
  })

  it('should apply custom className alongside default', () => {
    const { container } = render(
      <PageLayout className="custom-page">
        <div>Content</div>
      </PageLayout>
    )

    const screenDiv = container.querySelector('.screen')
    expect(screenDiv).toHaveClass('screen')
    expect(screenDiv).toHaveClass('custom-page')
  })

  it('should handle empty className', () => {
    const { container } = render(
      <PageLayout className="">
        <div>Content</div>
      </PageLayout>
    )

    const screenDiv = container.querySelector('.screen')
    expect(screenDiv).toHaveClass('screen')
    expect(screenDiv?.className).toBe('screen')
  })
})
