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
      reachedDays: 0,
      totalDays: 1,
    })
  })
})
