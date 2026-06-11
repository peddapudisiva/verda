import { describe, it, expect } from 'vitest'
import { CHALLENGES } from './challenges.js'

describe('CHALLENGES structure', () => {
  it('has exactly 5 challenges', () => {
    expect(CHALLENGES).toHaveLength(5)
  })

  it('every challenge has required fields', () => {
    for (const c of CHALLENGES) {
      expect(c).toHaveProperty('id')
      expect(c).toHaveProperty('title')
      expect(c).toHaveProperty('description')
      expect(c).toHaveProperty('savings')
      expect(c).toHaveProperty('emoji')
      expect(typeof c.id).toBe('string')
      expect(typeof c.savings).toBe('number')
      expect(c.savings).toBeGreaterThan(0)
    }
  })

  it('all challenge IDs are unique', () => {
    const ids = CHALLENGES.map(c => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('total savings across all challenges is positive', () => {
    const total = CHALLENGES.reduce((s, c) => s + c.savings, 0)
    expect(total).toBeGreaterThan(0)
  })

  it('no_flights has the highest savings', () => {
    const max = Math.max(...CHALLENGES.map(c => c.savings))
    const noFlight = CHALLENGES.find(c => c.id === 'no_flights')
    expect(noFlight.savings).toBe(max)
  })

  it('every challenge description is non-empty', () => {
    for (const c of CHALLENGES) {
      expect(c.description.length).toBeGreaterThan(10)
    }
  })
})
