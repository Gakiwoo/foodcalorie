'use strict'
// Service 层：记录业务逻辑与统计
const recordRepo = require('./repositories/recordRepo')
const { ServiceError } = require('../../shared/utils/serviceError')
const { RECORD_NOT_FOUND } = require('../../shared/utils/errors')
const { cnToday, cnDateTs, tsToCnDate } = require('../../shared/utils/date')

const DAY_MS = 24 * 60 * 60 * 1000

function today() {
  return cnToday()
}

// '2026-08-05' -> 该日北京时间 0 点时间戳
function dateTs(date) {
  return cnDateTs(date)
}

function weekRange(dateStr) {
  const ts = dateTs(dateStr || today())
  const day = new Date(ts + 8 * 3600 * 1000).getUTCDay() || 7 // 周一=1..周日=7
  const monday = ts - (day - 1) * DAY_MS
  const sunday = monday + 6 * DAY_MS
  return {
    from: tsToCnDate(monday),
    to: tsToCnDate(sunday)
  }
}

function monthRange(dateStr) {
  const ts = dateTs(dateStr || today())
  const from = tsToCnDate(ts)
  const y = Number(from.slice(0, 4))
  const m = Number(from.slice(5, 7))
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate() // 北京时间当月最后一天
  const to = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  return { from, to }
}

async function createRecord(userId, data) {
  const id = recordRepo.insertRecord({ ...data, user_id: userId, source: data.source || 'manual' })
  return recordRepo.findById(id, userId)
}

function listRecords(userId, { date, mealType }) {
  const rows = recordRepo.listByDate(userId, date || today())
  return mealType ? rows.filter((r) => r.meal_type === mealType) : rows
}

async function updateRecord(userId, id, data) {
  const exists = recordRepo.findById(id, userId)
  if (!exists) throw new ServiceError(404, RECORD_NOT_FOUND)
  // 部分更新：以现有记录为基底，仅覆盖传入字段（支持 PATCH 语义）
  const merged = { ...exists, ...data, id, user_id: userId }
  const changes = recordRepo.updateRecord(merged)
  if (changes === 0) throw new ServiceError(404, RECORD_NOT_FOUND)
  return recordRepo.findById(id, userId)
}

async function deleteRecord(userId, id) {
  const changes = recordRepo.deleteRecord(id, userId)
  if (changes === 0) throw new ServiceError(404, RECORD_NOT_FOUND)
  return { deleted: true }
}

// 统计：day / week / month
// 返回：总摄入、日均、达标天数（<= target）、环形百分比、按天明细
function getStats(userId, { range = 'day', date = today(), target = 1400 }) {
  let from, to
  if (range === 'week') ({ from, to } = weekRange(date))
  else if (range === 'month') ({ from, to } = monthRange(date))
  else ({ from, to } = { from: date, to: date })

  const rows = recordRepo.listByRange(userId, from, to)
  const total = rows.reduce((s, r) => s + (Number(r.calories) || 0), 0)
  const daysCount = range === 'month' ? new Date(dateTs(to)).getDate() : range === 'week' ? 7 : 1
  const daysIn = new Map()
  for (const r of rows) {
    const d = r.record_time.slice(0, 10)
    daysIn.set(d, (daysIn.get(d) || 0) + (Number(r.calories) || 0))
  }
  const reachedDays = [...daysIn.values()].filter((v) => v <= target).length
  const avg = daysCount > 0 ? Math.round(total / daysCount) : 0
  const pct = target > 0 ? Math.min(100, Math.round((total / target) * 100)) : 0

  return {
    range,
    from,
    to,
    total,
    average: avg,
    reachedDays,
    totalDays: daysCount,
    target,
    percent: pct,
    daily: Object.fromEntries(daysIn)
  }
}

// 月历：返回该月每天摄入与达标状态
function getCalendar(userId, { month = today().slice(0, 7) }) {
  const { from, to } = monthRange(`${month}-01`)
  const rows = recordRepo.listByRange(userId, from, to)
  const byDay = new Map()
  for (const r of rows) {
    const d = Number(r.record_time.slice(8, 10))
    byDay.set(d, (byDay.get(d) || 0) + (Number(r.calories) || 0))
  }
  return {
    month,
    days: [...byDay.entries()].map(([day, calories]) => ({ day, calories }))
  }
}

module.exports = {
  createRecord,
  listRecords,
  updateRecord,
  deleteRecord,
  getStats,
  getCalendar,
  today,
  weekRange,
  monthRange
}
