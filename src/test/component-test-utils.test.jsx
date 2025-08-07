import { describe, it, expect } from 'vitest'
import React from 'react'
import { renderWithUser, assertButtonEnabled, assertButtonDisabled, createMockFn } from './component-test-utils'

// Simple test component
const TestButton = ({ onClick, disabled = false }) => (
  <button onClick={onClick} disabled={disabled} data-testid="test-button">
    Click me
  </button>
)

describe('Component Test Utils', () => {
  it('should render component with user event setup', () => {
    const { user } = renderWithUser(<TestButton />)
    expect(user).toBeDefined()
    expect(user.click).toBeDefined()
  })

  it('should create mock functions', () => {
    const mockFn = createMockFn()
    expect(mockFn).toBeDefined()
    expect(typeof mockFn).toBe('function')
    expect(mockFn).toHaveProperty('mock')
  })

  it('should assert button states correctly', () => {
    const { getByTestId } = renderWithUser(<TestButton />)
    const button = getByTestId('test-button')
    
    assertButtonEnabled(button)
  })

  it('should assert disabled button states correctly', () => {
    const { getByTestId } = renderWithUser(<TestButton disabled />)
    const button = getByTestId('test-button')
    
    assertButtonDisabled(button)
  })

  it('should handle user interactions', async () => {
    const mockClick = createMockFn()
    const { user, getByTestId } = renderWithUser(<TestButton onClick={mockClick} />)
    const button = getByTestId('test-button')
    
    await user.click(button)
    expect(mockClick).toHaveBeenCalledOnce()
  })
})