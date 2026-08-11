'use strict'
// Service 层：数据导出（CSV / JSON），复用 records 域统计口径
const recordRepo = require('../records/repositories/recordRepo')
const { weekRange, monthRange, today } = require('../records/service')
const { ServiceError } = require('../../shared/utils/serviceError')
const { RANGE_INVALID, EXPORT_FAILED } = require('../../shared/utils/errors')

// 时间范围：day/week/month/all
function resolveRange(range, date) {
  if (range === 'all') return { from: '0000-01-01', to: '9999-12-31' }
  if (range === 'day') {
    const d = date || today() // 缺省日期回退今日（北京时间）
    return { from: d, to: d }
  }
  if (range === 'week') return weekRange(date)
  if (range === 'month') return monthRange(date)
  throw new ServiceError(400, RANGE_INVALID)
}

// CSV 转义 + 公式注入防护：以 = + - @ 开头的单元格前置单引号，
// 防止 Excel/WPS 打开时将用户输入当作公式执行（CSV Formula Injection）
function escapeCsv(v) {
  const s = v == null ? '' : String(v)
  const guarded = /^[=+\-@]/.test(s) ? "'" + s : s
  return /[",\n]/.test(guarded) ? '"' + guarded.replace(/"/g, '""') + '"' : guarded
}

function toCsv(rows) {
  const header = ['id', 'food_name', 'category', 'meal_type', 'calories', 'protein_g', 'carbs_g', 'fat_g', 'fiber_g', 'portion', 'record_time', 'source']
  const lines = [header.join(',')]
  for (const r of rows) {
    lines.push(header.map((h) => escapeCsv(r[h])).join(','))
  }
  return lines.join('\r\n')
}

function exportRecords(userId, { format = 'csv', range = 'all', date }) {
  try {
    const { from, to } = resolveRange(range, date)
    const rows = recordRepo.listByRange(userId, from, to)
    if (format === 'json') return { format, range, count: rows.length, records: rows }
    if (format === 'csv') return { format, range, count: rows.length, content: toCsv(rows), filename: `foodcalorie-records-${range}-${date || 'all'}.csv` }
    throw new ServiceError(400, RANGE_INVALID, 'format 仅支持 csv / json')
  } catch (e) {
    if (e instanceof ServiceError) throw e
    throw new ServiceError(500, EXPORT_FAILED)
  }
}

module.exports = { exportRecords }
