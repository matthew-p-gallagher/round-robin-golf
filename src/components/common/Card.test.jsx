/**
 * Tests for Card component
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Card from './Card.jsx'

describe('Card', () => {
  it('should render children', () => {
    render(
      <Card>
        <div>Card content</div>
      </Card>
    )

    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('should render with title and description', () => {
    render(
      <Card title="Card Title" description="Card description">
        <div>Content</div>
      </Card>
    )

    expect(screen.getByRole('heading', { name: 'Card Title' })).toBeInTheDocument()
    expect(screen.getByText('Card description')).toBeInTheDocument()
  })

  it('should render with title only', () => {
    const { container } = render(
      <Card title="Card Title">
        <div>Content</div>
      </Card>
    )

    expect(screen.getByRole('heading', { name: 'Card Title' })).toBeInTheDocument()
    expect(container.querySelector('.card-header')).toBeInTheDocument()
  })

  it('should render with description only', () => {
    const { container } = render(
      <Card description="Card description">
        <div>Content</div>
      </Card>
    )

    expect(screen.getByText('Card description')).toBeInTheDocument()
    expect(container.querySelector('.card-header')).toBeInTheDocument()
  })

  it('should not render header when title and description are missing', () => {
    const { container } = render(
      <Card>
        <div>Content</div>
      </Card>
    )

    expect(container.querySelector('.card-header')).not.toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <Card className="custom-card">
        <div>Content</div>
      </Card>
    )

    const cardDiv = container.querySelector('.card')
    expect(cardDiv).toHaveClass('card')
    expect(cardDiv).toHaveClass('custom-card')
  })

  it('should have correct structure', () => {
    const { container } = render(
      <Card>
        <div>Content</div>
      </Card>
    )

    expect(container.querySelector('.card')).toBeInTheDocument()
  })
})
