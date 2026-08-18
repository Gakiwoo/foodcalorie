'use strict'
// Controller 层：食刻资料与设置（M4）
const express = require('express')
const { z } = require('zod')
const { validate } = require('../../shared/middleware/validate')
const { requireAuth } = require('../../shared/middleware/requireAuth')
const { ok } = require('../../shared/utils/response')
const { isValidCnDate } = require('../../shared/utils/date')
const service = require('./service')

const router = express.Router()

const GOALS = ['减脂', '保持', '增肌']
const DIET_PREF_CHOICES = [
  // 口味
  '清淡', '微辣', '中辣', '重口', '甜口', '酸口',
  // 饮食方式
  '均衡', '低碳水', '高蛋白', '素食', '低脂', '低盐',
  // 忌口过敏原
  '牛肉', '海鲜', '坚果', '乳制品', '麸质', '鸡蛋', '大豆'
]

// 资料/设置可更新字段（全可选 = 部分更新）
const profileBody = z.object({
  gender: z.enum(['女', '男']).optional(),
  birthday: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine(isValidCnDate, 'birthday 必须是合法日历日')
    .optional()
    .nullable(),
  height_cm: z.number().int().min(80).max(250).optional().nullable(),
  weight_kg: z.number().min(20).max(300).optional().nullable(),
  goal_type: z.enum(GOALS).optional(),
  target_calories: z.number().int().min(800).max(6000).optional(),
  diet_preferences: z.array(z.enum(DIET_PREF_CHOICES)).max(30).optional(),
  unit_calorie: z.enum(['kcal', 'kJ']).optional(),
  unit_weight: z.enum(['g', 'oz']).optional(),
  precision_mode: z.enum(['fast', 'standard', 'precise']).optional(),
  burst_enabled: z.boolean().optional(),
  burst_count: z.number().int().min(2).max(10).optional(),
  notif_record: z.boolean().optional(),
  notif_goal: z.boolean().optional(),
  notif_community: z.boolean().optional(),
  notif_weekly: z.boolean().optional(),
  notif_activity: z.boolean().optional(),
  quiet_start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
  quiet_end: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional()
})

/**
 * @swagger
 * /foodcalorie/profile:
 *   get:
 *     tags: [Profile]
 *     summary: 我的食刻资料（无档自动创建默认档）
 *     security: [{ BearerAuth: [] }]
 */
router.get('/', requireAuth, (req, res, next) => {
  try {
    return ok(res, service.getProfile(req.user.id))
  } catch (e) {
    next(e)
  }
})

/**
 * @swagger
 * /foodcalorie/profile:
 *   put:
 *     tags: [Profile]
 *     summary: 更新资料/目标/偏好/单位/识别/通知设置（部分更新）
 *     security: [{ BearerAuth: [] }]
 */
router.put('/', requireAuth, validate(profileBody), (req, res, next) => {
  try {
    // boolean → 0/1（SQLite 无布尔）
    const patch = { ...req.body }
    for (const k of ['burst_enabled', 'notif_record', 'notif_goal', 'notif_community', 'notif_weekly', 'notif_activity']) {
      if (typeof patch[k] === 'boolean') patch[k] = patch[k] ? 1 : 0
    }
    return ok(res, service.updateProfile(req.user.id, patch), '资料已更新')
  } catch (e) {
    next(e)
  }
})

module.exports = router
