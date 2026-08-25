'use strict'
// 导出模块测试：CSV 公式注入防护 / 转义 / BOM / range 边界 / 参数校验
const { test, before, after } = require('node:test')
const assert = require('node:assert')
const request = require('supertest')
const jwt = require('jsonwebtoken')
const os = require('os')
const path = require('path')

process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-secret-for-unit-tests'
process.env.REDIS_URL = ''
process.env.DB_PATH = path.join(os.tmpdir(), `fc-export-test-${Date.now()}.db`)

const { createApp } = require('../src/app')
const { closeDb } = require('../src/db')

let app
const TOKEN = () => 'Bearer ' + jwt.sign({ id: 92001, email: 't@x.com', role: 'user' }, process.env.JWT_SECRET, { expiresIn: '15m' })

function addRecord(overrides = {}) {
  return request(app)
    .post('/api/v1/foodcalorie/records')
    .set('Authorization', TOKEN())
    .send({
      food_name: '测试食物',
      meal_type: '午餐',
      calories: 100,
      record_time: '2026-08-05 12:00',
      source: 'manual',
      ...overrides
    })
}

before(() => {
  app = createApp()
  require('../src/db').getDb()
})

after(() => {
  closeDb()
  try { require('fs').unlinkSync(process.env.DB_PATH) } catch {}
})

test('CSV 导出：BOM + 表头 + 行首公式注入加单引号防护', async () => {
  // 覆盖全部行首危险前缀：= + - @ \t \r
  await addRecord({ food_name: '=SUM(A1:A9)', record_time: '2026-08-05 08:00' })
  await addRecord({ food_name: '+cmd|calc', record_time: '2026-08-05 09:00' })
  await addRecord({ food_name: '-1+1', record_time: '2026-08-05 10:00' })
  await addRecord({ food_name: '@import url(x)', record_time: '2026-08-05 11:00' })
  await addRecord({ food_name: '\t制表符前缀', record_time: '2026-08-05 12:00' })

  const res = await request(app).post('/api/v1/foodcalorie/export?format=csv&range=day&date=2026-08-05').set('Authorization', TOKEN())
  assert.strictEqual(res.status, 200)
  assert.match(res.headers['content-type'], /text\/csv/)
  assert.match(res.headers['content-disposition'], /attachment/)
  const body = res.text
  assert.ok(body.startsWith('\ufeff'), '必须带 UTF-8 BOM（Excel 中文不乱码）')
  assert.ok(body.includes('food_name'), '表头存在')
  assert.ok(body.includes("'=SUM(A1:A9)"), `公式注入未防护: ${body}`)
  assert.ok(body.includes("'+cmd|calc"), `公式注入未防护: ${body}`)
  assert.ok(body.includes("'-1+1"), `公式注入未防护: ${body}`)
  assert.ok(body.includes("'@import url(x)"), `公式注入未防护: ${body}`)
  assert.ok(body.includes("'\t制表符前缀"), `制表符前缀未防护: ${body}`)
})

test('CSV 导出：逗号/引号/换行正确转义', async () => {
  await addRecord({ food_name: '含,逗号与"引号"', record_time: '2026-08-05 13:00' })
  const res = await request(app).post('/api/v1/foodcalorie/export?format=csv&range=day&date=2026-08-05').set('Authorization', TOKEN())
  assert.strictEqual(res.status, 200)
  assert.ok(res.text.includes('"含,逗号与""引号"""'), `转义不正确: ${res.text}`)
})

test('JSON 导出：records 数组 + count', async () => {
  const res = await request(app).post('/api/v1/foodcalorie/export?format=json&range=day&date=2026-08-05').set('Authorization', TOKEN())
  assert.strictEqual(res.status, 200)
  assert.strictEqual(res.body.code, 0)
  assert.ok(Array.isArray(res.body.data.records))
  assert.strictEqual(res.body.data.count, res.body.data.records.length)
})

test('range=all 导出包含历史记录且文件名不带 date', async () => {
  const res = await request(app).post('/api/v1/foodcalorie/export?format=csv&range=all').set('Authorization', TOKEN())
  assert.strictEqual(res.status, 200)
  assert.match(res.headers['content-disposition'], /foodcalorie-records-all\.csv/)
})

test('非法 format → 400；非法日历日 → 400', async () => {
  const badFormat = await request(app).post('/api/v1/foodcalorie/export?format=xlsx').set('Authorization', TOKEN())
  assert.strictEqual(badFormat.status, 400)
  const badDate = await request(app).post('/api/v1/foodcalorie/export?format=csv&range=day&date=2026-02-30').set('Authorization', TOKEN())
  assert.strictEqual(badDate.status, 400)
})

test('导出仅包含当前用户数据（跨用户隔离）', async () => {
  const other = 'Bearer ' + jwt.sign({ id: 92002, email: 'o@x.com', role: 'user' }, process.env.JWT_SECRET, { expiresIn: '15m' })
  const res = await request(app).post('/api/v1/foodcalorie/export?format=json&range=all').set('Authorization', other)
  assert.strictEqual(res.status, 200)
  assert.strictEqual(res.body.data.count, 0, '其他用户不得看到测试用户的记录')
})
