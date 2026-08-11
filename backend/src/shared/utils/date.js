'use strict'
// 食刻统一中国时区（UTC+8）日期工具：所有"今天/昨天/范围"计算以北京时间为准，
// 避免服务器 TZ（UTC / UTC+8 不定）导致的跨日错位（原 records 用 UTC toISOString，
// challenges 用 +8h 补偿，两套逻辑并存——统一收口到此文件）
const CN_OFFSET_MS = 8 * 3600 * 1000

/** 北京时间今天：'YYYY-MM-DD' */
function cnToday() {
  return new Date(Date.now() + CN_OFFSET_MS).toISOString().slice(0, 10)
}

/** 北京时间昨天：'YYYY-MM-DD'（连续打卡判定基准） */
function cnYesterday() {
  return new Date(Date.now() + CN_OFFSET_MS - 86400 * 1000).toISOString().slice(0, 10)
}

/** 'YYYY-MM-DD' → 北京时间 0 点时间戳（不依赖服务器 TZ） */
function cnDateTs(date) {
  return new Date(date + 'T00:00:00+08:00').getTime()
}

/** 时间戳 → 北京时间日期字符串 */
function tsToCnDate(ts) {
  return new Date(ts + CN_OFFSET_MS).toISOString().slice(0, 10)
}

module.exports = { cnToday, cnYesterday, cnDateTs, tsToCnDate }
