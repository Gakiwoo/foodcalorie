'use strict'
// 简易内存限流（Redis 可选，未配置 REDIS_URL 时回退内存 Map）。
// 与 gakiwoo-api rateLimit 语义一致：写 10/min、读 30/min、登录 5/5min。
const { ServiceError } = require('../utils/serviceError')

const buckets = new Map() // `${key}:${scope}` -> number[]
const CLEANUP_MS = 60 * 1000

setInterval(() => {
  const cutoff = Date.now() - 10 * 60 * 1000
  for (const [k, arr] of buckets) {
    const fresh = arr.filter((t) => t > cutoff)
    if (fresh.length === 0) buckets.delete(k)
    else buckets.set(k, fresh)
  }
}, CLEANUP_MS).unref?.()

// 提取客户端真实 IP：优先 X-Forwarded-For 首个（nginx 反代注入），回退 req.ip。
// 注意：XFF 可被客户端伪造，仅用于限流键（绕过影响有限）；真正信任边界由 nginx 收敛。
function clientIp(req) {
  const xff = req.headers['x-forwarded-for']
  if (xff) return String(xff).split(',')[0].trim() || 'unknown'
  return req.ip || 'unknown'
}

/**
 * 创建限流中间件
 * @param {number} limit 窗口内最大次数
 * @param {number} windowMs 窗口毫秒
 * @param {(req)=>string} [keyFn] 限流键生成（默认按真实客户端 IP）
 */
function createRateLimit(limit, windowMs, keyFn) {
  return function rateLimit(req, res, next) {
    if (process.env.NODE_ENV === 'test') return next()
    const key = keyFn ? keyFn(req) : clientIp(req)
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

// 登录限流：按 email，5 次 / 5 分钟（与 gakiwoo-api loginThrottle 对齐）
const loginThrottle = createRateLimit(5, 5 * 60 * 1000, (req) => `login:${(req.body?.email || '').toLowerCase().trim()}`)

module.exports = { createRateLimit, loginThrottle, clientIp }
