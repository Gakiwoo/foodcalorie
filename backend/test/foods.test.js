'use strict'
// 食物库模块测试：搜索分页 / keyword 模糊匹配 / category 过滤 / 分类列表 / 分页校验 / 未登录
const { test, before, after } = require('node:test')
const assert = require('node:assert')
const request = require('supertest')
const jwt = require('jsonwebtoken')
const os = require('os')
const path = require('path')

process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-secret-for-foods'
process.env.REDIS_URL = ''
process.env.DB_PATH = path.join(os.tmpdir(), `fc-foods-test-${Date.now()}.db`)

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

test('GET 搜索（无参数）→ 200，返回分页结构，total=43（种子食物数）', async () => {
  const res = await request(app)
    .get('/api/v1/foodcalorie/foods')
    .set('Authorization', 'Bearer ' + makeToken(94001))
  assert.strictEqual(res.status, 200)
  assert.strictEqual(res.body.code, 0)
  assert.strictEqual(res.body.data.total, 43)
  assert.ok(Array.isArray(res.body.data.list))
  assert.strictEqual(res.body.data.page, 1)
  assert.strictEqual(res.body.data.pageSize, 20)
  assert.ok(res.body.data.list.length <= 20)
})

test('GET 按 keyword 模糊搜索 → 200，结果名称均包含关键字', async () => {
  const res = await request(app)
    .get('/api/v1/foodcalorie/foods?keyword=鸡')
    .set('Authorization', 'Bearer ' + makeToken(94002))
  assert.strictEqual(res.status, 200)
  assert.ok(res.body.data.total >= 2, '至少匹配鸡胸肉、宫保鸡丁等')
  assert.ok(res.body.data.list.every((f) => f.name.includes('鸡')), '所有结果名称应包含关键字"鸡"')
})

test('GET 按 keyword 搜索无匹配 → 200，list 为空但 total=0', async () => {
  const res = await request(app)
    .get('/api/v1/foodcalorie/foods?keyword=不存在的食物xyz')
    .set('Authorization', 'Bearer ' + makeToken(94003))
  assert.strictEqual(res.status, 200)
  assert.strictEqual(res.body.data.total, 0)
  assert.deepStrictEqual(res.body.data.list, [])
})

test('GET 按 category=主食 过滤 → 200，全部为主食分类', async () => {
  const res = await request(app)
    .get('/api/v1/foodcalorie/foods?category=主食')
    .set('Authorization', 'Bearer ' + makeToken(94004))
  assert.strictEqual(res.status, 200)
  assert.ok(res.body.data.total >= 5, '主食分类至少有米饭、馒头、面条等')
  assert.ok(res.body.data.list.every((f) => f.category === '主食'))
})

test('GET keyword + category 组合过滤 → 200，同时满足两个条件', async () => {
  const res = await request(app)
    .get('/api/v1/foodcalorie/foods?keyword=面&category=主食')
    .set('Authorization', 'Bearer ' + makeToken(94005))
  assert.strictEqual(res.status, 200)
  assert.ok(res.body.data.list.every((f) => f.name.includes('面') && f.category === '主食'))
})

test('GET 分类列表 → 200，返回去重分类数组，包含主食/水果/蔬菜等', async () => {
  const res = await request(app)
    .get('/api/v1/foodcalorie/foods/categories')
    .set('Authorization', 'Bearer ' + makeToken(94006))
  assert.strictEqual(res.status, 200)
  assert.ok(Array.isArray(res.body.data))
  assert.ok(res.body.data.includes('主食'))
  assert.ok(res.body.data.includes('水果'))
  assert.ok(res.body.data.includes('蔬菜'))
  assert.ok(res.body.data.includes('肉蛋'))
  // 去重验证
  assert.strictEqual(new Set(res.body.data).size, res.body.data.length, '分类列表应去重')
})

test('GET 分页 page=2 → 200，返回第二页数据', async () => {
  const res = await request(app)
    .get('/api/v1/foodcalorie/foods?page=2&pageSize=10')
    .set('Authorization', 'Bearer ' + makeToken(94007))
  assert.strictEqual(res.status, 200)
  assert.strictEqual(res.body.data.page, 2)
  assert.strictEqual(res.body.data.pageSize, 10)
  assert.ok(res.body.data.list.length <= 10)
})

test('GET pageSize>100 → 400（zod 校验防巨型分页）', async () => {
  const res = await request(app)
    .get('/api/v1/foodcalorie/foods?pageSize=500')
    .set('Authorization', 'Bearer ' + makeToken(94008))
  assert.strictEqual(res.status, 400)
})

test('GET keyword>50 字符 → 400（zod 校验防超长关键字）', async () => {
  const longKeyword = 'a'.repeat(51)
  const res = await request(app)
    .get('/api/v1/foodcalorie/foods?keyword=' + longKeyword)
    .set('Authorization', 'Bearer ' + makeToken(94009))
  assert.strictEqual(res.status, 400)
})

test('未登录访问 → 401', async () => {
  const res = await request(app).get('/api/v1/foodcalorie/foods')
  assert.strictEqual(res.status, 401)
})

test('未登录访问分类列表 → 401', async () => {
  const res = await request(app).get('/api/v1/foodcalorie/foods/categories')
  assert.strictEqual(res.status, 401)
})
