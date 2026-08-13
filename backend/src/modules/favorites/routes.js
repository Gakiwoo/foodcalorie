'use strict'
// Controller 层：收藏（我的收藏页，M5）
const express = require('express')
const { z } = require('zod')
const { validate } = require('../../shared/middleware/validate')
const { requireAuth } = require('../../shared/middleware/requireAuth')
const { ok } = require('../../shared/utils/response')
const service = require('./service')

const router = express.Router()

const FAV_TYPES = ['recipe', 'article', 'food']

const listQuery = z.object({
  type: z.enum(FAV_TYPES).optional()
})
const addBody = z.object({
  type: z.enum(FAV_TYPES, 'type 必须是 recipe/article/food'),
  ref_id: z.number().int().positive()
})
const delQuery = z.object({
  type: z.enum(FAV_TYPES),
  ref_id: z.coerce.number().int().positive()
})

/**
 * @swagger
 * /foodcalorie/favorites:
 *   get:
 *     tags: [Favorites]
 *     summary: 我的收藏列表
 *     security: [{ BearerAuth: [] }]
 */
router.get('/', requireAuth, validate(listQuery, 'query'), (req, res, next) => {
  try {
    return ok(res, service.listFavorites(req.user.id, req.query.type))
  } catch (e) {
    next(e)
  }
})

/**
 * @swagger
 * /foodcalorie/favorites:
 *   post:
 *     tags: [Favorites]
 *     summary: 收藏（type + ref_id）
 *     security: [{ BearerAuth: [] }]
 */
router.post('/', requireAuth, validate(addBody), (req, res, next) => {
  try {
    const fav = service.addFavorite(req.user.id, req.body.type, req.body.ref_id)
    return res.status(201).json({ code: 0, message: '收藏成功', data: fav })
  } catch (e) {
    next(e)
  }
})

/**
 * @swagger
 * /foodcalorie/favorites:
 *   delete:
 *     tags: [Favorites]
 *     summary: '取消收藏（query: type + ref_id）'
 *     security: [{ BearerAuth: [] }]
 */
router.delete('/', requireAuth, validate(delQuery, 'query'), (req, res, next) => {
  try {
    return ok(res, service.removeFavorite(req.user.id, req.query.type, req.query.ref_id), '已取消收藏')
  } catch (e) {
    next(e)
  }
})

module.exports = router
