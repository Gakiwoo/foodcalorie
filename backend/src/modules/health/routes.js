'use strict'
// health 模块：服务健康检查
const express = require('express')
const { ok } = require('../../shared/utils/response')

const router = express.Router()

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [System]
 *     summary: 健康检查
 *     responses:
 *       200:
 *         description: 服务正常
 */
router.get('/', (req, res) => {
  ok(res, {
    service: 'foodcalorie-api',
    status: 'up',
    time: new Date().toISOString(),
    version: 'v1'
  })
})

module.exports = router
