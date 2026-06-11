import { describe, it, expect } from 'vitest'
import { calcKg, EMISSION_FACTORS, CATEGORY_META } from './emissionFactors.js'

describe('calcKg', () => {
  it('calculates petrol car emissions correctly', () => {
    expect(calcKg('transport', 'car_petrol', 100)).toBe(19.2)
  })

  it('calculates EV emissions correctly', () => {
    expect(calcKg('transport', 'car_ev', 100)).toBe(5.3)
  })

  it('calculates flight emissions correctly', () => {
    expect(calcKg('transport', 'flight', 1000)).toBe(255)
  })

  it('returns 0 for zero-emission activity (bike)', () => {
    expect(calcKg('transport', 'bike', 50)).toBe(0)
  })

  it('calculates beef meal emissions', () => {
    expect(calcKg('food', 'beef', 1)).toBe(6.6)
  })

  it('calculates vegan meal emissions', () => {
    expect(calcKg('food', 'vegan', 1)).toBe(0.6)
  })

  it('calculates electricity emissions', () => {
    expect(calcKg('home', 'electricity', 100)).toBe(47.5)
  })

  it('returns 0 for unknown category', () => {
    expect(calcKg('unknown', 'car_petrol', 10)).toBe(0)
  })

  it('returns 0 for unknown activity', () => {
    expect(calcKg('transport', 'rocket', 10)).toBe(0)
  })

  it('returns 0 for zero quantity', () => {
    expect(calcKg('transport', 'car_petrol', 0)).toBe(0)
  })

  it('EV emits less than petrol for same distance', () => {
    const ev = calcKg('transport', 'car_ev', 100)
    const petrol = calcKg('transport', 'car_petrol', 100)
    expect(ev).toBeLessThan(petrol)
  })

  it('vegan meal emits less than beef meal', () => {
    const vegan = calcKg('food', 'vegan', 1)
    const beef = calcKg('food', 'beef', 1)
    expect(vegan).toBeLessThan(beef)
  })
})

describe('EMISSION_FACTORS structure', () => {
  it('has all required categories', () => {
    expect(EMISSION_FACTORS).toHaveProperty('transport')
    expect(EMISSION_FACTORS).toHaveProperty('food')
    expect(EMISSION_FACTORS).toHaveProperty('home')
    expect(EMISSION_FACTORS).toHaveProperty('things')
  })

  it('every factor entry has required fields', () => {
    for (const [, activities] of Object.entries(EMISSION_FACTORS)) {
      for (const [, def] of Object.entries(activities)) {
        expect(def).toHaveProperty('label')
        expect(def).toHaveProperty('factor')
        expect(def).toHaveProperty('unit')
        expect(def).toHaveProperty('emoji')
        expect(typeof def.factor).toBe('number')
        expect(def.factor).toBeGreaterThanOrEqual(0)
      }
    }
  })
})

describe('CATEGORY_META', () => {
  it('has emoji and label for every category', () => {
    for (const [, meta] of Object.entries(CATEGORY_META)) {
      expect(meta).toHaveProperty('emoji')
      expect(meta).toHaveProperty('label')
      expect(meta).toHaveProperty('color')
    }
  })
})
