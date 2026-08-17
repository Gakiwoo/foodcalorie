'use strict'
// Service 层：挑战业务（列表带我的进度 / 参与 / 每日打卡）
const challengeRepo = require('./repositories/challengeRepo')
const { ServiceError } = require('../../shared/utils/serviceError')
const { NOT_FOUND, RATE_LIMITED, PARAM_INVALID } = require('../../shared/utils/errors')
const { cnToday, cnYesterday } = require('../../shared/utils/date')

// 挑战窗口校验：今天必须落在 [start_date, end_date] 内（'YYYY-MM-DD' 字符串比较）
function assertWithinWindow(challenge) {
  const today = cnToday()
  if (challenge.start_date && today < challenge.start_date) {
    throw new ServiceError(400, PARAM_INVALID, '挑战尚未开始')
  }
  if (challenge.end_date && today > challenge.end_date) {
    throw new ServiceError(400, PARAM_INVALID, '挑战已结束，无法操作')
  }
}

// 活动列表：系统挑战 + 是否已加入 + 我的打卡进度
function listChallenges(userId) {
  return challengeRepo.listSystem().map((c) => {
    const p = challengeRepo.getParticipation(c.id, userId)
    return {
      id: c.id,
      name: c.name,
      start_date: c.start_date,
      end_date: c.end_date,
      tasks: c.tasks,
      points: c.points,
      joined: !!p,
      check_in_days: p?.check_in_days || 0,
      streak_days: p?.streak_days || 0,
      my_points: p?.points || 0,
      last_check_in: p?.last_check_in || null
    }
  })
}

function joinChallenge(userId, challengeId) {
  const challenge = challengeRepo.getById(challengeId)
  if (!challenge) throw new ServiceError(404, NOT_FOUND)
  assertWithinWindow(challenge)
  const { joined } = challengeRepo.join(challengeId, userId)
  return { id: challengeId, joined, message: joined ? '参与成功' : '已参与过该挑战' }
}

// 每日打卡：同日重复打卡返回 429；成功 +1 天 / +10 积分
// 连续打卡：昨天打过 → streak+1；断签（非昨天或首次）→ streak 重置为 1
function checkInChallenge(userId, challengeId) {
  const challenge = challengeRepo.getById(challengeId)
  if (!challenge) throw new ServiceError(404, NOT_FOUND)
  assertWithinWindow(challenge)
  const p = challengeRepo.getParticipation(challengeId, userId)
  if (!p) throw new ServiceError(404, NOT_FOUND, '请先参与挑战')
  const today = cnToday()
  if (p.last_check_in === today) {
    throw new ServiceError(429, RATE_LIMITED, '今日已打卡，明天再来吧')
  }
  const streak = p.last_check_in === cnYesterday() ? (p.streak_days || 0) + 1 : 1
  const updated = challengeRepo.checkIn(challengeId, userId, today, streak)
  return {
    id: challengeId,
    check_in_days: updated.check_in_days,
    streak_days: updated.streak_days,
    points: updated.points,
    last_check_in: updated.last_check_in,
    message: '打卡成功'
  }
}

module.exports = { listChallenges, joinChallenge, checkInChallenge }
