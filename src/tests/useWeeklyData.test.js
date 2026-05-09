import { describe, it, expect } from 'vitest'
import {
  BOOLEAN_FIELDS,
  gymStatus,
  avgWater,
  rowCompletionPct,
} from '../utils/weeklyStats'

describe('gymStatus', () => {
  it('is "great" when gym_days >= 4', () => {
    expect(gymStatus(4)).toBe('great')
    expect(gymStatus(6)).toBe('great')
    expect(gymStatus(7)).toBe('great')
  })

  it('is "acceptable" when gym_days >= 2 and < 4', () => {
    expect(gymStatus(2)).toBe('acceptable')
    expect(gymStatus(3)).toBe('acceptable')
  })

  it('is "bad" when gym_days < 2', () => {
    expect(gymStatus(0)).toBe('bad')
    expect(gymStatus(1)).toBe('bad')
  })
})

describe('avgWater', () => {
  it('averages an array of numbers', () => {
    expect(avgWater([0, 4, 8])).toBe(4)
    expect(avgWater([1, 2, 3, 4, 5])).toBe(3)
  })

  it('returns 0 for an empty array', () => {
    expect(avgWater([])).toBe(0)
  })

  it('returns 0 for undefined', () => {
    expect(avgWater(undefined)).toBe(0)
  })
})

describe('rowCompletionPct', () => {
  it('returns 0 for null/undefined row', () => {
    expect(rowCompletionPct(null)).toBe(0)
    expect(rowCompletionPct(undefined)).toBe(0)
  })

  it('counts only the truthy boolean fields', () => {
    const row = {}
    BOOLEAN_FIELDS.forEach((f) => {
      row[f] = false
    })
    row.gym_done = true
    row.skin_morning_done = true
    expect(rowCompletionPct(row)).toBeCloseTo(
      (2 / BOOLEAN_FIELDS.length) * 100
    )
  })

  it('returns 100 when every boolean field is true', () => {
    const row = {}
    BOOLEAN_FIELDS.forEach((f) => {
      row[f] = true
    })
    expect(rowCompletionPct(row)).toBe(100)
  })

  it('returns 0 when every boolean field is false', () => {
    const row = {}
    BOOLEAN_FIELDS.forEach((f) => {
      row[f] = false
    })
    expect(rowCompletionPct(row)).toBe(0)
  })
})
