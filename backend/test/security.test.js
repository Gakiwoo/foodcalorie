'use strict'
// 批次1 安全兜底测试：限流 429 / health 豁免 / 上传魔数校验
// 注意：本文件 NODE_ENV 设为非 'test' 值以启用限流中间件（rateLimit 对 'test' 跳过）
const { test, before, after } = require('node:test')
const assert = require('node:assert')
const request = require('supertest')
const jwt = require('jsonwebtoken')
const path = require('path')
const os = require('os')
const fs = require('fs')

process.env.NODE_ENV = 'test-security'
process.env.JWT_SECRET = 'security-test-secret-0123456789'
process.env.DB_PATH = path.join(os.tmpdir(), 'fc-security-test.db')
process.env.UPLOAD_DIR = path.join(os.tmpdir(), 'fc-security-uploads')
try { fs.unlinkSync(process.env.DB_PATH) } catch {}
try { fs.rmSync(process.env.UPLOAD_DIR, { recursive: true, force: true }) } catch {}

const { createApp } = require('../src/app')
const { closeDb } = require('../src/db')
const { createRateLimit, clientIp } = require('../src/shared/middleware/rateLimit')

let app
before(() => {
  app = createApp()
  // 触发 DB 初始化（ai 降级需要读食物库）
  require('../src/db').getDb()
})
after(() => {
  closeDb()
  try { fs.unlinkSync(process.env.DB_PATH) } catch {}
  try { fs.rmSync(process.env.UPLOAD_DIR, { recursive: true, force: true }) } catch {}
})

const TOKEN = jwt.sign({ id: 90091, email: 'sec@t.com', role: 'user' }, process.env.JWT_SECRET, { expiresIn: '15m' })

// ── 限流单元测试 ──
// 注意：限流中间件拦截时走 next(ServiceError)（由 errorHandler 序列化 429），非 res.json
test('createRateLimit：limit=2 时第 3 次请求返回 429(code=10003)', () => {
  const limit = createRateLimit(2, 60 * 1000)
  const call = () => {
    let out = null
    const req = { ip: '9.9.9.9', headers: {} }
    const res = { json: (body) => { out = { kind: 'json', body } } }
    limit(req, res, (err) => { out = { kind: 'next', err } })
    return out
  }
  assert.strictEqual(call().kind, 'next', '第 1 次放行')
  assert.strictEqual(call().kind, 'next', '第 2 次放行')
  const third = call()
  assert.strictEqual(third.kind, 'next', '第 3 次应被拦截（next(err)）')
  assert.strictEqual(third.err.status, 429)
  assert.strictEqual(third.err.code, 10003)
})

test('createRateLimit：不同 IP 独立计数', () => {
  const limit = createRateLimit(1, 60 * 1000)
  const call = (ip) => {
    let out = null
    const req = { ip, headers: {} }
    const res = { json: (body) => { out = { kind: 'json', body } } }
    limit(req, res, (err) => { out = { kind: 'next', err } })
    return out
  }
  assert.strictEqual(call('1.1.1.1').kind, 'next')
  const again = call('1.1.1.1')
  assert.strictEqual(again.kind, 'next', '同 IP 第 2 次拦截')
  assert.strictEqual(again.err.status, 429)
  assert.strictEqual(call('2.2.2.2').kind, 'next', '不同 IP 放行')
})

test('clientIp 忽略客户端伪造的 X-Forwarded-For', () => {
  const req = { ip: '203.0.113.9', headers: { 'x-forwarded-for': '1.2.3.4' } }
  assert.strictEqual(clientIp(req), '203.0.113.9')
})

// ── app 集成：health 豁免限流 ──
test('GET /health 不受限流影响（连续 3 次 200）', async () => {
  for (let i = 0; i < 3; i++) {
    const res = await request(app).get('/api/v1/foodcalorie/health')
    assert.strictEqual(res.status, 200)
  }
})

test('受保护写接口无 token → 401（限流在鉴权前不误伤语义）', async () => {
  const res = await request(app).get('/api/v1/foodcalorie/records')
  assert.strictEqual(res.status, 401)
  assert.strictEqual(res.body.code, 20001)
})

// ── 上传魔数校验 ──
test('伪装 image/jpeg 的 HTML 文件 → 400 且不留盘', async () => {
  const before = fs.existsSync(process.env.UPLOAD_DIR) ? fs.readdirSync(process.env.UPLOAD_DIR).length : 0
  const res = await request(app)
    .post('/api/v1/foodcalorie/ai/recognize')
    .set('Authorization', 'Bearer ' + TOKEN)
    .attach('image', Buffer.from('<html><script>alert(1)</script></html>'), {
      filename: 'x.jpg',
      contentType: 'image/jpeg'
    })
  assert.strictEqual(res.status, 400)
  assert.strictEqual(res.body.code, 10001)
  // 无文件落盘
  const after = fs.existsSync(process.env.UPLOAD_DIR) ? fs.readdirSync(process.env.UPLOAD_DIR).length : 0
  assert.strictEqual(after, before, '伪装文件不应落盘')
})

test('真实 PNG → 私有图片仅所有者可读，记录删除后清理', async () => {
  // 1x1 透明 PNG（含正确 8 字节魔数）
  const png = Buffer.from(
    '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d4944415478da63f8ffff3f030005fe02fea7d4b0d50000000049454e44ae426082',
    'hex'
  )
  const res = await request(app)
    .post('/api/v1/foodcalorie/ai/recognize')
    .set('Authorization', 'Bearer ' + TOKEN)
    .attach('image', png, { filename: 'x.png', contentType: 'image/png' })
  assert.strictEqual(res.status, 200)
  assert.ok(Array.isArray(res.body.data.candidates), '降级返回候选')
  assert.ok(res.body.data.candidates.length >= 5)
  assert.ok(res.body.data.image_url.startsWith('/api/v1/foodcalorie/ai/images/'), '返回私有 image_url')

  const imageUrl = res.body.data.image_url
  const owner = await request(app).get(imageUrl).set('Authorization', 'Bearer ' + TOKEN)
  assert.strictEqual(owner.status, 200, '所有者可以读取图片')
  assert.match(owner.headers['cache-control'], /private/)

  const otherToken = jwt.sign({ id: 90092, email: 'other@t.com', role: 'user' }, process.env.JWT_SECRET, { expiresIn: '15m' })
  const other = await request(app).get(imageUrl).set('Authorization', 'Bearer ' + otherToken)
  assert.strictEqual(other.status, 404, '其他用户无法读取图片')

  const anonymous = await request(app).get(imageUrl)
  assert.strictEqual(anonymous.status, 401, '未登录用户无法读取图片')

  const record = await request(app)
    .post('/api/v1/foodcalorie/records')
    .set('Authorization', 'Bearer ' + TOKEN)
    .send({
      food_name: '测试图片记录',
      meal_type: '午餐',
      calories: 100,
      record_time: '2026-08-13 10:30',
      source: 'AI识别',
      image_url: imageUrl
    })
  assert.strictEqual(record.status, 201, '识别图片可以绑定到记录')

  const duplicate = await request(app)
    .post('/api/v1/foodcalorie/records')
    .set('Authorization', 'Bearer ' + TOKEN)
    .send({
      food_name: '重复图片记录',
      meal_type: '午餐',
      calories: 100,
      record_time: '2026-08-13 10:31',
      source: 'AI识别',
      image_url: imageUrl
    })
  assert.strictEqual(duplicate.status, 400, '同一上传图片不能重复认领')

  const deleted = await request(app)
    .delete(`/api/v1/foodcalorie/records/${record.body.data.id}`)
    .set('Authorization', 'Bearer ' + TOKEN)
  assert.strictEqual(deleted.status, 200)
  const removedImage = await request(app).get(imageUrl).set('Authorization', 'Bearer ' + TOKEN)
  assert.strictEqual(removedImage.status, 404, '删除最后一个引用后图片不可读取')
})

test('生产环境缺少 CORS_ORIGINS 时拒绝启动', () => {
  const previousNodeEnv = process.env.NODE_ENV
  const previousOrigins = process.env.CORS_ORIGINS
  process.env.NODE_ENV = 'production'
  delete process.env.CORS_ORIGINS
  try {
    assert.throws(() => createApp(), /CORS_ORIGINS/)
  } finally {
    process.env.NODE_ENV = previousNodeEnv
    if (previousOrigins === undefined) delete process.env.CORS_ORIGINS
    else process.env.CORS_ORIGINS = previousOrigins
  }
})
