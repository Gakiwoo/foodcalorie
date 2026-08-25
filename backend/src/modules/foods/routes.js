'use strict'
// Controller 层：食物库（手动添加/搜索页，M5）
const express = require('express')
const { z } = require('zod')
const { validate } = require('../../shared/middleware/validate')
const { requireAuth } = require('../../shared/middleware/requireAuth')
const { okPage, ok } = require('../../shared/utils/response')
const foodRepo = require('./repositories/foodRepo')

const router = express.Router()

const searchQuery = z.object({
  keyword: z.string().trim().max(50).optional(),
  category: z.string().trim().max(30).optional(),
  // page 上限 10000：防巨型 OFFSET 全表偏移扫描（与 records 域一致）
  page: z.coerce.number().int().min(1).max(10000).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20)
})

/**
 * @swagger
 * /foodcalorie/foods:
 *   get:
 *     tags: [Foods]
 *     summary: 食物库搜索（关键字/分类/分页）
 *     security: [{ BearerAuth: [] }]
 */
router.get('/', requireAuth, validate(searchQuery, 'query'), (req, res, next) => {
  try {
    const { list, total } = foodRepo.search({
      keyword: req.query.keyword,
      category: req.query.category,
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
 * /foodcalorie/foods/categories:
 *   get:
 *     tags: [Foods]
 *     summary: 食物分类列表
 *     security: [{ BearerAuth: [] }]
 */
router.get('/categories', requireAuth, (req, res, next) => {
  try {
    return ok(res, foodRepo.categories())
  } catch (e) {
    next(e)
  }
})

module.exports = router
