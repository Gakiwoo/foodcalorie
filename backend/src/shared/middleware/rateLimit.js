'use strict'
// 限流中间件：默认单实例内存滑窗；配置 REDIS_URL 后切换为 Redis 共享滑窗（多实例）。
// 内存路径保持同步（既有测试兼容）；Redis 路径异步执行，故障时自动回退内存，不阻断请求。
const { ServiceError } = require('../utils/serviceError')
const { logger } = require('../utils/logger')
const rateLimitStore = require('./rateLimitStore')

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

const TOO_MANY = () => new ServiceError(429, 10003, '请求过于频繁，请稍后再试')

// 内存滑窗（同步，单实例/降级路径）
function checkMemory(bucket, key, limit, windowMs) {
  const now = Date.now()
  const arr = bucket.get(key) || []
  const fresh = arr.filter((t) => t > now - windowMs)
  if (fresh.length >= limit) return false
  fresh.push(now)
  bucket.set(key, fresh)
  return true
}

/**
 * 创建限流中间件
 * @param {number} limit 窗口内最大次数
 * @param {number} windowMs 窗口毫秒
 * @param {(req)=>string} [keyFn] 限流键生成（默认按真实客户端 IP）
 */
function createRateLimit(limit, windowMs, keyFn) {
  const scope = `limiter-${++scopeSequence}`
  const bucketKey = `bucket:${scope}` // 内存桶 key（仅内存路径用）
  return function rateLimit(req, res, next) {
    if (process.env.NODE_ENV === 'test') return next()
    const identity = keyFn ? keyFn(req) : clientIp(req)
    const key = `${scope}:${identity}`

    // 未启用 Redis → 同步内存路径（行为与既有版本一致）
    if (!rateLimitStore.usesRedis()) {
      if (!checkMemory(buckets, key, limit, windowMs)) return next(TOO_MANY())
      return next()
    }

    // Redis 路径（异步）：故障/超时回退内存，保证请求不因限流存储故障而被阻断
    rateLimitStore
      .checkRedis(key, limit, windowMs)
      .then((ok) => {
        if (!ok) return next(TOO_MANY())
        return next()
      })
      .catch((err) => {
        logger.warn({ err: err.message }, '[rateLimit] redis 检查失败，使用内存兜底')
        if (!checkMemory(buckets, bucketKey + key, limit, windowMs)) return next(TOO_MANY())
        return next()
      })
  }
}

// 登录限流由 gakiwoo-api 侧处理（食刻复用其 /api/auth/*），此处无登录路由，不再定义 loginThrottle
module.exports = { createRateLimit, clientIp }
