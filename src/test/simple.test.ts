import { describe, it, expect } from 'vitest'

describe('Simple Addition Test', () => {
  it('should add two numbers correctly', () => {
    const result = 2 + 2
    expect(result).toBe(4)
  })

  it('should handle negative numbers', () => {
    const result = -5 + 3
    expect(result).toBe(-2)
  })
})
