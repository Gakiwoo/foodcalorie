'use strict'
// 收藏模块测试：增删查 + 重复收藏 409 + 并发防重（不落 500）+ 跨用户隔离
const { test, before, after } = require('node:test')
const assert = require('node:assert')
const request = require('supertest')
const jwt = require('jsonwebtoken')
const os = require('os')
const path = require('path')

process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-secret-for-unit-tests'
process.env.REDIS_URL = ''
process.env.DB_PATH = path.join(os.tmpdir(), `fc-favorites-test-${Date.now()}.db`)

const { createApp } = require('../src/app')
const { closeDb } = require('../src/db')

let app

function makeToken(userId) {
  return jwt.sign({ id: userId, email: 't@x.com', role: 'user' }, process.env.JWT_SECRET, { expiresIn: '15m' })
}

before(() => {
  app = createApp()
  require('../src/db').getDb() // 触发建表与种子
})

after(() => {
  closeDb()
  try { require('fs').unlinkSync(process.env.DB_PATH) } catch {}
})

test('收藏 → 201 favorited:true', async () => {
  const res = await request(app)
    .post('/api/v1/foodcalorie/favorites')
    .set('Authorization', 'Bearer ' + makeToken(91001))
    .send({ type: 'recipe', ref_id: 1 })
  assert.strictEqual(res.status, 201)
  assert.strictEqual(res.body.code, 0)
  assert.strictEqual(res.body.data.favorited, true)
})

test('重复收藏 → 409（非 500）', async () => {
  const token = 'Bearer ' + makeToken(91002)
  await request(app).post('/api/v1/foodcalorie/favorites').set('Authorization', token).send({ type: 'recipe', ref_id: 2 })
  const res = await request(app).post('/api/v1/foodcalorie/favorites').set('Authorization', token).send({ type: 'recipe', ref_id: 2 })
  assert.strictEqual(res.status, 409)
  assert.ok(res.body.code !== 10099, '不得落入通用 500 错误码')
})

test('并发双击收藏 → 恰好一次成功一次 409，无 500（原子防重）', async () => {
  const token = 'Bearer ' + makeToken(91003)
  const [a, b] = await Promise.allSettled([
    request(app).post('/api/v1/foodcalorie/favorites').set('Authorization', token).send({ type: 'article', ref_id: 3 }),
    request(app).post('/api/v1/foodcalorie/favorites').set('Authorization', token).send({ type: 'article', ref_id: 3 })
  ])
  const statuses = [a, b].map((r) => (r.status === 'fulfilled' ? r.value.status : r.reason?.status))
  assert.deepStrictEqual(statuses.sort(), [201, 409], `实际状态码: ${statuses}`)
})

test('收藏列表联查内容标题 + type 过滤', async () => {
  const token = 'Bearer ' + makeToken(91004)
  await request(app).post('/api/v1/foodcalorie/favorites').set('Authorization', token).send({ type: 'recipe', ref_id: 1 })
  const res = await request(app).get('/api/v1/foodcalorie/favorites?type=recipe').set('Authorization', token)
  assert.strictEqual(res.status, 200)
  assert.ok(Array.isArray(res.body.data))
  assert.ok(res.body.data.every((f) => f.type === 'recipe'))
})

test('取消收藏 → 200；重复取消 → 404', async () => {
  const token = 'Bearer ' + makeToken(91005)
  await request(app).post('/api/v1/foodcalorie/favorites').set('Authorization', token).send({ type: 'food', ref_id: 42 })
  const del = await request(app).delete('/api/v1/foodcalorie/favorites?type=food&ref_id=42').set('Authorization', token)
  assert.strictEqual(del.status, 200)
  const again = await request(app).delete('/api/v1/foodcalorie/favorites?type=food&ref_id=42').set('Authorization', token)
  assert.strictEqual(again.status, 404)
})

test('跨用户隔离：B 看不到 A 的收藏', async () => {
  const tokenA = 'Bearer ' + makeToken(91006)
  const tokenB = 'Bearer ' + makeToken(91007)
  await request(app).post('/api/v1/foodcalorie/favorites').set('Authorization', tokenA).send({ type: 'recipe', ref_id: 1 })
  const resB = await request(app).get('/api/v1/foodcalorie/favorites').set('Authorization', tokenB)
  assert.strictEqual(resB.status, 200)
  assert.ok(resB.body.data.every((f) => f.ref_id !== 1 || f.type !== 'recipe'), 'B 的列表不得包含 A 的收藏')
})
