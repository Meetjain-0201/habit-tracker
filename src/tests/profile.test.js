import { describe, it, expect } from 'vitest'
import { MEAL_PLAN } from '../data/mealPlan'
import { TIERS } from '../data/tiers'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

describe('Profile data', () => {
  it('MEAL_PLAN has all 7 days', () => {
    for (const d of DAYS) {
      expect(MEAL_PLAN).toHaveProperty(d)
    }
    expect(Object.keys(MEAL_PLAN)).toHaveLength(7)
  })

  it('each MEAL_PLAN day has breakfast, lunch, and dinner keys', () => {
    for (const day of Object.values(MEAL_PLAN)) {
      expect(day).toHaveProperty('breakfast')
      expect(day).toHaveProperty('lunch')
      expect(day).toHaveProperty('dinner')
      expect(typeof day.breakfast).toBe('string')
      expect(typeof day.lunch).toBe('string')
      expect(typeof day.dinner).toBe('string')
    }
  })

  it('TIERS has correct targets for each tier', () => {
    expect(TIERS[1].gym).toBe(3)
    expect(TIERS[1].applications).toBe(2)
    expect(TIERS[1].cold_outreach).toBe(1)
    expect(TIERS[1].streak_days).toBe(7)

    expect(TIERS[2].gym_min).toBe(4)
    expect(TIERS[2].gym_max).toBe(5)
    expect(TIERS[2].applications).toBe(5)
    expect(TIERS[2].streak_days).toBe(14)

    expect(TIERS[3].gym).toBe(6)
    expect(TIERS[3].applications).toBe(10)
    expect(TIERS[3].cold_outreach).toBe(1)
  })
})
