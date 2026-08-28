'use strict'
// Controller 层：数据导出（M6）
// CSV：直接返回附件下载（text/csv + Content-Disposition）；JSON：统一响应包装
const express = require('express')
const { z } = require('zod')
const { validate } = require('../../shared/middleware/validate')
const { requireAuth } = require('../../shared/middleware/requireAuth')
const { createRateLimit } = require('../../shared/middleware/rateLimit')
const { ok } = require('../../shared/utils/response')
const { isValidCnDate } = require('../../shared/utils/date')
const service = require('./service')

const router = express.Router()

// 导出接口独立限流：按用户 2 次/分钟（range=all 可能查询大量数据，保护 CPU/内存）
const exportLimit = createRateLimit(2, 60 * 1000, (req) => `export:${req.user?.id || 'anon'}`)

const exportQuery = z.object({
  format: z.enum(['csv', 'json']).optional().default('csv'),
  range: z.enum(['day', 'week', 'month', 'all']).optional().default('all'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(isValidCnDate, 'date 必须是合法日历日').optional()
})

/**
 * @swagger
 * /foodcalorie/export:
 *   post:
 *     tags: [Export]
 *     summary: 数据导出（format=csv|json, range=day|week|month|all）
 *     security: [{ BearerAuth: [] }]
 */
router.post('/', requireAuth, exportLimit, validate(exportQuery, 'query'), (req, res, next) => {
  try {
    const result = service.exportRecords(req.user.id, req.query)
    if (req.query.format === 'csv') {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`)
      return res.send('\ufeff' + result.content) // BOM 保证 Excel 中文不乱码
    }
    return ok(res, { format: result.format, range: result.range, count: result.count, records: result.records }, '导出成功')
  } catch (e) {
    next(e)
  }
})

module.exports = router
