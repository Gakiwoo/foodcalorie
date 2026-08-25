import { describe, expect, it } from 'vitest'
import { normalizeDailyStats } from './common.jsx'

describe('home statistics resilience', () => {
  it('does not expose a renderable value for absent API data', () => {
    expect(normalizeDailyStats(null)).toBeNull()
    expect(normalizeDailyStats(undefined)).toBeNull()
  })

  it('normalizes incomplete numeric data into a safe render model', () => {
    expect(normalizeDailyStats({ total: '320', percent: '22.8' })).toEqual({
      total: 320,
      target: 1400,
      percent: 22.8,
      average: 0,
      reachedDays: 0,
      totalDays: 1,
    })
  })

  it('passes through the backend average (daily mean) instead of frontend fallback', () => {
    expect(normalizeDailyStats({ total: 500, target: 1400, percent: 36, average: 250, reachedDays: 2, totalDays: 7 })).toEqual({
      total: 500,
      target: 1400,
      percent: 36,
      average: 250,
      reachedDays: 2,
      totalDays: 7,
    })
  })

  it('tolerates malformed average values', () => {
    expect(normalizeDailyStats({ average: 'abc' }).average).toBe(0)
    expect(normalizeDailyStats({ average: undefined }).average).toBe(0)
  })
})
