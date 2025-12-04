/**
 * Tests for useDebounce and useTimeout custom hooks
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce, useTimeout } from './useDebounce.js'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('should debounce function calls', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebounce(callback, 500))

    // Call the debounced function
    act(() => {
      result.current()
    })

    // Callback should not be called immediately
    expect(callback).not.toHaveBeenCalled()

    // Fast-forward time by 500ms
    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Callback should now be called
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should cancel previous timeout on subsequent calls', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebounce(callback, 500))

    // First call
    act(() => {
      result.current()
    })

    // Advance time by 300ms (not enough to trigger)
    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(callback).not.toHaveBeenCalled()

    // Second call (should cancel first timeout)
    act(() => {
      result.current()
    })

    // Advance time by another 300ms (600ms total, but only 300ms since last call)
    act(() => {
      vi.advanceTimersByTime(300)
    })

    // Callback should not be called yet
    expect(callback).not.toHaveBeenCalled()

    // Advance time by another 200ms (500ms since last call)
    act(() => {
      vi.advanceTimersByTime(200)
    })

    // Callback should now be called only once
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should pass arguments to callback', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebounce(callback, 500))

    act(() => {
      result.current('arg1', 'arg2', 'arg3')
    })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(callback).toHaveBeenCalledWith('arg1', 'arg2', 'arg3')
  })

  it('should handle multiple rapid calls correctly', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebounce(callback, 500))

    // Rapid calls
    act(() => {
      result.current('call1')
      result.current('call2')
      result.current('call3')
      result.current('call4')
    })

    // Callback should not be called yet
    expect(callback).not.toHaveBeenCalled()

    // Advance time by 500ms
    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Callback should be called only once with the last arguments
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith('call4')
  })

  it('should update callback reference when callback changes', () => {
    const callback1 = vi.fn()
    const callback2 = vi.fn()

    const { result, rerender } = renderHook(
      ({ cb }) => useDebounce(cb, 500),
      { initialProps: { cb: callback1 } }
    )

    // Call with first callback
    act(() => {
      result.current('test')
    })

    // Update callback
    rerender({ cb: callback2 })

    // Advance time
    act(() => {
      vi.advanceTimersByTime(500)
    })

    // New callback should be called, not the old one
    expect(callback1).not.toHaveBeenCalled()
    expect(callback2).toHaveBeenCalledTimes(1)
    expect(callback2).toHaveBeenCalledWith('test')
  })

  it('should use new delay for subsequent calls after delay changes', () => {
    const callback = vi.fn()

    const { result, rerender } = renderHook(
      ({ delay }) => useDebounce(callback, delay),
      { initialProps: { delay: 500 } }
    )

    // Call with 500ms delay
    act(() => {
      result.current('first')
    })

    // Advance time by 500ms - first call completes
    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith('first')

    // Change delay to 1000ms
    rerender({ delay: 1000 })

    // Call again with new delay
    act(() => {
      result.current('second')
    })

    // Advance time by 500ms (not enough for new delay)
    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Callback should not be called yet
    expect(callback).toHaveBeenCalledTimes(1)

    // Advance time by another 500ms (1000ms total)
    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Callback should now be called with new delay
    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenCalledWith('second')
  })

  it('should cleanup timeout on unmount', () => {
    const callback = vi.fn()
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')

    const { result, unmount } = renderHook(() => useDebounce(callback, 500))

    act(() => {
      result.current()
    })

    // Unmount before timeout fires
    unmount()

    // Advance time
    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Callback should not be called
    expect(callback).not.toHaveBeenCalled()

    // clearTimeout should have been called
    expect(clearTimeoutSpy).toHaveBeenCalled()
  })
})

describe('useTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('should execute callback after delay', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useTimeout())

    act(() => {
      result.current(callback, 500)
    })

    // Callback should not be called immediately
    expect(callback).not.toHaveBeenCalled()

    // Fast-forward time by 500ms
    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Callback should now be called
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should cancel previous timeout when called again', () => {
    const callback1 = vi.fn()
    const callback2 = vi.fn()
    const { result } = renderHook(() => useTimeout())

    // First timeout
    act(() => {
      result.current(callback1, 500)
    })

    // Advance time by 300ms
    act(() => {
      vi.advanceTimersByTime(300)
    })

    // Second timeout (should cancel first)
    act(() => {
      result.current(callback2, 500)
    })

    // Advance time by 300ms (600ms total, but only 300ms since second call)
    act(() => {
      vi.advanceTimersByTime(300)
    })

    // Neither callback should be called yet
    expect(callback1).not.toHaveBeenCalled()
    expect(callback2).not.toHaveBeenCalled()

    // Advance time by another 200ms (500ms since second call)
    act(() => {
      vi.advanceTimersByTime(200)
    })

    // Only second callback should be called
    expect(callback1).not.toHaveBeenCalled()
    expect(callback2).toHaveBeenCalledTimes(1)
  })

  it('should handle multiple timeouts sequentially', () => {
    const callback1 = vi.fn()
    const callback2 = vi.fn()
    const { result } = renderHook(() => useTimeout())

    // First timeout
    act(() => {
      result.current(callback1, 300)
    })

    // Advance time by 300ms
    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(callback1).toHaveBeenCalledTimes(1)

    // Second timeout after first completes
    act(() => {
      result.current(callback2, 200)
    })

    // Advance time by 200ms
    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(callback2).toHaveBeenCalledTimes(1)
  })

  it('should cleanup timeout on unmount', () => {
    const callback = vi.fn()
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')

    const { result, unmount } = renderHook(() => useTimeout())

    act(() => {
      result.current(callback, 500)
    })

    // Unmount before timeout fires
    unmount()

    // Advance time
    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Callback should not be called
    expect(callback).not.toHaveBeenCalled()

    // clearTimeout should have been called
    expect(clearTimeoutSpy).toHaveBeenCalled()
  })

  it('should handle rapid successive calls correctly', () => {
    const callback1 = vi.fn()
    const callback2 = vi.fn()
    const callback3 = vi.fn()
    const { result } = renderHook(() => useTimeout())

    // Rapid calls (each should cancel the previous)
    act(() => {
      result.current(callback1, 500)
      result.current(callback2, 500)
      result.current(callback3, 500)
    })

    // Advance time by 500ms
    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Only the last callback should be called
    expect(callback1).not.toHaveBeenCalled()
    expect(callback2).not.toHaveBeenCalled()
    expect(callback3).toHaveBeenCalledTimes(1)
  })

  it('should work with different delay values', () => {
    const callback1 = vi.fn()
    const callback2 = vi.fn()
    const { result } = renderHook(() => useTimeout())

    act(() => {
      result.current(callback1, 100)
    })

    // Advance by 100ms
    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(callback1).toHaveBeenCalledTimes(1)

    act(() => {
      result.current(callback2, 1000)
    })

    // Advance by 1000ms
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(callback2).toHaveBeenCalledTimes(1)
  })
})
