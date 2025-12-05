/**
 * Tests for share code utility functions
 */

import { describe, it, expect } from 'vitest'
import {
  generateShareCode,
  validateShareCodeFormat,
  normalizeShareCode
} from './share-code.js'

describe('share-code utilities', () => {
  describe('generateShareCode', () => {
    it('should generate a 4-digit string', () => {
      const code = generateShareCode()
      expect(code).toHaveLength(4)
      expect(code).toMatch(/^\d{4}$/)
    })

    it('should pad codes with leading zeros if needed', () => {
      // Generate many codes to increase chance of getting one starting with 0
      const codes = Array.from({ length: 100 }, () => generateShareCode())
      // All should be exactly 4 characters
      codes.forEach(code => {
        expect(code).toHaveLength(4)
      })
    })

    it('should generate different codes on subsequent calls', () => {
      // Generate 10 codes and check they're not all the same
      const codes = Array.from({ length: 10 }, () => generateShareCode())
      const uniqueCodes = new Set(codes)
      // With 10000 possible codes, it's extremely unlikely to get all duplicates
      expect(uniqueCodes.size).toBeGreaterThan(1)
    })

    it('should only contain digits 0-9', () => {
      const codes = Array.from({ length: 50 }, () => generateShareCode())
      codes.forEach(code => {
        expect(code).toMatch(/^[0-9]+$/)
      })
    })
  })

  describe('validateShareCodeFormat', () => {
    it('should return true for valid 4-digit codes', () => {
      expect(validateShareCodeFormat('0000')).toBe(true)
      expect(validateShareCodeFormat('1234')).toBe(true)
      expect(validateShareCodeFormat('9999')).toBe(true)
      expect(validateShareCodeFormat('0001')).toBe(true)
    })

    it('should return false for codes with wrong length', () => {
      expect(validateShareCodeFormat('123')).toBe(false)
      expect(validateShareCodeFormat('12345')).toBe(false)
      expect(validateShareCodeFormat('')).toBe(false)
    })

    it('should return false for codes with non-digits', () => {
      expect(validateShareCodeFormat('abcd')).toBe(false)
      expect(validateShareCodeFormat('12ab')).toBe(false)
      expect(validateShareCodeFormat('12-4')).toBe(false)
      expect(validateShareCodeFormat('12 4')).toBe(false)
    })

    it('should return false for non-string inputs', () => {
      expect(validateShareCodeFormat(1234)).toBe(false)
      expect(validateShareCodeFormat(null)).toBe(false)
      expect(validateShareCodeFormat(undefined)).toBe(false)
      expect(validateShareCodeFormat({})).toBe(false)
    })
  })

  describe('normalizeShareCode', () => {
    it('should trim whitespace from input', () => {
      expect(normalizeShareCode(' 1234 ')).toBe('1234')
      expect(normalizeShareCode('  1234')).toBe('1234')
      expect(normalizeShareCode('1234  ')).toBe('1234')
    })

    it('should return empty string for non-string inputs', () => {
      expect(normalizeShareCode(1234)).toBe('')
      expect(normalizeShareCode(null)).toBe('')
      expect(normalizeShareCode(undefined)).toBe('')
    })

    it('should preserve valid codes', () => {
      expect(normalizeShareCode('0000')).toBe('0000')
      expect(normalizeShareCode('1234')).toBe('1234')
    })
  })
})
