'use strict'
// Controller 层：记录域路由
const express = require('express')
const { z } = require('zod')
const { validate } = require('../../shared/middleware/validate')
const { requireAuth } = require('../../shared/middleware/requireAuth')
const { ok, okPage } = require('../../shared/utils/response')
const { isValidCnDate } = require('../../shared/utils/date')
const service = require('./service')
const profilesService = require('../profiles/service')

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
  record_time: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/, 'record_time 格式应为 YYYY-MM-DD HH:mm')
    // body 侧日历校验（B8）：2026-02-31 99:99 之类非法值禁止入库，避免统计被静默排除
    .refine((s) => isValidCnDate(s.slice(0, 10)) && Number(s.slice(11, 13)) <= 23 && Number(s.slice(14, 16)) <= 59, {
      message: 'record_time 必须是合法日期时间'
    }),
  source: z.enum(['AI识别', 'manual', 'search']).optional().default('manual'),
  // image_url 白名单：仅允许本服务签发的鉴权图片路径（或空）。
  image_url: z
    .string()
    .max(500)
    .regex(
      /^\/api\/v1\/foodcalorie\/ai\/images\/food_\d+_[0-9a-f]{8}\.(?:jpg|png|webp|heic|heif)$/i,
      'image_url 仅支持本服务签发的私有图片地址'
    )
    .optional()
    .nullable()
})

const idParam = z.object({ id: z.coerce.number().int().positive() })
const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(isValidCnDate, 'date 必须是合法日历日').optional(),
  meal: z.enum(MEAL_TYPES).optional(),
  // page 上限 10000：防巨型 OFFSET 全表偏移扫描（B9）
  page: z.coerce.number().int().min(1).max(10000).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20)
})
const statsQuery = z.object({
  range: z.enum(['day', 'week', 'month']).optional().default('day'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(isValidCnDate, 'date 必须是合法日历日').optional(),
  // target 不设默认值：未传时由路由读用户 profile.target_calories，service 层兜底 1400
  target: z.coerce.number().int().min(100).max(10000).optional()
})
const calendarQuery = z.object({
  // 月份限制 01-12：2026-13 会让 Date 得到 NaN 抛 RangeError（500）
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'month 格式应为 YYYY-MM 且月份 01-12').optional()
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
    const { list, total } = service.listRecords(req.user.id, req.query)
    return okPage(res, { list, page: req.query.page, pageSize: req.query.pageSize, total })
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
      const target = profilesService.getTargetCalories(req.user.id)
      if (target) req.query.target = target
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
    return ok(res, service.getRecord(req.user.id, req.params.id))
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
router.delete('/:id', requireAuth, validate(idParam, 'params'), async (req, res, next) => {
  try {
    const result = await service.deleteRecord(req.user.id, req.params.id)
    return ok(res, result, '记录已删除')
  } catch (e) {
    next(e)
  }
})

module.exports = router
