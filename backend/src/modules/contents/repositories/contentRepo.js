'use strict'
// DAO 层：内容（发现页文章/食谱）
const { getDb } = require('../../../db')

function parseJson(v) {
  try {
    return JSON.parse(v)
  } catch {
    return null
  }
}

function decorate(row) {
  if (!row) return null
  return {
    ...row,
    ingredients: parseJson(row.ingredients),
    steps: parseJson(row.steps)
  }
}

module.exports = {
  list: ({ type = '', page = 1, pageSize = 20 }) => {
    const db = getDb()
    const where = type ? 'WHERE type = ?' : ''
    const params = type ? [type] : []
    const total = db.prepare(`SELECT COUNT(*) c FROM contents ${where}`).get(...params).c
    const list = db
      .prepare(`SELECT id, type, title, summary, cover_icon, author, views, calories, created_at FROM contents ${where} ORDER BY id DESC LIMIT ? OFFSET ?`)
      .all(...params, pageSize, (page - 1) * pageSize)
    return { list, total }
  },

  getById: (id) => decorate(getDb().prepare('SELECT * FROM contents WHERE id = ?').get(id)),

  incrementViews: (id) => getDb().prepare('UPDATE contents SET views = views + 1 WHERE id = ?').run(id)
}
