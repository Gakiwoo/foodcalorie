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
    // 原子防重：UNIQUE(user_id,type,ref_id) + INSERT OR IGNORE，
    // 避免 check-then-insert 在并发（双击收藏/多端同时收藏）下抛未捕获的
    // SQLITE_CONSTRAINT → 500；changes=1 表示本次真正插入，否则查回已存在行
    const r = db
      .prepare('INSERT OR IGNORE INTO favorites (user_id, type, ref_id) VALUES (?, ?, ?)')
      .run(userId, type, refId)
    if (r.changes === 1) return { inserted: true, id: Number(r.lastInsertRowid) }
    const existing = db.prepare('SELECT id FROM favorites WHERE user_id = ? AND type = ? AND ref_id = ?').get(userId, type, refId)
    return { inserted: false, id: existing?.id ?? null }
  },

  remove: (userId, type, refId) => {
    const db = getDb()
    return db.prepare('DELETE FROM favorites WHERE user_id = ? AND type = ? AND ref_id = ?').run(userId, type, refId).changes
  }
}
