'use strict'
// 内容模块测试：列表分页 / type 过滤 / 详情浏览量原子递增 / 不存在 404 / 分页校验 / 未登录
const { test, before, after } = require('node:test')
const assert = require('node:assert')
const request = require('supertest')
const jwt = require('jsonwebtoken')
const os = require('os')
const path = require('path')

process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-secret-for-contents'
process.env.REDIS_URL = ''
process.env.DB_PATH = path.join(os.tmpdir(), `fc-contents-test-${Date.now()}.db`)

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

test('GET 列表（无过滤）→ 200，返回分页结构，total=6（3 recipe + 3 article）', async () => {
  const res = await request(app)
    .get('/api/v1/foodcalorie/contents')
    .set('Authorization', 'Bearer ' + makeToken(93001))
  assert.strictEqual(res.status, 200)
  assert.strictEqual(res.body.code, 0)
  assert.strictEqual(res.body.data.total, 6)
  assert.ok(Array.isArray(res.body.data.list))
  assert.strictEqual(res.body.data.page, 1)
  assert.strictEqual(res.body.data.pageSize, 20)
})

test('GET 按 type=recipe 过滤 → 200，全部为 recipe 且 total=3', async () => {
  const res = await request(app)
    .get('/api/v1/foodcalorie/contents?type=recipe')
    .set('Authorization', 'Bearer ' + makeToken(93002))
  assert.strictEqual(res.status, 200)
  assert.strictEqual(res.body.data.total, 3)
  assert.ok(res.body.data.list.every((c) => c.type === 'recipe'))
})

test('GET 按 type=article 过滤 → 200，全部为 article 且 total=3', async () => {
  const res = await request(app)
    .get('/api/v1/foodcalorie/contents?type=article')
    .set('Authorization', 'Bearer ' + makeToken(93003))
  assert.strictEqual(res.status, 200)
  assert.strictEqual(res.body.data.total, 3)
  assert.ok(res.body.data.list.every((c) => c.type === 'article'))
})

test('GET 详情 → 200，返回内容且浏览量 +1（原子递增）', async () => {
  const token = 'Bearer ' + makeToken(93004)
  const first = await request(app)
    .get('/api/v1/foodcalorie/contents/1')
    .set('Authorization', token)
  assert.strictEqual(first.status, 200)
  assert.strictEqual(first.body.data.id, 1)
  const viewsAfterFirst = first.body.data.views

  const second = await request(app)
    .get('/api/v1/foodcalorie/contents/1')
    .set('Authorization', token)
  assert.strictEqual(second.body.data.views, viewsAfterFirst + 1, '第二次访问浏览量应 +1')
})

test('GET 详情不存在 → 404，不落入 500', async () => {
  const res = await request(app)
    .get('/api/v1/foodcalorie/contents/99999')
    .set('Authorization', 'Bearer ' + makeToken(93005))
  assert.strictEqual(res.status, 404)
  assert.ok(res.body.code !== 10099, '不得落入通用 500 错误码')
})

test('GET 详情 id 非数字 → 400（zod params 校验）', async () => {
  const res = await request(app)
    .get('/api/v1/foodcalorie/contents/abc')
    .set('Authorization', 'Bearer ' + makeToken(93006))
  assert.strictEqual(res.status, 400)
})

test('GET 分页 pageSize>100 → 400（zod 校验防巨型分页）', async () => {
  const res = await request(app)
    .get('/api/v1/foodcalorie/contents?pageSize=500')
    .set('Authorization', 'Bearer ' + makeToken(93007))
  assert.strictEqual(res.status, 400)
})

test('GET 无效 type → 400（zod enum 校验）', async () => {
  const res = await request(app)
    .get('/api/v1/foodcalorie/contents?type=video')
    .set('Authorization', 'Bearer ' + makeToken(93008))
  assert.strictEqual(res.status, 400)
})

test('未登录访问 → 401', async () => {
  const res = await request(app).get('/api/v1/foodcalorie/contents')
  assert.strictEqual(res.status, 401)
})
