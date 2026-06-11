import { describe, it, expect } from 'vitest'
import { getEquivalencies } from './equivalencies.js'

describe('getEquivalencies', () => {
  it('returns empty array for 0 kg', () => {
    expect(getEquivalencies(0)).toEqual([])
  })

  it('returns empty array for negative kg', () => {
    expect(getEquivalencies(-5)).toEqual([])
  })

  it('returns empty array for null', () => {
    expect(getEquivalencies(null)).toEqual([])
  })

  it('returns 3 equivalencies for valid kg', () => {
    expect(getEquivalencies(21)).toHaveLength(3)
  })

  it('calculates tree equivalency correctly for 21 kg (1 tree)', () => {
    const result = getEquivalencies(21)
    const tree = result.find(e => e.emoji === '🌳')
    expect(tree.label).toContain('1.0 trees')
  })

  it('calculates driving equivalency correctly', () => {
    const result = getEquivalencies(0.192)
    const car = result.find(e => e.emoji === '🚗')
    expect(car.label).toContain('1 km driving')
  })

  it('every equivalency has emoji and label', () => {
    const result = getEquivalencies(10)
    for (const eq of result) {
      expect(eq).toHaveProperty('emoji')
      expect(eq).toHaveProperty('label')
      expect(typeof eq.label).toBe('string')
    }
  })

  it('scales correctly — double kg gives roughly double values', () => {
    const r1 = getEquivalencies(10)
    const r2 = getEquivalencies(20)
    const trees1 = parseFloat(r1[0].label)
    const trees2 = parseFloat(r2[0].label)
    expect(trees2).toBeCloseTo(trees1 * 2, 0)
  })
})
