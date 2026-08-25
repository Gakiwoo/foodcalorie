// 单位设置兑现：App 级加载 profile.unit_calorie / unit_weight，
// 页面通过 useUnits() 获取换算函数与单位后缀，使「单位设置」真实生效
// （修复原"保存了但永不生效"的假设置问题）。
import React, { createContext, useContext, useEffect, useState } from 'react'
import { http } from '../api/client'

// ── 纯换算函数（可直接单测）──
export const KCAL_PER_KJ = 4.184
export const GRAMS_PER_OZ = 28.3495

/** 热量显示值：kJ = kcal × 4.184；kcal 原样（均取整） */
export function convertCalorie(value, unit = 'kcal') {
  const n = Number(value) || 0
  return unit === 'kJ' ? Math.round(n * KCAL_PER_KJ) : Math.round(n)
}

/** 重量显示值：oz = g / 28.3495（保留 1 位小数）；g 原样（取整） */
export function convertWeight(value, unit = 'g') {
  const n = Number(value) || 0
  return unit === 'oz' ? Number((n / GRAMS_PER_OZ).toFixed(1)) : Math.round(n)
}

const DEFAULT_UNITS = { unitCalorie: 'kcal', unitWeight: 'g' }

const UnitContext = createContext({
  ...DEFAULT_UNITS,
  kcal: (v) => convertCalorie(v, 'kcal'),
  g: (v) => convertWeight(v, 'g')
})

export function UnitProvider({ children }) {
  const [unit, setUnit] = useState(DEFAULT_UNITS)

  useEffect(() => {
    let alive = true
    // 游客/未登录 401 或失败：保持默认 kcal/g，不打扰浏览
    http
      .get('/api/v1/foodcalorie/profile')
      .then((r) => {
        if (!alive) return
        setUnit({
          unitCalorie: r.data?.unit_calorie === 'kJ' ? 'kJ' : 'kcal',
          unitWeight: r.data?.unit_weight === 'oz' ? 'oz' : 'g'
        })
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  const value = {
    ...unit,
    kcal: (v) => convertCalorie(v, unit.unitCalorie),
    g: (v) => convertWeight(v, unit.unitWeight)
  }

  return <UnitContext.Provider value={value}>{children}</UnitContext.Provider>
}

export function useUnits() {
  return useContext(UnitContext)
}

export default UnitProvider
