'use strict'
// DAO 层：收藏（favorites，UNIQUE(user_id,type,ref_id) 防重）
const { getDb } = require('../../../db')

module.exports = {
  // 联查 contents 标题/摘要/封面/热量（recipe/article），food 类型无对应行时为 null
  list: (userId, type = '') => {
    const db = getDb()
    const where = ['f.user_id = ?']
    const params = [userId]
    if (type) {
      where.push('f.type = ?')
      params.push(type)
    }
    const sql = `
      SELECT f.id, f.type, f.ref_id, f.created_at,
             c.title, c.summary, c.cover_icon, c.calories, c.views AS content_views
      FROM favorites f
      LEFT JOIN contents c ON c.id = f.ref_id AND f.type IN ('recipe', 'article')
      WHERE ${where.join(' AND ')}
      ORDER BY f.id DESC`
    return db.prepare(sql).all(...params)
  },

  add: (userId, type, refId) => {
    const db = getDb()
    const exists = db.prepare('SELECT id FROM favorites WHERE user_id = ? AND type = ? AND ref_id = ?').get(userId, type, refId)
    if (exists) return { inserted: false, id: exists.id }
    const id = db.prepare('INSERT INTO favorites (user_id, type, ref_id) VALUES (?, ?, ?)').run(userId, type, refId).lastInsertRowid
    return { inserted: true, id }
  },

  remove: (userId, type, refId) => {
    const db = getDb()
    return db.prepare('DELETE FROM favorites WHERE user_id = ? AND type = ? AND ref_id = ?').run(userId, type, refId).changes
  }
}
