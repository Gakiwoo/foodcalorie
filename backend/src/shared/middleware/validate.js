'use strict'
// zod 参数校验中间件：校验 req.body / req.query / req.params，失败抛 ZodError（errorHandler 序列化）
function validate(schema, source = 'body') {
  return function validateMiddleware(req, res, next) {
    const result = schema.safeParse(req[source])
    if (!result.success) {
      return next(result.error) // ZodError
    }
    req[source] = result.data
    return next()
  }
}

module.exports = { validate }
