'use strict'
// Service 层：记录业务逻辑与统计
const recordRepo = require('./repositories/recordRepo')
const { getDb } = require('../../db')
const { ServiceError } = require('../../shared/utils/serviceError')
const { RECORD_NOT_FOUND } = require('../../shared/utils/errors')
const { cnToday, cnDateTs, tsToCnDate } = require('../../shared/utils/date')
const { logger } = require('../../shared/utils/logger')
const imageStore = require('../../shared/uploads/imageStore')

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
  const selected = tsToCnDate(ts)
  const y = Number(selected.slice(0, 4))
  const m = Number(selected.slice(5, 7))
  const month = `${y}-${String(m).padStart(2, '0')}`
  const from = `${month}-01`
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate() // 北京时间当月最后一天
  const to = `${month}-${String(lastDay).padStart(2, '0')}`
  return { from, to }
}

// better-sqlite3 为同步引擎：这里无需 async，返回普通值（路由层 await 兼容）
function createRecord(userId, data) {
  const create = getDb().transaction(() => {
    if (data.image_url) imageStore.claim(data.image_url, userId)
    return recordRepo.insertRecord({ ...data, user_id: userId, source: data.source || 'manual' })
  })
  const id = create()
  return recordRepo.findById(id, userId)
}

function updateRecord(userId, id, data) {
  const exists = recordRepo.findById(id, userId)
  if (!exists) throw new ServiceError(404, RECORD_NOT_FOUND)
  // 部分更新：以现有记录为基底，仅覆盖传入字段（支持 PATCH 语义）
  const merged = { ...exists, ...data, id, user_id: userId }
  const imageChanged = merged.image_url !== exists.image_url
  const update = getDb().transaction(() => {
    if (imageChanged && merged.image_url) imageStore.claim(merged.image_url, userId)
    return recordRepo.updateRecord(merged)
  })
  const changes = update()
  if (changes === 0) throw new ServiceError(404, RECORD_NOT_FOUND)
  if (imageChanged && exists.image_url) {
    try { imageStore.removeOwnedUrl(exists.image_url, userId) } catch (error) {
      logger.warn({ err: error.message, image_url: exists.image_url }, '旧记录图片清理失败')
    }
  }
  return recordRepo.findById(id, userId)
}

function deleteRecord(userId, id) {
  const exists = recordRepo.findById(id, userId)
  if (!exists) throw new ServiceError(404, RECORD_NOT_FOUND)
  const changes = recordRepo.deleteRecord(id, userId)
  if (changes === 0) throw new ServiceError(404, RECORD_NOT_FOUND)
  if (exists.image_url) {
    try { imageStore.removeOwnedUrl(exists.image_url, userId) } catch (error) {
      logger.warn({ err: error.message, image_url: exists.image_url }, '记录图片清理失败')
    }
  }
  return { deleted: true }
}

// 列表查询：date/meal 条件在 SQL 层过滤 + 计数（分页下推，防巨型 OFFSET）
function listRecords(userId, { date, meal, page, pageSize }) {
  const offset = (page - 1) * pageSize
  let list
  let total
  if (date && meal) {
    list = recordRepo.listByDateMealPaged(userId, date, meal, pageSize, offset)
    total = recordRepo.countByDateMeal(userId, date, meal)
  } else if (date) {
    list = recordRepo.listByDatePaged(userId, date, pageSize, offset)
    total = recordRepo.countByDate(userId, date)
  } else if (meal) {
    list = recordRepo.listByRangeMealPaged(userId, '0000-01-01', '9999-12-31', meal, pageSize, offset)
    total = recordRepo.countByRangeMeal(userId, '0000-01-01', '9999-12-31', meal)
  } else {
    list = recordRepo.listByRangePaged(userId, '0000-01-01', '9999-12-31', pageSize, offset)
    total = recordRepo.countByRange(userId, '0000-01-01', '9999-12-31')
  }
  return { list, total }
}

function getRecord(userId, id) {
  const record = recordRepo.findById(id, userId)
  if (!record) throw new ServiceError(404, RECORD_NOT_FOUND)
  return record
}

// 统计：day / week / month
// 返回：总摄入、日均、达标天数（<= target）、环形百分比、按天明细
// 口径说明（与前端展示契约一致）：
// - total      区间内所有记录热量之和
// - average    总摄入 ÷ 区间总天数（day=1 / week=7 / month=当月天数）——"全周期日均"，
//              未记录的天按 0 摄入计入分母；如需"有记录天均值"请用 total ÷ loggedDays 自行计算
// - reachedDays 区间内有记录且当日摄入 <= target 的天数（0 摄入的未记录天不计入）
// - percent    总摄入 ÷ target（上限 100）
// - daily      按天聚合 { 'YYYY-MM-DD': 热量 }（仅包含有记录的天）
function getStats(userId, { range = 'day', date = today(), target = 1400 }) {
  let from, to
  if (range === 'week') ({ from, to } = weekRange(date))
  else if (range === 'month') ({ from, to } = monthRange(date))
  else ({ from, to } = { from: date, to: date })

  const rows = recordRepo.listByRange(userId, from, to)
  const total = rows.reduce((s, r) => s + (Number(r.calories) || 0), 0)
  // 月末日就是当月天数；直接解析日期字符串，避免受服务器本地时区影响。
  const daysCount = range === 'month' ? Number(to.slice(8, 10)) : range === 'week' ? 7 : 1
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
  updateRecord,
  deleteRecord,
  listRecords,
  getRecord,
  getStats,
  getCalendar,
  today,
  weekRange,
  monthRange
}
