import { describe, it, expect } from 'vitest'
import { HABITS, USER_PROFILE } from '../data/habits'

const REQUIRED_HABIT_KEYS = [
  'GYM',
  'SKIN_MORNING',
  'SKIN_EVENING',
  'HAIR_OIL',
  'B12',
  'CALCIUM_MAG_ZINC_D3',
  'PROTEIN_SHAKE',
  'FRUIT',
  'BREAKFAST',
  'LUNCH',
  'DINNER',
  'WATER',
  'COLD_OUTREACH',
  'JOB_APPLICATIONS',
  'SLEEP',
  'WORK_PREP',
]

describe('HABITS config', () => {
  it('has all required keys', () => {
    for (const key of REQUIRED_HABIT_KEYS) {
      expect(HABITS).toHaveProperty(key)
    }
  })

  it('GYM tier1_target is 3', () => {
    expect(HABITS.GYM.tier1_target).toBe(3)
  })

  it('JOB_APPLICATIONS has tier1, tier2, tier3', () => {
    expect(HABITS.JOB_APPLICATIONS).toHaveProperty('tier1')
    expect(HABITS.JOB_APPLICATIONS).toHaveProperty('tier2')
    expect(HABITS.JOB_APPLICATIONS).toHaveProperty('tier3')
    expect(HABITS.JOB_APPLICATIONS.tier1).toBe(2)
    expect(HABITS.JOB_APPLICATIONS.tier2).toBe(5)
    expect(HABITS.JOB_APPLICATIONS.tier3).toBe(10)
  })

  it('SLEEP target_wake is 08:30', () => {
    expect(HABITS.SLEEP.target_wake).toBe('08:30')
  })
})

describe('USER_PROFILE', () => {
  it('has all required fields', () => {
    expect(USER_PROFILE).toMatchObject({
      name: expect.any(String),
      weight_kg: expect.any(Number),
      target_weight_kg: expect.any(Number),
      height_cm: expect.any(Number),
      diet: expect.any(String),
      daily_protein_target_g: expect.any(Number),
      current_tier: expect.any(Number),
    })
  })

  it('current_tier is 1', () => {
    expect(USER_PROFILE.current_tier).toBe(1)
  })
})
