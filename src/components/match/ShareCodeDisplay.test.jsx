/**
 * Tests for ShareCodeDisplay component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../../test/test-utils.jsx'
import ShareCodeDisplay from './ShareCodeDisplay.jsx'

// Mock the supabase-share-persistence module
vi.mock('../../utils/supabase-share-persistence.js')

import { getShareCode, createShareCode } from '../../utils/supabase-share-persistence.js'

const TEST_USER_ID = 'test-user-123'

describe('ShareCodeDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('No userId', () => {
    it('should render nothing when userId is not provided', () => {
      const { container } = render(<ShareCodeDisplay />)

      expect(container.firstChild).toBeNull()
    })

    it('should render nothing when userId is null', () => {
      const { container } = render(<ShareCodeDisplay userId={null} />)

      expect(container.firstChild).toBeNull()
    })
  })

  describe('Loading state', () => {
    it('should show loading message while fetching code', () => {
      // Make getShareCode never resolve to keep loading state
      getShareCode.mockReturnValue(new Promise(() => {}))

      render(<ShareCodeDisplay userId={TEST_USER_ID} />)

      expect(screen.getByText('Loading match code...')).toBeInTheDocument()
    })
  })

  describe('Existing share code', () => {
    it('should display existing share code', async () => {
      getShareCode.mockResolvedValue('5678')

      render(<ShareCodeDisplay userId={TEST_USER_ID} />)

      await waitFor(() => {
        expect(screen.getByText('5678')).toBeInTheDocument()
      })

      expect(screen.getByText('Match Code')).toBeInTheDocument()
      expect(screen.getByText('Others can view standings at /view')).toBeInTheDocument()
    })

    it('should not create new code when one exists', async () => {
      getShareCode.mockResolvedValue('1234')

      render(<ShareCodeDisplay userId={TEST_USER_ID} />)

      await waitFor(() => {
        expect(screen.getByText('1234')).toBeInTheDocument()
      })

      expect(getShareCode).toHaveBeenCalledWith(TEST_USER_ID)
      expect(createShareCode).not.toHaveBeenCalled()
    })
  })

  describe('New share code creation', () => {
    it('should create new code when none exists', async () => {
      getShareCode.mockResolvedValue(null)
      createShareCode.mockResolvedValue('9999')

      render(<ShareCodeDisplay userId={TEST_USER_ID} />)

      await waitFor(() => {
        expect(screen.getByText('9999')).toBeInTheDocument()
      })

      expect(getShareCode).toHaveBeenCalledWith(TEST_USER_ID)
      expect(createShareCode).toHaveBeenCalledWith(TEST_USER_ID)
    })
  })

  describe('Error states', () => {
    it('should show error when code generation fails', async () => {
      getShareCode.mockResolvedValue(null)
      createShareCode.mockResolvedValue(null)

      render(<ShareCodeDisplay userId={TEST_USER_ID} />)

      await waitFor(() => {
        expect(screen.getByText('Failed to generate code')).toBeInTheDocument()
      })
    })

    it('should show error when getShareCode throws', async () => {
      getShareCode.mockRejectedValue(new Error('Network error'))

      render(<ShareCodeDisplay userId={TEST_USER_ID} />)

      await waitFor(() => {
        expect(screen.getByText('Failed to load share code')).toBeInTheDocument()
      })
    })

    it('should show error when createShareCode throws', async () => {
      getShareCode.mockResolvedValue(null)
      createShareCode.mockRejectedValue(new Error('Database error'))

      render(<ShareCodeDisplay userId={TEST_USER_ID} />)

      await waitFor(() => {
        expect(screen.getByText('Failed to load share code')).toBeInTheDocument()
      })
    })
  })

  describe('Cleanup on unmount', () => {
    it('should not update state after unmount', async () => {
      let resolvePromise
      getShareCode.mockReturnValue(
        new Promise((resolve) => {
          resolvePromise = resolve
        })
      )

      const { unmount } = render(<ShareCodeDisplay userId={TEST_USER_ID} />)

      // Unmount before promise resolves
      unmount()

      // Resolve the promise after unmount
      resolvePromise('1234')

      // No error should be thrown and no state updates should occur
      // If state updates happened after unmount, React would warn
      await waitFor(() => {
        expect(getShareCode).toHaveBeenCalled()
      })
    })
  })

  describe('UI structure', () => {
    it('should have correct CSS classes', async () => {
      getShareCode.mockResolvedValue('4321')

      render(<ShareCodeDisplay userId={TEST_USER_ID} />)

      await waitFor(() => {
        expect(screen.getByText('4321')).toBeInTheDocument()
      })

      expect(document.querySelector('.share-code-card')).toBeInTheDocument()
      expect(document.querySelector('.share-code-label')).toBeInTheDocument()
      expect(document.querySelector('.share-code-value')).toBeInTheDocument()
      expect(document.querySelector('.share-code-hint')).toBeInTheDocument()
    })

    it('should have correct CSS classes for loading state', () => {
      getShareCode.mockReturnValue(new Promise(() => {}))

      render(<ShareCodeDisplay userId={TEST_USER_ID} />)

      expect(document.querySelector('.share-code-card')).toBeInTheDocument()
      expect(document.querySelector('.share-code-loading')).toBeInTheDocument()
    })

    it('should have correct CSS classes for error state', async () => {
      getShareCode.mockRejectedValue(new Error('Error'))

      render(<ShareCodeDisplay userId={TEST_USER_ID} />)

      await waitFor(() => {
        expect(document.querySelector('.share-code-error')).toBeInTheDocument()
      })

      expect(document.querySelector('.share-code-card')).toBeInTheDocument()
    })
  })
})
