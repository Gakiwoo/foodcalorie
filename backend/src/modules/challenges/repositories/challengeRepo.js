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

  getById: (id) => parseTasks(getDb().prepare('SELECT * FROM challenges WHERE id = ?').get(id)),

  getParticipation: (challengeId, userId) =>
    getDb().prepare('SELECT * FROM challenge_participants WHERE challenge_id = ? AND user_id = ?').get(challengeId, userId),

  join: (challengeId, userId) => {
    const db = getDb()
    const exists = db.prepare('SELECT id FROM challenge_participants WHERE challenge_id = ? AND user_id = ?').get(challengeId, userId)
    if (exists) return { joined: false }
    db.prepare('INSERT INTO challenge_participants (challenge_id, user_id) VALUES (?, ?)').run(challengeId, userId)
    return { joined: true }
  },

  // 打卡：+1 天；streak_days 由 service 计算（昨天打卡→连续+1，断签→重置 1）
  checkIn: (challengeId, userId, today, streakDays) => {
    const db = getDb()
    db.prepare(
      `UPDATE challenge_participants
       SET check_in_days = check_in_days + 1, streak_days = ?, points = points + 10, last_check_in = ?
       WHERE challenge_id = ? AND user_id = ?`
    ).run(streakDays, today, challengeId, userId)
    return db.prepare('SELECT * FROM challenge_participants WHERE challenge_id = ? AND user_id = ?').get(challengeId, userId)
  },

  updateLastCheckIn: (challengeId, userId, today) => {
    getDb().prepare('UPDATE challenge_participants SET last_check_in = ? WHERE challenge_id = ? AND user_id = ?').run(today, challengeId, userId)
  }
}
