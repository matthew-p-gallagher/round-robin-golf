import '@testing-library/jest-dom'

// Global test setup
beforeEach(() => {
  // Clear any mocks between tests
  vi.clearAllMocks()

  // Clear localStorage to ensure clean state for each test
  localStorage.clear()
})