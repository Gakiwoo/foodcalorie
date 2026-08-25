'use strict'
// 挑战模块测试：连续打卡（streak）/ 断签重置 / 同日重复 429
const { test, after } = require('node:test')
const assert = require('node:assert')

process.env.NODE_ENV = 'test'
// 测试隔离：避免 dotenv 从本机 .env 注入 REDIS_URL
process.env.REDIS_URL = ''
process.env.DB_PATH = require('path').join(require('os').tmpdir(), 'fc-challenge-test.db')
const fs = require('fs')
try { fs.unlinkSync(process.env.DB_PATH) } catch {}
const { getDb, closeDb } = require('../src/db')
const service = require('../src/modules/challenges/service')
const challengeRepo = require('../src/modules/challenges/repositories/challengeRepo')

after(() => { try { fs.unlinkSync(process.env.DB_PATH) } catch {}; closeDb() })

// 直接操作 participation 的 last_check_in 模拟时间线
function setLastCheckIn(challengeId, userId, date) {
  getDb().prepare('UPDATE challenge_participants SET last_check_in = ? WHERE challenge_id = ? AND user_id = ?').run(date, challengeId, userId)
}
function setStreak(challengeId, userId, streak) {
  getDb().prepare('UPDATE challenge_participants SET streak_days = ? WHERE challenge_id = ? AND user_id = ?').run(streak, challengeId, userId)
}
function cnToday() {
  return new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 10)
}
function cnYesterday() {
  return new Date(Date.now() + 8 * 3600 * 1000 - 86400 * 1000).toISOString().slice(0, 10)
}

const UID = 90001
const CID = () => getDb().prepare('SELECT id FROM challenges WHERE user_id IS NULL LIMIT 1').get().id

// 种子挑战的 start/end 可能早于当前日期：窗口校验上线后需把窗口拉长到覆盖今天，
// 原打卡/streak 用例才可继续运行（窗口拦截本身有独立用例验证）
test.before(() => {
  getDb().prepare('UPDATE challenges SET start_date = ?, end_date = ? WHERE user_id IS NULL')
    .run('2020-01-01', '2099-12-31')
})

test('首次参与挑战 → 打卡 streak=1', () => {
  const cid = CID()
  service.joinChallenge(UID, cid)
  const r = service.checkInChallenge(UID, cid)
  assert.strictEqual(r.check_in_days, 1)
  assert.strictEqual(r.streak_days, 1, '首次打卡连续 1 天')
  assert.strictEqual(r.points, 10)
})

test('昨天打过 → 今天连续打卡 streak+1', () => {
  const cid = CID()
  setLastCheckIn(cid, UID, cnYesterday())
  setStreak(cid, UID, 1)
  const r = service.checkInChallenge(UID, cid)
  assert.strictEqual(r.streak_days, 2, '连续 2 天')
  assert.strictEqual(r.check_in_days, 2)
})

test('断签（前天打过）→ 连续重置为 1，总天数仍累加', () => {
  const cid = CID()
  const dayBefore = new Date(Date.now() + 8 * 3600 * 1000 - 2 * 86400 * 1000).toISOString().slice(0, 10)
  setLastCheckIn(cid, UID, dayBefore)
  setStreak(cid, UID, 2)
  const r = service.checkInChallenge(UID, cid)
  assert.strictEqual(r.streak_days, 1, '断签重置为 1')
  assert.strictEqual(r.check_in_days, 3, '总打卡天数继续累加')
})

test('同日重复打卡 → 429', () => {
  const cid = CID()
  setLastCheckIn(cid, UID, cnToday())
  assert.throws(() => service.checkInChallenge(UID, cid), (e) => e.status === 429)
})

test('未参与挑战 → 404', () => {
  const cid = CID()
  assert.throws(() => service.checkInChallenge(UID + 1, cid), (e) => e.status === 404)
})

test('并发重复打卡 → 原子条件拦截（repo 层 changes=0）', () => {
  const cid = CID()
  const uid = UID + 100
  service.joinChallenge(uid, cid)
  const today = cnToday()
  // 绕过 service 读判定，直接并发两次 repo.checkIn，验证原子防重
  const first = challengeRepo.checkIn(cid, uid, today, 1)
  assert.ok(first, '第一次打卡成功')
  const second = challengeRepo.checkIn(cid, uid, today, 1)
  assert.strictEqual(second, null, '同日第二次打卡被原子条件拦截')
  const p = challengeRepo.getParticipation(cid, uid)
  assert.strictEqual(p.check_in_days, 1, '总天数只累加一次')
  assert.strictEqual(p.points, 10, '积分只累加一次')
})

test('listChallenges 返回 streak_days 字段', () => {
  const list = service.listChallenges(UID)
  const mine = list.find((c) => c.joined)
  assert.ok(mine, '有已参与挑战')
  assert.ok('streak_days' in mine, '包含连续打卡字段')
})

// ── 2026-08-17 回归：挑战窗口校验（过期挑战不得再加入/打卡刷积分）──
test('已结束的挑战 join → 400', () => {
  const cid = CID()
  getDb().prepare('UPDATE challenges SET end_date = ? WHERE id = ?').run('2020-01-01', cid)
  assert.throws(() => service.joinChallenge(UID + 2, cid), (e) => e.status === 400)
  // 恢复窗口供后续用例
  getDb().prepare('UPDATE challenges SET end_date = ? WHERE id = ?').run('2099-12-31', cid)
})

test('未开始的挑战 checkIn → 400', () => {
  const cid = CID()
  getDb().prepare('UPDATE challenges SET start_date = ? WHERE id = ?').run('2099-01-01', cid)
  // 先人为造一条参与记录（绕过 join 的窗口校验），验证 checkIn 层也拦截
  getDb().prepare('INSERT OR IGNORE INTO challenge_participants (challenge_id, user_id) VALUES (?, ?)').run(cid, UID + 3)
  assert.throws(() => service.checkInChallenge(UID + 3, cid), (e) => e.status === 400)
  getDb().prepare('UPDATE challenges SET start_date = ? WHERE id = ?').run('2020-01-01', cid)
})
