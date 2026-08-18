'use strict'
// 全局错误处理中间件：统一序列化 ServiceError / 参数错误 / 未知错误
const { isServiceError } = require('../utils/serviceError')
const { INTERNAL_ERROR, MESSAGES } = require('../utils/errors')
const { logger } = require('../utils/logger')

// multer 上传错误 → 明确的状态码与提示（B1），避免落入通用 500
const MULTER_STATUS = {
  LIMIT_FILE_SIZE: [413, '图片不能超过 10MB'],
  LIMIT_FILE_COUNT: [400, '最多只能上传 1 张图片'],
  LIMIT_FIELD_COUNT: [400, '表单字段数量超限'],
  LIMIT_UNEXPECTED_FILE: [400, '请使用 image 字段上传图片']
}

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  // multer 错误（LIMIT_*）
  if (err && err.name === 'MulterError' && MULTER_STATUS[err.code]) {
    const [status, message] = MULTER_STATUS[err.code]
    return res.status(status).json({ code: 10001, message })
  }

  // zod 校验错误（validate 中间件抛出）
  if (err && err.name === 'ZodError') {
    const first = err.issues?.[0]
    return res.status(400).json({
      code: 10001,
      message: first ? `${first.path.join('.')}: ${first.message}` : '参数校验失败'
    })
  }

  if (isServiceError(err)) {
    return res.status(err.status).json({ code: err.code, message: err.message })
  }

  logger.error({ err }, 'unhandled error')
  return res.status(500).json({ code: INTERNAL_ERROR, message: MESSAGES[INTERNAL_ERROR] })
}

module.exports = { errorHandler }
