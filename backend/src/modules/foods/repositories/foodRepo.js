'use strict'
// DAO 层：食物库（food_items，系统级种子数据 + 可扩展）
const { getDb } = require('../../../db')

module.exports = {
  search: ({ keyword = '', category = '', page = 1, pageSize = 20 }) => {
    const db = getDb()
    const where = []
    const params = []
    if (keyword) {
      where.push('name LIKE ?')
      params.push(`%${keyword}%`)
    }
    if (category) {
      where.push('category = ?')
      params.push(category)
    }
    const cond = where.length ? 'WHERE ' + where.join(' AND ') : ''
    const total = db.prepare(`SELECT COUNT(*) c FROM food_items ${cond}`).get(...params).c
    const list = db
      .prepare(`SELECT * FROM food_items ${cond} ORDER BY id LIMIT ? OFFSET ?`)
      .all(...params, pageSize, (page - 1) * pageSize)
    return { list, total }
  },

  categories: () => getDb().prepare('SELECT DISTINCT category FROM food_items WHERE category IS NOT NULL ORDER BY category').all().map((r) => r.category)
}
