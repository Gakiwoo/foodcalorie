'use strict'
// 资料模块测试：首次访问自动建默认档 / 部分更新 / 偏好序列化 / 单位设置 / zod 校验 / 跨用户隔离
const { test, before, after } = require('node:test')
const assert = require('node:assert')
const request = require('supertest')
const jwt = require('jsonwebtoken')
const os = require('os')
const path = require('path')

process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-secret-for-profiles'
process.env.REDIS_URL = ''
process.env.DB_PATH = path.join(os.tmpdir(), `fc-profiles-test-${Date.now()}.db`)

const { createApp } = require('../src/app')
const { closeDb } = require('../src/db')

let app

function makeToken(userId) {
  return jwt.sign({ id: userId, email: 't@x.com', role: 'user' }, process.env.JWT_SECRET, { expiresIn: '15m' })
}

before(() => {
  app = createApp()
  require('../src/db').getDb()
})

after(() => {
  closeDb()
  try { require('fs').unlinkSync(process.env.DB_PATH) } catch {}
})

test('GET 首次访问 → 200，自动创建默认档（target_calories=1400, goal_type=减脂）', async () => {
  const res = await request(app)
    .get('/api/v1/foodcalorie/profile')
    .set('Authorization', 'Bearer ' + makeToken(92001))
  assert.strictEqual(res.status, 200)
  assert.strictEqual(res.body.code, 0)
  assert.strictEqual(res.body.data.target_calories, 1400)
  assert.strictEqual(res.body.data.goal_type, '减脂')
  assert.strictEqual(res.body.data.unit_calorie, 'kcal')
  assert.strictEqual(res.body.data.unit_weight, 'g')
  assert.strictEqual(res.body.data.precision_mode, 'standard')
})

test('PUT 更新目标热量 → 200，更新成功且 GET 回读一致', async () => {
  const token = 'Bearer ' + makeToken(92002)
  const put = await request(app)
    .put('/api/v1/foodcalorie/profile')
    .set('Authorization', token)
    .send({ target_calories: 1800, goal_type: '增肌' })
  assert.strictEqual(put.status, 200)
  assert.strictEqual(put.body.data.target_calories, 1800)
  assert.strictEqual(put.body.data.goal_type, '增肌')

  const get = await request(app).get('/api/v1/foodcalorie/profile').set('Authorization', token)
  assert.strictEqual(get.body.data.target_calories, 1800)
  assert.strictEqual(get.body.data.goal_type, '增肌')
})

test('PUT 更新饮食偏好（数组）→ 200，序列化为 JSON 存储且回读为数组', async () => {
  const token = 'Bearer ' + makeToken(92003)
  const prefs = ['清淡', '高蛋白', '海鲜']
  const res = await request(app)
    .put('/api/v1/foodcalorie/profile')
    .set('Authorization', token)
    .send({ diet_preferences: prefs })
  assert.strictEqual(res.status, 200)
  assert.deepStrictEqual(res.body.data.diet_preferences, prefs)

  const get = await request(app).get('/api/v1/foodcalorie/profile').set('Authorization', token)
  assert.deepStrictEqual(get.body.data.diet_preferences, prefs)
})

test('PUT 更新单位设置 → 200，kcal→kJ / g→oz', async () => {
  const token = 'Bearer ' + makeToken(92004)
  const res = await request(app)
    .put('/api/v1/foodcalorie/profile')
    .set('Authorization', token)
    .send({ unit_calorie: 'kJ', unit_weight: 'oz' })
  assert.strictEqual(res.status, 200)
  assert.strictEqual(res.body.data.unit_calorie, 'kJ')
  assert.strictEqual(res.body.data.unit_weight, 'oz')
})

test('PUT 更新通知设置（boolean→0/1）→ 200', async () => {
  const token = 'Bearer ' + makeToken(92005)
  const res = await request(app)
    .put('/api/v1/foodcalorie/profile')
    .set('Authorization', token)
    .send({ notif_record: false, notif_community: true, burst_enabled: true, burst_count: 5 })
  assert.strictEqual(res.status, 200)
  assert.strictEqual(res.body.data.notif_record, 0)
  assert.strictEqual(res.body.data.notif_community, 1)
  assert.strictEqual(res.body.data.burst_enabled, 1)
  assert.strictEqual(res.body.data.burst_count, 5)
})

test('PUT 无效枚举值（zod 校验）→ 400，不落入 500', async () => {
  const token = 'Bearer ' + makeToken(92006)
  const res = await request(app)
    .put('/api/v1/foodcalorie/profile')
    .set('Authorization', token)
    .send({ goal_type: '无效目标', unit_calorie: '卡路里' })
  assert.strictEqual(res.status, 400)
  assert.ok(res.body.code !== 10099, '不得落入通用 500 错误码')
})

test('PUT 数值越界（target_calories<800 或 >6000）→ 400', async () => {
  const token = 'Bearer ' + makeToken(92007)
  const low = await request(app)
    .put('/api/v1/foodcalorie/profile')
    .set('Authorization', token)
    .send({ target_calories: 100 })
  assert.strictEqual(low.status, 400)

  const high = await request(app)
    .put('/api/v1/foodcalorie/profile')
    .set('Authorization', token)
    .send({ target_calories: 99999 })
  assert.strictEqual(high.status, 400)
})

test('跨用户隔离：A 更新目标不影响 B', async () => {
  const tokenA = 'Bearer ' + makeToken(92008)
  const tokenB = 'Bearer ' + makeToken(92009)
  await request(app).put('/api/v1/foodcalorie/profile').set('Authorization', tokenA).send({ target_calories: 2000 })
  const getB = await request(app).get('/api/v1/foodcalorie/profile').set('Authorization', tokenB)
  assert.strictEqual(getB.body.data.target_calories, 1400, 'B 应为默认值 1400，不得受 A 影响')
})

test('未登录访问 → 401', async () => {
  const res = await request(app).get('/api/v1/foodcalorie/profile')
  assert.strictEqual(res.status, 401)
})
