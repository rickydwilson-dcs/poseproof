import { describe, it, expect } from 'vitest'

/**
 * Example unit test template for PoseProof
 *
 * Test file naming conventions:
 * - Unit tests: *.test.ts or *.test.tsx
 * - Place alongside source files or in tests/ directory
 *
 * Run tests:
 * - npm test          (run once)
 * - npm run test:watch (watch mode)
 * - npm run test:coverage (with coverage)
 */

describe('Example Test Suite', () => {
  it('should pass a basic assertion', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle async operations', async () => {
    const result = await Promise.resolve('success')
    expect(result).toBe('success')
  })

  it('should work with objects', () => {
    const user = { name: 'Test User', isPro: false }
    expect(user).toMatchObject({ name: 'Test User' })
    expect(user.isPro).toBe(false)
  })
})

// Example: Testing a utility function
describe('Utility Function Tests', () => {
  // Example helper for testing
  const formatPercentage = (value: number): string => {
    return `${Math.round(value * 100)}%`
  }

  it('should format percentages correctly', () => {
    expect(formatPercentage(0.5)).toBe('50%')
    expect(formatPercentage(1)).toBe('100%')
    expect(formatPercentage(0.123)).toBe('12%')
  })
})
