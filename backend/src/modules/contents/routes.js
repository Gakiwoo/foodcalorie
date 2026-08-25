'use strict'
// Controller 层：内容（发现页，M5）
const express = require('express')
const { z } = require('zod')
const { validate } = require('../../shared/middleware/validate')
const { requireAuth } = require('../../shared/middleware/requireAuth')
const { ok, okPage } = require('../../shared/utils/response')
const service = require('./service')

const router = express.Router()

const listQuery = z.object({
  type: z.enum(['article', 'recipe']).optional(),
  // page 上限 10000：防巨型 OFFSET 全表偏移扫描（与 records 域一致）
  page: z.coerce.number().int().min(1).max(10000).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20)
})
const idParam = z.object({ id: z.coerce.number().int().positive() })

/**
 * @swagger
 * /foodcalorie/contents:
 *   get:
 *     tags: [Contents]
 *     summary: 发现页内容流（article/recipe，分页）
 *     security: [{ BearerAuth: [] }]
 */
router.get('/', requireAuth, validate(listQuery, 'query'), (req, res, next) => {
  try {
    const { list, total } = service.listContents({
      type: req.query.type,
      page: req.query.page,
      pageSize: req.query.pageSize
    })
    return okPage(res, { list, page: req.query.page, pageSize: req.query.pageSize, total })
  } catch (e) {
    next(e)
  }
})

/**
 * @swagger
 * /foodcalorie/contents/:id:
 *   get:
 *     tags: [Contents]
 *     summary: 内容详情（自动 +1 浏览量）
 *     security: [{ BearerAuth: [] }]
 */
router.get('/:id', requireAuth, validate(idParam, 'params'), (req, res, next) => {
  try {
    return ok(res, service.getContent(req.params.id))
  } catch (e) {
    next(e)
  }
})

module.exports = router
