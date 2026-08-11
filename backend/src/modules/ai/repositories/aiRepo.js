'use strict'
// DAO 层：AI 识别（食物库匹配）
const { getDb } = require('../../../db')

const CATEGORY_POOL = ['主食', '肉蛋', '蔬菜', '水果', '轻食', '蛋奶', '海鲜', '豆制品', '坚果', '中式快餐']

module.exports = {
  // 按名称匹配食物库（精确 → 包含，返回第一条）
  findByName: (name) => {
    if (!name) return null
    const db = getDb()
    return (
      db.prepare('SELECT id, name, category, calories, protein_g, carbs_g, fat_g, unit_desc FROM food_items WHERE name = ? LIMIT 1').get(name.trim()) ||
      db.prepare('SELECT id, name, category, calories, protein_g, carbs_g, fat_g, unit_desc FROM food_items WHERE name LIKE ? LIMIT 1').get('%' + name.trim() + '%') ||
      null
    )
  },

  // 从食物库按分类均匀抽取候选（降级推荐策略）
  recommendCandidates: (limit = 8) => {
    const db = getDb()
    const picked = []
    for (const cat of CATEGORY_POOL) {
      const rows = db
        .prepare('SELECT id, name, category, calories, protein_g, carbs_g, fat_g, unit_desc FROM food_items WHERE category = ? ORDER BY RANDOM() LIMIT 2')
        .all(cat)
      picked.push(...rows)
      if (picked.length >= limit) break
    }
    if (picked.length < limit) {
      const extra = db
        .prepare('SELECT id, name, category, calories, protein_g, carbs_g, fat_g, unit_desc FROM food_items ORDER BY id LIMIT ?')
        .all(limit - picked.length)
      picked.push(...extra)
    }
    return picked.slice(0, limit).map((f, i) => ({ ...f, confidence: Number((0.9 - i * 0.04).toFixed(2)) }))
  },

  // 模型识别出的「新食物」回灌食物库（幂等：名称去重 + 营养有效才入库；source=model 标记）
  backfillModelFoods: (foods, limit = 3) => {
    const db = getDb()
    const inserted = []
    const ins = db.prepare(
      `INSERT INTO food_items (name, category, calories, protein_g, carbs_g, fat_g, unit_desc, source)
       VALUES (?, ?, ?, ?, ?, ?, '100g', 'model')`
    )
    const tx = db.transaction((list) => {
      for (const f of list) {
        const name = String(f.name || '').trim().slice(0, 50)
        if (!name) continue
        if (!(f.calories > 0) && !(f.protein_g > 0) && !(f.carbs_g > 0) && !(f.fat_g > 0)) continue // 营养全 0 不污染库
        const exists = db.prepare('SELECT id FROM food_items WHERE name = ?').get(name)
        if (exists) continue
        const r = ins.run(name, f.category || '未分类', Math.round(Number(f.calories) || 0), Number(f.protein_g) || 0, Number(f.carbs_g) || 0, Number(f.fat_g) || 0)
        inserted.push({ id: r.lastInsertRowid, name })
        if (inserted.length >= limit) break
      }
    })
    tx(foods)
    return inserted
  }
}
