/**
 * Tests for validation utility functions
 */

import { describe, it, expect } from 'vitest'
import { validatePassword, validateEmail } from './validation.js'

describe('validatePassword', () => {
  it('should return null for valid password (6+ characters)', () => {
    expect(validatePassword('password123')).toBeNull()
    expect(validatePassword('abcdef')).toBeNull()
    expect(validatePassword('123456')).toBeNull()
  })

  it('should return error for password less than 6 characters', () => {
    const error = validatePassword('12345')
    expect(error).toBe('Password must be at least 6 characters long')
  })

  it('should return error for empty password', () => {
    const error = validatePassword('')
    expect(error).toBe('Password must be at least 6 characters long')
  })

  it('should handle password with exactly 6 characters (boundary)', () => {
    expect(validatePassword('abcdef')).toBeNull()
    expect(validatePassword('12345')).toBe('Password must be at least 6 characters long')
  })

  it('should accept password with special characters', () => {
    expect(validatePassword('Pass@123!')).toBeNull()
    expect(validatePassword('!@#$%^&*()')).toBeNull()
  })

  it('should accept password with spaces', () => {
    expect(validatePassword('pass word')).toBeNull()
    expect(validatePassword('a b c d')).toBeNull() // 7 chars total
  })

  it('should return error for password with spaces less than 6 chars', () => {
    expect(validatePassword('a b')).toBe('Password must be at least 6 characters long') // Only 3 chars
    expect(validatePassword('  12')).toBe('Password must be at least 6 characters long') // Only 4 chars
  })
})

describe('validateEmail', () => {
  it('should return null for valid email addresses', () => {
    expect(validateEmail('test@example.com')).toBeNull()
    expect(validateEmail('user@domain.co.uk')).toBeNull()
    expect(validateEmail('first.last@company.com')).toBeNull()
    expect(validateEmail('user+tag@example.com')).toBeNull()
  })

  it('should return error for invalid email format', () => {
    const error = validateEmail('not-an-email')
    expect(error).toBe('Please enter a valid email address')
  })

  it('should return error for email missing @ symbol', () => {
    const error = validateEmail('testexample.com')
    expect(error).toBe('Please enter a valid email address')
  })

  it('should return error for email missing domain', () => {
    const error = validateEmail('test@')
    expect(error).toBe('Please enter a valid email address')
  })

  it('should return error for email missing username', () => {
    const error = validateEmail('@example.com')
    expect(error).toBe('Please enter a valid email address')
  })

  it('should return error for email missing TLD', () => {
    const error = validateEmail('test@example')
    expect(error).toBe('Please enter a valid email address')
  })

  it('should return error for empty email', () => {
    const error = validateEmail('')
    expect(error).toBe('Please enter a valid email address')
  })

  it('should return error for email with spaces', () => {
    const error = validateEmail('test @example.com')
    expect(error).toBe('Please enter a valid email address')
  })

  it('should return error for null or undefined email', () => {
    expect(validateEmail(null)).toBe('Please enter a valid email address')
    expect(validateEmail(undefined)).toBe('Please enter a valid email address')
  })
})
