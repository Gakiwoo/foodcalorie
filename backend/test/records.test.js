'use strict'
// M3 记录域测试：CRUD + 统计 + 鉴权（使用测试库）
const { test, before, after } = require('node:test')
const assert = require('node:assert')
const request = require('supertest')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const os = require('os')
const path = require('path')

// 测试环境：独立临时 DB
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-for-unit-tests'
const tmpDb = path.join(os.tmpdir(), `fc-test-${Date.now()}.db`)
process.env.DB_PATH = tmpDb

const { createApp } = require('../src/app')
const { closeDb } = require('../src/db')

let app
let token

function makeToken(userId = 42) {
  return jwt.sign({ id: userId, email: 't@x.com', role: 'user' }, process.env.JWT_SECRET, {
    expiresIn: '15m'
  })
}

const recordBody = {
  food_name: '红烧牛肉面',
  category: '中式面食',
  meal_type: '午餐',
  calories: 520,
  protein_g: 28,
  carbs_g: 65,
  fat_g: 18,
  portion: '1 份',
  record_time: '2026-08-05 12:30'
}

before(() => {
  app = createApp()
  token = makeToken()
})

after(() => {
  closeDb()
  try { fs.unlinkSync(tmpDb) } catch {}
  try { fs.unlinkSync(tmpDb + '-wal') } catch {}
  try { fs.unlinkSync(tmpDb + '-shm') } catch {}
})

test('未认证访问 records → 401 code=20001', async () => {
  const res = await request(app).get('/api/v1/foodcalorie/records')
  assert.strictEqual(res.status, 401)
  assert.strictEqual(res.body.code, 20001)
})

test('创建记录 → 201', async () => {
  const res = await request(app)
    .post('/api/v1/foodcalorie/records')
    .set('Authorization', `Bearer ${token}`)
    .send(recordBody)
  assert.strictEqual(res.status, 201)
  assert.strictEqual(res.body.code, 0)
  assert.strictEqual(res.body.data.food_name, '红烧牛肉面')
  assert.strictEqual(res.body.data.user_id, 42)
})

test('参数校验：非法餐次 → 400 code=10001', async () => {
  const res = await request(app)
    .post('/api/v1/foodcalorie/records')
    .set('Authorization', `Bearer ${token}`)
    .send({ ...recordBody, meal_type: '宵夜' })
  assert.strictEqual(res.status, 400)
  assert.strictEqual(res.body.code, 10001)
})

test('按日期查询记录', async () => {
  const res = await request(app)
    .get('/api/v1/foodcalorie/records?date=2026-08-05')
    .set('Authorization', `Bearer ${token}`)
  assert.strictEqual(res.status, 200)
  assert.strictEqual(res.body.code, 0)
  assert.ok(res.body.data.total >= 1)
  assert.strictEqual(res.body.data.list[0].food_name, '红烧牛肉面')
})

test('编辑记录', async () => {
  const list = await request(app)
    .get('/api/v1/foodcalorie/records?date=2026-08-05')
    .set('Authorization', `Bearer ${token}`)
  const id = list.body.data.list[0].id
  const res = await request(app)
    .put(`/api/v1/foodcalorie/records/${id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ ...recordBody, calories: 600 })
  assert.strictEqual(res.status, 200)
  assert.strictEqual(res.body.data.calories, 600)
})

test('日统计 stats?range=day', async () => {
  const res = await request(app)
    .get('/api/v1/foodcalorie/records/stats?range=day&date=2026-08-05&target=1400')
    .set('Authorization', `Bearer ${token}`)
  assert.strictEqual(res.status, 200)
  assert.strictEqual(res.body.data.total, 600) // 编辑后 600
  assert.strictEqual(res.body.data.percent, 43) // 600/1400≈43%
})

test('周统计 stats?range=week', async () => {
  const res = await request(app)
    .get('/api/v1/foodcalorie/records/stats?range=week&date=2026-08-05')
    .set('Authorization', `Bearer ${token}`)
  assert.strictEqual(res.status, 200)
  assert.strictEqual(res.body.data.range, 'week')
  assert.ok(res.body.data.total >= 600)
})

test('月历 calendar', async () => {
  const res = await request(app)
    .get('/api/v1/foodcalorie/records/calendar?month=2026-08')
    .set('Authorization', `Bearer ${token}`)
  assert.strictEqual(res.status, 200)
  assert.ok(res.body.data.days.some((d) => d.day === 5))
})

test('删除记录 → 200，再查 → 不存在', async () => {
  const list = await request(app)
    .get('/api/v1/foodcalorie/records?date=2026-08-05')
    .set('Authorization', `Bearer ${token}`)
  const id = list.body.data.list[0].id
  const del = await request(app)
    .delete(`/api/v1/foodcalorie/records/${id}`)
    .set('Authorization', `Bearer ${token}`)
  assert.strictEqual(del.status, 200)

  const detail = await request(app)
    .get(`/api/v1/foodcalorie/records/${id}`)
    .set('Authorization', `Bearer ${token}`)
  assert.strictEqual(detail.status, 404)
  assert.strictEqual(detail.body.code, 30001)
})

test('越权访问他人记录 → 404（数据隔离）', async () => {
  // 用户 42 创建的记录，用户 99 访问 → 404
  const list = await request(app)
    .get('/api/v1/foodcalorie/records?date=2026-08-05')
    .set('Authorization', `Bearer ${token}`)
  const id = list.body.data.list[0]?.id
  if (id) {
    const res = await request(app)
      .get(`/api/v1/foodcalorie/records/${id}`)
      .set('Authorization', `Bearer ${makeToken(99)}`)
    assert.strictEqual(res.status, 404)
  }
})

test('stats 未传 target 时读用户 profile.target_calories', async () => {
  // 设置用户目标 1800
  const put = await request(app)
    .put('/api/v1/foodcalorie/profile')
    .set('Authorization', `Bearer ${token}`)
    .send({ target_calories: 1800 })
  assert.strictEqual(put.status, 200)

  // 不传 target 参数 → stats.target 应为 1800（读 profile）
  const res = await request(app)
    .get('/api/v1/foodcalorie/records/stats?range=day&date=2026-08-05')
    .set('Authorization', `Bearer ${token}`)
  assert.strictEqual(res.status, 200)
  assert.strictEqual(res.body.data.target, 1800)

  // 显式传 target 时优先
  const res2 = await request(app)
    .get('/api/v1/foodcalorie/records/stats?range=day&date=2026-08-05&target=1200')
    .set('Authorization', `Bearer ${token}`)
  assert.strictEqual(res2.body.data.target, 1200)
})
