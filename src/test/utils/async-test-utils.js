/**
 * Async testing utilities
 * Helpers for testing debounced operations, timers, and async behavior
 */

import { vi, waitFor } from 'vitest'
import { act } from '@testing-library/react'

/**
 * Advance timers by a specific amount to trigger debounced operations
 * @param {number} ms - Milliseconds to advance
 * @returns {Promise<void>}
 *
 * @example
 * vi.useFakeTimers()
 * await flushDebounce(800) // Advance 800ms to trigger auto-save
 * vi.useRealTimers()
 */
export async function flushDebounce(ms) {
  await act(async () => {
    vi.advanceTimersByTime(ms)
  })
}

/**
 * Wait for the standard persistence debounce delay (800ms)
 * Automatically handles fake timers
 * @returns {Promise<void>}
 *
 * @example
 * vi.useFakeTimers()
 * // ... perform action that triggers auto-save
 * await waitForPersistence()
 * expect(saveFn).toHaveBeenCalled()
 * vi.useRealTimers()
 */
export async function waitForPersistence() {
  await flushDebounce(800)
}

/**
 * Advance timers and wait for all pending promises
 * Useful for complex async scenarios
 * @param {number} ms - Milliseconds to advance
 * @returns {Promise<void>}
 */
export async function advanceTimersAndFlush(ms) {
  await act(async () => {
    vi.advanceTimersByTime(ms)
    await vi.runAllTimersAsync()
  })
}

/**
 * Run all pending timers immediately
 * @returns {Promise<void>}
 */
export async function runAllTimers() {
  await act(async () => {
    vi.runAllTimers()
  })
}

/**
 * Create a mock async function that resolves with data
 * @param {*} data - Data to resolve with
 * @param {number} delay - Optional delay in ms before resolving
 * @returns {Function} Mock function
 *
 * @example
 * const mockFetch = mockAsyncSuccess({ user: { id: 1 } })
 * const mockDelayedFetch = mockAsyncSuccess({ data: [] }, 500)
 */
export function mockAsyncSuccess(data, delay = 0) {
  return vi.fn().mockImplementation(() => {
    if (delay > 0) {
      return new Promise(resolve => {
        setTimeout(() => resolve(data), delay)
      })
    }
    return Promise.resolve(data)
  })
}

/**
 * Create a mock async function that rejects with an error
 * @param {Error|string} error - Error to reject with
 * @param {number} delay - Optional delay in ms before rejecting
 * @returns {Function} Mock function
 *
 * @example
 * const mockFetch = mockAsyncError(new Error('Network error'))
 * const mockDelayedError = mockAsyncError('Timeout', 1000)
 */
export function mockAsyncError(error, delay = 0) {
  const errorObj = typeof error === 'string' ? new Error(error) : error

  return vi.fn().mockImplementation(() => {
    if (delay > 0) {
      return new Promise((resolve, reject) => {
        setTimeout(() => reject(errorObj), delay)
      })
    }
    return Promise.reject(errorObj)
  })
}

/**
 * Wait for a specific condition with custom polling
 * More flexible than waitFor with custom intervals
 * @param {Function} condition - Condition function to check
 * @param {Object} options - Options
 * @param {number} options.timeout - Max time to wait (default: 1000ms)
 * @param {number} options.interval - Polling interval (default: 50ms)
 * @returns {Promise<void>}
 *
 * @example
 * await waitForCondition(() => mockFn.mock.calls.length > 0)
 */
export async function waitForCondition(condition, options = {}) {
  const { timeout = 1000, interval = 50 } = options

  return waitFor(
    () => {
      if (!condition()) {
        throw new Error('Condition not met')
      }
    },
    { timeout, interval }
  )
}

/**
 * Wait for a mock function to be called a specific number of times
 * @param {Function} mockFn - Mock function to watch
 * @param {number} times - Expected number of calls (default: 1)
 * @param {Object} options - waitFor options
 * @returns {Promise<void>}
 *
 * @example
 * await waitForMockCall(mockSave, 2) // Wait for 2 calls
 */
export async function waitForMockCall(mockFn, times = 1, options = {}) {
  return waitFor(
    () => {
      expect(mockFn).toHaveBeenCalledTimes(times)
    },
    options
  )
}

/**
 * Wait for next tick (microtask queue to flush)
 * @returns {Promise<void>}
 *
 * @example
 * setState(newValue)
 * await nextTick()
 * expect(result).toBe(expected)
 */
export async function nextTick() {
  return act(async () => {
    await Promise.resolve()
  })
}

/**
 * Mock console methods to avoid noise in tests
 * Returns restore function to undo the mock
 * @param {Array<string>} methods - Console methods to mock (default: ['error', 'warn'])
 * @returns {Function} Restore function
 *
 * @example
 * const restore = mockConsole()
 * // ... test code that logs errors
 * restore()
 *
 * // Or mock specific methods
 * const restore = mockConsole(['log', 'info'])
 */
export function mockConsole(methods = ['error', 'warn']) {
  const mocks = {}

  methods.forEach(method => {
    mocks[method] = vi.spyOn(console, method).mockImplementation(() => {})
  })

  return () => {
    Object.values(mocks).forEach(mock => mock.mockRestore())
  }
}

/**
 * Create a deferred promise for manual control
 * Useful for testing loading states
 * @returns {Object} Object with promise, resolve, and reject
 *
 * @example
 * const deferred = createDeferred()
 * mockFn.mockReturnValue(deferred.promise)
 *
 * render(<Component />)
 * // Component is in loading state
 *
 * deferred.resolve({ data: 'success' })
 * await waitFor(() => expect(screen.getByText('success')))
 */
export function createDeferred() {
  let resolve, reject

  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, resolve, reject }
}

/**
 * Wait for a specific amount of time (real time, not fake timers)
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 *
 * @example
 * await delay(100) // Wait 100ms
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Setup fake timers for a test with automatic cleanup
 * @returns {Object} Object with cleanup function
 *
 * @example
 * const { cleanup } = setupFakeTimers()
 * // ... test code using fake timers
 * cleanup() // Restore real timers
 */
export function setupFakeTimers() {
  vi.useFakeTimers()

  return {
    cleanup: () => vi.useRealTimers()
  }
}

/**
 * Execute a function with fake timers, then restore
 * @param {Function} fn - Function to execute
 * @returns {Promise<*>} Result of the function
 *
 * @example
 * await withFakeTimers(async () => {
 *   // ... test code
 *   await flushDebounce(800)
 * })
 * // Real timers are automatically restored
 */
export async function withFakeTimers(fn) {
  vi.useFakeTimers()

  try {
    return await fn()
  } finally {
    vi.useRealTimers()
  }
}

/**
 * Assert that a function eventually throws an error
 * @param {Function} fn - Function that should throw
 * @param {string|RegExp} errorMessage - Expected error message
 * @param {Object} options - waitFor options
 * @returns {Promise<void>}
 *
 * @example
 * await expectAsyncError(
 *   () => validateInput(''),
 *   'Input is required'
 * )
 */
export async function expectAsyncError(fn, errorMessage, options = {}) {
  await waitFor(
    async () => {
      await expect(fn()).rejects.toThrow(errorMessage)
    },
    options
  )
}
