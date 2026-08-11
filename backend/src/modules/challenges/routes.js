'use strict'
// Controller 层：挑战（夏季轻食挑战页，M6）
const express = require('express')
const { z } = require('zod')
const { validate } = require('../../shared/middleware/validate')
const { requireAuth } = require('../../shared/middleware/requireAuth')
const { ok } = require('../../shared/utils/response')
const service = require('./service')

const router = express.Router()
const idParam = z.object({ id: z.coerce.number().int().positive() })

/**
 * @swagger
 * /foodcalorie/challenges:
 *   get:
 *     tags: [Challenges]
 *     summary: 挑战活动列表（含我的进度）
 *     security: [{ BearerAuth: [] }]
 */
router.get('/', requireAuth, (req, res, next) => {
  try {
    return ok(res, service.listChallenges(req.user.id))
  } catch (e) {
    next(e)
  }
})

/**
 * @swagger
 * /foodcalorie/challenges/:id/join:
 *   post:
 *     tags: [Challenges]
 *     summary: 参与挑战
 *     security: [{ BearerAuth: [] }]
 */
router.post('/:id/join', requireAuth, validate(idParam, 'params'), (req, res, next) => {
  try {
    return ok(res, service.joinChallenge(req.user.id, req.params.id), '参与成功')
  } catch (e) {
    next(e)
  }
})

/**
 * @swagger
 * /foodcalorie/challenges/:id/checkin:
 *   post:
 *     tags: [Challenges]
 *     summary: 每日打卡（+1 天 / +10 积分，同日重复 429）
 *     security: [{ BearerAuth: [] }]
 */
router.post('/:id/checkin', requireAuth, validate(idParam, 'params'), (req, res, next) => {
  try {
    return ok(res, service.checkInChallenge(req.user.id, req.params.id), '打卡成功')
  } catch (e) {
    next(e)
  }
})

module.exports = router
