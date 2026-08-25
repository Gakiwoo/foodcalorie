import { describe, expect, it } from 'vitest'
import { convertCalorie, convertWeight, KCAL_PER_KJ, GRAMS_PER_OZ } from './units.jsx'

describe('convertCalorie 热量单位换算（kcal ↔ kJ）', () => {
  it('kcal 原样返回（取整）', () => {
    expect(convertCalorie(320, 'kcal')).toBe(320)
    expect(convertCalorie(320.6, 'kcal')).toBe(321)
  })

  it('kJ = kcal × 4.184', () => {
    expect(convertCalorie(320, 'kJ')).toBe(Math.round(320 * KCAL_PER_KJ))
    expect(convertCalorie(0, 'kJ')).toBe(0)
  })

  it('非法/缺失值按 0 处理', () => {
    expect(convertCalorie(null, 'kJ')).toBe(0)
    expect(convertCalorie('abc', 'kJ')).toBe(0)
    expect(convertCalorie(undefined, 'kJ')).toBe(0)
  })
})

describe('convertWeight 重量单位换算（g ↔ oz）', () => {
  it('g 原样返回（取整）', () => {
    expect(convertWeight(30, 'g')).toBe(30)
    expect(convertWeight(30.4, 'g')).toBe(30)
  })

  it('oz = g / 28.3495（保留 1 位小数）', () => {
    expect(convertWeight(28.3495, 'oz')).toBe(1)
    expect(convertWeight(100, 'oz')).toBe(Number((100 / GRAMS_PER_OZ).toFixed(1)))
  })

  it('非法/缺失值按 0 处理', () => {
    expect(convertWeight(null, 'oz')).toBe(0)
    expect(convertWeight('abc', 'oz')).toBe(0)
  })
})
