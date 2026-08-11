'use strict'
// DAO 层：用户食刻资料（user_profiles，与 gakiwoo users 表同库）
const { getDb } = require('../../../db')

const PROFILE_FIELDS = [
  'gender', 'birthday', 'height_cm', 'weight_kg', 'goal_type', 'target_calories',
  'diet_preferences', 'unit_calorie', 'unit_weight', 'precision_mode',
  'burst_enabled', 'burst_count',
  'notif_record', 'notif_goal', 'notif_community', 'notif_weekly', 'notif_activity',
  'quiet_start', 'quiet_end'
]

const DEFAULTS = {
  goal_type: '减脂',
  target_calories: 1400,
  diet_preferences: '[]',
  unit_calorie: 'kcal',
  unit_weight: 'g',
  precision_mode: 'standard',
  burst_enabled: 0,
  burst_count: 3,
  notif_record: 1,
  notif_goal: 1,
  notif_community: 0,
  notif_weekly: 1,
  notif_activity: 0,
  quiet_start: '22:00',
  quiet_end: '08:00'
}

function parseRow(row) {
  if (!row) return null
  let diet = row.diet_preferences
  try {
    diet = JSON.parse(row.diet_preferences || '[]')
  } catch {
    diet = []
  }
  return { ...row, diet_preferences: diet }
}

module.exports = {
  PROFILE_FIELDS,
  DEFAULTS,

  getByUserId: (userId) => parseRow(getDb().prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(userId)),

  // 存在则更新，不存在则按默认值创建（UPSERT）
  upsert: (userId, patch = {}) => {
    const db = getDb()
    const existing = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(userId)
    if (existing) {
      const sets = Object.keys(patch)
        .filter((k) => PROFILE_FIELDS.includes(k))
        .map((k) => `${k} = @${k}`)
        .join(', ')
      if (sets) {
        db.prepare(`UPDATE user_profiles SET ${sets}, updated_at = datetime('now') WHERE user_id = @user_id`).run({
          ...patch,
          user_id: userId
        })
      }
    } else {
      const row = { user_id: userId, ...DEFAULTS, ...patch }
      const keys = Object.keys(row)
      db.prepare(
        `INSERT INTO user_profiles (${keys.join(', ')}) VALUES (${keys.map((k) => '@' + k).join(', ')})`
      ).run(row)
    }
    return parseRow(db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(userId))
  },

  // 昵称在 gakiwoo users 表（共享库直接读；列不存在时容错返回 null）
  getNickname: (userId) => {
    try {
      const row = getDb().prepare('SELECT nickname FROM users WHERE id = ?').get(userId)
      return row?.nickname ?? null
    } catch {
      return null
    }
  }
}
