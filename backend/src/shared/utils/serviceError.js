'use strict'
// 业务可预期错误：携带 HTTP 状态码 + 错误码 + 提示，由 errorHandler 统一序列化
const { MESSAGES } = require('./errors')

class ServiceError extends Error {
  constructor(status, code, message) {
    super(message || MESSAGES[code] || '未知错误')
    this.name = 'ServiceError'
    this.status = status || 400
    this.code = code || 10099
  }
}

function isServiceError(error) {
  return error instanceof ServiceError
}

module.exports = { ServiceError, isServiceError }
