import React from 'react'
import { render } from '@testing-library/react'

// Custom render function that includes any providers
const customRender = (ui, options) => {
  return render(ui, {
    // Add any providers here if needed in the future
    wrapper: ({ children }) => children,
    ...options,
  })
}

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }