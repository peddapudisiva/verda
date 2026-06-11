import { describe, it, expect } from 'vitest'
import { buildSampleActivities, buildSampleHistory } from './sampleData.js'

describe('buildSampleActivities', () => {
  it('returns an array', () => {
    expect(Array.isArray(buildSampleActivities())).toBe(true)
  })

  it('returns at least one activity', () => {
    expect(buildSampleActivities().length).toBeGreaterThan(0)
  })

  it('every activity has required fields', () => {
    for (const a of buildSampleActivities()) {
      expect(a).toHaveProperty('id')
      expect(a).toHaveProperty('category')
      expect(a).toHaveProperty('activity')
      expect(a).toHaveProperty('label')
      expect(a).toHaveProperty('quantity')
      expect(a).toHaveProperty('unit')
      expect(a).toHaveProperty('kg')
      expect(a).toHaveProperty('date')
      expect(typeof a.kg).toBe('number')
      expect(a.kg).toBeGreaterThanOrEqual(0)
    }
  })

  it('all activity IDs are unique', () => {
    const activities = buildSampleActivities()
    const ids = activities.map(a => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('each activity has a valid category', () => {
    const validCategories = ['transport', 'food', 'home', 'things']
    for (const a of buildSampleActivities()) {
      expect(validCategories).toContain(a.category)
    }
  })
})

describe('buildSampleHistory', () => {
  it('returns an array', () => {
    expect(Array.isArray(buildSampleHistory(38))).toBe(true)
  })

  it('returns history entries with required fields', () => {
    for (const h of buildSampleHistory(38)) {
      expect(h).toHaveProperty('week')
      expect(h).toHaveProperty('total')
      expect(h).toHaveProperty('goal')
      expect(typeof h.total).toBe('number')
      expect(h.goal).toBe(38)
    }
  })

  it('respects the goal parameter', () => {
    const history = buildSampleHistory(50)
    for (const h of history) {
      expect(h.goal).toBe(50)
    }
  })
})
