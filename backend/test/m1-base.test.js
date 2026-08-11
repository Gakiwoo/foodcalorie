'use strict'
// M1 基础测试：health 接口、统一响应、404、认证中间件
const { test, before, after } = require('node:test')
const assert = require('node:assert')
const request = require('supertest')
const jwt = require('jsonwebtoken')

process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-for-unit-tests'

const { createApp } = require('../src/app')
const { closeDb } = require('../src/db')

let app

before(() => {
  app = createApp()
})

after(() => {
  closeDb()
})

test('GET /api/v1/foodcalorie/health → 200 统一响应', async () => {
  const res = await request(app).get('/api/v1/foodcalorie/health')
  assert.strictEqual(res.status, 200)
  assert.strictEqual(res.body.code, 0)
  assert.strictEqual(res.body.data.service, 'foodcalorie-api')
  assert.ok(res.headers['x-api-version'])
})

test('GET /api/v1/不存在的接口 → 404 统一格式', async () => {
  const res = await request(app).get('/api/v1/nope')
  assert.strictEqual(res.status, 404)
  assert.strictEqual(res.body.code, 10002)
})

test('受保护接口未携带 token → 401 code=20001', async () => {
  const res = await request(app).get('/api/v1/foodcalorie/records')
  assert.strictEqual(res.status, 401)
  assert.strictEqual(res.body.code, 20001)
})

test('requireAuth：无 token / 过期 / 有效 Bearer', async () => {
  const express = require('express')
  const cookieParser = require('cookie-parser')
  const { requireAuth } = require('../src/shared/middleware/requireAuth')
  const { errorHandler } = require('../src/shared/middleware/errorHandler')
  const mini = express()
  mini.use(cookieParser()) // extractToken 依赖 req.cookies
  mini.get('/t', requireAuth, (req, res) => res.json({ id: req.user.id }))
  mini.use(errorHandler) // 必须挂载，ServiceError 才能序列化为 {code,message}

  // 无 token
  let r = await request(mini).get('/t')
  assert.strictEqual(r.status, 401)
  assert.strictEqual(r.body.code, 20001)

  // 过期 token
  const expired = jwt.sign({ id: 1, email: 'a@b.c', role: 'user' }, process.env.JWT_SECRET, {
    expiresIn: '-1s'
  })
  r = await request(mini).get('/t').set('Authorization', `Bearer ${expired}`)
  assert.strictEqual(r.status, 401)
  assert.strictEqual(r.body.code, 20002)

  // 有效 Bearer
  const valid = jwt.sign({ id: 7, email: 'a@b.c', role: 'user' }, process.env.JWT_SECRET, {
    expiresIn: '15m'
  })
  r = await request(mini).get('/t').set('Authorization', `Bearer ${valid}`)
  assert.strictEqual(r.status, 200)
  assert.strictEqual(r.body.id, 7)

  // Cookie 通道
  r = await request(mini).get('/t').set('Cookie', `access_token=${valid}`)
  assert.strictEqual(r.status, 200)
  assert.strictEqual(r.body.id, 7)
})
