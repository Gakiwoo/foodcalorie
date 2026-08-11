'use strict'
// Controller 层：记录域路由
const express = require('express')
const { z } = require('zod')
const { validate } = require('../../shared/middleware/validate')
const { requireAuth } = require('../../shared/middleware/requireAuth')
const { ok, okPage } = require('../../shared/utils/response')
const { ServiceError } = require('../../shared/utils/serviceError')
const { RANGE_INVALID } = require('../../shared/utils/errors')
const service = require('./service')
const profileRepo = require('../profiles/repositories/profileRepo')

const router = express.Router()

const MEAL_TYPES = ['早餐', '午餐', '晚餐', '加餐']

const recordBody = z.object({
  food_name: z.string().min(1, '食物名称不能为空'),
  category: z.string().optional().nullable(),
  meal_type: z.enum(MEAL_TYPES, '餐次必须是 早餐/午餐/晚餐/加餐'),
  calories: z.number().int().min(0).max(100000),
  protein_g: z.number().min(0).optional().default(0),
  carbs_g: z.number().min(0).optional().default(0),
  fat_g: z.number().min(0).optional().default(0),
  fiber_g: z.number().min(0).optional().default(0),
  portion: z.string().optional().default('1 份'),
  record_time: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/, 'record_time 格式应为 YYYY-MM-DD HH:mm'),
  source: z.enum(['AI识别', 'manual', 'search']).optional().default('manual'),
  // image_url 白名单：仅允许本服务 /uploads/ 相对路径（或空）。拒绝外部任意 URL，
  // 防记录被塞入跟踪像素/外链（前端仅同域渲染图片）
  image_url: z
    .string()
    .max(500)
    .regex(/^\/uploads\/[\w.\-]+$/, 'image_url 仅支持 /uploads/ 相对路径')
    .optional()
    .nullable()
})

const idParam = z.object({ id: z.coerce.number().int().positive() })
const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  meal: z.enum(MEAL_TYPES).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20)
})
const statsQuery = z.object({
  range: z.enum(['day', 'week', 'month']).optional().default('day'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  // target 不设默认值：未传时由路由读用户 profile.target_calories，service 层兜底 1400
  target: z.coerce.number().int().min(100).max(10000).optional()
})
const calendarQuery = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/).optional()
})

/**
 * @swagger
 * /foodcalorie/records:
 *   post:
 *     tags: [Records]
 *     summary: 新增食物记录
 */
router.post('/', requireAuth, validate(recordBody), async (req, res, next) => {
  try {
    const record = await service.createRecord(req.user.id, req.body)
    return res.status(201).json({ code: 0, message: '记录已创建', data: record })
  } catch (e) {
    next(e)
  }
})

/**
 * @swagger
 * /foodcalorie/records:
 *   get:
 *     tags: [Records]
 *     summary: 按日期/餐次查询记录（分页）
 */
router.get('/', requireAuth, validate(querySchema, 'query'), (req, res, next) => {
  try {
    const page = req.query.page
    const pageSize = req.query.pageSize
    const offset = (page - 1) * pageSize
    const date = req.query.date
    const meal = req.query.meal
    const repo = require('./repositories/recordRepo')
    const uid = req.user.id

    // SQL 分页下推（替代内存 slice）：date/meal 条件在 SQL 层过滤 + 计数
    let list
    let total
    if (date && meal) {
      list = repo.listByDateMealPaged(uid, date, meal, pageSize, offset)
      total = repo.countByDateMeal(uid, date, meal)
    } else if (date) {
      list = repo.listByDatePaged(uid, date, pageSize, offset)
      total = repo.countByDate(uid, date)
    } else if (meal) {
      list = repo.listByRangeMealPaged(uid, '0000-01-01', '9999-12-31', meal, pageSize, offset)
      total = repo.countByRangeMeal(uid, '0000-01-01', '9999-12-31', meal)
    } else {
      list = repo.listByRangePaged(uid, '0000-01-01', '9999-12-31', pageSize, offset)
      total = repo.countByRange(uid, '0000-01-01', '9999-12-31')
    }

    return okPage(res, { list, page, pageSize, total })
  } catch (e) {
    next(e)
  }
})

/**
 * @swagger
 * /foodcalorie/records/stats:
 *   get:
 *     tags: [Records]
 *     summary: 摄入统计（day/week/month）
 */
router.get('/stats', requireAuth, validate(statsQuery, 'query'), (req, res, next) => {
  try {
    // target 未显式传入时，读用户 profile.target_calories（目标设置页配置的真实目标）
    if (!req.query.target) {
      const profile = profileRepo.getByUserId(req.user.id)
      if (profile && profile.target_calories) req.query.target = profile.target_calories
    }
    return ok(res, service.getStats(req.user.id, req.query))
  } catch (e) {
    next(e)
  }
})

/**
 * @swagger
 * /foodcalorie/records/calendar:
 *   get:
 *     tags: [Records]
 *     summary: 月历视图（每日摄入）
 */
router.get('/calendar', requireAuth, validate(calendarQuery, 'query'), (req, res, next) => {
  try {
    return ok(res, service.getCalendar(req.user.id, req.query))
  } catch (e) {
    next(e)
  }
})

/**
 * @swagger
 * /foodcalorie/records/:id:
 *   get:
 *     tags: [Records]
 *     summary: 记录详情
 */
router.get('/:id', requireAuth, validate(idParam, 'params'), (req, res, next) => {
  try {
    const record = require('./repositories/recordRepo').findById(req.params.id, req.user.id)
    if (!record) throw new ServiceError(404, 30001)
    return ok(res, record)
  } catch (e) {
    next(e)
  }
})

/**
 * @swagger
 * /foodcalorie/records/:id:
 *   put:
 *     tags: [Records]
 *     summary: 编辑记录
 */
router.put('/:id', requireAuth, validate(idParam, 'params'), validate(recordBody.partial()), async (req, res, next) => {
  try {
    const record = await service.updateRecord(req.user.id, req.params.id, req.body)
    return ok(res, record, '记录已更新')
  } catch (e) {
    next(e)
  }
})

/**
 * @swagger
 * /foodcalorie/records/:id:
 *   delete:
 *     tags: [Records]
 *     summary: 删除记录
 */
router.delete('/:id', requireAuth, validate(idParam, 'params'), (req, res, next) => {
  try {
    service.deleteRecord(req.user.id, req.params.id)
    return ok(res, { deleted: true }, '记录已删除')
  } catch (e) {
    next(e)
  }
})

module.exports = router
