'use strict'
// Controller 层：数据导出（M6）
// CSV：直接返回附件下载（text/csv + Content-Disposition）；JSON：统一响应包装
const express = require('express')
const { z } = require('zod')
const { validate } = require('../../shared/middleware/validate')
const { requireAuth } = require('../../shared/middleware/requireAuth')
const { ok } = require('../../shared/utils/response')
const service = require('./service')

const router = express.Router()

const exportQuery = z.object({
  format: z.enum(['csv', 'json']).optional().default('csv'),
  range: z.enum(['day', 'week', 'month', 'all']).optional().default('all'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
})

/**
 * @swagger
 * /foodcalorie/export:
 *   post:
 *     tags: [Export]
 *     summary: 数据导出（format=csv|json, range=day|week|month|all）
 *     security: [{ BearerAuth: [] }]
 */
router.post('/', requireAuth, validate(exportQuery, 'query'), (req, res, next) => {
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
