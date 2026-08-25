'use strict'
// DAO 层：挑战活动与参与进度
const { getDb } = require('../../../db')

function parseTasks(row) {
  if (!row) return null
  let tasks = []
  try {
    tasks = JSON.parse(row.tasks || '[]')
  } catch {
    tasks = []
  }
  return { ...row, tasks }
}

module.exports = {
  // 系统级挑战（user_id 为空）
  listSystem: () => getDb().prepare('SELECT * FROM challenges WHERE user_id IS NULL ORDER BY id').all().map(parseTasks),

  // 仅系统级挑战（user_id IS NULL）：防止未来支持用户自定义挑战后
  // 出现"加入/打卡他人创建挑战"的越权面（与 listSystem 口径一致）
  getById: (id) => parseTasks(getDb().prepare('SELECT * FROM challenges WHERE id = ? AND user_id IS NULL').get(id)),

  getParticipation: (challengeId, userId) =>
    getDb().prepare('SELECT * FROM challenge_participants WHERE challenge_id = ? AND user_id = ?').get(challengeId, userId),

  // 加入：UNIQUE(challenge_id, user_id) + INSERT OR IGNORE 原子防重，
  // 避免并发参与（多端同点）下 check-then-insert 抛 SQLITE_CONSTRAINT → 500
  join: (challengeId, userId) => {
    const db = getDb()
    const r = db
      .prepare('INSERT OR IGNORE INTO challenge_participants (challenge_id, user_id) VALUES (?, ?)')
      .run(challengeId, userId)
    return { joined: r.changes === 1 }
  },

  // 打卡：+1 天；streak_days 由 service 计算（昨天打卡→连续+1，断签→重置 1）
  // 原子防重：同日已打卡（last_check_in = today）时 UPDATE 命中 0 行返回 null，
  // 由 service 层转 429，杜绝 check-then-act 竞态导致并发重复打卡/刷积分（P1-3）
  checkIn: (challengeId, userId, today, streakDays) => {
    const db = getDb()
    const r = db.prepare(
      `UPDATE challenge_participants
       SET check_in_days = check_in_days + 1, streak_days = ?, points = points + 10, last_check_in = ?
       WHERE challenge_id = ? AND user_id = ? AND (last_check_in IS NULL OR last_check_in != ?)`
    ).run(streakDays, today, challengeId, userId, today)
    if (r.changes !== 1) return null
    return db.prepare('SELECT * FROM challenge_participants WHERE challenge_id = ? AND user_id = ?').get(challengeId, userId)
  }
}
