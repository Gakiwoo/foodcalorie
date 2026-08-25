'use strict'
// DAO 层：食物记录数据访问（better-sqlite3 纯 SQL）
const { getDb } = require('../../../db')

// ── 半开区间转换：record_time 列直接比较（可走 idx_records_user_time 索引）──
// 原 substr(record_time,1,10) BETWEEN 写法对列做函数运算，索引无法用于范围扫描，
// 记录量增长后列表/统计/导出线性退化。现改为 [from||' 00:00', 次日||' 00:00')。
function nextDay(dateStr) {
  const d = new Date(dateStr + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10)
}
function dayBounds(dateStr) {
  return [dateStr + ' 00:00', nextDay(dateStr) + ' 00:00']
}
function rangeBounds(from, to) {
  return [from + ' 00:00', nextDay(to) + ' 00:00']
}

const INSERT = `INSERT INTO food_records
  (user_id, food_name, category, meal_type, calories, protein_g, carbs_g, fat_g, fiber_g, portion, record_time, source, image_url)
  VALUES (@user_id, @food_name, @category, @meal_type, @calories, @protein_g, @carbs_g, @fat_g, @fiber_g, @portion, @record_time, @source, @image_url)`

const BY_ID = `SELECT * FROM food_records WHERE id = ? AND user_id = ?`
const LIST_BY_DATE = `SELECT * FROM food_records WHERE user_id = ? AND record_time >= ? AND record_time < ? ORDER BY record_time DESC`
const LIST_BY_RANGE = `SELECT * FROM food_records WHERE user_id = ? AND record_time >= ? AND record_time < ? ORDER BY record_time DESC`
// SQL 分页：与 routes 的 page/pageSize 对齐（替代内存 slice）；meal 餐次条件一并下推
const LIST_BY_DATE_PAGED = `${LIST_BY_DATE} LIMIT ? OFFSET ?`
const LIST_BY_RANGE_PAGED = `${LIST_BY_RANGE} LIMIT ? OFFSET ?`
const LIST_BY_DATE_MEAL_PAGED = `${LIST_BY_DATE.replace('ORDER BY', 'AND meal_type = ? ORDER BY')} LIMIT ? OFFSET ?`
const LIST_BY_RANGE_MEAL_PAGED = `${LIST_BY_RANGE.replace('ORDER BY', 'AND meal_type = ? ORDER BY')} LIMIT ? OFFSET ?`
const COUNT_BY_DATE = `SELECT COUNT(*) AS total FROM food_records WHERE user_id = ? AND record_time >= ? AND record_time < ?`
const COUNT_BY_RANGE = `SELECT COUNT(*) AS total FROM food_records WHERE user_id = ? AND record_time >= ? AND record_time < ?`
const COUNT_BY_DATE_MEAL = `${COUNT_BY_DATE.replace('record_time < ?', 'record_time < ? AND meal_type = ?')}`
const COUNT_BY_RANGE_MEAL = `${COUNT_BY_RANGE.replace('record_time < ?', 'record_time < ? AND meal_type = ?')}`
const UPDATE = `UPDATE food_records SET
  food_name = @food_name, category = @category, meal_type = @meal_type,
  calories = @calories, protein_g = @protein_g, carbs_g = @carbs_g, fat_g = @fat_g,
  fiber_g = @fiber_g, portion = @portion, record_time = @record_time, source = @source,
  image_url = @image_url, updated_at = datetime('now')
  WHERE id = @id AND user_id = @user_id`
const DELETE = `DELETE FROM food_records WHERE id = ? AND user_id = ?`
const COUNT = `SELECT COUNT(*) AS total FROM food_records WHERE user_id = ?`

module.exports = {
  // better-sqlite3 不接受 undefined：统一 null 兜底
  insertRecord: (row) => {
    const clean = { ...row, category: row.category ?? null, image_url: row.image_url ?? null }
    return getDb().prepare(INSERT).run(clean).lastInsertRowid
  },
  findById: (id, userId) => getDb().prepare(BY_ID).get(id, userId),
  listByDate: (userId, date) => getDb().prepare(LIST_BY_DATE).all(userId, ...dayBounds(date)),
  listByRange: (userId, from, to) => getDb().prepare(LIST_BY_RANGE).all(userId, ...rangeBounds(from, to)),
  // SQL 分页版（列表接口使用，替代内存 slice）
  listByDatePaged: (userId, date, limit, offset) => getDb().prepare(LIST_BY_DATE_PAGED).all(userId, ...dayBounds(date), limit, offset),
  listByRangePaged: (userId, from, to, limit, offset) => getDb().prepare(LIST_BY_RANGE_PAGED).all(userId, ...rangeBounds(from, to), limit, offset),
  listByDateMealPaged: (userId, date, meal, limit, offset) => getDb().prepare(LIST_BY_DATE_MEAL_PAGED).all(userId, ...dayBounds(date), meal, limit, offset),
  listByRangeMealPaged: (userId, from, to, meal, limit, offset) => getDb().prepare(LIST_BY_RANGE_MEAL_PAGED).all(userId, ...rangeBounds(from, to), meal, limit, offset),
  countByDate: (userId, date) => getDb().prepare(COUNT_BY_DATE).get(userId, ...dayBounds(date)).total,
  countByRange: (userId, from, to) => getDb().prepare(COUNT_BY_RANGE).get(userId, ...rangeBounds(from, to)).total,
  countByDateMeal: (userId, date, meal) => getDb().prepare(COUNT_BY_DATE_MEAL).get(userId, ...dayBounds(date), meal).total,
  countByRangeMeal: (userId, from, to, meal) => getDb().prepare(COUNT_BY_RANGE_MEAL).get(userId, ...rangeBounds(from, to), meal).total,
  updateRecord: (row) => {
    const clean = { ...row, category: row.category ?? null, image_url: row.image_url ?? null }
    return getDb().prepare(UPDATE).run(clean).changes
  },
  deleteRecord: (id, userId) => getDb().prepare(DELETE).run(id, userId).changes,
  count: (userId) => getDb().prepare(COUNT).get(userId).total
}
