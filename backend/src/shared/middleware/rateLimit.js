'use strict'
// 单实例内存限流。扩展为多实例部署时需替换为共享存储实现。
const { ServiceError } = require('../utils/serviceError')

const buckets = new Map() // `${scope}:${key}` -> number[]
const CLEANUP_MS = 60 * 1000
let scopeSequence = 0

setInterval(() => {
  const cutoff = Date.now() - 10 * 60 * 1000
  for (const [k, arr] of buckets) {
    const fresh = arr.filter((t) => t > cutoff)
    if (fresh.length === 0) buckets.delete(k)
    else buckets.set(k, fresh)
  }
}, CLEANUP_MS).unref?.()

// Express 会根据 app.set('trust proxy', 'loopback') 从可信反代链计算 req.ip。
// 不直接读取客户端可伪造的 X-Forwarded-For。
function clientIp(req) {
  return req.ip || req.socket?.remoteAddress || 'unknown'
}

/**
 * 创建限流中间件
 * @param {number} limit 窗口内最大次数
 * @param {number} windowMs 窗口毫秒
 * @param {(req)=>string} [keyFn] 限流键生成（默认按真实客户端 IP）
 */
function createRateLimit(limit, windowMs, keyFn) {
  const scope = `limiter-${++scopeSequence}`
  return function rateLimit(req, res, next) {
    if (process.env.NODE_ENV === 'test') return next()
    const identity = keyFn ? keyFn(req) : clientIp(req)
    const key = `${scope}:${identity}`
    const now = Date.now()
    const arr = buckets.get(key) || []
    const fresh = arr.filter((t) => t > now - windowMs)
    if (fresh.length >= limit) {
      return next(new ServiceError(429, 10003, '请求过于频繁，请稍后再试'))
    }
    fresh.push(now)
    buckets.set(key, fresh)
    return next()
  }
}

// 登录限流由 gakiwoo-api 侧处理（食刻复用其 /api/auth/*），此处无登录路由，不再定义 loginThrottle
module.exports = { createRateLimit, clientIp }
