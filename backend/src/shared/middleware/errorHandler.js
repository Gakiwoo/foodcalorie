'use strict'
// 全局错误处理中间件：统一序列化 ServiceError / 参数错误 / 未知错误
const { isServiceError } = require('../utils/serviceError')
const { INTERNAL_ERROR, MESSAGES } = require('../utils/errors')
const { logger } = require('../utils/logger')

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
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
