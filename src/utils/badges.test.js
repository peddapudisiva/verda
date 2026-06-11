import { describe, it, expect } from 'vitest'
import { BADGE_DEFINITIONS } from './badges.js'

const badge = (id) => BADGE_DEFINITIONS.find(b => b.id === id)

describe('Badge conditions', () => {
  it('first_week_under unlocks when netTotal < goal', () => {
    expect(badge('first_week_under').condition({ netTotal: 20, goal: 38 })).toBe(true)
  })

  it('first_week_under does not unlock when over budget', () => {
    expect(badge('first_week_under').condition({ netTotal: 40, goal: 38 })).toBe(false)
  })

  it('first_week_under does not unlock when goal is 0', () => {
    expect(badge('first_week_under').condition({ netTotal: 0, goal: 0 })).toBe(false)
  })

  it('streak_7 unlocks at 7 days', () => {
    expect(badge('streak_7').condition({ streakCount: 7 })).toBe(true)
  })

  it('streak_7 unlocks above 7 days', () => {
    expect(badge('streak_7').condition({ streakCount: 10 })).toBe(true)
  })

  it('streak_7 does not unlock below 7 days', () => {
    expect(badge('streak_7').condition({ streakCount: 6 })).toBe(false)
  })

  it('plant_powered unlocks at 5 veg meals', () => {
    expect(badge('plant_powered').condition({ vegMealCount: 5 })).toBe(true)
  })

  it('plant_powered does not unlock below 5 meals', () => {
    expect(badge('plant_powered').condition({ vegMealCount: 4 })).toBe(false)
  })

  it('grounded unlocks with no flights and 3+ activities', () => {
    expect(badge('grounded').condition({ weekNoFlight: true, activitiesLogged: 3 })).toBe(true)
  })

  it('grounded does not unlock with flights', () => {
    expect(badge('grounded').condition({ weekNoFlight: false, activitiesLogged: 5 })).toBe(false)
  })

  it('grounded does not unlock with fewer than 3 activities', () => {
    expect(badge('grounded').condition({ weekNoFlight: true, activitiesLogged: 2 })).toBe(false)
  })

  it('challenger unlocks at 3 completed challenges', () => {
    expect(badge('challenger').condition({ challengesCompleted: 3 })).toBe(true)
  })

  it('challenger does not unlock below 3', () => {
    expect(badge('challenger').condition({ challengesCompleted: 2 })).toBe(false)
  })
})

describe('BADGE_DEFINITIONS structure', () => {
  it('every badge has required fields', () => {
    for (const b of BADGE_DEFINITIONS) {
      expect(b).toHaveProperty('id')
      expect(b).toHaveProperty('name')
      expect(b).toHaveProperty('description')
      expect(b).toHaveProperty('emoji')
      expect(typeof b.condition).toBe('function')
    }
  })

  it('has 5 badge definitions', () => {
    expect(BADGE_DEFINITIONS).toHaveLength(5)
  })
})
